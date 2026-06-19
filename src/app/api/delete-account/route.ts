import { NextResponse } from 'next/server';
import { getAuthedUser, serviceClient } from '@/lib/supabase/server';

export async function DELETE() {
  const { user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const admin = serviceClient();

  // Delete all user data in parallel before removing the auth user
  await Promise.all([
    admin.from('results').delete().eq('user_id', user.id),
    admin.from('saved_jobs').delete().eq('user_id', user.id),
    admin.from('saved_applications').delete().eq('user_id', user.id),
    admin.from('conversations').delete().eq('user_id', user.id),
  ]);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
