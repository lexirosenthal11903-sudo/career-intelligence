// Shared access to the `profiles` table — keyed by `id` (= auth.users.id), per
// the live DB and supabase-migrations/20260612_profiles.sql.
//
// `profiles.data` is one jsonb document holding both the structured profile
// (values, deal-breakers, aspiration, …) AND the advisor's evolving memory of
// the user (`memory[]`). One read/write path so the profile route, the chat
// context builder, and the advisor's tools never drift apart again — the
// user_id/data drift is exactly the bug Step 1 exists to kill.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface MemoryNote {
  note: string; // a durable, specific fact about the user, in the user's terms
  at: string; // ISO timestamp it was learned
}

// An unresolved/parked thread — something the user was mid-way through or left
// hanging (a visa question they were weighing, a half-finished CV). Distinct from
// MemoryNote: memory is durable facts that never expire; an open thread is a loop
// to CLOSE — the advisor adds it when something is parked and resolves it once it's
// genuinely addressed. Stored in the same profile doc (same read/write path), kept
// invisible and advisor-managed — never a user-facing to-do list. It survives the
// chat transcript window, so the proactive return-opener can pick it up even when
// the thread scrolled out of the last ~20 turns. (Engaged-mentor build, 2026-06-29.)
export interface OpenThread {
  thread: string; // what's unresolved, phrased so it makes sense later
  at: string; // ISO timestamp it was opened
}

export interface ProfileData {
  // What this person actually wants to be called (e.g. "Lexi" when the account name
  // is "Alexandra"). Set by the advisor asking early; preferred over the signup name
  // everywhere the name is used (chat, recap). (Lexi, 2026-06-29.)
  preferredName?: string;
  values?: string[];
  selfKnowledge?: Record<string, string>;
  dealBreakers?: string[];
  salaryFloor?: number | string;
  salaryCeiling?: number | string;
  rightToWork?: string;
  aspiration?: string;
  workStyle?: { preference?: string; teamSize?: string; companyStage?: string };
  // The advisor's live read of how clear this person is on their direction. Drives
  // the directive↔non-directive dial and how soon roles surface (first-session arc
  // spec, 2026-06-24). Revisable by the advisor as the picture changes — never a
  // one-time label, never shown to the user as a label.
  directionClarity?: 'lost' | 'mixed' | 'directed';
  memory?: MemoryNote[];
  // Unresolved threads to pick back up — see OpenThread. Invisible, advisor-managed.
  openThreads?: OpenThread[];
  profileCompleteness?: number;
  // The user's CV on file — its source identity lives in Profile (decided 2026-06-22).
  // Tailored CVs / cover letters go to Documents later.
  cvFileName?: string;
  cvText?: string;
  cvUpdatedAt?: string;
  [key: string]: unknown;
}

export function calcCompleteness(p: ProfileData): number {
  let score = 0;
  if ((p.values || []).length > 0) score += 20;
  const sk = p.selfKnowledge || {};
  if ([sk.q1, sk.q2, sk.q3, sk.q4, sk.q5].some((a) => a && a.length > 0)) score += 30;
  if ((p.dealBreakers || []).length > 0) score += 10;
  if (p.salaryFloor || p.salaryCeiling) score += 10;
  if (p.rightToWork) score += 10;
  if (p.aspiration) score += 10;
  if (p.workStyle?.preference || p.workStyle?.teamSize || p.workStyle?.companyStage) score += 10;
  return Math.min(score, 100);
}

/** Read the user's profile document. Returns {} for a user with no profile yet. */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileData> {
  const { data, error } = await supabase
    .from('profiles')
    .select('data')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.data as ProfileData) || {};
}

/**
 * Shallow-merge updates into the profile and persist. Recomputes completeness.
 * Upserts on `id`, preserving the email set at signup. Returns the merged doc.
 */
export async function patchProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: ProfileData
): Promise<ProfileData> {
  const existing = await getProfile(supabase, userId);
  const merged: ProfileData = { ...existing, ...updates };
  merged.profileCompleteness = calcCompleteness(merged);

  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, data: merged, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
  if (error) throw new Error(error.message);
  return merged;
}

/**
 * Append a durable memory note, de-duplicating near-identical notes and keeping
 * the most recent 50. Memory is additive — the advisor builds up an understanding
 * over time rather than overwriting it.
 */
export async function addMemory(
  supabase: SupabaseClient,
  userId: string,
  note: string
): Promise<ProfileData> {
  const trimmed = note.trim();
  if (!trimmed) return getProfile(supabase, userId);

  const existing = await getProfile(supabase, userId);
  const memory = Array.isArray(existing.memory) ? [...existing.memory] : [];

  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  if (memory.some((m) => norm(m.note) === norm(trimmed))) {
    return existing; // already known — don't duplicate
  }

  memory.push({ note: trimmed, at: new Date().toISOString() });
  return patchProfile(supabase, userId, { memory: memory.slice(-50) });
}

const normThread = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Open (park) an unresolved thread, de-duplicating near-identical ones and keeping
 * the most recent 12. These are loops to close, not durable facts — kept few on
 * purpose so the return-opener is never met with a backlog.
 */
export async function addOpenThread(
  supabase: SupabaseClient,
  userId: string,
  thread: string
): Promise<ProfileData> {
  const trimmed = thread.trim();
  if (!trimmed) return getProfile(supabase, userId);

  const existing = await getProfile(supabase, userId);
  const threads = Array.isArray(existing.openThreads) ? [...existing.openThreads] : [];
  if (threads.some((t) => normThread(t.thread) === normThread(trimmed))) return existing;

  threads.push({ thread: trimmed, at: new Date().toISOString() });
  return patchProfile(supabase, userId, { openThreads: threads.slice(-12) });
}

/**
 * Resolve (close) an open thread once it's genuinely been picked up and dealt with.
 * Fuzzy match: removes any thread whose text overlaps the query either way, so the
 * advisor doesn't have to quote it verbatim. Returns whether anything was removed.
 */
export async function resolveOpenThread(
  supabase: SupabaseClient,
  userId: string,
  query: string
): Promise<{ profile: ProfileData; resolved: boolean }> {
  const q = normThread(query);
  if (!q) {
    const profile = await getProfile(supabase, userId);
    return { profile, resolved: false };
  }
  const existing = await getProfile(supabase, userId);
  const threads = Array.isArray(existing.openThreads) ? existing.openThreads : [];
  const next = threads.filter((t) => {
    const n = normThread(t.thread);
    return !(n.includes(q) || q.includes(n));
  });
  if (next.length === threads.length) return { profile: existing, resolved: false };
  const profile = await patchProfile(supabase, userId, { openThreads: next });
  return { profile, resolved: true };
}
