# SPEC — Roles-vs-Applications IA ("one record, two lenses")

_Agreed 2026-07-01 (Lexi + Claude, Session 48 design session — Fable 5). This is the contract for the next
build touching these surfaces: the agreed structure, the evidence behind it, and the objective "done"
criteria Claude self-verifies against. **No code was written this session.** Previous spec (role-interest
mentoring, shipped) archived at `archive/SPEC-role-interest-mentoring-2026-06-27.md`._

> Source finding: FEATURE-ROADMAP.md "Session 47 — outreach tracking shipped + IA finding" (Lexi, live QA
> 2026-07-01). Prior-art baseline: PRIOR-ART-MAP.md §5 (roles matching), §6 (applications), §7 (outreach)
> + the Session 48 research pass below. Current-state code map confirmed in session (SidePanel.tsx).

---

## The problem (why this exists)

Two mental modes are bleeding together. The live-role detail ("Roles for you") should answer *"should I go
for this?"* — company, role, fit. The application detail should answer *"where's my application at?"* —
stage, CV, cover letter, outreach, notes. Today the split is exactly backwards in one place: outreach
**tracking** (draft + status chips + follow-up) renders ONLY in the live-role detail
(`SidePanel.tsx` `OutreachSection`, used by `RoleDetail`), while the application detail (`SavedJobDetail`)
has **no outreach section at all**. And prep actions (`draft_outreach`, `tailor_cv`) don't touch application
state — a user can fully prepare for a role that was never saved into Applications.

## The evidence (Session 48 research pass — Teal, Huntr, Simplify, Otta/WTTJ, LinkedIn, NN/g)

- **Dominant tracker pattern: one record per role from the moment of interest**, with "Saved/Bookmarked/
  Wishlist" as the earliest stage of the same pipeline — not two object types. Evaluation content and
  management content live on one record, separated by lenses/sections, not duplicated.
- **No product promotes on preparation.** Teal and Huntr deliberately let heavy prep (CV tailoring, drafts)
  happen while a job sits pre-application. The only auto-promotion anywhere (Simplify, LinkedIn Easy Apply)
  is triggered by *actually applying*.
- **But prep requires the record to exist** (Teal/Huntr both): taking a prep action creates/saves the record
  without advancing it. This is the precedent for our promotion rule.
- **Otta/WTTJ** (evaluation-first, our closest "Roles for you" reference): a rich company-evidence job page
  (salary, culture, funding, team) for deciding; tracking is a separate, thinner surface.
- **NN/g wishlist-vs-cart:** consideration set vs transactional container; crossing the boundary is a
  discrete, user-legible intent event.

---

## Agreed model (the decisions, locked — Lexi chose both, 2026-07-01)

**1. One record, two lenses.** A role has ONE underlying record (`saved_applications` is the source of
truth for where it stands — never `saved_jobs`). "Roles for you" detail is the **evaluation lens**;
"Applications" detail is the **management lens**. Same record, two purposes; the same information is never
shown twice.

**2. Prep auto-saves, never auto-advances.** Taking a preparation action on a live role — drafting outreach,
tailoring a CV, generating a cover letter — **quietly saves the role into Applications at stage "Saved"** if
it isn't there yet (the record must exist for the prep to live somewhere). It **never advances an existing
stage**. Only a real-world event moves stage (user self-report or advisor `set_application_stage`). Quiet
means quiet: no fanfare, no toast celebration — the advisor may mention it in one natural line.

**3. All tracking lives in the management lens.** The outreach thread (persisted draft, status chips,
follow-up line), tailored CVs, cover letters, stage, activity, notes — all render in the application detail
(`SavedJobDetail`). The status chips leave the live-role view entirely.

**4. The evaluation lens keeps the door, not the thread.** The live-role detail stays purely "should I go
for this?": role header, fit, why-this-fits, description, what you'd bring — **plus the offer to reach out**
(research: outreach is often the highest-leverage FIRST move, pre-application, so the door stays here).
Starting a draft from that door triggers the prep auto-save (rule 2) and the thread then lives in
Applications (rule 3).

**5. After save: evaluate + handoff link.** Once a role is in Applications, its live-role detail shows one
quiet "In your applications" link to the application detail. No management UI duplicated into the live view.

**6. Known gap, out of scope:** the evaluation lens is thin on real COMPANY evidence (only the listing).
That's the grounded-knowledge track (Step 3) — logged, not this build.

---

## The bar that makes it ours

- **Quality over quantity.** Auto-saving on prep must never feel like "pipeline filling" — it's the product
  keeping the user's work safe, framed that way. No counts celebrated, no volume mechanics.
- **The advisor is the product.** The advisor narrates the moment naturally ("I've kept this with your
  applications so nothing's lost") — the UI never announces state machinery.
- **Honest states.** Chips remain self-reported truth; a stale key can never report false success (keep the
  404-on-zero-row PATCH behaviour).
- **Paced for an anxious user.** Two clear rooms ("deciding" / "pursuing") reduce load; a merged mega-card
  (Teal-style) was considered and rejected for exactly this reason.

---

## Technical shape (Claude's call — for the build, not this session)

- **`draft_outreach` + `tailor_cv` (+ cover letter path):** upsert into `saved_applications` at stage
  `saved` when no row exists (mirror the existing "Interested" dual-write, including `saved_jobs` for feed
  status), then emit `application-changed` so list + detail + nav count re-read live.
- **SidePanel:** move `OutreachSection` from `RoleDetail` into `SavedJobDetail`; `RoleDetail` gets the
  reach-out offer CTA and, when a matching application exists, the "In your applications" handoff link
  (opens `SavedJobDetail` via the existing `initialJobId` path).
- **Key alignment risk:** `outreach` is keyed by role_key (title+company), applications by `job_id`. The
  handoff link and the SavedJobDetail outreach section need a reliable join — decide in the build whether to
  add `job_id` to `outreach` (likely) or join on the key; keep the existing ambiguity guard either way.
- **Advisor context/prompt:** reflect the model — outreach status lines belong with the application context;
  the draft confirmation says where it now lives. Prompt change here is contextual, not behavioural — quick
  subset check, NOT the full eval (cost rule 2).

## Done criteria (objective — Claude self-verifies against these)

1. Drafting outreach (or tailoring a CV) for an unsaved live role creates the application at stage **Saved**
   — visible in the Applications list and nav count without reload (`application-changed` fires).
2. The same prep actions on an already-saved role **never change its stage** (unit + e2e).
3. The outreach thread (draft, chips, follow-up line) renders in the **application detail**; the live-role
   detail contains **no status chips**.
4. The live-role detail of a saved role shows the "In your applications" link, and it opens the right
   application detail; an unsaved role shows the reach-out offer instead.
5. No piece of management information renders in both lenses.
6. All green before Lexi sees it: unit, e2e (pre-commit hook), tsc 0, lint 0, shot.js pass on both lenses.

## Explicitly out of scope (this build)

- Company-evidence enrichment of the evaluation lens (grounded knowledge, Step 3).
- Interview prep (next candidate-loop step — own research + spec).
- Any board/stage redesign — the stage model shipped in S43/S45 stands.
- Collapsing the `saved_jobs`/`saved_applications` dual-table into one (known drift risk, tracked
  separately — this build only reuses the existing dual-write).
