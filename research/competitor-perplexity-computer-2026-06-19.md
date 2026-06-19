# Competitor Research: Perplexity Computer — Job Applications
**Date:** 2026-06-19  
**Researched by:** Claude Code (Session 35)

---

## What it is

Perplexity Computer is Perplexity AI's $200/month autonomous agent product. The job applications workflow is one template within it — not a standalone product. There is no dedicated job search UI or onboarding. The user types a goal in natural language and the system executes it.

**Not a standalone competitor. A different product for a different user.**

---

## Core feature set

| Feature | What it does |
|---|---|
| Profile Analysis | Parses LinkedIn via OAuth — experience, skills, education — builds candidate summary |
| Role Matching | Scans job boards, filters by location/seniority, surfaces strongest fits |
| CV Tailoring | Rewrites CV per role — mirrors JD keywords, formats for ATS |
| Cover Letter | Custom letters per role with company context woven in |
| Connect Your Tools | LinkedIn, Gmail, Notion, Google Sheets, Google Docs, 400+ OAuth connectors |
| Remember & Learn | Remembers preferences, targets, past applications across sessions |
| Monitor & Alert | Watches for new postings matching profile, pings on high-fit roles |
| Interview Prep | Question banks, STAR-format answer outlines, company briefings |
| Offer Evaluation | Salary benchmarking, red flag analysis |
| Application Tracking | Maintains spreadsheets, monitors inbox for replies |

---

## How it technically works

- **Cloud sandbox:** 2 vCPUs, 8GB RAM, real browser, real filesystem, Python/Node.js
- **Core model:** Claude Opus 4.6 (Anthropic) for reasoning
- **Sub-agent routing:** 19 models available — Gemini for deep research, Grok for speed, GPT 5.2 for long context. Each subtask routed to the best model. Users never see the seams.
- **LinkedIn data:** OAuth connector, NOT scraping. User authorises access once.
- **Execution:** Async. You give a goal, walk away, come back to finished outputs.
- **Checkpoint reviews:** User can pause, inspect the plan, approve before execution continues.
- **Output format:** Tailored CVs, cover letter docs, tracker spreadsheets — stamped "Generated with Perplexity Computer" (users dislike this watermark)

**Key insight for our architecture:** The multi-model routing (different models for different subtasks) is the right pattern. We already do this: Haiku for scoring, Sonnet for analysis. The user should never see the seams. This is the right approach — not exposing separate agents to the user.

---

## Pricing

- **$200/month** (Perplexity Max tier) — the only tier with Computer access
- 10,000 credits/month included
- Auto-refill up to $2,000 additional spend
- Enterprise: $325/seat/month
- Credit costs unpredictable — no published table

**This is not for graduates or early-career users.** The price point alone rules out our target market entirely.

---

## Design observations

**What's strong:**
- Clean serif typography (editorial feel — confident, not corporate)
- Cream/off-white background (#F4F2EE range) with charcoal text — similar register to our palette
- Dark pill CTA button (charcoal/near-black)
- Card grid layout for features — generous whitespace, no clutter
- Loading checklist pattern: step-by-step with icons, each step described in plain English
- Hero: large serif headline + short subhead + single input field. Extremely focused.
- The "From profile to pipeline" section: 3 cards with illustration + label + description — clean and scannable

**What their homepage does that ours doesn't yet:**
- Feature grid with icons — makes the product feel complete and trustworthy
- Social proof / implied authority (Perplexity brand carries weight)
- Single input field as the hero CTA (linkedin.com/in/yourprofile) — reduces decision-making

**Aesthetic reference for our homepage redesign:** Use Perplexity Computer's landing page as a secondary reference alongside Resend/Linear. Specifically: the feature card grid, the loading step pattern, the confident serif headline style.

---

## What's weak / what our product does better

- **Fails undirected users completely.** "Vague instructions produce poor outcomes" — direct quote from reviews. An anxious graduate with no clear target would have nothing useful to type.
- **No emotional intelligence.** Zero acknowledgement of anxiety, uncertainty, or the discovery phase.
- **No self-knowledge layer.** No questions about what energises you, what you want to move away from, what your values are. Pure execution, zero discovery.
- **Confident-sounding errors.** Outputs require human review before acting on.
- **Connector instability.** Works brilliantly one day, produces garbage the next.
- **$200/month.** Our entire market cannot afford this.
- **No Arlo equivalent.** No advisor persona. No relationship that builds over time. No memory of what landed emotionally vs what didn't.
- **No direction-finding.** If you don't know what direction to go, you cannot use this product.

---

## Strategic positioning — confirmed

Perplexity serves: someone who **knows what they want** and needs the application process automated.  
We serve: someone who **doesn't know what they want** and needs to understand themselves first.

These are sequential problems, not competing ones. Our user graduates to their user. If we do our job well, someone who uses us for 6 months to find their direction is then ready for a tool like Perplexity to help them apply efficiently.

**This makes Perplexity a potential future integration, not a competitor.**

---

## Features to learn from / park for our roadmap

See `parking-lot.md` for full list. Priority items:

| Feature | Priority | Notes |
|---|---|---|
| LinkedIn OAuth import | Phase 4 | OAuth not scraping. Major friction reduction vs CV upload. |
| Monitor & Alert | Phase 4 | Email/push when new high-fit roles appear. "Arlo spotted something" |
| CV tailoring per job | Phase 3c | Already on launch gate |
| Cover letter per job | Phase 3c | Already on launch gate |
| Interview prep via Arlo | Phase 4 | Arlo briefs you before an interview — natural extension of the relationship |
| Offer evaluation | Phase 5 | Arlo helps assess if an offer is right — salary, culture, red flags |
| Application tracker export | Phase 4 | Export saved applications to Google Sheets — light version of their integration |

---

## What NOT to take

- Multi-agent exposure to user — wrong for our emotional register. Arlo must feel like one person.
- Async execution as a primary pattern — our users need real-time conversation and reassurance
- Tool integrations (Gmail, Notion, Sheets) — too complex for Phase 3-4
- CV watermarking — never do this
- Credit-based pricing — opaque and anxiety-inducing, wrong for our user

---

## Sources

- Perplexity Computer landing page: perplexity.ai/gen/computer/job-applications
- [The Resume Writers review](https://theresumewriters.com.au/perplexity-computer-for-job-search/)
- [SentiSight overview](https://www.sentisight.ai/what-is-the-new-perplexity-computer-how-does-it-work/)
- [Karo Zieminski Substack review](https://karozieminski.substack.com/p/perplexity-computer-review-examples-guide)
- [Low Code Agency review](https://www.lowcode.agency/blog/perplexity-computer-review)
- [3box.ai guide](https://3box.ai/blog/perplexity-ai-job-research-guide)
