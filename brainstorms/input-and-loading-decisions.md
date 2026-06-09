# Input Page + Loading Screen — Brainstorm
_Status: Complete_
_Date: 2026-06-09_

## Summary & Key Decisions

### Input page — locked decisions

**Structure: 3 steps only.**
1. Background — CV upload (primary) or text (equal-dignity fallback)
2. Direction — where you're heading / what you're pivoting toward
3. Practical — location + work restrictions in one natural-language field

**Format: Mentor-voice conversation, not a form.**
- Opening framing line: "I'm going to ask you two or three things. That's it."
- Each question phrased in advisor voice — warm, direct, first person
- Between steps: a brief specific acknowledgment ("Got what I need." / "That helps.") before advancing
- No advisor name or icon yet — copy does the work. Identity decided in Session 3.
- Copy is placeholder register now — final words in copywriting session (Phase 5)

**Two equal paths in (no hierarchy):**
- Has CV: "Upload your CV — I'll read it so you don't have to explain yourself twice."
- No CV / prefers to talk: "No CV, or you'd rather just talk? Either works."

**Deferred to advisor conversation (post-results):** salary floor, dealbreakers, flexibility preferences. Advisor asks these naturally after showing value.

**Visa / work restrictions:** handled in step 3 as natural language — "Where are you based, and any work restrictions I should know about?" Covers international students and sponsorship requirements without a separate form field.

---

### Loading screen — locked decisions

**Visual: Text only. No orb.**
- Warm background, DM Serif Display italic, slow crossfade between phrases
- No animation except text transition
- Breathing orb removed — reads as generic AI loading

**Copy handles the wait expectation — 4 phrases:**
1. "I'm taking a minute with this — it's worth doing properly." *(sets expectation)*
2. "Reading what you've built, and what it says between the lines."
3. "Finding the roles where someone like you would actually do well."
4. "Almost there." *(this is the progress indicator — no bar needed)*

**Time target:** About a minute (the Phase 1 performance goal). Ideally faster. The copy doesn't commit to a specific number.

**Phase 1 upgrade:** Loading screen phrases become personalised using keywords from user input. Architecture decision (template vs. Haiku-generated) made in the Phase 1 engineering session.

**Advisor icon:** Deliberate placeholder — replaced in Session 3 when identity is decided.

## Q&A Log

### Q2: What does the analysis actually need at input?

**Decision: Only two things are essential before the analysis can run:**
1. Background (CV or typed)
2. Location + work restrictions (one question, natural language — covers visa/sponsorship)

Direction is kept as a third step — essential for pivots and people who don't know what they want.

Salary, dealbreakers, flexibility — all deferred to advisor conversation after results are shown. The advisor asks: "Before I refine these — is salary a floor I should know about?" That's the right moment.

**Final input flow: 3 steps only.**
1. Background → CV upload (primary) or text (no CV path)
2. Direction → where you're heading / what you're pivoting toward
3. Practical → "Where are you based, and any work restrictions I should know about?" (covers location + visa in one natural-language field)

---

### Q1: What's the entry point — CV upload or free text?

**Decision: CV upload is the primary entry point. Free text is the fallback for people who don't have a CV yet.**

Two paths:
- **Has a CV** → upload first, product reads it, then asks 2 follow-up questions
- **No CV** → text field instead: "Tell me about yourself — what you've studied, what you've done, what you're interested in." Same follow-up questions after.

Direction question is confirmed: kept. Especially important for people pivoting (e.g. "I was in design but want something more analytical") — they need to say this, the CV alone won't show it.

**Flags raised:**
- International students / visa sponsorship / right to work is an edge case that must be handled in the input flow. It completely changes which jobs are relevant. Currently unhandled.
- "Priorities" framing is confusing — needs to be reframed or replaced.

### Q4: How do we frame the no-CV path without pointing out a gap?

**Decision: Two equally valid paths in — not primary and fallback.**

Option A (has CV): "Upload your CV — I'll read it so you don't have to explain yourself twice."
Option B (no CV or prefers to talk): "No CV, or you'd rather just talk? Tell me your story."

The second option covers BOTH "don't have one yet" AND "would rather not use it" (e.g. someone pivoting away from their history). Neither path feels inferior.

**CV builder offer:** Lexi mentioned the idea of offering to help build a CV on this path. This is a Phase 3 feature — not available yet. The advisor can plant this naturally post-analysis: "I noticed you don't have a CV — once we've found your direction, I can help you build one." Do NOT promise this on the input page until it exists.

**Copy is placeholder** — exact wording TBD in the copywriting session. Register is decided: equal dignity, no gap-pointing, invitation not deficit.

---

### Q6: Time expectation on the loading screen — "about a minute" or "90 seconds"?

**Decision: "About a minute" — the Phase 1 target time, not the current broken time.**
The copy doesn't commit to a number anyway ("I'm taking a minute with this") so we're not locked in. Ideally even faster than a minute once the Haiku + Sonnet split is in. This is fine as v1 copy.

---

### Q5: Loading screen — what replaces the orb, and how does the user know how long to wait?

**Decision: Copy handles the wait expectation. No progress bar. No orb.**

The phrase sequence itself signals progress — the final phrase "Almost there." is the progress indicator. No visual bar needed.

Phrase sequence (generic placeholder — personalised in Phase 1):
1. "I'm taking a minute with this — it's worth doing properly." (sets expectation)
2. "Reading what you've built, and what it says between the lines."
3. "Finding the roles where someone like you would actually do well."
4. "Almost there." (signals end — this is the progress indicator)

Visual: warm background, DM Serif Display italic copy (already correct), slow crossfade between phrases. No animation except text transition.

**Personalised messages (Phase 1 engineering decision):**
Pass keywords from user's input into phrase templates, or use a Haiku call to generate 3–4 personalised phrases before the main analysis runs. Design session uses generic placeholders — architecture decision made in Phase 1.

**Advisor icon:** Deliberate placeholder for now (small neutral mark or nothing). Replaced in Session 3 when identity is decided. Do not design around a specific icon that doesn't exist yet.

**On the orb:** Removed. A breathing amber orb reads as generic AI loading — exactly the register this product is trying to avoid. The restraint of text-only IS the design statement.

---

### Q3: What register for the acknowledgment between steps?

**Decision: Warm but brief. Specific to what was just given, not generic. Placeholder now, proper copy in the copywriting session.**

Placeholder register:
- After background (CV or text): "Got what I need."
- After direction: "That helps."
- The step count should be communicated upfront in the intro line: "I'm going to ask you two or three things. That's it." — reduces anxiety about commitment before the user knows what they're walking into.

The actual copy (the specific line that acknowledges what the user shared) gets written in the voice/copywriting session (Phase 5 — "20–30 sample advisor messages across all key moments"). The REGISTER is decided now. The words get polished later.

**Confirmed: the intro framing line should tell the user how many questions upfront.** "Two or three, depending on your situation" is the right tone — honest, low-commitment, no surprise.

---

## Parking Lot

### CV as a living document (Phase 3–4)
User's account holds their CV. As they complete skills, close gaps, or hit milestones — the CV updates automatically. Also supports: generic CV building (for users who arrive without one) + targeted CV per role. Strong vision for the account/profile section.
*This is a Phase 3 feature. Do not build or promise it before then. Advisor can reference it post-analysis for no-CV users: "Once we've figured out your direction, I can help you build one."*

---

## Open Flags
- Advisor name + icon NOT decided yet. Do not introduce a named character or avatar in this design. Copy does the work. Identity decided in Session 3.
- Acknowledgment copy is placeholder — proper copy session needed before staging.
- Competition risk flagged and addressed — see Q&A log.
