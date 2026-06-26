# CLAUDE.md — historical detail (archived 2026-06-26)

_Moved out of the root `CLAUDE.md` during the 2026-06-26 prune (the file had grown to 389 lines, nearly
double its own 200-line cap, and most of it was stale session changelog that contradicted current reality).
Preserved here for history per the "superseded ≠ deleted" rule. Build state of record lives in `REBUILD.md`;
locked-screen detail lives in `SESSION_DECISIONS.md`. Nothing here is a live instruction._

---

## Design Status — locked screens (Phase 0, all complete 2026-06-10) — now in SESSION_DECISIONS.md

- **Design tokens** — `.design/career-intelligence-redesign/SESSION_DECISIONS.md` (source of truth)
- **Homepage** — `mockups/homepage-v2.html` — LOCKED (Session 18). Three feature sections; nav Log in + Sign up; Fit labels not scores.
- **Dashboard home** — `mockups/dashboard-home.html` — LOCKED (Session 10)
- **Input page** — `mockups/input-page.html` — LOCKED (Session 10). Chat UI, Arlo intro sequence.
- **Loading screen** — `mockups/loading-screen.html` — LOCKED (Session 10). Text only, 4 phrases.
- **Skills tab** — `mockups/dashboard-skills.html` — LOCKED (Session 13). Trajectory framing, not deficit.
- **Applications tab** — `mockups/dashboard-applications.html` — LOCKED (Session 12). Stages: Preparing → Applied → Interview → Offer → Archive.
- **Auth overlay** — LOCKED (Session 11). Google OAuth + email OTP.
- **Roles tab v2** — `mockups/dashboard-roles-v2.html` — LOCKED (Session 13). Role types / Live listings.
- **Role detail** — `mockups/role-detail.html` — LOCKED (Session 13).
- **Onboarding bridge** — `mockups/onboarding-bridge.html` — LOCKED (Session 13).
- **Returning user experience** — `mockups/returning-user.html` — LOCKED (Session 14).
- **Profile tab** — `mockups/dashboard-profile.html` — LOCKED (Session 15). Mirror screen.
- **Basic error states** — `mockups/error-states.html` — LOCKED (Session 16).

---

## START HERE — Session Continuity (as written 2026-06-23, superseded by START-HERE.md + .session-handoff.md)

**Where we were (after the first live test, 2026-06-22):** Step 0 floor + most of Step 1 spine done
(advisor memory + agency, jobs-that-are-right, recap card real, company logos, routing flipped so
`/workspace` IS the product). Stable URL: `career-intelligence-xi.vercel.app` (prod branch = `staging`).

**Build queue (signed off 2026-06-22):** (1) job persistence + daily-new-roles; (2) "already interested"
bug; (3) saved-job detail page; (4) CV upload → Profile.

### Critical bugs found by Lexi (Session 37, 2026-06-20) — since fixed
CRITICAL: (1) Roles/Applications/Profile "couldn't load"; (2) Dashboard empty after analysis; (3)
onboarding bridge "2015 directions" (reading a date as a count). IMPORTANT: (4) hardcoded bridge title;
(5) input/Arlo intro not personalised; (6) "Update my CV" runs the whole input flow; (7) generic Arlo text.
Root cause: data flow `/api/analyse` → sessionStorage → bridge → dashboard broken for some flows.

### Session 37 decisions (2026-06-20)
Homepage redesign shelved (draft `homepage-v3.html`). Arlo face + name dropped. Astronomical images saved
(`img-moon.jpg`, `img-nebula.jpg`). Mentorship feel: product read as "dashboard + chatbot" not mentorship.

### Revised session priority order (as of Session 37)
S38 fix bugs + Playwright tests · S39 Arlo initiates + direction refinement · S40 CV tailoring + cover
letter · then share with 3–5 contacts.

---

## Current Phase — session-by-session changelog (Sessions 17–33)

**Phase 1 — Foundation.** Next.js scaffold (S17). S23: backend hardening — auth middleware, persona, rate
limiting, input validation.
**Phase 2 — Visual Redesign. COMPLETE** (S19–21, 2026-06-11).
**Phase 3a (S24, 2026-06-12):** Google OAuth + email OTP via Supabase; auth callback routing; session
persistence; sign out; real name/email in greeting + Profile.
**Phase 3a (S25):** InputChat real extraction; analyse SSE streaming; LoadingScreen SSE consumer;
OnboardingBridge reads real data; save-result fire-and-forget; `results` table recreated.
**Phase 3a (S26):** Adzuna listings in Roles; `/api/results`; pipeline split into two parallel calls;
analysis-error redirect; `?next` param; AuthModal redirectTo; shorter keywords; score<4 filtered; Load more.
**Phase 3a COMPLETE (S27):** Arlo chat wired to `/api/chat`; per-page conversation history; unauth result
persistence fix; chat rate limiting (100/user/day); dashboard direction card real; Vercel prod env vars.
**Phase 3b (S28):** analysis specificity + sector/seniority keywords; relevanceReason expanded; Reed API
parallel with Adzuna; companySuggestions in direction card.
**Phase 3b (S29):** Skills + Applications tabs read real data; `/api/applications`; save-job → saved_applications;
sessionStorage key unified to `analysis-result`; profile max_tokens 1200→1600; seniority prefixing; job caching.
**Phase 3b (S30):** strategic repositioning; OTP error state; Profile sidebar real auth; RoleDetail rewritten;
ProfilePage Arlo wired; DashboardHome placeholders removed.
**Phase 3b (S31):** post-audit bug-fix pass (commit bd6f07e).
**Phase 3b (S32, 2026-06-18):** Arlo unauth sign-in fix; Chrome audit prompt; full product audit; Apt AI
competitive analysis.
**Direction concept RESOLVED (S33, 2026-06-18):** "Directions" = what the user could become, not a verdict.
Full detail in ADVISOR_PERSONA.md "Direction framing".
