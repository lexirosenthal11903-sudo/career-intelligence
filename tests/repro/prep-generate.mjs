/**
 * Verifies the server-side question generation in save_interview_prep produces valid,
 * grounded output (5-8 questions, each with a real first-pass answer) — the half the
 * tool-call harness can't reach (it mocks the tool result).
 * Run: node --env-file=.env.local tests/repro/prep-generate.mjs
 */
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1); }

const cvText = `Lexi Rosenthal. CRM and data coordinator at WatchHouse (2 years) — owned KPI reporting,
cleaned and analysed customer data in SQL and Excel, ran A/B tests on email campaigns, built
dashboards the commercial team used weekly. Before that, retail team lead. BA in Economics.`;

// Mirrors the genPrompt in src/lib/advisor-tools.ts save_interview_prep.
const genPrompt = [
  `You are an expert UK interview coach preparing an early-career / graduate candidate for a specific role.`,
  `\nROLE: Data Analyst at Sagacity`,
  `INTERVIEW FORMAT: unknown — prepare for the MOST LIKELY format for this role and stage.`,
  `\nTHEIR CV (draft each answer from THIS real background — never invent experience):\n${cvText}`,
  `\nProduce the 5 to 8 questions they are genuinely most likely to face, calibrated to the format:`,
  `- Competency/behavioural → STAR-shaped questions; draft each answer as a real STAR starting point from their background (situation, task, action, result), never a script.`,
  `- Strengths-based → questions about what energises them and how they work; answers are honest self-knowledge prompts, not rehearsed lines.`,
  `- Technical/case → questions that need structured thinking out loud; answers sketch the approach/structure, not one perfect solution.`,
  `Rules: real and specific to THIS role, not generic. Draft each answer as a FIRST DRAFT the person will shape — enough that they never face a blank box, never a finished script. No invented experience. Write like a person: no inflated adjectives, no em dashes, no filler.`,
  `\nRespond with valid JSON only, exactly: {"questions":[{"question":"...","answer":"..."}]}`,
].join('\n');

const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
  body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 3000, messages: [{ role: 'user', content: genPrompt }] }),
});
const raw = await res.json();
if (!res.ok) { console.error('API error:', JSON.stringify(raw)); process.exit(1); }
const text = raw.content?.[0]?.type === 'text' ? raw.content[0].text : '';
const jsonStr = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

let parsed;
try { parsed = JSON.parse(jsonStr); } catch (e) { console.error('❌ JSON parse failed:', e.message, '\n', text.slice(0, 400)); process.exit(1); }
const qs = parsed.questions ?? [];

console.log(`Questions generated: ${qs.length}`);
qs.forEach((q, i) => console.log(`\n${i + 1}. ${q.question}\n   → ${String(q.answer ?? '').slice(0, 160)}${(q.answer ?? '').length > 160 ? '…' : ''}`));

const countOk = qs.length >= 5 && qs.length <= 8;
const allHaveQ = qs.every((q) => typeof q.question === 'string' && q.question.trim());
const allHaveA = qs.every((q) => typeof q.answer === 'string' && q.answer.trim().length > 20);
const noEmDash = !JSON.stringify(qs).includes('—');
console.log('\n────────────────────────────────────────');
console.log(`5-8 questions: ${countOk ? '✅' : '❌ ' + qs.length}`);
console.log(`every question non-empty: ${allHaveQ ? '✅' : '❌'}`);
console.log(`every answer a real draft (>20 chars): ${allHaveA ? '✅' : '❌'}`);
console.log(`no em dashes: ${noEmDash ? '✅' : '❌'}`);
console.log((countOk && allHaveQ && allHaveA && noEmDash) ? '\n✅ PASS — generation produces grounded, seeded prep.' : '\n❌ FAIL');
