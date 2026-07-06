# Job-Role Matching Quality Research — grounding match in real data, not guessed associations

_Written: 2026-07-06 (Session 51). Purpose: ground and measure how we match a person (CV/background/interests)
to (a) role titles, (b) adjacent "stepping-stone" roles, and (c) live listings ranked by genuine fit — using
free, authoritative data instead of an LLM's guessed associations. Feeds the Fable spec session. Sourced via the
`deep-research` harness. **⚠️ Verification was cut short by a session limit** — 5 claims confirmed 3-vote; ~20 more
were gathered from primary sources but NOT adversarially verified (they errored on the limit, they were NOT
refuted). This doc is therefore two-tiered and the 🟡 tier must be re-verified before any build leans on a specific
figure._

**Review date: 2027-01-06.** Complete the interrupted verification (cheap targeted top-up) before Fable builds on the 🟡 tier.

---

## The one-line answer

**The £0 grounding data for good matching exists and is high quality** — ESCO (EU) and O*NET (US) are both free,
open-licensed, machine-readable, and give occupations→skills plus **real occupation adjacency**. The strongest
strategic finding is the OECD evidence that **early-career people genuinely don't know what they want AND narrow
prematurely onto a handful of prestige jobs that don't match labour demand** — which is the exact market our
discovery-first advisor exists for, and the exact failure mode honest matching must design against.

---

## Confidence tiers

- **🟢 CONFIRMED (3-0):** adversarially verified 3-vote against a primary source.
- **🟡 GATHERED (primary source, verification interrupted):** extracted from a primary/authoritative source but the
  3-vote check errored on the session limit — directionally trustworthy, **verify the specific figure before any build.**
- **🔴 REFUTED:** none this pass.

---

## 1. Taxonomies & data — the free grounding sources (source map)

### 🟢 CONFIRMED — the two pillars are free and clean

| Source | What it gives | Licence / cost | Retrieval |
|---|---|---|---|
| **ESCO** (EU) | Occupations, skills/competences, qualifications; occupation↔skill links as linked data | **Free**, all 28 languages; **API self-hostable under EUPL 1.2 + Apache 2.0** | Download (RDF/TTL/CSV/XML/**JSON-LD**) → ingest as JSON in-repo; or run the API locally (£0, no dependency on EU uptime) |
| **O*NET** (US) | Occupations, skills, tasks, and **related-occupation links** | **CC BY 4.0** — free, reusable **with attribution** (credit "O*NET Database & USDOL/ETA") | Download the database |

Both are machine-readable and let us ingest occupations + skills directly — **no LLM guessing associations**, which
is the whole point of the grounding project. ESCO API self-hosting means true £0 with no runtime dependency.

### 🟡 GATHERED — crosswalks & the UK-fit problem (verify before build)

- **O*NET related-occupations: 10 primary + 10 supplemental related SOC codes per occupation** — a **ready-made
  adjacency/stepping-stone graph** out of the box. (validVotes 1, erroredVotes 2 — very likely true, confirm.)
- **O*NET is US-specific** — must be mapped to UK SOC / ESCO ourselves.
- **ESCO↔O*NET crosswalk is a free download** — a bridge between the EU and US taxonomies (connects each ESCO
  occupation to ≥1 O*NET occupation).
- **⚠️ The UK bridging catch:** there is **no clean SOC 2020 ↔ ISCO-08 mapping** — it's **lossy and many-to-many**
  (one SOC group splits across several ISCO groups and vice versa). So role titles grounded in one taxonomy do NOT
  transfer one-to-one to another. **Design implication:** expect imperfect UK mapping; don't present crosswalked
  titles as exact; keep a curated UK-title layer (our National Careers Service curation) on top.
- **Not yet extracted (fetched, thin on claims):** ONS SOC 2020, National Careers Service profiles, LMI for All —
  covered in `GROUNDED-KNOWLEDGE-PLAN.md` as the UK curation layer; confirm licences there (NCS = OGL, per plan).

## 2. Adjacency / stepping-stone roles — how to do it RIGHT 🟡 (primary sources, verify)

The evidence points to a clear best practice: **ground adjacency in real worker mobility, not just computed similarity.**

- **Empirical mobility networks beat theoretical similarity.** A Royal Society (rsif 2020) occupational-mobility
  network built from **real job-to-job transitions** (US IPUMS-CPS, 464 occupations, edges = observed transition
  probabilities) uses **where workers actually move**, not computed skill distance, as ground truth.
- **BUT skill overlap tracks real mobility well.** A PLOS ONE (2021) "Skills Space" built from job-ad skills
  **predicts real occupational transitions at ~76% accuracy** when combined with labour supply/demand — i.e.
  skill-overlap similarity is a *statistically significant predictor* of actual moves, not a theoretical guess.
- **The rule for stepping-stones:** genuinely adjacent roles are ones that **reuse the person's existing skills**;
  successful transitions happen when workers leverage what they already have. (e.g. skill-adjacency can link
  non-obvious pairs like sheet-metal worker → industrial designer.)
- **Best £0 synthesis:** use ESCO/O*NET **skill-overlap** as the adjacency engine (buildable from the free data we
  already have), optionally weighted toward directions with real labour demand (LMI) — this surfaces **non-obvious
  adjacent paths** grounded in skills, which is exactly the honest-matching move OECD says is missing (§4).

## 3. Match quality & measurement — how to evaluate ourselves cheaply and honestly 🟡

- **Even strong person-job recommenders match a minority of the time:** reported benchmarks **Recall@10 ≈ 0.35–0.40,
  HR@10 ≈ 0.452** (Frontiers in AI, 2025). **Implication:** perfect matching is not the bar and we should not pretend
  to it — honest "here are a few worth a look, and why" beats a confident ranked wall.
- **Cold-start is our core hard case:** users with **thin CVs and no application history** are the textbook
  cold-start problem — and that IS our early-career cohort. Design for thin input from day one (the discovery
  conversation is partly a cold-start fix — it elicits signal the CV lacks).
- **Fairness caveat:** standard fairness metrics (demographic parity) **ignore ranking position**, which matters —
  a fair-on-paper list can still bury certain candidates/roles. Note for when we rank listings.
- **Cheap honest evaluation for us:** extend the existing **persona test harness** (from the audit session) —
  persona → expected role directions/adjacencies, checked against the grounded ESCO/O*NET data and a human sanity
  read. £0, matches the `GROUNDED-KNOWLEDGE-PLAN` validation approach. Don't chase offline Recall@k we can't
  compute without interaction data; use persona-vs-grounded-truth + honest human review.

## 4. Honest-matching pitfalls — the OECD evidence is our thesis, quantified 🟡 (OECD primary, verify)

This is the strongest strategic material in the pass. It **validates the whole product** and names the failure modes:

- **~39% of OECD 15-year-olds are "career uncertain"** (no clear job expectation), and uncertainty has **risen
  since 2000.** → A large share genuinely don't know what they want — **discovery-first, not job-search-first, is
  the right product.** This is our market, evidenced.
- **Premature narrowing is real and measurable:** on average **50% of girls / 44% of boys expect one of just the
  ten most popular jobs**, concentration **rising since 2000.** → Honest matching must **surface non-obvious
  adjacent paths** and resist collapsing to the obvious few.
- **Stated desire ≠ fit ≠ opportunity:** career expectations **bear little relation to actual labour-market demand**
  — narrowed onto a limited set of traditional high-status jobs that stay out of reach. → The "mistaking stated
  desire for fit" pitfall is real; the advisor's honest-matching duty (already our differentiator) is evidence-backed.
- **Popularity/prestige bias, quantified:** expectation of a "professional" occupation grew **48% (2000) → 59%
  (2022)** across 18 OECD countries while all other groups held or fell. → Unguided aspiration drifts to
  prestige, not fit.
- **And it hurts outcomes:** career **concentration is associated with poorer ultimate employment outcomes.** →
  Breadth-before-narrowing isn't just nice; narrowing to popular roles **measurably harms** the user. This is a
  hard, on-mission reason to build breadth-first discovery and honest adjacency.

**Design principle (from all of the above):** breadth before narrowing; surface skill-adjacent non-obvious paths;
be transparent about *why* a match was made; never mistake a stated prestige desire for genuine fit; set honest
expectations (matching is hard even for the best systems). This is the honest-matching persona rule, now grounded.

## 5. Prior art 🟡 (sources fetched, claims thin — top up before relying)

Primary sources were fetched but not fully mined: **LinkedIn skills-graph engineering blog** (how a large skills
taxonomy is built/maintained) and **Lightcast Open Skills** (a free open skills library). State of the art is
**skills-based, not title-based** matching — which aligns with §2's skill-overlap approach and is realistically
copyable at £0 via ESCO/O*NET skills. Jack & Jill / CareerExplorer / Sokanu specifics were not extracted this pass
(open question).

---

## Recommended £0 approach (synthesis — from confirmed + gathered)

1. **Ground titles + skills in ESCO** (self-hosted API or ingested JSON) — free, clean, no LLM guessing.
2. **Adjacency engine = skill-overlap similarity** over ESCO/O*NET skills (optionally + O*NET related-occupations
   as a ready graph), weighted toward real labour demand (LMI) — surfaces non-obvious, genuinely-adjacent paths.
3. **Keep a curated UK-title layer** (National Careers Service, OGL) on top, because SOC↔ISCO/ESCO bridging is lossy.
4. **Design for cold-start** (thin CVs) — the discovery conversation elicits the signal the CV lacks.
5. **Honest matching by construction** — breadth before narrowing, explain the "why", resist prestige-desire-as-fit,
   set honest expectations. Evidence: OECD §4.
6. **Evaluate with the persona harness** vs grounded truth + human review — £0, no interaction data needed.

## Open questions / to finish

1. **Complete the interrupted verification** — re-run the 3-vote check on the 🟡 claims (targeted, cheap) before
   Fable builds on any specific figure (esp. the 76% Skills-Space accuracy, the Recall@10 benchmarks, O*NET 10+10).
2. Confirm **National Careers Service / LMI for All / ONS SOC** licences + retrieval (cross-ref `GROUNDED-KNOWLEDGE-PLAN`).
3. Mine the **prior-art** sources (LinkedIn skills graph, Lightcast Open Skills, Jack & Jill) for concretely copyable moves.
4. Is there a **UK-specific** occupational-mobility dataset (the transition studies are US/OECD) — ONS Longitudinal Study?

## Sources (primary first)

- **ESCO** — download page; ESCO API (Escopedia) — free, EUPL 1.2 + Apache 2.0.
- **O*NET** — onetcenter.org/database (CC BY 4.0); ESCO↔O*NET crosswalk (ESCO portal).
- **ONS** — SOC 2020 ↔ ISCO-08 classification note (the lossy-mapping source).
- **Royal Society Interface** (2020) — occupational-mobility network from real transitions. rsif.2020.0898.
- **PLOS ONE** (2021) — Skills Space predicting transitions (~76%). journal.pone.0254722.
- **Frontiers in AI** (2025) — person-job recommender benchmarks + cold-start. frai.2025.1660548.
- **OECD** — The State of Global Teenage Career Preparation (2025); Challenging Social Inequality Through Career Guidance (2024). _(career uncertainty; concentration; prestige bias; outcomes)_
- **LinkedIn Engineering** — skills-graph taxonomy blog; **Lightcast** — Open Skills. _(prior art, to mine)_

_Status: harness output, **verification interrupted by session limit** — 5 claims 3-0 confirmed, ~20 gathered from
primary sources unverified (listed 🟡). NOT yet at the full research bar. Cleared to inform the Fable spec as
tiered input; complete verification of the 🟡 tier before building on specific figures._
