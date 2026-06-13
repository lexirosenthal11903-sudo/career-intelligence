-- Arlo conversation history — one row per (user, page)
-- Pages: home | roles | skills | applications
CREATE TABLE IF NOT EXISTS conversations (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page       text NOT NULL,
  messages   jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, page)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
