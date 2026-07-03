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
type AppRow = { job_id?: string | number; job_data?: { title?: string | null; company?: string | null } | null };

/**
 * Find the saved application for a role, matching BOTH on the exact job_id AND on
 * roleKey(title, company). A live role can be tracked under a live-listing id (UI
 * "I'm interested") OR a synthetic chat-<slug> id (advisor-saved); this resolves to
 * the one record regardless of which id the caller happens to hold. Pure, unit-tested.
 */
export function findApplication<T extends AppRow>(
  apps: T[],
  jobId: string,
  title?: string | null,
  company?: string | null
): T | undefined {
  const wantKey = roleKey(title, company);
  return apps.find(
    (a) =>
      String(a.job_id) === String(jobId) ||
      roleKey(a.job_data?.title, a.job_data?.company) === wantKey
  );
}

export function applicationExistsFor(
  apps: AppRow[],
  jobId: string,
  title?: string | null,
  company?: string | null
): boolean {
  return findApplication(apps, jobId, title, company) !== undefined;
}

/**
 * The canonical job_id to file a role's work under: the id of the application that
 * already exists for this role (matched by job_id OR title+company), or the caller's
 * fallback id when the role is genuinely new. This is the fix for CVs/cover letters
 * orphaning — a document must be stored under the SAME id the Applications detail view
 * reads (the existing application's id), never a freshly-minted chat-<slug> that only
 * matches when the role was first created by the advisor. Pure, so it unit-tests.
 */
export function resolveApplicationJobId(
  apps: AppRow[],
  fallbackJobId: string,
  title?: string | null,
  company?: string | null
): string {
  const found = findApplication(apps, fallbackJobId, title, company);
  return found ? String(found.job_id) : fallbackJobId;
}
