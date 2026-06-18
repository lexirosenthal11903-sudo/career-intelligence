# Career Intelligence — Chrome Audit Prompt
_Last updated: 2026-06-18. Run against staging only. Reusable — fetch a fresh URL from Vercel before each run._

---

## PROMPT (paste this into Claude in Chrome)

You are conducting a thorough product audit of Career Intelligence, a career intelligence platform for early-career graduates. Your job is to test every page, every key user flow, and verify a specific list of recent bug fixes. You are working autonomously — do not stop to ask questions. Note everything and deliver a full written report at the end.

**Staging URL:** https://career-intelligence-htzecdjao-lexirosenthal11903-sudos-projects.vercel.app

---

### BEFORE YOU BEGIN — MANDATORY

Open DevTools (Cmd+Option+J on Mac) and keep the Console and Network tabs visible throughout the audit. You will check both at each page.

Do not proceed past Step 0 until you have confirmed you are signed in and real data is visible.

---

### STEP 0 — Sign in and verify auth

1. Go to the staging URL
2. Click "Sign in" in the top nav
3. Sign in with Google using the account: lexi.rosenthal11903@gmail.com
4. After sign-in, you should land on the dashboard
5. **Verify:** The sidebar shows a real name and email (not placeholder text)
6. **Verify:** The direction card shows real analysis directions (not empty or "Loading…")
7. If either check fails — stop. Note what you see and do not proceed with Scenario A. Skip directly to Scenario B instead.

---

### SCENARIO A — Full authenticated flow

Work through each page below in order. At each page: note what you see, check the Console for JS errors, check the Network tab for failed requests (red entries), and complete the specific checks listed.

#### Dashboard home
- Note what state is shown (new roles / deadline urgency / nothing new / empty)
- Check the direction card: does it show real directions with the label "Directions worth exploring"? Are there multiple directions shown?
- Check the sidebar: does the email truncate correctly if it's long (no overflow)?
- Open DevTools Console — note any errors
- Open DevTools Network — note any failed requests

#### Roles tab
- Navigate to the Roles tab
- Verify job listings load (not an empty state or spinner that never resolves)
- Note how long it takes for jobs to appear — record the time in seconds
- Check that jobs shown seem relevant to a graduate with a design/marketing/analytical background applying in London
- Mark one job as Interested — note whether the button state changes correctly
- Mark one job as Passed — note whether it moves or updates correctly
- Check the sidebar: email truncation correct?
- Open a role card to the Role Detail page — verify it loads with real content (direction title, why text, Arlo panel on the right)
- On the Role Detail page: send Arlo a message ("What makes this role a good fit for me?") — record the response verbatim
- Console + Network check

#### Fix verification — within Roles tab
- [ ] Sidebar email: does a long email truncate with ellipsis rather than overflowing?
- [ ] Arlo bubbles: are consecutive Arlo messages clearly separated (not merged/overlapping)?

#### Skills tab
- Navigate to the Skills tab
- Verify real data loads (direction card, strengths, "Before you apply", "Worth building" sections)
- Check the sidebar: email truncation correct?
- Console + Network check

#### Applications tab
- Navigate to the Applications tab
- **Critical fix to verify:** Does the tab load correctly (not a spinner that never resolves)?
- Verify the job you marked as Interested in the Roles tab appears here
- Check the direction card shows all directions with the label "Directions worth exploring"
- Check the sidebar: email truncation correct?
- Console + Network check

#### Fix verification — within Applications tab
- [ ] Tab loads without hanging: ✓ / ✗
- [ ] Direction card label says "Directions worth exploring" (not "Your direction" or similar): ✓ / ✗
- [ ] Job marked Interested in Roles tab appears here: ✓ / ✗

#### Profile tab
- Navigate to the Profile tab (bottom-left user area, not a nav tab)
- **Fix to verify:** Are the location, salary min, salary max, work style, and employment type fields empty by default (no pre-filled values)?
- Check the "What Arlo knows" section — does it show real data from the analysis?
- Check the sidebar: email truncation correct?
- Console + Network check

#### Fix verification — within Profile tab
- [ ] Preference fields are empty (not pre-filled with hardcoded defaults): ✓ / ✗

#### Arlo quality check
- On any page with Arlo, send this message: "I'm not interested in marketing roles"
- Record Arlo's response verbatim
- **Fix to verify:** Does Arlo say anything like "I've removed that", "I've crossed that off", "I've updated your profile"? If yes, mark ✗. It should acknowledge your preference conversationally without claiming to change the UI.
- [ ] Arlo does not claim to update the interface: ✓ / ✗
- Rate the response: does it feel like a specific, warm mentor — or a generic chatbot? (1–5, where 5 = unmistakably Arlo)

#### Login modal copy check
- Sign out (Profile tab → sign out button)
- Trigger the sign-in modal
- **Fix to verify:** Does the modal heading say "Sign in." (not "Welcome back.")?
- [ ] Login modal heading is "Sign in.": ✓ / ✗

#### Sign out flow
- After signing out, verify you are redirected correctly (should land on homepage or equivalent)
- Try navigating directly to /dashboard — note what happens (should show unauthenticated state, not redirect to sign-in)

---

### SCENARIO B — Unauthenticated flow

You are now signed out. Complete this scenario without signing in.

1. Go to the staging URL (homepage)
2. Click the primary CTA to start the analysis
3. On the input page, you will be asked three questions. Answer them as follows:

**Step 1 — Background (paste this exactly):**

> I'm a London-based graduate with a 2:1 in Art & Design (Industrial) from the University of Leeds, graduating in July 2025. During my degree I completed a placement year across three organisations — Sybarite (luxury retail architecture, London), Hazel Collins Design (residential interiors, London), and The Unquantifiable (UI/UX and digital content, New York, remote). At Sybarite I produced a sustainability report involving competitor research and cost-benefit analysis of materials across project portfolios, and contributed to luxury retail projects for Hermès, Gucci and Van Cleef & Arpels. At Hazel Collins I managed end-to-end delivery of a residential project including brief interpretation, site visit, supplier sourcing and client presentation. At The Unquantifiable I designed UI/UX mockups and conducted competitor benchmarking. After graduating, I interned at WatchHouse as a Design & Marketing Intern (Jun–Dec 2025), where I analysed weekly KPI dashboards across spend, email engagement and conversion metrics, built a master product cost spreadsheet to track profit margins across the full product range, developed a pitch deck for a £5M+ hospitality property pitch working directly with the CEO, managed a window vinyl rollout across new store openings, and built franchise development toolkits supporting multi-market openings across the UK, US and UAE. I was offered a full-time role but declined to pursue postgraduate study in management. From January to March 2026 I worked as a Freelance Creative Designer for Save Your Day Films (a subsidiary of NextTrip, Inc., NASDAQ: NTRP), where I developed a full brand and creative framework for JOURNY TV, led a visual integration analysis for a newly acquired channel, conducted competitive analysis across the travel media landscape, and designed pitch decks for external clients including a sponsorship pitch to The Knot. I also co-founded YJP Hampstead in October 2025, a community organisation for young Jewish professionals in North London, scaling from zero to 175 members in six months, launching five events, securing SuperGroup (NYSE: SGHC) as an in-kind partner, and building and deploying a live membership platform. I completed two BCG Strategy Consulting job simulations on Forage (March and April 2026) and a Statistics Foundations 1 course on LinkedIn Learning. My A-Levels are Art (A), Sport Science (A), Psychology (B). My GCSEs include 9 subjects grades 7–9 including Mathematics (8) and English Language (9). My final year project Beyond the Façade was awarded the People's Choice Award at the FUAM Graduate Art Prize 2025. Software: Adobe Creative Suite, Figma, Rhinoceros 3D, Unreal Engine, Advanced Excel (cost analysis, data tracking), PowerPoint, Word, HTML/CSS, Netlify, Supabase, Make, Claude, ChatGPT, Midjourney.

**Step 2 — Direction:**
> I want to move into something more analytical.

**Step 3 — Requirements:**
> I want to work in London.

4. Submit and watch the loading screen
5. **Note:** Record exactly how long the loading screen takes (start timing when the loading screen appears, stop when it transitions away)
6. Note the 4 phrases that cycle on the loading screen — are they showing?
7. After loading, verify you land on the onboarding bridge page
8. **Onboarding bridge check:** Does it show a real direction title? Real role titles inside the direction card? An Arlo note below? A CTA button?
9. Click "Continue without saving" (do not sign in)
10. Verify you land on the dashboard
11. Check the direction card — does it show real directions from the analysis?
12. Navigate to the Roles tab — do job listings load relevant to this profile?
13. Open Arlo chat and send: "What should I focus on first?"
14. **Fix to verify:** After Arlo responds, does an amber "Sign in" button appear below Arlo's message?
- [ ] Arlo sign-in button appears for unauthenticated users: ✓ / ✗

---

### REPORT

Write your full report in this structure. Do not skip any section.

---

**1. SUMMARY**
One paragraph: overall state of the product, whether it feels like a coherent experience, and a pass/fail verdict on the recent fixes.

---

**2. BUGS FOUND**
List every bug you observed. Format each as:
`[Page] — [what is broken] — [Severity: Critical / Medium / Minor]`

If none found, write: None observed.

---

**3. FIX VERIFICATION**
For each item below, mark ✓ confirmed / ✗ still broken / ⚠ partially fixed, and add one sentence of observation:

- [ ] Applications tab loads correctly (no infinite spinner)
- [ ] Direction card in Applications shows all directions with label "Directions worth exploring"
- [ ] Arlo bubbles are clearly separated (no merging or overlap)
- [ ] Sidebar email truncates correctly on all tabs visited (Roles, Skills, Applications, Profile)
- [ ] Profile preference fields are empty by default (no hardcoded values)
- [ ] Arlo does not claim to update the interface when user expresses disinterest
- [ ] Login modal heading says "Sign in." not "Welcome back."
- [ ] Arlo sign-in button appears for unauthenticated users

---

**4. CONSOLE ERRORS**
List every JS error or failed network request observed, by page. Format:
`[Page] — [error or failed request URL] — [HTTP status if applicable]`

If none found, write: None observed.

---

**5. DATA & ARLO QUALITY**
- Did the analysis directions look plausible for this profile (design/marketing background moving into analytical work)?
- Were the job matches relevant to the profile and London-based?
- Paste Arlo's response to "What makes this role a good fit for me?" verbatim
- Paste Arlo's response to "I'm not interested in marketing roles" verbatim
- Rate Arlo's quality: 1–5 (5 = unmistakably specific, warm, mentor-like)
- Pipeline timing: how long did the loading screen take in seconds?

---

**6. OBSERVATIONS**
Anything else you noticed — UX friction, copy issues, edge cases, visual bugs, anything that felt off. No minimum or maximum. If nothing, write: None.

---
_End of audit prompt._
