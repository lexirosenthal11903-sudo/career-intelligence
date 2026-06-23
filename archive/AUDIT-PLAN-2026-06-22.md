# Product audit plan — agreed scope (2026-06-22)

_Agreed with Lexi before running. Run it when she says go. Pairs with
`WALKTHROUGH-FEEDBACK-2026-06-22.md` (her live click-through) — the audit augments that into ONE
prioritised, deduplicated report (loses-users → important → polish), each item with a root cause, not
just the symptom._

## How it runs (no access to Lexi's account or email)
- **Headless Chromium driven by Playwright** (the same mechanism used for this session's screenshots) —
  NOT the Claude-app computer-use feature, NOT Lexi's own browser.
- **Test accounts created via the Supabase admin key** (`SUPABASE_SERVICE_KEY` in `.env.local`, already
  used by the e2e suite) — creates + logs in users instantly, skipping email/OTP. Lexi's account untouched.
- **Test personas with realistic CVs/backgrounds** (build first, reuse forever): e.g. art/design grad →
  family office (Lexi's case), STEM grad who knows what they want, career-changer, thin-CV graduate.
  Personas test matching *quality*; one persona clicking through tests *flow/bugs*.
- **Code review** for what a browser can't see: RLS/security, data integrity, secret leakage.

## What we audit
1. **End-to-end journeys** — new user (are discovery questions asked?), returning user, existing-account
   edges, unauth poking, abandon-and-return. Every dead end + "where do I go now."
2. **Auth & account** — new/existing signup + login, Google + OTP, error messaging, session persistence,
   does pre-signup analysis carry over, reset/delete.
3. **Navigation & IA** — every item exists/clickable/does-what-it-says; first-vs-returning consistency;
   stray "Roles" top-right; Today-reloads-but-tabs-don't; back behaviour; lost scroll position.
4. **Matching & content quality (personas)** — honest direction ordering, no flattery/cherry-picking,
   relationship-field weighting, seniority correctness, recruiter filtering, relevance/specificity,
   salary/location accuracy, logos, duplicates, sparse results.
5. **The advisor** — asks before telling, initiates, remembers, never overclaims, voice vs
   ADVISOR_PERSONA, engages with stage changes, handles "doesn't fit me", uses real JD in prep, gate tone.
6. **Saved roles / applications** — save, SEE saved (not just "Recent"), remove, stages board, persistence
   + advisor reaction, per-role actions everywhere (interview prep / CV tailoring / outreach), notes.
7. **Direction** — clickable detail (what it is / rewards / salary / ask-prompts); direction → filtered roles.
8. **Profile** — exists/clickable; CV on file; what advisor knows; preferences; replace CV without redoing
   everything; account controls; deletion works.
9. **Copy & messaging** — clarity, voice, no jargon/AI-isms, helpful errors, purposeful empty states,
   clear CTAs, kill pointless bits ("worth exploring"/"direction forming" pills), nothing shown twice.
10. **Visual & design quality** — token consistency; banned AI-pattern scan; density/hierarchy; reveal
    pacing; loading/skeleton states; logo fallbacks.
11. **UI/UX & design judgment (added by Lexi)** — Is anything unnecessary? Are there better ways to format
    / lay things out? Is it genuinely user-friendly and clear? Is information in the RIGHT places and does
    each screen make logical sense? Redundancy, grouping, visual hierarchy, whitespace, scannability,
    cognitive load. The "would a confused, anxious 22-year-old find this obvious?" lens.
12. **Accessibility (WCAG AA)** — contrast, focus, keyboard, reduced-motion, alt text, semantics, SR sanity.
13. **Performance** — analysis time + perceived wait, time-to-first-useful-content, fetch/score latency,
    reload cost.
14. **Errors & resilience** — analysis/jobs/chat fail, zero jobs, network drop, slow pipeline, rate-limit,
    malformed data; match locked error designs; console errors; blank-screen crashes.
15. **Security & privacy (code + live cross-user test)** — RLS (can one user read another's CV?), pages
    gated server-side, delete-account completeness (GDPR), CV handling, no client-side secrets, consent,
    privacy/terms present.
16. **Data integrity** — pre-signup analysis persists post-signup; CV saves to Profile; latest-analysis
    wins; stable jobs actually stable; recap generates.
17. **"Held at every step" lens** — does each feature assume the user knows? What guiding moment is missing?
    What would a real user ask that we never answer? Is every element purposeful?
18. **Consistency** — branding (Career Intelligence vs Meridian + un-updated landing page), tone, repetition.

## Out of scope (for now)
- Mobile/responsive — desktop-first is locked; flag only egregious breakage.

## Output
One prioritised report file, severity-tagged, deduped against the walkthrough doc, root cause per item,
grouped so we can turn it straight into a build sequence.
