-- saved_jobs — jobs the user marked interested. Verified against the live DB in
-- Session 40: real columns are id, user_id, result_id, job_id, job_data, created_at.
-- /api/save-job UPSERTs on (user_id, job_id); GET returns job_data newest-first.
-- This codifies the table as it really is and enables RLS. Idempotent.
CREATE TABLE IF NOT EXISTS saved_jobs (
  id         uuid DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result_id  uuid,
  job_id     text NOT NULL,
  job_data   jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saved jobs" ON saved_jobs;
CREATE POLICY "Users manage own saved jobs"
  ON saved_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
