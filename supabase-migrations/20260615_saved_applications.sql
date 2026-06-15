-- saved_applications table
-- Run in Supabase dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS saved_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  job_data JSONB NOT NULL,
  stage TEXT NOT NULL DEFAULT 'preparing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE saved_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own applications"
  ON saved_applications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
