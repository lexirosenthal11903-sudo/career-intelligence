# Analysis Pipeline — Grill Session
_Status: Complete — 2026-06-15_
_Session 28, 2026-06-15_

## Summary & Key Decisions

7 prompt/code fixes confirmed for immediate implementation:
1. `PROFILE_SYSTEM` — add mentor voice instruction for valuesSignals
2. `PROFILE_SYSTEM` — add honesty rule for pivot/non-traditional candidates
3. `PROFILE_SYSTEM` — add thin-CV safety net rule
4. `PROFILE_SYSTEM` — add "surprise direction" rule with UX framing
5. `PROFILE_SYSTEM` — fix "broadcast" keyword guidance to more specific terms
6. `score/route.ts` — raise seniority penalty: senior title on junior profile → score 3 (filtered out)
7. `RolesPage.tsx` — fix copy: "Adzuna" → "Adzuna and Reed"

Separate sessions needed:
- Thin-CV detection → Arlo follow-up questions in InputChat (interaction design session)
- User archetype grill session (more depth needed, 9 types identified)
- Test character building (after archetype grill)
- CharityJob API integration (Phase 3b)

## Q&A Log

**Q1: What's the quality bar for a "passing" direction?**
Agreed standard: a direction passes if the "why" contains at least one piece of evidence that would be obviously wrong if sent to a different user — a named employer, a specific role held, a real achievement. Generic positive framing ("strong background in X") fails.
- Pass: "You spent two years at Innocent Drinks managing sustainability partnerships — that stakeholder work and impact focus suggests a strong fit for corporate ESG roles at consumer brands."
- Fail: "You have a strong background in sustainability and partnerships, which could suit ESG roles."

**Q2: What's the honesty standard when a candidate is making a non-traditional pivot?**
Lexi noted: when she ran her CV (design graduate, moving into strategy), the pipeline said something like "you have an unusual background — you'll be up against economics and maths graduates who are more traditionally suited. This is a good time to build skills and certifications."
She valued this. Key insight: the best output has **honest momentum** — it names the competitive reality AND gives a concrete response to it. It doesn't leave the user with discouragement; it redirects to action.
Current prompt ("be honest, not falsely positive") is too weak. It doesn't tell the model WHEN to flag competitive disadvantage or HOW to frame it constructively.
**Decision flagged:** the prompt needs an explicit honesty rule for pivot/non-traditional candidates.

**Q6: Company matches — useful signal or orphaned output?**
Two separate fields exist:
- `companySuggestions` (company types with "why") — shown in direction card. Useful now.
- `companyValues` (3-5 named UK employers with culture/values) — computed but has no UI home. Orphaned.

Named employers (`companyValues`) only become useful when: outreach is built (Phase 3b), or careers page links are added, or "companies worth watching" section is surfaced.
**Decision: `companySuggestions` (types) → keep, shown in direction card. `companyValues` (named employers) → keep computing, feeds Phase 3b outreach, no new UI until outreach session.**

Also surfaced: "surprise directions" — even for users who state a clear direction, the pipeline should include at least one adjacent/unexpected direction they haven't considered. Not currently in the prompts.
**Decision: add "surprise direction" rule to PROFILE_SYSTEM. ALSO: the "why" for an unexpected direction must acknowledge the surprise explicitly — "This one might not have occurred to you — here's why your background points here..." — otherwise users won't understand the suggestion. This is both a prompt rule and a copy decision.**

**Q7: Keywords — confirmed bugs from real usage**
Two known failures:
1. "Broadcast" → returns AV/transmission engineering roles, not TV/radio editorial. Sector collision — the term is too broad and gets dominated by technical roles.
2. Seniority mismatch — senior roles appearing for junior profiles even with graduate modifier on some keywords. score.js applies a penalty but doesn't filter — senior roles still surface if there aren't enough junior ones.

Keyword refinement is empirical, not a grill session. Fix approach: structural prompt rules now (based on known failures), then test with 3 real characters, observe patterns, iterate.
**Fixes to implement: replace "broadcast" guidance with more specific terms ("television", "radio", "media production"); add explicit seniority filter instruction to score.js or strengthen the penalty for junior profiles.**

**Q9: Reed — live in production, deduplication status, other boards**
REED_API_KEY confirmed added to Vercel Production + Preview. Reed is live.
Deduplication: already implemented in RolesPage.tsx line 193 — normalised title+company key across both boards. Same job on Reed + Adzuna gets one entry. Working correctly.
Bug found: Roles page copy says "pulled from Adzuna" only — needs updating to mention Reed.
Other boards assessed:
- CharityJob — highest value add. Specifically fills the gap for charity/NGO profiles where Adzuna + Reed are still thin. Has an API. Phase 3b addition.
- Prospects — graduate-specific listings, directly suits our user. Phase 3b.
- Guardian Jobs, Milkround — diminishing returns given Adzuna + Reed coverage.
- Indeed — public API closed. Not viable.
**Decision: CharityJob API is the priority third board. Phase 3b, not this session.**

**Q8: Seniority mismatch — scoring problem or keyword problem?**
Answer: both. Keywords upstream are the primary cause (mixed seniority pool coming in). Scoring penalty is a backstop but too weak — score of 4 passes the filter.
**Decision: Option A confirmed. Fix keywords first (more junior-specific terms for early-career profiles) + raise seniority filter: senior title on a junior profile → score 3, which is below the filter threshold and removes it entirely. Exception: if the scoring model explicitly rates it high anyway (i.e. the role is actually appropriate despite the title), it passes. This will be iterated as real profiles come in — treat as v1, not final.**

**Q5: What's the right register for values signals?**
Current prompt enforces "You" opener and specific evidence, but doesn't reference Arlo's voice at all. Risk: model produces warm-but-vague output (mentor energy, no specificity) — which is worse than clinical, because it feels personal without being personal.
Fix proposed: add one line to PROFILE_SYSTEM setting the register — "Write valuesSignals in the voice of a trusted mentor who just read this CV: warm, economical, direct. Specific enough that a different person reading it would know it wasn't written about them."
Target: warm AND specific. Not clinical. Not flattering. Arlo's voice with CV-anchored evidence.
**Decision: CONFIRMED. Add mentor voice instruction to PROFILE_SYSTEM for valuesSignals.**

**Q3: How do we test the pipeline without real CVs?**
Lexi: build proper test characters first — not CVs made up on the spot. Case studies that represent realistic user types, with enough background detail to generate a realistic CV from them.
**Decision: build 3 test characters as part of this grill session before any prompt testing.**

Lexi also surfaced a second, more significant point: the thin-CV problem shouldn't be solved purely in the analysis prompt. If Arlo detects a sparse CV, it should ask follow-up questions *before* running analysis — modules, projects, anything the person is proud of, retail experience, whatever fills the picture. This is an interaction design decision (Arlo in InputChat, not an analysis prompt fix alone).
**Decision flagged:** thin-CV detection → Arlo follow-up questions in InputChat. The analysis prompt thin-CV rule is a safety net, not the primary fix. Where exactly this detection/trigger lives needs a dedicated design decision (session or Q&A).

## User Archetypes (for test character building — separate session)

Nine types identified. All are valid users of the platform — not graduates exclusively.

1. **Direction-confident** — has a direction, degree-relevant, wants to be a stronger candidate
2. **Direction-blank graduate** — has a degree, no idea what to do with it
3. **Niche-to-niche / niche-to-mainstream pivot** — worked in something specialised, wants to move
4. **Degree-divergent** — studied one thing, wants a job in a different field
5. **Long-term pivot** — years in one role/sector, wants out
6. **Creative wanting commercial stability** — arts/design/music background, skills real but invisible to job boards
7. **Second-chance path** — no degree or non-standard education (vocational, apprenticeship, self-taught)
8. **Burnt-out specialist** — competent but hollow, moving toward purpose
9. **International graduate** — non-UK qualifications, right-to-work complexity, wants to stay in UK

**For pipeline testing (3 to pick):** should test the most different branches of the analysis logic. Recommended: #2 (direction-blank, typical case), #3 or #6 (niche — tests sector-aware keywords), and #5 or #8 (pivot — tests honest momentum rule). Exact characters need a grill session before building.

---

## Open Flags

- **Self-knowledge questions not visible in input flow** — Lexi confirmed she doesn't see them when using the product. The API accepts `selfKnowledge[]` but the questions may not be surfacing in the InputChat UI. Needs investigation: are they in the UI code or only in the API schema? Separate to the thin-CV trigger work but related.
- **Thin-CV detection (Option A confirmed)** — Arlo asks targeted follow-up questions in InputChat when CV is sparse. Design session needed to define: what triggers detection, which questions Arlo asks, and how the handoff to analysis works. Do not build until this session happens.
- **Test characters** — need a grill session on user archetypes BEFORE building the characters. Lexi doesn't want characters built unprompted.
