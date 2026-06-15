import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';

export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { data, error } = await supabase
    .from('saved_applications')
    .select('id, job_id, job_data, stage, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data ?? [] });
}

export async function PATCH(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { jobId, stage } = await request.json();
  if (!jobId || !stage) return NextResponse.json({ error: 'jobId and stage required' }, { status: 400 });

  const VALID_STAGES = ['preparing', 'applied', 'interview', 'offer', 'archive'];
  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }

  const { error } = await supabase
    .from('saved_applications')
    .update({ stage })
    .eq('user_id', user.id)
    .eq('job_id', jobId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { jobId } = await request.json();
  const { error } = await supabase
    .from('saved_applications')
    .delete()
    .eq('user_id', user.id)
    .eq('job_id', jobId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
