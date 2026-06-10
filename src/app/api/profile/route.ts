// Supabase table (already exists in production):
// CREATE TABLE profiles (
//   user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
//   data JSONB NOT NULL DEFAULT '{}',
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
// RLS enabled: users manage own profile.

import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase';

interface ProfileData {
  values?: string[];
  selfKnowledge?: Record<string, string>;
  dealBreakers?: string[];
  salaryFloor?: number | string;
  salaryCeiling?: number | string;
  rightToWork?: string;
  aspiration?: string;
  workStyle?: { preference?: string; teamSize?: string; companyStage?: string };
  profileCompleteness?: number;
  [key: string]: unknown;
}

function calcCompleteness(p: ProfileData): number {
  let score = 0;
  if ((p.values || []).length > 0) score += 20;
  const sk = p.selfKnowledge || {};
  if ([sk.q1, sk.q2, sk.q3, sk.q4, sk.q5].some((a) => a && a.length > 0)) score += 30;
  if ((p.dealBreakers || []).length > 0) score += 10;
  if (p.salaryFloor || p.salaryCeiling) score += 10;
  if (p.rightToWork) score += 10;
  if (p.aspiration) score += 10;
  if (p.workStyle?.preference || p.workStyle?.teamSize || p.workStyle?.companyStage) score += 10;
  return Math.min(score, 100);
}

export async function GET(request: Request) {
  const { user, supabase } = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { data, error } = await supabase
    .from('profiles')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data?.data || {} });
}

export async function PATCH(request: Request) {
  const { user, supabase } = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const updates: ProfileData = (await request.json()) || {};

  const { data: existing } = await supabase
    .from('profiles')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();

  const merged: ProfileData = { ...(existing?.data || {}), ...updates };
  merged.profileCompleteness = calcCompleteness(merged);

  const { error } = await supabase.from('profiles').upsert(
    { user_id: user.id, data: merged, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: merged });
}
