import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';
import { getProfile } from '@/lib/profile';

export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { data, error } = await supabase
    .from('saved_jobs')
    .select('job_id, job_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // The board (saved_applications) is the source of truth for outcomes. A role whose
  // application is CLOSED (rejected/archive) must not appear in Live roles or wear the
  // "In Applications" badge, both of which read this status. set_application_stage syncs
  // saved_jobs going forward, but we also reconcile on READ so roles closed BEFORE that
  // fix (or via any other path) self-heal: force their status to 'passed' here. Matched
  // by the shared job_id the two tables use.
  const { data: apps } = await supabase
    .from('saved_applications')
    .select('job_id, stage')
    .eq('user_id', user.id);
  const closedJobIds = new Set(
    (apps ?? []).filter((a) => a.stage === 'rejected' || a.stage === 'archive').map((a) => a.job_id)
  );
  const jobs = (data || []).map((r) => {
    const jd = (r.job_data ?? {}) as Record<string, unknown>;
    if (closedJobIds.has(r.job_id) && jd.status !== 'passed') return { ...jd, status: 'passed' };
    return jd;
  });

  // hiddenRoles: roles the user told the advisor aren't for them — the Live-roles feed
  // filters these out by exact title+company (item-level suppression).
  const profile = await getProfile(supabase, user.id);
  return NextResponse.json({
    jobs,
    hiddenRoles: Array.isArray(profile.hiddenRoles) ? profile.hiddenRoles : [],
  });
}

export async function POST(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let jobId: unknown, jobData: unknown;
  try {
    ({ jobId, jobData } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!jobId || !jobData) {
    return NextResponse.json({ error: 'jobId and jobData required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('saved_jobs')
    .upsert(
      { user_id: user.id, job_id: jobId, job_data: jobData },
      { onConflict: 'user_id,job_id' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let jobId: unknown;
  try {
    ({ jobId } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('user_id', user.id)
    .eq('job_id', jobId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
