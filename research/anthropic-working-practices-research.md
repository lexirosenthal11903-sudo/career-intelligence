# Anthropic working-practices research — "how we work" upgrade

_Researched Session 52, 2026-07-06. One deep-research pass (105 agents, ~4.7M tokens, 24/25 claims verified)
+ two focused extraction agents over the current Anthropic primary sources. Purpose: audit our own working
practices against Anthropic's OWN published guidance, and reach an evidence-based verdict on two community
techniques Lexi flagged (the "LLM Council" and the "Canary Trick"). Graded against our own research bar:
sources named + cited, confidence-tagged, Anthropic-official distinguished from community, ends in build-
actionable implications._

## Sources (all primary/official unless tagged)

- **Claude Code best practices** — `code.claude.com/docs/en/best-practices` (the 2024 `anthropic.com/engineering/claude-code-best-practices` now 308-redirects here; substantially rewritten for 2026).
- **How Anthropic teams use Claude Code** — `claude.com/blog/how-anthropic-teams-use-claude-code`.
- **Building effective agents** — `anthropic.com/engineering/building-effective-agents`.
- **How we built our multi-agent research system** — `anthropic.com/engineering/built-multi-agent-research-system`.
- **Effective context engineering for AI agents** — `anthropic.com/engineering/effective-context-engineering-for-ai-agents`.
- **Claude Code memory (CLAUDE.md) docs** — `docs.anthropic.com/en/docs/claude-code/memory`.
- **Claude Code subagents docs** — `code.claude.com/docs/en/sub-agents`.
- **Prompt caching docs** — `docs.anthropic.com/en/docs/build-with-claude/prompt-caching`.
- **"Lost in the Middle" (Liu et al., TACL 2024)** — `arxiv.org/abs/2307.03172` (independent, peer-reviewed).
- Community (evaluated, not authoritative): `github.com/oliwoodman/llm-council-skill`; the Canary Trick article.

---

## Part 1 — The governing constraint (everything hangs off this)

**The context window is the scarcest resource, and quality degrades as it fills.** [Anthropic-official, high
confidence] Verbatim: _"LLM performance degrades as context fills. When the context window is getting full,
Claude may start 'forgetting' earlier instructions or making more mistakes. The context window is the most
important resource to manage."_ The mechanism ("context rot"): models have a finite _"attention budget"_ that
_"every new token introduced depletes"_, because n tokens create n² pairwise relationships (transformer
architecture). Independent corroboration — "Lost in the Middle" (Stanford, TACL 2024): performance is highest
when relevant info is at the **start or end** of context and _"significantly degrades when models must access
relevant information in the middle… even for explicitly long-context models"_ (30%+ accuracy drop moving an
answer from position 1 to position 10 in a 20-doc context; replicated across 6 model families).

**Why it matters for us:** every practice below is downstream of protecting context. It also sets up the two
verdicts in Part 4 — one technique rests on a TRUE version of this claim, the other on an UNSUPPORTED version.

---

## Part 2 — Where we are already aligned (Anthropic validates these) ✅

Graded against the current best-practices doc's new **"Avoid common failure patterns"** section, which maps
almost 1:1 onto rules we already enforce:

| Our practice | Anthropic's version | Status |
|---|---|---|
| Lean CLAUDE.md ≤200 lines, prune-on-add | _"target under 200 lines… longer files reduce adherence"_; per-line test: _"Would removing this cause Claude to make mistakes? If not, cut it."_; _"Bloated CLAUDE.md files cause Claude to ignore your actual instructions!"_ | ✅ exact match |
| `/clear` between unrelated threads | _"The kitchen sink session… Fix: `/clear` between unrelated tasks."_ | ✅ |
| Verify-before-completion (close the loop) | _"The trust-then-verify gap… Always provide verification… If you can't verify it, don't ship it."_ | ✅ |
| Plan mode first (Explore→Plan→Code→Commit) | _"Letting Claude jump straight to coding can produce code that solves the wrong problem. Use plan mode to separate exploration from execution."_ Skip-plan rule: _"If you could describe the diff in one sentence, skip the plan."_ | ✅ (we already cite `Ctrl+G` to edit the plan) |
| Be specific, name files/patterns | _"Reference specific files, mention constraints, and point to example patterns."_ `@file` reads before responding. | ✅ |
| Haiku for sub-tasks, Sonnet for advisor | Subagents doc: _"Control costs by routing tasks to faster, cheaper models like Haiku."_ | ✅ |
| Subagents for verbose/parallel work | _"Preserve context by keeping exploration and implementation out of your main conversation."_ | ✅ |
| Breadth-first, milestone-test | Product Design team: _"give Claude abstract problems, let it work autonomously, then review solutions before final refinements."_ | ✅ (see Part 3) |
| Research-ground fact-based features | (our own standard; consistent with their "provide specific context") | ✅ |
| **Hooks for must-run rules** | _"If the instruction is something that must run at a specific point… write it as a hook."_ | ✅ **partly** — we already have a SessionStart branch-check + a PreToolUse e2e-before-commit gate in `.claude/settings.json`. Gap in Part 3. |

**Bottom line: our ~11 practices are strongly aligned with Anthropic's own guidance.** This was a confirming
audit, not a corrective one. The changes below are surgical.

---

## Part 3 — The real upgrades (what to change) 🔧

**U1 — Fix the cache mental model (factual error in CLAUDE.md).** [Anthropic-official, high]
Our rule (CLAUDE.md workflow #8) says _"a session idle >1h also breaks it [the cache]."_ The default prompt-
cache TTL is **5 minutes**, refreshed free on each use; the 1-hour TTL is a **paid opt-in** we don't use.
Verbatim: _"By default, the cache has a 5-minute lifetime. The cache is refreshed for no additional cost each
time the cached content is used."_ So the idle buffer is ~5 minutes, not an hour — off by 12×. Also:
_"the cache follows the hierarchy: tools → system → messages. Changes at each level invalidate that level and
all subsequent levels"_ — so **editing CLAUDE.md mid-session invalidates the cache** for the rest of the turn.
Practical: (a) correct the ">1h" to "~5 min idle"; (b) batch CLAUDE.md edits rather than dribbling them.
_Note: one related claim was REFUTED 1-2 — that the paid 1h option is the source of our ">1h" rule — which is
itself evidence the heuristic was imprecise._

**U2 — Add the "2 failed corrections → /clear" trigger.** [Anthropic-official, high]
We have "/clear between unrelated threads" but not this concrete trigger. Verbatim: _"If you've corrected
Claude more than twice on the same issue in one session, the context is cluttered with failed approaches. Run
`/clear` and start fresh with a more specific prompt… A clean session with a better prompt almost always
outperforms a long session with accumulated corrections."_ Small, high-value; it's a deterministic count, not
a vibe. This is also what makes the Canary Trick redundant (Part 4).

**U3 — Close the hooks gap: a `git push origin main` guard.** [Anthropic-official, high]
Anthropic: CLAUDE.md is _"not a hard enforcement layer"_ (injected as a user message, _"no guarantee of strict
compliance"_); anything that must run at a fixed lifecycle point should be a **PreToolUse hook** because hooks
_"execute as shell commands at fixed lifecycle events and apply regardless of what Claude decides to do."_
We already do this for e2e-before-commit and the branch check. Our single most important guardrail — **never
push to main** — is still only prose. A PreToolUse hook that denies `git push` targeting `main` makes it
impossible to violate even if context degrades. (Optional: a deploy-check gate.) Small build task.

**U4 — Name the default loop explicitly: abstract problem → autonomous build → review before polish.**
[Anthropic-official, high] This is literally how Anthropic's Product Design team works, and it's what our
breadth-first / milestone-test cadence already does. Worth stating as _the_ mode in one line so it survives
context resets. (Caveat: the phrasing is attributed to one team, so it's a documented pattern, not a universal
mandate.)

**Minor tactical habits (I just adopt; no doc change needed):**
- **Paste dashboard screenshots to debug infra.** [Anthropic-official] Data Infrastructure team fed Claude
  _"dashboard screenshots, and Claude guided them menu-by-menu through Google Cloud's UI"_ then gave _"the
  exact commands."_ For us: when Vercel/Supabase breaks, screenshot it in — Claude can walk the UI and hand
  exact commands. Directly useful to a non-technical founder.
- **Course-correction:** `Esc` to interrupt (context preserved), `Esc Esc` / `/rewind` to restore prior state.
- **`/permissions` to allowlist frequently-used domains/tools** — cuts approval friction.

**Stale references to NOT cite as current Anthropic guidance** (removed in the 2026 rewrite): the
"ultrathink" thinking-budget keywords, the full TDD "confirm-tests-fail-then-commit" sequence, the "2-3
screenshot iterations" figure, `.claude/commands/` (now `.claude/skills/*/SKILL.md` with `$ARGUMENTS` — we're
already on skills), and `--dangerously-skip-permissions` (now `--permission-mode auto` + `/sandbox`). None of
these are load-bearing in our docs today, so nothing to remove — just don't reintroduce them as "current."

---

## Part 4 — The two community techniques (verdicts)

### A) The LLM Council — ADOPT, heavily fenced. [verdict = inference from adjacent official guidance]

Mechanism: one question → 5 fixed "thinking-style" advisors in parallel (Contrarian / First-Principles /
Expansionist / Outsider / Executor) → anonymised peer review → a chairman synthesises one verdict.

**What Anthropic's guidance supports:** the general shape is sanctioned. Parallelization/voting is _"useful
when multiple perspectives or attempts are needed for higher confidence results"_; the evaluator-optimizer
(critique) pattern is _"particularly effective when we have clear evaluation criteria, and when iterative
refinement provides measurable value."_ The orchestrator's _"synthesizer LLM"_ partly grounds the chairman.

**The hard limits [Anthropic-official, high]:**
1. _"Add complexity only when it demonstrably improves outcomes… add multi-step agentic systems only when
   simpler solutions fall short."_ The Council must clear that bar per-use.
2. **Cost:** _"multi-agent systems use about 15× more tokens than chats"_ (single agents ~4×).
3. **Anthropic explicitly names coding and decision tasks as POOR fits** for multi-agent (best fit is heavy
   parallelization / info exceeding one context window / many tools). Its 90.2%-beats-single-agent result is
   [medium confidence]: first-party unreplicated eval, and ~80% of the gain is attributed to raw token spend,
   not architecture — and it's research fan-out, NOT the fixed-persona Council.
4. The **specific** structure (5 personas, peer review, chairman) is an **unvalidated design choice** — no
   cited source shows 5 is optimal, or that fixed thinking-style personas beat one strong critique pass or N
   repeated critics. [open question]

**Verdict:** keep it for **genuinely high-stakes, non-obvious _strategy_ forks** (pricing, positioning, a
pivot call, a big architecture bet) — the exact "being wrong is expensive and the answer isn't obvious" case
its own examples use. **Never for routine build or copy work** (Anthropic says coding is a poor fit, and it's
15× the cost). And note we already own cheaper coverage of most of its value: `/grill-me` and our
show-evidence-before-you-decide rule. So: a rare, deliberate tool for the biggest forks — not a default.

### B) The Canary Trick — SKIP. [verdict = inference from official guidance + independent evidence]

Mechanism: plant a trivial standing instruction in CLAUDE.md ("begin every response with 'Mr Tinkleberry'");
when it stops appearing, treat it as an early warning that context is degrading (older/smaller instructions
being dropped first) → start a fresh session.

**Why skip:**
1. **Its premise is true but its mechanism is unsupported.** Degradation-as-context-fills is Anthropic-
   official. But the specific claim that the **oldest/smallest** instructions drop **first** is stated by NO
   source — Anthropic makes no ordering claim. "Lost in the Middle" points to a **position** effect (U-shape:
   start and end survive, middle rots), NOT an age/size effect — which would make a canary pinned at the **top**
   of CLAUDE.md a **poor** tripwire, since the top of context is among the best-preserved positions.
2. **Anthropic's own remedies make it redundant.** Root-CLAUDE.md _"survives compaction: after `/compact`,
   Claude re-reads it from disk and re-injects it"_ — the rules we care about are auto-restored. And the
   deterministic "2 corrections → `/clear`" trigger (U2) is a cleaner signal than watching a fragile per-reply
   canary.
3. **The permanent canary line fails Anthropic's own pruning test.** _"Would removing this cause Claude to make
   mistakes? If not, cut it."_ A canary categorically fails — removing it causes no mistakes — and it directly
   violates our lean-CLAUDE.md rule (already at the 200-line cap). It costs a little (tokens + output pollution)
   and buys nothing reliable.

**Honest caveat:** the technique's own author concedes it's _"a smoke alarm, not a lab instrument."_ Fair — but
we already have better-calibrated smoke alarms that don't cost a permanent CLAUDE.md line.

---

## Part 5 — Prioritised action list

1. **U1 — Correct the cache TTL** in CLAUDE.md workflow #8 (~5 min idle, not >1h) + add "batch CLAUDE.md edits." _(doc edit)_
2. **U3 — Add a `git push origin main` PreToolUse guard hook** to `.claude/settings.json`. _(small build)_
3. **U2 — Add the "2 corrections → /clear" trigger** to WORKING-PRACTICES (Bonus 3 + trigger table). _(doc edit)_
4. **U4 — Name the default loop** (abstract problem → autonomous build → review) in WORKING-PRACTICES. _(one line)_
5. **Record the two verdicts:** Council = fenced-for-big-forks; Canary = skip (with reasons, so it's not
   re-litigated). _(doc/memory)_
6. **Adopt the minor tactics** (dashboard screenshots, Esc/rewind, /permissions) — no doc change; I just use them.

**Open questions (unresolved by the evidence):** does persona diversity actually beat one strong critique pass
or N identical critics? what's the diminishing-returns curve on number of perspectives (why 5)? empirically,
which instructions does Claude drop first on a full window — a small controlled test could settle whether any
canary placement is diagnostic at all.
