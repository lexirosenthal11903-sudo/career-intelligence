// Canonical identity for a live role, shared by the server (addHiddenRole) and the
// client (the Live-roles hide filter) so the hide-matching can never drift apart.
// Item-level only: a role is identified by its title + company, normalised.
export function normRolePart(s?: string | null): string {
  return (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function roleKey(title?: string | null, company?: string | null): string {
  return `${normRolePart(title)}|${normRolePart(company)}`;
}
