# Plan: CV Tailoring — Step 2 first slice

**Goal:** When a user marks a role as Interested, the advisor can tailor their CV to that specific job description for ATS optimisation, explaining the changes, with a downloadable PDF.
**Date:** 2026-06-24
**Architecture:** New `/api/tailor-cv` route calls Claude with the user's CV (from `profiles.data.cvText`) + the job description → returns a rewritten CV + 3–4 change explanations. Result is saved to a new `documents` table. A modal renders the result with a Print-to-PDF button (browser native, zero new dependencies). The trigger lives in `RoleDetail` inside `SidePanel.tsx` — a "Tailor my CV for this role" button that appears once the user has clicked Interested.
**Tech stack:** Next.js App Router · Supabase (new `documents` table) · Anthropic API (claude-sonnet-4-6) · Browser Print API (PDF, no library)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase-migrations/20260624_documents.sql` | Create | `documents` table — stores tailored CVs (and later cover letters) per user per job |
| `src/app/api/tailor-cv/route.ts` | Create | Fetches user's CV + job description → Claude rewrite → saves to documents → returns result |
| `src/components/TailorCVModal.tsx` | Create | Modal: shows changes list + formatted CV + Download PDF button |
| `src/app/workspace/SidePanel.tsx` | Modify | Add "Tailor my CV" button to `RoleDetail` when `interested === true`; wire the modal |
| `src/app/globals.css` | Modify | Print CSS — hides all UI except the CV when printing |

---

## Tasks

### Task 1: Database migration — `documents` table

**Files:** `supabase-migrations/20260624_documents.sql`

**What:** Creates the table that stores tailored CVs (and later cover letters). One row per user per job per document type.

**Code:**
```sql
-- documents: tailored CVs, cover letters, and future documents.
-- type: 'cv_tailored' | 'cover_letter' (extendable)
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  job_id      text not null,
  type        text not null,
  content     text not null,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- One document per user per job per type — upsert on this constraint
create unique index if not exists documents_user_job_type_idx
  on documents(user_id, job_id, type);

-- RLS
alter table documents enable row level security;

create policy "Users can read their own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on documents for delete
  using (auth.uid() = user_id);
```

**Verify:** Run in Supabase SQL editor → confirm table appears in Table Editor with the two policies in Authentication → Policies.

---

### Task 2: `/api/tailor-cv` route

**Files:** `src/app/api/tailor-cv/route.ts`

**What:** Accepts `jobId`, `jobTitle`, `jobCompany`, `jobDescription` from the client. Fetches the user's CV from their profile. Calls Claude to rewrite it. Saves result to `documents`. Returns `{ tailoredCv, changes }`.

**Code:**
```typescript
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthedUser } from '@/lib/supabase/server';
import { getProfile } from '@/lib/profile';

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let body: { jobId: string; jobTitle: string; jobCompany: string; jobDescription: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { jobId, jobTitle, jobCompany, jobDescription } = body;
  if (!jobId || !jobTitle || !jobDescription) {
    return NextResponse.json({ error: 'jobId, jobTitle, and jobDescription are required' }, { status: 400 });
  }

  // Fetch the user's CV from their profile
  const profile = await getProfile(supabase, user.id);
  const cvText = profile.cvText?.trim();

  if (!cvText) {
    return NextResponse.json(
      { error: 'no_cv', message: "You don't have a CV on file yet. Add one in your profile and I can tailor it for you." },
      { status: 422 }
    );
  }

  const systemPrompt = `You are a career advisor helping someone tailor their CV for a specific role.

Your job:
1. Rewrite their CV so it uses the job description's language and keywords naturally — where those keywords genuinely apply to the person's experience.
2. Reorder sections if the most relevant experience isn't leading.
3. Sharpen weak phrasing where the underlying achievement is real but undersold.
4. Never invent skills, experience, or qualifications they don't have. Never exaggerate.
5. Keep their authentic voice — don't make it sound templated.

After rewriting, explain the 3–4 most important changes you made in plain English. Each explanation should teach them something — about ATS keyword scanning, about what the employer is looking for, or about how hiring managers read CVs.

If there are things you *didn't* change (because they were already strong, or because there was nothing to work with), say so briefly in the last bullet. Honesty builds trust.

Return a JSON object with exactly this shape:
{
  "tailoredCv": "...(complete rewritten CV, preserving all real content)...",
  "changes": [
    "...",
    "...",
    "...",
    "..."
  ]
}

Return ONLY valid JSON. No markdown fences. No preamble.`;

  const userPrompt = `Role: ${jobTitle} at ${jobCompany}

Job description:
${jobDescription.slice(0, 3000)}

My CV:
${cvText.slice(0, 4000)}`;

  let tailoredCv: string;
  let changes: string[];

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(raw);
    tailoredCv = parsed.tailoredCv;
    changes = Array.isArray(parsed.changes) ? parsed.changes.slice(0, 4) : [];
  } catch (err) {
    console.error('[tailor-cv] Claude or parse error:', err);
    return NextResponse.json({ error: 'Failed to generate tailored CV. Please try again.' }, { status: 500 });
  }

  // Persist to documents table (upsert — retailoring the same role replaces the previous version)
  const { error: dbErr } = await supabase.from('documents').upsert(
    {
      user_id: user.id,
      job_id: String(jobId),
      type: 'cv_tailored',
      content: tailoredCv,
      metadata: { changes, jobTitle, jobCompany },
    },
    { onConflict: 'user_id,job_id,type' }
  );
  if (dbErr) {
    // Non-fatal — the user still gets their result even if persistence failed
    console.error('[tailor-cv] Failed to save document:', dbErr.message);
  }

  return NextResponse.json({ tailoredCv, changes });
}
```

**Verify:**
```bash
# After building, check the route compiles:
npx tsc --noEmit
# Expected: no errors on this file
```

---

### Task 3: `TailorCVModal` component

**Files:** `src/components/TailorCVModal.tsx`

**What:** Full-screen modal that shows the tailored CV result. Two sections: the advisor's change explanations, and the formatted CV text. A "Download PDF" button triggers `window.print()` — print CSS (Task 5) isolates just the CV for the browser's Save as PDF.

**Code:**
```tsx
"use client";

import { useEffect, useRef } from "react";
import type { PanelJob } from "@/app/workspace/usePanelJobs";
import s from "./TailorCVModal.module.css";

interface Props {
  job: PanelJob;
  tailoredCv: string;
  changes: string[];
  onClose: () => void;
}

export default function TailorCVModal({ job, tailoredCv, changes, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  function handleBackdrop(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose();
  }

  return (
    <dialog ref={dialogRef} className={s.dialog} onClick={handleBackdrop}>
      <div className={s.inner}>
        {/* Screen-only header */}
        <div className={s.header}>
          <div>
            <div className={s.label}>CV tailored for</div>
            <h2 className={s.title}>{job.title} — {job.company}</h2>
          </div>
          <div className={s.headerActions}>
            <button className={s.downloadBtn} type="button" onClick={() => window.print()}>
              Download PDF
            </button>
            <button className={s.closeBtn} type="button" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Changes — the mentoring piece */}
        {changes.length > 0 && (
          <div className={s.changes}>
            <div className={s.changesLabel}>What I changed and why</div>
            <ul className={s.changesList}>
              {changes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {/* The tailored CV — this section is what prints */}
        <div id="cv-print-root" className={s.cvRoot}>
          <pre className={s.cvText}>{tailoredCv}</pre>
        </div>
      </div>
    </dialog>
  );
}
```

Also create `src/components/TailorCVModal.module.css`:

```css
.dialog {
  position: fixed;
  inset: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  z-index: 200;
}

.dialog::backdrop {
  background: rgba(0, 0, 0, 0.6);
}

.inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.label {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 0.25rem;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
}

.headerActions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.downloadBtn {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.downloadBtn:hover { background: var(--accent-dark); }

.closeBtn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-2);
  font-size: 0.875rem;
}
.closeBtn:hover { background: var(--surface-2); }

.changes {
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  flex-shrink: 0;
}

.changesLabel {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 0.625rem;
}

.changesList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.changesList li {
  font-size: 0.875rem;
  color: var(--ink-2);
  padding-left: 1.25rem;
  position: relative;
  line-height: 1.5;
}
.changesList li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--accent);
}

.cvRoot {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.cvText {
  font-family: var(--sans);
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--ink);
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 72ch;
  margin: 0 auto;
}
```

**Verify:**
```bash
npx tsc --noEmit
# Expected: no errors
```

---

### Task 4: Wire the trigger in `SidePanel.tsx`

**Files:** `src/app/workspace/SidePanel.tsx`

**What:** Add state for the tailor modal and a loading state. In `RoleDetail`, add a "Tailor my CV for this role" button that appears when `interested === true`. On click: POST to `/api/tailor-cv`, then show `TailorCVModal` with the result. Handle the no-CV case gracefully.

**Changes to `SidePanel.tsx`:**

At the top, add the import:
```tsx
import { useState as useModalState } from "react"; // already imported — use existing useState
import TailorCVModal from "@/components/TailorCVModal";
```

Actually, `useState` is already imported. Just add the `TailorCVModal` import at the top of the file near other imports:
```tsx
import TailorCVModal from "@/components/TailorCVModal";
```

In the `SidePanel` function (the outer component), add state for the modal. Find the block where `selected` state is declared (around line 56) and add:

```tsx
const [tailoring, setTailoring] = useState(false);
const [tailorResult, setTailorResult] = useState<{
  tailoredCv: string;
  changes: string[];
  job: PanelJob;
} | null>(null);
```

Add the tailor handler function inside `SidePanel`, after `handlePass`:
```tsx
async function handleTailorCV(job: PanelJob) {
  setTailoring(true);
  try {
    const res = await fetch("/api/tailor-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: job.id,
        jobTitle: job.title,
        jobCompany: job.company,
        jobDescription: job.description,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "no_cv") {
        window.dispatchEvent(new CustomEvent("ci:ask-advisor", {
          detail: "I tried to tailor my CV but don't have one on file yet. How do I add my CV?",
        }));
      } else {
        window.dispatchEvent(new CustomEvent("ci:ask-advisor", {
          detail: `Something went wrong tailoring my CV for the ${job.title} role. Can you help?`,
        }));
      }
      return;
    }
    setTailorResult({ tailoredCv: data.tailoredCv, changes: data.changes, job });
  } catch {
    window.dispatchEvent(new CustomEvent("ci:ask-advisor", {
      detail: `I had trouble tailoring my CV for the ${job.title} role. Can you help?`,
    }));
  } finally {
    setTailoring(false);
  }
}
```

In the JSX returned by `SidePanel`, wrap the existing content with a fragment and add the modal at the bottom (just before the closing `</div>` of the outermost wrapper):
```tsx
{tailorResult && (
  <TailorCVModal
    job={tailorResult.job}
    tailoredCv={tailorResult.tailoredCv}
    changes={tailorResult.changes}
    onClose={() => setTailorResult(null)}
  />
)}
```

Pass `onTailorCV` and `tailoring` down to `RoleDetail`. Find where `RoleDetail` is rendered (around line 113–120 in the SidePanel JSX) and add the props:
```tsx
<RoleDetail
  job={selected}
  skills={skills}
  interested={interested.has(String(selected.id))}
  saving={saving.has(String(selected.id))}
  onBack={() => setSelected(null)}
  onInterested={() => handleInterested(selected)}
  onPass={() => handlePass(selected)}
  onTailorCV={() => handleTailorCV(selected)}
  tailoring={tailoring}
/>
```

In the `RoleDetail` function signature (around line 311), add the two new props:
```tsx
function RoleDetail({
  job, skills, interested, saving, onBack, onInterested, onPass, onTailorCV, tailoring,
}: {
  job: PanelJob;
  skills: string[];
  interested: boolean;
  saving: boolean;
  onBack: () => void;
  onInterested: () => void;
  onPass: () => void;
  onTailorCV: () => void;
  tailoring: boolean;
}) {
```

In the `RoleDetail` JSX, inside the `rdActions` div (around line 389), add the tailor button that appears when `interested` is true. Find the block and replace it with:
```tsx
<div className={s.rdActions}>
  {interested ? (
    <>
      <span className={s.rdInterested}>✓ Interested — tracked in Applications</span>
      <button
        className={s.rdTailorBtn}
        type="button"
        onClick={onTailorCV}
        disabled={tailoring}
      >
        {tailoring ? "Tailoring your CV…" : "Tailor my CV for this role"}
      </button>
    </>
  ) : (
    <>
      <button className={s.rdInterestedBtn} type="button" onClick={onInterested} disabled={saving}>I&rsquo;m interested</button>
      <button className={s.rdPassBtn} type="button" onClick={onPass} disabled={saving}>Pass</button>
    </>
  )}
  {job.applyUrl && (
    <a className={s.rdListing} href={job.applyUrl} target="_blank" rel="noopener noreferrer">View listing ↗</a>
  )}
</div>
```

Add the `rdTailorBtn` style to `SidePanel.module.css` — find that file and add:
```css
.rdTailorBtn {
  width: 100%;
  padding: 0.625rem 1rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 0.5rem;
}
.rdTailorBtn:hover:not(:disabled) { background: var(--accent-dark); }
.rdTailorBtn:disabled { opacity: 0.6; cursor: not-allowed; }
```

**Verify:**
```bash
npx tsc --noEmit
# Expected: no type errors
# Then: push to staging, open the workspace, mark a role as Interested, confirm the "Tailor my CV" button appears
```

---

### Task 5: Print CSS

**Files:** `src/app/globals.css`

**What:** When `window.print()` is called, hide all UI except the `#cv-print-root` div containing the tailored CV. Adds clean typography and margins for a properly formatted PDF.

**Append to the end of `globals.css`:**
```css
@media print {
  /* Hide all UI chrome */
  body > * { display: none !important; }

  /* Show only the CV content */
  #cv-print-root {
    display: block !important;
    position: fixed;
    inset: 0;
    padding: 2.5cm;
    background: #fff;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #000;
  }

  /* Ensure pre-formatted CV text wraps cleanly */
  #cv-print-root pre {
    white-space: pre-wrap;
    word-break: break-word;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11pt;
  }

  /* Page breaks */
  @page {
    margin: 0;
    size: A4;
  }
}
```

**Verify:** Open the modal → click "Download PDF" → browser print dialog opens → select "Save as PDF" → PDF contains only the CV, no UI chrome, clean A4 formatting.

---

## Run order

Tasks 1–2 are independent and can be built in parallel. Task 3 must complete before Task 4 (the modal is imported). Task 5 can be done any time.

**Suggested order:** 1 → 2 → 3 → 4 → 5

**After all tasks:** TypeScript check passes → push to staging → test the full flow end-to-end:
1. Run a new analysis (or use existing result)
2. Mark a role as Interested
3. Click "Tailor my CV for this role"
4. Confirm changes list + CV appears
5. Click "Download PDF" → save as PDF → open the file → confirm clean, no UI chrome
6. Check Supabase `documents` table → confirm a row was created

---

## What this does NOT include (next iterations)

- Cover letter generation (same architecture, different prompt — next slice after this)
- "Why am I not hearing back?" diagnosis (requires a sent application)
- Documents folder UI (the data is being saved; the browseable view comes later)
- DOCX download (PDF via print is the thin-slice approach; DOCX via a library is a quality pass)
- CV quality polish pass — the prompt above is solid but the output quality gets a dedicated review session once the architecture is working and we can read real outputs
