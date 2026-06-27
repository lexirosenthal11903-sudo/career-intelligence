# Foundation Audit — 2026-06-27

_Lexi's call: before building more, confirm the current state is sound and that every standard, solved
feature follows best-practice protocol. Two lenses: (1) does it work? (2) does it match how everyone builds
this correctly? Output below is ONE prioritised list, foundation-first. Supersedes nothing; the
2026-06-22 report stays as the feature/fix backlog._

## Verdict in one line
The foundation is fundamentally sound, not rotten. Auth, data-deletion, and the rate-limit framework are
built to a professional standard. The gaps are three security/abuse items on the public endpoints, the
batch of standard-UX bugs Lexi already hit, and a few minor inconsistencies. All fixable in one pass.

---

## Tier 1 — Security / data (fix before building or sharing wider)

1. **`/api/extract` is public with NO rate limit.** It powers the pre-signup CV upload, so it can't require
   auth, but `/api/analyse`, `/api/intake` and `/api/chat` are all rate-limited and extract was missed. PDF/
   docx parsing on an unauthenticated POST is a compute-abuse vector. Fix: add `checkExtractRateLimit` (IP-
   based, mirror `checkIntakeRateLimit`).
2. **`/api/auth/check-email` has NO rate limit.** It's an email-enumeration oracle (documented tradeoff) AND
   runs an expensive `listUsers` pagination (up to 50 pages). Unrated, it's both a privacy and a load risk.
   Fix: IP rate limit. (The enumeration tradeoff itself is acceptable pre-launch; the rate limit is the
   standard mitigation.)
3. **Rate limiting fails open without Upstash env vars.** `src/lib/ratelimit.ts` allow-alls if
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` aren't set. **RESOLVED 2026-06-27: both keys ARE
   set in Vercel (Production + Preview, since Jun 11), so the limiting is live.** Memory
   `project_rate_limiting_deferred` is STALE and should be corrected — the framework is built AND switched on;
   the only remaining work is extending it to `/api/extract` and `/api/auth/check-email` (items 1-2).

## Tier 2 — Standard features that don't behave correctly (the ones you hit)

These are "everyone builds this the same correct way" UX bugs. Most overlap the outreach Slice-2 batch
already queued, so this confirms that batch and adds to it.

4. **Chat doesn't auto-scroll to your own message on send** (`useArloChat.ts:254`, `block:"nearest"` →
   `"end"`).
5. **Chat input doesn't reset its height after send** (`ChatPane.tsx:763`) — stays expanded.
6. **No working way for a logged-in user to re-upload a CV.** The composer "+" is disabled and Profile has no
   uploader (it tells you to "drop one into the conversation", which is the disabled button). Wire "+" to
   `/api/extract` + `saveCvToProfile`.
7. **Role-interest hands off without the role's details**, so the advisor re-asks for the job description it
   already holds. Quick fix: pass the role details into the handoff. Real fix: the advisor memory layer (a
   build, see roadmap). The deeper redesign (role-interest = a mentoring conversation) is the next build
   after this audit.
8. **"I'm interested → Applications" isn't obviously surfaced**, and the auto-sent message reads as if the
   user typed it. Make the save visible; make the follow-up feel like the advisor reacting.
9. **Amber "1" on the lead direction** (`workspace.module.css:414`) breaks the locked amber-only rule.
10. **"Don't scroll endlessly" hint looks like a button but isn't** (`SidePanel.tsx:275`).
11. **LinkedIn search link is useless when a person was pasted** (`advisor-tools.ts:606`).
12b. **Account control (bottom-left name/email) is sub-standard** (Lexi caught this, 2026-06-27). The text
    nearly overflows its container (needs truncation/ellipsis), and clicking it jumps straight to the Profile
    tab. The standard pattern (Linear, Notion, Slack, ChatGPT, Vercel) is a popover menu: Profile / Settings /
    Previous chats / Sign out. Already in the roadmap (account menu). Fix the overflow now; the menu is a
    small build that should follow the known pattern, not be invented.

> **Lexi's broader point (2026-06-27):** this audit checked whether what we built is correct and secure, but
> under-covered whether our UX *patterns* match how the best products solve these same problems. The account
> control is the proof. That gap is addressed by a separate **prior-art / best-in-class map** (see the
> companion doc / next session) covering every feature: is it solved elsewhere, who does it best, what to copy,
> and where our advisor differentiator goes on top. Copy-then-improve, never reinvent a solved thing.

## Tier 3 — Minor correctness / consistency

12. **`.doc` is offered by the file picker but rejected by `/api/extract`** (only pdf/docx parsed) → a user
    with a legacy `.doc` CV gets a confusing error. Remove `.doc` from `accept`, or handle it.
13. **SkillsPage cert upload input has no `onChange`** (`SkillsPage.tsx:323`) — likely a dead control;
    confirm whether that dashboard surface is still live or legacy.
14. **`/api/save-job` POST lacks the jobId/jobData validation** that `/api/applications` POST has — minor
    consistency.

---

## Confirmed sound (so we know the floor is solid)
- **Auth on every user-data route**, including those outside the middleware matcher (they self-check via
  `getAuthedUser`). No unprotected user-data endpoints found.
- **GDPR account deletion** (`/api/delete-account`): explicit per-table erase + auth-user delete, `allSettled`
  so one failure can't block the account removal. Built correctly.
- **Rate-limit framework** exists for chat (per-user) + intake/analyse (per-IP), fails open by design.
- **No debug `console.log`s, no dead `href="#"` links.**
- **Input validation + stage whitelist** on the applications API.
- **Design tokens, error/loading/empty states** present across the workspace surfaces.

## Recommended sequence
Fix Tier 1 + Tier 2 + Tier 3 as ONE batch (the foundation pass), push once, Lexi retests. Tier 1 item 3 is a
Lexi action (Vercel env). THEN design + build the role-interest mentoring redesign (the heart). Item 7's real
fix (the memory layer) lands with that redesign, with a tactical patch in this pass so the advisor stops
re-asking in the meantime.
