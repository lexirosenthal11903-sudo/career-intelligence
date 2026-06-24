# Parking Lot

> **▶ WHERE EACH IDEA LIVES IN THE PLAN** (map added 2026-06-23 so nothing is orphaned).
> Every parked idea below now has a home in the [START-HERE.md](START-HERE.md) sequence. Nothing is lost;
> nothing is "someday-maybe-never". The detailed notes stay below — this is just the index of *when*.

| Plan step | Parked ideas that land here |
|---|---|
| **1. Make it feel alive** (new-user flow) | "Start fresh, keep the memory" (light session reset) |
| **2. Candidate-strength loop** (the heart) | CV tailoring · cover letters · **"why am I not hearing back?" diagnosis** · networking/outreach · interview prep via advisor · mentor-session formats · skills shown *in context* (inside a role/direction) · new-role alerts ("spotted something") · Documents-as-a-folder (after CV/cover-letter exist) |
| **Ongoing fixes** ([AUDIT-REPORT](AUDIT-REPORT-2026-06-22.md)) | Saved/applications board + remove + per-role actions (Batch B) · direction detail view · click-a-direction→filtered roles / role filter (Batch C) · logo coverage (clean company name) · J&J UI patterns as reference |
| **3. Grounded knowledge layer** | Niche-industry coverage · "what makes a good mentor" research · credibility/verification of AI advice |
| **4. B2B (universities first)** | LinkedIn OAuth import · application-tracker export · offer evaluation · progress-data-for-employers (GDPR-safe) |
| **Strategy/research sessions** (run when you signal — not builds) | **Mentorship market + business model + credibility** (the big one) · Jack & Jill teardown · niche-industry-users discussion |
| **Design sessions** (deferred) | Advisor identity / visual register + the product's final name ("Meridian" dropped; speaks as "Career Intelligence" for now) · homepage redesign |
| **✅ Already done** | advisor actually changes directions/roles · jobs stable per login + daily-new · fewer jobs shown · CV→Profile · "already interested" bug · seniority ceiling · discovery conversation |

---

## 🅿️ To discuss later (raised 2026-06-22, during the audit-planning conversation)

- **Niche-industry users.** The concept of a user looking at a more niche / unusual industry — how the
  product serves them well (matching, directions, advice) when the field is small or non-standard. Lexi
  wants to discuss this properly at a later date. Just a note for now — don't build.
- **"What makes a good mentor" research report.** A research report from credible online sources on what
  truly makes a good mentor, so we (a) understand it deeply and (b) make the product credible by being
  able to quote the sources we built it on. Pairs with the parked mentorship-strategy session below and
  feeds ADVISOR_PERSONA. Park for later; do as part of / alongside the mentorship strategy session.

## 🅿️ DEDICATED SESSION — Mentorship market + credibility + business model (Lexi, 2026-06-22)

_Lexi started this in the Claude consumer app and wants to continue it here (Claude Code has more
product context). **Do not build anything** — this is a strategy/research + documentation session.
Run it on its own. Lexi will signal when "the time is right."_

**What Lexi wants from the session (her words, distilled):**
1. **Market research — is there a real gap for mentorship in the UK?** Factual, current, verifiable
   sources (not "mentorship is important" filler). Who do UK university students + recent graduates +
   20-somethings actually turn to for direction today? What support resources/people exist, and where
   are the gaps. The research must validate the *specific* gap the product claims, not the generic one.
2. **Credibility / verification of AI advice** — the mentor is an AI (the advisor). How do we PROVE
   the advice is reliable, aligns with (or beats) what a real mentor would say, and that employers can
   trust the data? Options to develop: human-mentor validation/endorsement, grounding on credible
   career frameworks, third-party audit — or a combination.
3. **Business model — brainstorm ALL options** so Lexi can see the full space: individual subscription,
   universities licensing, employers paying for talent pipeline, mentors-as-tool, grant/charity,
   government funding, freemium. Then narrow. Tension to hold: "equal opportunity for everyone" vs
   "someone has to pay." (Reconcile with existing strategy: B2C self-discovery → uni partnerships
   Phase 4 → employer network Phase 5 — already in ROADMAP strategic context.)
4. **Go-to-market / credible-mentor outreach** — who to reach out to and when: university careers
   coaches/directors, mentors Lexi knows, people online. Mentor interviews → get credible mentors to
   vouch (is this a credibility play, a marketing play, or do real mentors USE the platform with their
   own mentees? — that's a different product, scope it).
5. **Data + scouting question** — can verified progress data be shared with companies to scout high
   performers, and how is that data made credible (and GDPR-safe)?
6. **Differentiation** — many of these platforms are vibe-coded. What sets the product apart and makes it
   THE platform that gets people a foot in the door AND maintains motivation + shows real progress.

**Product framing already agreed in the consumer chat (carry in):** It IS Career Intelligence
(not a separate idea). Core = CV + (vague or specific) direction in → advisor suggests directions to
explore, how to explore them, live relevant jobs, how to apply successfully, and ongoing
motivation/momentum. The differentiator is the *mentoring layer* + serving people who DON'T have a
strong profile or clear direction (the cohort most tools ignore). UK-based, all roles, target =
university students / graduates / 20-somethings starting out (broaden later).

**How to run it:** strategy + research, document-as-we-go (Lexi explicitly does NOT want a surprise
document dropped at the end — co-create it). Likely outputs: a market/gap research doc with real
sources, a credibility framework, and a business-model option map. Suggest skills `/brainstorming`
(+ `/grill-me`) and WebSearch for sourcing. Pairs with the **Jack & Jill teardown** session (also
parked) — competitor context feeds the differentiation question.

---

## Session 2026-06-22 — FIRST LIVE TEST feedback (Lexi clicked through /workspace)

**Bugs — fixed this pass:** opens on Roles not Today + Today tab unclickable (only "close panel"
worked); first-session CV upload gave no visible confirmation before send; composer chips referenced a
fake "Nesta role"; "Review" button label ambiguous → "View"; revise_directions 4-cap now explained warmly
by the advisor (keep cap — it keeps sessions focused/avoids overwhelm — Lexi agrees the cap is right).

**Bugs — need reproduce/build (NOT fixed yet):**
- **"I'm interested" → advisor says "you've already done that".** Hypothesis: handleInterested saves to DB
  *before* askAdvisor, so the advisor's context already shows the job saved → thinks it's old. Fix likely:
  reframe the handoff message ("I've just marked…") or pass a "just now" signal. Needs a repro.
- **Saved job in the nav/sidebar — clicking does nothing.** Needs the saved-job detail view (see J&J ref).
- **Logos still partial** — do the company-name cleaning before Logo.dev search.

**Behaviour decisions (Lexi's steer needed):**
- **Returning user's jobs should NOT change every login.** Only change when the direction/keywords change.
  Today they re-fetch each session (empty cache) and Adzuna/Reed return different results → unstable.
  Need to PERSIST matched jobs per user and only refresh on direction change. PLUS a J&J-style "one or
  two NEW roles surface per day / as detected" mechanic. Real architecture change.
- **New user gets ~22 jobs — too many.** Show fewer (e.g. 5–8) high-confidence first.
- **Where does the uploaded CV live — Documents or Profile?** Rec: Profile (source identity); tailored
  CVs/cover letters go in Documents.

**Design references (Jack & Jill screenshots, 2026-06-22):**
- **Live-listing modal:** clean modal — Company / Role / Fit. "Fit" = stacked cards "Excellent on role /
  location / compensation / skills / culture" each with icon + one line. Keyboard nav (←/→ navigate, S =
  not for me, T = track). Actions: "Not for me" / "Track". Strong pattern for OUR role detail.
- **Saved/tracked job page:** breadcrumb (Jobs › …), job card, "Show details", a contextual nudge ("Did
  you know Jack can help with interview prep…"), Activity log ("Saved · last month"), "Write a note" box.
  Reference for OUR saved-job view (fixes the dead saved-job click).

**Ideas to research:**
- **Mentor sessions** — sometimes a user just wants to find a job; sometimes they want a focused mentor
  session. Research session formats/types we could offer (e.g. direction deep-dive, interview prep,
  application review, values exploration). Its own research+design effort.

---

## Session 2026-06-22 (visual rebuild, build session 6) — Lexi mid-session ideas + a bug

**🐞 BUG (trust-critical, NOT just an idea) — advisor "applies" changes that never reach the tabs.**
Lexi asked the advisor in chat to suggest more directions + update the Direction page + relevant jobs.
It acknowledges convincingly in chat but nothing changes in the tabs. Root cause (confirmed in
`src/lib/advisor-tools.ts`): there is **no tool to ADD/generate new directions or re-run the job
search** — only `update_direction` which records *feedback* (rejected/preferred/refined) into
`profile.directionFeedback`. And the workspace `DirectionView` (`SidePanel.tsx`) reads
`profile.suggestedDirections` only — it **ignores `directionFeedback`** — so even the feedback that IS
stored never shows. So the advisor overclaims (violates ADVISOR_PERSONA "never claim a change you didn't
make"). Fix = (a) a tool to extend/regenerate `suggestedDirections` (+ searchKeywords) and persist to
the `results` table; (b) make Direction + Roles read the updated data (and bust the 30-min jobs cache on
change); (c) tighten the system prompt so it never claims a change it can't make. **This is in the
"good enough to share" criteria (direction refinement works) — highest priority after the routing flip.**

**Direction detail view** — build out each direction with a description + salary range + "what it
rewards" + ask-Arlo prompts (mirror the old `role-detail.html` pattern) to help the user understand and
ask questions. Medium build; high value; pairs naturally with the bug fix above.

**Role filter** — some way to filter the roles list. Needs a design decision on approach (filter by
fit / sector / location / saved? or filter-by-talking, which is the conversation-first principle).
Decide approach before building — don't bolt on a generic filter bar that fights the "just tell me what
to change" model already in the panel hint.

**Logo coverage improvement** — only some logos resolve (Logo.dev has no match for many recruiters /
small firms, and listing "company" is often a recruitment agency not the employer). Quick win: clean the
company name before the Logo.dev search (strip Plc/Ltd/Limited/Recruitment/Finance/division suffixes and
"& …", e.g. "Katie Bard & Angela Mortimer Plc" → "Katie Bard", "Michael Page Finance" → "Michael Page")
to lift the match rate. Deeper issue (employer-vs-recruiter) is separate.

**"Start a new session, keep the memory"** — FEASIBLE and not very complicated, because memory is already
decoupled from the chat transcript: durable memory lives in `profiles` (memory[], directionFeedback,
values…) and `results`; the visible thread lives in `conversations`. `useArloChat` already has a
previous/current divider (hasPrevious/showPrevious), and the recap card already IS "new session with
full memory." So a "Start fresh" = archive/collapse the current thread + open a new one; the advisor
re-opens with continuity. Open question: do anxious early-career users WANT session management, or is one
continuous companion thread better? Lean: keep it light (a subtle "start fresh"/collapse), don't add
heavy session controls early.

**Skills integration** — in the conversation-first model skills should be CONTEXTUAL/specialised, not a
standalone deficit tab: surfaced inside a role ("the gap for THIS one") and inside a direction ("what
this path rewards / worth building"), carrying the old Skills tab's trajectory framing (never deficit).
Pairs with the Direction-detail idea. Partly designed (COMPONENT-INVENTORY: skills live inside a role),
not built in the workspace yet.

**Click a direction → filtered live roles** (from the old version) — clicking a suggested direction
filters the Roles list to that direction's roles. This is ALSO the cleanest answer to the earlier
"role filter" question: filter-by-direction is the conversation-first-friendly filter (vs a generic
filter bar that fights "just tell me what to change"). Build the two together.

**Networking / outreach** — already a confirmed roadmap feature (see memory project-networking-feature):
basic GDPR-safe tier (target by role + deep-link search + drafted outreach) now, licensed contact tier
later (gated on solicitor opinion). Lives in role-detail "Reaching out" (currently coaching-only stubs
in SidePanel RoleDetail). Yes — it's in the plan.

**Jack & Jill teardown — dedicated session** — full run-through of J&J's features (what to apply to our
lane: people who don't yet know what they want — never copy their jobs-forward gravity) AND a visual
teardown (what UI patterns we can borrow). Schedule as its own research+design session.

**Documents tab as a real folder** — once an application is done, keep a folder of everything generated
for it (tailored CV, cover letter, outreach drafts) so the user can find it again. Bigger feature;
depends on CV-tailoring + cover-letter generation existing first. Strong long-term idea ("just a
thought" per Lexi). Fits the existing Documents surface stub.

---

# Parking Lot — Archived

_Reconciled into ROADMAP.md, ADVISOR_PERSONA.md, and CLAUDE.md on 2026-06-15._

All items from this file have been given a proper home:

| Item | Destination |
|---|---|
| Arlo tab behaviour | ✓ Built — Phase 3a (per-tab conversation history) |
| Arlo panel collapse toggle | ✓ Built — Phase 2 |
| Application focus mode | ROADMAP.md — Phase 3b Hand-Holding Layer |
| Calendar integration | ROADMAP.md — Phase 3b Hand-Holding Layer (already there) |
| Skills in-progress state | ROADMAP.md — Phase 3b Session B |
| Quality over quantity | CLAUDE.md — Permanent Product Decisions |
| CV auto-update from skills | ROADMAP.md — Phase 3b Hand-Holding Layer |
| Certification completion rule | ADVISOR_PERSONA.md — Behaviour patterns |
| Freelance / independent track | ROADMAP.md — Future Vision (Phase 6+) |
| University applications (Masters) | ROADMAP.md — Future Vision (Phase 6+) |
| Promotion / internal tracking | ROADMAP.md — Future Vision (Phase 6+) |
| Company hiring process data | ROADMAP.md — Phase 4 (Glassdoor, already there) |
| Skills are optional — not a gate | ADVISOR_PERSONA.md — Behaviour patterns |
| Platform intelligence principle | ROADMAP.md — Phase 4 (already there) |
| Arlo-only mode | ROADMAP.md — Phase 5 |
| Arlo direction refinement | ROADMAP.md — Phase 3b Hand-Holding Layer |

**New mid-session ideas go directly into the right phase in ROADMAP.md, or here if phase is unclear.**

---

## Session 35 — 2026-06-19 — From Perplexity Computer research

**LinkedIn OAuth import** — Phase 4
Users paste/link their LinkedIn URL, we pull data via OAuth (not scraping). Major friction reduction vs CV upload. Perplexity does this well. Full research in `research/competitor-perplexity-computer-2026-06-19.md`.

**Monitor & Alert** — Phase 4
Arlo pings the user (email or in-app notification) when a new high-fit role appears. "Arlo spotted something worth your time." Builds the return mechanic without gamification.

**Interview prep via Arlo** — Phase 4
Before an interview, user asks Arlo to prep them. Arlo briefs: what the company actually does, what the role requires, likely questions, honest gaps to address. Natural extension of the existing Arlo relationship.

**Offer evaluation via Arlo** — Phase 5
When a user gets an offer, Arlo helps assess it — salary benchmarking, culture signals, red flags. "Is this right for where you're going?" Keeps Arlo relevant beyond the search phase.

**Application tracker export** — Phase 4
Light version of Perplexity's Google Sheets integration. Export saved applications as a CSV or Google Sheet for users who want to manage tracking in their own tools.

**Multi-model routing (internal)** — Already doing this
Haiku for scoring, Sonnet for analysis. Continue this pattern. Never expose the seams to the user — Arlo is always one presence even if different models power different tasks.

**Homepage feature grid** — Homepage redesign session
Perplexity's 6-card feature grid is a strong pattern for communicating product completeness. Use as reference for our homepage redesign (alongside Resend/Linear). See `research/competitor-perplexity-computer-2026-06-19.md`.

**Loading checklist pattern** — Homepage redesign session
Their loading screen step-by-step with icons is more visually informative than most. Reference for our loading screen redesign.

---

## Session 33 — 2026-06-18

**Arlo identity and visual register — dedicated session needed**
Lexi flagged that Arlo currently reads as childish/cute, which undercuts the trust register the product needs. This is a fundamental question about Arlo's execution (and possibly concept): no face/illustration, name potentially needs to change, visual presence should come from quality of words not a drawn character. Principle agreed: concept (named advisor) is likely right, execution is wrong. Do not make further Arlo changes until a dedicated session resolves: new name candidate(s), visual register, how advisor presence is conveyed without a character illustration. This session should happen before any significant new UI build that involves Arlo.

---

## Session 43 — 2026-06-23 (Lexi review of the live product)

_Captured mid-session so nothing's lost. Recommendations are Claude's co-founder read; nothing built yet._

- **Discovery: probe thin / vague input** _(→ Step 1, feel alive — closest to current work)._ Carry over a
  behaviour the OLD build had: when there's no CV, or the direction/answers are vague, the advisor asks the
  normal discovery questions (requirements, location…) AND a few extra *substance* prompts — e.g. university
  modules, work experience, projects — to draw out enough to give a genuinely useful, directed read. The
  current `/api/intake` caps at 3 generic questions and doesn't dig when the input is thin. **Rec: build —
  small, on-theme, high value.** Make the intake prompt detect thin input and ask for substance, still casual,
  still capped so it never becomes a quiz.
- **Profile: directly editable vs mentor-driven** _(the meta-question)._ **Rec: BOTH, mentor-primary.** The
  Profile (the "mirror") should let the user directly edit concrete facts (CV, email, preferences,
  deal-breakers) — people WILL want to correct things and won't know to tell the mentor. The mentor can also
  change everything in conversation (already does via `update_profile`); they share one store so they stay in
  sync. Principle: never trap a fact behind "only the mentor can change this."
- **Profile: replace the CV on file** _(→ Step 2 area / account)._ Already half-decided (CV's home = Profile,
  2026-06-22). Must be a simple file replace — NOT the whole input flow again (that was critical bug #6).
  **Rec: build with the profile-edit pass.**
- **Profile: change registered email** _(→ account)._ Standard hygiene. Supabase `updateUser({email})` triggers
  a re-confirmation flow (real work). **Rec: yes, low priority — batch with delete-account + other account
  settings, not urgent for first close-contact users.**
- **View previous chats** _(→ Step 1/2)._ Real gap. Partial support already exists (per-page "New session"
  divider + show-previous toggle in `useArloChat`), and the recap card is the light version. **Rec: yes — a
  simple history view; give it a home in the account menu (below).**
- **Bottom-left name/email → opens Profile.** Lexi's instinct it's "not right" — agreed. Convention is an
  *account menu*, not a jump straight to Profile. **Rec: make it a small menu — Profile · Previous chats ·
  (Settings/Email) · Sign out.** This also gives "previous chats" and sign-out a home. Small, good consolidation.
- **Progression tracking — user-facing.** ⚠️ Brushes the locked **no-gamification** rule (no streaks/points/
  badges). **Rec: yes IF framed as meaningful momentum, never metrics** — "how far you've come": direction
  clarifying, CVs tailored, roles engaged, foot-in-door actions taken. On-strategy (mission says "show real
  progress"; B2B thesis wants verified progress data). **Park as a real Step-2-area feature; design carefully
  against the gamification line first.**
- **Tech debt: lint cleanup (36 pre-existing `react-hooks/set-state-in-effect` errors).** Not blocking, predates
  this work. **Rec: roadmap — a small dedicated cleanup pass between features, not mid-feature.**

---

## 🅿️ Session structure + mentorship grounding (Lexi brain-dump, 2026-06-24)

_Raised while thinking out loud at the start of the candidate-loop session. These reshape Step 1 and
sharpen the parked mentorship-research session. Decision taken: research dive = NEXT session; it grounds
the session-structure rebuild; candidate-strength loop waits until Step 1 is genuinely done._

- **The mentor should OPEN a session, not wait.** Once it has read the user's profile, the advisor should
  offer a discussion of *how this works, what it can do for them, and the trajectory of how it supports
  them* — before anything else. Currently it reads as "dashboard + chatbot", not a mentor running a session.
  → Step 1, "advisor reacting + feeling present". This is the heart of that item.
- **Design the first-session arc explicitly.** For someone who arrives not knowing what they want, the
  natural order is: how this works → what it'll help you achieve → explore your suggested direction + how you
  *feel* about it → THEN, later, roles. **Roles must NOT be the first thing surfaced.** Lexi is drawn to the
  roles view every time and the recommendations are still bad, so leading with them undersells the product.
  → Step 1 rebuild (after the research). De-emphasising roles in the UI lives here too — NOT a quick build-
  session change; it's structural and the research should ground it.
- **NEXT SESSION = the credible-mentorship deep-dive (Lexi: "really important, it will guide the future
  build").** Extends the already-parked "what makes a good mentor" research: a proper dive into credible
  sources on *how real mentors lead sessions, how they speak to people, what they help guide people with —
  everything under the mentoring umbrella* — so we can extract it and know how to apply it, instead of
  guessing (which is what we're doing now). Feeds ADVISOR_PERSONA + the session-structure rebuild. Pair with
  the parked mentorship market/credibility/business-model session if scope allows; otherwise run the
  "how mentors run sessions" extraction first since it's what unblocks the build.
- **Advisor as a credible reference / "vouch" — the digital sponsorship play (Lexi, 2026-06-24).** Raised off
  the Bucket C finding that a digital advisor _can't truly sponsor_ you (can't phone a hiring manager). Lexi's
  idea: a way for the advisor to **vouch** for a user — a certificate or evidenced analysis, shareable with an
  employer, attesting to commitment, drive, motivation, performance. This is the digital-native version of Kram's
  **sponsorship function**, and it converges with the already-parked **B2B "verified progress data → employers to
  scout high performers"** thesis (mentorship-strategy session, bullet 5) + the user-facing progression-tracking
  idea (Session 43). **The whole game = selective + evidence-grounded:** a human sponsor carries weight because
  they stake their reputation and don't vouch for everyone; an AI that gives everyone a glowing certificate is
  worth nothing. So it can only attest to what it has _observed/verified_ (real work done, verified certs —
  proof already required — demonstrated engagement over time), never a guess at "drive." Traps to design around:
  (1) the locked **no-metrics/gamification** line — must read as an evidenced reference, never a score;
  (2) **honesty** — never vouch for what it can't back (ties to honest-matching + cert-proof rules);
  (3) **GDPR/consent** — explicit, revocable opt-in, behind the same solicitor question as contact discovery.
  Strongest eventual form: **AI-evidenced + human-mentor countersigned** (which also = the credibility play).
  **Down-the-line / B2B era (Phase 4–5). Do not build now.** Fold into the mentorship-strategy + credibility session.

- **Roles matching quality + sourcing — review in a few sessions (Lexi: "sick of it").** A dedicated look at
  how other companies match roles to users and where they pull jobs from. NOT now — deliberately deferred a
  few sessions. Ties to the recommendations-still-bad symptom above.

### Profile concerns checked this session (2026-06-24) — findings
- **CV on file** — NOT a bug. `cvUpdatedAt` is the real extraction timestamp (cv.ts), persisted to profile;
  "added X ago" is accurate and persists across sessions by design. Optional: show absolute date for clarity.
- **Delete account** — exists in code (workspace SidePanel ProfileView), renders only when signed in. If it
  was missing *while signed in*, real bug — needs a screenshot to repro before fixing (don't guess).
- **"What I know grows as we talk"** — honest/real: advisor has wired `update_profile`/`remember` tools
  through a working tool loop; profile mirror reads them back. Caveat: depends on the model calling the tools
  — confirm with a quick live test.
