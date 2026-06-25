import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ documents: [] });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  let query = supabase
    .from('documents')
    .select('id, job_id, type, content, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (jobId) query = query.eq('job_id', jobId);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] });
}
