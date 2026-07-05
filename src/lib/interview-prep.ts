// Interview prep artifact — the durable prep that lives inside an application (likely
// questions + the user's editable answers + a short focus note). Stored as a `documents`
// row, type 'interview_prep', under the role's canonical job_id. The pure merge decision
// lives here so it unit-tests; the DB read/write lives in advisor-tools (save_interview_prep).

// MENTOR, not vending machine (CLAUDE.md principle 7): the advisor generates the question,
// what it's really testing (coaching), and the STRUCTURE to answer with — but NEVER the
// answer. The answer is the user's own, drawn out through the mock and written by them.
export interface PrepQuestion {
  q: string;        // the question
  testing: string;  // "what they're really asking" — one coaching line (what a strong answer shows)
  scaffold: string; // the structure to answer with (e.g. STAR skeleton / approach outline) — NOT content
  a: string;        // the USER's OWN answer. '' until they write it. The advisor never authors this.
}

const norm = (t?: string) => (t ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Merge an incoming (advisor-generated) prep set with what's already saved, so calling
 * save_interview_prep more than once is safe:
 * - No incoming questions (a focus-note-only call after a mock) → keep the existing set
 *   entirely; the advisor is only updating the note.
 * - Incoming questions present → they define the questions + coaching + scaffold (the
 *   advisor may revise them), BUT the USER'S OWN answer (`a`) is always preserved from the
 *   existing set, matched by normalised question text — regeneration never wipes it, and
 *   the advisor never supplies it (there is no `answer` field on the incoming shape).
 * - Empty-question entries are dropped.
 * `sanitise` is applied to the advisor-authored fields (strip em dashes etc.); the user's
 * own answer is carried across untouched and never sanitised.
 */
export function mergePrepQuestions(
  existing: PrepQuestion[],
  incoming: Array<{ question?: unknown; testing?: unknown; scaffold?: unknown }>,
  sanitise: (s: string) => string = (s) => s
): PrepQuestion[] {
  if (!incoming.length) return existing;
  return incoming
    .map((raw) => {
      const q = sanitise(String(raw.question ?? '').trim());
      const testing = sanitise(String(raw.testing ?? '').trim());
      const scaffold = sanitise(String(raw.scaffold ?? '').trim());
      const prior = existing.find((e) => norm(e.q) === norm(q));
      return { q, testing, scaffold, a: prior?.a ?? '' };
    })
    .filter((x) => x.q);
}
