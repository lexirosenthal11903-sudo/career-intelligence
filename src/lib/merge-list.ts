/**
 * Union of an existing list with newly-mentioned items, ADDITIVELY (case-insensitive
 * dedupe, existing order kept, new items appended). This is what stops update_profile from
 * dropping a person's other values/deal-breakers when the advisor only passes the new one
 * (STATE-SYNC-AUDIT #13). Trims blanks; caps length so it can't grow unbounded.
 *
 * Dependency-free leaf module so the rule is unit-testable under the plain node test runner
 * (profile.ts pulls in `@/` aliases the runner can't resolve).
 */
export function mergeList(existing: string[], incoming: string[], cap = 20): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of [...existing, ...incoming]) {
    const trimmed = (item ?? '').trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= cap) break;
  }
  return out;
}
