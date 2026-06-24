# Homepage — Design Session
_Status: Complete_
_Session date: 2026-06-10_
_Mockup: `.design/career-intelligence-redesign/mockups/homepage.html` (v8)_

## Summary & Key Decisions

### Emotional brief (the north star for every decision)
The user lands and feels: *"thank god — someone has the path handled. I don't have to figure this out alone."* Relief first. Trust second. Clarity third. Not a tool. A companion.

### Page structure (locked)
```
Nav         — Wordmark · Sign in · CTA only. No section links.
Hero        — Relief/guide register. Not job board comparison.
Product shot — Direction card as focal point. Arlo panel visible. White sidebar.
              Pixel-faithful to locked dashboard. Nothing that isn't built.
Quotes      — "Built from conversations like these." 3 fragments. No testimonial framing.
Features ×2 — (1) What it does: direction + roles + illustration
              (2) Why you come back: daily companion + illustration
Closing CTA — "Your career deserves more than a job board."
Footer      — Wordmark + blurb + Privacy/Terms + copyright. Nothing else.
```

### Key decisions
- **Audience:** Not just the completely lost — also "I know roughly where but not which door." Both.
- **Hero headline brief:** Name the relief of having a guide. Not a feature. Not a job board comparison. Register: the moment the overwhelm lifts.
- **CTA:** Direction = invitation, not instruction. Working placeholder: "Start with who you are →". Final copy in copywriting session.
- **Product shot:** Direction card as hero. Arlo panel visible (same cream panel as real dashboard). White sidebar. Built from locked mockups only. No "soon" labels.
- **Arlo on homepage:** Appears in product shot + hinted in copy, lightly. Don't over-explain. Let it feel like a discovery.
- **Social proof:** "Built from conversations like these." 3 real quotes from problem interviews. Full source: `research/problem-interviews-series-1.md`. Best candidates: "You question your worth. You question — when am I going to start my life?" / "I can't be bothered because the process is so horrible." / "I'll take anything."
- **Feature sections:** Collapse from 4 to 2. Daily companion gets equal weight to the pipeline — it's the business differentiator.
- **Illustrations:** Keep, but move into feature sections as visual accents. Remove "Fig 0.X" labelling.
- **Nav:** Minimal. "Stories" removed. No pricing, no FAQ for now.
- **Footer:** Stripped back. Four-column footer cut.

## Q&A Log

### Q0 — Audience scope
**Lexi input:** The product isn't just for the completely directionless — it's also for people who have a field but don't know which role. "I'm interested in tech but don't know if I'm a PM or analyst." This broadens the emotional hook beyond "lost graduate."
**Decision:** Homepage should speak to both. Not "you have no idea" — more like "you know roughly where you want to be but not how to get in or which door."

---

### Q1 — What job is this page doing?
**Q:** Recognition page (feel seen first) or explanation page (understand the product first)?
**Lexi:** Wants both — market is crowded and users need to know what they're getting.
**Decision:** Not a binary. Hero does recognition → product shot does explanation → below = proof + conversion. The explanation problem is solved by the product shot, not by four feature sections. Four feature sections = generic. Explanation through demonstration = differentiated.

### Q2 — Hero headline register
**Q:** Should the hero speak to the job-board-frustrated user, or the not-yet-started, genuinely-lost user?
**Lexi:** Agrees the headline needs to open the emotional arc, not reference job boards. Also flagged that "Your career deserves more than a job board" (currently closing CTA) is a line she wants to keep somewhere.
**Decision:** Keep "Your career deserves more than a job board" in the closing CTA — it's a resolution line, not an opening line. The hero needs a different register: name the feeling of being capable but uncertain with no clear way in. Hero = opens the arc. Closing = resolves it.


### Q5 — Arlo's presence on the homepage
**Q:** Arlo is half the product but doesn't appear on the homepage. Does it need to?
**Lexi:** Agrees with recommendation C.
**Decision:** Arlo appears in the product shot (cream advisor panel visible in hero shot, same as real dashboard) AND is hinted at in copy — lightly. Don't over-explain. Let the shot show it, let copy name the idea once. Advisor should feel like something you discover, not something you're sold.

---

### Q4 — Feature sections: how many and what structure
**Q:** Four feature sections — keep, collapse, or cut?
**Lexi:** Agrees with B (collapse to two). Also flagged: in future, feature demonstrations should be animated — Arlo asking a question, job listings updating, user interacting. Wants advice on what's appropriate when we get there.
**Decision:** Collapse to two sections: (1) what it does right now (direction + roles together), (2) why you come back (daily companion / return mechanic). Daily companion gets equal or more weight — it's the business differentiator.
**Animation — parked for future pass:** Only if it tells the story of the journey (input → direction reveal → Arlo interaction). Not decoration. Linear-style interactive demo is the reference. Avoid: counting numbers, stagger reveals, cards sliding in for no reason.

---

### Q3 — Product shot: full dashboard vs. direction card as hero
**Q:** Does showing the full dashboard (roles + scores + skills bars) dilute the differentiator?
**Lexi:** Agrees with B — direction card should be the hero of the shot. But can't fully assess without seeing a visual. Also: the shot must accurately represent the real product — not a stylised mockup that diverges from the actual dashboard.
**Decision:** Direction card is the focal point of the hero shot. Match scores / role cards supporting, not leading. Shot must be built from the locked dashboard design — not a freehand mini version.

---

### Q11 — Hero shot fidelity
**Q:** "Coming soon" labels in the hero shot — honest transparency or trust problem?
**Lexi:** Stronger than that. The hero shot must reflect the CURRENT locked dashboard design exactly — white sidebar (not espresso), no "soon" labels, nothing that doesn't exist. The current homepage hero is stale and wrong.
**Decision:** Hero shot rebuilt from locked dashboard mockups. Pixel-faithful. White sidebar. Only features that exist and are built. The homepage is a promise — it must only show what it can keep.

---

### Q10 — Nav, auth, pricing, FAQ, footer
**Lexi observations:** Likes LinkedIn login (Jack and Jill reference). Nav login/signup, pricing tab, FAQ section, footer complexity all raised.
**Decisions:**
- **Nav:** Minimal. Wordmark + Sign in + CTA only. No section links for now.
- **LinkedIn OAuth:** Strong idea emotionally (professional context, profile picture). BUT: auth overlay already locked as Google OAuth + email OTP. LinkedIn API restrictive — can get name/photo, not job history. Flag for auth overlay revisit session before build. Parked.
- **Pricing:** Deferred. Not on homepage until pricing model exists.
- **FAQ:** No for now. Add only when real objections surface from interviews.
- **Footer:** Stripped back. Wordmark + one-line blurb + Privacy/Terms + copyright. Four-column footer is for a product with ten pages.

---

### Q9 — Page structure + illustrations
**Q:** New page structure given all decisions. Keep or cut the isometric illustrations (Fig 0.1/0.2/0.3)?
**Lexi:** Wants to keep illustrations — they represent the Satori/Kavanah journey visually without naming it. Open to cutting if it's too much.
**Decision:** Keep illustrations, but remove standalone section and "Fig 0.X" labelling (too design-school, wrong register). Move them into the two feature sections as visual accents — one per section, supporting copy rather than carrying their own section.

**Locked page structure (v2d, 2026-06-11):**
```
Nav         — wordmark + Log in + Sign up →
Hero        — flat bg, headline, subhead (names Arlo), CTA "Start with who you are →"
Product shot — direction card + today section + Arlo conversation (no Explore cards)
Feature 1   — Your direction: text + illustration left, direction card + Arlo note right
Feature 2   — Roles that fit: role cards (Strong fit / Good fit badges) left, text + illo right
Feature 3   — Every day: text + illustration left, Arlo conversation (SQL gap) on cream right
Quotes      — "Built from conversations like these." 3 fragments from research interviews
Closing CTA — "Your career deserves more than a job board."
Footer      — flat espresso
```

---

### Q8 — CTA copy
**Q:** "Find my direction →" — feature promise or relationship opener?
**Lexi:** Likes "Start with who you are →" as the direction but doesn't adore it. Happy to revisit in a dedicated copywriting session.
**Decision:** Direction = shift from feature CTA to invitation CTA. "Start with who you are →" is the working placeholder. Final copy locked in copywriting session.

---

### Q7 — What should the user feel in the first 3 seconds?
**Q:** Not what they understand. Not what they do. What do they *feel*?
**Lexi:** "Thank god, something that takes me from the start to the end and holds my hand. Everything in one place. I know exactly what I need to do every day and all I have to do is do it — because someone is telling me and guiding me, and I can trust them."
**Translation:** Relief + trust + clarity. The product removes the cognitive burden of not knowing what to do next. It's not a tool — it's a companion who has the path handled.
**Decision:** Hero headline brief = name the relief of having a guide, not the problem of not having one. Register: "the search doesn't have to feel like this." Not a feature. Not a job board comparison. A feeling — the moment the overwhelm lifts because someone has it handled.

---

### Q6 — Social proof: what do we have?
**Q:** "Stories" is in the nav but the product has 0 users. What replaces testimonials?
**Lexi:** Shared 3 problem interviews (May 2026) — all 3 flagged core pain unprompted. Real quotes from real people describing the problem.
**Decision:** Not testimonials. "Built from conversations like these." Three quote fragments, anonymised, minimal attribution. The framing is honest (they haven't used the product — they described the need for it). Full interview doc: `research/problem-interviews-series-1.md`.
**Selected quotes for homepage:**
- "You question your worth. You question — when am I going to start my life?" — UCL Finance Student
- "I can't be bothered because the process is so horrible." — Leah, Graduate 2025
- "I did low-key get to a point where I was like, I'll take anything." — Yifal, PPE Graduate
**Key insight from research:** The silence is the specific wound — not rejection, but no reply. The platform replaces silence with signal. This should be in the copy somewhere explicit. Also: the avoidance cohort (people who've given up searching) may be larger than expected — homepage must speak to them too, not just active searchers.
**Nav note:** "Stories" needs renaming or removing — it implies user testimonials. Rename to "Why we built this" or similar, or remove until there are real users.

---

### Build corrections — v2d (2026-06-11)
Feedback applied: progress bar "target" label removed (was appearing twice — once in bar label, once as CSS ::after on tick mark) · role scores replaced with "Strong fit" / "Good fit" badges · nav CTA changed from "Get started →" to "Sign up →" (hero + closing CTA keep "Start with who you are →").
**Homepage locked at v2d.** Copywriting session pending Phase 5.

---

### Build corrections — v2b (2026-06-11)
Feedback applied: gradient removed · nav changed to "Log in" + "Get started →" · product shot rebuilt like-for-like (direction card → Today → Explore cards → momentum, no role scores) · send button matched to real dashboard SVG · three illustrations restored as a trio strip · quotes moved below features.
**Cream bg proposal:** Lexi likes `#F7F6F3` as the dashboard left-panel background (vs pure white). Carry into all dashboard pages at engineering build — update SESSION_DECISIONS.md at that point.

---

## Open Flags

- **LinkedIn OAuth** — revisit auth overlay session before build. Strong product instinct but needs API limitation discussion. Currently locked as Google + email OTP.
- **Platform name** — unresolved per CLAUDE.md. Homepage currently uses "Career Intelligence" as placeholder. Needs a dedicated naming session before launch.
- **Copywriting session needed** — hero headline, subhead, CTA ("Start with who you are →" is working placeholder), quotes section framing, feature section copy, closing CTA refinement.
- **Animation pass** — feature sections animated in future (Arlo interaction, direction reveal, listings updating). Not for this build phase.
- **Interview series** — 3 of 20 complete. Continue adding to `research/problem-interviews-series-1.md`. When "Stories" / social proof section is built, pull from real user quotes post-launch.
