# Product audit — consolidated prioritised report (2026-06-22)

_One report, deduped against `WALKTHROUGH-FEEDBACK-2026-06-22.md`. Each item has a root cause, not just
the symptom. Method: code review of the full spine (auth, workspace, pipeline, API routes) + a real-pipeline
matching audit across 4 personas (`tests/audit/run-personas.mjs`) + a runtime flow pass
(`tests/audit/run-flow.mjs`). Severity: 🔴 loses users / broken · 🟠 important · 🟡 polish._

Tag key: **[W]** = also in the walkthrough · **[NEW]** = found by this audit · **[fixed]** = done this session.

---

## What's actually GOOD (don't regress these)
- **Honest direction ordering works.** Persona audit confirms the family-office stretch is ranked #2 (not
  crowned #1), junior role titles are used for graduates, and relationship-driven weighting appears in the
  art-grad's directions. This session's honesty work paid off — verified, not assumed.
- **Auth/security pattern is sound.** Every data route uses `getAuthedUser()` (RLS-respecting cookie client)
  AND filters by `user_id`. `serviceClient()` (RLS bypass) is only used by delete-account. _Follow-up: confirm
  RLS policies actually exist on every table in Supabase — the code is correct but assumes policies are on._

---

## 🔴 Loses users / broken

1. **[NEW][fixed] `suggestedDirections` is persisted as a STRING → blank reveal + recap always 500s.**
   Root cause: the Haiku profile call in `/api/analyse` intermittently returns `suggestedDirections` (a nested
   object array) as a *stringified*, sometimes *malformed*, JSON blob. Consumers then crash or silently empty:
   - `/api/recap` calls `.filter` on it → `TypeError: filter is not a function` → **500 every time → the recap
     card never renders** (this is the documented pre-share blocker).
   - The first-session reveal `JSON.parse`s it; malformed JSON throws → **empty directions → blank "click."**
   One systemic bug, two of the worst symptoms. Fix: normalize array fields at the **write boundary** (analyse
   route) so the string never gets stored, and defensively coerce in recap for already-stored data.

2. **[W][fixed] "E" avatar before we know the user.** `ChatPane` defaults `userInitial` to `"E"`; shown in the
   user bubble for an unauthenticated first-session user (and any user whose name we don't have yet). Root: a
   leftover mock default. Fix: no letter until we actually have a name — neutral state otherwise.

3. **[W][fixed] "The clearest fit" is hardcoded on the lead direction.** `RevealCard` stamps "The clearest
   fit." on direction #1 regardless of evidence — directly contradicts the honesty work (which only removed it
   from the prompt, not the UI), and flatters the stated stretch. Fix: remove it.

4. **[W] No discovery questions — premature analysis.** `useFirstSession.start()` fires `/api/analyse` on the
   user's first message. The "any requirements? where do you want to work? what direction, even vaguely?"
   conversation never happens. _Feature-level change — needs a short flow design before building (see Sequenced
   work). Not a silent bug fix._

5. **[W] Forceful sign-in wall after one reply.** `useArloChat` returns `SIGN_IN_PROMPT` after a single
   unauth message, with nowhere else to go. Root: hard gate on the first turn. _Feature-level — needs a softer,
   later, optional-feeling gate (e.g. let the whole first session + reveal happen unauth, gate at save). Design
   decision required._

6. **[W] Auth: existing-email signup + login both error confusingly.** Signup and signin both call
   `signInWithOtp` identically with no existence check; a Supabase rate-limit (60s between codes) surfaces as a
   scary "Something went wrong"; there's no "you already have an account" / "no account found" distinction.
   Fix this session (Phase 2): see auth section below.

7. **[W] No way to SEE or REMOVE saved roles.** Only the nav "Recent" list exists; no Saved/Applications board,
   no remove. _Feature-level — needs the saved/applications view built (see Sequenced work)._

---

## 🟠 Important

8.  **[W][fixed] Dead "Profile" nav + nav dead in first session.** `LeftNav` Profile button has no `onClick`.
    Fix: honest state — disabled with a "coming soon"-style affordance until the Profile view is built, so it
    doesn't read as broken. (Profile view itself is feature work.)
9.  **[RESOLVED 2026-06-23] Branding split.** "Meridian" was **dropped**. The product speaks as
    "Career Intelligence" everywhere (working name; final TBD at the identity session). No split remains —
    do not reintroduce "Meridian".
10. **[W] Can't click a direction to learn more.** No direction-detail view (what it is / rewards / salary /
    ask-prompts). _Feature-level._
11. **[W] Saved roles lack per-role actions** (interview prep / CV tailoring / outreach) that live listings
    have. _Feature-level, pairs with #7._
12. **[W] Stage buttons (prepare→apply→interview→offer) do nothing meaningful; advisor doesn't react.**
    _Feature-level, pairs with #7._
13. **[NEW] Career-changer seniority leaks senior listings.** Persona audit: a 6-years-teaching → UX changer
    gets `seniorityLevel = "Mid-level career changer"`. The jobs route's `isJuniorSeniority()` regex
    (`graduate|junior|entry|early career|...`) doesn't match that string, so the senior-term Adzuna exclusion is
    skipped → senior UX listings can surface for someone with zero professional design experience. Fix: treat
    career-changers entering a new field as entry for *listing seniority* (the model already returns junior role
    titles — the jobs filter just doesn't know).
14. **[W] "Sign in" bounces to the landing page with a popup.** Disorienting mid-flow. Root: the only sign-in
    entry is `HomepageNav`; in-app there's no inline sign-in, so flows route back to `/`. _Pairs with #5/#6
    auth rework._
15. **[W] Too much information at once — no reveal pacing.** The "click" dumps summary + 3 directions + bridge
    simultaneously. _UX/feature — staged reveal._
16. **[W] Home is a wall of reading → make "Today" the scannable digest.** _Feature (the agreed "good version
    of the inbox idea")._
17. **[W] Inconsistent reload behaviour: Today ↔ tab reloads, but the chat doesn't.** Root: switching panel
    views re-renders surfaces but the chat thread is preserved; "Today" toggles `panelOpen` without resetting.
    Make the model consistent. _Small-medium._
18. **[W] Can't scroll up to re-read the onboarding message after replying.** Root: first-session auto-scroll
    pins to the reveal/bottom; the opener scrolls out of reach. _Small._
19. **[W] "Prep me for this role" uses "what they're likely looking for" not the actual JD.** Should read the
    real job description first, then add likely extras. _Medium — advisor prompt + passing the JD through._
20. **[W] First-session nav is confusing (Roles/Direction/Documents/Profile + Today, mostly inert).** Pick one
    model: show only Today first and reveal the rest as they're earned, OR show all as clearly-locked. _UX
    decision, pairs with #8._

---

## 🟡 Polish

21. **[W][fixed] "Worth exploring" red pill on the reveal — remove.** Unnecessary.
22. **[W] "Direction forming" pill on the recap card — remove or make it mean something** (e.g. colour-coded
    workstreams). Default: remove.
23. **[W] "Roles" label top-right (the closed-panel reopen affordance) — reads as stray.** Reconsider.
24. **[W] Some company logos still missing.** Logo.dev fallback gap. _Needs the env vars Lexi still has to add._
25. **[W] Google login (existing account) takes a second.** Perceived latency on OAuth return.
26. **[NEW] Thin-CV input occasionally drops `summary` + `valuesSignals`** (same string/truncation family as
    #1). Mostly mitigated by #1's boundary normalization; worth a re-test after.

---

## Auth — the standard convention (Phase 2, this session)
Passwordless (OTP + Google), so the clean standard is: **detect the account before sending a code.**
- Signup with an existing email → "You already have an account — log in instead." (switch to sign-in)
- Sign-in with an unknown email → "We couldn't find an account — want to sign up?" (switch to sign-up)
- Rate-limit (60s) → a calm, specific message, not "Something went wrong."
- Implemented via a tiny server route that checks existence with the service key before `signInWithOtp`.

---

## Sequenced work (feature-level — needs build threads, not silent fixes)
These are the big "loses users" items that are genuine features. Recommend a short brainstorm/design pass on
the first two before building (per the design-before-build rule), then a build batch:

**Batch A — the new-user flow (highest leverage):** discovery questions before analysis (#4) · soft/late
sign-in gate (#5) · reveal pacing (#15) · first-session nav model (#20) · scroll-back (#18).

**Batch B — saved roles & applications:** Saved/Applications board (#7) · remove a saved role (#7) · per-role
actions everywhere (#11) · working stage board + advisor reaction (#12) · real-JD prep (#19).

**Batch C — direction & home:** clickable direction detail (#10) · "Today" digest (#16) · reload consistency
(#17).

**Decisions for Lexi:** branding (#9) · "direction forming" pill keep/kill (#22) · first-session nav model (#20).

---

## Fixed this session
#1 (systemic string→array normalization) · #2 (E avatar) · #3 (clearest-fit) · #6 (auth convention) ·
#8 (dead Profile nav honest state) · #13 (career-changer listing seniority) · #21 (worth-exploring pill).
Everything else is sequenced above for Lexi to approve.
