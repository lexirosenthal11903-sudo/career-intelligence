import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { getAuthedUser } from '@/lib/supabase/server';
import { getProfile } from '@/lib/profile';
import { ensureApplicationSaved } from '@/lib/save-application';

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
    const response = await callClaude({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const data = await response.json();
    const raw = data.content?.[0]?.type === 'text' ? data.content[0].text : '';
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

  // Prep auto-saves (SPEC): tailoring keeps the role in Applications at 'saved' if
  // it isn't already tracked; never advances an existing stage. Matches by job_id
  // or roleKey, so a role already saved (this button usually shows post-Interested)
  // is a no-op. Under the real listing id here, mirroring the UI's own save.
  await ensureApplicationSaved(supabase, user.id, {
    jobId: String(jobId),
    title: jobTitle,
    company: jobCompany,
    description: jobDescription,
    source: 'roles',
  });

  return NextResponse.json({ tailoredCv, changes });
}
