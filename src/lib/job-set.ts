/**
 * Stable hash of the inputs that define a user's job set. When any of these change the
 * persisted `matched_jobs` set is rebuilt; otherwise it is reused verbatim (the stability
 * guarantee — listings don't reshuffle every login).
 *
 * Pure + dependency-free on purpose: the client hook (usePanelJobs) computes it to decide
 * whether the stored set still matches, and the e2e drift test imports the SAME function
 * to seed a deterministic stored set (so the badge test can't silently fall back to a live
 * Adzuna/Reed fetch). One implementation, no drift.
 */
export interface JobSetInputs {
  searchKeywords?: string[];
  locationSearch?: string;
  seniorityLevel?: string;
}

export function keywordHash(p: JobSetInputs): string {
  const basis = [
    [...(p.searchKeywords || [])].map((k) => k.toLowerCase().trim()).sort().join("|"),
    (p.locationSearch || "").toLowerCase().trim(),
    (p.seniorityLevel || "").toLowerCase().trim(),
  ].join("::");
  let h = 5381;
  for (let i = 0; i < basis.length; i++) h = ((h << 5) + h + basis.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
