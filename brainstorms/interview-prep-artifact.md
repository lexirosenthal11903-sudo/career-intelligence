# SPEC — Interview Prep artifact (prep that lives inside the application)

_Agreed 2026-07-03 (Lexi + Claude, Session 50). Contract for the build. Extends the "one record, two lenses"
model in `SPEC.md`: prep becomes another document on the application hub, beside CV / cover letter / outreach.
Grounds: `research/interview-prep-research.md` (substance, already shipped for the conversational prep) +
the 2026-07-03 prior-art scan (persistence/surfacing UX). Principle: `feedback_per_application_artifacts`._

---

## The problem (why this exists)

Interview prep and the mock are conversational only. The advisor plans and drills in chat, but nothing —
the likely questions, the user's worked-out answers, the "what to focus on" takeaway — persists into the
application. Return to the job a week later and there is no trace of the prep. That breaks the standing rule
that **anything worked on for a specific application must live inside that application** — the same rule
behind the 2026-07-03 CV-orphaning fix.

## The evidence (2026-07-03 prior-art scan — full detail in session)

- **Trackers** (Huntr, Teal, Careerflow) attach prep to a role as *freeform notes* — nothing generated.
- **Prentus** is closest to the target: each saved job gets a JD-specific *likely-questions list* + a mock.
- **Big Interview** has the best durable artifact — the user's own *saved STAR answers*, refined over time —
  but files them in a generic library, **not under the job**. That is the gap everyone leaves open.
- **Yoodli / Google Interview Warmup** produce transcripts + delivery scores, but by *session* not by *job*;
  transcripts get re-read almost never, and scores are anxiety fuel when saved.
- **Winning pattern:** a short, *editable* prep doc per role — not a chat log, not a metrics dashboard.

## ⚠️ CORRECTION (Lexi, 2026-07-05) — MENTOR, not vending machine

The first build (caught before Lexi tested) drifted: it had the AI GENERATE the user's answers to edit. That
is the job-tool anti-persona we exist to beat, and it removes the learning — an interview answer is a *skill
the user must own and perform*, not a document we hand over. Standing rule now: `CLAUDE.md` principle 7 +
memory `feedback-mentor-not-vending-machine`. The corrected model teaches, guides and draws the answer OUT of
the user; it never authors the substance.

## Agreed model (corrected — one Prep artifact per role, beside CV / Cover letter / Outreach)

1. **Likely questions for this role** — 5 to 8, role-calibrated. Each collapsible.
2. **"What they're really asking"** — one line of coaching per question: what a strong answer shows. This
   TEACHES (replaces the old AI-written answer). Generated server-side, grounded in the interview research.
3. **A structure scaffold, not content** — an empty STAR skeleton (Situation / Task / Action / Result) to
   think against for competency questions; self-knowledge prompts for strengths; an approach outline for
   technical/case. Structure only, never a filled-in answer.
4. **The user's OWN answer** — starts empty with a warm invite. They develop it *with* the advisor through the
   mock and conversation: the advisor asks the drawing-out questions, they speak, and only THEIR words are
   saved (the advisor may help shape/structure, never author the substance). They can also type/edit directly.
5. **A short "focus for this interview" note** — 2 to 3 lines the advisor writes after a mock. Keep.

**Deliberately NOT saved** (against our principles): AI-authored answers · full mock transcripts (noise) ·
delivery scores / filler counts / any number (anxiety fuel + gamification, banned).

**OPEN (confirm with Lexi):** scaffold depth — explicit STAR-structure prompts (recommended: teaches the
framework) vs. lighter "what it's testing" plus a blank space.

## The bar that makes it ours (the feel, not the engineering)

- **It coaches, it never hands over answers.** The advisor draws the story out and gives the structure; the
  user supplies and owns the content. No AI-written answer ever lands in the box.
- **Prep must never read like homework.** Warm, invitational empty state ("When you're ready, we'll shape your
  answers together"), never "Add your answers". Practice is offered, never demanded.
- **The mock feeds the artifact, the artifact is the durable thing.** Questions + coaching + focus note flow in
  from the chat; the user never has to click "save my prep".
- Voice everywhere obeys `ADVISOR_PERSONA` (no em dashes, warm "we/you", no over-honesty, no numbers/scores).

## Technical shape (Claude's call — for the build)

- **Storage:** one `documents` row, `type: 'interview_prep'`, under the role's **canonical** job_id (via
  `ensureApplicationSaved`'s returned id — the exact path the CV/cover-letter now use). No migration: the
  documents schema already allows new types. Shape: `content` = focus note (text); `metadata` =
  `{ jobTitle, jobCompany, questions: [{ q, a }] }` (a = the user's saved answer, '' until seeded/edited).
- **Advisor:** a `save_interview_prep` tool — params `{ roleTitle, company, questions:[{q,a}], focus }` —
  that resolves the canonical id and upserts the row. The advisor calls it when it plans (questions + seeded
  answers) and after a mock (updates the focus note). Prompt updated to instruct this; emits a
  `ci:prep-changed` signal so the detail view re-reads live (mirrors `cv-tailored` / `outreach-changed`).
- **UI:** a **Prep** section in `SavedJobDetail`, beside CV / Cover letter / Outreach. Renders the questions
  (collapsible) with an editable answer under each (reuse the notes-edit textarea + save pattern; save via a
  small `/api/documents` PATCH or the existing document upsert path, keyed by canonical job_id), and the
  focus note. Editing an answer writes back to the same `interview_prep` document's metadata.

## ▶ KNOWN GAP / NEXT LAYER — company-factual grounding (Lexi, 2026-07-05; research-first)

The current build generates questions *calibrated to the role* from the model's training knowledge. It is NOT
yet grounded in the SPECIFIC employer's real, sourced interview process. Principle (standing rule
`feedback_ground_facts_free`): the platform must always be as specific to what the person is actually doing,
and as factual, as possible. For a **named employer with a known process** (PwC analyst, the Civil Service,
Amazon, the Big Four) the prep should reflect THAT employer's published/real process — not generic questions.
Generic-for-the-role is the fallback only when nothing specific exists (e.g. a role pasted from nowhere).
**Closing it = the company-grounding layer:** published frameworks + employer careers/"what to expect" pages +
Companies House verify, all £0 (see `GROUNDED-KNOWLEDGE-PLAN.md`). Research-first, its own session; do not
fake employer specifics in the meantime (honest fallback: "this is the general shape for this kind of role").
**⏰ Add to the NEXT test (Lexi is not retesting now):** for a named employer, is the prep genuinely specific
and factual to THAT employer, or generic/made-up? That is now a pass/fail criterion.

## Done criteria (objective — Claude self-verifies)

1. Advisor prep in chat persists a `Prep` artifact under the role's canonical id; it appears in that role's
   Applications detail (not only in Documents), and NOT under any other role.
2. Each question renders collapsible with (a) "what they're really asking" coaching, (b) a STRUCTURE scaffold,
   (c) the user's OWN answer box — empty, never an AI-written draft; the saved answer survives a refresh.
3. The focus note the advisor writes after a mock shows in the Prep section.
4. No transcript, no score/number, and NO AI-authored answer is ever persisted or shown.
5. Empty states are warm and non-pressuring; all advisor copy passes the persona sanitiser (no em dashes etc.).
6. Unit tests green; tsc + lint + build clean; real-API harnesses confirm the advisor calls the tool and the
   generation coaches (question + testing + scaffold) with ZERO written answers.
7. **(Next test — company grounding)** for a named employer, the prep is specific + factual to THAT employer,
   not generic or fabricated.

## Explicitly out of scope (this build)

- Voice answers, the focused webcam mock studio (parked, FEATURE-ROADMAP video-studio sub-bullet).
- Cross-role "all my prep" library view. Prep stays per-role, like outreach.
- Any scoring, rating, or progress metric.
