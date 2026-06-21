-- profiles — one row per user; the evolving model of the user (values, self-knowledge, etc.)
-- Keyed by user_id (NOT id). All reads/writes in /api/profile and /api/chat use user_id.
-- This codifies a table that already exists in production; safe to re-run.
CREATE TABLE IF NOT EXISTS profiles (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data       jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
