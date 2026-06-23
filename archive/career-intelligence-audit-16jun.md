# Career Intelligence — Full Audit Report
**Conducted:** Tuesday 16 June 2026  
**Auditor:** Claude (via live browser session using Claude in Chrome)  
**Staging URL:** https://career-intelligence-hn3t2rx8x-lexirosenthal11903-sudos-projects.vercel.app  
**Account used:** lexi.rosenthal11903@gmail.com (Alexandra Rosenthal)  
**Method:** Full authenticated browser walkthrough — logged in via Google OAuth, submitted real CV, ran analysis end-to-end, visited every page and tab

---

## What Was Tested

- Landing page (full scroll)
- Login flow (Google OAuth)
- Dashboard / Home tab (pre- and post-analysis)
- /input — CV submission and follow-up Q&A flow
- /loading — analysis loading screen
- /onboarding-bridge — results screen
- /dashboard/roles — role types list + live listings tab + role detail page
- /dashboard/applications
- /dashboard/skills
- /dashboard/profile (direct URL — not linked in nav)
- Arlo chat on every tab
- Ask Arlo prompt buttons on role detail page

---

## CV Submitted

```
ALEXANDRA ROSENTHAL
London, NW11 | lexi.rosenthal11903@gmail.com | +44 7841 521084 | linkedin.com/in/alexandrarosenthal

London-based graduate with a 2:1 in Art & Design from the University of Leeds. Commercial experience 
across luxury retail design, brand marketing and media, including contributing to the successful 
opening of the first WatchHouse franchise in Dubai. Co-founded YJP Hampstead from zero to 175 members 
in six months. Pursuing a career in management consulting.

PROFESSIONAL EXPERIENCE

NextTrip, Inc. (NASDAQ: NTRP) — Jan 2026 – Mar 2026
Freelance Creative Designer (Fixed-term Contract) - Save Your Day Films (subsidiary), London, UK
- Developed a full brand and creative framework for JOURNY TV
- Led visual integration approach for a newly acquired channel
- Conducted competitive analysis; designed pitch decks for external clients and The Knot sponsorship pitch

WatchHouse — Jun 2025 – Dec 2025
Design & Marketing Intern, London, UK
- Analysed weekly KPI dashboards; recommended segmentation interventions
- Built master product cost spreadsheet for profit margin tracking
- Developed pitch deck for £5M+ hospitality property pitch (presented to board by CEO)
- Managed window vinyl rollout for new store openings
- Built franchise development toolkits for UK, US and UAE rollouts
- Offered full-time role; declined to pursue postgraduate study in management

YJP Hampstead — Oct 2025 – Present
Co-Founder, London, UK
- Scaled community from zero to 175 members; five events in six months
- Curated speaker events with founders, investors, C-suite executives
- Identified SuperGroup (NYSE: SGHC) as in-kind partner
- Built and deployed live membership platform end-to-end

Hazel Collins Design — Mar 2024 – May 2024 / Sybarite — Sep 2023 – Mar 2024 / The Unquantifiable — Jun–Sep 2023
[Placement year roles — full CV text as above]

EDUCATION
University of Leeds — BA Art & Design (Industrial), 2:1. Year 2: 64%, Year 3: 69%
FUAM Graduate Art Prize 2025, People's Choice Award

PROFESSIONAL DEVELOPMENT
BCG Introduction to Strategy Consulting Job Simulation (Forage, March 2026)
BCG Strategy Consulting Job Simulation (Forage, April 2026)
Statistics Foundations 1 (LinkedIn Learning, April 2026)
```

---

## Page-by-Page Findings

### Landing Page (pre-login)

- **Hero headline:** "You shouldn't have to figure out your career alone." — strong, emotionally resonant for the target user
- **Subheadline:** "Arlo maps your direction, finds the roles that actually fit, and walks every step of the search with you — one clear action at a time." — clear value prop
- **CTA:** "Start with who you are →" / "Takes about a minute · No CV required" — good framing
- **Marketing demo mock-up embedded in page:** Shows "Lexi R. / lexi@email.com" as the demo persona name, with hardcoded copy including "Early-stage fintech, moving fast." as direction and "Reach out to Sarah Chen at Monzo." as today's action. This is hardcoded placeholder content visible to all unauthenticated visitors.
- **Section 01 — YOUR DIRECTION:** "From who you are to where you're going." — copy is strong
- **Section 02 — ROLES THAT FIT:** "Live listings. Ranked by how close you already are." — shows fake job cards: Monzo (Associate Product Manager, London, £55k, Strong fit), Wise (Product Analyst, Remote, £48k), Cleo (Associate PM, London, £52k). These are hardcoded demo listings, not real data.
- **Section 03 — EVERY DAY:** "Close the gap. One step at a time." — shows hardcoded Arlo chat: "SQL is the gap worth closing first. You're at 35% — three focused weeks gets you past what Monzo actually needs for this role."
- **Testimonial section:** Three quote cards — "You question your worth. You question — when am I going to start my life?" (Finance graduate, UCL, 2025) / "I can't be bothered because the process is so horrible." (Graduate, Fashion, 2025) / "I did low-key get to a point where I was like, I'll take anything." (PPE graduate, Politics & comms, 2024). Effective and emotionally calibrated for target audience.
- **Footer CTA:** "Your career deserves more than a job. Start with one minute. Tell Arlo who you are."
- **Cookie banner:** Present on all pages. "We use cookies to keep you signed in and remember your preferences."

---

### Login Flow

- **Login modal trigger:** Clicking "Log in" opens an overlay modal (not a new page). Modal copy: "Welcome back. Sign in to pick up where you left off." — uses returning-user language for all users including first-timers. No separate first-time user state.
- **Auth options:** "Continue with Google" button + email magic link option ("your@email.com" placeholder + "Send me a code" button)
- **Google OAuth:** Clicking "Continue with Google" opens full-page Google account chooser. Auth goes via Supabase (URL: jjrvclaitqhcrwxzofyn.supabase.co). Standard OAuth flow.
- **Post-login redirect:** Lands on /dashboard (Home tab). No onboarding flow for returning users who have no analysis yet.

---

### Home Tab — Pre-Analysis State

**URL:** /dashboard

- **Greeting:** "Good evening · Tuesday 16 June" + "Welcome back, Alexandra." — name correctly populated from Google account
- **Directions card:** Shows "DIRECTIONS WORTH EXPLORING / Your directions will appear here once you've shared your background. Start now →" — correct empty state
- **WHERE TO START section:** Large heading "Browse your matched roles and save the ones worth pursuing." with body copy + "See your matched roles →" / "Later" CTAs
- **EXPLORE section:** Three cards — "Your role matches (All matches, ranked by fit)" / "Skills to focus on (The gaps closest to closing)" / "Applications"
- **Arlo panel:** "Good to have you back. Nothing new on the roles front yet — I'll let you know when something comes in that's worth your attention. What are you thinking about today?"
- **Arlo chat:** Functional. Message typed and sent. Arlo shows "Thinking..." indicator with animated dot. Response came through. Auto-scroll into view works. Arlo's response was thoughtful and conversational (asked about the "why" behind the pivot from design to strategy — not generic). Chat input shows placeholder "Ask me anything..."
- **Sidebar username:** "Alexandra / lexi.rosenthal11903@gmail.com" — correct on Home tab

---

### Roles Tab — Pre-Analysis State

**URL:** /dashboard/roles

- Direction card: skeleton/empty
- Role types: 0
- Live listings: 0 (tab shows "Live listings 0")
- Three skeleton loader cards visible (grey placeholder blocks)
- **Arlo:** "Once your analysis is complete, I'll show you the roles that fit your background and what it would take to get there." — Arlo has NO memory of the conversation from the Home tab. Complete reset.
- **Chat input placeholder:** "Ask Arlo about any of these roles." — contextually appropriate label even in empty state

---

### Applications Tab — Pre-Analysis State

**URL:** /dashboard/applications

- Direction card: "YOUR DIRECTION / Complete your analysis to see your direction"
- Status tabs: All 0 / Preparing 0 / Applied 0 / Interview (truncated) / Offer — all at 0
- Body: **"Loading..."** — persists indefinitely, never resolves
- **Arlo:** "When you mark roles as Interested, they'll appear here. I'll help you track each one and prepare for every stage." — reset, no memory of prior conversation
- **Sidebar:** "You" with "?" avatar — username not showing

---

### Skills Tab — Pre-Analysis State

**URL:** /dashboard/skills

- Direction card: "Complete your analysis to see your direction"
- Body: "Your skills map will appear here after you complete your analysis. Start your analysis →"
- **Arlo:** "Complete your analysis and I'll help you build a skills plan tailored to where you're heading."
- **Sidebar:** "You" with "?" avatar — username not showing (same bug)

---

### /input — CV Submission Flow

**URL:** /input (navigated directly)

- **Arlo intro screen:** Large Arlo avatar centred on page. "ARLO" label. "Hi — I'm here to help you find your direction. I'll ask you two or three things. That's it. Start by sharing your CV below, or just tell me about yourself."
- **Input field:** Single text box with placeholder "Tell me about yourself..." and file upload icon on left
- **Top-right nav:** "← Start over" link only — no sidebar
- Full CV pasted into input field and submitted.

**After CV submission:**
- CV content displayed as user messages in the chat (split across multiple bubbles — name, contact info, summary paragraph, etc.)
- Arlo responds: "Got what I need." (separate bubble) + "That helps." (separate bubble)
- Arlo then asks: "Where are you trying to go? Even if it's vague — a direction you're drawn toward, or something you want to move away from. There's no wrong answer."
- Arlo also asks: "One last thing — where can you work, and any restrictions I should know about?"
- **CRITICAL BUG:** The text input field disappears after CV submission. There is no way for the user to respond to Arlo's follow-up questions. No input box visible anywhere on the page.
- **CRITICAL BUG:** "Find my direction →" button appears at bottom of screen immediately after CV submission, before the follow-up questions have been answered. The button trigger fires on CV submission, not on completion of Q&A.
- The flow proceeds to analysis without capturing direction aspiration or location. These are taken from CV content only.
- **"← Start over" link** visible in top-right throughout.

---

### /loading — Analysis Screen

**URL:** /loading (auto-navigated after clicking "Find my direction →")

- Full-screen. Arlo avatar centred, expression changed (slightly more focused/serious than default neutral).
- Copy: "I'm taking a minute with this — it's worth doing properly."
- Subtext: "About a minute."
- No progress bar. No further copy. Clean.
- Analysis completed in approximately 45–60 seconds.
- No errors. Transitioned successfully to /onboarding-bridge.

---

### /onboarding-bridge — Results Screen

**URL:** /onboarding-bridge

- Arlo avatar at top, smiling expression.
- One direction card shown:

**YOUR DIRECTION**  
**Management Consulting (Graduate Scheme)**  
"You're a London-based Art & Design graduate from Leeds (2:1) with a commercially sharp profile that doesn't fit neatly into one box — and that's both your challenge and your edge. You've worked across luxury retail design, brand marketing and media, contributed to the opening of WatchHouse's first Dubai franchise, and co-founded a membership community (YJP Hampstead) that you scaled to 175 members in six months. You're now targeting management consulting, which is an ambitious pivot from your degree background, but your track record of building things and delivering commercially gives you real material to work with."

**ROLES WORTH EXPLORING**  
Graduate Management Consultant · Junior Business Analyst · Graduate Strategy Analyst · Junior Brand Consultant · Graduate Operations Analyst

- **Below card:** "These are the roles worth exploring properly. Go through them at your own pace — I'll be with you in the dashboard, and the more you tell me about what resonates, the sharper this gets."
- **CTAs:** "Go to my dashboard →" (primary) + "Something doesn't feel right — adjust my direction" (text link)
- **NOTE:** Only ONE direction shown here. The dashboard reveals three. The transition is unexplained — a user would think they only have one direction.

---

### Home Tab — Post-Analysis State

**URL:** /dashboard

- **Greeting:** "Welcome back, Alexandra." — correct (with name)
- **Directions card:** Now populated with all three directions:
  1. Management Consulting (Graduate Scheme) →
  2. Brand Strategy & Consultancy →
  3. Membership, Community & Partnerships (Startups or Cultural Orgs) →
- **Section heading:** "YOUR ANALYSIS IS READY / New roles have been matched to your profile." — clear, actionable
- **Arlo panel:** Shows the earlier conversation from pre-analysis (the message asking about design → strategy pivot). Arlo's conversation history carries over to the Home tab from the initial chat. This is the only tab where this is true.
- **Sidebar:** Inconsistent — sometimes shows "Alexandra / lexi.rosenthal11903@gmail.com" correctly, sometimes shows "You / ?" — appears to be a render timing issue

---

### Roles Tab — Post-Analysis State

**URL:** /dashboard/roles

**Direction card:**  
"Management Consulting (Graduate Scheme) · Brand Strategy & Consultancy · Membership, Community & Partnerships (Startups or Cultural Orgs)"  
"3 role types matched · 33 live listings"

**Role Types tab (3):**

1. **Management Consulting (Graduate Scheme)**  
"You contributed to the launch of WatchHouse's first Dubai franchise and co-founded YJP Hampstead from zero to 175 members in six months — both demonstrate project delivery, commercial thinking, and the ability to build something from scratch, which consulting firms genuinely value"

2. **Brand Strategy & Consultancy**  
"Your Art & Design degree combined with hands-on commercial work in luxury retail design and brand marketing at WatchHouse gives you a rare dual foundation — you understand both the visual language of brands and the commercial logic behind them"

3. **Membership, Community & Partnerships (Startups or Cultural Orgs)**  
"This might not have been on your radar, but co-founding YJP Hampstead and scaling it to 175 members in six months is a genuinely impressive community-building achievement that maps directly onto roles in membership growth, partnerships, and community strategy at startups, cultural institutions, or professional networks"

All three copy blocks are specific to Alexandra's actual background. Not generic.

**Live Listings tab (33):**

- Filter options: All / Passed
- Real listings pulled from Adzuna and Reed
- Each listing card shows: Company, Role title, fit badge (POSSIBLE FIT / STRONG FIT), Location, Salary, Date posted, Employment type, short description snippet, "Matched to your profile" stub label, "Interested" / "Pass" / "View listing ↗" actions
- **Example listings at top of ranked list:**
  - "UK Senior Strategy Consultant" at Crimson Education, Canning Town East London, £51k — tagged POSSIBLE FIT — **SENIORITY BUG: "Senior" consultant is not a graduate role**
  - "Manager, Strategy & Consulting (Insights)" at Wasserman, London UK, £51k, 15 Jun — tagged POSSIBLE FIT — **SENIORITY BUG: "Manager" level is not appropriate for a graduate**
- Location: Listings are London-based, which is correct per the CV
- "Matched to your profile" text under each listing is a placeholder stub with no actual explanation

**Arlo panel on Roles tab:**  
"3 directions matched to your profile. Click into any role type and I'll tell you honestly whether it fits you — and what it would actually take to get there given your background. 33 live listings pulled from Adzuna and Reed and ranked for you. The ones at the top scored highest against your profile — they're worth looking at first."  
This is contextually appropriate and specific.

---

### Role Detail Page

**URL:** /dashboard/roles/management-consulting-graduate-scheme

**Heading:** "Management Consulting (Graduate Scheme)"

**WHY THIS FITS YOU:**  
"You contributed to the launch of WatchHouse's first Dubai franchise and co-founded YJP Hampstead from zero to 175 members in six months — both demonstrate project delivery, commercial thinking, and the ability to build something from scratch, which consulting firms genuinely value. The honest challenge is that most graduate consulting applicants come from Economics, PPE, Maths, or Engineering degrees, and your Art & Design 2:1 from Leeds means you'll need to work harder to clear screening filters at MBB and Big 4 firms. Your concrete path forward is to nail the numerical and logical reasoning tests (targeted practice is essential), lead with your WatchHouse and YJP achievements in every application, and prioritise boutique strategy and brand consultancies — Oliver Wyman, Publicis Sapient, or brand strategy shops — where your creative-commercial blend is genuinely differentiated."  
— Specific, honest, includes real firm names. High quality.

**OTHER DIRECTIONS WORTH EXPLORING:**  
Both other directions shown with their rationale snippets. Clickable.

**ASK ARLO prompt buttons:**
1. "What does a Management Consulting (Graduate Scheme) actually do day to day?"
2. "What does it take to get into Management Consulting (Graduate Scheme) from my background?"
3. "What's the honest downside of Management Consulting (Graduate Scheme)?"

**BUG — Ask Arlo button behaviour:**  
Clicking a prompt button simultaneously: (a) sends the message to Arlo, AND (b) populates the text input field with the question text. The input does not clear after sending. Both happen at once. This is a dual-trigger bug — the intended behaviour is presumably auto-send only (no input population), or populate-then-user-sends, but not both.

**Arlo's response to "What does a Management Consulting (Graduate Scheme) actually do day to day?":**  
Response was detailed and substantive. Referenced WatchHouse and YJP explicitly. Gave honest breakdown of what the first 1–2 years actually looks like (project teams, Excel modelling, research, slide-making, client meetings as junior). Mentioned Oliver Wyman, Publicis Sapient.  
**BUG: Markdown not rendering.** Response contained `**A lot of this:**` and `**Less of this (at first):**` rendered as literal asterisks, not bold text. Also bullet points rendered as ` - ` characters rather than formatted list items.

**Chat input placeholder on role detail page:** "Ask Arlo anything about this role..." — contextually appropriate.

**Arlo panel message on role detail page:**  
"Management Consulting (Graduate Scheme) is a direction I matched to you for specific reasons — not just because it sounds right on paper. Ask me anything about it: what it actually involves, whether it fits your background, what getting in looks like, or what the honest downsides are."  
— Specific, direct, well-written.

---

### Applications Tab — Post-Analysis State

**URL:** /dashboard/applications

- Direction card: Shows "Management Consulting (Graduate Scheme)" — only one direction, not all three (inconsistent with Home and Roles)
- Status tabs: All 0 / Preparing 0 / Applied 0 / Interview 0 / Offer 0 / Archive 0
- **"Loading..."** — persists indefinitely. Same bug as pre-analysis. Never resolves.
- **Arlo:** "When you mark roles as Interested, they'll appear here. I'll help you track each one and prepare for every stage." — no memory of previous conversations
- **Sidebar:** "You" / "?" avatar — username bug reappears

---

### Skills Tab — Post-Analysis State

**URL:** /dashboard/skills

- **Direction card:** "Management Consulting (Graduate Scheme)" — only primary direction shown

**WHAT YOU BRING (5 items, all specific to Alexandra):**
- "Brand strategy and visual identity — demonstrated through luxury retail design work and WatchHouse Dubai franchise launch"
- "Community building and stakeholder engagement — co-founded YJP Hampstead, scaling to 175 members in six months from a standing start"
- "Cross-cultural commercial execution — contributed to an international market expansion (Dubai), showing ability to operate across contexts"
- "Creative project management — coordinating brand, design, and marketing outputs across luxury retail and media environments"
- "Entrepreneurial initiative — self-started community venture with measurable growth outcomes"

**BEFORE YOU APPLY (priority gap):**  
**"Structured Problem Solving & Frameworks (e.g. MECE, issue trees, hypothesis-led analysis)"**  
"Management consulting at top-tier firms is built on structured thinking. Alexandra's background is creative and executional — there is no evidence of framework-based analysis, which will be the primary filter at case interview stage and in day-to-day consulting work."  
Resource: "Complete the free McKinsey-style case prep pathway on — BCG, Accenture, and Deloitte all offer virtual consulting experience simulations with structured problem-solving tasks." Free · Certificate · "Start" button

**WORTH BUILDING:**  
**"Quantitative Data Analysis & Interpretation"**  
"Consulting roles require comfort with data: sizing markets, reading financial models, and drawing insight from numbers. Alexandra's 2:1 in Art & Design and her described experience are qualitative — she will need to demonstrate numerical confidence to be competitive."  
Resource: "Work through the 'Data Analysis with Python' course offered by IBM, free to audit — focus on modules..." Free

This tab is the strongest in the product. All content is accurate, specific, and actionable.

**Arlo panel on Skills tab:**  
"Here's what I'd focus on first. The skills marked 'Before you apply' are the ones that will matter most for your immediate applications."  
— Contextually relevant but resets every visit (no memory of prior conversations).

---

### Profile Page

**URL:** /dashboard/profile (NOT linked in sidebar — only reachable by direct URL)

**CRITICAL: Entire page is hardcoded placeholder content from a different test persona. No data from Alexandra's analysis appears anywhere on this page.**

Stats bar (hardcoded fake numbers):  
"32 roles reviewed · 4 applications active · 12 active days"

**YOUR DIRECTION (wrong):**  
"Systems thinker, people problems."  
"Strategy, operations, and business analysis roles for graduates with strong analytical and communication skills."

**ROLES WE'RE LOOKING FOR (wrong):**  
Strategy Analyst · Business Analyst · Management Consultant · Operations Associate

**BACKGROUND (completely wrong):**  
"Economics, University of Leeds, 2024. One marketing internship at a creative agency."  
— Alexandra studied Art & Design (Industrial), not Economics. She had multiple placements, not one internship.

**WHAT MATTERS TO YOU (invented):**  
"Work that involves problem-solving and communication. Culture matters — you'd rather take less money somewhere you genuinely fit."

**WHAT YOU'VE RULED OUT (invented):**  
"Pure finance roles, anything fully remote long-term, sales-heavy positions."

**CV ON FILE (fake):**  
"CV_Lexi_Rosenthal_2024.pdf · Uploaded 3 weeks ago" — fake filename and timestamp

**PREFERENCES:**  
Location field shows: "London, UK" — this is correct  
Salary range field is visible (content cut off in screenshot)

**Arlo panel on Profile page:**  
"This is everything I know about you. If anything feels off, just tell me. You can update your CV, adjust your preferences, or just let me know if things have changed."  
— Arlo's message is fine but the data it's referring to is entirely wrong.

**"Want to refine this? Talk to Arlo →"** and **"Something's changed? Tell Arlo →"** links present.

**Sidebar:** "You" / "?" avatar — username not showing (same bug as Applications and Skills)

---

## Full Bug List (Ranked by Severity)

### Critical

1. **Profile page: 100% hardcoded placeholder data.** Wrong degree, wrong background, wrong values, fake CV filename, fake usage stats. Not connected to live analysis. Accessible via direct URL. Must be fixed or removed before any external user sees it.

2. **Applications tab: "Loading..." state never resolves.** Persists on every visit, before and after analysis, across sessions. No timeout, no error state, no fallback copy. The tab that users will visit most frequently to track their job search is permanently broken.

3. **Markdown not rendering in Arlo chat.** `**bold**` and `- bullet` formatting renders as raw characters in all Arlo chat panels. Makes Arlo's responses look broken. Requires markdown parser in chat bubble component.

### Notable

4. **Input field disappears after CV submission on /input.** Arlo asks two follow-up questions ("Where are you trying to go?" and "Where can you work?") that the user cannot answer because no text input is available. The flow skips these answers entirely.

5. **"Find my direction →" button appears before follow-up questions are answered.** The CTA trigger fires on CV submission, not on completion of Q&A. The button and Arlo's questions coexist on screen simultaneously, implying the user should both answer and proceed — impossible since there's no input.

6. **Ask Arlo prompt buttons on role detail page fire dual actions.** Clicking a prompt sends the message AND populates the input field with the question text. Input does not clear after send. Should either auto-send silently (no input population) or populate input for user to send manually — not both.

7. **Arlo has no cross-tab memory.** Each tab is a completely fresh session. A conversation on Home is unknown to Arlo on Roles, Applications, or Skills. This is the largest gap between the product promise ("someone who walks every step of the search with you") and actual behaviour. Arlo resets to a generic greeting on every tab switch.

8. **Sidebar username/avatar inconsistent across pages.** Shows correctly on Home (post-analysis) and Roles. Shows "You" + "?" avatar on Applications, Skills, and Profile. Appears to be a session state or render timing issue.

9. **Onboarding bridge shows only one direction; dashboard shows three.** No explanation for why the results screen shows one direction but the dashboard reveals two more. Confusing transition.

10. **Live listings include non-graduate seniority levels at top of ranked results.** "UK Senior Strategy Consultant" and "Manager, Strategy & Consulting (Insights)" ranked at top for a graduate user. Seniority filter missing or not calibrated. A graduate who applies to these will not be shortlisted.

11. **Profile page not linked in sidebar.** Only accessible by direct URL /dashboard/profile. The page exists and is live but invisible from the product's own navigation.

12. **Login modal uses returning-user language universally.** "Welcome back. Sign in to pick up where you left off." shown to all users including first-timers.

13. **Direction card on Applications tab shows only one direction.** Inconsistent with Home (shows all three) and Roles (shows all three with full names).

### Minor

14. **Landing page demo mock-up shows hardcoded persona** ("Lexi R. / lexi@email.com", "Early-stage fintech, moving fast.", "Reach out to Sarah Chen at Monzo."). Acceptable for a demo mock-up but worth noting — the persona name is close to the actual test account's name.

15. **Landing page job listings in demo are fake.** Monzo, Wise, Cleo cards are design props, not real data. Fine for marketing but should not be mistaken for product functionality.

16. **"Matched to your profile" label on live listing cards is a stub.** Shows the same text under every listing with no actual personalisation. The role detail page does this well; the listing cards should follow the same pattern.

17. **Greeting on Home shows "Welcome back." briefly without name before resolving to "Welcome back, Alexandra."** Flicker on page load. Minor but visible.

18. **Vercel Toolbar appears as overlay in staging.** Not a product bug but obscures content during demos and screenshots. Expected for a Vercel staging deploy.

---

## Analysis Quality Assessment

| Dimension | Rating | Notes |
|---|---|---|
| Directions specificity | Strong | All three directions cite real evidence from CV. Community direction is a well-reasoned left-field suggestion. |
| Summary copy | Strong | Mentions WatchHouse Dubai, YJP Hampstead 175 members, Art & Design degree — not interchangeable with another user |
| Role titles (graduate-appropriate) | Partial | Direction/role type names are appropriate (Graduate Management Consultant etc.) but live listings include Senior and Manager level roles |
| Skills analysis | Excellent | BEFORE YOU APPLY and WORTH BUILDING sections are accurate, honest, and directly address gaps specific to her background |
| Arlo chat quality | Strong when contextual | Responses are specific and honest. Weakened by markdown rendering bug and no cross-tab memory |
| Live listings relevance | Partial | London-correct, volume is good (33), but seniority calibration needs work at the top of the ranking |

---

## What Works Well (Do Not Break)

- The product voice across role detail pages, skills tab, and onboarding bridge. Honest, specific, direct — this is rare and valuable.
- Skills tab: WHAT YOU BRING, BEFORE YOU APPLY, WORTH BUILDING structure with specific resource recommendations. One of the strongest parts of the product.
- Role type cards: All three rationales are genuinely specific to Alexandra's CV. Not generic.
- WHY THIS FITS YOU on role detail: Mentions specific firms (Oliver Wyman, Publicis Sapient), gives honest assessment of screening challenges, not just flattery.
- Loading screen copy: "I'm taking a minute with this — it's worth doing properly. About a minute." — calm and trust-building.
- 33 real live listings from Adzuna and Reed — the data pipeline is working.
- Arlo "Thinking..." indicator with animated state change — responsive feedback during generation.
- "Something doesn't feel right — adjust my direction" escape hatch on onboarding bridge — good safety valve.

---

## Verdict

**Not ready to show to external users in current state.**

The core intelligence is strong and above what you'd expect from a v1 — direction matching, role fit reasoning, and skills gap analysis are all doing real, specific work on the CV data.

Three issues would immediately destroy trust for any real user who encounters them: the Profile page showing a completely different person's background, the Applications tab permanently loading, and Arlo's responses showing raw markdown. Any one of these, encountered without prior context, ends the session.

**Minimum required before external sharing:**
1. Fix or remove the Profile page (either connect it to live data or remove from public URL)
2. Fix the Applications tab loading state
3. Fix markdown rendering in Arlo chat
4. Fix the input field disappearing on /input after CV submission
5. Add seniority filter to live listings ranking

**High-value improvements after the above:**
- Add cross-tab Arlo context (even a one-line summary passed between tabs)
- Add "Matched to your profile" explanations to individual listing cards (not just role type cards)
- Link Profile page in sidebar once it's connected to live data
- Clarify the one-direction → three-directions transition at onboarding bridge
