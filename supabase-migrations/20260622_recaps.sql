-- "Where we got to" recap — the returning-session continuity card (Kavanah).
-- One row per user: the generated recap + the conversation length it was built from,
-- so the API can serve the cached recap and only regenerate when the conversation
-- has actually moved on. Voice/structure: VOICE-IN-UI.md §3.
CREATE TABLE IF NOT EXISTS recaps (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  recap         jsonb NOT NULL,
  message_count integer NOT NULL DEFAULT 0,
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recaps"
  ON recaps FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
