# Parking Lot

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
