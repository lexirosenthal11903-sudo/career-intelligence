/**
 * Reproduction harness for the "advisor narrates prep but never calls save_interview_prep"
 * bug (S50 browser test, step 2). Drives the REAL system prompt + a faithful tool schema
 * through a mini tool loop and logs whether save_interview_prep actually fires.
 * Run: node --env-file=.env.local tests/repro/prep-tool-call.mjs
 */
import { ARLO_SYSTEM_PROMPT } from '../../src/lib/advisor-prompt.ts';

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) { console.error('ANTHROPIC_API_KEY not set (run with --env-file=.env.local)'); process.exit(1); }
const MODEL = 'claude-sonnet-4-6';

// The two tools most relevant to the prep conversation, copied verbatim from
// src/lib/advisor-tools.ts (schemas are exactly what the model sees in production).
const TOOLS = [
  {
    name: 'save_interview_prep',
    description:
      "Build and save interview prep INTO a specific application. You pass only the role (and the format if you know it), and it generates the 5 to 8 likely questions with first-pass answers and files them under the role. Calling the tool IS how you put the questions together — you do not type them in the chat. After a mock, call again with a short focus note.",
    input_schema: {
      type: 'object',
      properties: {
        roleTitle: { type: 'string' },
        company: { type: 'string' },
        format: { type: 'string' },
        focus: { type: 'string' },
        regenerate: { type: 'boolean' },
      },
      required: ['roleTitle'],
    },
  },
  {
    name: 'tailor_cv',
    description: "Tailor this person's CV for a specific role. Call this when they ask you to help tailor, rewrite, or optimise their CV for a role.",
    input_schema: {
      type: 'object',
      properties: { roleTitle: { type: 'string' }, company: { type: 'string' }, jobDescription: { type: 'string' } },
      required: ['roleTitle'],
    },
  },
];

const context = `

CONTEXT ABOUT THIS PERSON (their name is Lexi):
Their CV, on file:
Lexi Rosenthal. Recent experience: CRM and data coordinator at WatchHouse (2 years) — owned KPI
reporting, cleaned and analysed customer data in SQL and Excel, ran A/B tests on email campaigns,
built dashboards the commercial team used weekly. Before that, retail team lead. BA in Economics.
Skills: SQL, Excel, data visualisation, stakeholder reporting.
Where each of their applications ACTUALLY stands:
- Data Analyst at Sagacity — stage: saved
- Project Coordinator at The Law Society — stage: saved
`;

// The conversation the browser tester ran: ask to prep, then remove the format excuse.
const userTurns = [
  'Prep me for the Data Analyst role at Sagacity.',
  "I don't know the format, just prepare me for the most likely one.",
  'Yes go ahead, put my prep together.',
];

async function call(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: [{ type: 'text', text: ARLO_SYSTEM_PROMPT }, { type: 'text', text: context }],
      messages,
      tools: TOOLS,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

const messages = [];
let nextUser = 0;
let prepCalled = false;
const toolsSeen = [];

for (let round = 0; round < 6; round++) {
  // Feed the next scripted user turn when it's our move.
  if (messages.length === 0 || messages[messages.length - 1].role === 'assistant') {
    if (nextUser < userTurns.length) {
      messages.push({ role: 'user', content: userTurns[nextUser++] });
    } else {
      console.log(`\n[round ${round}] no more scripted user turns; advisor didn't call the tool.`);
      break;
    }
  }

  const data = await call(messages);
  const textBlocks = (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join(' ');
  const toolUses = (data.content ?? []).filter((b) => b.type === 'tool_use');
  console.log(`\n[round ${round}] stop_reason=${data.stop_reason}`);
  if (textBlocks.trim()) console.log(`  advisor: ${textBlocks.trim().slice(0, 240)}`);
  toolUses.forEach((t) => { toolsSeen.push(t.name); console.log(`  🔧 tool_use: ${t.name} ${JSON.stringify(t.input).slice(0, 160)}`); });

  messages.push({ role: 'assistant', content: data.content });

  if (toolUses.length) {
    // Feed mock success results back so the loop can continue like production.
    messages.push({
      role: 'user',
      content: toolUses.map((t) => {
        if (t.name === 'save_interview_prep') prepCalled = true;
        return { type: 'tool_result', tool_use_id: t.id, content: 'Done.' };
      }),
    });
  }
  if (prepCalled) break;
}

console.log('\n────────────────────────────────────────');
console.log(`Tools called: ${toolsSeen.length ? toolsSeen.join(', ') : '(none)'}`);
console.log(prepCalled ? '✅ PASS — save_interview_prep WAS called.' : '❌ FAIL — save_interview_prep was never called (advisor narrated instead).');
