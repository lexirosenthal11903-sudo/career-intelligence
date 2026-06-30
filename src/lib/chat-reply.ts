// Deciding the advisor's FINAL reply when the tool loop ends.
//
// Dependency-free leaf (no `@/` imports) so the decision can be unit-tested
// without the chat route's supabase/anthropic dependencies. See the handoff note
// on leaf modules + `node --test`.
//
// The bug this guards against (Session 45 live-test find): a tool action commits
// this turn (value saved + a "✓ …" echo), then the model's *next* turn ends with
// no words (empty / whitespace-only text, or no text block at all). The route used
// to pass that empty content straight through as a 200, and the client's
// `join("") || ERROR_MSG` then showed the COLD error ("Something went wrong on my
// end") next to the success echo. A committed action must never be stranded behind
// a cold error — when the model goes silent after committing something, we speak a
// warm acknowledgement instead.

export type ContentBlock = { type?: string; text?: string };

/** True if the content array carries at least one non-empty text block. */
export function hasText(content: unknown): boolean {
  return (
    Array.isArray(content) &&
    content.some(
      (b) =>
        (b as ContentBlock)?.type === 'text' &&
        typeof (b as ContentBlock)?.text === 'string' &&
        ((b as ContentBlock).text as string).trim().length > 0
    )
  );
}

/**
 * Replacement content for the final turn, or `null` to keep the model's own.
 *
 * Returns a warm acknowledgement ONLY when the model produced no usable words but
 * at least one real action committed this turn — the one case where the client
 * would otherwise show the cold error over a genuine success. When the model spoke
 * normally, or when nothing committed (a genuinely empty turn the client can treat
 * as an error), the model's own content stands and this returns `null`.
 */
export function ackForSilentCommit(
  content: unknown,
  committedActionCount: number,
  ackLine: string
): { type: 'text'; text: string }[] | null {
  if (!hasText(content) && committedActionCount > 0) {
    return [{ type: 'text', text: ackLine }];
  }
  return null;
}
