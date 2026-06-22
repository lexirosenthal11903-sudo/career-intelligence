# Walkthrough feedback — Lexi, full new-user + returning click-through (2026-06-22)

_Captured verbatim-in-substance from Lexi's live walkthrough so nothing is lost. Organised into themes,
with severity and Claude's note where useful. This is the working backlog — to be consolidated with the
automated Chrome audit (see §Process) into a single prioritised plan. **Not yet sequenced into REBUILD.md**
— do that after the audit so we plan against the complete, deduplicated list._

Severity: 🔴 loses users / broken · 🟠 important · 🟡 polish · 💡 idea/feature

---

## A. New-user / onboarding flow (the highest-leverage problem)
- 🟠 **Side-panel nav is confusing on first load.** Shows Roles(new) / Your direction / Documents(greyed)
  / Profile, plus Today. Feels strange. Lexi's instinct: either show them ALL, or show ONLY Today and
  build the rest in once the user has given their profile. Pick one consistent model.
- 🔴 **Avatar shows "E"** after sending CV — it can't know her name (and her name isn't E). Bug: where is
  the initial coming from (leftover mock? email-derived default?).
- 🔴 **It never asked the discovery questions.** No "any requirements? anywhere specific you want to work?
  what direction, even vaguely?" — went straight to "here's where I see this going." This is the
  conversation we always said should happen first. Premature analysis.
- 🟡 **"worth exploring" red pill** — unnecessary, remove.
- 🟠 **Too much information at once** — the reveal dumps a lot; overwhelming on first look. Needs pacing.
- 🟠 **No lead-in to signing in / saving results** at the right moment — it just doesn't guide there.
- 🟠 **Composer suggests what to write, but as a new user Lexi didn't know where to go** — no clear next step.
- 🟠 **Nav items not clickable in first session** (Roles/Direction/Documents/Profile) — dead.
- 🟠 **Can't scroll up to re-read the onboarding message** after replying.
- 🔴 **The sign-in wall is jarring and forceful.** After ONE reply: "I'd love to respond properly but I'll
  need you to sign in first to keep our conversation going" — nowhere else to go. **Could lose a lot of
  users.** Needs a much softer, later, optional-feeling gate.

## B. Auth (concrete, losing-users bugs)
- 🔴 **Sign-up with an existing email → "something went wrong, couldn't send a code… requested recently".**
  Wrong message — should say **account already exists** (she hadn't requested a code).
- 🔴 **Logging in (not Google) with that same email → same error.** Existing-account email login must work.
- 🟠 **"Sign in" bounces to the landing page with a popup** — disorienting; doesn't make sense in-flow.
- 🟡 **Google login (existing account) took a second** for everything to appear.
- 💡 **Offer "Continue with LinkedIn"** — pulls background, big friction reduction vs CV upload. (Already
  Phase 4 in roadmap.) Decide the right moment to surface it.

## C. Branding / pages
- 🟠 **App vs landing inconsistency; landing page not updated at all.** (Confirm the in-app wordmark state —
  nav still reads "Career Intelligence"; "Meridian" rename was deferred to pre-university-pitch. Lexi
  flagged the inconsistency — worth resolving the name question or at least making app+landing consistent.)

## D. Home / returning experience
- 🟠 **Home is a wall of reading — can't scan quickly.**
- 💡 **An "inbox"-style digest** (à la Jack & Jill): everything new since last visit — new jobs, people to
  reach out to, new things. Maybe not called "inbox" (too dashboard-y). Lexi asks for Claude's view.
- 🟠 **Inconsistent reload behaviour:** Today ↔ another tab reloads; switching between tabs does NOT reload
  what the chatbot is saying. Make it consistent.
- 🟡 **"Direction forming" pill on chatbot messages** — feels unnecessary. Idea: only keep it if it's
  meaningful — e.g. colour-coded workstreams (direction forming / applications / prep). Otherwise remove.
- 🟡 **"Roles" label in the top-right corner** — doesn't need to be there.

## E. Saved roles / applications
- 🟠 **Saved roles lack the per-role actions** that live listings have: interview practice, CV tailoring for
  the role, outreach. These must be on saved roles too (currently only the live listing has them).
- 🔴 **No way to remove a saved role.**
- 🔴 **Nowhere to actually SEE saved roles** — only "Recent". Needs a real, clean Saved/Applications view.
- 🟠 **Want saved roles + their stages side by side** (the applications board view).
- 🟠 **Stage buttons (prepare→apply→interview→offer) do nothing meaningful**, and Arlo doesn't engage with a
  stage change.
- 🟠 **"Prep me for this role" says "what they're likely looking for"** — it should use what the actual job
  description says they want first, THEN suggest additional likely things.

## F. Direction
- 🟠 **Can't click a direction to learn more.** The user is inquisitive but may not know what to ask —
  direction detail (what it is, what it rewards, salary, ask-prompts) should be explorable.

## G. Matching quality (bugs)
- 🔴 **Recommended Chief of Staff for an entry/junior profile** — seniority mismatch still happening despite
  the seniority rules. Investigate.
- 🟡 **Some company icons still not showing.**

## H. Profile / account
- 🟠 **Bottom-left name/email is not clickable; Profile not clickable.** (Profile view not built yet — known.)
- 🟠 **Account/data reconciliation is confusing:** Lexi keeps entering new info then logging in with the
  same account — unclear how the new info relates to the existing account. Needs an explained model + a
  clean way to test (e.g. a reset, or clarity that latest analysis wins per user).

## Process & open questions (Lexi's suggestions)
- 💡 **Use Claude + Chrome to audit the product itself** with a detailed prompt: bugs, missing steps, broken
  flows, dead ends, questions a user would ask that we haven't considered. Lexi finds it hard to audit
  alone / while constantly changing her own account data. **Claude strongly agrees — this is the next step.**
  (Build on the existing `research/audit-prompt.md` from S32.)
- **Overall:** lots of loose ends; the experience needs a coherent re-think of (1) the new-user flow and
  (2) the returning core experience, plus a pass on the concrete auth bugs. Feature breakdown: each item
  has real depth — the product must hold the user's hand at every step and never assume they know. Every
  element must be purposeful — no information for its own sake.
