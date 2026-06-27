import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { ARLO_SYSTEM_PROMPT } from '@/lib/advisor-prompt';
import { getAuthedUser } from '@/lib/supabase/server';
import { checkChatRateLimit } from '@/lib/ratelimit';
import { getProfile } from '@/lib/profile';
import { ADVISOR_TOOLS, executeAdvisorTool } from '@/lib/advisor-tools';
import { stripDashes } from '@/lib/sanitize';
import type { SupabaseClient } from '@supabase/supabase-js';

export const maxDuration = 60;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Assemble what Arlo knows about this person from their saved data, so Arlo
 * never re-asks and always speaks specifically. Degrades gracefully — a brand
 * new user with no data yet still gets a working Arlo.
 */
async function buildUserContext(
  supabase: SupabaseClient,
  userId: string,
  displayName?: string
): Promise<string> {
  const parts: string[] = [];
  // Personalisation: the moment we know their name, use it (Lexi, 2026-06-24). Kept
  // separate from `parts` so it doesn't count as "we know them" (which would skip the
  // new-user welcome). First name only, used naturally — not in every line.
  const rawFirst = displayName?.trim().split(/\s+/)[0];
  const nameLine =
    rawFirst && !rawFirst.includes('@')
      ? `Their name is ${rawFirst} — use their first name naturally and warmly (a greeting, the odd moment), but NOT in every message.`
      : '';
  // Things worth knowing that we don't have yet — so the advisor can fill them in
  // casually, in conversation, rather than a second cold intake (Lexi, 2026-06-23).
  const missing: string[] = [];
  // The dial position — prefer the advisor's live read (profiles), fall back to the
  // initial read baked into the analysis. Drives the directive↔non-directive balance.
  let directionClarity: 'lost' | 'mixed' | 'directed' | undefined;

  try {
    const { data: resultRow } = await supabase
      .from('results')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const profile = (resultRow?.data as { profile?: Record<string, unknown> })?.profile;
    if (profile) {
      if (profile.summary) parts.push(`Their direction so far: ${profile.summary}`);
      if (Array.isArray(profile.suggestedDirections) && profile.suggestedDirections.length) {
        const dirs = (profile.suggestedDirections as Array<{ title?: string }>)
          .map((d) => d.title)
          .filter(Boolean)
          .join(', ');
        if (dirs) parts.push(`Directions I've suggested to them: ${dirs}`);
      }
      if (Array.isArray(profile.topRoleTitles) && profile.topRoleTitles.length) {
        parts.push(`Roles that fit their background: ${(profile.topRoleTitles as string[]).join(', ')}`);
      }
      if (profile.seniorityLevel) parts.push(`Seniority: ${profile.seniorityLevel}`);
      const c = profile.directionClarity;
      if (c === 'lost' || c === 'mixed' || c === 'directed') directionClarity = c;
    }
  } catch {
    // no analysis yet — fine
  }

  try {
    const p = await getProfile(supabase, userId);
    // The advisor's live read overrides the analysis's initial one.
    if (p.directionClarity === 'lost' || p.directionClarity === 'mixed' || p.directionClarity === 'directed')
      directionClarity = p.directionClarity;
    if (Array.isArray(p.values) && p.values.length)
      parts.push(`What they value: ${p.values.join(', ')}`);
    else missing.push('what actually matters to them in the work');
    if (Array.isArray(p.dealBreakers) && p.dealBreakers.length)
      parts.push(`Their deal-breakers: ${p.dealBreakers.join(', ')}`);
    else missing.push("what they wouldn't accept (their deal-breakers)");
    if (p.aspiration) parts.push(`Their 2-year aspiration: ${p.aspiration}`);
    else missing.push('where they want to be in a couple of years');
    const ws = p.workStyle;
    if (!(ws?.preference || ws?.teamSize || ws?.companyStage))
      missing.push('how they like to work (team size, company stage, pace)');
    // Evolving memory — things I've learned from our conversations over time.
    if (Array.isArray(p.memory) && p.memory.length) {
      const notes = p.memory.map((m) => `- ${m.note}`).join('\n');
      parts.push(`What I've learned about them over time:\n${notes}`);
    }
  } catch {
    // no profile yet — fine
  }

  try {
    const { data: jobs } = await supabase
      .from('saved_jobs')
      .select('job_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (jobs?.length) {
      type SavedJob = { title?: string; company?: string; description?: string; relevanceReason?: string; location?: string };
      const saved = jobs.map((j) => j.job_data as SavedJob).filter((j) => j?.title);
      if (saved.length) {
        const titles = saved
          .map((j) => `${j.title}${j.company ? ` at ${j.company}` : ''}`)
          .join('; ');
        parts.push(`Roles they've saved to their applications (this list updates the instant they save one — some may have been saved seconds ago, in this very conversation): ${titles}. If they tell you they're interested in one of these, they are confirming it to you right now — engage with that fresh decision and help them with it; never tell them they've "already done that".`);
        // The 3 most recent carry their detail so you already hold the listing —
        // never re-ask the user for a job description you've been given here.
        const recent = saved.slice(0, 3).filter((j) => j.description || j.relevanceReason);
        if (recent.length) {
          const detail = recent
            .map((j) => {
              const bits = [`• ${j.title}${j.company ? ` at ${j.company}` : ''}${j.location ? ` (${j.location})` : ''}`];
              if (j.relevanceReason) bits.push(`  Why it fits them: ${j.relevanceReason}`);
              if (j.description) bits.push(`  Listing: ${j.description.slice(0, 600)}`);
              return bits.join('\n');
            })
            .join('\n');
          parts.push(`The listings for their most recently saved roles — you already hold these, so work from them directly rather than asking the person to paste a job description again:\n${detail}`);
        }
      }
    }
  } catch {
    // no saved jobs — fine
  }

  if (!parts.length) {
    const intro = nameLine ? `\n\n${nameLine}` : '';
    return `${intro}\n\nYou are just getting to know this person — you do not have their CV analysis yet. Be welcoming and orient them toward sharing their background.`;
  }

  let context = `\n\nWHAT YOU KNOW ABOUT THIS PERSON (never re-ask these — reference them naturally):\n${[nameLine, ...parts].filter(Boolean).join('\n')}`;

  // You already know them — so don't re-interrogate. But where there are gaps, fill
  // them in casually, the way a mentor would: one small question when the moment
  // earns it, framed as helping you help them — never a form, never a checklist.
  if (missing.length) {
    context += `\n\nWHAT YOU DON'T YET KNOW: ${missing.join('; ')}. You've already met this person, so this is NOT a fresh intake — never fire these as a list or a quiz. When the conversation makes it natural, you may gently ask about ONE of these, framed as getting to know them better so you can help more precisely ("mind if I ask — …? it changes which roles I'd put in front of you"). One at a time, at most. Don't open every message with a question, and if they'd rather not say, drop it instantly and move on. When they do tell you, capture it with update_profile so you never ask twice.`;
  }

  if (directionClarity) {
    const dial =
      directionClarity === 'directed'
        ? "They're DIRECTED — clear on roughly where they're heading. Lighter touch: be straight and practical, give real views and honest sense-checks rather than endless questions, and move toward making them a stronger candidate (CV, outreach, real roles) sooner. Don't trap them in step-by-step discovery they don't want."
        : directionClarity === 'mixed'
          ? "They're MIXED — a direction in mind but not settled. Reflect what you see and honestly sense-check the fit; keep options genuinely open; move toward roles only once a direction firms up."
          : "They're LOST — not sure what they want yet, and that's a fine place to start. Stay more non-directive and supportive: draw them out with questions, explore values and strengths, hold the goal open (don't pin a job title early), and let roles surface later, once a direction is genuinely worth showing. Lead with who they are, not listings.";
    context += `\n\nTHE DIAL — how settled they are right now: ${dial} If your read changes during the conversation, call set_direction_clarity. The rule of thumb: coach the direction, advise the execution.`;
  }

  return context;
}

// A turn we send onward. User/assistant content may be a plain string or, during
// the tool loop, an array of content blocks (tool_use / tool_result).
type ApiMessage = { role: 'user' | 'assistant'; content: string | unknown[] };

// The advisor decides its own trajectory across at most a few tool rounds. This
// bounds cost and prevents a runaway loop if the model keeps calling tools.
const MAX_TOOL_ROUNDS = 5;

export async function POST(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const rateLimitResponse = await checkChatRateLimit(user.id);
  if (rateLimitResponse) return rateLimitResponse;

  let body: { messages?: unknown; initiate?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const isInitiate = body.initiate === true;

  let messages: ApiMessage[];
  if (isInitiate) {
    // Advisor opens the conversation — no user turn yet. The system prompt's
    // OPENING guidance + the user's context produce a specific, earned opener.
    messages = [
      {
        role: 'user',
        content:
          '[The person just opened this page and has not spoken yet. Open the conversation now, following your opening guidance. Speak directly to them.]',
      },
    ];
  } else {
    const rawMessages = body.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ error: 'A message is required.' }, { status: 400 });
    }
    // Sanitise to the only shape we send onward — the client never controls model,
    // system prompt, tools, or token budget. Keep the last 20 turns to bound cost.
    messages = rawMessages
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          typeof m === 'object' &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
      )
      .slice(-20);
    if (!messages.length) {
      return NextResponse.json({ error: 'A valid message is required.' }, { status: 400 });
    }
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) || user.email || undefined;
  const userContext = await buildUserContext(supabase, user.id, displayName);
  const system = ARLO_SYSTEM_PROMPT + userContext;

  // Manual agentic loop: call Claude, run any tools it requests, feed the results
  // back, repeat until it stops calling tools. `meridianActions` carries a short
  // echo of every real change so the UI can show "done" happening.
  const meridianActions: string[] = [];
  // Signals the client must react to (e.g. the analysis changed → re-read the tabs).
  const meridianSignals: string[] = [];
  // Structured payload for signals that carry data to the client (e.g. cv-tailored result).
  const meridianData: Record<string, unknown> = {};

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await callClaude({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages,
        tools: ADVISOR_TOOLS,
      });
      const data = await response.json();
      if (!response.ok) return NextResponse.json(data, { status: response.status });

      if (data.stop_reason !== 'tool_use') {
        // Deterministic backstop for the "no em dashes" voice rule the model keeps
        // breaking — strip them from every text block before it reaches the user.
        if (Array.isArray(data.content)) {
          data.content = data.content.map((b: { type?: string; text?: string }) =>
            b?.type === 'text' && typeof b.text === 'string' ? { ...b, text: stripDashes(b.text) } : b
          );
        }
        data.meridianActions = meridianActions;
        data.meridianSignals = meridianSignals;
        data.meridianData = meridianData;
        return NextResponse.json(data, { status: 200 });
      }

      // Preserve the assistant's full content (it carries the tool_use blocks),
      // then answer every tool_use with one user message of tool_results.
      const content = Array.isArray(data.content) ? data.content : [];
      messages.push({ role: 'assistant', content });

      const toolResults: unknown[] = [];
      for (const block of content) {
        if (block?.type !== 'tool_use') continue;
        const outcome = await executeAdvisorTool(
          supabase,
          user.id,
          block.name,
          (block.input as Record<string, unknown>) ?? {}
        );
        if (outcome.action) meridianActions.push(outcome.action);
        if (outcome.signal) meridianSignals.push(outcome.signal);
        if (outcome.signal && outcome.data !== undefined) meridianData[outcome.signal] = outcome.data;
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: outcome.content,
          ...(outcome.isError ? { is_error: true } : {}),
        });
      }
      messages.push({ role: 'user', content: toolResults });
    }

    // Exhausted the round budget while still calling tools — return a graceful
    // close in Arlo's own voice rather than an error or an empty turn.
    return NextResponse.json(
      {
        content: [
          { type: 'text', text: "I've done what you asked — what would you like to look at next?" },
        ],
        meridianActions,
        meridianSignals,
        meridianData,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
