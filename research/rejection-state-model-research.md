# Rejection state-model research — visible stage, ask-why, reason-routing

_Created 2026-06-29 (Session 43). Grounds the STATE MODEL behind "the rejection moment, done
properly" (the VOICE arc was locked Session 42 in `rejection-care-and-navigation-research.md`; this
note is the data layer underneath it). Three forks, each researched before Lexi decided — per
[[feedback_evidence_before_decision]]. Web sweep run by three parallel agents 2026-06-29._

---

## Fork 1 — does a rejected role show as a visible stage, or move to a quiet "Closed" area?

**The question is really "individual vs aggregate," not "visible vs hidden."**

- **Category convention is a visible "Rejected" column** — but those tools serve funnel-analytics
  power users: Teal (Rejected status in the picker), Jobscan (fixed Rejected column), Huntr (column
  **or** an Archive — "jobs you applied for but didn't progress"), Notion templates (Rejected by
  default). [Teal](https://www.tealhq.com/tools/job-tracker) ·
  [Jobscan](https://www.jobscan.co/job-tracker) · [Huntr](https://help.huntr.co/en/articles/10042685-the-job-board)
- **The two most emotion-aware consumer products diverge.** LinkedIn softens the label to **"Not
  Selected"** and never surfaces an accumulating rejected pile.
  [LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a512329). **Simplify users actively
  asked to rename "Rejected"** to "Door Closed / Not a Fit / Inactive" — real competitor users saying
  the bare word carries an emotional cost. [Simplify Featurebase](https://simplifyjobs.featurebase.app/p/job-tracker-status)
- **Psychology — rejection fatigue + learned helplessness.** Repeated rejection erodes confidence and
  motivation; a growing visible pile of "effort didn't work" is the exact pattern that triggers
  helplessness. The antidote is **restoring controllability** and framing setbacks as **specific and
  temporary**, not personal and permanent.
  [Psychology Today](https://www.psychologytoday.com/us/blog/cultural-neuroscience/202512/from-helpless-to-hopeful-during-the-job-search) ·
  [The Interview Guys — rejection fatigue](https://blog.theinterviewguys.com/coping-with-job-rejection-fatigue/)
- **The funnel reframe helps — but needs the data as an aggregate ratio.** "You applied to 12, got 2
  first-rounds — that's a CV-stage signal we can fix" locates the problem in the process, restores
  agency. That requires the rejection data to *exist*, surfaced as a stat, not as a wall of cards.
  [Cruit — the job-search funnel](https://www.askcruit.com/resources/job-search-masterclass/job-search-strategy-and-planning/the-job-search-funnel-a-numbers-game-you-can-win)
- **Calm-UX for anxious users:** failure should never be a dead terminal state — arrive with a next
  action; reduce clutter; soften loaded language.
  [UXmatters — designing calm](https://www.uxmatters.com/mt/archives/2025/05/designing-calm-ux-principles-for-reducing-users-anxiety.php)

**Verdict (confidence: medium-high).** Keep the outcome as data; move individual closed items into a
quiet, collapsed "Closed / Not this time" area; surface rejection only as an aggregate funnel stat
tied to a concrete next action — never a live accumulating "Rejected" column. **Avoid the bare word
"Rejected."** _Thin spot:_ no A/B test of collapsed-vs-visible on job-seeker motivation exists; the
one peer-reviewed study (Springer 2025) had no hypotheses fully supported. Verdict is inferred from
convergent practitioner + psychology + calm-UX sources, not an RCT.

## Fork 2 — when a user manually removes a saved role (tidying, not a rejection), ask why?

- **Ask, but optional and near-zero-friction.** Each extra question cuts completion ~5–10%; required
  fields raise abandonment ("lie or leave"). The proven exit-survey shape: a few one-tap chips + an
  *optional* free-text line, never a required open field.
  [SurveyMonkey](https://www.surveymonkey.com/curiosity/survey_questions_and_completion_rates/) ·
  [Survicate](https://survicate.com/blog/survey-completion-rate/)
- **The explicit negative is worth capturing** because a non-save is ambiguous (dislike vs not-yet-seen);
  every major recommender treats explicit "not interested" as first-class (TikTok even predicts the
  likelihood you'll mark "Not Interested").
  [APXML — implicit vs explicit](https://apxml.com/courses/building-ml-recommendation-system/chapter-1-foundations-of-recommendation-systems/implicit-vs-explicit-feedback)
- **Non-blocking, decisively.** Complete the remove immediately, ask after; blocking confirmations are
  for serious/irreversible actions only, and over-prompting trains users to ignore the prompt.
  [NN/g — confirmation dialogs](https://www.nngroup.com/articles/confirmation-dialog/) ·
  [GitLab Pajamas — destructive actions](https://design.gitlab.com/patterns/destructive-actions/)

**Verdict (confidence: high on shape, medium on lift).** Yes — ask, but the remove happens first and the
ask is optional. A light conversational line from the advisor fits our warm register; chips would yield
cleaner signal. Don't necessarily ask on *every* removal — sampling, or asking only when the removal
contradicts a strong inferred preference, keeps it from becoming noise. _Thin spot:_ the exact
recommendation-quality lift from one negative signal is not quantified in the literature.

## Fork 3 — should the reason route whether the role keeps showing in Live roles?

- **"Not for me / not interested" → suppress it and lightly down-weight similar.** Every major platform
  generalises an explicit negative to similar items (YouTube, LinkedIn, Indeed, Netflix). **But weight a
  single signal LOW and let it compound** — one negative collapsing a category is the documented
  over-suppression / filter-bubble harm. Mozilla's 22.7k-user study: item-level "Not interested" only
  prevented 11% of unwanted recs; source-level "Don't recommend channel" hit 43% — narrow signals are
  weak, broad/named ones work.
  [TechCrunch/Mozilla](https://techcrunch.com/2022/09/20/youtubes-dislike-and-not-interested-options-dont-do-much-for-your-recommendations-study-says/) ·
  [LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a1427386) ·
  [Filter Bubbles review (arXiv 2307.01221)](https://arxiv.org/html/2307.01221)
- **"Just tidying / applied elsewhere" → keep showing it, infer nothing.** An administrative action that
  *looks* negative but carries no taste signal is textbook false-negative contamination; feeding it to
  the recommender is exactly the noise denoising research says to prune. Conflating the two intents
  degrades quality.
  [Denoising implicit feedback (arXiv 2006.04153)](https://arxiv.org/abs/2006.04153)
- **Design note:** the strongest real-world control is source-level + explicit (YouTube's 43%). For Live
  roles, let "not for me" optionally name the dimension (this company / this seniority / this function) —
  more effective and more legible to an anxious user than silent category suppression. Fits our
  "show evidence, let the user decide" stance.

**Verdict (confidence: high on direction, medium on tuning).** Yes, route by reason. _Thin spot:_ no study
A/B-tests routing-by-reason or publishes the down-weight coefficient — the principle is solid, the exact
tuning is a judgement call to calibrate.

---

## Scope note (co-founder hat) — what this session can honestly do

The full model (a real outcome state + ask-why + reason-routing + down-weighting similar roles) is
bigger than "fix the rejection bug." Breadth-first, this session should land: **(1)** fix the two
confirmed bugs (partial-action-with-no-reply robustness; `STAGE_LABELS` archive mislabel); **(2)** a real
"didn't get it" outcome that stops discarding the signal and lives in a quiet Closed area, softly
labelled; **(3)** capture the why on remove/reject (optional, non-blocking) and use it for **item-level**
Live-roles hide. The **down-weight-similar** recommender work and the **aggregate funnel stat** are
logged for Step 3 (grounded-knowledge / matching), not built now.

---

## DECISIONS LOCKED (Lexi, 2026-06-29, after seeing the evidence above)

1. **Fork 1 → quiet "Closed" area + soft label.** A real "didn't get it" outcome is recorded as data
   (not discarded into `archive`); the role leaves the active board into a collapsed "Closed" section,
   pill labelled **"Not this time"** — never the bare word "Rejected". Aggregate funnel stat deferred to Step 3.
2. **Fork 2 → advisor asks once, conversational + optional + non-blocking.** The remove completes
   instantly; the advisor may then ask once ("not your thing, or just tidying?"); answer optional.
3. **Fork 3 → route Live-roles visibility by reason.** "Not interested" → hide that role from Live roles;
   "tidying / applied elsewhere" → keep showing it. THIS session = item-level hide only; down-weighting
   similar roles is logged for Step 3 (weight a single negative low — filter-bubble risk).
