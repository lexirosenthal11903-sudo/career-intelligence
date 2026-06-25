import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';

export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ documents: [] });

  const { data, error } = await supabase
    .from('documents')
    .select('id, job_id, type, content, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] });
}
