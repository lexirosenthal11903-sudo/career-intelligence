# Features Roadmap Review — Brainstorm
_Status: Complete_
_Session: 10, 2026-06-09_

## Summary & Key Decisions

### Product identity
- This is a mentor, not a job dashboard. Every decision flows from this.
- Dual interaction model: advisor path (conversational) + direct path (click/drag). Both always available. Advisor is a guide, never a gatekeeper.
- Advisor is an agent with tool_use — can read AND write to user data on the user's behalf.

### Phase sequencing confirmed
- Phase 2 ships complete — no 2a/2b split. All screens + return mechanic + advisor memory before any user is let in.
- Phase 2 complete = natural checkpoint. Decision at that point: launch or continue to Phase 3.
- Away mode split: implicit (Phase 2, automatic) + explicit (Phase 3, optional).
- Advisor memory schema: designed in Phase 1 architecture, not Phase 2.
- Advisor tool_use API: designed in Phase 1 architecture, not Phase 2.

### Key feature decisions
- Return mechanic (Phase 2): advisor reflects what user did since last visit + suggests one action today + open-ended check-in
- Skills tab: trajectory framing not deficit/gap framing. What you have + path forward, curated, advisor guides one step at a time.
- Profile tab: advisor-populated first. Living summary of what the product knows. Editable.
- Applications tab: dual interaction. Advisor updates on your behalf when you tell it what happened. Direct always available.
- Roles: live daily refresh via background job. Pattern detection on declined roles → advisor asks conversationally.
- Employment status: captured through natural conversation + profile toggle. Advisor calibrates pacing accordingly.

### Launch-blocking items confirmed
- ICO registration: immediate, before any real user
- Privacy policy: must be live before first real user
- Product name: dedicated session, deadline required
- Vercel Analytics: set up before Phase 2 goes live

### Legal timeline
- Contact discovery (Phase 3 feature): solicitor opinion required before that feature is built — not before launch
- Terms of service + privacy policy: draft + solicitor review before launch

## Q&A Log

### Q1: What does a user do the day after they get their analysis?
**Answer:** The product shouldn't launch without a return mechanic. It's a mentor, not a job dashboard. A user who gets their analysis and has no reason to come back means the product failed — even if 100 people signed up.

**Decision:** Phase 2 cannot ship without a return mechanic. The daily check-in (currently Phase 3) needs to move up or a simpler version of it needs to exist in Phase 2.

**Decision:** The return mechanic for Phase 2 is a hybrid:
1. Advisor recalls and reflects what the user did since last session
2. Advisor suggests one clear action for today
3. Advisor asks if there's anything else to share — open-ended, user can respond

This is not just continuity — it's an active daily advisor moment. It needs to be in Phase 2 before launch.
**Requires:** activity tracking (what did the user do?), advisor memory (what did the user tell us?), returning user screen design, daily advisor message generation.

### Q4: Which Phase 2 items are non-negotiable at launch?
**Answer:** All of them. Lexi is not in a rush — she wants to build as much as possible before the first user comes in. No artificial splits.
**Decision:** Phase 2 ships complete. No 2a/2b split. All screens, return mechanic, advisor memory, error states — all in before launch.

### Q5: Is Phase 2 the launch condition or does Phase 3 need to exist first?
**Answer:** Build Phase 2 fully, then assess at the Phase 2/Phase 3 boundary. Decision point: is the product complete enough to launch, or continue to Phase 3 first?
**Decision:** Phase 2 complete = natural checkpoint. Review the product at that point and decide. No commitment to Phase 3 pre-launch, but no commitment to launching before Phase 3 either. Pragmatic — build quality, decide at the boundary.

### Q3: What counts as "something the user did" that the advisor can reference at Phase 2 launch?
**Answer:** Roles saved or passed, anything shared in chat, time elapsed. Enough for the advisor to say "You saved three roles yesterday — want to go deeper on one?" Not email, not applications, not interviews — those are Phase 3.
**Decision confirmed.** Return mechanic at Phase 2 references: roles saved/passed, chat history, time since last visit. Nothing more required at launch.

### Q6: Where does advisor memory live, and is Supabase the right platform?
**Answer:** Yes, Supabase is correct. Three tables to design in Phase 1 architecture: activity log (roles saved/passed, timestamps), conversation history (user + advisor messages), user profile snapshot (direction, preferences, CV summary). pgvector available for future semantic memory search without platform migration.
**Decision:** Memory schema designed in Phase 1 architecture scaffold, not Phase 2. Supabase confirmed.

### Q8: Profile tab vision
**Answer confirmed:** Living summary of what the advisor knows — not a settings form. Starting point is what the product has learned: direction, strengths, what the user said they want to move toward or away from. Editable, but advisor-populated first.

### Employment status — important product insight (raised during Q7/Q8)
**Insight:** Two distinct user types with very different needs:
- **Unemployed / full-time seeker** — can engage daily, has capacity for skill-building, needs high-touch daily support and clear daily actions
- **Employed / passive seeker** — limited time, needs efficient guidance, can't commit to daily check-ins, shouldn't feel guilt when they disappear for days

**Implications:**
- Advisor must calibrate pacing and expectations to the user's situation — never guilt-trip someone who's busy
- Away mode (currently Phase 3) is more fundamental than it looked — an employed user is in partial "away mode" daily
- Input page (LOCKED) doesn't need reopening — user naturally reveals this in onboarding ("I'm currently working at X") or the advisor asks conversationally later. Profile tab can also surface an "I'm actively looking / I'm exploring while employed" toggle.
- Skills trajectory pacing adapts to available time — unemployed user gets a faster path, employed user gets a slower, more realistic one

**Decision:** Employment status captured through natural conversation (not a form field in onboarding), surfaced as a Profile tab setting, used by the advisor to calibrate all pacing and expectations.

### Q7: What is the Skills tab actually showing?
**Answer:** Not a deficit/gap map. A trajectory. Three things:
1. Skills the user already has that are relevant to their target roles (acknowledges where they are)
2. The path forward — skills they need to build to become a strong candidate, in a progression not a flat list
3. Not overwhelming — curated, not exhaustive. The advisor guides them one step at a time, but the full trajectory is visible so they know where they're heading.
**Framing distinction:** "Skills gap" = deficit framing (leads with what you're missing). "Trajectory" = forward framing (leads with the path). Aligns with Meraki → Satori → Kavanah arc.
**Phase 2:** Display the trajectory. Advisor highlights the one most important skill right now.
**Phase 3:** Active guidance — advisor responds when user marks progress, suggests resources, tracks momentum.
**Data needs:** CV analysis output (already extracted in pipeline) + role requirements from job listings (needs storing) + advisor intelligence to sequence the trajectory.

### Q10: Roles — live refresh? And does direction update from behaviour?
**Answer:**
- Jobs should be live — refreshed as new listings are added. Not a static snapshot. The advisor should flag new matches in the return mechanic: "Three new roles matched your profile since yesterday."
- Direction DOES update from behaviour: 5 declined roles of similar type → advisor proactively asks "I've noticed you've been passing on consulting roles — is there a reason?" Does not silently update direction without asking.
- Technical need: background job to refresh Adzuna results periodically (daily) + advisor pattern detection on declined roles.

**Interaction model decision — applies to ALL screens:**
Dual interaction paths — not advisor-only.
- **Direct path:** User clicks, drags, updates status directly on the tab. Fast, efficient, no chat required. For people with limited time.
- **Advisor path:** User tells the advisor what happened. Advisor updates the dashboard and responds meaningfully.
- Both paths lead to the same database state. User chooses what's faster.
- Advisor can proactively comment on direct interactions ("I see you moved Innocent Drinks to Applied — how did it go?")
- This is a permanent design principle: the advisor is a guide, not a gatekeeper. Direct interaction always available.

**Phase 0 implication:** Every screen design must include both interaction paths — direct AND advisor. Design sessions brief must include this.

### Q9: Does the Applications tab have an advisor presence?
**Answer:** Yes — and stronger than that. The advisor IS the primary interface for updating the dashboard. User says "I sent my CV to Innocent Drinks" → advisor updates the pipeline automatically. User doesn't manage a spreadsheet. The advisor acts on the dashboard on the user's behalf.

**This is a fundamental product architecture decision.**

**Implications:**
- The advisor has tool_use (Anthropic function calling) — it can read AND write to the user's data
- Tools needed: update_application_status, save_job, add_note, update_direction, update_preferences, mark_skill_progress (and more)
- The chat interface is the primary input method for the whole product — not just conversation but command
- Dashboard tabs are OUTPUT (what the advisor has done) not INPUT (how user enters data)
- This is an agentic architecture — the advisor is an agent with write access to user data through defined tools
- Phase 1 architecture scaffold must design the advisor tool API before Phase 2 builds anything
- Every screen design needs to account for this — the advisor panel isn't a sidebar, it's the primary action interface

**Phase 2 build implication:** Implementing advisor tool_use is a significant engineering task. Needs dedicated planning in Phase 1.

### Q11: Product name
**Answer:** Blank page. Constraints: not generic, not complex, not unmemorable. No existing directions yet.
**Decision:** Dedicated naming session in Phase 1. Must be resolved before any public-facing assets. Needs a deadline — cannot drift.
**Flag:** Naming session brief: single word or short phrase preferred, memorable, not job-search generic ("CareerPilot", "PathFinder" etc.), must work as a URL. Session should produce 3 options, stress-test each, decide.

### Q14: Away mode — Phase 2 or Phase 3?
**Answer:** Good point — users won't predict or declare absences reliably. Life happens. Explicit away mode has a narrow use case.
**Decision:** Split into two versions:
- **Implicit away mode (Phase 2):** Advisor checks last login timestamp and calibrates response automatically. No user action. 1–3 days: normal. 4–7 days: "It's been a few days — no pressure, here when you need me." 7+ days: warm re-engagement, brief recap. Also picks up on contextual signals ("I've been busy with exams").
- **Explicit away mode (Phase 3):** User can optionally tell the advisor they'll be away. Advisor acknowledges, waits, resumes with continuity. Nice-to-have, not essential. Covers a small subset of absences the implicit version doesn't.
**Engineering cost:** Implicit version = nearly zero. Just last login timestamp (already captured) + advisor logic. No extra infrastructure.

### Q13: Analytics
**Answer:** Vercel Analytics for Phase 2 (already in stack, zero config, cookie-free, GDPR-safe). Plausible in Phase 3 for granular funnel data. Both cookie-free = no cookie consent banner needed.
**Minimum metrics before launch:** input flow completion rate + 7-day return rate. Those two numbers tell you if the product is working.

### Q12: GDPR status
**Answer:** Completely open. No research done. No legal advice sought. All three areas outstanding: contact discovery legality, data retention policy, right to deletion implementation.
**Decision:** Phase 1 must include a GDPR session before any real user data is collected. Non-negotiable.

## Open Flags

### GDPR — needs action before launch (Phase 1)
Split into two tracks:

**Track 1 — Lexi can handle with research:**
- ICO registration — legally required from day one if processing UK personal data. Free. ico.org.uk/registration
- Privacy policy — templates exist; must be live before a real user signs up. Have a solicitor review the draft.
- Right to deletion — mostly technical: user-facing delete button + confirm Supabase 90-day deletion works end-to-end
- Cookie consent — needed if analytics are added (Plausible is cookie-free; Vercel Analytics is cookie-free — this is why they're recommended)

**Track 2 — genuinely needs a solicitor:**
- Contact discovery (Phase 3) — surfacing specific people at companies. Legally ambiguous under UK GDPR. Cannot build this feature without a solicitor's opinion. Assign before Phase 3 begins.
- Terms of service — draft yourself, solicitor reviews
- Data retention policy — is 90 days right? Defensible? Solicitor should confirm

**Immediate action (Phase 1, before any real user):** ICO registration + privacy policy draft.

## Summary & Key Decisions
(fills in as we go)
