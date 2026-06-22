-- saved_applications.notes — the "write a note" box on the saved-job detail view
-- (J&J-style tracked-job page). One free-text note per saved application. Idempotent.
ALTER TABLE saved_applications ADD COLUMN IF NOT EXISTS notes text;
