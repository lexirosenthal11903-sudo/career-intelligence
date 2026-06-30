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

// The advisor must NEVER remark on how long someone's been away (ADVISOR_PERSONA
// "never remark on the gap"). Sonnet still slips on the return-opener in a real
// share of cases ("it's been a while", "welcome back"). This is the deterministic
// backstop, the gap twin of stripDashes — but applied ONLY to the opener of a
// returning visit, where these phrases are unambiguously about the absence (so no
// false positives on normal chat like "it's been a while since you studied X").
const GAP_REMARK =
  /it'?s been (a while|ages|some time|a bit|so long|too long)|since (we|you) last (spoke|talked|met|chatted)|you'?ve been (away|gone)|long time no|welcome back|good to (see|have) you back/i;

// The advisor has no clock, so it must never assume the time of day (it told someone to
// "start it this morning" at 10pm). The prompt bans it, but Sonnet still slips, so this is
// the deterministic backstop (the time twin of stripDashes): neutralise time-of-day
// phrases in the advisor's OWN output to "today" / "hello". A neutral phrasing is always
// safe; a wrong one ("this morning" at night) breaks trust. Applied to every chat reply.
export function stripTimeOfDay(text: string): string {
  if (!text) return text;
  return text
    .replace(/\bthis (?:morning|afternoon|evening)\b/gi, 'today')
    .replace(/\btonight\b/gi, 'today')
    .replace(/\bgood (?:morning|afternoon|evening)\b/gi, 'hello')
    // Restore sentence-start capitalisation the lowercase replacement may have flattened.
    .replace(/(^|[.!?]\s+|\n\s*)(today|hello)\b/g, (_m, p, w) => p + w[0].toUpperCase() + w.slice(1));
}

/** Drop any sentence that remarks on the time away; keep the rest of the opener. */
export function stripGapRemarks(text: string): string {
  if (!text) return text;
  const sentences = text.match(/[^.!?\n]+[.!?]*\n?|\n/g);
  if (!sentences) return text;
  const kept = sentences.filter((s) => !GAP_REMARK.test(s));
  const result = kept.join('').replace(/[ \t]{2,}/g, ' ').trim();
  // If stripping emptied the whole opener (it was nothing but a gap remark), keep
  // the original rather than send a blank message — a rare, lesser evil.
  return result || text;
}

/**
 * Substitute the `{NAME}` placeholder with the user's RESOLVED display name. The recap
 * model is told to write `{NAME}` wherever it addresses the person, so the rendered name is
 * always exactly what we resolved (preferredName, else the signup first name) and can never
 * be a shortening the model invented (the "Alexandra → Alex" gaslighting bug,
 * STATE-SYNC-AUDIT #3). Deterministic, like stripDashes. If we have no name, the token is
 * removed and the surrounding address punctuation tidied so it doesn't read as "Hi ,".
 */
export function applyName(text: string, name?: string | null): string {
  if (!text || !text.includes('{NAME}')) return text;
  const n = (name ?? '').trim();
  if (n) return text.replace(/\{NAME\}/g, n);
  // No name: drop the token AND tidy the address punctuation around it, on either side.
  const cleaned = text
    // Token at the very start, with its trailing comma/colon: "{NAME}, welcome" -> "welcome".
    .replace(/^\s*\{NAME\}\s*[,:]?\s*/, '')
    // Token elsewhere, with its leading comma/colon + space: "Hi {NAME}, good" -> "Hi, good".
    .replace(/[,:]?\s*\{NAME\}/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
  // Restore a sentence-start capital the stripped leading token may have removed.
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : cleaned;
}
