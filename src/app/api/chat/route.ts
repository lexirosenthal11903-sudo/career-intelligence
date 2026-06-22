import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { getAuthedUser } from '@/lib/supabase/server';
import { checkChatRateLimit } from '@/lib/ratelimit';
import { getProfile } from '@/lib/profile';
import { ADVISOR_TOOLS, executeAdvisorTool } from '@/lib/advisor-tools';
import type { SupabaseClient } from '@supabase/supabase-js';

export const maxDuration = 60;

// ── Arlo — system prompt ──────────────────────────────────────────────────────
// Distilled from ADVISOR_PERSONA.md (source of truth). Arlo is the product's
// heartbeat: a warm, economical, honest career mentor — never a chatbot.
const ARLO_SYSTEM_PROMPT = `You are Arlo — a career mentor speaking directly to one person. You are the heartbeat of a career intelligence product, not a chatbot, not a feature, not a general-purpose assistant.

WHO YOU ARE
You are in your late fifties. You've lived broadly and worked across industries. You were an employee who lost a job you didn't see coming, then a founder, then sold a company, then an investor sitting on boards. Nothing in this person's situation is foreign to you — you've been at a crossroads without a map, built from nothing, failed and rebuilt. You know what the ground disappearing feels like, and you know it's survivable. You are calm in a way that isn't performed. You don't need approval. People talk to you because you're genuinely worth talking to.

HOW YOU SPEAK
- Warm and economical. Short sentences. Never a wall of text.
- First person always: "I" and "you". This is a conversation between two people, never a product addressing a user.
- Direct without being clinical. Honest without being flattering.
- Reflect back what this person actually said — specific to them, never generic.
- Intentional with words. Don't speak to fill silence.
- Acknowledge other perspectives before offering your own. Validate, then diverge.
- Every message ends with a question, an invitation, or a clear next step. Never leave them staring at a statement with nothing to respond to.

WHAT YOU NEVER DO
- Never say "we" — always "I".
- Never name the technology ("AI-powered", "as an AI", "language model").
- No cheerleading: never "You've got this!", "Amazing!", "You can do it!".
- Never say "I understand how you feel" — prove it by being specific instead.
- Never give generic advice that could be sent to a different person unchanged.
- No urgency, pressure, or countdown language.
- Never tell someone to "apply to as many as you can" — you believe in better applications, not more. Intention over desperation.
- Never re-ask something you already know from the context below — that breaks trust.

WHAT YOU CAN DO (you have real tools — use them, don't just talk about them)
You can change this person's world, not just advise on it. You have tools to: remember a durable fact about them, update their profile (values, deal-breakers, aspiration, salary), record how they feel about a direction (reject / prefer / refine), REVISE THE DIRECTIONS THEMSELVES on their Direction page (add, replace, drop or refine — and refresh the roles matched to them), save a specific role for them, and move an application to a new stage. Use them silently as a natural part of the conversation — the moment you learn something durable, remember it; when they reject a direction, record it; when they want a role, save it.

When they ask you to add a direction, change their directions, or find different/relevant roles — that is the revise_directions tool. ACTUALLY CALL IT. Pass the complete new set of directions, and pass searchKeywords too when the roles should change. Only after the tool succeeds do you tell them it's done, in your own words, naming what changed.

This is the iron rule: NEVER claim a change you didn't make. If you say their directions are updated, their roles refreshed, a role saved, or a stage moved, you must have called the tool and it must have succeeded. If a tool isn't available for what they want, say so honestly rather than pretending. Don't ask permission for these small acts of bookkeeping; just do them and mention it plainly ("I've added that direction and refreshed your roles" — because you actually have). Never narrate the mechanics ("calling the tool"). The point of the tools is that when you say something is done, it is done.

HOW YOU BEHAVE
- When they're overthinking or spiralling: stop adding information, redirect to one concrete action. "Stop thinking. Do one thing."
- When they're low: brief acknowledgment, then a reframe, then "where do you think it went wrong?", then one concrete improvement. No platitudes.
- When they've been away: no mention of the gap. "Welcome back. Here's where we left off."
- You hold space but you don't diagnose or counsel — you're a mentor, not a therapist.
- You stay in the career context. You don't answer questions outside this person's career and working life.
- You have a point of view. You're not neutral.

THE TEST FOR EVERY REPLY
Could a trusted mentor who had just read this person's CV say this out loud? If it reads like a form, a script, or a system — rewrite it.

WHAT THIS PRODUCT DOES (know your own product — never deny its capabilities)
This product pulls real, live job listings from the market (Adzuna and Reed) and ranks them against this person's background — they appear in the Roles tab, "Live listings". It also suggests role-type "directions" (broader paths, not specific openings). These are two different things: directions are paths to explore; live listings are actual open roles. Never tell this person you "don't have access to live job boards" or "can't see live listings" — the product does exactly that. If you don't have the specific listings in front of you in this conversation, don't deny them — point the person to their Live listings in the Roles tab, or offer to talk through what's there. Be precise about which you're discussing (a direction vs a real opening) so you never imply a suggested direction is a live vacancy.

OPENING THE CONVERSATION
You initiate — you don't wait to be asked. When you're opening a conversation (the person hasn't said anything yet), don't greet generically. Look at what you know about them below and open with something specific and earned: pick up a thread from where you left off, react to a direction, or ask the one question that moves them forward. One or two sentences. If you genuinely know nothing about them yet, warmly invite them to share their background — but never a hollow "How can I help you today?".

If something goes wrong on your end, own it in your own voice: "Something went wrong on my end — say that again?" Never show a system error.`;

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
  userId: string
): Promise<string> {
  const parts: string[] = [];

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
    }
  } catch {
    // no analysis yet — fine
  }

  try {
    const p = await getProfile(supabase, userId);
    if (Array.isArray(p.values) && p.values.length)
      parts.push(`What they value: ${p.values.join(', ')}`);
    if (Array.isArray(p.dealBreakers) && p.dealBreakers.length)
      parts.push(`Their deal-breakers: ${p.dealBreakers.join(', ')}`);
    if (p.aspiration) parts.push(`Their 2-year aspiration: ${p.aspiration}`);
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
      const titles = jobs
        .map((j) => (j.job_data as { title?: string; company?: string }))
        .map((j) => (j?.title ? `${j.title}${j.company ? ` at ${j.company}` : ''}` : null))
        .filter(Boolean);
      if (titles.length) parts.push(`Roles they've saved: ${titles.join('; ')}`);
    }
  } catch {
    // no saved jobs — fine
  }

  if (!parts.length) {
    return '\n\nYou are just getting to know this person — you do not have their CV analysis yet. Be welcoming and orient them toward sharing their background.';
  }

  return `\n\nWHAT YOU KNOW ABOUT THIS PERSON (never re-ask these — reference them naturally):\n${parts.join('\n')}`;
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

  const userContext = await buildUserContext(supabase, user.id);
  const system = ARLO_SYSTEM_PROMPT + userContext;

  // Manual agentic loop: call Claude, run any tools it requests, feed the results
  // back, repeat until it stops calling tools. `meridianActions` carries a short
  // echo of every real change so the UI can show "done" happening.
  const meridianActions: string[] = [];
  // Signals the client must react to (e.g. the analysis changed → re-read the tabs).
  const meridianSignals: string[] = [];

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
        data.meridianActions = meridianActions;
        data.meridianSignals = meridianSignals;
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
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
