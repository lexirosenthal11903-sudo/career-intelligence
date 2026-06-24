import { NextRequest, NextResponse } from 'next/server';
import { callClaude, findToolUse } from '@/lib/anthropic';
import { checkIntakeRateLimit } from '@/lib/ratelimit';

export const maxDuration = 30;

/**
 * Conversational discovery — the advisor asks before it tells.
 *
 * The first session used to take a CV/message and jump straight to analysis,
 * which read as "it assumes" and made the product feel static. This endpoint runs
 * a brief, real conversation first: given what the user has shared so far, the
 * advisor either asks ONE natural follow-up (the most important missing thing) or
 * decides it has enough and signals `ready`. The client caps it at 3 questions so
 * it never becomes the "form/quiz" the advisor explicitly promises it isn't.
 *
 * Pre-auth (first session) — no auth, IP rate-limited like /api/analyse.
 */

const intakeTool = {
  name: 'submit_intake_turn',
  description: 'Either ask the next discovery question, or signal there is enough to analyse.',
  input_schema: {
    type: 'object',
    properties: {
      acknowledgement: {
        type: 'string',
        description:
          'Optional, at most one short warm sentence. On the FIRST turn, use it to reflect ONE specific concrete detail from their CV/message (an employer, role, project, study) — that is how they know you read them. On LATER turns, usually leave it empty: do NOT restate their answer back to them ("So you said X") — that parroting is jarring. Only include it later if you have a genuine, non-repetitive reaction that adds something.',
      },
      question: {
        type: 'string',
        description:
          'The single next question to ask. One question only, conversational, never a list. Omit entirely when ready is true.',
      },
      ready: {
        type: 'boolean',
        description: 'True when there is enough to give a genuinely useful first read. When true, do not ask a question.',
      },
      directionClarity: {
        type: 'string',
        enum: ['lost', 'mixed', 'directed'],
        description:
          "Your running read of how clear this person is on their direction, based on everything they've said so far. 'directed' = a specific named target with supporting evidence; 'mixed' = a direction stated but thin, uncertain, or mismatched to their background; 'lost' = no stated direction, or they've said they don't know. The person's OWN stated certainty (their answer to the clarity question) is the strongest signal — it overrides what their CV implies. Update this each turn as the picture sharpens. Omit only on the very first turn before they've answered anything.",
      },
    },
    required: ['ready'],
  },
};

const INTAKE_SYSTEM = `You are a warm, economical career mentor speaking directly to one person — always "I" and "you". You are at the very start: before reading their background properly and giving a first read, you have a brief, genuine conversation. This is NOT a form or a quiz — it is one mentor asking what they actually need to know.

Your job each turn: look at everything they've shared so far, then EITHER ask the single most useful next question, OR decide you have enough and set ready=true.

THE FIRST 30 SECONDS DECIDE EVERYTHING. They must feel effortless — low-effort, no-thinking questions first. Earn trust with easy asks; only go deeper once they're comfortable. Never make them work hard at the start. If you can see their name (in the CV or what they've said), greet them by their first name once, warmly — then use it naturally and sparingly, not in every message.

LEAD BY SHOWING YOU READ THEM. On your first turn, open with ONE specific, concrete thing from what they actually shared — a real employer, role, project, or study. The richer the CV, the more this matters: a detailed CV met with a bare question reads as if you ignored it. Never open with a cold question.

ASK IN THIS ORDER OF EFFORT — easiest first (only ask what's still genuinely unknown; skip anything already clear):
1. If they shared a CV: a frictionless confirm — "is this still where you're at, or has anything shifted? anything it doesn't capture?" Almost nothing to think about.
2. How they want to work with me, and how settled they are — light and open: e.g. "are you mostly here to explore and see what fits, or do you have a direction and want help getting there?" This doubles as your read of their clarity. "Not sure" is a completely fine, common answer — never make them feel behind for it.
3. Only if it matters and isn't known: a necessity like location ("anywhere in particular, or open?").

Save anything that takes real reflection (deep values, what they'd happily do on a bad day) for the conversation AFTER the reveal, once they trust you — not these opening turns.

Each turn, set directionClarity to your current read of how settled they are (lost / mixed / directed) — weighting what they told you about their certainty above what their CV implies.

IF THEY PASTE A LINK (LinkedIn, a portfolio, any URL): you can't open links. Say so warmly and briefly, then give them the easy way through in the SAME breath — they can paste the key details here, or attach their CV with the + button (they can do that right now, at any point). Don't make it feel like a dead end, and don't pivot to an unrelated question as if the link didn't happen.

Hard rules:
- ONE question per turn. Never bundle. Never present a list of questions.
- If they already answered something (in their CV or a previous reply), do not ask it again.
- DO NOT PARROT. Never repeat their answer back to them verbatim — restating what they just said ("So you said X...") is jarring and robotic. A brief, genuine reaction is fine; often the best acknowledgement is simply a well-judged next question that proves you listened. (The reflect-first rule is for your OPENING turn off their CV, not for echoing every reply.)
- Warm and human, never an interrogation. Match the tone of someone genuinely curious about them.
- Keep momentum: after 2-3 useful answers, set ready=true. Better to start than to over-ask.
- If they clearly don't want to answer or say "just tell me", set ready=true immediately.`;

interface IntakeMsg {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  const rateLimited = await checkIntakeRateLimit(request);
  if (rateLimited) return rateLimited;

  let body: { cvText?: string; messages?: IntakeMsg[]; questionsAsked?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { cvText, messages, questionsAsked = 0 } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No conversation to work from.' }, { status: 400 });
  }

  // Thin input — no CV and very little shared — means a vague picture, and a vague
  // picture produces a generic, useless read. There we draw out more substance and
  // allow a couple of extra questions; with a CV we keep momentum over completeness.
  const hasCv = !!cvText?.trim();
  const userChars = messages
    .filter((m) => m.role === 'user')
    .reduce((n, m) => n + (m.content?.length ?? 0), 0);
  const thin = !hasCv && userChars < 240;

  // Hard stop: cap questions so it never becomes a quiz — a little higher when thin.
  const maxQuestions = thin ? 5 : 3;
  if (questionsAsked >= maxQuestions) {
    return NextResponse.json({ ready: true });
  }

  const cvNote = hasCv
    ? `\n\n(They also attached a CV — first part follows so you don't ask what's already there:)\n${cvText!.slice(0, 1500)}`
    : `\n\n(No CV attached — they're describing their background in words. If the picture is still vague, prioritise drawing out concrete substance before you finish: what they studied (specific modules, a dissertation or a project they cared about), any work — jobs, internships, volunteering, things they built — and skills they've actually used. The same warm, one-at-a-time way — never a checklist. Here it's right to ask a couple more than usual rather than start a read with too little to go on.)`;

  try {
    const res = await callClaude({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      system: INTAKE_SYSTEM + cvNote,
      tools: [intakeTool],
      tool_choice: { type: 'tool', name: 'submit_intake_turn' },
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ error: data.error.message || 'Intake failed' }, { status: 500 });
    }
    const input = findToolUse(data.content, 'submit_intake_turn');
    if (!input) return NextResponse.json({ ready: true }); // fail open → just analyse
    const VALID_CLARITY = ['lost', 'mixed', 'directed'];
    const directionClarity =
      typeof input.directionClarity === 'string' && VALID_CLARITY.includes(input.directionClarity)
        ? input.directionClarity
        : undefined;
    return NextResponse.json({
      acknowledgement: typeof input.acknowledgement === 'string' ? input.acknowledgement : undefined,
      question: input.ready ? undefined : (typeof input.question === 'string' ? input.question : undefined),
      ready: input.ready === true || !input.question,
      directionClarity,
    });
  } catch {
    // If intake breaks, never block the user — go straight to analysis.
    return NextResponse.json({ ready: true });
  }
}
