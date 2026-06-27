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
| **Process / how-we-work sessions** | **Adopt working-practice tips from the "How Anthropic's Own Team Uses Claude Code" PDF** (recommend next-session-start, before build) |
| **Design sessions** (deferred) | Advisor identity / visual register + the product's final name ("Meridian" dropped; speaks as "Career Intelligence" for now) · homepage redesign |
| **✅ Already done** | advisor actually changes directions/roles · jobs stable per login + daily-new · fewer jobs shown · CV→Profile · "already interested" bug · seniority ceiling · discovery conversation |

---

## ✅ DONE 2026-06-26 — Process session: adopted working-practice tips from the Anthropic Claude Code PDF

_All 11 tips/bonuses adopted as permanent practice → `WORKING-PRACTICES.md`. CLAUDE.md rules 5/10/11 added
(close-the-loop, auto-prune, Claude owns practice timing). CLAUDE.md pruned 389→200. Original brief below._

_Lexi flagged a PDF on her Desktop: **"How Anthropic's Own Team Uses Claude Code / 8 Insider Tips | Learn
AI With Mariah"**. She wants to extract ways to improve how we work and implement the good ones._

**What this session is for:** Claude reads the PDF, pulls out what's concretely applicable to *our* setup
(skills, CLAUDE.md discipline, subagents, plan mode, how we test/handoff, model use), and we decide together
which to adopt. Output: changes to CLAUDE.md / INSIGHTS.md / our working mode, or new skills.

**Recommended timing:** first thing in the next session, before any build — process changes compound, so
the sooner the good ones are adopted, the more every later session benefits. Deliberately kept OUT of the
current Step 2 build thread (don't interleave build and process work).

---

## 🅿️ Session 2026-06-25 — Application-effectiveness research (NEXT research session)

_Agreed at the end of the session that built CV tailoring, cover letters, and the Applications folder.
Lexi's instruction: capture everything in full, do not summarise, do not abbreviate — this is the brief
for the next dedicated research session. Nothing below is from memory; all of it was agreed out loud._

**What this session is for:**
Before building "why am I not hearing back?", outreach, or interview prep, we do the research that
grounds all of them. This session produces `research/application-effectiveness.md` — a structured
research document (same pattern as `research/mentorship-research.md`) that the CV/cover letter/outreach/
interview-prep generation prompts get rewritten against. The point is: the advice the advisor gives
must be backed by evidence, not AI guessing. The research comes first; the prompt rewrites come second.

**Why now (Lexi's words, distilled):** if we build first and research later, we'll need to go back
and forward loads of times fixing things. Doing it in the right order saves that. Everything we build
in Step 2 should be backed by what actually works.

**Source quality — non-negotiable rule:**
Only primary data sources count. Specifically: CIPD research, Reed annual hiring reports, Indeed UK /
LinkedIn Talent Insights UK data, academic hiring studies, ONS labour market data. Career advice blogs
do not count. If a claim cannot be sourced to a primary dataset or peer-reviewed study, the research
document must label it clearly as "widely believed but not verified from a primary source" — never
stated as fact.

**Scope of the research session — every thread, in full:**

### Thread 1 — CVs (what actually works, UK early-career)
What ATS systems actually parse (keyword matching, formatting, file type) — and the reality of how many
employers in the UK actually use ATS (the answer is: large corporates yes, SMEs often not, and the
advice differs by route). What recruiters look for in the first 7 seconds of a CV. What makes bullet
points land versus get skipped. What length is actually right for an early-career / graduate CV. What
formatting genuinely helps vs what looks like cargo-cult advice recycled from American sources.
The seniority difference: a graduate CV is read by different people (often junior HR, campus
recruiters, or the hiring manager directly depending on firm size) and evaluated on different criteria
than experienced-hire CVs.

### Thread 2 — Cover letters (UK norms, do they get read, what works)
The honest answer to whether cover letters actually get read in the UK in 2026 — and how the answer
varies by sector, firm size, and route (direct application vs recruiter submission vs referral). What
makes a cover letter get read versus skipped. What openers kill it immediately. What length is right
(shorter than most people think for UK). What the specific failure modes are. The AI detection problem
in 2026: hiring managers have now been flooded with AI-generated cover letters for 2+ years; there is
active detection happening; authentic voice is now a genuine differentiator. What an AI-generated cover
letter looks like to a recruiter, so our output explicitly avoids it.

### Thread 3 — "Why am I not hearing back?" — dedicated research thread
**This is its own named thread because it is a core feature we are building.** The failure modes
are different from each other and the advice differs depending on the cause. The research needs to
identify and document each failure mode separately:
- ATS filtering: how common is it in the UK, what triggers it, what does and doesn't get through
- Volume reality: how many applications does a typical UK graduate role actually receive? What does
  that mean for response rates? What is a realistic expectation for a user who has sent 10 / 20 / 50
  applications?
- Role-level mismatch: what causes a CV to read as under- or over-qualified, and how does a recruiter
  react to it versus an ATS?
- Timing: UK hiring cycles — when are the high seasons (Jan–Feb, Sept–Oct) and dead periods (Dec, Aug)?
  For an early-career user, applying in the wrong window is wasted effort and the advisor should be
  honest about this.
The advisor must be able to give a specific, probable cause when a user says "I'm not hearing back" —
not just "keep trying." This research is what makes that possible.

### Thread 4 — Outreach (warm intros vs cold, realistic response rates, what gets a reply)
The referral reality: research suggests approximately 30–50% of hires come through referrals or
networking connections. **This number must be verified with UK primary sources** (CIPD, Reed, LinkedIn
UK data) in the research session — it has been noted verbatim as "approximately 30–50%, to be verified"
and must not be used in the product or stated to users until it is confirmed and sourced.
Cold outreach vs warm intro: how different are the response rates, actually? What does cold outreach
to a stranger on LinkedIn actually achieve for an early-career person in 2026? What makes a cold
message get a reply versus get ignored? What sectors or firm sizes respond better to cold outreach
versus others?
**The platform idea raised by Lexi (2026-06-25):** if referrals are that important, the product
should not just help users draft outreach messages — it should help them CREATE the referral
relationships that lead to introductions. This is a product direction idea, not just a feature.
What could that look like? Could the advisor help a user identify who in their network (or second-
degree network) is worth reaching out to for a warm intro? Could it help them build a relationship
over time rather than just send a cold message? This needs a design/strategy discussion before
building — park the idea here and return to it when the research is done and we know what the
evidence actually says about referrals.

### Thread 5 — The recruiter vs hiring manager distinction
A CV is typically screened first by a recruiter (either a recruitment agency or an internal HR/talent
team) who has completely different evaluation criteria from the hiring manager who ultimately makes the
decision. The recruiter is filtering for: does this person meet the stated requirements, do they look
like a safe pass-through, are there red flags. The hiring manager is assessing: would I want to work
with this person, can they actually do this job, do they fit the team. Our CV tailoring and cover
letter advice needs to address both filters, not just one. The research should tell us: at what firm
sizes do recruiters first-filter? In what sectors does the CV go directly to the hiring manager? How
do you write for both audiences?

### Thread 6 — Industry differentiation (where the playbook genuinely differs)
Lexi's instinct is right: different industries look for different things. The research must be specific
about WHERE the playbook actually differs and WHERE the generic advice applies. Not artificially
differentiated — genuinely different. Known examples: creative industries (portfolio/work samples
matter more than CV wording), finance/banking (specific certification expectations, very structured
application processes), tech (GitHub/portfolio for engineers, the CV may be secondary), law (training
contract process is completely different from a standard job application), ops/generalist roles (closest
to the generic advice). The research output should include a reference section on which industries
diverge from the standard playbook and how.

### Thread 7 — The portfolio question
For certain roles and industries — tech, design, content creation, some marketing — the CV is
secondary to a portfolio or body of work. Research: which industries, at which seniority levels? What
does "good" look like for a graduate-level portfolio in these fields? When should the advisor
deprioritise CV advice in favour of portfolio advice? This affects what the advisor says when a user
in these fields asks for help.

### Thread 8 — Interview prep (include now so we don't need a second research session later)
We will build interview prep in Step 2. Do the research now. What are interviewers actually assessing
at entry level / graduate level? The difference between competency-based (STAR format) and strengths-
based interviews (which UK graduate employers have moved toward — Unilever, Deloitte, etc.). What
graduate employers in the UK have said publicly about what makes a candidate stand out vs fail. How
to prepare for a role when you don't have much experience to draw on. The honest advice about what
interview prep actually changes (mindset, framing) vs what it doesn't (you can't fake experience).

### Thread 9 — The AI detection problem (cross-cutting, 2026)
This cuts across all the above: CVs, cover letters, and outreach messages. In 2026, hiring managers
have been receiving AI-generated applications at scale for 2+ years. There is now active detection
happening — some use tools, many have developed pattern recognition. Our output has to pass the "sounds
like a real person" test. The research needs to document: what does AI-generated content look like to
a recruiter? What are the tells? What does authentic voice look like in contrast? This is not just a
prompt engineering question — it affects the philosophy of what we're building. The advisor should be
producing genuinely personalised, specific output that uses the user's actual words and experiences,
not generic template language with their name inserted.

**What this session produces:**
- `research/application-effectiveness.md` — the structured research document, with sources cited for
  every claim, primary data only, UK-specific, early-career focus, 2026-current.
- Prompt rewrites for `tailor_cv`, `write_cover_letter`, and the to-be-built `why_not_hearing_back`
  and outreach tools — all grounded in the research findings.
- A note on which industry differentiations we will and won't encode (scope decision).

**How to run it:**
WebSearch for current UK primary sources. Verify every stat before writing it into the document.
Flag anything that can't be verified from a primary source. Do not build anything in this session —
pure research and documentation. Suggest Opus for this session (reasoning quality matters for
synthesis). Lexi co-creates the document rather than receiving a surprise drop at the end.

---

## Session 2026-06-27 PM — Outreach Slice 2 live-test feedback (Lexi clicked through the live workspace)

_Captured live so nothing's lost. Root-cause findings are Claude's; fixes proposed, not yet built._

**🔴 BUGS (correctness — batch into one fix pass):**
1. **Slice 2 entry points are on the WRONG surface — invisible to real users (root cause, highest priority).**
   The three entry points (role-types nudge "Not all roles are advertised…", direction-detail "Help me reach
   out to someone in X", no-listings "Ask who to reach out to") were built in `/dashboard/roles/RolesPage.tsx`
   + `/dashboard/roles/[id]/RoleDetailPage.tsx`. But the live primary surface is `/workspace` →
   `WorkspaceShell` (SidePanel for Direction/Roles, ChatPane for chat). Returning users never land on
   `/dashboard/roles`, so they never see the entry points. **Slice 2 is effectively non-functional in prod.**
   Fix: re-implement the three entry points in `SidePanel.tsx` (roles + direction views). Paste-to-tailor
   DID work because it lives in the advisor chat/backend (shared across surfaces). **Lesson:** build-time
   green (tsc/lint/build/e2e) didn't catch a feature shipped to a dead surface — the e2e walks the workspace,
   not /dashboard/roles. Consider an INSIGHTS note + a test that asserts entry points render on the live shell.
2. **LinkedIn search link is useless in the found-person case.** `searchKeywords = [roleTitle, company]`
   only (advisor-tools.ts:607) — when the user PASTES a person (foundContext), roleTitle/company are empty,
   so the link searches for nothing / not the pasted person ("doesn't take to her real profile"). Fix: when
   foundContext is present, either build the search from the pasted person's identifiable details, or reframe
   ("you've already found them — here's the message") and drop/soften the search link. Also: the label "Find
   [name] on LinkedIn" implies it's their profile when it's a search — clarify it's a search, not a profile.
3. **Chat: no auto-scroll to newest message on send.** `endRef.scrollIntoView` exists (ChatPane.tsx:522) but
   isn't firing on the user's own send — you have to scroll down manually. Standard chat behaviour; fix it.
4. **Chat: textarea doesn't reset height after send.** Auto-grow sets height to scrollHeight (ChatPane.tsx:771)
   but never resets to 1 row on send, so the box stays expanded. Reset on send.
5. **"+" file-upload button doesn't work when logged in.** The file input exists (ChatPane.tsx:961, accepts
   pdf/doc/docx) but the click/onChange path is broken for the logged-in state. Investigate + fix.
6. **Direction panel: a "1" still renders amber/orange.** Violates the locked design rule (amber ONLY on
   primary button / active nav / user chat bubble; numbered badge in amber = banned). Re-token to neutral.
7. **"Don't scroll endlessly — just tell me what to change" reads like a button but is a static hint**
   (SidePanel.tsx:275). Either make it clearly non-interactive, or make it actually focus the chat input.
8. **Advisor honesty refinement (foundContext prompt).** The draft said "I read your piece on low-income
   households…" when the pasted bio only said she *writes about* those topics — implies a specific artefact
   not in the text. Tighten the foundContext prompt: reference what they actually said ("your writing on X"),
   never invent a specific piece/article. Otherwise the paste-to-tailor draft was strong and correctly
   grounded (referenced FT→policy move, housing, Resolution Foundation; soft ask; one follow-up; honest).

**🟡 FEATURES (capture + decide, don't bolt on):**
- **A. Paste a LinkedIn URL instead of the whole bio.** Lower friction — the user shouldn't have to extract
  the text themselves. ⚠️ HONEST CONSTRAINT: for LinkedIn *specifically* we can't fetch/scrape a profile from
  a URL (never-scrape principle + LinkedIn blocks server fetch). So a pasted LinkedIn *link* can't be read.
  The planned **paste-a-link (server-side fetch + readable-text extraction)** feature works for OTHER public
  pages (a job ad, a company "about" page, a public article) but not LinkedIn profiles. Resolution to discuss:
  keep paste-TEXT for LinkedIn (make it frictionless), use paste-LINK for fetchable public pages. Folds into
  the existing "Paste-a-link" roadmap item.
- **B. Outreach follow-up loop (the advisor remembers + chases gently).** After drafting, the platform asks
  the user to confirm they sent it; ~1 week later asks if they got a reply and whether they want to follow up
  — only if they haven't already said they replied sooner. This is the OUTREACH-specific instance of the
  already-logged "stalled-application nudge + advisor remembers + follows up" system (FEATURE-ROADMAP Step 2).
  Design as ONE memory/agenda/follow-up system, not a separate notifier. Warm, never nagging (anxious user).
- **C. Advisor must remember "I have no warm network" / "stop asking me that."** Today the warm-first probe
  ("do you know anyone there?") is hard-coded in the advisor prompt (advisor-prompt.ts:81) with no skip logic,
  so it asks every time even after the user says no twice. Fix: when the user says they don't know anyone (or
  explicitly asks it to stop), `remember` that fact and the prompt should skip the warm-first probe next time.
  This is a real test of "the advisor has a memory" — currently it would keep asking. Ties to honest-matching
  + the memory tools that already exist; needs the prompt to RESPECT a stored "no-network" fact over the
  hard-coded warm-first instruction.

**✅ Confirmed working:** the "Arlo" rename (no character name visible anywhere); paste-to-tailor core
(the draft referenced genuine specifics from the pasted bio). Test 3 (no-listings) not testable — Lexi had
live listings, which is the expected reason that entry point was hidden.

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
  - **Named references to study (Lexi, 2026-06-24):** **JobCopilot** + **Jobeefy** (we have
    `research/competitor-jobeefy-2026-06-14.md`) — specifically *how they source jobs* (which boards/APIs,
    aggregation vs direct) and *how they match* roles to a user. Pull what's worth adopting for our lane
    (people who don't know what they want) WITHOUT their spray-and-pray gravity. Pairs with grounding our
    own job data (Step 3, National Careers Service / LMI) so matching is credible, not just keyword search.

### Profile concerns checked this session (2026-06-24) — findings
- **CV on file** — NOT a bug. `cvUpdatedAt` is the real extraction timestamp (cv.ts), persisted to profile;
  "added X ago" is accurate and persists across sessions by design. Optional: show absolute date for clarity.
- **Delete account** — exists in code (workspace SidePanel ProfileView), renders only when signed in. If it
  was missing *while signed in*, real bug — needs a screenshot to repro before fixing (don't guess).
- **"What I know grows as we talk"** — honest/real: advisor has wired `update_profile`/`remember` tools
  through a working tool loop; profile mirror reads them back. Caveat: depends on the model calling the tools
  — confirm with a quick live test.

---

### Multi-critic evaluation system (Lexi, 2026-06-27) — the next layer of eval, NOT now
Lexi's idea: 3-4 expert-persona critics (mentorship, recruitment, user) review everything the advisor does
and produces, scoring across usability, mentorship relevance, analytical feedback, ongoing insights, and app
improvement. The next layer on top of the existing bright-line advisor eval (`tests/eval/advisor.eval.mjs`).
On-strategy and worth building — **after** the breadth-first build (it evaluates a product that must exist first).
**Design it in a dedicated session (`/brainstorming` + `/grill-me`; `agent-builder` if persona agents).**
Honest refinements agreed 2026-06-27:
1. **Synthetic critics have a ceiling** — an LLM "recruiter" gives the AI-average of recruiter content (the same
   trap as ungrounded advice). Use them as a fast, repeatable REGRESSION NET, never as proof of real-world
   quality. Gold standard stays: primary-source grounding + eventually REAL mentors/recruiters/users.
2. **No "/1000" single score** — false precision (an LLM can't tell 742 from 781). Use a rubric: each dimension
   1-5 WITH a written reason, rolled into a total. The written critique is the value; the number is a sort key.
3. **The critics must be grounded too** — brief each with our actual research (140:1, the two-tier facts) or it
   will "correct" us toward the myths we deliberately removed.
Ties to: the parked synthetic-persona QA agents (handoff 2026-06-27), [[feedback_research_grounded_building]],
and the run-time hallucination guardrails below.

### Run-time hallucination / relevance guardrails (Lexi, 2026-06-27) — build-time vs run-time distinction
Lexi asked if "sourcing via terminal" is the right approach. Answer: right for HALF.
- **Build-time (terminal):** research + verify against primary sources → bake into prompts. YES, already our
  standard (research-grounded building). The terminal is the correct tool here.
- **Run-time (live product):** the terminal isn't in the deployed path, so it can't verify live answers. Live
  guardrails are separate: (i) prompt constraints / two-tier facts / myth bans [done], (ii) deterministic
  post-processing (e.g. the em-dash sanitiser `src/lib/sanitize.ts`, 2026-06-27), (iii) eventually a RETRIEVAL
  layer so the advisor pulls facts from a vetted store instead of recalling from training, (iv) evals that catch
  regressions (incl. the multi-critic system above). Capture: a retrieval/RAG layer is the eventual run-time fix
  for factual grounding; pairs with the Grounded-knowledge layer (Step 3).

### LinkedIn "Grad's Guide 2025" article (Lexi's desktop, 2026-06-27) — triage its sources, don't quote it
Saved as a PNG screenshot (links not extractable from an image). A LinkedIn-published careers article = Tier B
(commercial/practitioner) by our research standard: a POINTER to primary sources, not evidence itself. Action
when Lexi shares the links/text: triage which trace to primary UK sources (gov.uk/ISE/High Fliers/LinkedIn data)
→ fold into research docs; Tier B → directional only; myths → flag. The article's own prose is AI-average, not
something to adopt wholesale.

### Conversation history view — "see earlier conversations" button (Lexi, 2026-06-27)
Lexi logged in (anon-auth carry-forward CONFIRMED working live: advisor remembered her visa questions +
which roles are worth her time) but couldn't see her earlier transcript on the surface she landed on. Root
cause (likely): conversations are stored per `user_id + page` and reloaded per-surface (`useArloChat` loads
`conversations.messages` for the current page); the returning experience shows a recap, not the full replayed
thread. Memory FACTS are global to the account (separate store), which is why those carried but the transcript
didn't appear. **Nothing is lost** — the data exists; this is a surfacing feature, not a rebuild.
**Feature:** a way to view earlier conversation history (a button / panel listing past threads, openable).
On-mission: continuity = trust for a daily companion ("it remembers you"). Pairs with the existing recap card.
**Priority:** after the candidate-strength loop (outreach + interview prep); part of the daily-companion pillar,
not a now-interrupt. Design choice to settle: full raw transcript vs a cleaner "past conversations" list.
**Day dividers (Lexi 2026-06-27):** group history by day with date headings like WhatsApp/iMessage ("Tuesday",
"Monday", then date) so the user sees what they worked on each day, turning the transcript into a journal of
progress (reinforces the daily-companion feel). Relative labels (Today/Yesterday/weekday) for recent days,
absolute dates for older. The conversation store already has timestamps to drive this.
