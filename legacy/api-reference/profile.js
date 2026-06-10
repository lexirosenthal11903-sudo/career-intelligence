// Supabase migration required:
// CREATE TABLE profiles (
//   user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
//   data JSONB NOT NULL DEFAULT '{}',
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
// ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = user_id);

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ profile: data?.data || {} });
    }

    if (req.method === 'PATCH') {
      const updates = req.body || {};

      const { data: existing } = await supabase
        .from('profiles')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      const merged = { ...(existing?.data || {}), ...updates };
      merged.profileCompleteness = calcCompleteness(merged);

      const { error } = await supabase
        .from('profiles')
        .upsert(
          { user_id: user.id, data: merged, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ profile: merged });
    }

    res.status(405).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function calcCompleteness(p) {
  let score = 0;
  if ((p.values || []).length > 0) score += 20;
  const sk = p.selfKnowledge || {};
  if ([sk.q1, sk.q2, sk.q3, sk.q4, sk.q5].some(a => a?.length > 0)) score += 30;
  if ((p.dealBreakers || []).length > 0) score += 10;
  if (p.salaryFloor || p.salaryCeiling) score += 10;
  if (p.rightToWork) score += 10;
  if (p.aspiration) score += 10;
  if (p.workStyle?.preference || p.workStyle?.teamSize || p.workStyle?.companyStage) score += 10;
  return Math.min(score, 100);
}
