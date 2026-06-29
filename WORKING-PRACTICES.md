# Working Practices — how we use Claude Code

_Adopted 2026-06-26 from Anthropic's "How their team uses Claude Code" guide (8 tips + 3 bonuses). Lexi
wants ALL of them as permanent practice. The one idea under all of it: **treat Claude as a thought partner,
not a code generator.** Every practice is a way to have a sharper conversation, give Claude a way to check
itself, plan with it, push it, and keep the context clean._

> **Claude owns the timing.** Lexi will not always know when the right moment for a practice is. So Claude
> must **proactively call the moment** every time — say "now's the moment to do X" — never wait to be asked.
> The trigger column below is Claude's responsibility, not Lexi's memory.

## Proactive-trigger table — Claude prompts Lexi at these moments

| Practice | Trigger — when Claude says "now" | Who acts |
|---|---|---|
| **Plan before building** (plan mode) | Before any change touching >1 file or where the approach is unsure | Claude (auto) |
| **Close the loop** (`/code-review` + `/simplify`) | After any *code* slice, before Lexi tests | Claude (auto) |
| **Push it / second version** | At any draft moment, especially advisor voice + copy | Claude prompts |
| **Let Claude interview you** (`/grill-me`) | Before starting any sizeable new feature | Claude prompts |
| **Subagents** | When a task fans out into parallel research / audit / variations | Claude prompts |
| **Writer/reviewer split** (fresh review / `ultrareview`) | Before any merge to `main` | Claude prompts |
| **`/clear` between tasks** | When finishing one thread and starting an unrelated one | Claude prompts |
| **`/loop` or `/schedule`** | When a task is going to repeat (status polling, recurring reports) | Claude prompts |
| **Prune CLAUDE.md** | Whenever Claude *adds* to CLAUDE.md (never let it pass 200 lines) | Claude (auto) |
| **Model up to Opus/Fable** | Before reasoning-heavy work (architecture, hard debugging, nuance) | Claude prompts |
| **Check prior art first** | The moment a task is a common/solved problem (auth, social login, CV/coaching conventions) | Claude prompts |
| **Research-grounded building** | Before building ANY feature whose quality rests on real-world facts (advice, matching, diagnosis, outreach, salaries, timing) | Claude (auto) |
| **`/voice`** | Lexi's choice — already in use | Lexi |
| **Batch cadence** (agree batch → build all → one review; a receipt on every raised item) | Start of every session; and the instant Lexi raises anything (confirm it's logged) | Claude (auto) |
| **Claude-in-Chrome live test** (browser test prompt at handoff) | End of every build session — IF Claude judges a live test is warranted (esp. browser-only integration paths automation can't reach). Claude hands Lexi a ready-to-paste prompt for Claude in Chrome unprompted | Claude (auto) |

---

## The session cadence — batch, build, one review (set 2026-06-29 with Lexi)

_Why: one-thing-at-a-time was too slow to keep up with new ideas, and Lexi lost track of whether her
corrections were captured (so she re-checked and re-raised, losing trust in the list). The fix is NOT to drop
quality gates — it's to move them to BATCH boundaries and give every raised item a visible receipt._

**The core insight (this is the whole point):** speed without quality loss comes from changing the *cadence*
of the quality gates, not removing them. Grill once for the whole batch, build the whole batch, verify the
whole batch, review once. The stop/start tax on every micro-item is what was slow, not the gates. Grill-me,
spec, and self-verify all STAY — they just happen at batch edges, not per item.

**Three phases per session:**
1. **Agree the batch (start).** Claude pulls a defined set of *related* items from `FEATURE-ROADMAP.md` and
   posts them as "▶ THIS SESSION". Lexi approves or swaps. That set is the contract: nothing outside it gets
   built, nothing inside it gets dropped. If the batch needs design decisions, Claude grills Lexi ONCE here,
   for the whole batch, and writes/updates the spec — not per item.
2. **Build the whole batch autonomously + self-verify each (middle).** No mid-batch check-ins. Claude builds,
   runs close-the-loop (`/code-review` + `/simplify` + build/lint/eval/`shot.js`) on each slice, and uses
   subagents to build independent slices in parallel where that speeds things up. One push at the end.
3. **One review pass (end).** Claude hands Lexi a numbered "test this → expect this" checklist for the whole
   batch. Lexi reviews once. Anything new she spots is captured WITH A RECEIPT and rolled into the next batch.
   **Live test via Claude in Chrome (set 2026-06-29, standing rule).** Automated gates (tsc/lint/build/tests/eval/
   code-review) prove everything provable headlessly — but they cannot exercise browser-only integration paths
   (e.g. advisor tool → signal → window event → UI re-fetch). So at handoff, whenever Claude judges a live test
   is genuinely warranted, it hands Lexi a **ready-to-paste prompt for Claude in Chrome** as part of the handoff,
   WITHOUT being asked. Claude owns this judgement call and the prompt every time; Lexi never has to request it.
   The prompt must be self-contained: the URL, the precondition (signed in), each step, the expected result, a
   flag on any destructive step, and "report back pass/fail per step". If a live test genuinely isn't needed,
   Claude says so explicitly rather than staying silent.

**Receipts — the rule that kills "is this already on the list?":** every single thing Lexi raises, Claude
confirms in the moment — **"Logged ✓ — [doc], [where in the queue]."** No exceptions. Lexi can say "show me
the queue" any time and Claude shows exactly what's captured and which batch it's in. Verbal-only capture is
banned (already the rule; this makes it visible).

**Two guardrails that keep bundling safe:**
- **One KIND of work per batch.** All foundation/correctness fixes together, OR one feature end-to-end — never
  build mixed with voice/copy fine-tuning. This is the "never interleave build and fine-tune" rule; it's what
  stops a batch sliding into the endless-polish loop.
- **Milestone-test, not micro-test.** Lexi reviews one whole walkable slice. Target ~4–6 related items; if the
  review is exhausting, the batch was too big — right-size the next one. Claude owns calling the boundaries and
  defining "done for this batch" objectively (against the spec) up front, so a batch can't quietly expand.

---

## The practices in detail

### 1. Close the loop — give Claude a runnable pass/fail (the #1 principle)
Claude stops when work *looks* done. Without a check it can run, "looks done" is the only signal — and Lexi
becomes the thing that catches every mistake. So every code slice gets a pass/fail Claude can run itself:
tests, lint, a build, `shot.js` for design, or a small eval. Then Claude does the work, runs the check,
reads the result, and keeps fixing until it actually passes. **Standing: after any code slice Claude runs
`/code-review` (bugs) + `/simplify` (tightness) before Lexi tests.** Pro version: a *separate* reviewer
grades the work (see Writer/reviewer split).
> Copy-paste: _"Prove to me this actually works. Show me the evidence — don't just tell me it works."_

### 2. Plan before you build
Jumping to code gives a beautiful solution to the wrong problem. Claude plans first (Shift+Tab → plan mode):
reads files, writes a real implementation plan, no code yet. Pour effort into the plan and the build nearly
one-shots. Skip planning only for genuine one-sentence changes; plan hard when it touches multiple files.
**Lexi: press `Ctrl+G` to open Claude's plan in your editor and tighten it before Claude runs.**
> Copy-paste: _"Read the relevant files and understand how this works. Then write a detailed plan: what
> files change, the order of steps, and anything risky. Don't write any code yet — just the plan."_

### 3. Lean, self-correcting memory (CLAUDE.md + memory files)
CLAUDE.md is read at the start of every session — it's persistent project memory. When Claude gets something
wrong, the fix is written into memory so every future session starts already knowing it. **Keep it lean — a
bloated CLAUDE.md gets half-ignored (ours hit 389 lines and was pruned to 200 on 2026-06-26).** Pruning on
add is automatic; Lexi never has to remind.
> **Lexi shortcut:** start a message with `#` and Claude files what you type straight into memory.

### 4. Never accept the first answer — push it
The first version is a draft. Asking Claude to critique or one-up its own work raises its own standard.
Most valuable on advisor voice, copy, and design, where "working" ≠ "best".
> Copy-paste: _"Knowing what you know now, scrap this and build the more sophisticated version you'd build
> if you were starting fresh."_ · _"What would you improve about this?"_

### 5. One-tap quality pass — `/simplify` + `/code-review`
After changes: `/simplify` runs agents that review for cleanup/quality/efficiency (ship leaner); `/code-review`
spins up a fresh reviewer to hunt for actual bugs. One pass for quality, one for correctness. Now standing
after every code slice (see #1).

### 6. Throw more power at hard tasks
Match the model to the task. Sonnet (normal effort) for design, copy, naming, most build. Opus for complex
architecture, hard debugging, nuance-sensitive reasoning. Fable for the very hardest. Claude states which to
use at the start of each task and flags when to switch.

### 7. Subagents — split the work, keep the thread clean → see full how-to below
For anything big, "use subagents": Claude splits the job across helpers that each work in their own window
and report back only the answer, so the main conversation stays clean. Best for parallel research, audits,
and generating variations.
> Copy-paste: _"Use subagents to investigate this and report back. Have one dig into [A] and another into
> [B], then summarise the findings so my main thread stays clean."_

### 8. Talk instead of type — `/voice`
You speak ~3× faster than you type and instructions come out more detailed. `/voice`, hold spacebar,
describe what you want. Lexi already uses this.

### 9. Check prior art / industry standards first — the four questions before EVERY build
For any common or solved problem, name how it is normally done or who does it best BEFORE building
from discussion, then decide together. Do not reinvent. Name a real reference (the platform's own
built-in feature, a named product, a known pattern), not a vague "best practice" — the same rule as
named design references. (Adopted 2026-06-26, Lexi's process insight.) Worked example: the sign-up
carry-forward is the standard "anonymous account, then link on signup" pattern that Supabase ships
natively, not the custom browser-cache bridge we had hand-rolled. See memory `feedback-check-prior-art-first`.

**The four questions (run before building or fixing ANY feature — set 2026-06-27 with Lexi):**
1. Has someone already solved this well?
2. If so, who does it best, and what exactly is worth copying?
3. How does ours compare right now?
4. What do we keep, change, and layer on top to make it ours?

**Two non-negotiable principles on top of the four questions:**
- **Copying is the START line, not the finish.** Matching best-in-class gets us to "great" fast so we
  spend our real effort on the part only we can do. Every replicated pattern is still measured against
  our own research + mission + the advisor differentiator, and we build on top. Copied ≠ done.
- **Understand before changing — never wipe-and-replace blind.** The four-questions output is a map we
  read together FIRST. Nothing built is replaced as a side effect. If what we have is already good, the
  map says keep it. Decisions to change are made together, one feature at a time.

This applies to everything already built (audit + map it, the priority) AND everything we plan to build.
Quick, easy future wins can jump the queue if they speed things up. See memory
`feedback-check-prior-art-first` and the prior-art map deliverable.

### Bonus 1 — Let Claude interview you, then write the spec (standing, before any sizeable feature)
Don't write the perfect prompt — let Claude pull it out of you. It asks about edge cases and trade-offs you
hadn't considered, then writes the spec. This is our `/grill-me` + `/brainstorming`.

**Standing rule (set 2026-06-27 with Lexi): every sizeable feature gets a written, agreed spec BEFORE any
code.** Claude grills Lexi, then writes a short spec to a file she can read and approve. The spec captures
two things, straight from the four questions (§9): the **best-in-class baseline** to match, AND the **bar
that makes it ours** (our research + mission + advisor layer). That spec then becomes the concrete thing
Claude self-verifies against (close-the-loop, §1) — so "done" means "meets the spec we agreed", not "looks
done". This is the difference between Claude guessing what Lexi meant and both agreeing up front.
> Copy-paste: _"I want to build [X]. Interview me in detail before we start — technical choices, edge cases,
> trade-offs I might not have considered. Keep going until we've covered everything, then write a spec to SPEC.md."_

### Bonus 2 — The writer/reviewer split
One session builds it; a *fresh* session reviews it. A clean context isn't biased toward code it just wrote,
so it catches far more — the builder never grades its own homework. **Claude prompts this before any merge to
`main`** (via a subagent or `ultrareview`/`/code-review`).

### Bonus 3 — Clear context between tasks
The context window is the #1 constraint — performance drops as it fills with unrelated history. `/clear`
between unrelated threads; a clean session with a sharp prompt beats a long cluttered one. Claude flags the
natural `/clear` points.

---

## Subagents — how we use them (the part worth learning)

**What they are.** A subagent is a separate Claude instance with its own context window. It runs a focused
task in isolation and reports back *only the conclusion* — the pages it read along the way never clutter our
main conversation. Several can run in parallel.

**Why they're worth it now.** Lexi upgraded her plan (more usage headroom, 2026-06-26), so this is finally
worth using properly. The trade-off to respect: each subagent starts *cold* and re-derives context, so it's
the more expensive path. Use it when a task genuinely **fans out** — not for routine single-thread work.

**When we reach for them:**
- **Parallel research** — e.g. the application-effectiveness session's 9 threads could each be a subagent
  researching in parallel, reporting back findings to fold into one doc.
- **Codebase audits** — the standing session-start audit runs as a subagent so it doesn't fill the main thread.
- **Writer/reviewer split** — a fresh subagent reviews a feature the main thread just built (Bonus 2).
- **Generating variations** — e.g. several copy or design-direction options at once.
- **Search that fans out** — the `Explore` agent sweeps many files and returns just the answer.

**Agent types available in our harness:**
- `Explore` — read-only, fast file/codebase search; returns the conclusion, not file dumps.
- `Plan` — architect; designs an implementation plan, weighs trade-offs.
- `general-purpose` — multi-step research and execution when the path isn't obvious.
- `claude-code-guide` — questions about Claude Code / the API itself.

**How to invoke:** Lexi just says _"use subagents to…"_ or _"use a subagent to review this against the
requirements."_ Claude also proactively suggests it at the trigger moments above. Claude will explain what
each subagent is doing and relay only what matters back to Lexi.

**Default discipline:** Claude won't spawn subagents silently for small jobs — it proposes them when the task
fans out, so usage stays intentional even with the upgraded plan.

---

## Recurring work — `/loop` and `/schedule`
`/loop` reruns a task on a schedule on this machine; `/schedule` runs it in the cloud (keeps going with the
laptop closed). Anthropic engineers set up autonomous loops where Claude writes code, runs tests, and iterates,
then review the ~80%-done result. Claude flags when something we do repeatedly should become a loop/schedule.

---

## Research-grounded building — the standard (set 2026-06-26, non-negotiable)

_Why this exists: the product's credibility IS the product. An advisor that gives generic, AI-average advice
(the statistical mean of everything ever written) is worth nothing to an anxious 22-year-old. So anything the
advisor asserts as fact — how to tailor a CV, why you're not hearing back, who to reach out to and how, what a
role pays, when schemes open — must be grounded in real, current, credible research BEFORE it's built. This is
the same discipline as the design rule "references are not optional": without a real source, output drifts to
the AI average. We already work this way (mentorship research, application-effectiveness research, outreach
research); this codifies the bar so it never quietly slips._

**The rule.** Before building any feature whose quality rests on real-world facts (advice, matching,
diagnosis, outreach, salaries, timing, conventions), produce a grounding research report FIRST, save it to
`research/<topic>-research.md`, and have the build (prompts + logic) cite/encode it. No grounding → no build.
Re-ground when the world changes. Research is offloaded to a sub-agent (saves Opus usage); the main thread
grades it against the bar below before trusting it.

**The bar every grounding report must clear (Claude grades each report against this before it informs a build):**
1. **Credible, named sources** — gov.uk / National Careers Service, university careers services, primary
   studies, official platform docs, reputable named orgs. Never content-farm SEO blogs. Never AI-guessed facts.
2. **Current + UK + audience-right** — true *now*, UK context, early-career/graduate audience, not US-generic.
   Dated sources are flagged as such.
3. **Cited inline** — every load-bearing claim is traceable to its source in the text.
4. **Confidence-tagged** — verified / inferred / uncertain. Every statistic carries its source AND a confidence
   tag. Numbers without a source are removed, not softened.
5. **Free (£0)** — public/free sources only, per the standing cost constraint.
6. **Honest** — no inflated or cherry-picked numbers; contradictions between sources are surfaced, not hidden.
   Consistent with honest-matching: the advisor stays realistic.
7. **Build-actionable** — the report MUST end in a concrete "build implications / how to ground the advisor"
   section (specific do's, don'ts, when-to and how-to-calibrate). Research that doesn't change what we build,
   or that can't be encoded into a prompt or feature, has failed the bar.
8. **Complete against a defined scope** _(added 2026-06-26 — Lexi pushback)._ "Complete" is meaningless
   unless coverage is defined up front. Before researching, list the scope explicitly (e.g. every major UK
   industry from a standard taxonomy, plus the edge cases that matter for our users — people with no existing
   network / low social capital, career-changers, international students, regional and accessibility
   differences). The report covers every item or names it as a known gap. Nothing is implicitly skipped, and
   the report ends with a "Known gaps / lower-confidence areas" list so omissions are visible, not silent.

**Source hierarchy:** primary/institutional first (gov.uk, ONS, CIPD, ISE, university careers services,
academic studies, official platform data). Commercial/SEO blogs are directional only (Tier B) — never the
sole basis for a hard rule. Any claim that becomes a build *rule* needs 2+ independent sources.

**Independent review (writer/reviewer split for research)** _(added 2026-06-26)._ A *separate* agent audits
each grounding report for gaps, errors, and weak sources before it informs a build — the researcher never
grades its own homework, exactly as we do for code. The main thread folds the audit in, then builds.

**If a report misses the bar, it goes back** (re-run or reviewer audit) before any code is written against it.
Research is a living document: re-ground when the market shifts, and carry a review date.

---

## Agent & automation timeline (ordered by trigger) — set 2026-06-27 with Lexi

_Lexi asked whether we need standing/scheduled agents (research-freshness + others) and, if so, to sequence
them and surface each at the right moment. Decision: capture the full set, build the NEW ones only when their
trigger fires. Claude owns raising each at its trigger (per "Claude owns the timing" above). Key design rule
for any scheduled agent: it CHECKS and FLAGS for human review, it never silently ACTS. £0 discipline applies._

**Distinction taught:** build-time helper agents (spun up during a session, in-loop, cost usage only while
running) vs scheduled/autonomous agents (run on a timer with no one watching, ongoing cost, higher risk).
**OpenClaw evaluated + rejected** (autonomous local agent via messaging apps): can't be our product, security
profile (broad permissions, prompt-injection, unvetted skills) disqualifies it anywhere near user CVs, and
Claude Code + `/schedule` already cover our needs. It does validate the WhatsApp access-layer pattern, which
we build ourselves (Twilio/WhatsApp Business API) per the FEATURE-ROADMAP "WhatsApp channel" item.

| When (trigger) | Agent | Type | Claude raises it |
|---|---|---|---|
| **Now / ongoing** | Session-start code audit | build-time | every session start |
| **Now / ongoing** | Research + independent-reviewer | build-time | whenever grounding a fact-based feature |
| **Now / ongoing** | Code-review / security-review | build-time | after each code slice, before merge |
| **Product walkable end-to-end** (Step 2 built, before polish) | Synthetic-persona dogfooding agents | scheduled QA | first NEW agent — raise when the loop is walkable. Roadmap §Step 2 (parked) |
| **Product walkable end-to-end** | Multi-critic eval (mentor/recruiter/user) | scheduled QA | right after dogfooding. Roadmap/parking-lot (parked) |
| **Approaching launch** (pre-launch window) | Research-freshness checker (monthly, volatile topics only: AI-in-interviews, scheme windows, salary data) | scheduled, flag-only | raise during pre-launch non-negotiables |
| **Approaching launch** | Legal/regulatory watch (GDPR/ICO, employment law) | scheduled, flag-only | with the solicitor review |
| **Approaching launch** | Error/uptime monitoring (Sentry + Vercel Analytics — not an agent) | ops | already on the pre-launch list |
| **Post-launch (has users)** | Competitor watch | scheduled, flag-only | once in-market |
| **Post-launch (has users)** | Market / "AI and work" news monitor (feeds advisor credibility + blog) | scheduled, flag-only | once there's an audience/content surface |
| **B2B era (Phase 4+)** | Employer/university-facing automation | TBD | decided then |

**Honest steer recorded:** the first NEW agent is months away (waits for a walkable product); almost
everything else waits for launch. Do NOT build agent infrastructure pre-product. Research stays current via
honest review dates now; the proper run-time freshness fix is the Step 3 retrieval/grounded-knowledge layer,
not a swarm of refresh agents.
