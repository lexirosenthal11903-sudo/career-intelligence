/**
 * Server-safe normalizer for the analysis profile's array-shaped fields.
 *
 * The Haiku profile call in /api/analyse intermittently returns nested arrays
 * (notably `suggestedDirections`) as a *stringified* JSON blob rather than a real
 * array. Stored as-is, that string crashes every downstream consumer:
 *   - /api/recap `.filter(...)` → "filter is not a function" (500, recap never shows)
 *   - the first-session reveal `JSON.parse` of a *malformed* blob → empty directions
 *
 * Normalising at the WRITE boundary (the analyse route, before the result is
 * streamed/persisted) means the string never reaches storage or any consumer.
 * The client-side `analysisResult.ts` reuses this for defence on already-stored data.
 *
 * No "use client" — safe to import from API routes and server code.
 */

const ARRAY_FIELDS = [
  "suggestedDirections",
  "topRoleTitles",
  "searchKeywords",
  "extractedSkills",
  "extractedSectors",
  "companySuggestions",
  "valuesSignals",
] as const;

/** Coerce a value that should be an array into one, recovering JSON-encoded strings. */
export function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* not valid JSON — unrecoverable, drop rather than crash a consumer */
    }
  }
  return [];
}

/** Coerce the array-shaped profile fields in-place so no consumer can crash on a string. */
export function normalizeAnalysisResult<T>(result: T): T {
  const p = (result as { profile?: Record<string, unknown> } | null)?.profile;
  if (p) {
    for (const field of ARRAY_FIELDS) {
      if (field in p) p[field] = toArray(p[field]);
    }
  }
  return result;
}
