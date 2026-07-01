import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';
import { jsonNoStore } from '@/lib/api-response';

/**
 * matched_jobs — the user's PERSISTED, scored job set, so listings are STABLE
 * across logins instead of re-fetching (and reshuffling) every session.
 *
 * This route is persistence ONLY. The expensive orchestration (Adzuna/Reed fetch
 * + Haiku scoring) stays client-side in usePanelJobs, as it does today, to respect
 * the Vercel Hobby function budget. The client:
 *   - GET first; if a set exists for the current keyword hash, it uses it (stable).
 *   - rebuilds + POST 'replace' only when the keyword hash changes (direction revised).
 *   - runs a once-a-day diff and POST 'add' for genuinely-new listings.
 */

const MAX_STORED = 30; // bound the stored set so a wide search can't balloon the table

export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const [{ data: rows }, { data: state }] = await Promise.all([
    supabase
      .from('matched_jobs')
      .select('job_data, relevance_score, is_new, first_seen')
      .eq('user_id', user.id)
      .order('is_new', { ascending: false })
      .order('relevance_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('job_match_state')
      .select('keyword_hash, last_refreshed')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  // Fold the stored is_new flag onto the job object the client renders.
  const jobs = (rows || []).map((r) => ({
    ...(r.job_data as Record<string, unknown>),
    isNew: r.is_new ?? false,
  }));

  return jsonNoStore({
    jobs,
    keywordHash: state?.keyword_hash ?? null,
    lastRefreshed: state?.last_refreshed ?? null,
  });
}

interface IncomingJob {
  id: string | number;
  relevanceScore?: number;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let body: { action?: string; keywordHash?: string; jobs?: IncomingJob[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const { action, keywordHash, jobs } = body;

  const toRows = (list: IncomingJob[], isNew: boolean) =>
    list.slice(0, MAX_STORED).map((job) => ({
      user_id: user.id,
      keyword_hash: keywordHash || '',
      job_id: String(job.id),
      job_data: job,
      relevance_score: typeof job.relevanceScore === 'number' ? job.relevanceScore : null,
      is_new: isNew,
    }));

  // Fresh keyword set: wipe and rebuild. Old listings are no longer relevant.
  if (action === 'replace') {
    if (!keywordHash || !Array.isArray(jobs)) {
      return NextResponse.json({ error: 'replace needs keywordHash + jobs' }, { status: 400 });
    }
    const del = await supabase.from('matched_jobs').delete().eq('user_id', user.id);
    if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

    if (jobs.length) {
      const ins = await supabase.from('matched_jobs').insert(toRows(jobs, false));
      if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }
    const up = await supabase.from('job_match_state').upsert(
      { user_id: user.id, keyword_hash: keywordHash, last_refreshed: new Date().toISOString(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Daily pass: add genuinely-new listings (deduped), mark them new, stamp the run.
  if (action === 'add') {
    if (Array.isArray(jobs) && jobs.length) {
      const ins = await supabase
        .from('matched_jobs')
        .upsert(toRows(jobs, true), { onConflict: 'user_id,job_id', ignoreDuplicates: true });
      if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }
    const up = await supabase
      .from('job_match_state')
      .update({ last_refreshed: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // The daily diff found nothing new — just stamp the run so we don't re-run all day.
  if (action === 'touch') {
    const up = await supabase
      .from('job_match_state')
      .update({ last_refreshed: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // User has seen the new roles — clear the badges.
  if (action === 'seen') {
    const up = await supabase
      .from('matched_jobs')
      .update({ is_new: false })
      .eq('user_id', user.id)
      .eq('is_new', true);
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
