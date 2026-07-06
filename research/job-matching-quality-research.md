# Job-Role Matching Quality Research — grounding match in real data, not guessed associations

_Written: 2026-07-06 (Session 51). Purpose: ground and measure how we match a person (CV/background/interests)
to (a) role titles, (b) adjacent "stepping-stone" roles, and (c) live listings ranked by genuine fit — using
free, authoritative data instead of an LLM's guessed associations. Feeds the Fable spec session. Sourced via the
`deep-research` harness. **⚠️ Verification was cut short by a session limit** — 5 claims confirmed 3-vote; ~20 more
were gathered from primary sources but NOT adversarially verified (they errored on the limit, they were NOT
refuted). This doc is therefore two-tiered and the 🟡 tier must be re-verified before any build leans on a specific
figure._

**Review date: 2027-01-06.** ~~Complete the interrupted verification~~ **Top-up DONE 2026-07-06 (Session 53):**
targeted re-verification against primary sources upgraded most 🟡 claims to 🟢 (marked ⬆️🟢 inline below, with
corrections). Still 🟡 after the top-up: the OECD §4 figures and the Royal Society rsif.2020.0898 specifics
(verification cut off by a session limit / paywall — finish in a later pass; both remain directionally sound).

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

### Crosswalks & the UK-fit problem — ⬆️🟢 verified 2026-07-06 top-up (was 🟡)

- ⬆️🟢 **O*NET related-occupations: CONFIRMED — "For each O*NET-SOC code included, 10 primary and 10 supplemental
  related O*NET-SOC codes are listed"** (onetcenter.org data dictionary, related_occupations). Bonus structure:
  primary is subdivided into Primary-Short (5 most closely related, expert-reviewed) + Primary-Long (6–10th);
  supplemental = 11–20th. A **ready-made, quality-ranked adjacency graph** out of the box.
- ⬆️🟢 **O*NET licence: CONFIRMED CC BY 4.0** — attribution wording corrected: credit **"O*NET Resource Center by
  U.S. Department of Labor, Employment and Training Administration"** (not "O*NET Database & USDOL/ETA").
- **O*NET is US-specific** — must be mapped to UK SOC / ESCO ourselves.
- ⬆️🟢 **ESCO↔O*NET crosswalk: CONFIRMED free CSV download** — "All the ESCO occupations are mapped to at least one
  O*NET occupation." Two versions: standard (exact/narrow/broad/close matches) and enhanced (adds related matches,
  lower QA coverage). (esco.ec.europa.eu crosswalk page.)
- ⬆️🟢 **The UK bridging catch: CONFIRMED by ONS verbatim** — "There is no simple mapping from SOC 2020 to ISCO-08,
  even at the most detailed (unit group) level… Many job titles classified to a single unit group within SOC 2020
  are split across two or more unit groups in ISCO-08" (and vice versa); ONS handles it at the **job-title level**
  (~30,000-title coding index), precisely because no clean group-level mapping exists. **Design implication stands:**
  don't present crosswalked titles as exact; keep a curated UK-title layer (National Careers Service) on top.
- **Not yet extracted (fetched, thin on claims):** ONS SOC 2020, National Careers Service profiles, LMI for All —
  covered in `GROUNDED-KNOWLEDGE-PLAN.md` as the UK curation layer; confirm licences there (NCS = OGL, per plan).

## 2. Adjacency / stepping-stone roles — how to do it RIGHT (part-verified 2026-07-06)

The evidence points to a clear best practice: **ground adjacency in real worker mobility, not just computed similarity.**

- 🟡 **Empirical mobility networks beat theoretical similarity.** A Royal Society (rsif 2020) occupational-mobility
  network built from **real job-to-job transitions** (US IPUMS-CPS, 464 occupations, edges = observed transition
  probabilities) uses **where workers actually move**, not computed skill distance, as ground truth. _(Still 🟡:
  publisher page 403'd in the top-up — specifics unverified; treat the design principle as sound, don't quote the
  464/IPUMS specifics until checked.)_
- ⬆️🟢 **Skill overlap tracks real mobility well — CONFIRMED, with precision.** PLOS ONE 2021 (pone.0254722):
  "Our results show that not only can we accurately predict occupational transitions (**Accuracy = 76%**)…" —
  the 76% is an **XGBoost classifier's accuracy predicting whether a transition occurs** between a source and
  target occupation, trained on Skills-Space distance **plus labour-market variables**. Data: **8,002,780
  Australian online job ads (Burning Glass, 2012–2020), 11,000+ unique skills.** Scope caveat: Australian job-ad
  data, not UK — the mechanism transfers, the exact figure is dataset-specific.
- ⬆️🟢 **The rule for stepping-stones — and the example is real:** genuinely adjacent roles **reuse the person's
  existing skills**. The paper's own example: a "Sheetmetal Trades Worker" skillset is highly similar to an
  "Industrial Designer" (framed there as an automation-safe transition opportunity that leverages existing skills).
- **Best £0 synthesis:** use ESCO/O*NET **skill-overlap** as the adjacency engine (buildable from the free data we
  already have), optionally weighted toward directions with real labour demand (LMI) — this surfaces **non-obvious
  adjacent paths** grounded in skills, which is exactly the honest-matching move OECD says is missing (§4).

## 3. Match quality & measurement — how to evaluate ourselves cheaply and honestly (verified 2026-07-06)

- ⬆️🟢 **The benchmark figures are real — CONFIRMED with an important nuance.** Frontiers in AI 2025
  (frai.2025.1660548, Tang et al., survey): **Recall@10 = 0.35–0.40** (PJFNN, Qin et al. 2018, Zhaopin.com data)
  and **HR@10 = 0.452** (CNN-LSTM hybrids, Mao et al. 2023, PJRS benchmarks). **Nuance: these are two different
  prior systems cited in a survey, not one unified benchmark** — and the "even strong systems match a minority of
  the time" framing is OUR inference from those numbers, not the paper's claim. Keep the design implication, don't
  attribute the framing to the source. **Implication stands:** perfect matching is not the bar — honest "here are
  a few worth a look, and why" beats a confident ranked wall.
- ⬆️🟢 **Cold-start is our core hard case — CONFIRMED** (same paper, §2.2): "the cold start problem, where new
  users or items without sufficient interaction data cannot be recommended effectively." (The paper frames it
  generically; "thin CVs / no application history" is our translation — substance matches.) That IS our
  early-career cohort. Design for thin input from day one (the discovery
  conversation is partly a cold-start fix — it elicits signal the CV lacks).
- **Fairness caveat:** standard fairness metrics (demographic parity) **ignore ranking position**, which matters —
  a fair-on-paper list can still bury certain candidates/roles. Note for when we rank listings.
- **Cheap honest evaluation for us:** extend the existing **persona test harness** (from the audit session) —
  persona → expected role directions/adjacencies, checked against the grounded ESCO/O*NET data and a human sanity
  read. £0, matches the `GROUNDED-KNOWLEDGE-PLAN` validation approach. Don't chase offline Recall@k we can't
  compute without interaction data; use persona-vs-grounded-truth + honest human review.

## 4. Honest-matching pitfalls — the OECD evidence is our thesis, quantified 🟡 (OECD primary — STILL UNVERIFIED:
the 2026-07-06 top-up's OECD check was cut off by the session limit; re-run this one cluster before quoting any
specific figure below to a user or in external material. The directional story is consistent across the pass.)

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

1. ~~Complete the interrupted verification~~ **DONE 2026-07-06** for O*NET 10+10 ✅, O*NET licence ✅, ESCO↔O*NET
   crosswalk ✅, SOC↔ISCO lossiness ✅ (ONS verbatim), PLOS ONE 76% + sheet-metal example ✅, Recall@10/HR@10 +
   cold-start ✅ (with nuances recorded inline). **Remaining:** the OECD §4 figures (session-limit cut-off) and the
   rsif.2020.0898 specifics (publisher 403) — one small cheap pass.
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

_Status: harness output + **2026-07-06 targeted top-up (Session 53).** Confirmed against primary sources: the
taxonomy/crosswalk cluster (§1), the PLOS ONE skills-adjacency cluster (§2), and the recommender-benchmark cluster
(§3) — corrections and nuances recorded inline (⬆️🟢 markers). Still 🟡: OECD §4 figures and rsif.2020.0898
specifics. **Cleared for the Fable grounding spec** — the spec may lean on ⬆️🟢/🟢 figures; treat §4 as directional
(the design principles hold; don't quote its numbers externally until the last pass completes)._
