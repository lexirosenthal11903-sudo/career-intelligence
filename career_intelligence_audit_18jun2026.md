# Career Intelligence — Full Product Audit Report

**Date:** Thursday 18 June 2026
**Auditor:** Claude (automated browser audit)
**Environment:** Staging — https://career-intelligence-htzecdjao-lexirosenthal11903-sudos-projects.vercel.app
**Account tested:** lexi.rosenthal11903@gmail.com
**Scenarios completed:** A (authenticated) + B (unauthenticated)

---

## 1. SUMMARY

Career Intelligence is a coherent, well-designed product with a strong point of view. The core flow works end to end in both authenticated and unauthenticated states, the visual design is clean, and Arlo's voice is genuinely distinctive — specific, warm, and mentor-like in a way that most AI-powered career tools aren't. Several recently-shipped fixes have landed correctly: the login modal heading, direction card label in Applications, preference field defaults, and the unauthenticated Arlo sign-in button are all confirmed. The two most significant remaining issues are: (1) a critical bug where jobs marked "Interested" in Roles do not appear in the Applications tab, and (2) stale Arlo chat history from previous sessions loading on the authenticated dashboard, which is jarring for returning users. Live listing load time on the authenticated Roles tab (15–17 seconds) is also meaningfully too long. The analysis pipeline itself — from input to onboarding bridge — takes approximately 50–55 seconds, which the loading screen sets up well with its "about a minute" framing. Overall verdict: **recent fixes mostly passing, three meaningful bugs require attention before wider release.**

---

## 2. BUGS FOUND

### Critical

**[Applications tab] — Jobs marked "Interested" in Roles do not appear in Applications**
Marked "Trainee Graduate Security Analyst" as Interested in the Roles tab. The card updated correctly in Roles (showed green "INTERESTED" badge and "View in Applications →" link), but navigating to Applications showed "No applications yet" with a count of 0 active. The Interested state is persisting visually in Roles but not being written to or read from Applications correctly.

### Medium

**[Roles tab — Live Listings] — Live job listings take 15–17 seconds to load**
After clicking "Live listings", skeleton loaders displayed for 15–17 seconds before the 37 listings resolved. No error thrown — it does eventually load — but this will feel broken to most users. The direction card subtitle also stays stuck on "Loading listings..." for this entire period. Unauthenticated Roles loaded noticeably faster (~5 seconds) with the same pipeline.

**[Dashboard — Arlo panel] — Stale chat history from previous sessions loads on authenticated dashboard**
On fresh sign-in, the Arlo panel on Home loads the full prior conversation history from the previous session rather than starting fresh or presenting a clear session boundary. On first load, the panel opens mid-thread with no indication of when past messages occurred. There is no "New session" divider, no timestamp grouping, and no reset. This is particularly disorienting for a product whose onboarding is built around Arlo feeling present and attentive. On the unauthenticated dashboard, Arlo opens fresh with no history — correct behaviour that is inconsistent with the authenticated experience.

### Minor

**[Profile page] — "No applications tracked yet" renders in monospace font at top of page**
The string "No applications tracked yet" appears at the very top of the Profile page in a monospace/code-style font, above all other content. It appears to be a raw debug string that has escaped a conditional render or has been rendered without its intended styling. Should either be suppressed (Applications tab already handles empty state) or styled to match the design system.

**[Roles tab + Skills tab] — Direction card label inconsistency across tabs**
The direction card on Home and Applications correctly shows "DIRECTIONS WORTH EXPLORING." The same card on Roles and Skills tabs shows "YOUR DIRECTION" instead. The label is inconsistent across the product. The card content (all three directions listed) is identical — only the label differs.

**[Dashboard] — "Welcome back." shown without first name on some page loads**
On certain loads of the authenticated Home page, the greeting rendered as "Welcome back." with no name. On other loads of the same page in the same session it correctly showed "Welcome back, Alexandra." Likely a race condition between page render and user data fetch. Inconsistent across navigations.

---

## 3. FIX VERIFICATION

| Fix | Status | Notes |
|-----|--------|-------|
| Applications tab loads correctly (no infinite spinner) | ✓ Confirmed | Tab resolved cleanly within ~4 seconds, no spinner hang observed. |
| Direction card in Applications shows all directions with label "Directions worth exploring" | ✓ Confirmed | Label and all three directions verified via zoom on Applications tab. |
| Arlo bubbles are clearly separated (no merging or overlap) | ✓ Confirmed | Consecutive Arlo messages have clear whitespace between them on all pages tested. |
| Sidebar email truncates correctly on all tabs (Roles, Skills, Applications, Profile) | ✓ Confirmed | "lexi.rosenthal11903@gm..." truncated cleanly with ellipsis on every tab. |
| Profile preference fields are empty by default (no hardcoded values) | ✓ Confirmed | JavaScript check confirmed all input values are empty strings. Salary placeholders ("25,000" / "45,000") are placeholder text only, not pre-filled values. |
| Arlo does not claim to update the interface when user expresses disinterest | ✓ Confirmed | Response to "I'm not interested in marketing roles" was conversational acknowledgement only — no "I've crossed that off" or "I've updated your profile" claim. Full response in Section 5. |
| Login modal heading says "Sign in." not "Welcome back." | ✓ Confirmed | Heading reads "Sign in." exactly. Subhead reads "Pick up where you left off, or start fresh." |
| Arlo sign-in button appears for unauthenticated users after sending a message | ✓ Confirmed | After sending "What should I focus on first?", Arlo responded: "I'd love to respond properly — but I'll need you to sign in first to keep our conversation going. It takes about 30 seconds." with an embedded "Sign in" button. |

---

## 4. CONSOLE ERRORS

**[All pages — recurring throughout session] — React hydration error #418**
`Error: Minified React error #418 — text node mismatch between server and client render`
Source: `/_next/static/chunks/2nykiepra7i1k.js`
Stack: `rX → sh → sd → se → s$ → MessagePort.O`

This error fired on every page navigation throughout the session — 9 instances captured in total, first at 00:55 on initial dashboard load and then on each subsequent page transition. It is a server/client HTML mismatch during React hydration, meaning something being rendered on the server differs from what React expects on the client. It does not cause visible crashes or broken UI in testing, but it is a signal of a structural rendering inconsistency that could cause subtle UI glitches or flicker in production. Should be investigated and resolved.

No other distinct error types observed. No failed network requests with 4xx/5xx status codes were captured.

---

## 5. DATA & ARLO QUALITY

### Analysis directions — authenticated user

Directions generated from the existing saved analysis:
1. Management Consulting (Graduate Scheme)
2. Brand Strategy & Consultancy
3. Membership, Community & Partnerships (Startups or Cultural Orgs)

**Plausibility assessment:** Strong. All three map accurately to the profile. Management Consulting reflects the BCG Forage simulations and analytical pivot intent. Brand Strategy reflects the WatchHouse and JOURNY TV commercial work. Membership/Community is a non-obvious but genuinely well-reasoned match — the YJP Hampstead experience is cited correctly as the evidence. The analysis correctly identifies that the profile doesn't fit neatly into one box and treats that as an advantage rather than a problem.

### Analysis directions — unauthenticated user (fresh Scenario B run)

Directions generated from the test background submitted in Scenario B:
1. Product or Strategy Analyst in High-Growth Startups or Scale-Ups
2. Design Operations or Design Intelligence Analyst
3. Market Research or Competitive Intelligence Analyst (Creative, Media, or Hospitality verticals)

**Plausibility assessment:** Excellent. The "analytical direction" input was correctly interpreted. "Product or Strategy Analyst" is the right primary direction for someone with a design background explicitly moving analytical. "Design Operations" is a smart non-obvious match. "Market Research / Competitive Intelligence" directly maps to the three competitive analyses cited in the background. The onboarding bridge write-up for Direction 1 was particularly strong — it correctly identified the KPI dashboard work, profit-margin spreadsheets, BCG simulations, and community platform build as evidence of analytical capability, and honestly named the missing credentials and network as the gaps.

### Job matches — relevance

**Authenticated session (37 listings):** Approximately 70% relevant. Strongest matches: Graduate Investment Data Analyst Programme (Regal Brooke), Manager Strategy & Consulting (Wasserman), UK Senior Strategy Consultant (Crimson Education). Weaker matches at the top: Trainee Graduate Security Analyst (ITOL Recruit) ranked #1 — cybersecurity is not a natural fit for this profile and its ranking is questionable. Some listings were generic. London location filter working correctly throughout.

**Unauthenticated session (31 listings, fresh analysis):** Stronger relevance overall — Head of Data & Analytics, Cribl Data Analytics Engineer (Amazon), and other analytically-oriented London roles surfaced immediately. The tighter direction produced better-matched results.

### Arlo response — "What makes this role a good fit for me?" (Brand Strategy & Consultancy direction page)

> "I don't have a specific role in front of me to react to. Share the job title or paste in the description — and I'll tell you exactly where you fit, and where you might need to work harder to make the case."

**Context note:** This was asked on the direction-level detail page, not a specific job listing. Arlo's response is technically correct — it needs a specific job description to evaluate fit. It is a reasonable response in this context, but the question was asked assuming a job-specific Arlo integration would be surfaced. There is no clickable internal detail page for individual job listings — the detail pages exist only for directions/role types. This means the "tell you if this role fits you" promise is only reachable by the user manually pasting in a job description.

### Arlo response — "I'm not interested in marketing roles"

> "Noted. That rules out a chunk of the brand strategy direction too.
>
> So if it's not consulting and not marketing — the community and partnerships space starts to look more interesting. Especially given what you built with YJP. That wasn't marketing, that was architecture — you designed something people wanted to be part of and scaled it.
>
> That kind of work shows up in startups, cultural organisations, membership businesses. The role is less about promoting something and more about building the infrastructure around people.
>
> Does that feel closer to the kind of work you're imagining?"

**Assessment:** This is a strong response. It acknowledges the preference without overclaiming, makes a genuinely smart pivot ("that was architecture, not marketing"), and uses specific evidence from the profile (YJP) rather than speaking generically. No false "I've updated your profile" claim — pure conversation.

### Arlo response — "What should I focus on first?" (unauthenticated)

> "I'd love to respond properly — but I'll need you to sign in first to keep our conversation going. It takes about 30 seconds."
> [Sign in button]

**Assessment:** Clean, friendly gate. Doesn't feel punitive. The framing ("I'd love to respond properly") is better than a hard block.

### Arlo quality rating: 4 / 5

Strong on specificity and warmth — uses actual profile details, avoids filler, and has genuine personality in the phrasing. Docked one point because the "What makes this role a good fit" response, while contextually defensible, doesn't deliver the expected guided insight on a direction page. The architecture for role-level Arlo evaluation requires the user to paste a job description manually, which is a friction gap.

### Pipeline timing

Loading screen appeared approximately 2 seconds after clicking "Find my direction." The loading screen displayed for approximately 50–55 seconds before the onboarding bridge appeared. The loading screen copy "Reading what you've built, and what it says between the lines. / About a minute." is accurate and sets appropriate expectations. The loading screen itself uses a cycling phrase system — the one captured on screen was this phrase; additional cycling phrases were not captured due to session timing.

---

## 6. OBSERVATIONS

### Highest priority (not in bugs section)

**Job card click target is confusing.** Clicking anywhere on a job listing card body does not navigate anywhere. The only interactive elements are "Interested", "Pass", and "View listing ↗" (which opens externally). There is no internal role detail page for individual job listings. This creates a gap: the product promises Arlo can evaluate specific roles for fit, but that only works if the user copies and pastes a job description into the chat manually. Given that the Roles tab is the primary engagement surface, this is a UX friction point worth addressing — either by making the card clickable through to a detail view, or by surfacing a "Ask Arlo about this role" shortcut inline on each card.

**Arlo chat history has no session boundary for returning users.** See Bug section. The fix should be either: clear chat on new session (simplest), or add a dated divider between sessions so the returning user can orient themselves. The unauthenticated experience (clean Arlo panel on each visit) is actually the better baseline.

### Scenario B — Unauthenticated flow observations

The unauthenticated flow is well-designed overall. The three-step input process feels natural, Arlo's "Got what I need." and "That helps." acknowledgements are appropriately minimal, and the onboarding bridge write-up for the primary direction is the strongest piece of Arlo writing in the product — detailed, honest, and specific. The "Save your results." modal on the bridge page (triggered by "Go to my dashboard →") is the right place to ask for sign-up. The "Continue without saving" link is present and functional.

The CTA on the bridge page says "Go to my dashboard →" (not "Continue without saving" as spec described) — the skip option is a secondary link below the modal's sign-up form. This is the right design hierarchy but worth noting the spec language doesn't match the actual UI copy.

### Direction card label inconsistency

"DIRECTIONS WORTH EXPLORING" on Dashboard (Home) and Applications is the correct label — it reflects that multiple directions are shown. "YOUR DIRECTION" on Roles and Skills is inaccurate since all three directions are listed there too, not just one. This should be normalised to "DIRECTIONS WORTH EXPLORING" across all tabs where the multi-direction card appears.

### "Welcome back." without name

The greeting inconsistency (sometimes personalised, sometimes not) suggests the user's display name is being fetched asynchronously and the component renders before it arrives. A simple loading state or skeleton on the name would prevent the flicker.

### Profile page — "No applications tracked yet" string

This appears to be a leftover debug render or an incorrectly placed empty-state string. The Applications tab already handles the empty state correctly ("No applications yet. Mark roles as Interested in the Roles tab to start tracking them here."). The Profile page version adds nothing and should be removed.

### Roles tab load time

The 15–17 second load for authenticated live listings vs ~5 seconds for unauthenticated is a significant gap. Both use the same job pipeline from Adzuna and Reed. The authenticated slowness may be related to additional user-context fetching (saved states, Interested/Passed flags) happening sequentially rather than in parallel. Worth profiling the network waterfall for this specific transition.

### Sign-out flow

Sign-out redirected correctly to the homepage. Navigating directly to `/dashboard` after sign-out shows the unauthenticated dashboard state (previous analysis still in session/local storage, "?" avatar, no personal data) rather than redirecting to sign-in or homepage. This is probably intentional (guest mode) but worth confirming — a user who signs out expecting to clear their session may be surprised to find the dashboard still accessible with their analysis data.

### React error #418 — recurring

This is firing on every page transition, not just on first load. Given it's a minified production build, the exact source is hard to pin down from the stack trace. The most common cause of error #418 in Next.js is a conditional render that differs between server and client — e.g. rendering something based on `typeof window`, a date, or a user-agent. Given the Arlo panel and the dashboard greeting both render conditionally based on user state, either of those is the likely culprit. Recommend running a development build locally to get the full error message, which will identify the exact component and text node.
