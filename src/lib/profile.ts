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

export interface ProfileData {
  values?: string[];
  selfKnowledge?: Record<string, string>;
  dealBreakers?: string[];
  salaryFloor?: number | string;
  salaryCeiling?: number | string;
  rightToWork?: string;
  aspiration?: string;
  workStyle?: { preference?: string; teamSize?: string; companyStage?: string };
  memory?: MemoryNote[];
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
