-- One-time reconcile: re-home orphaned documents onto their role's canonical application id.
--
-- THE BUG THIS FIXES: the advisor's tailor_cv / write_cover_letter tools used to file a
-- document under a freshly-minted synthetic id `chat-<slug(title)>-<slug(company)>`, even
-- when the role was already tracked in saved_applications under a real live-listing id
-- (from a UI "I'm interested" save). The Applications detail view fetches a role's documents
-- by the application's own job_id, so a document filed under the chat-<slug> id never
-- appeared under the job — while the Documents tab (which lists ALL documents, unfiltered)
-- still showed it. Result: "there's a CV in Documents but nothing under the job."
--
-- The code fix (advisor-tools.ts + save-application.ts) stops NEW orphans by filing every
-- document under the role's canonical id. This migration heals documents already orphaned.
-- It leaves NO residual runtime behaviour — a plain one-off data reconcile, idempotent.
--
-- Run in Supabase dashboard → SQL Editor.

-- ── Diagnostic (optional): see which documents will move, before you run the fix ──────────
-- select d.id, d.type, d.job_id as current_id, a.job_id as canonical_id,
--        d.metadata->>'jobTitle' as title, d.metadata->>'jobCompany' as company
-- from documents d
-- join saved_applications a
--   on a.user_id = d.user_id
--  and a.job_id not like 'chat-%'                       -- canonical = the real listing id
--  and lower(trim(d.metadata->>'jobTitle'))  = lower(trim(a.job_data->>'title'))
--  and coalesce(lower(trim(d.metadata->>'jobCompany')),'') = coalesce(lower(trim(a.job_data->>'company')),'')
-- where d.job_id like 'chat-%' and d.job_id <> a.job_id;

-- ── Step 1: drop any orphan that would collide with a document already under the canonical
--    id for the same (user, role, type). Rare (would need both a chat-<slug> AND a real-id
--    document of the same type for one role), but this keeps Step 2 from violating the
--    documents_user_job_type_idx unique index. We keep the canonical-id copy.
delete from documents d
using saved_applications a, documents canonical
where d.user_id = a.user_id
  and d.job_id like 'chat-%'
  and a.job_id not like 'chat-%'
  and d.job_id <> a.job_id
  and lower(trim(d.metadata->>'jobTitle'))  = lower(trim(a.job_data->>'title'))
  and coalesce(lower(trim(d.metadata->>'jobCompany')),'') = coalesce(lower(trim(a.job_data->>'company')),'')
  and canonical.user_id = a.user_id
  and canonical.job_id  = a.job_id
  and canonical.type    = d.type;

-- ── Step 2: re-point the remaining orphaned documents onto the role's canonical id ────────
update documents d
set job_id = a.job_id
from saved_applications a
where d.user_id = a.user_id
  and d.job_id like 'chat-%'
  and a.job_id not like 'chat-%'
  and d.job_id <> a.job_id
  and lower(trim(d.metadata->>'jobTitle'))  = lower(trim(a.job_data->>'title'))
  and coalesce(lower(trim(d.metadata->>'jobCompany')),'') = coalesce(lower(trim(a.job_data->>'company')),'');

-- ── Diagnostic (optional): duplicate application rows for the same role (a separate, older
--    edge from before the dedupe guard). If this returns rows we handle them deliberately,
--    not blindly, because stage/notes/outreach would need merging. Reported to the parking lot.
-- select lower(trim(job_data->>'title')) as title,
--        coalesce(lower(trim(job_data->>'company')),'') as company,
--        count(*), array_agg(job_id)
-- from saved_applications group by 1,2 having count(*) > 1;
