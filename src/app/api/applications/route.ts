import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';

export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { data, error } = await supabase
    .from('saved_applications')
    .select('id, job_id, job_data, stage, notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data ?? [] });
}

export async function POST(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { jobId, jobData } = await request.json();
  if (!jobId || !jobData) return NextResponse.json({ error: 'jobId and jobData required' }, { status: 400 });

  const { error } = await supabase
    .from('saved_applications')
    .upsert(
      { user_id: user.id, job_id: jobId, job_data: jobData, stage: 'saved' },
      { onConflict: 'user_id,job_id' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { jobId, stage, notes } = await request.json();
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  if (stage === undefined && notes === undefined) {
    return NextResponse.json({ error: 'stage or notes required' }, { status: 400 });
  }

  const update: { stage?: string; notes?: string } = {};
  if (stage !== undefined) {
    const VALID_STAGES = ['saved', 'preparing', 'applied', 'interview', 'offer', 'rejected', 'archive'];
    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }
    update.stage = stage;
  }
  if (notes !== undefined) update.notes = String(notes);

  const { error } = await supabase
    .from('saved_applications')
    .update(update)
    .eq('user_id', user.id)
    .eq('job_id', jobId);

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
    .from('saved_applications')
    .delete()
    .eq('user_id', user.id)
    .eq('job_id', jobId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
