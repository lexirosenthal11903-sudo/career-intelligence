# Profile Tab — Brainstorm
_Status: Complete_

## Summary & Key Decisions

**What the Profile tab is:** A mirror — shows what the product knows about the user. Settings live at the bottom, not in a separate tab.

**Left column structure (top to bottom):**
1. Direction summary — cream card hero. Read-only. Arlo-generated. "Want to refine this? Talk to Arlo →" nudge beneath.
2. Role types — read-only, beneath direction card.
3. CV on file — filename + date + "Update CV" button + "Download CV" button. Update triggers full re-analysis (smart: focuses on what changed). Explicit confirmation before re-analysis runs.
4. Editable preferences (auto-save, quiet "Saved" confirmation):
   - Location
   - Salary range
   - Work style: Remote / Hybrid / In-person
   - Employment type: Full-time / Part-time / Contract / Internship / Postgrad scheme
5. Settings section (bottom, visually separated):
   - Email address (display only)
   - Sign out
   - Start fresh (takes user back through input flow — confirmation required)
   - Delete account (confirmation required)

**Right column:** Arlo, always present. Opening message: "This is everything I know about you. If anything feels off, just tell me."

**Key product decisions:**
- Direction and role types are never directly editable — Arlo owns them. User talks to Arlo to change direction.
- CV update = full re-analysis. After analysis, Arlo explains what changed in chat (not a visual diff on the page).
- "Start fresh" is a major action — lives in settings, confirmation required. Not near the direction card.
- Export improved CV (Arlo-assisted) = parking lot, Phase 3.

## Q&A Log

**Q1: Mirror vs settings page?**
- Lexi confirmed: mirror is right, but settings still need to live somewhere.
- Decision: Profile tab = primarily a mirror ("here's what we know about you"). Settings live as a secondary section at the bottom of the same tab — not a separate nav item.
- Rationale: Settings are thin at this stage (email, sign out, delete account). No need for their own sidebar slot until they earn it.

**Q2: Can the user edit direction/role types directly?**
- Decision: No. Direction and role types are Arlo's territory — read-only in the UI.
- If the user wants to change direction: they talk to Arlo (chat panel always present on right).
- A small nudge beneath direction summary: "Want to refine this? Talk to Arlo →"

**Proposed full structure of the Profile tab:**

Left column:
- CV on file (filename + date + "Update CV" button → triggers re-analysis)
  - Re-analysis is full but smart: compares before/after, focuses on what's changed
  - Shows a "before and after" so the user can see what updated
  - Engineering note: if CV is same with additions, prompt should focus on delta — not full redo
- Direction summary (read-only, Arlo-generated, with "Talk to Arlo" nudge)
- Role types (read-only, 3–5 pills or list)
- Editable preferences: Location · Salary range · Work style (Remote/Hybrid/In-person) · Employment type (Full-time / Part-time / Contract / Internship / Postgrad scheme)
- Settings section: Email (display only) · Sign out · Delete account

Right column:
- Arlo, always present. No special message — just available.

**Q6: Visual hierarchy — direction first or CV first?**
- Decision: direction summary is the hero (cream card, top of left column). CV sits just below, more functional.
- Rationale: direction is the output, the product's interpretation. CV is just the input. Leading with direction reinforces the product's intelligence.
- Added: "Download CV" button next to the CV on file (export original file).
- Added: "Start fresh" option for major direction changes — takes user back through input flow as a full re-do.
- Input chat history is not editable — but Arlo adapts in conversation, or user can start fresh.
- Export as improved CV (Arlo-assisted) = Phase 3 parking lot item.

**Q5: Arlo's opening message on Profile tab?**
- Decision: "This is everything I know about you. If anything feels off, just tell me."
- Register: understated, inviting correction. Arlo steps back slightly — the user is doing admin, not being coached.

**Q4: How do preferences save?**
- Decision: auto-save with a subtle "Saved" confirmation that fades. No Save button.
- Exception: CV update is explicit — press button, confirm intent, then re-analysis runs. Deliberate because it's a significant action.

**Q3: Where does the before/after comparison live on CV re-upload?**
- Decision: Option B — Arlo surfaces the comparison in chat after re-analysis completes.
- Profile tab updates silently. Arlo explains what changed, in plain language.
- Rationale: warmer, more product-brained, fits the voice. A text diff on the profile page would feel like settings.

## Open Flags
(things to follow up on — missing info, people to ask, research needed)
