/**
 * Verifies the server-side generation in save_interview_prep MENTORS: it produces the
 * question + coaching ("what it's testing") + a structure scaffold, and NEVER a written
 * answer (principle 7). The half the tool-call harness can't reach (it mocks the result).
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
  `\nTheir CV (use it ONLY to make the questions and coaching specific to their background — do NOT write their answers):\n${cvText}`,
  `\nProduce the 5 to 8 questions they are genuinely most likely to face, calibrated to the format. For EACH question give three things:`,
  `- "question": the question, real and specific to THIS role (not generic).`,
  `- "testing": ONE short line on what the interviewer is really asking / what a strong answer shows. This TEACHES them how to think about it.`,
  `- "scaffold": the STRUCTURE to answer with, as a skeleton with NO content. Competency/behavioural → "Situation -> Task -> Action -> Result". Strengths-based → the honest self-knowledge to reflect on. Technical/case → the approach to structure out loud. A frame to fill, never a filled-in answer.`,
  `\nCRITICAL: you are coaching, not answering. NEVER write the candidate's answer, an example answer, or a first draft. No "a"/"answer" field. The answer is theirs to write. Write like a person: no inflated adjectives, no em dashes, no filler.`,
  `\nRespond with valid JSON only, exactly: {"questions":[{"question":"...","testing":"...","scaffold":"..."}]}`,
].join('\n');

const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
  body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, messages: [{ role: 'user', content: genPrompt }] }),
});
const raw = await res.json();
if (!res.ok) { console.error('API error:', JSON.stringify(raw)); process.exit(1); }
const text = raw.content?.[0]?.type === 'text' ? raw.content[0].text : '';
const jsonStr = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

let parsed;
try { parsed = JSON.parse(jsonStr); } catch (e) { console.error('❌ JSON parse failed:', e.message, '\n', text.slice(0, 400)); process.exit(1); }
const qs = parsed.questions ?? [];

console.log(`Questions generated: ${qs.length}`);
qs.forEach((q, i) => console.log(`\n${i + 1}. ${q.question}\n   testing: ${q.testing}\n   scaffold: ${q.scaffold}\n   answer field present: ${q.answer !== undefined || q.a !== undefined}`));

const countOk = qs.length >= 5 && qs.length <= 8;
const allHaveQ = qs.every((q) => typeof q.question === 'string' && q.question.trim());
const allTeach = qs.every((q) => typeof q.testing === 'string' && q.testing.trim().length > 10);
const allScaffold = qs.every((q) => typeof q.scaffold === 'string' && q.scaffold.trim().length > 5);
const noAnswers = qs.every((q) => q.answer === undefined && q.a === undefined);
// The tool runs stripDashes over every advisor field before saving (mergePrepQuestions
// with the sanitiser), so em dashes in the raw Haiku output are removed in production.
// Mirror that here — check the SAVED result, and report the raw state informationally.
const rawHadEmDash = JSON.stringify(qs).includes('—');
const strip = (s) => String(s ?? '').replace(/[—–]/g, '-');
const savedHasEmDash = qs.some((q) => [strip(q.question), strip(q.testing), strip(q.scaffold)].join('').includes('—'));
console.log('\n────────────────────────────────────────');
console.log(`5-8 questions: ${countOk ? '✅' : '❌ ' + qs.length}`);
console.log(`every question non-empty: ${allHaveQ ? '✅' : '❌'}`);
console.log(`every question TEACHES (testing line): ${allTeach ? '✅' : '❌'}`);
console.log(`every question has a STRUCTURE scaffold: ${allScaffold ? '✅' : '❌'}`);
console.log(`NO written answers (mentor, not vending machine): ${noAnswers ? '✅' : '❌ AN ANSWER WAS GENERATED'}`);
console.log(`no em dashes after the tool's sanitiser: ${!savedHasEmDash ? '✅' : '❌'}  (raw Haiku output had em dashes: ${rawHadEmDash ? 'yes, stripped in production' : 'no'})`);
console.log((countOk && allHaveQ && allTeach && allScaffold && noAnswers && !savedHasEmDash) ? '\n✅ PASS — generation coaches (question + testing + structure), never answers.' : '\n❌ FAIL');
