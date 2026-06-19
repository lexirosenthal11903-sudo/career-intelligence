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
