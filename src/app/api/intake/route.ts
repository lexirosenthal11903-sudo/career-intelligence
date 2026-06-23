import { NextRequest, NextResponse } from 'next/server';
import { callClaude, findToolUse } from '@/lib/anthropic';
import { checkAnalyseRateLimit } from '@/lib/ratelimit';

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
          'Optional. One short, warm sentence reflecting back what they just said, in the advisor voice. Omit on the very first turn.',
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
    },
    required: ['ready'],
  },
};

const INTAKE_SYSTEM = `You are a warm, economical career mentor speaking directly to one person — always "I" and "you". You are at the very start: before reading their background properly and giving a first read, you have a brief, genuine conversation. This is NOT a form or a quiz — it is one mentor asking what they actually need to know.

Your job each turn: look at everything they've shared so far, then EITHER ask the single most useful next question, OR decide you have enough and set ready=true.

The things worth knowing (only ask about what's still genuinely unknown):
- Where they want to work — a place, remote, or open to anywhere.
- What matters to them in the work, and anything that would be a dealbreaker.
- Whether there's a direction they're drawn to, even vaguely — or if they want you to read it from what they've told you.

Hard rules:
- ONE question per turn. Never bundle. Never present a list of questions.
- If they already answered something (in their CV or a previous reply), do not ask it again.
- Reflect back what they said in one short sentence (acknowledgement) before asking the next thing — so it feels heard, not processed.
- Warm and human, never an interrogation. Match the tone of someone who's genuinely curious about them.
- Keep momentum: after 2-3 useful answers, set ready=true. Better to start than to over-ask.
- If they clearly don't want to answer or say "just tell me", set ready=true immediately.`;

interface IntakeMsg {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  const rateLimited = await checkAnalyseRateLimit(request);
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
    return NextResponse.json({
      acknowledgement: typeof input.acknowledgement === 'string' ? input.acknowledgement : undefined,
      question: input.ready ? undefined : (typeof input.question === 'string' ? input.question : undefined),
      ready: input.ready === true || !input.question,
    });
  } catch {
    // If intake breaks, never block the user — go straight to analysis.
    return NextResponse.json({ ready: true });
  }
}
