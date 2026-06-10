# Parking Lot

Ideas captured mid-session to revisit at the right time.

---

## Arlo tab behaviour — Session 11, 2026-06-10
**Question:** Does Arlo refresh/reset every time the user changes tabs, or does he maintain a continuous conversation across tabs?
**Trade-off:** Per-tab feels purposeful and contextually relevant, but switching tabs causes jumpy resets. Continuous conversation feels more natural and human, but Arlo may lose contextual focus.
**When to address:** During Applications tab design session — this is the first tab where the question becomes real.

---

## Arlo panel collapse toggle — Session 11, 2026-06-10
**Decision locked:** Yes, Arlo's panel should be collapsible on every tab. Collapsed = left side expands full width. Toggle icon on edge to restore. Conversation preserved.
**Scope:** Global dashboard shell decision — applies to all tabs equally.
**When to address:** Design the collapsed state as part of the dashboard shell spec.

---

## Application focus mode — Session 11, 2026-06-10
**Question:** When a user clicks "next step" on an application card, should the screen shift into a focused mode — full attention on that specific application, with Arlo supporting on one side and the work surface on the other?
**Why it matters:** The current pipeline view is an overview. Actual work (writing a cover letter, prepping for an interview) needs a different kind of screen — focused, not a list.
**When to address:** Dedicated session after the main Applications tab layout is locked. This is likely a separate "Application detail / work mode" screen.

---

## Calendar integration — Session 11, 2026-06-10
**Idea:** When a user has an interview booked, surface it in a calendar view so they can see upcoming events alongside past stage history.
**Decision:** Timeline on the card (past stages + upcoming dates) is in v1. A full calendar view or Google Calendar integration is out of scope for v1 — too much scope.
**Decision:** Internal platform calendar confirmed as a Phase 2 feature. Optional Google/Apple Calendar sync also confirmed. Timeline on the card (past stages + upcoming dates) covers v1.
**When to address:** Phase 2 — needs its own design session. Includes: calendar view design, Google Calendar OAuth, Apple Calendar (CalDAV) integration.

---

## Skills in-progress state — Session 12, 2026-06-10
**Decision:** Skill items need three states: not started → in progress → done. "In progress" shows on the card (e.g. a subtle progress indicator or "started" label). "Done" moves the item off the active list — either archived or shown in a collapsed "completed" section at the bottom.
**When to address:** Skills tab design session — add the three states before the mockup is locked.

---

## Quality over quantity — standing product principle — Session 12, 2026-06-10
**Principle:** The platform's goal is fewer, better applications — not volume. Every feature should help users spend more productive time preparing, which produces better outcomes. This applies to skills, applications, outreach, and Arlo's behaviour equally. Never optimise for activity metrics at the expense of quality.

---

## CV auto-update from skills completion — Session 12, 2026-06-10
**Feature:** When a user tells Arlo they've completed a course or earned a certification, Arlo asks "Want me to add this to your CV?" If yes, it's added to their CV on file automatically. Updated CV is always downloadable from Profile.
**Why it matters:** Closes the loop between skills work and application materials without the user having to maintain their CV manually.
**When to address:** Phase 2 engineering — requires CV storage and edit capability in Supabase, and Arlo write-back to profile. Design it during the Profile tab session.

---

## Certification completion rule — Session 13, 2026-06-10
**Decision:** Certifications can only be marked as complete if the user shares their certificate with Arlo as evidence (link or file). Self-reporting alone is not sufficient for certifications — anything that goes on a CV must be factually verified. Courses and practice exercises use self-reporting (Arlo asks "where are you up to?"). Certifications require proof first.
**Arlo flow:** User says they've finished → Arlo asks for the certificate → user shares it → Arlo marks it complete, adds to profile, offers CV update.
**Credential link verification (future):** Some providers (Credly, Forage) issue verifiable credential links the platform could validate automatically. Phase 3+ — v1 relies on Arlo reviewing what the user shares.

---

## Freelance / independent work track — Session 12, 2026-06-10
**Idea:** Some users want freelance or contract work, not employment. The outreach process is similar — identify the right people, personalise the pitch, follow up. Could run as a parallel track to the job application pipeline.
**When to address:** Post-v1. Needs its own design session. The core pipeline (direction → targets → outreach → follow-up) maps well; the differences are in how "applications" are framed.

---

## University applications (Masters) — Session 12, 2026-06-10
**Idea:** Some users are applying to Masters programmes alongside or instead of jobs. Could be an optional tab ("University Applications") surfaced only for users who indicate it's relevant during onboarding or setup. Not for undergrad — the product is aimed at people already past that point.
**When to address:** Post-v1. Needs its own design session. The tab pattern (conditional, user-toggled) is interesting and may apply to the promotion track too.

---

## Promotion / internal opportunity tracking — Session 12, 2026-06-10
**Idea:** Some users are trying to get promoted or move internally. Could track key conversations, milestones, evidence of impact — similar to the applications pipeline but for internal moves. Arlo could help them frame their case.
**When to address:** Post-v1. Likely its own mode or tab, unlocked by user context. Shares the same emotional need as job applications — "I want to move forward and I don't know how."

---

## Company hiring process data — Session 12, 2026-06-10
**Decision:** Show typical hiring processes based on external crowd-sourced data (Glassdoor, candidate reports). This is distinct from platform prediction — it's documented pattern, not a guess. Always labelled as "typical process" or "based on candidate reports", never stated as guaranteed.
**Phasing:**
- v1: Arlo surfaces it conversationally when a company is added ("Based on what candidates have shared, Monzo typically runs…"). No API needed — Claude has this knowledge for major graduate employers.
- v2: Structured "Typical process" component on the card, pulled from a proper API (Glassdoor, Adzuna, or similar). Covers all employer types — grad schemes, internships, entry-level, standard roles. Not limited to graduate employers. Check API terms before building.
- v3: Platform's own confirmed data from users who completed the process supplements/replaces external sources.
**Honesty rule preserved:** "typical process" = ✓. "You'll hear back by Friday" = ✗. Source must always be shown.

---

## Skills are optional — not a gate — Session 12, 2026-06-10
**Principle:** Some users don't have time to work on skills between applications. The platform must never make skills building feel like a prerequisite for applying. A user should be able to arrive, get help applying right now, and send applications — with zero friction from Skills.
**Implication for Skills tab design:** Skills should feel like an optional enhancement — "want to get stronger while you wait?" — not a to-do list that blocks application help.
**Implication for onboarding:** The pipeline (CV → direction → roles → apply) should be completable without ever touching Skills. Skills is a parallel track, not a gate.
**When to address:** Skills tab design session — this is the first constraint to establish before any UI decisions.

---

## Platform intelligence — standing product principle — Session 11, 2026-06-10
**Principle:** Every user action — saving a job, moving a card, passing on a role, completing a step, withdrawing — should feed intelligence back into both the platform and the individual user's profile. The platform learns what works across users. The user gets a more personalised experience over time.
**Examples:** Which role types get saved most → refine direction. Which applications progress furthest → surface similar companies. Which steps users skip → surface friction points.
**When to address:** Phase 1 engineering — specifically the Supabase schema and advisor memory design sessions. Every table should be designed with this principle in mind from day one.
