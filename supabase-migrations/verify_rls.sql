-- RLS verification — run in Supabase → SQL Editor.
-- Expectation: all 5 tables report rowsecurity = true AND have >= 1 policy.

-- 1. Is row-level security enabled on every app table?
SELECT c.relname  AS table_name,
       c.relrowsecurity AS rls_enabled
FROM   pg_class c
JOIN   pg_namespace n ON n.oid = c.relnamespace
WHERE  n.nspname = 'public'
AND    c.relname IN (
         'profiles', 'results', 'conversations',
         'saved_jobs', 'saved_applications'
       )
ORDER  BY c.relname;
-- PASS = every row's rls_enabled is true.

-- 2. Does every table have at least one policy?
SELECT tablename, COUNT(*) AS policy_count
FROM   pg_policies
WHERE  schemaname = 'public'
AND    tablename IN (
         'profiles', 'results', 'conversations',
         'saved_jobs', 'saved_applications'
       )
GROUP  BY tablename
ORDER  BY tablename;
-- PASS = 5 rows, each policy_count >= 1.
-- If a table is MISSING from this result, it has RLS on but NO policy
-- (everything denied) OR RLS off (everything allowed) — cross-check with query 1.
