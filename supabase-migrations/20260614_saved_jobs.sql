-- saved_jobs — jobs the user has marked interested. One row per (user, job).
-- /api/save-job UPSERTs on (user_id, job_id); GET returns job_data newest-first.
-- This codifies a table that already exists in production; safe to re-run.
CREATE TABLE IF NOT EXISTS saved_jobs (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id     text NOT NULL,
  job_data   jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saved jobs" ON saved_jobs;
CREATE POLICY "Users manage own saved jobs"
  ON saved_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
