import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase';

export async function POST(request: Request) {
  const { user, supabase } = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const body = await request.json();
  const { error } = await supabase
    .from('results')
    .insert({ user_id: user.id, data: body.data });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
