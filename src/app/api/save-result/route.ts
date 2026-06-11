import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();
  const { error } = await supabase
    .from('results')
    .insert({ user_id: user.id, data: body.data });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
