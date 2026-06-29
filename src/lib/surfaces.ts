// The product surfaces the advisor can open via the open_surface tool. Shared between
// the server-side tool (which accepts the request) and the client workspace (which does
// the opening) so the two can never drift — a mismatch would let the advisor claim
// "I've opened your X" while nothing actually opens, breaking the "never claim a change
// you didn't make" rule. Every value here is also a valid SidePanel PanelView.
export const ADVISOR_SURFACES = ['applications', 'roles', 'direction', 'documents', 'profile'] as const;
export type AdvisorSurface = (typeof ADVISOR_SURFACES)[number];

export const isAdvisorSurface = (s: string): s is AdvisorSurface =>
  (ADVISOR_SURFACES as readonly string[]).includes(s);
