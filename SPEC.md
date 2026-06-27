# SPEC — Role-Interest Mentoring Flow

_Agreed 2026-06-27 (Lexi + Claude), after a grilled design session. This is the contract for the next build:
what we build, the best-in-class baseline it matches, the bar that makes it ours, and the objective "done"
criteria Claude self-verifies against (close-the-loop). **No code was written this session — this spec is
the thing the build is measured against.** Touches the advisor prompt → `npm run eval:advisor` must pass
before any merge to main._

> Source feature in the roadmap: FEATURE-ROADMAP.md Step 2 "ROLE-INTEREST = a mentoring conversation".
> Prior-art baseline: PRIOR-ART-MAP.md §2 (advisor), §14 (this flow), §11/memory. Voice: ADVISOR_PERSONA.md.

---

## The problem (why this build exists)

Today, marking a role "interested" jumps straight toward "tailor your CV + write a cover letter." That is a
job-dashboard reflex — the exact thing the product must not be. The advisor is the product; a document is a
utility. When someone shows interest, a good mentor gets **curious first** and helps build a *plan* before any
document. That captured thinking is also the compounding moat: it sharpens everything that comes after.

## What "good" looks like (best-in-class baseline we match)

- **Pi / good AI coaching:** questions branch from what the person actually said; warm, never scripted.
- **BetterUp pattern:** concrete next steps *emerge from the conversation*, not from a menu.
- **Honest-matching (ours, already a differentiator):** never cheerlead a weak fit.
These get us to "great" fast. The bar below is what makes it *ours*.

---

## Agreed behaviour (the decisions, locked)

**1. Scope (breadth-first).** Build the **conversation + memory only**. The advisor runs the mentoring
conversation *in chat* and remembers what matters. **No visible "plan" screen this build** — deferred to a
later pass (avoids becoming a to-do app; gets the behaviour walkable fastest).

**2. Entry.** Clicking "I'm interested" **saves the role to Applications immediately** (nothing lost) AND the
advisor **opens the mentoring conversation**. The save is safe; the conversation begins. (The handoff already
carries role detail after today's foundation fix, so the advisor starts already holding the listing.)

**3. The mentoring conversation — adaptive, never an interrogation.** The advisor opens with **one genuine
question** ("what drew you to this one?"), then **reads the room** using the existing first-session clarity
dial:
- *Lost / anxious* → the full, gentle walk through the plan dimensions, one at a time.
- *Directed, just wants to apply* → light touch; acknowledge their clarity and move to docs quickly.

The **five plan dimensions are the advisor's mental model, NOT a script shown to the user and NOT a
checklist**: (1) **why this one** (what appealed — role, company, mission, salary, a stepping stone);
(2) **honest alignment** (how well it really fits); (3) **gaps** (what they'd need to be competitive);
(4) **the company** (what they do / value); (5) **the process** (what applying involves, timing). One
thread at a time, paced to the person. Never fire them as a list.

**4. Honest alignment — kind but plain.** If the fit is weak, the advisor **says so directly before helping**
("honestly, this one's a stretch because X — want to go for it anyway, or look at closer matches?"). This is
honest-matching applied to the moment of interest. No dishonest cheerleading.

**5. Documents as steps inside the plan.** The advisor **offers** the CV tailor / cover letter when the
conversation has covered the why + fit and it's genuinely the right moment ("your CV needs to show X for this
— want me to tailor it now?"), OR whenever the user asks. **Never the opening move.**

**6. Grounding — real facts only, and signpost the gaps.** For "the company" and "the process," the advisor
works **only from the actual job listing + what the user tells it**. It **never fabricates** company culture,
values, process, or timing. When it doesn't know, it says so **and points the user to where to find it** —
the company's careers page, LinkedIn, Glassdoor, the recruiter — so it's a signpost, not a dead end.
(Research-grounded + honesty standard. No AI-average guessing.)

**7. Memory payoff — compounding, NOT like-for-like.** The captured "why" is stored (on the role + profile
memory) and the advisor **uses it to sharpen future recommendations over time** ("you liked the mission-led
angle of that one — here's a closer match") and to re-engage. **Critical guardrail:** the "why" informs
**values / direction**, never a "more of this exact job" filter. It must **not narrow to like-for-like
roles**, or we shrink the funnel and bury good lateral matches. It builds gradually; early on it nudges, it
doesn't dictate. (Builds on today's partial memory fix — the advisor already holds saved-role detail.)

---

## The bar that makes it ours (carry into every judgement call)

- **The advisor is the product.** Curiosity and a plan come before any document, always.
- **Honest over flattering.** A weak fit is named, kindly. Trust is the moat.
- **Grounded over impressive.** Real facts or an honest signpost — never confident guessing.
- **Compounding, not narrowing.** Memory widens understanding of the person; it never shrinks their options.
- **Paced for an anxious user.** One thread at a time. Read the room. Never a form, never a checklist.

---

## Technical shape (Claude's call — for the build, not this session)

- **Advisor prompt (`advisor-prompt.ts`):** add the role-interest behaviour — curious-first, the 5 dimensions
  as a mental model, adaptive to the dial, honest-fit, docs-as-steps, grounding+signpost rules.
- **Handoff (`SidePanel.handleInterested`):** the dispatched opener becomes a natural trigger for the
  mentoring open rather than "what should we do about it?"; role detail already flows via context.
- **Memory of the "why":** capture per-role (extend `saved_jobs.job_data` with a `why` field and/or the
  `remember`/profile `memory[]` path) + feed it into `buildUserContext` as a values/direction signal — NOT a
  similarity filter on listings.
- **Recommendation sharpening:** the "why" adjusts direction/values weighting in scoring over time; explicitly
  preserve breadth (guard against like-for-like narrowing).

## Done criteria (objective — Claude self-verifies against these)

1. Clicking "interested" saves the role AND opens a conversation that does **not** jump to documents.
2. The advisor's **first move is a genuine question**, not an offer to tailor a CV.
3. Behaviour **adapts to the clarity dial** (lost = fuller walk; directed = light touch → docs faster).
4. On a **weak-fit** role, the advisor **names it kindly before helping** (verifiable in the eval personas).
5. The advisor **never fabricates** company/process facts; when unknown it **signposts a real source**.
6. The captured "why" **persists** and shows up in later context **without** narrowing future roles to
   like-for-like.
7. The five dimensions **never appear as a visible list/checklist** to the user.
8. `npm run eval:advisor` (17 personas) **passes** before any merge; add/extend a persona that exercises the
   interested → mentoring → honest-fit path.

## Explicitly out of scope (this build)
- A visible "plan" / "working through" surface (deferred — see roadmap agenda item).
- Cross-role outreach log, stalled-application nudge (separate roadmap items in the same memory system).
- Interview prep (planned, needs its own grounding research).
