// /api/profile — read and update the user's structured profile.
// Backed by the `profiles` table, keyed by `id` (= auth.users.id), per the live
// DB and supabase-migrations/20260612_profiles.sql. All table access goes through
// src/lib/profile.ts so the route, the chat context, and the advisor's tools
// share one source of truth.

import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';
import { getProfile, patchProfile, type ProfileData } from '@/lib/profile';
import { jsonNoStore } from '@/lib/api-response';

export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const profile = await getProfile(supabase, user.id);
    return jsonNoStore({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const updates: ProfileData = (await request.json().catch(() => ({}))) || {};

  try {
    const profile = await patchProfile(supabase, user.id, updates);
    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
