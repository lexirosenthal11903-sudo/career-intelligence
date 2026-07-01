-- outreach table — persists a drafted outreach message per role, plus the user's
-- self-reported status (to_send → sent → replied / no_reply) so the advisor can
-- own a single, gentle follow-up. One row per (user, role): drafting again updates it.
-- GDPR posture: we store the USER'S OWN drafted message and a by-role search link.
-- We NEVER store a named third party or their contact details (same guardrail as the
-- draft_outreach tool). person_type is a role descriptor ("a PM one to three years
-- ahead"), not a real person. Run in Supabase dashboard → SQL Editor.

CREATE TABLE IF NOT EXISTS outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,                -- roleKey(title, company): lowercased "title|company"
  role_title TEXT NOT NULL,
  company TEXT,
  person_type TEXT,                      -- who to approach, by role (never a named person)
  search_url TEXT,
  subject TEXT,
  message TEXT NOT NULL,                 -- the drafted message (the user's own words)
  follow_up TEXT,                        -- the one-line follow-up
  status TEXT NOT NULL DEFAULT 'to_send',-- to_send | sent | replied | no_reply
  sent_at TIMESTAMPTZ,                   -- set when marked 'sent' — drives follow-up timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role_key)
);

ALTER TABLE outreach ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own outreach"
  ON outreach
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
