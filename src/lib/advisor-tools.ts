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
] as const;

export interface ToolOutcome {
  content: string; // returned to Claude as the tool_result
  isError?: boolean;
  action?: string; // short, user-facing echo line ("✓ …") — null when nothing changed
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

      default:
        return { content: `Unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { content: `That didn't go through: ${message}`, isError: true };
  }
}
