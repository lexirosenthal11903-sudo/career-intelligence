# Company-Factual Grounding Research — real per-employer hiring facts at £0

_Written: 2026-07-05 (Session 51). Purpose: solve the operational gap the interview-prep research left open
(`interview-prep-research.md` §13.2 — "ground named-employer prep in published frameworks" is the principle;
this document works out HOW, at £0 and at scale, and the honest fallback when it can't). Feeds the Fable spec
session for company-factual grounding — reused across interview prep, job-fit, CV tailoring and outreach.
Sourced via the `deep-research` harness (5 angles, 23 sources fetched, 92 claims, 25 adversarially verified 3-vote;
22 confirmed, 3 refuted). Sources cited inline._

**Review date: 2026-07-05 + 6 months (2027-01-05)** — employer process pages change per recruitment cycle; the
business-population stats refresh with the next gov.uk release (~mid-2026). Re-fetch cached employer pages sooner.

---

## The one-line answer (the strategic truth)

**Company-factual grounding is viable for a small, high-value slice of UK employers and impossible for the vast
majority — so the honest fallback is not an edge case, it IS the majority case, and must be first-class.**

Real, current, per-employer hiring-process data exists free only for large graduate-scheme-type employers
(≈**0.15%** of UK businesses). **99.85%** are SMEs; **75%** (4.3m) are owner-only with no published process at
all. Any architecture that only handles the "PwC has a published process" case fails for most users. Build the
fallback as a peer of the grounded path, not a catch.

---

## Confidence tiers (same standard as our other research docs)

- **🟢 EVIDENCE (verified 3-0):** confirmed against a primary/authoritative source by 3-vote adversarial check.
- **🟡 DIRECTIONAL (2-1 or under-covered):** right direction, one dissent or thin sourcing — use, don't over-claim.
- **🔴 REFUTED / DO NOT USE:** failed verification (0-3 or 1-2).

Nothing here is fabricated. Where a claim was refuted it is listed explicitly in "Refuted / corrected."

---

## 1. The source-by-source map (what / licence-legality / freshness / coverage / retrieval)

### 🟢 Tier 1 — Official published frameworks (free, legally clean, reusable) — BUILD ON THESE

**1.1 UK Civil Service Success Profiles (the single strongest source). 🟢 3-0.**
- **What:** the official published recruitment framework. Five assessable elements (Behaviours, Strengths,
  Ability, Experience, Technical); **nine named behaviours** (Seeing the big picture; Changing and improving;
  Making effective decisions; Leadership; Communicating and influencing; Working together; Developing self and
  others; Managing a quality service; Delivering at pace); enumerated assessment methods (written application
  examples, Civil Service judgement test, personality test, interview, assessment centre, and job simulations:
  presentation, in-tray, written analysis, group exercise, role-play, oral briefing).
- **Licence/legality:** **Open Government Licence v3.0 — free commercial reuse with attribution** ("Contains
  public sector information licensed under the Open Government Licence v3.0"). The cleanest possible footing.
- **Freshness:** current live standard (page maintained on gov.uk).
- **Coverage:** every Civil Service / public-body role — a large, nameable employer set.
- **Retrieval:** fetch/ingest gov.uk pages; store as structured JSON in-repo.
- **Caveat (verifier-surfaced):** departments select a *subset* of elements/behaviours per vacancy — so it is
  **framework-level ground truth**; the exact stage sequence for a specific vacancy lives in that job advert.
  Ground the *machinery* (which behaviours, how STAR maps), invite the user's advert for the specifics.
- Sources: gov.uk `/success-profiles`, `/success-profiles-civil-service-behaviours`; OGL v3.0 (National Archives).

**1.2 NHS Values Based Recruitment (VBR). 🟡 2-1 — sector-generic, NOT per-trust.**
- **What:** named NHS assessment methods (structured interviews, multiple mini-interviews, selection centres,
  situational judgement tests, personality tests), plus per-method guides.
- **IMPORTANT correction (🔴 refuted 0-3):** the stronger claim — "VBR is nationally standardised, so hiring
  criteria for NHS-funded roles are publicly documented rather than employer-guessed" — **failed verification.**
  VBR is **sector methodology any trust *can* adopt**, not a specific trust's confirmed published process. Use it
  to ground NHS prep in real sector methods; never present it as "this trust's process."
- **Licence:** NHS/HEE public guidance (HEE folded into NHS England; framework dated 2016 but current policy).
- Sources: hee.nhs.uk values-based-recruitment; VBR Framework PDF (2016).

**1.3 Large employers' own careers pages (per-company ground truth). 🟢 3-0.**
- **What:** big employers publish the **full staged process with named stages, formats and durations** on their
  own official site. Verified exemplar: **Deloitte UK** — five named stages (Apply Online → Immersive Online
  Assessment → Job Simulation → Final Stage Assessment → Outcome), with concrete detail (final stage ≈ 30-min
  prepared discussion + 50-min skills-and-motivation interview).
- **Legality:** it's the employer's **own public content** — the legally safest thing to fetch on-demand (not
  aggregated third-party personal-data reviews). This is the right per-company grounding *primitive*.
- **Freshness:** changes per recruitment cycle → needs a re-fetch/freshness policy, never a stale cache.
- **Coverage:** strong for large graduate-scheme employers; drops off fast below that (see §2).
- **Authority note (🟢 3-0):** TargetJobs itself states its generic outlines are "not definitive lists… just the
  most common structures" and that you should "check the individual employer's website, or ask the recruiter."
  Even the best aggregator points back to the employer's own page as authoritative.
- Sources: deloitte.com/uk early-careers assessment; targetjobs.co.uk recruitment-process guide.

**1.4 Published employer competency systems (framework-level). 🟡 (from prior interview-prep research, Tier A there).**
- Amazon Leadership Principles, EY strengths, Cappfinity-style strengths — the employer publishes the *framework*;
  ground the machinery, not a fabricated question list. (Already covered in `interview-prep-research.md` §2.5.)

### 🟡 Tier 2 — Under-covered in this pass (source map thin — needs a top-up before relying)

The verification set did **not** confirm sourcing/licence terms for these; treat as open (see Open Questions):
- **Glassdoor / Indeed official APIs or licensed data** — is there a *paid or free* legal path to review content?
- **Prospects / TargetJobs / Bright Network employer hubs** — reuse/ToS terms (cite/link vs on-demand-fetch only?).
- **Rate My Placement / Wall Street Oasis** — coverage + terms unknown.
- **Companies House** — confirmed useful for company facts (size/sector/SIC/status) but **not** hiring-process data.

### 🔴 Tier 3 — Do NOT scrape (see §3): Glassdoor / Indeed interview-review free-text.

---

## 2. Coverage — the cliff is the headline finding 🟢 3-0

- **5.7m** private-sector UK businesses (start of 2025, gov.uk Business Population Estimates 2025).
- **8,335 (0.15%)** are large (250+ employees). **99.85%** are SMEs (0–249). **75% (4.3m)** are owner-only, no
  employees, no hiring process.
- **The cliff:** structured, current, company-specific hiring-process data exists free essentially only for the
  large graduate-scheme employers — **<1% of employers.** SMEs "are more likely to rely on CV + interview and
  less likely to use assessment centres" (🟢 3-0), and rarely publish anything.
- **Product consequence:** for a named big employer, grounding will often succeed. For most roles a real user
  actually applies to (SMEs, local firms), **there is no company data to find** — and no amount of cleverness
  changes that. The fallback carries the majority of real usage.

Sources: gov.uk Business Population Estimates 2025; targetjobs recruitment-process guide.

---

## 3. Legality verdict — do NOT scrape Glassdoor/Indeed reviews 🟢 (3-0 / 2-1 across merged legal claims)

Scraping interview reviews for a commercial UK product is hazardous on **two independent grounds**:

1. **Contractual (🟢 3-0).** CJEU **Ryanair v PR Aviation (C-30/14)**: a site operator **can lawfully prohibit
   automated extraction via its terms** even when the data has no copyright/database-right protection. Glassdoor's
   and Indeed's anti-scraping terms bite (subject to national contract-law enforceability). Scraping in breach of
   ToS "could potentially lead to lawfulness issues" under GDPR's lawfulness principle (Slaughter and May).
2. **Data protection (🟢 3-0 / 🟡 2-1).** Interview reviews are **personal data**. The ICO's position: for
   web-scraped personal data, **legitimate interests is realistically the *only* available lawful basis, and it
   is hard to pass** (three-part purpose/necessity/balancing test; scraping is "high-risk, invisible processing";
   no direct relationship with data subjects makes consent unworkable). ICO found **Clearview AI had no valid
   Article 6 basis**.
   - **Caveat (honest):** much ICO reasoning is framed around scraping to *train generative AI*, not scraping
     reviews for grounding — a well-motivated but not identical fit. **A UK solicitor's opinion is warranted
     before any review-site data use** (consistent with our existing outstanding solicitor-review flag).
   - **🔴 Refuted (0-3):** "the lawfulness of scraping remains unsettled pending the Clearview appeal" — the
     harness refuted the framing; treat the risk as real now, not hypothetical-pending-appeal.

**Safe alternatives (the verdict):** official APIs / licensed data · **user-paste** (the user supplies their own
invite) · **on-demand fetch of the employer's own public careers page** (its own content, not third-party reviews).

Sources: Pinsent Masons (Ryanair); ICO lawful-basis-for-web-scraping; Slaughter and May; Pinsent Masons (gen-AI scraping).

---

## 4. Fallback + confidence — how to be honest without bluffing or drowning the user 🟢 3-0

- **The finding (peer-reviewed, IJHCS 2025, 156 ppts; corroborated ACM FAccT 2024):** users trust an advisor
  **MORE** when it acknowledges limits than when it bluffs certainty — **but over-hedging also erodes trust.**
  It's a **medium-confidence optimum** (U-shaped): both maximal certainty and maximal disclaimering lose trust.
  - **🔴 Nuance (refuted 1-2):** the sharper claim that "*medium* verbalized uncertainty produces the *highest*
    trust/performance" did not fully survive — so encode the *direction* (calibrated > bluffing; calibrated >
    over-hedging), not a precise "always sound medium-sure" rule.
- **The authoritative per-company source is the employer's own site or the recruiter (🟢 3-0)** — which is
  exactly what makes the **user-paste-the-invite** pattern correct: the user forwards their real invite, the
  advisor grounds against it. This is the single best move for the no-data majority.
- **Design implication:** for the SME/no-data case → ground in named **sector-generic** process, **invite the
  user to paste their actual invitation**, and signal calibrated confidence ("this is the typical process for
  this sector — check your invite for the specifics") rather than fabricating a process or burying an anxious
  user in caveats.
- **Caveat:** the trust studies are US/English game-decision tasks, **not** anxious job-seekers — plausible
  transfer, untested in our context. Fold into the advisor eval as a check, don't assume.

Sources: sciencedirect IJHCS 2025 (verbalized uncertainty); targetjobs (employer/recruiter authoritative).

---

## 5. Prior art (🟡 under-covered — thin sourcing, treat as directional)

The dominant industry pattern is **batch-extracting interview questions/format from Glassdoor review free-text at
company scale** (e.g. "we analysed 100,000+ Glassdoor reviews" content, Final Round AI, Big Interview). That is
precisely the **legally hazardous** path §3 rules out for us. **The differentiator is available:** most tools
either scrape (legal risk) or stay generic (no grounding). Our defensible lane is **official-framework grounding +
employer-own-page fetch + user-paste**, presented with honest calibrated confidence — grounded *and* clean, which
the scrapers are not and the generic tools are not. (Sources here were mostly blogs — verify before quoting.)

---

## 6. Recommended £0 architecture — layered by confidence (the deliverable) 🟢 synthesis

A four-layer cascade. Try top-down; drop a layer when data is absent; **always** signal which layer answered.

| Layer | Source | Legality | When it fires | Confidence to signal |
|---|---|---|---|---|
| **1. Official frameworks** | Civil Service Success Profiles (OGL); NHS VBR (sector); published competency systems (Amazon LP, EY strengths) | ✅ Clean (OGL / employer-published) | Public-sector, NHS, named-framework employers | High — "this is their published framework" |
| **2. Employer's own page** | On-demand fetch of the specific employer's careers/assessment page | ✅ Safest fetch (their own public content) | Named large/graduate-scheme employer with a published process | High — cite the page, note re-fetch date |
| **3. User-paste the invite** | The user forwards their real interview invitation/process email | ✅ User owns + supplies it | Any employer, esp. when Layers 1–2 miss | High for THIS vacancy — grounded in their doc |
| **4. Sector-generic fallback** | Named sector process (from `interview-prep-research.md` §3 matrix) + calibrated confidence | ✅ Our own curation | The SME/no-data majority | Calibrated — "typical for this sector; check your invite" |

**Never:** Layer 0 = review-scraping (Glassdoor/Indeed free-text). Ruled out on contractual + data-protection grounds.

**Reuse across the loop (one source, many features):** the same Layer-1/2 grounding (Success Profiles behaviours,
an employer's published competencies) feeds **CV tailoring keywords**, **outreach framing**, and **interview prep**
from one fetch — this is the "company-specific intelligence capability, reused across CV/outreach/why-not-hearing-back"
already flagged in `interview-prep-research.md` §13 and the FEATURE-ROADMAP.

**Freshness policy (required):** any cached employer-page grounding carries a fetch date and a re-fetch trigger
(process pages change per cycle). OGL frameworks are stable; employer pages are not.

---

## Refuted / corrected (verification killed these — do not use)

1. 🔴 **"NHS VBR is nationally standardised, so NHS-funded roles' criteria are publicly documented"** (0-3) —
   VBR is sector methodology a trust *may* adopt, not a specific trust's confirmed process.
2. 🔴 **"Medium verbalized uncertainty produces the *highest* trust/performance"** (1-2) — keep the *direction*
   (calibrated beats both bluffing and over-hedging); drop the precise "medium is optimal" claim.
3. 🔴 **"Scraping lawfulness is unsettled pending the Clearview appeal"** (0-3) — treat the risk as live now.

## Open questions (for the Fable spec session / a targeted top-up)

1. Do Glassdoor/Indeed offer an **official API or licensed-data** product that legally exposes review content —
   i.e. a paid path that removes the scraping problem? (Under-covered — verify before assuming "no legal path.")
2. Reuse/ToS terms of **Prospects / TargetJobs / Bright Network / Rate My Placement** employer hubs — cite/link
   vs on-demand-fetch only?
3. Realistic **hit-rate for Layer 2** across the top 100–200 UK graduate employers — how many publish a full
   named staged process (like Deloitte) vs a vague overview?
4. For the SME majority, does **Companies House SIC/sector + gov.uk sector frameworks** let the advisor infer a
   credible sector-generic process that materially beats a pure "paste your invite" prompt?

## Caveats (scope honesty)

Strongest evidence covers a narrow slice (OGL frameworks + one named private employer, Deloitte). Aggregator
sourcing (Glassdoor/Indeed APIs, Prospects/TargetJobs/Bright Network reuse terms, Rate My Placement) is **thin** —
the map is authoritative for frameworks and employer-pages, weaker on aggregators. Ryanair is 2015 EU-retained
precedent; enforceability still depends on national contract law. A UK solicitor's opinion is warranted before any
review-site data use. Trust/uncertainty findings are US game-task studies, untested on anxious job-seekers.

## Sources (primary / authoritative first)

- **gov.uk** — Success Profiles; Success Profiles: Civil Service Behaviours; Business Population Estimates 2025.
- **National Archives** — Open Government Licence v3.0.
- **hee.nhs.uk** — Values Based Recruitment; VBR Framework (2016).
- **Deloitte UK** — Early-careers assessment process (employer-published exemplar).
- **ICO** — The lawful basis for web scraping to train generative AI models.
- **Pinsent Masons (Out-Law)** — Ryanair v PR Aviation (ToS can prohibit scraping); gen-AI data-scraping risks.
- **Slaughter and May** — Data scraping and compliance.
- **Peer-reviewed** — Int. J. Human-Computer Studies 2025 (verbalized uncertainty, 156 ppts); ACM FAccT 2024.
- **Directional/secondary** — targetjobs (recruitment process); prior-art blogs (Final Round AI, The Interview Guys) — verify before quoting.

_Status: harness output (22/25 claims confirmed 3-vote, 3 refuted and listed). Meets the research bar for the
verified tiers; §2 aggregators flagged thin. Cleared to inform the Fable company-factual grounding spec. Re-ground
at the review date; get a solicitor's opinion before any review-site data use._
