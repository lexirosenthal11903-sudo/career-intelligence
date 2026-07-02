// Prep auto-saves, never auto-advances (SPEC — "one record, two lenses").
//
// A preparation action on a live role — tailoring a CV, writing a cover letter,
// drafting outreach — must have the application record exist so the work lives
// somewhere. This creates it at stage 'saved' if the role isn't already tracked,
// and does NOTHING if it is (never resets an existing stage — only a real apply
// event advances). The write mirrors the "I'm interested" dual-write exactly:
// saved_jobs carries the feed status the nav + Live-roles badge read, and
// saved_applications carries the board stage.
//
// Server-only (needs the authed Supabase client); the pure "does it already
// exist" decision lives in role-key.ts (applicationExistsFor) so it unit-tests.

import type { SupabaseClient } from '@supabase/supabase-js';
import { applicationExistsFor } from '@/lib/role-key';

export interface EnsureApplicationInput {
  jobId: string;
  title: string;
  company?: string | null;
  description?: string | null;
  url?: string | null;
  source?: string; // 'advisor' (chat prep) or the surface that triggered it
}

/**
 * Ensure a saved application exists for this role, at stage 'saved'. Returns
 * whether a new record was created (false = it was already tracked, untouched).
 * Best-effort: a failure here must never fail the prep action that called it.
 */
export async function ensureApplicationSaved(
  supabase: SupabaseClient,
  userId: string,
  input: EnsureApplicationInput
): Promise<{ created: boolean }> {
  const { jobId, title } = input;
  if (!jobId || !title) return { created: false };
  const company = input.company?.trim() || '';

  try {
    // Read the user's applications and match by job_id OR roleKey, so a role
    // already saved under a live-listing id (UI "I'm interested") isn't
    // duplicated under a synthetic chat-<slug> id (advisor prep), and vice versa.
    const { data: apps } = await supabase
      .from('saved_applications')
      .select('job_id, job_data')
      .eq('user_id', userId);
    if (applicationExistsFor(apps ?? [], jobId, title, company)) {
      return { created: false };
    }

    const jobData = {
      job_id: jobId,
      title,
      company: company || undefined,
      description: input.description || undefined,
      url: input.url || undefined,
      source: input.source || 'advisor',
      // The nav "Recent"/count and the Live-roles "In Applications" badge read
      // saved_jobs.job_data.status === 'interested' — match the UI save's shape.
      status: 'interested',
    };

    // saved_jobs: what the advisor knows it has saved + the feed status.
    await supabase
      .from('saved_jobs')
      .upsert({ user_id: userId, job_id: jobId, job_data: jobData }, { onConflict: 'user_id,job_id' });
    // saved_applications: the board record, started at 'saved' (not applied yet).
    await supabase
      .from('saved_applications')
      .upsert({ user_id: userId, job_id: jobId, job_data: jobData, stage: 'saved' }, { onConflict: 'user_id,job_id' });

    return { created: true };
  } catch {
    // A sync miss must never fail the prep action the user actually asked for.
    return { created: false };
  }
}
