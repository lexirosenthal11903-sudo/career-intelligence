# INSIGHTS.md
> ℹ️ **Predates the Session 38 rebuild.** The engineering *lessons* here are still useful; the phase tags and any claims about current product state are stale. `REBUILD.md` is the source of truth for plan and state.

## Claude Code Knowledge Base — Career Intelligence Project

Synthesised from expert video transcripts. Each insight is tagged with when it applies.
Tags: [NOW] = current build phase | [PIPELINE] = 90s analyse.js fix | [PHASE2] = dashboard/screen build | [MIGRATION] = Next.js migration | [PHASE3+] = future phases | [ALWAYS] = every session

---

## 1. IMMEDIATE PRIORITIES

### Analysis Pipeline Architecture — CONFIRMED (Session 26, 2026-06-12)
**[ALWAYS] [PIPELINE]**

**Standing rule: any single Anthropic call generating >1,200 output tokens is an architecture problem on Vercel Hobby, not a configuration issue.**

Vercel Hobby has a hard 60s function timeout. Claude Sonnet generates output at 35–80 tok/s depending on server load. A 2,200-token response times out at anything below ~37 tok/s — which happens on busy days. The fix is never to increase the limit; it is to split calls so no single call exceeds ~1,200 output tokens.

**Confirmed architecture for `/api/analyse` (implemented Session 26):**
- **Call 1** — `submit_career_profile` tool. Profile fields only: directions, summary, searchKeywords, skills, values. Max ~700 tokens output. ~10–15s.
- **Call 2** — `submit_career_details` tool. Skills gaps, companyValues, outreachContext. Max ~1,100 tokens output. ~15–25s.
- Both calls run **in parallel** (`Promise.all`). Wall time is determined by the slower call (~25s average, ~48s on slow days). Well within 60s.
- CV text capped at 3,000 chars (a full 2-page CV is ~2,000–3,000 chars; 8,000 was wasteful).
- Output shape is identical to the old single-call result — all downstream code unchanged.

**Before adding any new field to the analysis:** count estimated output tokens. If either call would exceed 1,200 tokens, split further or move to a lazy second endpoint.

**Upgrading to Vercel Pro** (300s limit) is still the right long-term move before scaling, but is not required for the current Hobby plan to work reliably.

### OTP Sign-In Bug
**[NOW]**
- Use `/goal` with a clear definition of done: "fix the returning user OTP sign-in failure — done when a returning user can successfully authenticate end-to-end on staging." Let it run autonomously while working on something else.

### Phase 2 Screen Implementation
**[PHASE2]**
- Before building any locked screen, run `/ultraplan` on the full Phase 2 scope. It spins up planning agents and works in the cloud while you continue in the terminal.
- When implementing screens, instruct Claude Code to: build → screenshot → check against design tokens in SESSION_DECISIONS.md → implement corrections → repeat — before handing over V1. This reduces drift from the locked design system.
- Use Chrome DevTools to test actual functionality of the advisor chat and analysis pipeline UI — not just static code review.
- Always start each build session in plan mode (Shift+Tab). Claude reads and reasons but won't touch code until you approve the plan.

### Advisor Persona Depth
**[NOW] [PHASE2]**
- Run a "grill me" session specifically on the advisor persona before building `chat.js` out further. The real depth of tone shifts, edge cases, and what the advisor never says likely still lives in your head — not fully in `ADVISOR_PERSONA.md`.
- The grill me skill asks one question at a time, checkpoints answers to a doc, and at the end offers to update all relevant files. Target output: a richer `ADVISOR_PERSONA.md` and any gaps surfaced as decisions to make before build.

### User Journey Extraction
**[NOW] [PHASE2]**
- Run a grill me session on the core user journey before Phase 2 build begins. The emotional arc is documented at high level but granular decisions — what happens if CV upload fails, how the system handles someone with no experience, what "3 daily actions" actually looks like — need extracting before Claude Code builds them wrong.
- Your `brainstorms/` folder already exists. Use it as the output target for all grill me sessions.

### CSS Engineering Standards — learned from Session 20 QA audit
**[ALWAYS]**
A full QA audit found 66 issues, most of which were preventable with two rules:

**1. Tokens first, always.**
Before writing any colour value, check `globals.css` for an existing token. If none fits, add one — then use it. Never write a hex value directly into a CSS module. The full token set (as of Session 20):
- Core: `--accent`, `--accent-dark`, `--accent-lt`, `--accent-soft`, `--accent-on-dark`
- Surface: `--surface`, `--bg`, `--cream`, `--cream-2`, `--line`
- Text: `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--ink-5`
- Dark: `--deep`, `--deep-2`, `--on-deep`, `--on-deep-2`, `--on-deep-3`
- Semantic: `--green`, `--green-soft`, `--danger`, `--danger-dark`
- Shadow: `--sh-shot`, `--sh-card`

**2. Every interactive element needs a handler before shipping.**
No button ships without an `onClick`. No link ships with `href="#"`. If a feature is Phase 3, use `disabled` with a `title` tooltip — never a dead handler. Resource links must have real URLs or be disabled. This also catches the pattern of building UI without wiring it — the button should be the last thing added, after the handler exists.

---

## 2. ARCHITECTURE & PATTERNS

### The Four C's — How to Think About Your Project Setup
**[ALWAYS]**
A useful mental model for evaluating whether Claude Code has what it needs to be useful. Each layer depends on the previous:

- **Context** — does it know the project? Open a fresh session and ask "what does this product do and who is it for?" — if the answer is vague, the context needs improving. Your CLAUDE.md, ADVISOR_PERSONA.md, SESSION_DECISIONS.md, and ROADMAP.md are your context layer.
- **Connections** — what can it actually touch? For Career Intelligence: Supabase, Adzuna, Resend, Anthropic API, Vercel. As you add features (email OAuth, calendar, contacts), add connections deliberately and one at a time.
- **Capabilities** — how does it do work? This is your skills layer. Skills encode how you want things done — the advisor voice, the design system, the deploy checklist. Without capabilities, Claude Code does things generically.
- **Cadence** — what happens without you explicitly asking? This is scheduled routines, `/loop`, automemory. Not relevant in current phase but the target state for Phase 3+ (daily check-in mechanic, cross-session memory).

### Agent Risk — The Bike Method
**[ALWAYS]**
This is critical given Career Intelligence has Supabase write access, Resend email sending, and will eventually have OAuth connections.

- **Instructions are not the same as capabilities.** If a tool or API key exists in the agent's harness, it can use it regardless of what CLAUDE.md says. Don't rely on "never send emails" as a safety measure if the Resend API key is accessible. Scope access at the connection level, not just the instruction level.
- **Real example from the transcript:** an agent proactively picked up a to-do list, interpreted it as an instruction, and sent promotional emails to 150,000 people without being told to. The agent had send access — that was the problem, not the instructions.
- **The bike method:** introduce autonomy in phases. Walk with it first (supervised sessions, you approve each action). Then reduce oversight as trust is earned. Don't give full autonomy to a skill or agent until it has proven itself across many supervised runs.
- **Practical application for Career Intelligence:** before giving any agent write access to Supabase or send access via Resend, run it supervised first. Check what it would do before it does it. Earn the trust before expanding the capability.

### One Source of Truth
**[ALWAYS]**
- Do all work through Claude Code rather than spreading it across Claude Chat, ChatGPT, Notion, and other tools. The value compounds — the more you use it in one place, the richer the context gets.
- Every decision, every brainstorm, every locked choice should live in the project files. Not in a separate Notion doc, not in a chat window that gets lost.
- For Career Intelligence this is already good practice — SESSION_DECISIONS.md, ROADMAP.md, ADVISOR_PERSONA.md are all in the repo. Keep this discipline.
- If you can't find something, Claude Code should be able to find it. If it can't, the file organisation or naming needs improving.

### File Organisation Philosophy
**[ALWAYS]**
- There is no single right way to organise your project files. The only failure state is when things are so unorganised that neither you nor Claude Code can find them.
- Don't stress the structure — it will evolve. The CLAUDE.md file and folder structure should be reviewed and updated frequently, not set once and forgotten.
- Skills can be local (project-specific) or global (available across all projects). As you build skills for Career Intelligence, decide which ones are project-specific (design-guard, persona-check) and which might be useful globally (session-handoff, api-review).

### CLAUDE.md Management
**[ALWAYS]**
- Keep CLAUDE.md between 150–200 lines max. It loads into every session as the system prompt — everything in it eats context window.
- CLAUDE.md should route to other files rather than contain everything. You already have `ADVISOR_PERSONA.md`, `SESSION_DECISIONS.md`, `ROADMAP.md` — make sure CLAUDE.md points to these rather than duplicating their content.
- Update CLAUDE.md after every meaningful session: new patterns, new gotchas, new conventions. But keep it trim — if it grows past 200 lines, prune.
- `automemory` can help maintain this automatically. Verify it is enabled in settings.

### AutoMemory and AutoDream
**[ALWAYS]**
- **AutoMemory** records decisions, patterns, and important project/user context into a `memory.md` file injected at the start of each session. Verify it's on via `/memory`.
- **AutoDream** is a newer experimental feature that runs on top of AutoMemory. Where AutoMemory records things, AutoDream periodically runs a sub-agent that consolidates, prunes, and compacts all memory files — keeping only what's genuinely useful, eliminating bloat. Think of it as sleep: the brain consolidates memories during sleep rather than just accumulating them.
- To enable: `/memory` → hover over AutoDream → hit enter to toggle on. Global across all projects but each project has its own memory files.
- To run manually: type `/dream` or tell it in natural language to "run your autodream."
- **How it works:** gathers recent session info → reads existing memory files → loads into a sub-agent → sub-agent synthesises recent learning into durable organised memories → consolidates and prunes → stores results. Repeats each cycle.
- **Triggers:** roughly every 12 hours or every ~300 sessions (community observation, not officially documented).
- **Only touches memory files** — never touches code, scripts, or project files.
- **Benefits for Career Intelligence:** reduces session startup repetition, keeps memory files lean (better recall, less context bloat), and improves continuity across sessions. As the project grows in complexity through Phase 2+, clean memory files become increasingly valuable.
- The three layers working together: normal sessions (coding/building) → AutoMemory (records decisions and patterns) → AutoDream (cleans and consolidates periodically).

### Context Window Management
**[ALWAYS]**
- Set up a status line (`/status line`) showing model, context %, and token count. This is the single most important visibility tool — you need to know when to compact before quality degrades.
- Use `/context` to diagnose what's eating tokens when a session feels slow or degraded.
- Compact at 60% context, not 100%: `/compact but keep all API integration decisions and design token decisions from SESSION_DECISIONS.md`.
- Use `/clear` when switching to a completely different task — you still have CLAUDE.md and all files, so it's not starting from scratch.
- Exit early if Claude goes the wrong direction. Hit escape, correct course, reprompt. Every token spent going wrong is wasted context.

### Session Discipline
**[ALWAYS]**
- Always start in plan mode (Shift+Tab). Claude reads and researches but won't change anything. It maps the approach, asks clarifying questions, then you approve and it executes. Dramatically reduces revision cycles.
- Make Claude ask questions before building: "continuously ask me questions until you're 95% confident you understand exactly what I need." Especially important before sessions touching the advisor persona or analysis pipeline.
- Build self-checking into the to-do list. Each build step should be followed by a verification step — screenshot, DevTools check, or comparison against SESSION_DECISIONS.md. Tell Claude: "don't move to the next to-do until you're 95% confident this one is done."
- For sessions running 30+ minutes, instruct Claude Code to checkpoint progress to a doc at regular intervals. Prevents context drift causing it to misremember earlier decisions.

### Session Handoff Skill
**[ALWAYS]**
- Build `.claude/skills/session-handoff.md` — a short prompt (4–5 sentences) that summarises what was done, what's next, and what decisions were made. Invoke at the end of every session. Means the next session starts clean without losing continuity.
- Check context % via the status line before ending a session. If above 60%, run `/compact` before the handoff.

### Git & Parallel Work
**[PHASE2] [MIGRATION]**
- Use git worktrees for parallel sessions: `claude-worktree [feature-name]` creates an isolated branch. Run multiple sessions on the same project without overwriting each other. Merge back like normal git branches when done.
- Relevant for Phase 2 when building multiple screens simultaneously or when running a bug fix session alongside a build session.

### Permissions
**[ALWAYS]**
- Set up an explicit allow list and deny list rather than using `--dangerously-skip-permissions`. Deny list takes priority over allow list. Deny: deletes, removes. Allow: the commands you know are safe for your stack.

### Workflows Folder
**[ALWAYS]**
- By default Claude Code saves workflow scripts to a global directory. Always explicitly tell it to save to `.claude/workflows/` inside the project so they're versioned and reusable.

---

## 2b. MODEL BEHAVIOUR & PROMPTING

### Effort Levels — The Most Underused Lever
**[ALWAYS]**
- Effort level is the single biggest quality lever available. The difference between Opus on low and Opus on extra-high feels like a different model version.
- **Match effort to task complexity:**
  - Low/medium: simple lookups, formatting, quick edits, routine tasks
  - High (default): most build tasks, feature implementation, bug fixes
  - Extra-high/max: complex architectural decisions, the analyse.js refactor, major debugging sessions
  - Ultracode (X-high + workflows): large-scale parallel tasks only — very expensive, don't leave on
- **Overengineering warning:** setting effort too high on simple tasks causes the model to overreason and overcomplicate. If Claude Code is making a simple thing complicated, try turning effort down.
- Never just open Claude Code and start typing without checking the effort level is appropriate for the task.

### Tell It What To Do, Not What Not To Do
**[ALWAYS]**
- Negative instructions ("never use em dashes", "don't add comments") are weaker than positive ones. The model wants to know why.
- **Give the why behind every instruction.** Instead of "don't use em dashes", say "I want this to read like I wrote it myself — my writing style never uses em dashes, so follow that." Context behind the rule makes it stick better.
- This is directly relevant to ADVISOR_PERSONA.md and SESSION_DECISIONS.md. Every rule in those files should have a brief reason attached — not just what to do, but why. This applies to CLAUDE.md rules too.
- Review existing rules in CLAUDE.md and ADVISOR_PERSONA.md — anywhere a rule exists without a reason, add one.

### Model Behaviour Changes to Watch
**[ALWAYS]**
- Opus 4.8 defaults to reasoning before calling tools. It will try to work out the approach with what it has before spawning a sub-agent or reading a file. Sometimes this is ideal; sometimes you want it to pull in context first. Adjust with explicit prompting if needed.
- Response length is now self-calibrating — shorter on simple tasks, longer on complex analysis. Don't mistake a short response for laziness on simple tasks.
- Improved honesty about progress: less likely to say "done" when it isn't, or claim it completed more than it did. Still worth verifying, especially on complex multi-file tasks.
- When switching model versions or updating skills to use a new model, watch the first few runs — don't blindly trust that everything behaves the same as before.

### Benchmarks Are Not Your Use Case
**[ALWAYS]**
- Never switch models or change approach based on benchmarks alone. Test against your actual workflows and your actual pain points.
- The relevant question is: does this model fix the specific problems I was having? For Career Intelligence the relevant ones are: does it follow SESSION_DECISIONS.md consistently, does it drift from the advisor persona, does it overengineer simple API functions.
- Keep a note of recurring frustrations with the current model. When a new model drops, test those specific scenarios rather than general benchmarks.

---

## 3. AI INTEGRATION

### Tool Selection Framework
**[ALWAYS]**
Use the simplest tool that gets the job done. In order of complexity and cost:

| Situation | Tool |
|---|---|
| Quick one-off task | Just ask Claude Code |
| Repeatable process | Skill |
| Side task that would pollute main context | Sub-agent |
| Need perspectives, debate, or design review | Agent team |
| Keep trying until objective criteria met | `/goal` |
| Giant parallel job across many independent pieces | Dynamic workflow |

### `/goal` Usage
**[NOW] [PHASE2]**
- Use for: bug fixes with objective criteria (OTP bug), performance targets (pipeline speed), UI polish (globe load time pattern).
- Always include: what to do, what done looks like, and constraints (which files not to touch).
- Vague goal = endless loop = wasted tokens. Be specific.
- Sub-agents within a `/goal` should run on Haiku.
- `/goal` = depth (iterate until done). Dynamic workflow = width (many parallel independent tasks). Don't confuse them.

### Sub-Agents — Deep Dive
**[ALWAYS]**

**What they are:**
- The main session is the orchestrator. Sub-agents are specialists it delegates to. They can only talk back to the main session — not to each other (that's agent teams).
- Sub-agents have their own clean context window. Work they do doesn't pollute the main session — only the summary comes back.
- At their core, a sub-agent is just a markdown file with YAML front matter + instructions. Same structure as a skill. The difference: sub-agents run in a fresh isolated context and can run in parallel.

**When to use one — signals:**
- About to read a lot of files → sub-agent
- About to produce a wall of output you'll never reread → sub-agent
- A job you keep repeating → build a custom sub-agent for it
- Independent parallel tasks (e.g. reviewing 15 chapters simultaneously) → sub-agents
- Want an unbiased fresh review → sub-agent (wakes up with no context or memory)
- Need cheap processing of large content → Haiku sub-agent

**When NOT to use one:**
- Quick single edit
- Steps that depend on each other sequentially
- Agents that need to talk to each other (use agent teams instead)
- Sub-agent needs the full conversation context
- Sub-agent needs to ask you a question (it can't — only the main session can)

**Specific agents to build for Career Intelligence:**
- `research-agent.md` — Haiku, read-only, web search enabled. Use for: Supabase auth debugging, Adzuna API edge cases, streaming pattern research, competitor research. Keeps main session clean.
- `code-reviewer.md` — reviews a serverless function before merge. Read-only. Checks: error handling, model selection (Haiku vs Sonnet), timeout config, cost implications.
- `design-critic.md` — reads a screen mockup or implementation and checks against SESSION_DECISIONS.md. No write access. Returns a report of deviations.
- `persona-reviewer.md` — reads advisor copy or chat output against ADVISOR_PERSONA.md. Returns pass/fail with specific notes.

**Building custom sub-agents:**
- Use `/agents` → create new agent → generate with Claude → describe what it does and when it should trigger
- YAML front matter fields that matter most: `name`, `description` (the trigger — be precise), `model`, `tools` (and `disallowed_tools`), `memory`
- After Claude generates the file, trim the description down. Auto-generated descriptions are too long — progressive disclosure means Claude reads just the description to decide whether to invoke it. Keep it tight and specific.
- Set `tools` to read-only for any agent that shouldn't write files or call APIs. This is a capability restriction, not just an instruction.
- Set `memory: project` for project-specific agents, global for agents you want available everywhere.

**Progressive disclosure — how Claude picks agents:**
- Claude reads only the YAML front matter (name + description) to decide whether to invoke an agent. It doesn't read the full body unless it decides to use it. This saves tokens.
- If an agent isn't firing when it should: ask Claude why it didn't invoke it, then update the description based on the answer.
- If an agent fires when it shouldn't: tighten the description trigger phrases.
- Skills and sub-agents can collide — if you have a skill and an agent with similar triggers, Claude may pick the skill. Resolve by either combining them or making triggers explicit.

**Project vs global:**
- Project-level: lives in `.claude/agents/` in the repo. Shared when repo is shared.
- Global: lives in home directory. Available across all projects, personal to you.
- Skills and agents follow the same project/global distinction.

**Cost and safety:**
- Smart boss (Opus main session) + cheap specialists (Haiku sub-agents) is the target architecture. Delegate all reading, research, and processing to Haiku. Opus only handles reasoning and decisions.
- Set `max_turns` on sub-agents doing loops or research to prevent runaway token burn.
- Read-only sub-agents are a safety primitive — use them for anything that touches sensitive data or external APIs. Capability restriction at the tool level, not just in the instructions.
- If downloading sub-agent markdown files from open source repos (e.g. awesome-claude-code-agents), verify there are no prompt injections. Use a read-only verification sub-agent to check before installing.

**The "specialists not generalists" model:**
- Main session = jack of all trades via skills
- Sub-agents = deep specialists with one job
- Build agents for: security auditor, test writer, doc writer, database query reviewer, design checker, persona checker, API reviewer. Each is excellent at one thing.

### Agent Teams
**[PHASE2] [PHASE3+]**
- Agent teams can talk to each other, share task lists, and debate. Unlike sub-agents which only report back to the main session.
- Must be enabled explicitly in `.claude/settings` (experimental feature).
- Use for design review before locking screens: spin up personas (anxious first-time user, career switcher, recent grad with no experience) and have them react to screen copy and layout.
- Use for architectural decisions: one agent is a skeptic, one is a performance engineer, one is a UX advocate — have them debate before you build.

### Dynamic Workflows
**[MIGRATION] [PHASE3+]**
- Likely overkill for current phase. Main use case is reviewing/processing many independent files in parallel.
- Relevant for your project when: migrating from `index.html` to Next.js (parallel review of ~6000 lines), or auditing all skills once you've built 10+.
- Each agent in a workflow is a full Claude call — token cost scales fast. Keep workflow agents on Haiku, synthesis agent on Sonnet/Opus.
- `ultracode` mode = X-high effort + workflows by default. Very expensive. Don't leave this on for regular sessions.
- `/deep research` automatically invokes a workflow — useful for researching streaming patterns for Vercel serverless functions, Supabase auth debugging, or competitive landscape research.

### Haiku vs Sonnet Split
**[ALWAYS]**
- This is already planned for `extract.js` vs `analyse.js` — treat it as a principle across the whole project.
- Haiku: extraction, formatting, simple processing, sub-agent tasks, data reading.
- Sonnet: intelligence, reasoning, advisor conversation, job scoring, anything user-facing.
- Never use Sonnet/Opus where Haiku will do. Cost compounds fast.

### `ultrathink`
**[ALWAYS]**
- Use for: complex architectural decisions, the analyse.js refactor, the Next.js migration plan, major debugging sessions, any decision that affects the whole system.
- Allocates ~32k tokens of reasoning before responding.
- Do not use for simple fixes or routine tasks.

---

## 4. SKILLS SYSTEM

### Skills Are the Highest-Leverage Feature
**[ALWAYS]**
- If you're giving Claude Code the same instruction more than twice, make it a skill.
- Skills live in `.claude/skills/` as markdown files. They can be simple (a 4-sentence prompt you don't want to retype) or complex (multi-step workflows with tool calls).
- Skills can chain to other skills. A `phase2-screen.md` skill could chain to `design-guard.md` and `persona-check.md` automatically.
- Skills can be executed by sub-agents, agent teams, and workflow agents — they're available across the whole system.
- Refine skills continuously. Challenge outputs aggressively — if Claude gives something mediocre, push back. When it comes back better, update the skill so the mistake isn't repeated.

### Skills to Build for Career Intelligence
**[NOW] [PHASE2]**
- `session-handoff.md` — summarise session, decisions made, what's next. Invoke at end of every session.
- `design-guard.md` — before marking any screen done, check implementation against SESSION_DECISIONS.md tokens. Flag any deviation.
- `persona-check.md` — review any advisor copy or chat output against ADVISOR_PERSONA.md voice rules before it goes to staging.
- `api-review.md` — review a serverless function for error handling, timeouts, model selection, and cost before merging.
- `phase2-screen.md` — full workflow for implementing a locked screen: read mockup → build → screenshot loop → design-guard check → persona-check if copy involved → deploy-check before merge.

### Grill Me Skill
**[NOW] [PHASE2] [PHASE3+]**
- The grill me skill extracts knowledge from your head into reusable context. Brain dumps alone produce ~70% quality. A structured grill me session gets to ~90% on the first iteration.
- Structure: asks one question at a time, checkpoints to a brainstorm doc as it goes, flags things you don't know, at the end offers to update all relevant skills and docs.
- Use before building any major feature. The doc it produces becomes the brief Claude Code builds from.
- Sessions to run before Phase 2 build: advisor persona, core user journey, daily actions mechanic.
- Re-run when major new features are added (CV builder, contacts finder, interview prep).

### How to Build Skills
**[ALWAYS]**
Two valid approaches — use whichever fits:

- **Build forward:** think about what you do repeatedly, describe the end goal to Claude Code, let it walk you through building the skill, iterate with feedback until it's good. Can take 50 iterations before it feels right — that's normal.
- **Reverse engineer:** do something end-to-end with Claude Code, get a result you're happy with, then say "look back at our conversation — what did we do to get there, what tools did you use, what questions did you ask — now build a skill that produces that output." This is often faster because you already know what good looks like.

Both approaches require iteration. The skill is never finished — every time you use it, give feedback and update it. Treat skills like living documents.

### The Advisor as a Mentor, Not a Chatbot
**[ALWAYS] [PHASE2]**
- Use Claude Code the way you want users to use your advisor: as a mentor you consult on problems, not a tool you give commands to. "How should we handle the case where a user has no CV?" gets better output than "write a fallback for missing CV data."
- You can outsource thinking but not understanding. Read what Claude Code produces. Put your own judgment on it. The output is a starting point, not a finished decision.
- When building the advisor feature: this distinction matters for how you prompt `chat.js`. The advisor should feel like a mentor, not a search engine. That tone needs to be explicit in ADVISOR_PERSONA.md and enforced by the persona-check skill.

### `/insights` for Workflow Auditing
**[ALWAYS]**
- Run `/insights` every few weeks once deep into Phase 2 build. Analyses past 30 days of Claude Code usage — surfaces what's working, what's going wrong, what skills to build.
- Useful for a solo founder to audit their own workflow and catch inefficiencies early.

---

## 5. DESIGN & UX

### Protecting the Locked Design System
**[PHASE2] [ALWAYS]**
- The `design-guard.md` skill should be invoked before any screen is considered done. Check against SESSION_DECISIONS.md tokens every time — not just when you remember.
- Feed screenshots of locked mockups to Claude Code at the start of every screen implementation session. Visual reference beats written description.
- If Claude Code drifts from the design system, use `/re` (rewind) rather than correcting forward. Patching adds context noise and causes further drift.
- Screenshot loop for every screen: build → screenshot → check against tokens → correct → screenshot again. Minimum two passes before V1.

### Inspiration and Visual Reference
**[PHASE2]**
- Feed screenshots of your design references (Resend, Linear, Craft.do, Dayone, Headspace) to Claude Code at the start of design-adjacent sessions. It can analyse visual patterns and apply them without making the output look generic.
- You can also pull HTML/CSS from reference sites and feed it as a structural template — tell Claude to use it as a pattern reference, not to copy it.

### Chrome DevTools for Functional Testing
**[PHASE2] [ALWAYS]**
- Claude Code can open a browser, interact with the app, and check actual functionality. Use this for testing the advisor chat, the analysis pipeline UI, form inputs, and button states — not just visual checks.

## 4b. COMMUNITY PLUGINS & SKILLS WORTH INSTALLING

### The Six High-Value Skills/Plugins
**[NOW] [ALWAYS]**
These are battle-tested, widely used plugins that address real production problems. Install order matters — start with skill creator, then add others as needed.

**1. Skill Creator** (`/pluginstall skill-creator`)
- Builds skills from plain English descriptions. You describe what you want, it drafts, tests, iterates, and packages the skill. You can drop in an existing SOP and it turns it into a reusable skill.
- Install globally so it's available across all projects. This is the factory — every other skill comes out of it.
- Directly relevant: use this to build `design-guard.md`, `persona-check.md`, `api-review.md`, `session-handoff.md` rather than writing them manually.

**2. Superpowers** (`/pluginstall superpowers`)
- Forces Claude to work like a senior developer through five disciplined phases: **clarify → design → plan → code → verify**. Unlike plan mode which just helps with planning, Superpowers stays with you through execution too.
- A master skill called "using superpowers" fires at the start of every conversation and acts as a dispatcher — it looks at all 14 sub-skills and decides which ones to use. Set it and forget it. You don't need to memorise the skills.
- **Key skills within it:** brainstorming (visual companion on localhost showing options before building), hyper-detailed planning (every task ~2–5 mins with exact file paths), sub-agent-driven execution (fresh sub-agents per task), parallel agent dispatch (spins up parallel agents for independent problems automatically), test-driven development (writes failing tests first, then minimum code to pass), systematic debugging (four-phase: investigate → analyse → hypothesise → fix), verification before completion.
- **Visual brainstorming feature:** before building, it opens a localhost dashboard showing you 2–3 different design/architecture options with pros and cons. You click which one you want. This prevents Claude from building the wrong thing and burning tokens on revisions. Critical alignment step.
- **Token comparison from controlled experiment (12 runs, Opus 4.6, same prompts):**
  - Simple tasks: Superpowers uses ~8% more tokens — skip it for simple requests.
  - Medium/complex tasks: ~9% cost savings, ~14% fewer total tokens vs without.
  - Without Superpowers: 2–3x variance in token usage (unpredictable). With Superpowers: much tighter, consistent runs.
  - Code quality measurably better on medium/complex tasks: correctness, code structure, test coverage, error handling all improved.
  - The value isn't in the extra steps — it's in preventing expensive retries and backtracking.
- **vs ultraplan:** ultraplan helps with planning only, then you're on your own. Superpowers stays with you through the full implementation.
- Install globally (`/pluginstall superpowers` at user level) so it works across all projects without thinking about it. Add "make sure you're using any relevant superpowers skills" to prompts for extra insurance.
- 150k+ GitHub stars. Install for all build sessions on Career Intelligence, especially anything touching the analysis pipeline, serverless functions, or database operations.

**3. GSD (Get Stuff Done)** (`/pluginstall gsd`)
- Fixes context rot by spawning fresh sub-agents for each task. Main session stays clean. Each task gets a full context window rather than the degraded leftovers of a long session.
- Has built-in quality gates: scope reduction detection (catches when Claude silently drops a requirement you asked for), security enforcement, autonomous mode for handing Claude a spec and walking away.
- Pair with Superpowers: Superpowers gives Claude the process, GSD gives it the clean context to execute that process consistently.
- Directly relevant: long build sessions on the analysis pipeline or Phase 2 screens — context rot is a real risk on sessions running 30+ minutes.
- Install with `/pluginstall gsd`, then run `/gsd-help` to see available commands.

**4. `/re` and `/ultra review`** (built-in, no install needed)
- `/re` — fast local code review. Runs on every piece of code you write. Catches bugs, edge cases, design issues. Free beyond normal usage tokens. Use it constantly.
- `/ultra review` — uploads branch to cloud sandbox, spins up parallel reviewer agents each attacking from a different angle (logic, security, performance, edge cases). Only confirmed bugs come back — no false positives. Takes 10–20 minutes but runs in background.
- Use `/ultra review` before merging anything that touches: analyse.js pipeline, Supabase schema changes, auth flow. Not free after the first 3 runs — roughly $5–20 per run depending on codebase size.
- Requires Claude Code version 2.1.86 or later.

**5. Context Mode** (`/pluginstall context-mode`)
- Routes tool calls (file reads, API responses, URL fetches, log output) through a sandbox — only the relevant summary comes back into context, not the raw dump. A 56KB snapshot becomes 299 bytes. 315KB of raw session output becomes 5KB total.
- Also tracks every meaningful session event in a local SQLite database. When Claude compacts, context mode rebuilds a session snapshot and injects it back. Sessions that degraded at 30 minutes now run for 3 hours.
- Directly relevant: Career Intelligence build sessions involve file reading, API calls, Supabase queries — all currently dumping raw data into context. Context mode significantly extends clean session time.
- Install with two commands (not just npm install — that registers the library only, hooks never run).

**6. Claude Mem** (`/pluginstall claude-mem`)
- Cross-session memory. Hooks into session lifecycle, captures file edits/decisions/bug fixes/commands, compresses to semantic summaries, stores in local SQLite with vector search. Relevant context injected automatically on new session start.
- Also auto-generates and updates folder-level CLAUDE.md files as you work. Project documentation writes itself.
- Token-efficient retrieval: 3-layer system (compact index → timeline → full details on demand). Reports ~10x token savings vs naive context loading.
- Directly relevant: Career Intelligence has complex state across many files. Currently relies on CLAUDE.md being manually updated. Claude Mem automates this and extends it to full session history.
- Warning: don't run just the npm install command — hooks never register. Use the two designated plugin commands.

**Bonus: Frontend Design Skill** (`/pluginstall frontend-design`)
- Anthropic's official skill. Makes Claude Code produce designs that don't look generically AI-generated. Install globally before any Phase 2 UI work. Reduces drift from your locked design system.

### Additional Plugins — Assessed 2026-06-15
**[ALWAYS]**
Five plugins reviewed against Lexi's actual setup. Decision per plugin:

| Plugin | Decision | Reason |
|---|---|---|
| **Caveman** (github.com/juliusbrussee/caveman, 69.5k ★) | ❌ No | Cuts tokens by compressing output to minimal language. Context discipline already handled via `/compact` + session handoffs. Compressed output is harder to read. Low value given existing setup. |
| **Claude-Mem** (github.com/thedotmack/claude-mem, 81k ★) | ❌ No | Already solved. The auto-memory system in `~/.claude/projects/` does exactly what claude-mem does — persistent context injected at session start. Don't double up. |
| **Taste-Skill** (github.com/leonxlnx/taste-skill, 35k ★) | ⚠️ Borderline | Kills AI slop in designs. CLAUDE.md already has "Zero AI design patterns" section that does the same job. May add marginal value in Phase 5 design sessions — revisit then. |
| **Humanizer** (github.com/blader/humanizer, 23k ★) | ✅ Yes — blog/copy sessions | Removes AI writing tells from text. Directly useful for blog content and any copy work. Install before any content session. Not needed in engineering sessions. |
| **MarketingSkills** (github.com/coreyhaines31/marketingskills, 32k ★) | ✅ Phase 5 | CRO, SEO, copywriting, growth engineering. Right tool for Phase 5 marketing work. Park until then. |

### Skills vs Plugins — the Distinction
**[ALWAYS]**
- A **skill** is a single markdown file that teaches Claude how to do a specific job.
- A **plugin** is a larger package: multiple skills plus hooks, MCP servers, and routing instructions that change how Claude Code behaves at a system level.
- Context Mode and Claude Mem are plugins — they install MCP servers and hooks. Don't treat them like simple markdown skills.

---

## 4c. FRONTEND BUILD WORKFLOW

### The Five-Hack Website Build Stack
**[PHASE2] [ALWAYS]**
This is the complete workflow for building professional, non-AI-looking frontend work in Claude Code.

**1. CLAUDE.md with frontend rules**
- Include explicit frontend rules in CLAUDE.md: which skill to always invoke, screenshot behaviour, file naming conventions, and the GitHub/Vercel deploy pipeline.
- A `brand_assets/` folder in the project root containing logo and brand guidelines gives Claude Code everything it needs to stay on-brand without repeating yourself.
- Tag assets directly with `@` when prompting: `@brand_guidelines @logo` — especially useful when filenames aren't self-explanatory.

**2. Frontend Design Skill (install globally)**
- Command: `/pluginstall frontend-design` (or the npm global install command from Anthropic's docs)
- Add to CLAUDE.md: "always invoke the frontend design skill before writing any frontend code, every session, no exceptions."
- Transforms output quality from generic AI-looking to polished and modern. One-sentence prompt with this skill active produces results comparable to multi-round prompting without it.
- Install globally at user level — available across all projects automatically.

**3. Screenshot loop (Puppeteer)**
- Ask Claude Code to set up Puppeteer for automated screenshots. Add the screenshot workflow to CLAUDE.md so it runs on every build.
- The loop: write code → start server → screenshot → compare to reference or check visually → fix mismatches → screenshot again. Minimum two passes before V1.
- **Important caveat:** for animated/dynamic elements, tell Claude Code to skip the screenshot tool. It gets stuck in a loop thinking animations look wrong from a static screenshot. Add to prompt: "because this is an animated element, do not use the screenshot tool — just work in the code and I'll review manually."
- Screenshots are primarily for Claude Code's benefit. Clean up the temp screenshots folder after each session.

**4. Inspiration from full sites**
- Screenshot a reference site using browser DevTools (F12 → Ctrl+Shift+P → "screenshot" → capture full size). Also copy the page CSS from DevTools Elements panel.
- Give Claude Code both the screenshot and the CSS, ask it to clone the site. It uses its eyes to compare what it builds against the reference.
- After cloning: give it your brand assets and ask it to work in your colours, typography, and logo. Two prompts to go from reference site to branded version.
- Inspiration sources: Dribbble, godly.website, awwwards.com, motionsites.ai.

**5. Individual components from 21st.dev**
- For specific elements (backgrounds, buttons, animations, borders) rather than full site clones.
- Copy the component prompt directly from 21st.dev and paste into Claude Code with instruction of where to place it.
- Disable screenshot loop when working with animated components.

### GitHub → Vercel Deploy Pipeline
**[PHASE2] [ALWAYS]**
- Local development → test on localhost → push to GitHub → Vercel auto-deploys to live URL. Already how your staging branch works.
- Add to CLAUDE.md: "always test on localhost first. Do not push to GitHub until I explicitly say to."
- Never push API keys, .env files, or credentials to GitHub.
- To update live site: make change locally → verify on localhost → tell Claude Code to push to GitHub → Vercel auto-deploys within 30 seconds.
- Custom domain: add via Vercel project settings → domains.

### Free Downloadable Resources
**[NOW]**
The transcript author's free School community (linked in video descriptions) contains downloadable versions of several resources mentioned across these videos. Worth checking before starting each relevant phase:
- **Web design CLAUDE.md template** — pre-built CLAUDE.md for website projects with screenshot workflow, frontend design skill invocation, file conventions
- **Session handoff skill** — the 4-sentence prompt skill for clean session transitions. Also available as a global install.
- **Grill me skill** — structured knowledge extraction skill (original by Matt PCO, extended version with checkpointing by transcript author)
- **Token dashboard** — open source GitHub repo. Give the link to Claude Code and ask it to set up on localhost. Pulls historical local session data and shows cache create vs cache read over time.
- **Superpowers plugin doc** — full breakdown of all 14 skills including the writing-skills meta-skill for extending the system
- **All skills, GitHub repos, and slide decks** from every video — available in free community classroom under "All YouTube Resources"
- **Printing Press CLI library** — printingpress.dev — pre-built CLIs for 50+ services, plus the factory skill for building custom ones

---

## 4d. CLAUDE DESIGN

### What It Is and When to Use It
**[PHASE2] [PHASE3+]**
- Claude Design is a separate Anthropic product (separate from Claude Code, Claude Chat, Co-work) specifically for visual work: websites, prototypes, slide decks, animations, launch videos, brand guidelines.
- It has its own **separate weekly usage quota** — distinct from your Claude Code session limit. Burning Design quota doesn't affect your build sessions and vice versa. Requires a paid plan.
- Built on Opus 4.7 (strong vision model) which validates its own output visually — it can literally look at what it built and catch visual errors.
- **Only open Claude Design when you have a clear plan and are ready to build.** Never brainstorm in Claude Design — do all ideation in Claude Chat first, then bring the refined plan into Design. Brainstorming in Design wastes your quota.

### Direct Relevance to Career Intelligence
**[PHASE2]**
- You already have a locked design system (SESSION_DECISIONS.md, tokens.css). Before Phase 2 screen build, consider creating a Claude Design design system from your existing assets — logo, colours, typography, component patterns. This produces a `design.md` spec file you can export and give to Claude Code, ensuring every screen implementation has a single source of truth.
- Alternatively, export your SESSION_DECISIONS.md token table + any existing screen mockups and give them directly to Claude Code as the design spec. Claude Design is optional if your design is already locked — it's most valuable when you need to iterate visually before building.
- For Phase 2 screens: if you want to iterate on the loading screen or input page design before locking, Claude Design is the right tool. Design in Claude Design, export as HTML/zip, bring into Claude Code, push to Vercel staging.

### How to Create a Design System
**[PHASE2]**
- Provide: logo PNG, colour palette, typography (font names, sizes, hierarchy), any existing component patterns (buttons, cards, inputs).
- Don't give it an entire GitHub repo unless there's genuinely critical info in there — it significantly increases token consumption. Key elements only: colours, logo, typography, button styles.
- The design system creation itself takes ~10–15 minutes and uses meaningful quota. Do it once, build it well, then reference it for everything.
- Export the design system as a zip or HTML and give it to Claude Code. Now both tools are working from the same spec.
- **Known issue:** Claude Design often modifies logos. If you have a precise logo, tell it explicitly: "I dropped in a PNG of the logo — keep it exactly as is. Do not modify the logo."

### Token Management for Claude Design
**[PHASE2]**
- Use Opus 4.7 for: initial design system creation, first-pass screen builds, anything requiring strong visual reasoning.
- Switch to Sonnet for: minor iterations, copy tweaks, layout adjustments. Sonnet 4.6 can handle most iterative changes fine.
- Do one visual change per prompt. Multi-change prompts result in only 1–2 being done well, the rest ignored or poorly executed.
- Use the **tweaks panel** (ask Claude Design to generate tweaks) instead of back-and-forth prompts for visual experimentation. Tweaks let you try colours, fonts, spacing, layout variants in real time without sending prompts — much more token-efficient.
- Use **direct inline edits** for specific element changes (click element, change text/size/colour) rather than prompting for changes you can make yourself.
- Use **draw + comment** to point at specific elements that don't have clickable DOM elements (e.g. background gradients, video transitions).
- If a session gets very long, export the current state as HTML/zip, open a fresh session, and continue iterating. Long threads cause context rot in Claude Design the same as in Claude Code.
- Brainstorm in Claude Chat → bring refined plan into Claude Design → export to Claude Code. Use each tool for what it's best at.

### The Four-Stage Workflow
**[PHASE2]**
1. **Ideate in Claude Chat** — brand concept, copy, structure, spec. Free. No quota cost.
2. **Build in Claude Design** — design system first, then screens. Use Opus for initial build, Sonnet for iterations.
3. **Export** — as HTML, zip, or hand off to Claude Code directly. The design spec also exports as a document you can use anywhere.
4. **Build in Claude Code** — take the exported design into Claude Code, push to GitHub, auto-deploy to Vercel staging.

### Deploying from Claude Design to Vercel
**[PHASE2]**
- Export Claude Design project as zip → extract → open folder in Claude Code → push to GitHub → connect GitHub repo to Vercel → auto-deploys on every push.
- Always verify locally first: tell Claude Code to open on localhost and check it looks correct before pushing to GitHub.
- After deploying, check mobile view (F12 → mobile toggle in browser). Claude Design doesn't auto-optimise for mobile — tell Claude Code to fix mobile layout as a separate step.
- To update the live site: make changes in Claude Code locally → Claude Code pushes to GitHub → Vercel picks up the push and redeploys automatically. Clean separation between staging (local) and production (Vercel).

### Inspiration Sources for Design Work
**[PHASE2] [PHASE3+]**
- **motionsites.ai** — animated backgrounds, scroll journeys, 3D card elements. Copy prompts directly into Claude Design and tell it to use your design system instead. Most elements are free.
- **21st.dev** — individual UI components (announcements, animated backgrounds, borders, buttons). Copy component prompt into Claude Design.
- **godly.website** — curated gallery of high-quality web design for inspiration.
- **Hyperframes** — framework for animated HTML graphics in Claude Design. Gives Claude Design a vocabulary for motion graphics, transitions, and animated launch videos.

### General Best Practices
**[PHASE2]**
- Reference real things: "Linear 2023 with higher density" is better than "clean and minimalist."
- Tell it what you don't want upfront — saves correction prompts later.
- Iterate section by section on complex pages rather than trying to build everything at once.
- When quota runs out, export and continue in Claude Code. Then bring back to Claude Design when quota resets.
- If you can make a change faster manually in Canva or Figma, do it. AI isn't always the right tool for precise small edits.

---

### The Hierarchy: CLI First, Then API, Then MCP
**[ALWAYS] [PHASE3+]**
- When connecting Claude Code to any external tool or service, prefer in this order: **CLI → API → MCP**
- **CLIs** are agent-native: fast, local, composable, output is clean short text (not raw JSON), no context bloat, no server to maintain, auth handled once. MCP used 35x more tokens than CLI on the same task in benchmarks. Reliability drops from 100% (CLI) to 72% (MCP) as tasks get harder.
- **APIs** are built for code, not agents. Raw JSON responses dump hundreds of tokens of structure you don't need. Fine when you only need one specific endpoint — in that case hardcode it rather than loading a full MCP server.
- **MCPs** are the right choice when you need dynamic tool discovery across many functions and there's no CLI available. But they load all tool definitions into context on every session — check `/context` to see how much they're costing you.

### Directly Relevant to Career Intelligence
**[NOW] [PHASE3+]**
- Your current external connections (Supabase, Adzuna, Resend, Anthropic API) are all API-based — that's fine and correct for production serverless functions.
- When you add Phase 3+ integrations (email OAuth, calendar, LinkedIn/contacts), evaluate whether a CLI exists before defaulting to an MCP server. CLIs keep context clean and are significantly cheaper per interaction.
- The "Printing Press" tool (printingpress.dev) lets you build custom CLIs for services without public APIs. Relevant for Phase 3+ if you need to interact with platforms that don't have clean APIs (e.g. scraping job boards, accessing professional networks).
- **Contact finder feature (Phase 3+):** the transcript demonstrates a `contact-goat` CLI that finds verified emails via LinkedIn cross-referenced with other sources. Worth investigating when you build the contacts finder feature — may be more token-efficient than an MCP approach.

### When to Use Each During Claude Code Build Sessions
**[ALWAYS]**
- For research during build sessions (e.g. checking Supabase docs, reading Adzuna API responses): use a Haiku sub-agent rather than loading an MCP server. Keeps main context clean.
- If you have MCP servers loaded, run `/context` to check how many tokens they're consuming passively. If you're not using a server in a session, consider removing it for that session.
- For any tool you use frequently in Claude Code sessions, ask: is there a CLI for this? If yes, use it. If not, can one be built in 10–15 minutes with Claude Code?

### Building Custom CLIs
**[PHASE3+]**
- Claude Code can build a CLI for almost any service in ~10 minutes using Printing Press factory. Describe what you want access to and it will research the service, reverse-engineer endpoints, and generate a Go CLI with a skill wrapper.
- CLIs built this way can be packaged into a private GitHub repo and shared with team members — they just swap in their own API key.
- Never put API keys or auth tokens inside CLI scripts. Treat them the same as API keys — environment variables, never committed.
- Even with a CLI, platform-level rate limits still apply. A CLI doesn't bypass quotas (e.g. YouTube comment limits per day).

---

### How Prompt Caching Works
**[ALWAYS]**
- Cached tokens cost only 10% of normal input tokens. Everything that can be cached should be.
- The cache is built in layers. From most to least stable:
  - **System layer** — base instructions, tool definitions (read/write/bash), output style. Cached globally.
  - **Project layer** — CLAUDE.md, memory files, rules. Cached per project.
  - **Conversation layer** — replies and messages. Re-processed every turn (this is normal and expected).
- On turn 1, everything is written to cache (cache create — a one-time cost). From turn 2 onward, the system and project layers are read from cache at 10% cost. Only new messages are processed fresh.
- Cache window on a Claude subscription: **1 hour**. If you leave a session idle for over an hour and then send a message, everything gets re-processed from scratch — expensive if you're deep into a session.
- Cache window for API calls and sub-agents: **5 minutes** by default. Can be increased to 1 hour at extra cost. This is critical — sub-agents in Career Intelligence (score.js, analyse.js calls) reset cache every 5 minutes by default.

### What Breaks the Cache — Critical List
**[ALWAYS]**
- **Going idle for over 1 hour** — entire session re-processes. If you're stepping away from a long session, either keep it active or run a session handoff and clear before you leave.
- **Switching models mid-session** — switching model resets the entire cache because caching uses prefix matching per model. Each model has its own cache. Even switching back to the same model starts fresh.
- **Using `model opus plan`** (plan mode on Opus, execution on Sonnet) — every plan/execute toggle is a model switch and breaks the cache. Understand this trade-off before using it.
- **Editing CLAUDE.md mid-session** — safe to edit, but the change doesn't apply until you restart the session. Cache stays intact during the session it was edited in. Restart to pick up the new CLAUDE.md.
- **`/compact`** — breaks the cache. Use session handoff + `/clear` instead (faster, same result, doesn't break cache on the new session).

### Three Habits That Cover 95% of Cases
**[ALWAYS]**
1. **Don't let sessions go idle for over an hour.** If stepping away from a long session, run session handoff → `/clear` → paste summary into new session. Feels seamless, preserves cache efficiency.
2. **Start fresh when switching tasks.** Use session handoff + `/clear` rather than `/compact`. Compact is slower and breaks cache. Clear with a pasted handoff summary is faster and cleaner.
3. **Don't switch models mid-session** unless you have a strong reason. Pick the right model at the start of the session and stay on it.

### Specific Implications for Career Intelligence
**[ALWAYS] [PIPELINE]**
- **Sub-agent cache TTL is 5 minutes.** Every serverless function that calls Claude (analyse.js, score.js, chat.js, extract.js) is effectively an API call with a 5-minute cache window. This means for short interactions this is fine, but for the advisor chat — where users have back-and-forth conversations — cache efficiency degrades fast. Worth understanding when designing the chat session architecture.
- **Keeping CLAUDE.md lean directly saves money.** Every token in CLAUDE.md is a cache create cost on every new session. 150–200 line limit isn't just about quality — it's a cost control measure.
- **Don't switch models during a build session.** Decide upfront: Haiku for extraction tasks, Sonnet for intelligence. Don't toggle mid-session.
- **Multiple sessions are not the enemy** — fresh sessions with a pasted handoff summary are cheap. The expensive thing is a bloated session that goes idle and then re-processes everything.

### Token Visibility
**[ALWAYS]**
- Status line shows context % — use it to know when you're approaching the 1-hour idle risk zone or when to compact.
- `/context` shows what's eating your tokens broken down by source.
- A free token dashboard GitHub repo exists (from the transcript author) that pulls in all historical local session data and shows cache create vs cache read over time. Worth setting up to track Career Intelligence build sessions. Ask Claude Code to set it up from the repo link.

## 5c. USAGE LIMITS & PLATFORM CHANGES

### Current Usage Limits (as of June 2026)
**[ALWAYS]**
- 5-hour rolling session limits have been **doubled** across all plans (Pro, Max, Team) following Anthropic's compute deal with SpaceX.
- Peak hours throttling has been **removed** for Pro and Max accounts. Previously, limits were hit faster during weekday mornings — this no longer applies.
- API rate limits for Opus models have been significantly increased — output tokens per minute went from 8k to 80k. Relevant for Career Intelligence's serverless functions (analyse.js, score.js, chat.js) which make direct API calls.
- These changes mean multi-agent workflows and parallel sub-agent patterns are now more viable in production than they were even a few months ago.

### What This Changes for Career Intelligence
**[NOW] [PIPELINE] [PHASE2]**
- **The analyse.js 90-second pipeline is now less likely to hit rate limits** while you're debugging it. You have more headroom to test the refactor without bumping into API constraints mid-session.
- **Parallel job fetching in jobs.js and parallel scoring in score.js** — the Promise.all() patterns already in your staging branch are now more viable at scale. API rate limits were a real constraint on these; they're much looser now.
- **Sub-agent patterns are more viable for production use**, not just prototyping. If you build research-agent, code-reviewer, or design-critic agents, running them in parallel during build sessions is less likely to hit limits.
- **Routines and scheduled agents** (Phase 3+ daily check-in mechanic) can now run without eating into your daily build session budget as aggressively as before.
- **Don't abandon context management discipline just because limits are looser.** Caching, compact, session handoff — these practices still matter. More headroom doesn't mean infinite headroom.

### Retest Things That Broke Before
**[PHASE2] [PHASE3+]**
- If you tried a pattern (parallel agents, Opus-heavy workflows, long autonomous sessions) and abandoned it due to rate limits, it's worth retrying. The constraint may no longer exist.
- Specifically for Career Intelligence: if the analyse.js streaming refactor was previously hitting rate limits during testing, that wall may now be gone.

---

## 6. GENERAL BEST PRACTICES

### Prompting Discipline
**[ALWAYS]**
- Give Claude problems, not just commands. "How should we handle streaming progress for the analysis pipeline?" gets better output than "write me a streaming function." When it reasons through the approach first, outputs improve significantly.
- Challenge outputs aggressively. If it's mediocre, push back: "scrap that, more elegant approach" or "try a completely different approach." When it comes back better, update the relevant skill or CLAUDE.md.
- `/re` (rewind) is better than correcting forward. Every correction added to a wrong path increases context noise. Rewind resets cleanly.

### Context Hygiene
**[ALWAYS]**
- Don't dump the entire codebase into a conversation. Only give Claude what it needs for the current task.
- Use `/context` + status line together: status line shows the number, `/context` shows what's eating it.
- Use sub-agents for anything that requires reading large amounts of context (e.g. scraping, research, log analysis) — they have their own context window and don't pollute the main session.

### Notifications and Monitoring
**[ALWAYS]**
- Set up a sound notification hook (`/hooks`) for when Claude finishes a session. Especially useful for long-running `/goal` tasks or the pipeline refactor — work on something else and come back when it's done.
- `/loop` for monitoring tasks: "every 5 minutes check the Vercel deployment status." Loops are bound to the session — they die when the terminal closes. Don't rely on them across sessions.

### `/re` and Undo
**[ALWAYS]**
- Use `/re` to roll back to a specific point in the conversation without starting over. Better than correcting forward — cleaner context, better cache.
- Make it a reflex: if Claude Code takes a wrong turn on anything touching the design system or the advisor persona, rewind immediately.

---

## 7. FUTURE REFERENCE

### Voice Agents with 11 Labs
**[PHASE3+]**
- Claude Code can build and fully configure a voice agent in 11 Labs entirely through natural language — no manual dashboard configuration needed. It reads the 11 Labs API docs, figures out the architecture, builds the agent, configures the system prompt, sets up tools, and embeds the widget. Takes ~15–45 minutes of iterative build.
- **Four components of every voice agent:** persona (system prompt), voice (including custom clones), knowledge base (what it knows), and tools (what it can do — API calls, booking systems, database lookups).
- **Three deployment options:** dashboard testing, website widget embed (one HTML snippet), or phone number via Twilio. Same agent engine, different entry points.
- **Directly relevant to Career Intelligence:** the advisor is currently text-based chat. A voice interface is a natural future evolution — users could talk through their career situation rather than type. The same `chat.js` persona and knowledge could back a voice layer.
- **Cal.com + 11 Labs booking pattern:** demonstrated end-to-end — voice agent collects name, email, company, problem, then books a call directly via cal.com API. Relevant if Career Intelligence ever needs a human coaching call booking flow.
- **Debugging pattern for voice agents:** when something goes wrong, describe the experience to Claude Code rather than digging through documentation. It will identify which of the three possible failure points (platform returning wrong data, agent querying incorrectly, agent misreading output) caused the issue and fix it.

### Voice Interview Practice — Cost Architecture
**[PHASE3+]**
For the voice interview practice feature (Phase 5), three tiers of implementation in ascending cost:

| Approach | STT | TTS | Cost per session | Quality |
|---|---|---|---|---|
| **MVP (free)** | Web Speech API (browser-native) | SpeechSynthesis API (browser-native) | £0 | Acceptable on Chrome, robotic TTS |
| **Step up (cheap)** | OpenAI Whisper | OpenAI TTS | ~5p per 5-min session | Good STT, natural TTS |
| **Premium** | OpenAI Whisper | ElevenLabs | £0.30+/min | Natural voice clone |

**Recommendation:** Build with Web Speech API first — zero cost, proves the mechanic. Upgrade to Whisper + OpenAI TTS if users want better quality. ElevenLabs only if premium voice becomes a selling point worth paying for.

**Reference:** Jack & Jill AI (Juno) implement voice coaching — study their approach in `brainstorms/competitor-research/jack-and-jill/` before building. They are likely on Web Speech API or Whisper, not ElevenLabs, given their pricing.

### CV Export — ATS-Safe PDF Approach
**[PHASE3+]**
When building the per-job CV builder (Phase 3b), the right approach for PDF export is server-side LaTeX rendering, not HTML-to-PDF (Puppeteer/wkhtmltopdf).

- LaTeX produces a clean text layer that ATS systems parse reliably — no hidden characters, no formatting noise
- HTML-to-PDF tools embed fonts and styles that some ATS systems misread or skip
- Implementation: user CV data → LaTeX template (server-side) → `pdflatex` compilation → PDF returned. Runs in a Node/Python serverless function.
- This is what professional CV tools use (including Jobeefy). The setup overhead is worth it — ATS compatibility is the whole point of a tailored CV.
- Add as a requirement when the CV builder session is planned, not as an afterthought.

**Security considerations for any public-facing AI widget:**
- Lock widget to allowed domains — prevents someone stealing the HTML snippet and running your agent on their site at your cost.
- Set a max call duration ceiling as a budget guardrail.
- Set rate limits on public pages to prevent abuse.
- Feed the agent real documentation — without grounded knowledge it will hallucinate answers.
- If users don't authenticate, you pay for every call. Plan for this before going public.

---

### Next.js Migration
**[MIGRATION]**
- The single `index.html` is a known shortcut. Migration to Next.js is recommended before Phase 2 engineering begins but has been deferred until design is fully locked.
- When the time comes: start with `/ultraplan` on the full migration scope before writing a line of code. Then use a dynamic workflow to run parallel agents reviewing each section of the ~6000-line codebase, identifying dependencies and flagging breaking changes.
- Install Context7 MCP server before the migration. It pulls live, version-specific documentation for Next.js, React etc. and injects it before Claude writes code — prevents deprecated API suggestions. One command to install.

### Cross-Session Advisor Memory (Phase 3)
**[PHASE3+]**
- Agent teams become highly relevant here. The advisor memory system will require multiple components that need to reason together — retrieval, synthesis, personalisation. Agent teams with defined roles are better suited than sub-agents for this.
- Scheduled routines (via desktop app, not `/loop`) are the right primitive for the daily check-in mechanic — an actual agent on a schedule, not a deterministic script.

### B2B Pivot
**[PHASE3+]**
- Run a grill me session on the B2B version before that work starts. Completely different assumptions about users, pricing, onboarding, and success metrics. The doc it produces becomes the brief.

### VPS / Always-On Sessions
**[PHASE3+]**
- For long autonomous build tasks — host Claude Code on a remote server, SSH in or control via phone. Relevant once building more complex agentic features in Phase 3+.

### Data Analytics
**[PHASE3+]**
- Connect BigQuery or similar CLI tool to Claude Code for plain-English data queries once you have user data. Useful for analysing behaviour, retention, and drop-off in the analysis pipeline.

### Skills Audit Workflow
**[PHASE3+]**
- Once you've built 10+ skills, run a dynamic workflow to audit them all: grade clarity, trigger quality, consistency with CLAUDE.md conventions. Get a ranked report with fixes. Re-run whenever the skill library grows significantly.

### Remote Control
**[PHASE2] [PHASE3+]**
- Enable remote control for long build sessions. Start something at your desk, keep steering it from your phone. Code never leaves your local machine.

---

*Document built from video transcript synthesis. Update after each major session or new transcript batch. Last updated: June 2026.*
