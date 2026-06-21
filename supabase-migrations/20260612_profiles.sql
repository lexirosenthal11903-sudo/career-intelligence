-- profiles — one row per user, keyed by `id` (= auth.users.id). Created in
-- production as an auth mirror (id, email, created_at), NOT the rich profile the
-- code currently expects. Verified against the live DB in Session 40.
--
-- ⚠️ MISMATCH (Step 1 to resolve): /api/profile reads/writes `user_id` and a
-- `data` jsonb column that DO NOT EXIST here. The profile feature is therefore
-- broken in production. Decide in Step 1 whether to add `data jsonb` to this
-- table (and switch the code to key on `id`) or migrate to a user_id/data shape.
--
-- This migration codifies the table AS IT REALLY IS and enables RLS. Idempotent.
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
