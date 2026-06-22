-- matched_jobs — the user's PERSISTED, scored job set so listings are STABLE across
-- logins (they no longer reshuffle every session). Built once per keyword set; only
-- rebuilt when the direction/keywords change. A daily pass adds is_new rows for
-- genuinely-new listings. Companion state table tracks the active keyword_hash and
-- when we last ran the daily detection. Idempotent.
--
-- Orchestration (fetch Adzuna/Reed + Haiku scoring) stays client-side as today
-- (Vercel Hobby budget); this layer is persistence only. Written via /api/matched-jobs.

CREATE TABLE IF NOT EXISTS matched_jobs (
  id              uuid DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword_hash    text NOT NULL,            -- which keyword set this row belongs to
  job_id          text NOT NULL,            -- source job id (stable dedupe key)
  job_data        jsonb NOT NULL,           -- full scored PanelJob (incl. score + reason)
  relevance_score int,
  is_new          boolean DEFAULT false,    -- surfaced as "new" by the last daily pass
  first_seen      timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE matched_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own matched jobs" ON matched_jobs;
CREATE POLICY "Users manage own matched jobs"
  ON matched_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- One row per user: the keyword set their stored jobs were built for, and when the
-- daily new-roles detection last ran (so we only run it once per 24h).
CREATE TABLE IF NOT EXISTS job_match_state (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword_hash   text NOT NULL,
  last_refreshed timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE job_match_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own job match state" ON job_match_state;
CREATE POLICY "Users manage own job match state"
  ON job_match_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
