// Interview prep artifact — the durable prep that lives inside an application (likely
// questions + the user's editable answers + a short focus note). Stored as a `documents`
// row, type 'interview_prep', under the role's canonical job_id. The pure merge decision
// lives here so it unit-tests; the DB read/write lives in advisor-tools (save_interview_prep).

export interface PrepQuestion {
  q: string; // the question
  a: string; // the answer (advisor-seeded first draft, then user-edited; '' if none yet)
}

const norm = (t?: string) => (t ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Merge an incoming prep question set with what's already saved, so calling
 * save_interview_prep more than once is safe:
 * - No incoming questions (a focus-note-only call after a mock) → keep the existing set
 *   entirely; the advisor is only updating the note.
 * - Incoming questions present → they define the set (the advisor may revise it), BUT a
 *   non-empty EXISTING answer is kept whenever the incoming answer is blank, so a later
 *   save never wipes an answer the USER has edited. Matched by normalised question text.
 * - Empty-question entries are dropped.
 * `sanitise` is applied to advisor-authored text (strip em dashes etc.); pass identity for
 * the user's own answers, which are never sanitised.
 */
export function mergePrepQuestions(
  existing: PrepQuestion[],
  incoming: Array<{ question?: unknown; answer?: unknown }>,
  sanitise: (s: string) => string = (s) => s
): PrepQuestion[] {
  if (!incoming.length) return existing;
  return incoming
    .map((raw) => {
      const q = sanitise(String(raw.question ?? '').trim());
      const a = sanitise(String(raw.answer ?? '').trim());
      const prior = existing.find((e) => norm(e.q) === norm(q));
      return { q, a: a || prior?.a || '' };
    })
    .filter((x) => x.q);
}
