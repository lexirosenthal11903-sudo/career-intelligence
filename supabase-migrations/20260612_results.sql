-- results — analysis output (profile + suggested directions). Append-only; latest row wins.
-- /api/save-result INSERTs {user_id, data}; /api/results and /api/chat read the newest by created_at.
-- This codifies a table that already exists in production; safe to re-run.
CREATE TABLE IF NOT EXISTS results (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data       jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS results_user_created_idx
  ON results (user_id, created_at DESC);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own results" ON results;
CREATE POLICY "Users manage own results"
  ON results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
