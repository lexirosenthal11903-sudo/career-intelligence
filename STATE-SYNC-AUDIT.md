# State-Sync Audit — advisor vs. what's on screen (2026-06-29, Session 44b)

> **Why this exists:** Lexi kept catching the advisor saying things that didn't match the screen (stale role
> status, phantom offers, wrong name, wrong time). Each was patched as a symptom. This is the ONE comprehensive
> sweep of the whole class, so we fix it structurally instead of reactively. Investigation only; no code changed
> when it was written. Build plan + tests at the bottom.

## Root cause (one sentence)
There are **four stores for "what role am I dealing with"** (`saved_jobs`, `saved_applications`, `matched_jobs`,
`results.data.profile`), each surface and each advisor read-path picks a different subset keyed on a different id
(real Adzuna/Reed listing id vs synthetic `chat-<slug>` id), and there is **no single authoritative "user state"
both the advisor and the UI derive from**. Everything below is a symptom of that.

## The divergences (severity, what drifts, the fix)

1. **HIGH — advisor-saved role never gets the badge on the matching live listing.** `save_job` mints
   `job_id = chat-<slug>` (`advisor-tools.ts`), the "In Applications" badge matches on the live numeric `job.id`
   (`SidePanel.tsx`). Id spaces never intersect, so the same job shows as both saved and not-saved. _Fix: stop
   minting synthetic ids; join on `roleKey(title,company)`._
2. **HIGH — a rejected direction stays on the Direction page.** `update_direction(rejected)` writes only
   `profiles.directionFeedback`; `DirectionView` + the role matcher read `suggestedDirections` and never apply
   feedback. Advisor says "set aside", user still sees it, roles still matched to it. _Fix: one read model that
   applies feedback (filter rejected), or merge the two write paths._
3. **HIGH — `preferredName` is never shown in the UI.** Advisor + recap say "Lexi" (preferredName), but the nav
   and Profile view display `full_name` ("Alexandra"). The product visibly contradicts the advisor about the
   user's own name. _Fix: one resolved display name (`preferredName ?? firstName(full_name)`) every surface reads;
   add a deterministic name backstop to recap like `stripDashes`._
4. **HIGH — board context hidden when `saved_jobs` is empty.** The "real board" block in `buildUserContext`
   (`chat/route.ts`) is nested under `if (jobs?.length)`. If applications exist but `saved_jobs` is empty, the
   advisor sees no board at all and can confabulate. _Fix: make `saved_applications` the unconditional spine._
5. **HIGH — salary is invisible in the UI but spoken by the advisor.** Advisor knows/uses `salaryFloor/Ceiling`
   and says "you already told me this", but no live surface shows it and the legacy dashboard salary inputs don't
   persist. User can't see or correct it. _Fix: surface salary in Profile, reading the same store._
6. **HIGH (trust) — expired / closed live listings keep showing.** `matched_jobs` is served verbatim with no
   liveness check; Reed `expirationDate` and Adzuna age aren't enforced. The advisor tailors CVs and drafts
   outreach for dead adverts. _Fix: NEEDS NEW DATA — a periodic liveness re-check by id; can't be reconciled
   locally._
7. **MED — chat and recap compute the board with two separate formatters** (duplicated `STAGE_WORDS`, already
   differing). _Fix: one shared `formatBoard()`._
8. **MED — stale recap cache on board edits via the UI.** The advisor tool busts the recap cache, but a stage
   change via the board UI (`/api/applications` PATCH) does not. _Fix: bust on every board write._
9. **MED — `hide_role_from_live` company-spelling mismatch** ("Deloitte LLP" vs "Deloitte") leaves a role the
   user rejected still showing. _Fix: consistent company normalisation in the shared `roleKey`._
10. **MED — advisor memory notes shown but not editable.** A confabulated/stale note is visible AND re-fed into
    context every turn, compounding. _Fix: edit/delete affordance._
11. **MED — time-of-day is prompt-only.** The "never assume morning/tonight" rule (just added) has no
    deterministic backstop and no real clock. _Fix: inject local time, or a sanitiser for time phrases._
12. **MED — document id keying mismatch** (advisor `chat-<slug>` vs side-panel live `job.id`) → same role can
    produce two document rows; per-job lookup misses the advisor's. Same root as #1.
13. **LOW — `update_profile` replaces list fields** (values/dealBreakers); a partial call silently drops the rest.
14. **LOW — non-atomic dual-writes** (`saved_jobs` + `saved_applications`) can half-fail; a same-user two-surface
    edit can clobber a JSON field.

## The fix: one source of truth + deterministic backstops + a drift test

**A. `assembleUserState(supabase, userId)`** in `src/lib/` returns ONE typed object both the advisor context and
every surface derive from:
```
UserState = {
  displayName,             // preferredName ?? firstName(full_name) — one resolver
  board: Application[],    // saved_applications = the ONLY outcome source
  liveRoles: Role[],       // matched_jobs + .inApplications/.closed computed by roleKey, not synthetic id
  directions: Direction[], // suggestedDirections WITH directionFeedback applied (rejected removed)
  profile: { salary, values, dealBreakers, aspiration, workStyle, memory, ... },
  documents: Doc[],        // keyed by canonical roleKey
  nav: { applicationsCount, recent }, // derived from board
}
```
- Advisor `buildUserContext` + recap both format from it (kills #4, #7, and the duplicate formatters).
- One `/api/user-state` (or extend `/api/profile`) feeds nav, Profile, badge, directions (kills #3, #5, #2).
- **Kill synthetic ids:** `roleKey(title,company)` (already in `lib/role-key.ts`) becomes the join key across all
  four stores. One change closes #1, #9, #12 at once.
- **Interim, until the assembly exists:** apply the reconcile-on-read pattern (now in `/api/save-job`) to EVERY
  cross-table read; bust the recap cache on EVERY board write.
- **Deterministic backstops, not prompt-only:** add name-normalisation + time-phrase sanitisers, modelled on
  `stripDashes`.

**B. The automated drift test (this is the part that stops Lexi being QA).** Seed a user with a known board (one
offer, one rejected, one applied), a `preferredName`, one rejected direction, one expired role. Assert:
1. `assembleUserState` returns exactly that (closed roles out of nav; rejected direction absent).
2. Extend `eval:advisor` with a "board-truth" persona: ask "do I have any offers?" / "what's my name?" and grade
   the reply against the seed (offer present, name = preferredName, no confabulated interview).
3. Snapshot test: chat-context and recap board strings are identical for the same seed (proves the shared formatter).

**Fix-first order:** #1, #2, #3 (pure structural single-source), then #4, #5, #11, then #6 (needs new data).

**Files of record:** `src/app/api/chat/route.ts`, `src/app/api/recap/route.ts`, `src/lib/advisor-tools.ts`,
`src/lib/profile.ts`, `src/lib/role-key.ts`, `src/app/api/applications/route.ts`, `src/app/api/save-job/route.ts`,
`src/app/api/matched-jobs/route.ts`, `src/app/api/documents/route.ts`, `src/app/workspace/SidePanel.tsx`,
`src/app/workspace/useNavProgress.ts`, `src/app/workspace/usePanelJobs.ts`, `src/lib/advisor-prompt.ts`.
