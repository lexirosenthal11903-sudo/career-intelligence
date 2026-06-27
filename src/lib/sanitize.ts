// Deterministic guarantee for a rule the model won't keep on its own.
//
// The advisor prompt bans em dashes (an AI tell, banned 2026-06-26), but Sonnet
// still emits them in a meaningful share of replies. Rather than rely on the
// prompt, we strip them from every piece of model output before it reaches the
// user — chat replies AND generated documents (CVs, cover letters, outreach).
// The advisor eval applies this same function, so it grades the text users see.

/**
 * Replace em/en dashes with grammatical punctuation:
 *  - a numeric range (15–20) becomes a hyphen (15-20)
 *  - any other em/en dash becomes a comma
 * then tidies the artefacts the substitution can leave (", ." → ".", ",," → ",",
 * a comma stranded at the start of a line). Hyphen-minus is left untouched.
 */
export function stripDashes(text: string): string {
  if (!text) return text;
  return text
    .replace(/(\d)\s*[–—]\s*(\d)/g, '$1-$2') // numeric range → hyphen
    .replace(/\s*[—–]\s*/g, ', ')            // any remaining em/en dash → comma
    .replace(/,\s*([.,;:!?])/g, '$1')        // ", ." → "."
    .replace(/,\s*,/g, ', ')                 // ",," → ","
    .replace(/(^|\n)\s*,\s*/g, '$1');        // comma stranded at line start
}
