-- profiles — one row per user, keyed by `id` (= auth.users.id). Created in
-- production as an auth mirror (id, email, created_at). Verified against the live
-- DB in Session 40.
--
-- RESOLVED (Step 1, Session 41): /api/profile and /api/chat previously read/wrote
-- a non-existent `user_id` + `data` shape, so the profile feature silently failed
-- AND the advisor never loaded what the user values. Fix: keep the live `id` key
-- (RLS + delete-account already use it) and ADD the `data jsonb` the code needs,
-- rather than migrating the primary key. The code now keys on `id`. This is also
-- where advisor memory lives — `data` accumulates an evolving model of the user.
--
-- This migration codifies the table and is idempotent (safe to re-run on the live DB).
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  created_at timestamptz DEFAULT now()
);

-- Columns the application requires. ADD COLUMN IF NOT EXISTS is idempotent, so
-- this brings the existing production table up to shape without dropping it.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data       jsonb       NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
