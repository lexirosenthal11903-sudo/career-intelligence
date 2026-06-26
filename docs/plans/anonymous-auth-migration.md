# Plan — Anonymous-auth migration (the sign-up carry-forward fix)

_Status: DRAFT for Lexi's approval (2026-06-26). Do not build until approved. Owner: Claude (Opus).
Grounded in the official Supabase Anonymous Sign-Ins docs (verified 2026-06-26)._

## Why
Today a visitor uses the product before signing up. Their CV + conversation + directions are held in the
browser (sessionStorage) and saved to the server only via fire-and-forget calls that 401 while they are
not signed in. On in-place sign-up nothing reliably persists those to the new account (root cause in
`AUDIT-REPORT-2026-06-22.md` → "Live-test feedback" A/B): the advisor opens against an empty account and
treats a just-signed-up user as a stranger ("no CV on file, no directions set").

This is a solved, standard problem (deferred / "lazy" registration). Supabase ships it natively, so we
replace our brittle custom bridge with the platform feature. **Hard constraint (Lexi): keep the
no-commitment, try-before-signup flow exactly as it feels now.** This pattern keeps it.

## The pattern (verified mechanics)
1. **On first landing, silently call `supabase.auth.signInAnonymously()`.** The visitor now has a REAL
   user id (with `is_anonymous: true`). They see no login wall.
2. **Everything saves server-side to that real id from second one** — CV (profile), analysis result
   (results), directions, saved jobs. No sessionStorage bridge, no 401s, no fire-and-forget.
3. **On sign-up, attach the email to the SAME account** with `supabase.auth.updateUser({ email })`.
   Supabase sends a 6-digit OTP; the user enters it **in place** (no navigation), then we set a password /
   complete. Because it is the same account, nothing is "carried forward" — it was always there. The
   in-place OTP also avoids the email-confirmation context switch that lost the last message.
4. **OAuth (Google) sign-up:** `supabase.auth.linkIdentity()` links Google to the existing anon account.

## What this lets us delete (less code, less fragility)
- The `pending-cv` sessionStorage bridge (`src/lib/cv.ts`: `stashCv` / `flushPendingCv` and its callers).
- The `analysis-result` sessionStorage handoff used to reconcile a just-signed-up user
  (`useResolvedVariant` save-result-on-"resolve" in `WorkspaceShell.tsx`; the `firstSessionThread` stash).
- The variant gymnastics that race the advisor's first context build. The advisor reads the same real
  account the whole time.

## Build steps (all on `staging`)
1. **Lexi (dashboard):** enable **Anonymous Sign-Ins** (off by default) in Supabase Auth settings, and turn
   on **CAPTCHA / Cloudflare Turnstile** + confirm the IP rate limit (default 30/hr) — abuse protection so
   bots can't inflate the user table. _(Exact click-path provided when we start.)_
2. Create the anon session on entry (a small client bootstrap): if no session, `signInAnonymously()`.
3. Point the existing input/first-session writes at the authed (anon) user — remove the 401 fire-and-forget
   pattern; they are now normal authed writes.
4. Replace the sign-up step with `updateUser({ email })` + in-place OTP (reuse the existing in-place OTP UI
   in `ChatPane.handleAuthed`), and `linkIdentity()` for Google.
5. Delete the sessionStorage bridge + variant reconciliation code listed above.
6. **RLS:** both anon + permanent users are the `authenticated` role; our policies already filter by
   `user_id`, so they keep working. Add `is_anonymous` awareness only where we want to gate a feature
   behind a real account (e.g. don't email an anonymous user).
7. **Abandoned-account cleanup:** a scheduled job (Supabase `pg_cron` or a Vercel cron) deletes
   `auth.users where is_anonymous is true and created_at < now() - interval '30 days'`, plus their rows.
   Fold into / reuse the existing delete-account erase list. (Data-minimisation requirement.)
8. **Privacy + consent:** add a line to the privacy notice that we begin processing data before an account
   is created; confirm cookie consent covers the anon auth token. (Rides the pre-launch privacy work.)

## GDPR / legal (the obligations, not blockers)
- Anonymous account data is still personal data → privacy notice must cover pre-account processing.
- 30-day auto-deletion of abandoned anon accounts = storage-limitation / minimisation.
- CAPTCHA + rate limit = abuse / cost control.
- Definitive sign-off rides the existing solicitor question (contact-discovery). The pattern itself is
  mainstream (Figma/Notion/Canva-style try-before-signup; Supabase + Firebase ship it).

## Risks & mitigations
- **Anon-user sprawl / cost** → CAPTCHA + rate limit + 30-day cleanup.
- **Same-browser only** (anon session won't follow them to another device until they sign up) → acceptable
  and expected for try-before-signup; signing up is what makes it portable.
- **Migration regressions** → do it as its own slice with the existing eval + e2e mock + a manual full-flow
  re-test (input → use → sign-up → advisor knows them). Keep the old path until the new one is verified.

## Done = 
A visitor can use the product with no sign-up, then sign up, and the advisor opens already knowing their
CV, directions, and the last thing they said — with no sessionStorage bridge in the codebase.
