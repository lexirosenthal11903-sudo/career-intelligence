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
import { getProfile, patchProfile, mergeList, addMemory, addOpenThread, resolveOpenThread, addHiddenRole, type ProfileData } from '@/lib/profile';
import { callClaude } from '@/lib/anthropic';
import { stripDashes } from '@/lib/sanitize';
import { ADVISOR_SURFACES, isAdvisorSurface } from '@/lib/surfaces';
import { roleKey } from '@/lib/role-key';
import { isOutreachStatus } from '@/lib/outreach';
import { ensureApplicationSaved } from '@/lib/save-application';

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
    name: 'note_open_thread',
    description:
      "Park an unresolved thread so you pick it back up next time, even after it scrolls out of the conversation. Call this when something is left genuinely hanging: a question they were weighing (a visa, whether to relocate), a task you started together but didn't finish (a CV half-tailored), a decision they haven't landed. This is NOT for durable facts (use remember for those) and NOT a to-do list you show them — it's your own private note so you can re-open the thread warmly when they return. Phrase it so it makes sense to you later. Keep it to things that genuinely matter; don't park trivia.",
    input_schema: {
      type: 'object',
      properties: {
        thread: {
          type: 'string',
          description:
            'The unresolved thread, phrased to make sense later. E.g. "Was weighing whether her visa lets her take the Bristol role — pointed her to gov.uk + an OISC adviser, not yet resolved" or "Started tailoring his CV for the Deloitte scheme, didn\'t finish".',
        },
      },
      required: ['thread'],
    },
  },
  {
    name: 'resolve_open_thread',
    description:
      "Close an open thread once it's genuinely been picked up and dealt with, so you don't keep re-raising something that's already settled. Call this the moment a parked thread reaches a real resolution (they decided, you finished the task, the question is answered). Match it loosely by describing the thread — you don't need to quote it exactly.",
    input_schema: {
      type: 'object',
      properties: {
        thread: {
          type: 'string',
          description: 'A short description of the thread that\'s now resolved, e.g. "the visa question" or "tailoring the Deloitte CV".',
        },
      },
      required: ['thread'],
    },
  },
  {
    name: 'update_profile',
    description:
      "Update what you know about this person's preferred name, values, deal-breakers, aspiration, salary needs, or working style. Call this when they tell you something concrete about what they want or won't accept — it updates their profile everywhere in the product, so you only ever have to be told once. In particular, when they tell you what they'd like to be called, save it as preferredName so you (and the whole product) use it from then on.",
    input_schema: {
      type: 'object',
      properties: {
        preferredName: { type: 'string', description: "What they want to be called (e.g. \"Lexi\" when the account name is \"Alexandra\"). Save it the moment they tell you, or confirm a shortening they use." },
        values: { type: 'array', items: { type: 'string' }, description: 'What matters to them in work. Pass only the NEW one(s) they just mentioned — these are ADDED to what you already hold, never replacing it.' },
        dealBreakers: { type: 'array', items: { type: 'string' }, description: "Things they won't accept. Pass only the NEW one(s) they just mentioned — these are ADDED to what you already hold, never replacing it." },
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
      "Save a specific role for this person so it's waiting in their applications when they're ready. Call this when they express genuine interest in a particular role you've discussed — not speculatively. It also starts that role in their application tracker at the 'saved' stage (they haven't applied yet).",
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
      "Move one of this person's saved applications to a new stage when they tell you where it's got to. Call this when they say they've applied, got an interview, received an offer, didn't get it, or want to set one aside. Match the role by its title (and company if they say it). If they refer to a role ambiguously (\"the analyst one\") and more than one of their saved applications could be it, ASK which one they mean before moving anything, never guess a specific role on their behalf. Updating the stage does NOT move them to another screen. You simply acknowledge the change in conversation; they stay where they are.",
    input_schema: {
      type: 'object',
      properties: {
        jobTitle: { type: 'string', description: 'The title (and optionally company) of the saved application to move.' },
        stage: { type: 'string', enum: ['saved', 'preparing', 'applied', 'interview', 'offer', 'rejected', 'archive'], description: "The new stage. Use 'rejected' when they got a definite no (applied/interviewed then turned down) — this keeps the application as a real record, it does NOT delete it. Use 'archive' only when they're quietly setting one aside, not a rejection." },
        reason: { type: 'string', description: "When moving to 'rejected' or 'archive', a short note on WHY it closed, in their terms — the feedback they got, or 'no feedback given', or why they set it aside. Stored against the role so they can remind themselves later. Keep it brief and factual; omit for other stages." },
      },
      required: ['jobTitle', 'stage'],
    },
  },
  {
    name: 'set_outreach_status',
    description:
      "Update where a piece of OUTREACH has got to, when the person tells you. This tracks reaching out to a person (a warm intro or cold approach), which is SEPARATE from an application's stage — use this one, not set_application_stage, when they're talking about a message they sent someone. Call it when they say they've sent the outreach message ('sent' — stamps the clock for a single follow-up a working week later), that the person got back to them ('replied' — the good outcome, acknowledge it warmly), or that they never heard back after they'd already followed up once ('no_reply' — a soft close, remind them gently that most outreach goes unanswered and it isn't a verdict on them). Match the outreach by the role title (and company if they say it). Do NOT call this to draft a message — that's draft_outreach.",
    input_schema: {
      type: 'object',
      properties: {
        roleTitle: { type: 'string', description: 'The role (and optionally company) the outreach was about — matches the drafted message.' },
        company: { type: 'string', description: 'The company for that role, if known (helps match it exactly).' },
        status: { type: 'string', enum: ['to_send', 'sent', 'replied', 'no_reply'], description: "'sent' when they've sent the message; 'replied' when the person responded; 'no_reply' only after one follow-up has gone unanswered; 'to_send' if they haven't sent it yet." },
      },
      required: ['roleTitle', 'status'],
    },
  },
  {
    name: 'hide_role_from_live',
    description:
      "Stop showing a specific role in this person's Live roles, because they've told you it genuinely isn't for them (not just that they're tidying their list). Call this ONLY when, after they removed or dropped a saved role, they confirm it's not the right kind of role / company / field for them. Do NOT call it if they just say they're tidying up, already applied elsewhere, or give no real reason — an administrative removal carries no preference signal and the role should keep appearing. This hides only that exact role; it does not change anything else they see.",
    input_schema: {
      type: 'object',
      properties: {
        jobTitle: { type: 'string', description: 'The title of the role to stop showing.' },
        company: { type: 'string', description: 'The company for that role, if known (helps match it exactly).' },
      },
      required: ['jobTitle'],
    },
  },
  {
    name: 'open_surface',
    description:
      "Open one of the product's surfaces for this person — their Applications, Roles, Direction, Documents, or Profile. ONLY call this when they explicitly ask to see, open, go to, or be taken to one of these (\"show me my applications\", \"open my CV\", \"take me to my roles\"). NEVER call it off your own back as a side-effect of doing something else — changing a stage, saving a job, or tailoring a CV must never yank them to another screen. If you're unsure whether they want to move, don't; just tell them where the thing lives and let them go themselves.",
    input_schema: {
      type: 'object',
      properties: {
        surface: {
          type: 'string',
          enum: ['applications', 'roles', 'direction', 'documents', 'profile'],
          description: 'Which surface they asked to open.',
        },
      },
      required: ['surface'],
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
  {
    name: 'draft_outreach',
    description:
      "Help this person reach out to someone who could open a door — a warm intro or a cold approach. Call this when they want help with networking, outreach, warm intros, reaching out to someone, getting a foot in the door, or approaching a company/team directly — especially when there are few live roles, or they've found a company or field they want to break into. BEFORE calling, find out in conversation whether they already know anyone there, or anyone who has worked there (warm beats cold) — pass that as warmPath. If the user has PASTED something they found themselves — a specific person's LinkedIn post, profile text, or bio — pass that text as foundContext so the message can reference it specifically (the 'I saw you posted about X' opener that actually gets replies); never go and fetch anything yourself, only use what they paste. This produces the right TYPE of person to approach (or a message tailored to the specific person they pasted), a LinkedIn search link so THEY can find that person, and a short message to send. After it runs: tell them who to approach, share the search link, give them the drafted message verbatim, mention the one-line follow-up, and offer to adjust the tone.",
    input_schema: {
      type: 'object',
      properties: {
        roleTitle: { type: 'string', description: 'The role, field, or kind of work they want to break into or ask about.' },
        company: { type: 'string', description: 'The specific company or organisation to target, if they have one in mind.' },
        warmPath: {
          type: 'string',
          description: "Any existing connection they have mentioned: an alum from their university, a friend or contact who works there, a mutual connection, someone they met at an event. Leave empty for a genuinely cold approach with no connection.",
        },
        channel: {
          type: 'string',
          enum: ['linkedin', 'email'],
          description: "Where they intend to send it. Default to linkedin unless they specifically want email.",
        },
        foundContext: {
          type: 'string',
          description: "Text the USER pasted from a specific person they found themselves — a LinkedIn post, profile summary, or bio. Use it to tailor the message to that real person and reference something genuine they said or did. Only ever the user's own pasted text; never invent it and never go and fetch it.",
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

/** Latest analysis summary for personalising generated documents; '' if none / on error. */
async function latestAnalysisSummary(supabase: SupabaseClient, userId: string): Promise<string> {
  try {
    const { data: resultRow } = await supabase
      .from('results')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const p = (resultRow?.data as { profile?: { summary?: string } } | null)?.profile;
    return p?.summary ?? '';
  } catch {
    return '';
  }
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

      case 'note_open_thread': {
        const thread = String(input.thread ?? '').trim();
        if (!thread) return { content: 'No thread provided; nothing parked.', isError: true };
        await addOpenThread(supabase, userId, thread);
        // Silent bookkeeping — no user-facing echo (this is the advisor's private note,
        // never a visible to-do item).
        return { content: `Parked open thread: "${thread}"` };
      }

      case 'resolve_open_thread': {
        const thread = String(input.thread ?? '').trim();
        if (!thread) return { content: 'No thread provided; nothing resolved.', isError: true };
        const { resolved } = await resolveOpenThread(supabase, userId, thread);
        return {
          content: resolved
            ? `Closed open thread matching: "${thread}"`
            : `No open thread matched "${thread}"; nothing to close.`,
        };
      }

      case 'update_profile': {
        const updates: ProfileData = {};
        if (typeof input.preferredName === 'string' && input.preferredName.trim())
          updates.preferredName = input.preferredName.trim().slice(0, 60);
        // values/dealBreakers MERGE with what's already held (case-insensitive union) — a
        // partial call (the advisor naming one new value) must never drop the rest
        // (STATE-SYNC-AUDIT #13). Read the current lists once, only if a list field is set.
        const hasValues = Array.isArray(input.values);
        const hasDealBreakers = Array.isArray(input.dealBreakers);
        if (hasValues || hasDealBreakers) {
          const current = await getProfile(supabase, userId);
          if (hasValues) {
            const existing = Array.isArray(current.values) ? (current.values as unknown[]).map(String) : [];
            updates.values = mergeList(existing, (input.values as unknown[]).map(String));
          }
          if (hasDealBreakers) {
            const existing = Array.isArray(current.dealBreakers) ? (current.dealBreakers as unknown[]).map(String) : [];
            updates.dealBreakers = mergeList(existing, (input.dealBreakers as unknown[]).map(String));
          }
        }
        if (typeof input.aspiration === 'string') updates.aspiration = input.aspiration;
        if (typeof input.salaryFloor === 'number') updates.salaryFloor = input.salaryFloor;
        if (typeof input.salaryCeiling === 'number') updates.salaryCeiling = input.salaryCeiling;
        if (Object.keys(updates).length === 0)
          return { content: 'No recognised profile fields to update.', isError: true };
        await patchProfile(supabase, userId, updates);
        // A preferred name changes what the nav + the recap card greet them as. Bust the
        // cached recap so it regenerates with the new name instead of the formal one.
        if (updates.preferredName) {
          try { await supabase.from('recaps').delete().eq('user_id', userId); } catch { /* best-effort */ }
        }
        // Signal the client so the nav, Profile, and Direction surfaces re-read live
        // (otherwise a name/salary set mid-conversation only shows after a reload).
        return {
          content: `Profile updated: ${Object.keys(updates).join(', ')}.`,
          action: 'Updated your profile',
          signal: 'profile-changed',
        };
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
        // Signal so the Direction page re-reads and a rejected direction actually drops
        // off it (otherwise the user says "not for me" and the screen ignores them).
        return { content: `Direction "${direction}" marked ${status}.`, action: `${verb} "${direction}"`, signal: 'profile-changed' };
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
          // Match the shape a UI save writes (SidePanel "I'm interested"): the left-nav
          // Recent/count reads saved_jobs filtered on status === 'interested', so without
          // this an advisor-saved role would never show in the nav.
          status: 'interested',
        };
        const { error: jErr } = await supabase
          .from('saved_jobs')
          .upsert({ user_id: userId, job_id: jobId, job_data: jobData }, { onConflict: 'user_id,job_id' });
        if (jErr) return { content: `Couldn't save the job: ${jErr.message}`, isError: true };
        // Mirror into the application tracker at 'saved', matching the save-job route.
        await supabase
          .from('saved_applications')
          .upsert({ user_id: userId, job_id: jobId, job_data: jobData, stage: 'saved' }, { onConflict: 'user_id,job_id' });
        return {
          content: `Saved "${title}"${company ? ` at ${company}` : ''} and added it to their applications (saved — not applied yet).`,
          action: `Saved "${title}"${company ? ` at ${company}` : ''}`,
          signal: 'application-changed',
        };
      }

      case 'set_application_stage': {
        const query = String(input.jobTitle ?? '').trim().toLowerCase();
        const stage = String(input.stage ?? '').trim();
        const VALID = ['saved', 'preparing', 'applied', 'interview', 'offer', 'rejected', 'archive'];
        if (!query || !VALID.includes(stage)) return { content: 'Need a job to match and a valid stage.', isError: true };
        const { data: apps } = await supabase
          .from('saved_applications')
          .select('job_id, job_data')
          .eq('user_id', userId);
        // Score each saved application against the query and keep only the strongest
        // tier, so an exact title beats an incidental substring, and a short, generic
        // query ("analyst") that hits two roles ("Trainee Business Analyst" + "Data
        // Analyst") never silently lands on whichever happened to come back first.
        // 3 = exact title (or title+company); 2 = stored title fully inside a longer
        // query ("the marketing coordinator role"); 1 = query is a substring of the
        // stored title+company; 0 = no match. Normalise via the shared role-key helper
        // so whitespace ("Data  Analyst") can't split a match. Empty titles never match.
        const norm = (s?: string) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
        const nQuery = query.replace(/\s+/g, ' ');
        const score = (jd: { title?: string; company?: string }): number => {
          const title = norm(jd?.title);
          const company = norm(jd?.company);
          const hay = `${title} ${company}`.trim();
          if (!title) return 0;
          if (nQuery === title || nQuery === hay || nQuery === `${title} at ${company}`.trim()) return 3;
          if (title.length > 2 && nQuery.includes(title)) return 2;
          if (hay.includes(nQuery)) return 1;
          return 0;
        };
        const scored = (apps ?? [])
          .map((a) => ({ app: a, s: score(a.job_data as { title?: string; company?: string }) }))
          .filter((x) => x.s > 0);
        const top = scored.length ? Math.max(...scored.map((x) => x.s)) : 0;
        const best = scored.filter((x) => x.s === top);
        if (best.length === 0)
          return { content: `No saved application matches "${input.jobTitle}". Save the role first.`, isError: true };
        // Collapse candidates that are the SAME logical role (identical title+company,
        // e.g. a role saved twice across the two-table drift) by their canonical key.
        // Only genuinely DIFFERENT roles are real ambiguity; otherwise "ask which one
        // by company" would be unanswerable when the companies are identical.
        const distinctKeys = new Set(
          best.map((x) => {
            const jd = x.app.job_data as { title?: string; company?: string };
            return roleKey(jd?.title, jd?.company);
          })
        );
        if (distinctKeys.size > 1) {
          // Genuine ambiguity: ask, never guess. List the candidates so the advisor
          // can clarify by company in conversation before moving a stage.
          const names = best
            .map((x) => {
              const jd = x.app.job_data as { title?: string; company?: string };
              return `${jd?.title ?? 'a saved role'}${jd?.company ? ` at ${jd.company}` : ''}`;
            })
            .join('; ');
          return {
            content: `More than one saved application matches "${input.jobTitle}": ${names}. Ask them which one they mean (by company) before you move its stage, do NOT guess.`,
            isError: true,
          };
        }
        const match = best[0].app;
        // When closing (rejected/archive), store a short why-it-closed note against the
        // role so the user can remind themselves later (Lexi, 2026-06-29). Merged into
        // job_data so it travels with the role; never clobbers their own notes field.
        const reason = String(input.reason ?? '').trim().slice(0, 500);
        const update: { stage: string; job_data?: Record<string, unknown> } = { stage };
        if (reason && (stage === 'rejected' || stage === 'archive')) {
          update.job_data = { ...(match.job_data as Record<string, unknown>), closeReason: reason };
        }
        const { error } = await supabase
          .from('saved_applications')
          .update(update)
          .eq('user_id', userId)
          .eq('job_id', match.job_id);
        if (error) return { content: `Couldn't update the stage: ${error.message}`, isError: true };
        // Keep saved_jobs in step with the board. Live roles AND the "In Applications"
        // badge read saved_jobs.job_data.status (not the board), so without this a role
        // closed here would still show in Live roles wearing the badge. A closed stage
        // (rejected/archive) becomes 'passed' (drops out of Live roles, badge clears); any
        // live stage becomes 'interested' (shown, badged) so re-opening one brings it back.
        // Best-effort: a sync miss must never fail the stage move the user just asked for.
        try {
          const closed = stage === 'rejected' || stage === 'archive';
          const desiredStatus = closed ? 'passed' : 'interested';
          const { data: sjRow } = await supabase
            .from('saved_jobs')
            .select('job_data')
            .eq('user_id', userId)
            .eq('job_id', match.job_id)
            .maybeSingle();
          const sjData = sjRow?.job_data as Record<string, unknown> | undefined;
          if (sjData && sjData.status !== desiredStatus) {
            await supabase
              .from('saved_jobs')
              .update({ job_data: { ...sjData, status: desiredStatus } })
              .eq('user_id', userId)
              .eq('job_id', match.job_id);
          }
        } catch {
          // saved_jobs sync is best-effort; the board move above already succeeded.
        }
        // The "Where we got to" recap is cached and reads the board for outcome truth.
        // A stage change can make a cached recap stale (e.g. it would still narrate an
        // offer that's now a rejection), so drop the cache to force a fresh, true recap.
        try {
          await supabase.from('recaps').delete().eq('user_id', userId);
        } catch {
          // best-effort cache bust; the recap will also refresh when the chat advances.
        }
        const title = (match.job_data as { title?: string })?.title ?? 'that application';
        // Emotional weight per stage (research/rejection-care-and-navigation-research.md §A2):
        // speak to the moment, never gamify (no points/streaks/confetti — feedback_no_gamification).
        // The change happens in the background; never tell them to switch screens for it.
        const WEIGHT: Record<string, string> = {
          offer:
            "This is a genuine win — congratulate them warmly and specifically, in your own voice. Not gamified, not over the top; a real human well done. If it's an offer they now have to weigh, offer to help them think it through.",
          interview:
            "Getting an interview is real progress — acknowledge it encouragingly, then offer to prep them (what the company does, likely questions, the gaps worth getting ahead of) when they're ready.",
          applied:
            "They've applied — steady them. The silence that follows is the hard part; let them know you'll help them with what comes next rather than leaving them refreshing an inbox.",
          rejected:
            "This is a no, and it stings — hold them through it the way your rejection guidance says (acknowledge genuinely first, normalise that a no here is the competitive process not a verdict, then ask whether they got any actual feedback, never make them paste the email). The role stays on record as a real part of their search — you are not deleting it. Turn forward on one concrete thing only when they're ready.",
          archive:
            "They're setting this one aside. Keep it light and unjudged — no drama about closing it.",
        };
        const weight = WEIGHT[stage] ?? '';
        return {
          content: `Moved "${title}" to ${stage} in their applications (in the background — they stay in the conversation, don't tell them to go to another screen).${weight ? ` ${weight}` : ''}`,
          action: `Moved "${title}" → ${stage}`,
          signal: 'application-changed',
        };
      }

      case 'set_outreach_status': {
        const roleTitle = String(input.roleTitle ?? '').trim();
        const company = String(input.company ?? '').trim();
        const status = String(input.status ?? '').trim();
        if (!roleTitle || !isOutreachStatus(status))
          return { content: 'Need the role the outreach was about and a valid status.', isError: true };

        // Match the outreach row. Prefer the exact role key (title+company); fall back to
        // a title match among their outreach when they name only the role. Low volume, so
        // a simple contains-match is enough — no elaborate scoring like applications.
        const { data: rows } = await supabase
          .from('outreach')
          .select('role_key, role_title, company')
          .eq('user_id', userId);
        const wantKey = roleKey(roleTitle, company);
        const norm = (s?: string | null) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
        const nTitle = norm(roleTitle);
        const all = rows ?? [];
        // Prefer an exact key (title+company), then an exact title. Only if neither hits
        // do we fall back to a loose contains-match, and then ONLY when it's unambiguous:
        // a stored "Senior Product Manager" must never silently swallow a "Product Manager"
        // status change. If more than one row could be meant, ask rather than guess
        // (mirrors set_application_stage's ambiguity guard).
        let match =
          all.find((r) => r.role_key === wantKey) ??
          all.find((r) => norm(r.role_title) === nTitle);
        if (!match && nTitle.length > 2) {
          const loose = all.filter(
            (r) => norm(r.role_title).includes(nTitle) || nTitle.includes(norm(r.role_title))
          );
          const distinctKeys = new Set(loose.map((r) => r.role_key));
          if (distinctKeys.size > 1) {
            const names = loose
              .map((r) => `${r.role_title}${r.company ? ` at ${r.company}` : ''}`)
              .join('; ');
            return {
              content: `More than one outreach could match "${roleTitle}": ${names}. Ask them which one they mean (by company) before you change its status, do NOT guess.`,
              isError: true,
            };
          }
          match = loose[0];
        }
        if (!match)
          return { content: `No outreach on record for "${roleTitle}". Draft one first with draft_outreach.`, isError: true };

        const update: { status: string; updated_at: string; sent_at?: string | null } = {
          status,
          updated_at: new Date().toISOString(),
        };
        if (status === 'sent') update.sent_at = new Date().toISOString();
        if (status === 'to_send') update.sent_at = null;
        const { error } = await supabase
          .from('outreach')
          .update(update)
          .eq('user_id', userId)
          .eq('role_key', match.role_key);
        if (error) return { content: `Couldn't update the outreach: ${error.message}`, isError: true };

        const label = `${match.role_title}${match.company ? ` at ${match.company}` : ''}`;
        // Speak to the moment; never gamify (feedback_no_gamification). 'replied' is the
        // good outcome; 'no_reply' is a soft close held with care (research §5).
        const WEIGHT: Record<string, string> = {
          sent: "Good, the message is out. Let them know you'll help them follow up once, warmly, if a working week goes by with no reply, and that they never need to chase twice.",
          replied: "They got a reply, which is the whole point of doing it well. Acknowledge it warmly (not over the top) and offer to help them with what to say back.",
          no_reply: "No reply, even after a follow-up. Hold them gently: most outreach goes unanswered, it's not a verdict on them, and the next message to a different person is the move, not chasing this one again.",
        };
        const weight = WEIGHT[status] ?? '';
        return {
          content: `Marked the outreach for "${label}" as ${status} (in the background — they stay in the conversation).${weight ? ` ${weight}` : ''}`,
          action: `Outreach "${label}" → ${status}`,
          signal: 'outreach-changed',
        };
      }

      case 'hide_role_from_live': {
        const jobTitle = String(input.jobTitle ?? '').trim();
        const company = String(input.company ?? '').trim();
        if (!jobTitle) return { content: 'Need the role title to hide it.', isError: true };
        await addHiddenRole(supabase, userId, jobTitle, company);
        // The Live-roles feed re-reads hidden roles on this signal, like the other surfaces.
        return {
          content: `Won't show "${jobTitle}"${company ? ` at ${company}` : ''} in their Live roles again (item-level only — similar roles still appear).`,
          signal: 'application-changed',
        };
      }

      case 'open_surface': {
        const surface = String(input.surface ?? '').trim().toLowerCase();
        if (!isAdvisorSurface(surface))
          return { content: `Can't open "${input.surface}". Valid surfaces: ${ADVISOR_SURFACES.join(', ')}.`, isError: true };
        const label = surface[0].toUpperCase() + surface.slice(1);
        return {
          content: `Opened their ${label} for them. Tell them you've brought it up; keep talking to them as normal.`,
          action: `Opened ${label}`,
          signal: 'open-surface',
          data: { surface },
        };
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
        const analysisSummary = await latestAnalysisSummary(supabase, userId);
        const userValues = Array.isArray(profile.values) ? (profile.values as string[]) : [];

        const contextLines = [
          analysisSummary ? `Background summary: ${analysisSummary}` : '',
          userValues.length ? `What they value in work: ${userValues.join(', ')}` : '',
          profile.aspiration ? `2-year aspiration: ${profile.aspiration}` : '',
        ].filter(Boolean).join('\n');

        // Grounded in research/application-effectiveness.md (Threads 2 & 9): cover letters are now the
        // document most saturated with AI text, so authentic specificity is the whole edge — not detector
        // evasion. Built from the user's real motivation and examples, never template language.
        const prompt = [
          `You are helping an early-career / graduate applicant write a cover letter for a specific UK role.`,
          `Write in first person, from their perspective, using ONLY what is in their CV and background.`,
          `\nROLE: ${roleTitle}${company ? ` at ${company}` : ''}`,
          jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription.slice(0, 2000)}` : '',
          contextLines ? `\nABOUT THEM:\n${contextLines}` : '',
          `\nTHEIR CV:\n${profile.cvText.slice(0, 3000)}`,
          `\nHow cover letters actually work for UK early-career applicants — ground the letter in this:`,
          `- This is now the document most flooded with AI-generated text. A generic, competent, AI-shaped letter carries no signal and disappears into a huge pile. Genuine specificity in the applicant's own register is exactly what is now scarce, and it is the whole point.`,
          `- Build it from their REAL motivation and concrete examples — never template language with the company name slotted in.`,
          `\nRules:`,
          `- 3 short paragraphs, half a page to one page, 250 words max. Tight.`,
          `- Opening: a specific, genuine reason for THIS role and employer that shows they understand what the organisation actually does. Never "I am writing to apply…", never "Dear Sir/Madam" on a named role, never just restate the CV.`,
          `- Middle: 1–2 concrete, specific achievements or experiences from their background most relevant to this role — real evidence, not adjectives.`,
          `- Closing: genuine interest + one clear, low-key next step.`,
          `- Sound like a real person. Avoid the tells of AI writing: inflated abstract vocabulary, the stock adjectives ("passionate", "dynamic", "meticulous", "results-driven"), symmetrical three-part lists, em dashes, and claims with no evidence behind them.`,
          `- Do NOT invent skills, roles, or achievements not in the CV. No exaggeration.`,
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

        coverLetter = stripDashes(coverLetter);
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

        // Prep auto-saves (SPEC): a cover letter keeps the role safe in Applications
        // (stage 'saved' if new; never advances). Same chat-<slug> id as the document.
        await ensureApplicationSaved(supabase, userId, {
          jobId: `chat-${slug(roleTitle)}${company ? `-${slug(company)}` : ''}`,
          title: roleTitle,
          company,
          description: jobDescription || undefined,
        });

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

        // Grounded in research/application-effectiveness.md (Threads 1, 5, 6, 9): tailor for BOTH the
        // recruiter filter (scannable match to stated requirements) AND the hiring manager (real capability
        // signal); one page for early-career; substance over AI polish; route-conditional, not "beat the ATS".
        const prompt = [
          `You are a CV expert helping an early-career / graduate applicant tailor their CV for a specific UK role.`,
          `\nROLE: ${roleTitle}${company ? ` at ${company}` : ''}`,
          jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription}` : '',
          `\nORIGINAL CV:\n${profile.cvText}`,
          `\nHow UK early-career CVs are actually read — ground every change in this:`,
          `- The CV usually passes TWO readers. First a recruiter/screen checks it fast and in volume against the role's stated requirements (a graduate vacancy now averages ~140 applicants). Then a hiring manager judges whether this person can really do the job and would fit. Tailor for BOTH: make the match to the stated requirements obvious and scannable, AND keep genuine, specific human signal — never hollow the CV into keywords.`,
          `- It is read fast and top-down: the top third of the first page must earn the rest of the read. Put the most relevant evidence first.`,
          `- Graduates are judged on potential, motivation and transferable evidence (study, projects, part-time work, societies) — not a long track record. Evidence behaviours and results; never fake seniority.`,
          `- Keep it to ONE page of genuinely relevant content. Never pad to fill a second page.`,
          `\nField-specific emphasis — infer the field from the role and adjust:`,
          `- Law (solicitor / training contract): the route is SQE + qualifying work experience, recruited 1–2 years ahead. Emphasise legal exposure, commercial awareness and academics; in your changes, note that navigating the application route matters as much as the CV.`,
          `- Finance / investment banking: structured, early, numbers-heavy. Emphasise quantitative evidence, relevant modules and precision.`,
          `- Portfolio fields (design, content/creative, front-end & software engineering, parts of marketing): the portfolio / body of work matters more than CV wording. Tailor the CV, but in your changes flag that their portfolio or public work is the primary thing to get right.`,
          `- Everything else: the general playbook — clear logical structure, most relevant evidence first.`,
          `\nRules:`,
          `- Rewrite to surface the experience, skills and evidence most relevant to THIS role, matched to the advert's language where it is genuine.`,
          `- Strong bullets = action + specific contribution + concrete outcome. Cut filler.`,
          `- Keep formatting ATS-safe (standard section headings; no key information trapped in images or tables) — sensible defensively, harmless either way. Do not over-optimise for keywords at the cost of human signal.`,
          `- Write like a real person. NO generic adjectives ("passionate", "dynamic", "meticulous", "results-driven"), no symmetrical three-part lists, no em dashes, no inflated abstract language. Specifics over polish.`,
          `- Do NOT invent qualifications, roles, skills or achievements not in the original.`,
          `- List exactly 3 to 4 specific changes you made and why, as concise bullets.`,
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

        tailoredCv = stripDashes(tailoredCv);
        if (tailoredCv) {
          // Must match the schema the Documents view reads (SidePanel DocumentsView):
          // type 'cv_tailored' and changes/jobTitle/jobCompany inside `metadata`.
          // The side-panel /api/tailor-cv writer already uses this shape — the chat
          // path had drifted (type 'tailored_cv' + a top-level `changes` column), so
          // CVs tailored in conversation never appeared in Documents.
          await supabase.from('documents').upsert(
            {
              user_id: userId,
              job_id: `chat-${slug(roleTitle)}${company ? `-${slug(company)}` : ''}`,
              type: 'cv_tailored',
              content: tailoredCv,
              metadata: { changes, jobTitle: roleTitle, jobCompany: company || undefined },
            },
            { onConflict: 'user_id,job_id,type' }
          );
        }

        // Prep auto-saves (SPEC): tailoring a CV keeps the role safe in Applications
        // (stage 'saved' if new; never advances an existing stage). Same chat-<slug>
        // id as the document above, so both live under one application record.
        await ensureApplicationSaved(supabase, userId, {
          jobId: `chat-${slug(roleTitle)}${company ? `-${slug(company)}` : ''}`,
          title: roleTitle,
          company,
          description: jobDescription || undefined,
        });

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

      case 'draft_outreach': {
        const roleTitle = String(input.roleTitle ?? '').trim();
        if (!roleTitle) return { content: 'Need a role or field to draft the outreach for.', isError: true };
        const company = typeof input.company === 'string' ? input.company.trim() : '';
        const warmPath = typeof input.warmPath === 'string' ? input.warmPath.trim() : '';
        const channel = input.channel === 'email' ? 'email' : 'linkedin';
        // Paste-to-tailor: the USER brings text about a person THEY found (a post,
        // profile, or bio). We process it transiently to tailor the message and
        // NEVER persist it as a contact — no contact record is ever written here,
        // and the GDPR posture stays the same as a cold/warm draft. (The pasted
        // text does live in their own chat history; flagged for solicitor review.)
        // Capped so a giant paste can't blow the token budget.
        const foundContext = typeof input.foundContext === 'string' ? input.foundContext.trim().slice(0, 1500) : '';

        const profile = await getProfile(supabase, userId);

        // Pull what we know about them, so the message is in their real register and
        // grounded in genuine background, never generic. CV is helpful but not required;
        // the analysis summary alone is enough to write something specific.
        const analysisSummary = await latestAnalysisSummary(supabase, userId);

        if (!profile.cvText && !analysisSummary) {
          return {
            content: "I don't have anything about them yet — no CV and no background from our conversation. Ask them to share a bit about themselves (or add their CV in Profile) before drafting outreach, so the message is genuinely theirs and not generic.",
            isError: true,
          };
        }

        const userValues = Array.isArray(profile.values) ? (profile.values as string[]) : [];
        const contextLines = [
          analysisSummary ? `Background summary: ${analysisSummary}` : '',
          userValues.length ? `What they value in work: ${userValues.join(', ')}` : '',
          profile.aspiration ? `Where they're heading: ${profile.aspiration}` : '',
          profile.cvText ? `CV (for genuine, specific detail — never invent beyond this):\n${profile.cvText.slice(0, 2000)}` : '',
        ].filter(Boolean).join('\n');

        // GDPR-safe by construction (research/outreach-research.md §1, §3): we generate a
        // deep-link SEARCH the user opens themselves — we never scrape, never look up a real
        // person, never store a contact. The user does the finding and the sending.
        // When the user already pasted a specific person (foundContext), a generic
        // role search is useless — they've found their target, so we skip the link.
        const hasFoundPerson = !!foundContext;
        const searchKeywords = [roleTitle, company].filter(Boolean).join(' ');
        const searchUrl = hasFoundPerson
          ? ''
          : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchKeywords)}`;

        // Grounded in research/outreach-research.md (§4 message craft, §3 warm-vs-cold,
        // sector calibration): warm out-responds cold; the ask is a short conversation,
        // never a job or "look at my CV"; UK register is understated; specificity is the
        // edge in an AI-flooded inbox; one follow-up only.
        const prompt = [
          `You are helping a UK early-career person reach out to someone who could help them get a foot in the door. Write the message in first person, from their perspective, in a natural UK register.`,
          `\nWHAT THEY WANT: to break into / ask about "${roleTitle}"${company ? ` at ${company}` : ''}.`,
          warmPath
            ? `\nWARM CONNECTION (use it — warm outreach vastly out-responds cold): ${warmPath}. Reference this connection naturally and early.`
            : `\nNO existing connection — this is a cold approach. Make it specific and earned, not templated.`,
          foundContext
            ? `\nTHE SPECIFIC PERSON THEY FOUND — the user pasted this themselves (a post, profile, or bio). Tailor the message to THIS person: open by referencing something genuine and specific from it (what they posted about, their path, their work), in a way that shows the sender actually read it and isn't sending a template. Use only what is here; never infer private details or invent anything beyond it:\n"""\n${foundContext}\n"""`
            : '',
          `\nABOUT THEM (write only from this — never invent experience, skills, or claims):\n${contextLines}`,
          `\nHow outreach that actually gets a reply works — ground the message in this:`,
          `- The right person to approach is usually someone IN that team or function who is one to three years ahead, or a team lead, or an alum — a real human who was recently where they are, not a generic "hiring manager".`,
          `- The ask must be small and specific: a 15-20 minute conversation, or one or two genuine questions about their path or the work. NEVER ask for a job, an introduction to a recruiter, or for them to look at a CV. The low ask is the whole point.`,
          `- Lead with something specific and genuine about the PERSON or the work, not about the sender's needs. ${warmPath ? 'Open from the shared connection.' : 'Reference something real about the field/company or why this person specifically.'}`,
          `- UK register: understated, warm, brief, no hype, no flattery, no salesiness.`,
          `- Specificity is the edge: in 2026 inboxes are flooded with AI-generated, generic outreach, so a genuinely specific, human message in their own words is what stands out.`,
          `\nSector calibration — infer the field from the role and match the tone:`,
          `- Finance / law / insurance: more formal, very brief, precise. Respect their time explicitly.`,
          `- Tech / startups / creative / media: warmer, direct, a little more personality is fine.`,
          `- Charity / public sector / research: values-led, mission-first, sincere.`,
          `- Everything else: warm, plain, professional.`,
          `\nFORMAT:`,
          channel === 'email'
            ? `- An email: 90-150 words, with a short specific subject line. 2-3 short paragraphs.`
            : `- A LinkedIn message: 90-150 words, 2-3 short paragraphs. Keep it sendable as a message (not a 300-character connection note).`,
          `- No AI tells: no stock adjectives ("passionate", "dynamic", "keen"), no symmetrical three-part lists, no em dashes, no "I hope this message finds you well", no "I am reaching out to". Sound like a real person.`,
          `- Sign off simply; do NOT invent the sender's name (leave it natural, the user adds their own name).`,
          `\nAlso produce: a single one-line follow-up they could send if there's no reply after about a week (gentle, no pressure, ONE only), and 2-3 brief notes on the approach you took.`,
          `\nRespond with valid JSON only, in this exact shape:`,
          `{"personType":"<one line: the type of person to approach and why>","subject":${channel === 'email' ? '"<email subject line>"' : '""'},"message":"<the full message>","followUp":"<the one-line follow-up>","notes":["<note 1>","<note 2>"]}`,
        ].filter(Boolean).join('\n');

        const res = await callClaude({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        });
        const raw = await res.json();
        const text: string = raw.content?.[0]?.text ?? '';

        let personType = '';
        let subject = '';
        let message = '';
        let followUp = '';
        let notes: string[] = [];
        try {
          const jsonStr = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
          const parsed = JSON.parse(jsonStr) as {
            personType?: string; subject?: string; message?: string; followUp?: string; notes?: string[];
          };
          personType = parsed.personType ?? '';
          subject = parsed.subject ?? '';
          message = parsed.message ?? '';
          followUp = parsed.followUp ?? '';
          notes = Array.isArray(parsed.notes) ? parsed.notes : [];
        } catch {
          message = text;
        }

        if (!message) return { content: "I couldn't draft that one. Ask me to try again.", isError: true };

        // No em dashes in anything the user sees (the model ignores the rule).
        personType = stripDashes(personType);
        subject = stripDashes(subject);
        message = stripDashes(message);
        followUp = stripDashes(followUp);
        notes = notes.map(stripDashes);

        // A pre-filled email link for the click-through (no recipient — the user finds and
        // adds the person). Passed in the data payload for the client to use.
        const mailto =
          channel === 'email'
            ? `mailto:?subject=${encodeURIComponent(subject || `Quick question about ${roleTitle}${company ? ` at ${company}` : ''}`)}&body=${encodeURIComponent(message)}`
            : '';

        const notesText = notes.length ? notes.map((n) => `• ${n}`).join('\n') : '';
        const contentForAdvisor = [
          personType ? `Who to approach: ${personType}` : '',
          hasFoundPerson
            ? `They've already found this person themselves (they pasted that profile/post), so they send the message straight to them — do NOT give them a search link or tell them to go looking again.`
            : `Search link to find them (share this as a markdown link, e.g. [Find them on LinkedIn](${searchUrl}) — they open it and pick who to contact; you do NOT know the actual person): ${searchUrl}`,
          `\nDrafted message (give them this verbatim${channel === 'email' && subject ? `, subject "${subject}"` : ''}):\n${message}`,
          `\nOne follow-up if no reply after ~a week: ${followUp}`,
          notesText ? `\nApproach:\n${notesText}` : '',
          hasFoundPerson
            ? `\nRemember: you give them the words; they already have the person and do the sending. Don't claim to have looked anyone up or to hold their contact details.`
            : `\nRemember: you give them the search and the words — they do the finding and the sending. Don't claim to have found a specific person or their contact details.`,
        ].filter(Boolean).join('\n');

        // Persist the draft against the role so it survives the conversation — the
        // panel's "Reaching out" section reads it back and shows the status chips. One
        // row per role (drafting again updates it). GDPR: only the user's own message +
        // a by-role search + a role-descriptor personType — never a named third party.
        // Preserve an existing status so a re-draft doesn't reset a thread already sent.
        const outreachKey = roleKey(roleTitle, company);
        const { data: priorOutreach } = await supabase
          .from('outreach')
          .select('status, sent_at')
          .eq('user_id', userId)
          .eq('role_key', outreachKey)
          .maybeSingle();
        await supabase.from('outreach').upsert(
          {
            user_id: userId,
            role_key: outreachKey,
            role_title: roleTitle,
            company: company || null,
            person_type: personType || null,
            search_url: searchUrl || null,
            subject: subject || null,
            message,
            follow_up: followUp || null,
            status: priorOutreach?.status ?? 'to_send',
            sent_at: priorOutreach?.sent_at ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,role_key' }
        );

        // Prep auto-saves (SPEC): starting outreach keeps the role in Applications
        // (stage 'saved' if new; never advances). The outreach thread itself joins by
        // roleKey, so the app just needs to exist for the role to have a home; we use
        // the same chat-<slug> id as any CV/cover letter for this role.
        await ensureApplicationSaved(supabase, userId, {
          jobId: `chat-${slug(roleTitle)}${company ? `-${slug(company)}` : ''}`,
          title: roleTitle,
          company,
        });

        return {
          content: contentForAdvisor,
          action: `Drafted outreach for ${roleTitle}${company ? ` at ${company}` : ''}`,
          signal: 'outreach-drafted',
          data: { roleTitle, company: company || undefined, personType, searchUrl: searchUrl || undefined, subject: subject || undefined, message, followUp, mailto: mailto || undefined, notes },
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
