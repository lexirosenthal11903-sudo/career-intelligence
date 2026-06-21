# Supabase migrations — source of truth for the data model

These files codify the **5 tables** the product depends on. Several already exist in
production (created by hand in earlier sessions); the migrations are written to be
**idempotent** (`CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS` before
`CREATE POLICY`) so they are safe to run against the live database without data loss.

No Supabase CLI is configured. **To apply:** open Supabase → SQL Editor → paste a file →
Run. Run them in filename order.

## The 5 tables

| Table                | Key                  | RLS | Migration |
|----------------------|----------------------|-----|-----------|
| `profiles`           | `id` (PK = auth uid) | ✓   | `20260612_profiles.sql` |
| `results`            | `id` (PK), `user_id` | ✓   | `20260612_results.sql` |
| `conversations`      | `(user_id, page)`    | ✓   | `20260613_conversations.sql` |
| `saved_jobs`         | `user_id`, `job_id` (unique) | ✓ | `20260614_saved_jobs.sql` |
| `saved_applications` | `id` (PK), `user_id` | ✓   | `20260615_saved_applications.sql` |

Every table references `auth.users(id) ON DELETE CASCADE`, so deleting an auth user
cascades to all of their rows. `/api/delete-account` *also* deletes each table
explicitly (belt-and-braces) — see `verify_rls.sql` note on GDPR.

> **Doc-vs-code-vs-DB note (Session 40):** the LIVE DB is the source of truth and it
> settled this. `profiles` really is keyed by `id` (= auth uid) and only has
> `id, email, created_at` — **no `user_id`, no `data` column.** But `/api/profile`
> (and parts of `/api/chat`) query `user_id` + `data`, so the profile feature is
> **broken in production**. Step 1 must reconcile this: either add `data jsonb` to
> `profiles` and key the code on `id`, or migrate the table to a `user_id`/`data`
> shape. Until then, RLS on `profiles` is keyed on `id`.

## Verifying RLS

Run `verify_rls.sql` in the SQL Editor. Every table must report `rowsecurity = true`
and have at least one policy. If any row shows `false`, that table is readable across
users — fix before any real user signs up.
