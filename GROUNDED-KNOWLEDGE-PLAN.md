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

## Strategy: narrow and deep, not everything at once
At ~100 users we cannot (and needn't) ground every industry. Depth in a niche out-credibles a generalist.
**Decision needed from Lexi:** the 3–5 sectors to ground first (the ones first users actually want — the
niche industries you keep returning to). We build those to "impeccable", expand later.

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
- Which 3–5 sectors to ground first?
- Confirm £0 stays the hard line (it shapes every choice above).
