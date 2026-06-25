// Advisor agency — the tools Arlo can actually use to change the user's state.
//
// This is the spine's core idea: when Arlo says "done", something changes. Each
// tool maps to a real write (profile, memory, directions, saved jobs, application
// stages) and returns a short human-readable echo line so the UI can show the
// change happening — "done" is felt, not buried in the DB.
//
// Memory and agency are one system here: `remember` is just another tool. The
// advisor decides what's worth keeping and persists it; buildUserContext reads it
// back next turn (see chat/route.ts + lib/profile.ts).

import type { SupabaseClient } from '@supabase/supabase-js';
import { getProfile, patchProfile, addMemory, type ProfileData } from '@/lib/profile';
import { callClaude } from '@/lib/anthropic';

// ── Tool schemas sent to Claude ───────────────────────────────────────────────
// Prescriptive descriptions: state WHEN to call, not just what it does. Recent
// models reach for tools conservatively, so the trigger condition earns its place.
export const ADVISOR_TOOLS = [
  {
    name: 'remember',
    description:
      "Save a durable fact about this person so you never forget it and never re-ask. Call this the moment you learn something that should shape how you advise them in future conversations: a constraint, a preference, a fear, something they're proud of, a decision they've made, context about their life. Write the note in their terms, specific and self-contained.",
    input_schema: {
      type: 'object',
      properties: {
        note: {
          type: 'string',
          description:
            'One durable, specific fact about this person, phrased so it makes sense on its own later. E.g. "Won\'t relocate out of Manchester — partner\'s job is there" or "Lights up talking about the youth charity work, not the finance internship".',
        },
      },
      required: ['note'],
    },
  },
  {
    name: 'update_profile',
    description:
      "Update what you know about this person's values, deal-breakers, aspiration, salary needs, or working style. Call this when they tell you something concrete about what they want or won't accept — it updates their profile everywhere in the product, so you only ever have to be told once.",
    input_schema: {
      type: 'object',
      properties: {
        values: { type: 'array', items: { type: 'string' }, description: 'What matters to them in work (replaces the current list).' },
        dealBreakers: { type: 'array', items: { type: 'string' }, description: "Things they won't accept (replaces the current list)." },
        aspiration: { type: 'string', description: 'Their 2-year aspiration, in their words.' },
        salaryFloor: { type: 'number', description: 'Minimum acceptable salary (GBP).' },
        salaryCeiling: { type: 'number', description: 'Top of their expected range (GBP).' },
      },
    },
  },
  {
    name: 'update_direction',
    description:
      "Record how this person feels about one of the directions you've suggested. Call this when they react to a direction — reject it (\"that's not me\"), lean into it, or refine it. Directions are mutable: this feedback shapes what they see across the product, so a rejected direction stops being pushed at them.",
    input_schema: {
      type: 'object',
      properties: {
        direction: { type: 'string', description: 'The direction title they reacted to, as close to how it was shown as possible.' },
        status: { type: 'string', enum: ['rejected', 'preferred', 'refined'], description: 'rejected = not for them; preferred = drawn to it; refined = keep but adjusted.' },
        note: { type: 'string', description: 'Optional: why, or how it should be adjusted.' },
      },
      required: ['direction', 'status'],
    },
  },
  {
    name: 'set_direction_clarity',
    description:
      "Record how clear this person is on their direction right now — your live read of where they sit on the dial. Call this when their certainty becomes clearer or changes: they arrive lost and start to settle, or arrive confident and then wobble on a direction. It tunes how you work with them everywhere (how much you draw out vs advise, and how soon roles surface) — so keep it honest and current. 'lost' = no real direction / they've said they don't know; 'mixed' = a direction stated but thin, uncertain, or a real stretch; 'directed' = a specific target well-grounded in their background. Never show this label to them.",
    input_schema: {
      type: 'object',
      properties: {
        clarity: { type: 'string', enum: ['lost', 'mixed', 'directed'], description: 'Your current read of their direction clarity.' },
        note: { type: 'string', description: 'Optional: what shifted your read.' },
      },
      required: ['clarity'],
    },
  },
  {
    name: 'save_job',
    description:
      "Save a specific role for this person so it's waiting in their applications when they're ready. Call this when they express genuine interest in a particular role you've discussed — not speculatively. It also starts that role in their application tracker at the 'preparing' stage.",
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The job title.' },
        company: { type: 'string', description: 'The company, if known.' },
        url: { type: 'string', description: 'A link to the listing, if known.' },
        note: { type: 'string', description: 'Optional: why this one fits them.' },
      },
      required: ['title'],
    },
  },
  {
    name: 'set_application_stage',
    description:
      "Move one of this person's saved applications to a new stage when they tell you where it's got to. Call this when they say they've applied, got an interview, received an offer, or want to set one aside. Match the role by its title (and company if they say it).",
    input_schema: {
      type: 'object',
      properties: {
        jobTitle: { type: 'string', description: 'The title (and optionally company) of the saved application to move.' },
        stage: { type: 'string', enum: ['preparing', 'applied', 'interview', 'offer', 'archive'], description: 'The new stage.' },
      },
      required: ['jobTitle', 'stage'],
    },
  },
  {
    name: 'revise_directions',
    description:
      "Revise the directions this person sees on their Direction page — and that shape the roles matched to them. Call this when they ask to add, replace, drop, or refine directions, or when the conversation clearly establishes a better direction for them. Provide the COMPLETE updated set (not just the change): 2 to 4 directions, each a short title plus one sentence on why it fits THEM, grounded in what you actually know about them. This writes to their real Direction page and (when you pass searchKeywords) refreshes their matched roles — so only call it when you mean it. After it succeeds, tell them plainly in your own voice what you changed. The Direction page holds at most FOUR directions on purpose — that's not a limitation to apologise for, it's to keep the search focused and avoid overwhelming them. If they want more than four, don't coldly ask them to drop some: explain warmly that you keep it to four so each one gets real attention, pick the four strongest yourself, and offer to explore the others together in a focused session before swapping anything in.",
    input_schema: {
      type: 'object',
      properties: {
        directions: {
          type: 'array',
          description: 'The complete new set of directions (2-4), most fitting first.',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Short direction title, e.g. "Behavioural research".' },
              why: { type: 'string', description: 'One sentence on why it fits this person specifically.' },
            },
            required: ['title'],
          },
        },
        searchKeywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional: 1-3 word search terms to refresh the roles matched to the new directions. Pass when the directions change enough that the jobs should change too. CRITICAL: these MUST match the person\'s seniority. For a graduate / entry-level / early-career / career-changing person, role-title terms must be entry-level — prefix with "junior", "graduate", "assistant", "trainee" or "associate" (e.g. "junior analyst", "graduate coordinator"). Never pass a bare senior or seniorityless role title that would pull in roles above their level, even for senior-skewing fields like family office or private wealth.',
        },
      },
      required: ['directions'],
    },
  },
  {
    name: 'write_cover_letter',
    description:
      "Write a cover letter for this person for a specific role. Call this when they ask you to write, draft, or help with a cover letter — whether they give you a full job description or just a role title. You need their CV on file; if it's missing, tell them to add it in their Profile. After the tool runs, share a brief note on the approach you took and tell them their cover letter is ready to download.",
    input_schema: {
      type: 'object',
      properties: {
        roleTitle: { type: 'string', description: 'The job title they are applying for.' },
        company: { type: 'string', description: 'The company name, if known.' },
        jobDescription: {
          type: 'string',
          description: "The full job listing or a description of the role. The more detail, the better the letter. If they haven't shared one, ask — but if they push back, write from the role title alone.",
        },
      },
      required: ['roleTitle'],
    },
  },
  {
    name: 'tailor_cv',
    description:
      "Tailor this person's CV for a specific role. Call this when they ask you to help tailor, rewrite, or optimise their CV for a role — whether they give you a full job description or just a role title. You need their CV on file; if it's missing, tell them to add it in their Profile. After the tool runs, present the key changes conversationally and tell them their tailored CV is ready to download.",
    input_schema: {
      type: 'object',
      properties: {
        roleTitle: { type: 'string', description: 'The job title they want to target.' },
        company: { type: 'string', description: 'The company, if known.' },
        jobDescription: {
          type: 'string',
          description: "The full job listing or a description of the role. The more detail, the better the tailoring. If they haven't shared one, ask — but if they push back, tailor from the role title alone.",
        },
      },
      required: ['roleTitle'],
    },
  },
] as const;

export interface ToolOutcome {
  content: string; // returned to Claude as the tool_result
  isError?: boolean;
  action?: string; // short, user-facing echo line ("✓ …") — null when nothing changed
  signal?: string; // a client signal for changes the UI must react to (e.g. 'analysis-changed')
  data?: unknown;  // structured payload for signals that need to carry data to the client
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

/**
 * Execute one advisor tool against the user's real data. Every branch is
 * authorised by `userId` (the caller passes the authed user) and writes through
 * the same helpers the rest of the app uses, so RLS + shape stay consistent.
 */
export async function executeAdvisorTool(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  input: Record<string, unknown>
): Promise<ToolOutcome> {
  try {
    switch (name) {
      case 'remember': {
        const note = String(input.note ?? '').trim();
        if (!note) return { content: 'No note provided; nothing saved.', isError: true };
        await addMemory(supabase, userId, note);
        return { content: `Saved to memory: "${note}"`, action: 'Noted that' };
      }

      case 'update_profile': {
        const updates: ProfileData = {};
        if (Array.isArray(input.values)) updates.values = (input.values as unknown[]).map(String);
        if (Array.isArray(input.dealBreakers)) updates.dealBreakers = (input.dealBreakers as unknown[]).map(String);
        if (typeof input.aspiration === 'string') updates.aspiration = input.aspiration;
        if (typeof input.salaryFloor === 'number') updates.salaryFloor = input.salaryFloor;
        if (typeof input.salaryCeiling === 'number') updates.salaryCeiling = input.salaryCeiling;
        if (Object.keys(updates).length === 0)
          return { content: 'No recognised profile fields to update.', isError: true };
        await patchProfile(supabase, userId, updates);
        return { content: `Profile updated: ${Object.keys(updates).join(', ')}.`, action: 'Updated your profile' };
      }

      case 'update_direction': {
        const direction = String(input.direction ?? '').trim();
        const status = String(input.status ?? '').trim();
        if (!direction || !status) return { content: 'Need both a direction and a status.', isError: true };
        const profile = await getProfile(supabase, userId);
        const feedback = Array.isArray(profile.directionFeedback)
          ? (profile.directionFeedback as Array<Record<string, unknown>>)
          : [];
        // One entry per direction — the latest reaction wins.
        const next = feedback.filter((f) => String(f.direction).toLowerCase() !== direction.toLowerCase());
        next.push({ direction, status, note: input.note ?? null, at: new Date().toISOString() });
        await patchProfile(supabase, userId, { directionFeedback: next });
        const verb = status === 'rejected' ? 'set aside' : status === 'preferred' ? 'starred' : 'refined';
        return { content: `Direction "${direction}" marked ${status}.`, action: `${verb} "${direction}"` };
      }

      case 'set_direction_clarity': {
        const clarity = String(input.clarity ?? '').trim();
        if (!['lost', 'mixed', 'directed'].includes(clarity))
          return { content: 'Need a valid clarity (lost, mixed, or directed).', isError: true };
        await patchProfile(supabase, userId, { directionClarity: clarity as ProfileData['directionClarity'] });
        // Silent bookkeeping — no user-facing echo line; the dial isn't shown to them.
        return { content: `Direction clarity set to "${clarity}".` };
      }

      case 'save_job': {
        const title = String(input.title ?? '').trim();
        if (!title) return { content: 'No job title provided.', isError: true };
        const company = typeof input.company === 'string' ? input.company : '';
        const jobId = `chat-${slug(title)}${company ? `-${slug(company)}` : ''}`;
        const jobData = {
          job_id: jobId,
          title,
          company: company || undefined,
          url: typeof input.url === 'string' ? input.url : undefined,
          note: typeof input.note === 'string' ? input.note : undefined,
          source: 'advisor',
        };
        const { error: jErr } = await supabase
          .from('saved_jobs')
          .upsert({ user_id: userId, job_id: jobId, job_data: jobData }, { onConflict: 'user_id,job_id' });
        if (jErr) return { content: `Couldn't save the job: ${jErr.message}`, isError: true };
        // Mirror into the application tracker at 'preparing', matching the save-job route.
        await supabase
          .from('saved_applications')
          .upsert({ user_id: userId, job_id: jobId, job_data: jobData, stage: 'preparing' }, { onConflict: 'user_id,job_id' });
        return {
          content: `Saved "${title}"${company ? ` at ${company}` : ''} and started it in the tracker (preparing).`,
          action: `Saved "${title}"${company ? ` at ${company}` : ''}`,
        };
      }

      case 'set_application_stage': {
        const query = String(input.jobTitle ?? '').trim().toLowerCase();
        const stage = String(input.stage ?? '').trim();
        const VALID = ['preparing', 'applied', 'interview', 'offer', 'archive'];
        if (!query || !VALID.includes(stage)) return { content: 'Need a job to match and a valid stage.', isError: true };
        const { data: apps } = await supabase
          .from('saved_applications')
          .select('job_id, job_data')
          .eq('user_id', userId);
        const match = (apps ?? []).find((a) => {
          const jd = a.job_data as { title?: string; company?: string };
          const hay = `${jd?.title ?? ''} ${jd?.company ?? ''}`.toLowerCase();
          return hay.includes(query) || query.includes((jd?.title ?? '').toLowerCase());
        });
        if (!match)
          return { content: `No saved application matches "${input.jobTitle}". Save the role first.`, isError: true };
        const { error } = await supabase
          .from('saved_applications')
          .update({ stage })
          .eq('user_id', userId)
          .eq('job_id', match.job_id);
        if (error) return { content: `Couldn't update the stage: ${error.message}`, isError: true };
        const title = (match.job_data as { title?: string })?.title ?? 'that application';
        return { content: `Moved "${title}" to ${stage}.`, action: `Moved "${title}" → ${stage}` };
      }

      case 'revise_directions': {
        const rawDirs = Array.isArray(input.directions) ? (input.directions as unknown[]) : [];
        const directions = rawDirs
          .map((d) => {
            const o = (d ?? {}) as Record<string, unknown>;
            return { title: String(o.title ?? '').trim(), why: String(o.why ?? '').trim() };
          })
          .filter((d) => d.title)
          .slice(0, 4);
        if (directions.length === 0)
          return { content: 'Need at least one direction with a title.', isError: true };

        // The analysis is append-only ("latest row wins"), so revising = inserting a
        // fresh results row with the updated directions. Every reader (Direction tab,
        // Roles, the advisor's own context) takes the newest, so the change is real.
        const { data: row, error: readErr } = await supabase
          .from('results')
          .select('data')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (readErr) return { content: `Couldn't read the analysis: ${readErr.message}`, isError: true };
        if (!row?.data)
          return { content: "There's no analysis for this person yet, so there's nothing to revise.", isError: true };

        const data = { ...(row.data as Record<string, unknown>) };
        const profile = { ...((data.profile as Record<string, unknown>) ?? {}) };
        profile.suggestedDirections = directions;
        const keywords = Array.isArray(input.searchKeywords)
          ? (input.searchKeywords as unknown[]).map((k) => String(k).trim()).filter(Boolean).slice(0, 6)
          : [];
        if (keywords.length) profile.searchKeywords = keywords;
        data.profile = profile;

        const { error: writeErr } = await supabase.from('results').insert({ user_id: userId, data });
        if (writeErr) return { content: `Couldn't save the directions: ${writeErr.message}`, isError: true };

        const titles = directions.map((d) => d.title).join(', ');
        return {
          content: `Directions updated to: ${titles}.${keywords.length ? ' Job search refreshed.' : ''}`,
          action: keywords.length ? 'Updated your directions and refreshed your roles' : 'Updated your directions',
          signal: 'analysis-changed',
        };
      }

      case 'write_cover_letter': {
        const roleTitle = String(input.roleTitle ?? '').trim();
        if (!roleTitle) return { content: 'Need a role title to write the cover letter for.', isError: true };
        const company = typeof input.company === 'string' ? input.company.trim() : '';
        const jobDescription = typeof input.jobDescription === 'string' ? input.jobDescription.trim() : '';

        const profile = await getProfile(supabase, userId);
        if (!profile.cvText) {
          return {
            content: "No CV on file. Tell them to upload their CV via their Profile first, then come back to this.",
            isError: true,
          };
        }

        // Pull in analysis summary + values for personalisation
        let analysisSummary = '';
        let userValues: string[] = [];
        try {
          const { data: resultRow } = await supabase
            .from('results')
            .select('data')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          const p = (resultRow?.data as { profile?: { summary?: string } } | null)?.profile;
          if (p?.summary) analysisSummary = p.summary;
        } catch { /* fine */ }
        if (Array.isArray(profile.values) && profile.values.length) {
          userValues = profile.values as string[];
        }

        const contextLines = [
          analysisSummary ? `Background summary: ${analysisSummary}` : '',
          userValues.length ? `What they value in work: ${userValues.join(', ')}` : '',
          profile.aspiration ? `2-year aspiration: ${profile.aspiration}` : '',
        ].filter(Boolean).join('\n');

        const prompt = [
          `You are a career advisor writing a cover letter on behalf of someone applying for a role.`,
          `Write from their perspective, in first person, based only on what's in their CV and background.`,
          `\nROLE: ${roleTitle}${company ? ` at ${company}` : ''}`,
          jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription.slice(0, 2000)}` : '',
          contextLines ? `\nABOUT THEM:\n${contextLines}` : '',
          `\nTHEIR CV:\n${profile.cvText.slice(0, 3000)}`,
          `\nCover letter rules:`,
          `- 3 paragraphs maximum. Concise and direct — 250 words max.`,
          `- Opening: connect to this specific role and company. Never start with "I am writing to apply".`,
          `- Middle: 1–2 specific, concrete achievements from their background that are most relevant to this role.`,
          `- Closing: genuine enthusiasm + one clear next step (hoping to discuss / looking forward to).`,
          `- Sound like a real person, not a template. No buzzwords. No exaggeration.`,
          `- Do NOT invent skills, roles, or achievements not in the CV.`,
          `\nAlso give 2–3 brief notes on the approach you took — what you emphasised and why.`,
          `\nRespond with valid JSON only, in this exact shape:`,
          `{"coverLetter":"<the full cover letter>","notes":["<note 1>","<note 2>"]}`,
        ].filter(Boolean).join('\n');

        const res = await callClaude({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        });
        const raw = await res.json();
        const text: string = raw.content?.[0]?.text ?? '';

        let coverLetter = '';
        let notes: string[] = [];
        try {
          const jsonStr = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
          const parsed = JSON.parse(jsonStr) as { coverLetter?: string; notes?: string[] };
          coverLetter = parsed.coverLetter ?? '';
          notes = Array.isArray(parsed.notes) ? parsed.notes : [];
        } catch {
          coverLetter = text;
        }

        if (coverLetter) {
          await supabase.from('documents').upsert(
            {
              user_id: userId,
              job_id: `chat-${slug(roleTitle)}${company ? `-${slug(company)}` : ''}`,
              type: 'cover_letter',
              content: coverLetter,
              metadata: { notes, jobTitle: roleTitle, jobCompany: company || undefined },
            },
            { onConflict: 'user_id,job_id,type' }
          );
        }

        const notesText = notes.length
          ? notes.map((n) => `• ${n}`).join('\n')
          : 'Cover letter written for this role.';

        return {
          content: `Cover letter written for ${roleTitle}. Approach:\n${notesText}\nThe cover letter is ready to download.`,
          action: `Wrote cover letter for ${roleTitle}${company ? ` at ${company}` : ''}`,
          signal: 'cover-letter-written',
          data: { jobTitle: roleTitle, jobCompany: company || undefined, coverLetter, notes },
        };
      }

      case 'tailor_cv': {
        const roleTitle = String(input.roleTitle ?? '').trim();
        if (!roleTitle) return { content: 'Need a role title to tailor the CV for.', isError: true };
        const company = typeof input.company === 'string' ? input.company.trim() : '';
        const jobDescription = typeof input.jobDescription === 'string' ? input.jobDescription.trim() : '';

        const profile = await getProfile(supabase, userId);
        if (!profile.cvText) {
          return {
            content: "No CV on file. Tell them to upload their CV via their Profile first, then come back to this.",
            isError: true,
          };
        }

        const prompt = [
          `You are a CV expert. Rewrite the CV below to better target the following role.`,
          `\nROLE: ${roleTitle}${company ? ` at ${company}` : ''}`,
          jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription}` : '',
          `\nORIGINAL CV:\n${profile.cvText}`,
          `\nRules:`,
          `- Rewrite to highlight relevant experience and skills for this role`,
          `- Adjust bullet points to emphasise achievements that match the role`,
          `- Do NOT invent qualifications, roles, skills or achievements not in the original`,
          `- List exactly 3 to 4 specific changes you made and why, as concise bullets`,
          `\nRespond with valid JSON only, in this exact shape:`,
          `{"tailoredCv":"<the full rewritten CV>","changes":["<change 1>","<change 2>","<change 3>"]}`,
        ].filter(Boolean).join('\n');

        const res = await callClaude({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }],
        });
        const raw = await res.json();
        const text: string = raw.content?.[0]?.text ?? '';

        let tailoredCv = '';
        let changes: string[] = [];
        try {
          // Strip any markdown fences Claude may wrap around the JSON
          const jsonStr = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
          const parsed = JSON.parse(jsonStr) as { tailoredCv?: string; changes?: string[] };
          tailoredCv = parsed.tailoredCv ?? '';
          changes = Array.isArray(parsed.changes) ? parsed.changes : [];
        } catch {
          tailoredCv = text;
        }

        if (tailoredCv) {
          await supabase.from('documents').upsert(
            {
              user_id: userId,
              job_id: `chat-${slug(roleTitle)}${company ? `-${slug(company)}` : ''}`,
              type: 'tailored_cv',
              content: tailoredCv,
              changes,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,job_id,type' }
          );
        }

        const changesText = changes.length
          ? changes.map((c) => `• ${c}`).join('\n')
          : 'CV tailored for this role.';

        return {
          content: `CV tailored for ${roleTitle}. Changes made:\n${changesText}\nThe tailored CV is ready.`,
          action: `Tailored CV for ${roleTitle}${company ? ` at ${company}` : ''}`,
          signal: 'cv-tailored',
          data: { jobTitle: roleTitle, jobCompany: company || undefined, tailoredCv, changes },
        };
      }

      default:
        return { content: `Unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { content: `That didn't go through: ${message}`, isError: true };
  }
}
