# Start here

_The one place to get oriented. If you only open one doc, open this. Last updated 2026-06-23._

## What we're building
A career companion that helps people send **fewer, stronger applications and actually get a foot in the
door** — instead of firing off hundreds and hearing nothing back. Full why: **[MISSION.md](MISSION.md)**.

## Where it is right now
- Live (updates on every push): **career-intelligence-xi.vercel.app**
- It works end-to-end: share background → the advisor has a real discovery conversation → it reads you →
  shows directions + matched roles at your level → you can chat with the advisor, who remembers you.
- Recently fixed: honest matching, seniority (no roles above your level), the advisor turning an
  over-reach into a realistic pathway, job relevance, the discovery conversation, auth, the recap card.

## What's next (the agreed order — nothing else needs deciding now)
1. **Make it feel alive** — finish the new-user flow: discovery's done; next is the advisor *reacting* to
   what you do and *feeling present*. (Also here: a light "start fresh, keep the memory".)
2. **The candidate-strength loop — the heart** — CV tailoring (beat the ATS), cover letters, outreach /
   warm intros, interview prep, and the **"why am I not hearing back?"** diagnosis. This is the mission
   made real. (Mentor-session formats, new-role alerts, and skills-shown-in-context live here too.)
3. **Grounded knowledge layer** — fact-check the platform against free real data (salaries, skills,
   routes) so it's credible, not guessing. Plan: [GROUNDED-KNOWLEDGE-PLAN.md](GROUNDED-KNOWLEDGE-PLAN.md).
4. **B2B later** — universities first, only once the candidate loop works.

**Alongside the build, two other tracks** (so nothing's lost):
- **Fixes** — the prioritised backlog in [AUDIT-REPORT](AUDIT-REPORT-2026-06-22.md) (saved-roles view,
  direction detail, clickable directions, logos…). Chipped away between features.
- **Strategy / research sessions** — run when *you* signal, not builds: the big **mentorship market +
  business model + credibility** session, a Jack & Jill teardown, niche-industry users, and the advisor
  identity/rename design session.

_Every parked idea is mapped to one of the above — see the table at the top of
[parking-lot.md](parking-lot.md). Nothing is "someday-maybe-never"._

## The only documents you need to hold
- **[MISSION.md](MISSION.md)** — the why. The north star.
- **This file** — where we are + what's next.

Everything else below is working detail **I maintain** — you don't need to track it:
| Doc | What it's for |
|---|---|
| AUDIT-REPORT-2026-06-22.md | The current prioritised fix/feature backlog |
| WALKTHROUGH-FEEDBACK-2026-06-22.md | Your raw click-through notes (source for the backlog) |
| GROUNDED-KNOWLEDGE-PLAN.md | The future "make the facts real" project |
| parking-lot.md | Every parked idea — now with a map at the top showing *when* each one happens |
| REBUILD.md | Technical state of what's built (for me) |
| ADVISOR_PERSONA.md | The advisor's voice (source of truth) |
| CLAUDE.md / INSIGHTS.md | My operating instructions + technical reference |
| archive/ | Superseded docs (old roadmap, old audits) — ignore |

## How we work (so it stays calm and efficient)
- All work happens on the **staging** branch → pushed → you test on the live URL. Nothing touches
  production without you saying so.
- Every change is checked by automated tests before it ships.
- **£0 rule:** no new paid services beyond your existing Claude/API.
- One thing at a time. I bring you decisions only when they're genuinely yours to make — otherwise I
  decide and tell you.
