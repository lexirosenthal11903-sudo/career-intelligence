// Canonical identity for a live role, shared by the server (addHiddenRole) and the
// client (the Live-roles hide filter) so the hide-matching can never drift apart.
// Item-level only: a role is identified by its title + company, normalised.
export function normRolePart(s?: string | null): string {
  return (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function roleKey(title?: string | null, company?: string | null): string {
  return `${normRolePart(title)}|${normRolePart(company)}`;
}

/**
 * Whether a live listing is already in the user's applications, for the "In Applications"
 * badge. Matches BOTH on the live listing id (UI-saved roles) AND on roleKey(title,company)
 * (advisor-saved roles carry a synthetic `chat-<slug>` id that never equals a listing id),
 * so the same job can't show as both saved and not-saved (STATE-SYNC-AUDIT #1).
 */
export function isInApplications(
  job: { id?: string | number; title?: string | null; company?: string | null },
  interestedIds: Set<string>,
  interestedKeys: Set<string>
): boolean {
  if (job.id != null && interestedIds.has(String(job.id))) return true;
  return interestedKeys.has(roleKey(job.title, job.company));
}

/**
 * Whether a saved application already exists for a role, matching BOTH on the exact
 * job_id AND on roleKey(title, company). This is the guard behind "prep auto-saves,
 * never auto-advances" (SPEC — one record, two lenses): a prep action (tailor CV,
 * draft outreach) must create the application only if the role isn't tracked under
 * EITHER a live-listing id (UI "I'm interested") OR a synthetic chat-<slug> id
 * (advisor-saved). Matching on both keys stops a second row appearing for the same
 * role — and stops any existing stage from being reset. Pure, so it unit-tests.
 */
export function applicationExistsFor(
  apps: Array<{ job_id?: string | number; job_data?: { title?: string | null; company?: string | null } | null }>,
  jobId: string,
  title?: string | null,
  company?: string | null
): boolean {
  const wantKey = roleKey(title, company);
  return apps.some(
    (a) =>
      String(a.job_id) === String(jobId) ||
      roleKey(a.job_data?.title, a.job_data?.company) === wantKey
  );
}
