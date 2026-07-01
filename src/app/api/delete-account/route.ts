import { NextResponse } from 'next/server';
import { getAuthedUser, serviceClient } from '@/lib/supabase/server';

export async function DELETE() {
  const { user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const admin = serviceClient();

  // Delete all user data in parallel before removing the auth user.
  // FK cascade on auth.users would cover these, but we erase explicitly so GDPR
  // deletion never depends on the cascade being correctly configured in prod.
  // allSettled, not all: one table delete failing (e.g. a migration not yet run in
  // this environment) must NOT block removing the auth user. GDPR deletion of the
  // account itself is the non-negotiable; the FK cascade on auth.users also covers
  // these rows as a backstop.
  await Promise.allSettled([
    // profiles is keyed by `id` (= the auth user id), not user_id.
    admin.from('profiles').delete().eq('id', user.id),
    admin.from('results').delete().eq('user_id', user.id),
    admin.from('saved_jobs').delete().eq('user_id', user.id),
    admin.from('saved_applications').delete().eq('user_id', user.id),
    admin.from('conversations').delete().eq('user_id', user.id),
    admin.from('matched_jobs').delete().eq('user_id', user.id),
    admin.from('job_match_state').delete().eq('user_id', user.id),
    admin.from('recaps').delete().eq('user_id', user.id),
    // tailored CVs + cover letters. The FK has on-delete-cascade, but we erase
    // explicitly too so GDPR deletion never depends on the cascade (same rule as above).
    admin.from('documents').delete().eq('user_id', user.id),
    // drafted outreach messages + their status. Same explicit-erase rule as above.
    admin.from('outreach').delete().eq('user_id', user.id),
  ]);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
