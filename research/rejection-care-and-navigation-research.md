# Rejection care, feedback-routing & advisor navigation — research note

_Created 2026-06-29 (Session 42). Grounds Theme A: the advisor holding the user through a rejection,
acknowledging stage changes, and (only when asked) opening a surface. Builds on the existing distress
boundary already in `ADVISOR_PERSONA.md` §5 + `research/mentorship-research.md` (mentor ≠ therapist,
EMCC §4 refer-on). This note covers the EVERYDAY rejection moment, which is not distress-level._

Decisions confirmed with Lexi before building (she asked for research first on all three — see
memory `feedback_evidence_before_decision`).

---

## 1. How far into emotion does rejection-care go?

**Finding.** Career coaches and the psychology literature converge on a two-beat shape: *let the feeling
be real first, in a safe space, THEN move to thinking/action* — but the action that actually helps is a
**cognitive reframe**, not a task list. The reframe that works is "what can I learn / this is a
competitive process, not a verdict on me", explicitly NOT "what's wrong with me". Rejection activates the
same neural pathways as physical pain, and repeated rejection causes "rejection fatigue" that erodes
confidence over time — so neither pure comfort (leaves them stuck) nor an instant pivot (reads as cold,
dismisses real pain) is right. People protect themselves by reframing rejection as part of a competitive
process; peer/mentor support is central to that reframe landing.

**Decision.** A **light, fixed arc, cue-sensitive on pace**: acknowledge genuinely → normalise ("this is
the process, not a verdict on you") → then offer the learning reframe, reading whether they want to sit
with it or move. Stays inside our boundary: holds space, normalises, never diagnoses. Genuine distress
still escalates via the existing §5 signpost rule.

Sources: [Psychology Today — overcoming the pain of job rejection](https://www.psychologytoday.com/us/blog/frazzlebrain/202303/how-to-overcome-the-pain-of-job-rejection-0) ·
[Springer / Current Psychology 2025 — professional rejection during the job search](https://link.springer.com/article/10.1007/s12144-025-08609-x) ·
[The Interview Guys — the rejection reframe](https://blog.theinterviewguys.com/the-rejection-reframe/) ·
[Arrow Career Consulting — resilience in job search](https://www.arrowcareerconsulting.com/blog/how-to-build-resilience-and-stay-upbeat-in-job-search)

## 2. Invite the rejection email, or not?

**Finding — decisive.** Feedback is rare. **83% of candidates get no feedback at all beyond the rejection,
even after attending an interview** (Debut, via People Management); a separate BITC survey found 40% of
young people got nothing after an interview. Employers deliberately give little or nothing to avoid
disputes and because of volume (Goldman Sachs: 250k+ grad applicants). There is no UK statutory duty to
give feedback. So asking a user to "paste the rejection email" mostly surfaces a generic no-reason
rejection — low diagnostic yield, and it makes them re-read a painful email for nothing.

**Decision.** The advisor **does not ask for the email**. It asks whether they got *any* reason or
feedback. If yes → work with it concretely. If no (the 83% case) → normalise hard that no-feedback is
standard and *not* a signal they did something wrong, then pivot to what we can improve anyway (the
application itself, the pattern across applications). Where it was an interview-stage rejection, the
advisor may coach them to *request* feedback themselves.

Sources: [People Management — what are you telling unsuccessful candidates? (Debut 83%, BITC 40%)](https://www.peoplemanagement.co.uk/article/1742372/what-telling-unsuccessful-candidates) ·
[Acas — rejected job applications](https://www.acas.org.uk/if-an-employer-says-you-cannot-apply-or-rejects-you-for-a-job) ·
[targetjobs — how to get feedback after a graduate interview](https://targetjobs.co.uk/careers-advice/job-offers-and-working-life/been-rejected-after-graduate-job-interview-heres-how-get-feedback)

## 3. Auto-switch tab, or quiet update?

**Finding.** Nielsen's heuristic #3 (User Control & Freedom): automatic navigation/state changes can leave
users feeling trapped, and this becomes *more* critical in AI/conversational interfaces, not less. Best
practice is to let the user switch at will rather than move them.

**Decision (with Lexi's refinement).** A state change (e.g. "I applied") **never** moves the user: it
updates quietly in the background, the advisor acknowledges in chat, and the Applications surface refreshes
live *if already open*. The advisor CAN open a surface — but **only when the user explicitly asks** ("show
me my applications"), never as a side-effect. Implemented as a user-requested `open_surface` tool, not an
automatic navigation.

Sources: [NN/g — User Control and Freedom (heuristic #3)](https://www.nngroup.com/articles/user-control-and-freedom/) ·
[Nielsen's heuristics revisited for conversational AI](https://medium.com/design-bootcamp/nielsens-heuristics-revisited-for-conversational-ai-90e1c613ce05)

---

## Stage acknowledgement (A2)

Same evidence base, applied to the wins: an **Offer** earns a genuine, specific "well done" (never
gamified — no points/streaks/confetti; see memory `feedback_no_gamification`). **Interview** earns
encouragement + an offer to prep. **Applied** earns a calm, steadying acknowledgement (the silence that
follows is the known wound — see `MISSION.md`). Carried as emotional-weight guidance in the
`set_application_stage` tool result so the advisor speaks to the moment, not just confirms a state change.
