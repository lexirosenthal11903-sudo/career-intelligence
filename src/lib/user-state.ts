// The single source of truth for a user's application state, shared by every place
// that needs to know "where do this person's applications actually stand": the
// advisor's chat context (/api/chat), the returning-visit recap (/api/recap), and
// (over time) the UI surfaces. Before this module those readers each assembled the
// board with their own duplicated logic and slightly different stage wording, which
// is exactly how the advisor drifted from what the user saw. One definition here, so
// they can never disagree. See STATE-SYNC-AUDIT.md.

import type { SupabaseClient } from '@supabase/supabase-js';

// Stages that mean an application is CLOSED (off the active board). Defined ONCE here
// so the chat context, recap, nav count, and board view can't drift on what "closed"
// means. (Mirrored by SidePanel's CLOSED_STAGES for now; fold that in during the UI pass.)
export const CLOSED_STAGES = ['rejected', 'archive'] as const;

export function isClosedStage(stage: string): boolean {
  return (CLOSED_STAGES as readonly string[]).includes(stage);
}

// Human wording for each stage, in the advisor's voice. The ONLY place stage labels
// for context live (the UI has its own user-facing labels in SidePanel).
export const STAGE_WORDS: Record<string, string> = {
  saved: 'saved, not applied yet',
  preparing: 'preparing the application',
  applied: 'applied, waiting to hear',
  interview: 'at interview stage',
  offer: 'has an OFFER',
  rejected: "didn't get it (a no)",
  archive: 'set aside',
};

export interface BoardEntry {
  title: string;
  company?: string;
  stage: string;
}

/** Read the real board (saved_applications) as the source of truth for outcomes. */
export async function assembleBoard(supabase: SupabaseClient, userId: string): Promise<BoardEntry[]> {
  try {
    const { data: apps } = await supabase
      .from('saved_applications')
      .select('job_data, stage')
      .eq('user_id', userId);
    return (apps ?? [])
      .map((a): BoardEntry | null => {
        const jd = a.job_data as { title?: string; company?: string };
        if (!jd?.title) return null;
        return { title: jd.title, company: jd.company, stage: String(a.stage) };
      })
      .filter((e): e is BoardEntry => e !== null);
  } catch {
    return []; // best-effort: no board read should break the caller
  }
}

const label = (e: BoardEntry) => `${e.title}${e.company ? ` at ${e.company}` : ''}`;

/**
 * The advisor's board context line (chat). Includes ALL stages (closed too, so it
 * never re-asks about a role it already knows was a no) with the "trust the board over
 * memory" instruction. Empty string when there's nothing on the board.
 */
export function formatBoardForAdvisor(board: BoardEntry[]): string {
  if (!board.length) return '';
  const lines = board.map((e) => `${label(e)}: ${STAGE_WORDS[e.stage] ?? e.stage}`).join('; ');
  return `Where each of their applications ACTUALLY stands right now, this is their real board, trust it over your memory of the conversation: ${lines}. An outcome or stage (offer, interview, applied, rejected) is a FACT and this board is the only source of truth for it: never tell them they have an offer or an interview that isn't here, and never assert one from your memory. If they tell you an application moved, call set_application_stage so the board stays true. If something here looks out of date versus what they just said, update it rather than contradicting them.`;
}

/**
 * The recap's board context (returning card). Excludes CLOSED stages: a rejection or a
 * set-aside role is not "where we got to". Returns the bare "title: word" lines, or ''.
 */
export function formatBoardForRecap(board: BoardEntry[]): string {
  return board
    .filter((e) => !isClosedStage(e.stage))
    .map((e) => `${label(e)}: ${STAGE_WORDS[e.stage] ?? e.stage}`)
    .join('\n');
}

/** First word of a full name (e.g. "Alexandra Rosenthal" -> "Alexandra"), '' if none/email-like. */
export function firstName(fullName?: string | null): string {
  const first = (fullName ?? '').trim().split(/\s+/)[0] ?? '';
  return first && !first.includes('@') ? first : '';
}

/**
 * The ONE resolver for what to call the user: a stored preferredName always wins over
 * the signup name (the signup name is often a formal "Alexandra" when they go by "Lexi").
 * Every surface (advisor, recap, and the UI in the next pass) must use this so the
 * product can't display one name while the advisor says another.
 */
export function resolveDisplayName(preferredName?: string | null, fullName?: string | null): string {
  const preferred = (preferredName ?? '').trim();
  if (preferred) return preferred;
  return firstName(fullName);
}

/**
 * The name to SHOW in the UI (nav, profile): a stored preferredName wins, otherwise the
 * full signup name as-is (the nav has always shown the full name, so we keep it when
 * there's no preferred one). This is what fixes "the advisor says Lexi while the screen
 * says Alexandra" (STATE-SYNC-AUDIT #3): every surface should call this.
 */
export function displayNameForUI(preferredName?: string | null, fullName?: string | null): string {
  const preferred = (preferredName ?? '').trim();
  return preferred || (fullName ?? '').trim();
}

export interface DirectionFeedbackEntry {
  direction?: string;
  status?: string;
}

/**
 * The directions the user should actually SEE on their Direction page: the ones the
 * advisor surfaced, minus any they've rejected (directionFeedback.status === 'rejected').
 * Before this, a rejected direction stayed on screen at equal weight while the advisor
 * said it had set it aside (STATE-SYNC-AUDIT #2). Matched by title, case-insensitive.
 */
export function activeDirections<T extends { title?: string }>(
  directions: T[],
  feedback: DirectionFeedbackEntry[] | undefined | null
): T[] {
  const rejected = new Set(
    (feedback ?? [])
      .filter((f) => f?.status === 'rejected')
      .map((f) => (f.direction ?? '').toLowerCase().trim())
      .filter(Boolean)
  );
  if (!rejected.size) return directions;
  return directions.filter((d) => !rejected.has((d.title ?? '').toLowerCase().trim()));
}
