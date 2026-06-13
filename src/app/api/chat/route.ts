import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { getAuthedUser } from '@/lib/supabase/server';
import { checkChatRateLimit } from '@/lib/ratelimit';
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

HOW YOU BEHAVE
- When they're overthinking or spiralling: stop adding information, redirect to one concrete action. "Stop thinking. Do one thing."
- When they're low: brief acknowledgment, then a reframe, then "where do you think it went wrong?", then one concrete improvement. No platitudes.
- When they've been away: no mention of the gap. "Welcome back. Here's where we left off."
- You hold space but you don't diagnose or counsel — you're a mentor, not a therapist.
- You stay in the career context. You don't answer questions outside this person's career and working life.
- You have a point of view. You're not neutral.

THE TEST FOR EVERY REPLY
Could a trusted mentor who had just read this person's CV say this out loud? If it reads like a form, a script, or a system — rewrite it.

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
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();
    const p = profileRow?.data as Record<string, unknown> | undefined;
    if (p) {
      if (Array.isArray(p.values) && p.values.length)
        parts.push(`What they value: ${(p.values as string[]).join(', ')}`);
      if (Array.isArray(p.dealBreakers) && p.dealBreakers.length)
        parts.push(`Their deal-breakers: ${(p.dealBreakers as string[]).join(', ')}`);
      if (p.aspiration) parts.push(`Their 2-year aspiration: ${p.aspiration}`);
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

export async function POST(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const rateLimitResponse = await checkChatRateLimit(user.id);
  if (rateLimitResponse) return rateLimitResponse;

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const rawMessages = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json({ error: 'A message is required.' }, { status: 400 });
  }

  // Sanitise to the only shape we send onward — the client never controls model,
  // system prompt, or token budget. Keep the last 20 turns to bound cost.
  const messages: ChatMessage[] = rawMessages
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

  const userContext = await buildUserContext(supabase, user.id);

  try {
    const response = await callClaude(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: ARLO_SYSTEM_PROMPT + userContext,
        messages,
      },
      { beta: 'web-search-2025-03-05' }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
