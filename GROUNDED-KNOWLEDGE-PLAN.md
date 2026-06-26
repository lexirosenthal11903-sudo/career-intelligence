# Grounded Knowledge Layer — scoped project (2026-06-23)

_Goal: stop the platform relying on the AI's memory for facts. Use real, authoritative, **free** data
for facts; use the AI only for judgment and voice. This is what takes the product from "plausible" to
"trustworthy" — and it fixes job relevance AND advice credibility with one piece of infrastructure._

## The principle (the new standing rule)
Anywhere the advisor or the analysis states a **fact** — a salary, a required skill, an entry route, a
typical progression, a company detail, a growth trend — that fact should come from real data, not the
model's training. **AI for judgment and voice; real data for facts.** Every place we currently let the AI
guess a fact is a grounding opportunity (mapped below).

## Hard constraint: £0
No paid services. That rules out paid embeddings (Voyage/OpenAI) and paid data APIs. The design below uses
only free, openly-licensed sources and infrastructure we already pay nothing for (JSON in the repo +
lookup code on Vercel). Semantic search, if ever needed, uses a **free local** embedding model
(transformers.js) — never a paid API.

## Free, credible UK data sources (with licences — this matters)
| Source | What it gives | Licence / cost |
|---|---|---|
| **National Careers Service** job profiles | Entry routes, skills, day-to-day, typical employers, salary bands — for hundreds of roles | Open Government Licence — **free to reuse** ✅ |
| **LMI for All** (gov API) | Real salaries, employment numbers, growth/demand by occupation | Free API (free registration) ✅ |
| **ESCO** (EU) | Structured map of skills↔occupations and **adjacent/related occupations** | Open data, **free** ✅ |
| **O*NET** (US) | Skills, tasks, and progression per occupation (good cross-check) | Open, **free** ✅ |
| **Companies House** (UK gov API) | Real company data: size, status, sector, incorporation | Free API ✅ |
| ~~Prospects.ac.uk~~ | (Great content, but **copyrighted** — Jisc/AGCAS) | ❌ Not reusable. Use only as a reference for our own curation, never ingested |

## £0 architecture
1. **Curate a structured dataset** for our priority sectors from the free sources above → store as JSON in
   the repo (`data/careers/*.json`). No database, no cost. Each role record: entry routes, required +
   nice-to-have skills, typical salary band (LMI), gateway/adjacent roles (ESCO), typical progression,
   sources cited.
2. **Retrieval = structured lookup** (by role / sector / skill) over that JSON. For a curated niche
   dataset this is enough and is free — no vector DB, no embeddings. (If we later want fuzzy matching, add
   a free local embedding model; still £0.)
3. **Feed the grounded facts to the advisor + analysis** as context to reason *from* (it cites, stops
   inventing). LMI/Companies House can also be called live (free) for fresh numbers.

## Grounding opportunities (where the AI currently guesses — proactive map)
1. **Salaries** — today: Adzuna's listed salary + AI-stated ranges in advice. Ground in **LMI for All**
   → real UK pay by role + region. Stops invented numbers.
2. **Skills & gaps** (Skills tab) — today: AI invents the gaps. Ground in **ESCO/O*NET** → the skills a
   role genuinely needs, mapped to it.
3. **Gateway / adjacent roles** (the pathway feature just shipped) — today: AI guesses the stepping-stone
   roles. Ground in **ESCO occupation relationships** → real adjacency, not plausible-sounding.
4. **Entry routes & progression** — today: AI's memory. Ground in **National Careers Service** profiles.
5. **Demand / "this field is growing"** — today: AI assertion. Ground in **LMI** employment-growth data.
6. **Company claims** ("a small boutique", sector) — today: unsourced. Ground in **Companies House**.
7. **Role→search-category mapping** (the Adzuna category map I hand-rolled) — could be grounded in a real
   ESCO↔ISCO↔Adzuna crosswalk later. Minor.
8. **Employment rights & work law** (NEW, Lexi 2026-06-26) — today: the advisor would AI-generate any
   legal claim, which is both a liability and a safety risk for an anxious early-career user (e.g. telling
   someone an unpaid "internship" is fine when worker status legally entitles them to minimum wage). Ground
   in **gov.uk + ACAS** primary pages — never invent. Scope: intern/worker status & pay
   (https://www.gov.uk/employment-rights-for-interns), National Minimum/Living Wage, contract types,
   probation, what an employer can/can't ask, holiday/sick basics. This is its own legal-knowledge thread:
   curated, sourced, advisor-retrieves-never-generates. On-mission (protective + honest register). Distinct
   from the application-effectiveness research (that's "how to get hired"; this is "your rights at work").

## High-stakes / curated-knowledge & guardrails (NEW category, Lexi 2026-06-26)

_Distinct from the factual grounding above. That list makes facts **accurate**; this is about **regulated or
high-harm domains** the advisor will get pulled into, where AI-guessing is a safety + liability risk and a free
authoritative source exists. Employment rights (item 8 above) was the first instance Lexi spotted — it's actually
a cluster._

**The governing principle (adopt platform-wide): in any regulated or high-harm domain, the advisor INFORMS and
SIGNPOSTS — it never ADVISES.** It gives the general rule and points to the authoritative source or a regulated
adviser; it never tells one user what *they specifically* should do, and never invents the rule. This one rule
covers most of the legal/safety exposure, and it *is* the honest, protective register that's already our edge.

The five domains, each £0-groundable from authoritative UK sources:

1. **Right-to-work / visas / sponsorship** — affects international students & Graduate-visa holders heavily; the
   advisor must not match them to non-sponsoring employers or assert their personal eligibility. Immigration
   advice is *regulated* (OISC, now the IAA — giving unauthorised advice is a criminal offence; verify the
   rename before external use). Sources: **gov.uk** + the free **register of licensed sponsors** (could filter/flag
   sponsoring employers in listings). Inform + signpost only.
2. **Mental health / distress** — our cohort is anxious by definition; the advisor will hit real distress. Already
   a hard rule in `ADVISOR_PERSONA.md` §5: **recognise → don't treat → signpost** (Samaritans 116 123, NHS 111,
   student services). A duty-of-care floor, not a feature.
3. **Discrimination & disability rights in hiring** — what an employer legally can't ask, reasonable adjustments,
   disability/neurodivergence disclosure, Access to Work. Sources: **EHRC, ACAS, gov.uk** (Equality Act 2010).
4. **Job-scam / fraud protection** — early-career jobseekers are prime targets (upfront-fee, money-mule, fake
   roles). Since we push outreach + listings, a "spot a scam / verify the employer" layer is protective and
   on-mission. Sources: **JobsAware, Action Fraud, Companies House**.
5. **Regulated-profession entry routes** — law's SQE is one of many *mandatory* regulated routes (medicine,
   nursing/NMC, teaching/QTS, accountancy/ACA-ACCA, architecture/ARB, social work, financial advice). Guess one
   and the user loses years — these need a higher-confidence curated tier than generic National-Careers-Service
   route text.

**Staging:** the guardrail principle + crisis/regulated signposting go in the advisor's system prompt + persona
**now** (cheap, the genuinely risky gap, must precede real users). Item 8's `(NEW…)` employment-rights thread and
the curated, sourced, dated corpus for all five domains is the proper **Step 3** build (retrieval over a vetted
corpus, with review dates — laws change). A short "information, not advice" line belongs in the ToS (pre-launch list).

## Strategy: broad foundation first, then deepen (revised 2026-06-23)
Earlier note said "pick 3–5 sectors". Revised after talking to Lexi: the free sources are **full
downloadable datasets**, so broad coverage is no harder than narrow — we ingest ALL main sectors once,
then deepen the ones first users actually use. Breadth now, depth where it earns it.

### The main UK career sectors (from the National Careers Service taxonomy = our data source)
Grouped by relevance to a graduate / early-career audience. Each carries multiple **paths** within it —
that's the layer below sectors that the grounding data also gives us (entry route → progression).

**Core (most first users):**
- **Creative & media** — design, content, film/TV/production, publishing, advertising creative, arts/galleries, fashion
- **Marketing, PR & communications** — brand, digital/social, PR, comms, market research
- **Business & finance** — accounting, banking, investment/wealth, insurance, financial analysis
- **Computing, tech & digital** — software, data/analytics, product, UX, cyber, IT
- **Science & research** — research, lab science, R&D, environmental science
- **Law & legal** — solicitor/paralegal routes, compliance
- **Management & consulting** — strategy, operations, management consulting, project management

**Broader (cover in the same pass — data is free):**
- **Engineering & manufacturing** · **Healthcare** · **Teaching & education** · **Government, policy & public sector** ·
  **Charity, social impact & NGO** · **Hospitality, travel & events** · **Retail & sales** · **HR & people** ·
  **Property & built environment** · **Logistics & supply chain** · **Social care** · **Environment & sustainability**

### Paths within sectors
Each sector isn't one thing — e.g. *Creative & media* splits into editorial, production, design, brand, arts
administration, each with its own entry route, gateway roles and progression. The grounding data (National
Careers Service routes + ESCO adjacency) gives us this path layer for free, so "directions within an
industry" become real and navigable, not invented.

### So the only real decision left
Not "which sectors" (we do them all) but **which 2–3 to deepen to 'impeccable' first** — driven by who the
first users actually are. That can wait until there are first users; the broad foundation doesn't.

## Honesty as a feature
Even grounded, the advisor flags the edge of what it knows ("this part I'm less sure of for your case")
rather than bluff. Knowing its limits is part of being trustworthy.

## How we'll know it's right (validation)
Extend the persona test harness built in the audit session: persona → expected advice/facts, checked
against the grounded source data. That's how we measure "impeccable" instead of hoping.

## Suggested build order (each is shippable + £0)
1. **LMI salaries** — smallest, highest trust gain (real pay everywhere we mention money).
2. **ESCO skills + adjacency** — powers grounded skills gaps AND gateway roles (the pathway feature).
3. **National Careers Service** entry routes for the chosen niche sectors.
4. **Companies House** for company claims.
Sequence after the new-user flow work; revisit cost assumptions before each (all currently £0).

## Open decisions for Lexi
- Confirmed: cover ALL main sectors in the foundation pass (the data is free + bulk). ✅
- Later (once there are first users): which 2–3 sectors to deepen to "impeccable" first.
- Confirmed: £0 stays the hard line — no new paid services beyond the existing Claude/Anthropic API. ✅
