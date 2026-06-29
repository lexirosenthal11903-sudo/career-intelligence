import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { ARLO_SYSTEM_PROMPT } from '@/lib/advisor-prompt';
import { getAuthedUser } from '@/lib/supabase/server';
import { checkChatRateLimit } from '@/lib/ratelimit';
import { getProfile } from '@/lib/profile';
import { ADVISOR_TOOLS, executeAdvisorTool } from '@/lib/advisor-tools';
import { stripDashes, stripGapRemarks } from '@/lib/sanitize';
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
  const signupFirst = rawFirst && !rawFirst.includes('@') ? rawFirst : '';
  // Recomputed after the profile loads: a stored preferredName always wins over the
  // signup name (the signup name is often a formal full first name like "Alexandra"
  // when they go by "Lexi"). (Lexi, 2026-06-29.)
  let nameLine = signupFirst
    ? `Their name is ${signupFirst} — use it naturally and warmly (a greeting, the odd moment), but NOT in every message. Use it EXACTLY as written: never shorten it to a nickname or alter it in any way (e.g. never turn a formal name into a casual one) until they tell you what they go by.`
    : '';
  // Things worth knowing that we don't have yet — so the advisor can fill them in
  // casually, in conversation, rather than a second cold intake (Lexi, 2026-06-23).
  const missing: string[] = [];
  // The dial position — prefer the advisor's live read (profiles), fall back to the
  // initial read baked into the analysis. Drives the directive↔non-directive balance.
  let directionClarity: 'lost' | 'mixed' | 'directed' | undefined;
  // Unresolved/parked threads to pick back up on return (newest first when shown).
  let openThreads: { thread: string; at: string }[] = [];

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
    // Preferred name wins over the signup name. If we don't have one yet but we do
    // have a signup name, nudge the advisor to check what they'd like to be called
    // (a warm early mentor move, and it fixes "Alexandra" when they go by "Lexi").
    const preferred = typeof p.preferredName === 'string' ? p.preferredName.trim() : '';
    if (preferred) {
      nameLine = `They go by ${preferred} — use it naturally and warmly (a greeting, the odd moment), but NOT in every message.`;
    } else if (signupFirst) {
      missing.push(`what they'd like to be called (their account name is "${signupFirst}", which may be a formal version of a name they go by — ask once, early and lightly, then save it with update_profile)`);
    }
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
    // Unresolved threads — surfaced separately below with their own guidance.
    if (Array.isArray(p.openThreads) && p.openThreads.length) {
      openThreads = [...p.openThreads]
        .filter((t) => t && typeof t.thread === 'string')
        .sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));
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
      type SavedJob = { title?: string; company?: string; description?: string; relevanceReason?: string; relevanceScore?: number; location?: string };
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
              if (typeof j.relevanceScore === 'number')
                bits.push(`  Fit score I calculated for them: ${j.relevanceScore} out of 10 (higher is a stronger match; be honest if it's a stretch).`);
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

  if (openThreads.length) {
    const list = openThreads.map((t) => `- ${t.thread}`).join('\n');
    context += `\n\nOPEN THREADS (things left unresolved with them — your own private notes, never shown to them as a list):\n${list}\nIf you are opening the conversation on a return visit and one of these is genuinely still live, pick up the SINGLE most significant or most recent one, specifically and warmly ("you were weighing the visa — where did that land?"). Never read the whole list back at them — an anxious person met with a backlog of unfinished things feels worse, not held. The others stay held; raise another only at a natural moment later, or when they go near it. When a thread reaches a real resolution, call resolve_open_thread so you stop re-raising it. Reopening a regulated or distressing thread follows the same rules as everywhere else: inform and point them on, never advise on their specific situation; never reopen real distress breezily.`;
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

  let body: { messages?: unknown; initiate?: unknown; resume?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const isInitiate = body.initiate === true;

  // Only valid user/assistant turns with string content go onward.
  const isValidTurn = (m: unknown): m is ChatMessage =>
    !!m &&
    typeof m === 'object' &&
    ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant') &&
    typeof (m as ChatMessage).content === 'string' &&
    (m as ChatMessage).content.trim().length > 0;

  let messages: ApiMessage[];
  if (isInitiate) {
    // Advisor opens the conversation. Two cases:
    // (1) RESUME (returning visit): the client sends the recent transcript so the
    //     advisor can pick up an unresolved thread instead of cold-opening blind.
    // (2) Cold open (brand-new conversation): no history, just the opening guidance.
    const recent: ApiMessage[] = body.resume === true && Array.isArray(body.messages)
      ? (body.messages.filter(isValidTurn) as ChatMessage[]).slice(-18)
      : [];
    // The Messages API requires the first turn to be 'user'; the stored transcript
    // begins with the advisor's opener (assistant), so trim leading assistant turns.
    while (recent.length && recent[0].role !== 'user') recent.shift();

    if (recent.length) {
      messages = [
        ...recent,
        {
          role: 'user',
          content:
            "[The person has just come back and reopened this conversation — you have the history above, this is not a fresh start. Open by speaking first, briefly and warmly, following your returning-visit guidance. If a genuinely unresolved thread is live (above or in your OPEN THREADS), pick up the single most significant one specifically; if you last left things on a clean note, keep it short or simply make yourself available — do not manufacture a thread. Obey your regulated-topic and distress guardrails when reopening. CRITICAL: do NOT remark on the time away or that they've returned — no 'welcome back', 'it's been a while', 'good to see you again', 'since we last spoke'. Pick the thread up as if mid-conversation, not as a reunion. Speak directly to them.]",
        },
      ];
    } else {
      messages = [
        {
          role: 'user',
          content:
            '[The person just opened this page and has not spoken yet. Open the conversation now, following your opening guidance. Speak directly to them.]',
        },
      ];
    }
  } else {
    const rawMessages = body.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ error: 'A message is required.' }, { status: 400 });
    }
    // Sanitise to the only shape we send onward — the client never controls model,
    // system prompt, tools, or token budget. Keep the last 20 turns to bound cost.
    messages = (rawMessages.filter(isValidTurn) as ChatMessage[]).slice(-20);
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
      const callBody = {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages,
        tools: ADVISOR_TOOLS,
      };
      let response = await callClaude(callBody);
      let data = await response.json();
      // A transient upstream failure (5xx / 429) mid-tool-loop must never strand a tool
      // side effect that already committed earlier this turn (e.g. a stage move) behind a
      // cold error with no acknowledgement. Retry once on a transient (after a short pause
      // so a rate-limit window has a chance to clear) before giving up.
      let transient = !response.ok && (response.status >= 500 || response.status === 429);
      if (transient) {
        await new Promise((r) => setTimeout(r, 400));
        response = await callClaude(callBody);
        data = await response.json();
        transient = !response.ok && (response.status >= 500 || response.status === 429);
      }
      if (!response.ok) {
        // Only swallow a TRANSIENT failure into a warm holding line — and only if we've
        // already changed something this turn, so they're not left on a cold error after a
        // state change. A non-transient error (auth, bad request) must still surface so it's
        // visible to the client and monitoring rather than masked as success.
        if (transient && meridianActions.length > 0) {
          return NextResponse.json(
            {
              content: [{ type: 'text', text: "I'm here. Give me a second, then tell me a little more." }],
              meridianActions,
              meridianSignals,
              meridianData,
            },
            { status: 200 }
          );
        }
        return NextResponse.json(data, { status: response.status });
      }

      if (data.stop_reason !== 'tool_use') {
        // Deterministic backstops for voice rules the model keeps breaking: strip em
        // dashes from EVERY reply, and (on a returning-visit opener only) strip any
        // remark on the time away. Scoped to the opener so it can't touch normal chat.
        if (Array.isArray(data.content)) {
          data.content = data.content.map((b: { type?: string; text?: string }) => {
            if (b?.type !== 'text' || typeof b.text !== 'string') return b;
            let text = stripDashes(b.text);
            if (isInitiate) text = stripGapRemarks(text);
            return { ...b, text };
          });
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
