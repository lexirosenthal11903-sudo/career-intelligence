import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';
import { jsonNoStore } from '@/lib/api-response';

export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { data, error } = await supabase
    .from('results')
    .select('data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return jsonNoStore({ result: data?.data ?? null });
}
