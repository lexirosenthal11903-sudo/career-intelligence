# Outreach Research — getting a foot in the door

_First pass: 2026-06-26. Extended to comprehensive v2: 2026-06-26. Purpose: ground the advisor's outreach
guidance in real, current best practice so it never gives generic AI-average advice. Mirrors the structure
of `mentorship-research.md`. Sources are cited inline; confidence tiers match that doc's standard. This feeds
the outreach feature build (Step 2, candidate-strength loop)._

**Approach:** real evidence defines the structure (response rates, what works, who to contact) → concrete
moves give it texture → translated for a text-based advisor and our anxious, early-career cohort → checked
against what we already believe (persona, mission, anti-patterns) → builds into the "Build implications"
section that feeds the advisor prompt.

**GDPR constraint (hard, throughout):** the product helps users (a) identify the right type of person to
approach, (b) find them via a deep-link search (e.g. LinkedIn search URL), (c) draft the message. We never
scrape, never invent, never buy contact data. Every technique below is held to this.

---

## Coverage map (v2 — full scope)

This document is complete against the following defined scope. Any item not covered is named in Section 14
(Known Gaps). Nothing is silently skipped.

**Methods and mechanics (Sections 1-5):** outreach methods; who to contact; how to find them; message craft;
etiquette and cadence.

**Sector coverage (Sections 6-7):** Section 6 has deeper write-ups for media/fashion/finance/charity/law/
tech/public sector. Section 7 is the full 24-sector matrix covering all remaining sectors with spectrum,
warmest path, norms/timing, bodies/communities, and tier per sector.

**No-listings case and anxiety (Sections 8-9):** speculative approaches; confidence and anxiety framework.

**UK 2026 context (Section 10):** UK-specific norms, market conditions, cultural register.

**Edge cases (Section 11):** 11.1 No existing network / low social capital; 11.2 career-changers and mature
candidates; 11.3 international students / visa-holders; 11.4 regional differences; 11.5 disability,
neurodiversity, accessibility.

**Communities and events (Section 12):** sector-by-sector community and event list for UK; communities as a
low-anxiety on-ramp channel.

**Build implications (Section 13):** hard rules, strong defaults, calibrations for the advisor prompt
(extended with new sectors and edge-case rules).

**Known gaps (Section 14):** explicitly named — not silently omitted.

### Confidence tiers (same standard as mentorship-research.md)

- **Tier A — solid, sourced:** the frameworks, named authorities, and figures traced to credible primary or
  institutional sources (UK university careers services, Prospects, CIPD, ISE, gov.uk, LinkedIn's own data).
  Safe to build the advisor on.
- **Tier B — directionally right, verify before quoting publicly:** practitioner wisdom, composite benchmarks
  from commercial tools, figures widely repeated but not traced to a single primary study. Label as "evidence
  suggests" or "estimates range." Do not cite publicly without tracing the source.
- **Tier C — do not use:** unverified, fabricated, or US-only statistics with no UK applicability.

Nothing in this document is fabricated. No invented studies. Where a figure is contested or uncertain, it is
labelled.

---

## 1. Outreach methods that actually work for early-career people

### What the evidence says

**The "hidden" job market is real but often overstated (Tier B).**
Multiple UK careers authorities (Warwick, Sheffield, Oxford, Prospects) cite that a meaningful proportion of
roles are never publicly advertised, concentrated especially in the SME sector ("by far the majority of
'hidden' opportunities are within SMEs, which lack the finances to run a formal graduate recruitment process"
— Warwick Careers Blog). The oft-repeated figure of "70-80% of jobs are never advertised" is Tier C: likely
exaggerated and not traceable to a credible UK primary source. A more defensible, lower-confidence estimate
(Tier B): 30-50% of hires come through referral and informal routes rather than a public posting. The honest version: networking routes
are meaningfully important and especially powerful in SME and creative/relationship-driven sectors, but the
dramatic "80%" claim should not be repeated by the advisor.

**Informational interviews: the most underused tool (Tier A).**
UK careers services (Oxford, Cambridge, Prospects, Sheffield, Warwick) all name informational interviews as a
legitimate, low-risk route into a company or sector. The mechanism is well established: a 20-30 minute
conversation with someone doing the work you're targeting, framed explicitly as seeking insight, not a job.
The output is: information, a contact who now knows you, a potential internal advocate, and intelligence that
makes future applications stronger. The Oxford Careers Service names three distinct types:
- Career Exploration Informational: "what is this sector/role really like?" Talk to anyone doing the work.
- Company Insider Conversation: "what is it like to work at this specific organisation?" Talk to a team member.
- Hiring Manager Meeting: "I'd like to be considered." The highest-stakes version, the one most likely to lead
  to a role.
_(Oxford University Careers Service: "Making Speculative Approaches"; Cambridge Careers: "Speculative
Applications"; Warwick Careers Blog: "Understanding the hidden job market.")_

**Speculative applications: targeted, not volume (Tier A).**
Prospects.ac.uk defines a speculative application as approaching a company directly when they are not actively
recruiting. Key finding from multiple UK careers services: careful targeting is far more likely to succeed than
sending near-identical applications at volume. Estimated success rate of speculative approaches leading to
interviews or opportunities: 10-20% (Tier B, practitioner estimate from Prospects and Sheffield; no hard UK
study). This compares favourably with the 0.4-0.7% response rate for a graduate sending a generic CV into a
competitive scheme. Success rises sharply with personalisation, timing, and a named contact.
_(Prospects.ac.uk: "How to write a speculative job application"; Sheffield Careers: "Networking, social media
and speculative approaches".)_

**Referrals are the most effective route at every level (Tier A for the direction; Tier B for the size).**
Warm and referred contacts respond at substantially higher rates than cold contacts. The specific multipliers
circulating in commercial sources (e.g. the "5x" warm-vs-cold figures from GoSpaceWalk and Expandi, both B2B
sales tools) are directional only and must NOT be hard-coded. The direction, that the warm path consistently
beats the cold path, is well supported across UK careers services (Oxford, Prospects, Sheffield). The advisor
should always move the user toward the warmest available route before cold outreach.

**LinkedIn remains the primary outreach channel for UK professionals (Tier A, LinkedIn's own data).**
LinkedIn is the UK's dominant professional network. Personalised connection requests and messages
consistently outperform unpersonalised ones (Tier B: the specific figures in the 40-56% personalised-acceptance
range come from commercial tools such as Skylead measuring their own automation users, likely international and
not UK early-career specific, so treat as directional only). The build-safe finding: personalisation materially
lifts both acceptance and reply rates. Specific decimal figures are never quoted to users.

**Cold email is weaker than LinkedIn and declining (Tier B).**
Cold email response rates benchmark in the low single digits, with only strong, personalised outreach reaching
double figures (Tier B, Whali.co.uk commercial benchmark; directional only, not a precise UK figure). LinkedIn
messages consistently outperform email for first-contact outreach. The primary
cause of decline: AI-generated outreach flooding inboxes. By late 2025, 41% of LinkedIn users reported using
AI to write their messages; over 50% of long-form LinkedIn posts were likely AI-generated. The consequence:
a large majority of decision-makers now treat unsolicited cold DMs as noise by default (Tier B: this comes from
Expandi, a LinkedIn-automation vendor, in a B2B context, so the specific percentage is not build-safe, but the
direction is corroborated by the broader AI-saturation picture). In an
AI-saturated inbox, the only signal that cuts through is genuine specificity: a message that could not have
been written by someone who had not read the person's actual profile.
_(Sopro.io: "59 cold outreach statistics 2026"; Expandi: "State of LinkedIn Outreach H1 2026"; Whali.co.uk:
"Average cold email response rate 2026".)_

**Alumni networks: an underused warm path (Tier B).**
Alumni are uniquely receptive: they share educational background, understand the early-career journey, and
are psychologically inclined to "pay it forward." The practical route: LinkedIn's Alumni search (accessible
from any university's LinkedIn page, no premium needed) filters by employer, role, location, and graduation
year. UK universities with strong alumni engagement programmes include Manchester, Birmingham, and Bristol;
Prospects.ac.uk advises graduates to use alumni tools actively. University careers services remain accessible
to graduates for up to 3 years at many institutions, including for alumni networking introductions (Warwick,
Birmingham).

### Translation for the advisor

The advisor should present outreach as a spectrum from warmest to coldest, and always start from the warmest
available route. Warm intro from a mutual connection is the target. Alumni outreach is the next warmest.
Informational interview with a team member is the standard cold-but-respectful move. A speculative application
direct to a company is appropriate when the sector or company is a strong fit and listings are thin or absent.
Cold email or cold InMail to a stranger's inbox is the weakest route and should only be recommended when
warmer paths are genuinely exhausted.

---

## 2. Who to reach out to: priority ranking

### The ranked list (sourced)

**1. Mutual connections first (Tier A).**
The warmest path. If the user and the target share a connection on LinkedIn, the advisor should surface that
connection and suggest asking for an introduction. A warm intro consistently converts far better than cold contact. The
ask to the mutual: "Would you be comfortable introducing me to [name]? I admire their work and would love a
brief conversation." Short, low-commitment.

**2. Alumni at the target company (Tier A).**
Next warmest. The shared university identity provides social permission that a stranger lacks. The pitch is
explicit and honest: "We both went to [university] — I'm early in my career and exploring this sector.
Would you be up for a brief conversation about your experience at [company]?" Most alumni will say yes to
this framing.

**3. Team members doing the role you want (Tier A).**
Not the hiring manager, not HR. People one level above where you're targeting: they know what the work
actually involves, they're close to the hiring conversation, and they're more likely to respond than a
senior leader. The Oxford Careers Service confirms: a person in the team has day-to-day insight a recruiter
doesn't, and a positive impression with a team member often surfaces informally at hiring time.
_(Oxford University Careers Service; Berkeley Career Engagement: "Informational Interviews".)_

**4. Hiring managers (Tier A, but with caveats).**
Worth approaching, but harder. A hiring manager reached before a role is posted can put you on an informal
shortlist. But they are busy, receive more outreach, and a bad first impression here has more consequence.
Only pursue a hiring manager approach when the user has done research, has a strong and specific hook, and
can offer something clear (a specific project, a skill match, a genuine compliment on the team's recent
work). The "Hiring Manager Meeting" type of informational interview (Oxford) is the right framing: not
"please give me a job," but "I'd like to understand your team's direction."

**5. Senior leaders (Tier B — usually wrong for early-career users).**
Occasionally worth it in sectors where founder culture is accessible (some tech, social enterprise). Generally
the wrong target for a first job. Senior leaders have the least bandwidth, are furthest from day-to-day hiring,
and early-career outreach to a C-suite contact usually signals poor judgment. Exception: where a senior leader
has published content, spoken publicly, or the user has a genuine and specific reason for the contact.

**6. Recruiters and agency recruiters (Tier B — use strategically).**
Internal recruiters (talent acquisition, in-house) are worth a contact when they post roles the user wants,
because they're the gatekeeper. Agency recruiters are less reliable for early-career roles: their incentive
is to fill roles with the path-of-least-resistance candidate, and they tend to be volume-driven. The advisor
should not recommend blasting agency recruiters, but it should not dismiss them entirely for sectors
(finance, legal, insurance) where they are the dominant route. For most of our user cohort, recruiters are
not the first call.

**Who NOT to prioritise (Tier A):**
- Generic "HR department" inboxes: no named recipient = no relationship = near-zero response
- Company "info@" or "jobs@" addresses: the black hole of early-career outreach
- Volume blasting to multiple people at the same company simultaneously: kills the relationship, a named
  contact will know

### Translation for the advisor

The advisor should help the user identify the specific right person at a target company, not just "someone
in HR." It should ask: do you know anyone who works there, or went to your university and works there? If yes,
start warm. If no, who is doing the role one level above yours in the team you'd join? Find that person by
name.

---

## 3. How to find the right person ethically

### Methods (all free, all GDPR-compliant)

**LinkedIn Search (Tier A, primary tool).**
The basic method: search LinkedIn for [company name] + [role/department]. Filter by "People." This returns
current employees. From the company's LinkedIn page, the "People" tab offers the same view with additional
filters. No data is scraped or purchased. The user views public profile information that the person has
chosen to make visible.

LinkedIn's **Alumni search** is particularly powerful and underused: from a university's LinkedIn page, click
"Alumni," then filter by employer, role, start year, and location. Free, no premium required, surfaces
people from the same university currently working at a target employer.

**Constructing a LinkedIn deep-link search URL (Tier A, recommended for the product).**
The advisor can generate a pre-built LinkedIn search URL that the user opens directly in their browser:
`https://www.linkedin.com/search/results/people/?keywords=[role]+[company]&origin=GLOBAL_SEARCH_HEADER`
More granular: use LinkedIn's advanced filters UI (accessible under "All Filters" in search results) to
narrow by company, title, location, and connection degree. The product should deep-link to this search,
not scrape the results. The user clicks through and makes their own judgment about who to contact.
_(Manchester Careers Service: "Using LinkedIn"; Reading Careers: "Navigating the Job Search with LinkedIn".)_

**Company websites and "Team" / "About" pages (Tier A).**
Many companies list their team publicly. The advisor should suggest the user check the company's own site:
founders, department leads, and named team members are often listed with photos and sometimes email formats.
This is public information the company has published deliberately.

**Email format inference — not scraping (Tier B).**
The common email format for a company (firstname.lastname@company.com, or f.lastname@, or firstname@) is
often inferable from: a named contact's email in a press release, an "info" email domain, or a very brief
check on a free tool like Hunter.io (which surfaces publicly available domain formats, not private data).
The advisor should surface this as a last resort and label it clearly: "this is an educated guess at their
format, based on public information, not a direct contact detail." Never present an inferred email as
confirmed. GDPR note: emailing a person at their professional business email, once, with a relevant and
professional message, is generally considered lawful under legitimate interests when the content is
directly relevant to their professional role. It is not cold spam if it is specific, relevant, and not
automated at volume.

**What the advisor never does:**
- Suggests purchasing or accessing any contact database
- Tells a user to look up someone's personal (non-professional) contact details
- Generates outreach to multiple contacts simultaneously at the same company without the user deciding each
  one individually

---

## 4. Message craft that gets replies

### The structure (sourced and distilled from multiple UK and international careers authorities)

The research converges on a consistent structure for a cold or warm LinkedIn message or email that gets
replies. Every element has a reason.

**Subject line (email only):** specific and human. "Studying your path into [sector] — would you be up for
a brief chat?" beats "Networking request." A name or a shared reference is even better: "Saw your talk
at [event] — question about [topic]." Avoid: "Opportunity," "Just checking in," "Quick question," anything
that reads like a template.
_(Yale OCS: "Sample emails requesting an informational interview"; ResumeWorded; Prospects.ac.uk.)_

**The message structure (five elements, in order):**

1. **Who you are, in one sentence.** Not a full bio. "I'm finishing a Politics degree at Leeds and thinking
   seriously about a move into policy research."

2. **Why you're reaching out to this specific person.** This is the hardest part and the most important.
   It must be true, specific, and about them, not about you. "I read your piece on housing policy in the
   Guardian last month" or "You're the only person I've found who moved from a journalism background into
   your kind of policy role" or "We both went to Sheffield and I can see you've done exactly the path I'm
   trying to understand." Generic compliments ("I admire your career") have no effect. The test: could
   this sentence have been written without reading their profile? If yes, rewrite it.
   _(Expandi, 2026 outreach data; Yale OCS; Oxford Careers Service: "Making Speculative Approaches".)_

3. **A small, clear ask.** Not a job. Not a full CV. The softest effective ask is: "Would you be up for a
   20-minute call in the next few weeks? I'd love to ask a few questions about [specific thing]." The ask
   should be low-commitment. "20 minutes" beats "30 minutes." "A few questions" beats "advice on my career."
   A soft ask gets a yes; a hard ask (sending a CV, asking for a referral) in the first message reliably
   kills the conversation.
   _(GraduateMentor.uk; Oxford Careers; Yale OCS.)_

4. **One sentence of credibility, not your full story.** One thing that's relevant and true: "I've been
   working in [related area] for the past two years" or "I've just completed a course in [relevant skill]."
   Not a pitch. Not a list. One thing.

5. **An easy out.** "Completely understand if you're busy — no pressure at all." This lowers the cost of
   saying yes by making it explicitly non-obligating. Counterintuitively, it increases response rates by
   reducing the weight of the request.

**Total length:**
- LinkedIn message: 100-150 words maximum. The platform's connection request limit (200-300 characters) is
  a useful constraint — it forces the user to say only what matters.
- Email: 150-200 words. Short emails get read; long ones get deferred and then forgotten.

**What kills a message:**
- Opening with "I" followed by a sentence about yourself (before you've given the person a reason to care)
- A paragraph about how much you admire the company (generic, could have been sent to anyone)
- Attaching a CV to a first outreach message (it escalates the ask before permission has been given)
- Multiple asks in one message ("a call, and if not a call then maybe a Zoom, and I've also attached my CV
  just in case...")
- Anything that sounds like it was written by AI (overly smooth, no specifics, starts with "I hope this
  message finds you well")
- Asking the person to do work for you ("can you look at my CV and tell me if it's good enough for your
  company?")

_(Oxford Careers Service; Yale OCS; Expandi 2026; ResumeWorded; WallStreetOasis networking email thread;
ProspectRockPartners on AI-copied outreach emails.)_

---

### Example messages in the advisor's voice

These are drafted in the advisor's voice: warm, direct, economical, first person, no em dashes, no cheerleading.
They are templates the advisor adapts with the user's actual details, not scripts to be pasted unmodified.

**Example A — cold outreach to a team member doing the target role**

> Hi [name],
>
> I'm a recent Politics graduate exploring roles in public policy research, and your path from journalism
> into your current role at [organisation] is exactly the kind of move I'm trying to understand better.
> I couldn't find anyone else who'd made that specific switch.
>
> Would you be up for a 20-minute call sometime in the next few weeks? Just a handful of questions about
> how you found the transition. Completely understand if you're busy.
>
> [name]

Length: 77 words. Why it works: specific to them (the journalism-to-policy move), honest about why they
were chosen, low-commitment ask, explicit easy out. No CV attached. No mention of wanting a job.

**Example B — alumni outreach requesting an informational chat**

> Hi [name],
>
> I came across your profile while using LinkedIn's alumni search for [University]. I'm finishing my degree
> there and seriously considering a move into the charity sector, and I can see you've been at [organisation]
> for a few years now.
>
> I'd love to ask you a few questions about what the role actually involves day to day — 20 minutes would
> be more than enough. No pressure if the timing isn't right.
>
> [name]

Length: 82 words. Why it works: the shared university context is the warm hook; the ask is clear and specific;
"what the role actually involves day to day" signals genuine curiosity, not a request for a job.

**Example C — follow-up after no response (one follow-up only)**

> Hi [name],
>
> Just following up on my message from last week, in case it got buried. Still happy to keep it brief
> if that helps.
>
> [name]

Length: 26 words. Why it works: does not repeat the entire pitch (they read it), does not grovel or
apologise, offers a concession (keeping it brief). Sent once, 5-7 business days after the original.
If still no response, do not follow up again.

---

## 5. Etiquette and cadence

### Timing (Tier B, synthesised from LinkedIn-native data and UK careers service guidance)

- **Best days to send:** Tuesday to Thursday. Tuesday mornings (9-12) show the highest reply rates.
  Monday mornings and Friday afternoons show 20% lower response rates.
- **Connection request to follow-up:** if a connection is accepted without a reply, wait 1-2 days before
  following up with a substantive message.
- **After no response to a message:** wait 5-7 business days before one follow-up.
- **After an informational interview:** send a thank you within 24 hours. No exceptions.
- **Staying in touch after the first contact:** share a relevant article, comment on their posts, or send
  a brief update (job news, progress) every 4-6 weeks. This is relationship maintenance, not persistence.
  It is what converts a one-off conversation into a contact who thinks of you when something comes up.

### Number of follow-ups (Tier A — strong consensus)

Send one follow-up after a first message that receives no response. Then stop. Two follow-ups from a
stranger is bordering on pestering; three is a reputation risk. The consensus across UK careers services
and outreach practitioners is identical: if they haven't replied after one follow-up, they're not going
to, and continuing to message damages your standing with them. Move on to the next contact.
_(Expandi 2026; Bigin/Zoho follow-up research; LinkedIn's own timing guidance.)_

The exception: after an informational interview or a warm conversation, multiple touchpoints are expected
and welcome. The limit applies only to cold or first-contact outreach.

### The thank-you note (Tier A)

After any informational interview or career chat, send a thank-you within 24 hours. Structure: (a) thank
them genuinely for their time, (b) reference one specific thing from the conversation that was useful —
this proves you listened, (c) brief mention of how you're going to act on what they said, (d) express
that you'd welcome staying in touch. 100-150 words. No CV attached. No ask for a job.

This is the single most-skipped step in early-career networking, and the one that most separates people
who build lasting contacts from those who have isolated conversations.
_(Indeed UK; ResumeWorded; InterviewFocus: "Writing an informational interview thank you email".)_

### How not to be annoying (Tier A, distilled from careers service consensus)

- Do not contact multiple people at the same company simultaneously without knowing it: word gets around
- Do not pitch yourself as the solution to a problem they haven't told you they have
- Do not send a CV unless it has been explicitly invited
- Do not escalate the ask on a follow-up: if the first message asked for a 20-minute call, the follow-up
  asks for the same thing, not a longer conversation plus a job referral
- Do not name-drop someone as a reference without asking their permission first

---

## 6. Sector differences: when outreach matters more (or less)

The advisor needs to calibrate honest expectations by sector. Recommending the same level of outreach effort
across every industry is dishonest. Below is the evidence-based sector map.

### Relationship-driven sectors (outreach is the primary route)

**Media, television, journalism (Tier A).**
"The phrase 'it's who you know' is particularly true in the media — many jobs are gained through word of
mouth and recommending people who've already proved themselves." (Prospects.ac.uk: "Overview of the UK's
media sector.") The UK journalism and media workforce is concentrated and shrinking (the Reuters Institute's
2025 "UK Journalists in the 2020s" estimates roughly 83,500 journalists nationally, down from a 2021 peak),
with a significant proportion of roles never publicly advertised.
Work experience placements are essential, and personal contacts from those placements convert into jobs.
The advisor should be honest: applying cold to media without any prior contact or industry experience is
extremely difficult. Outreach, work experience, and industry events (Creative UK, BECTU, Women in Film
and TV UK) are more effective than job boards alone.

**Fashion and creative industries (Tier A).**
Self-employment runs at 30% in the UK creative industries (DCMS 2025 Creative Industries Sector Plan;
National Careers Service). The industry is small, informal, and heavily relationship-driven. Assistant
and junior roles often go to people known via work experience, internships, or personal contacts. LinkedIn
is relevant but platforms like The Dots (fashion/creative-specific UK professional network) and Discord
communities are also noted by sector advisors. The advisor should be explicit: building relationships
before needing a job is the best investment in this sector.

**Finance, investment banking (Tier A).**
Banking has formalised networking to an unusual degree. Cold emailing senior associates or analysts asking
for a 15-minute call is a recognised and expected part of recruitment, especially for off-cycle
internships. The standard format is extremely concise (five sentences maximum), asks for a specific call
time slot, uses a school email if still studying, and targets two to four named people per firm (not a
blanket email to the team). The UK 2025-26 recruiting calendar opens in August-September; off-cycle roles
appear year-round in London/EMEA. Alumni from the user's university at target banks are the warmest path.
_(FE Training: "The ultimate investment banking cold email guide"; MergersAndInquisitions: "Investment
banking networking"; CityInvestmentTraining: UK recruiting calendar 2025-26.)_

**Charity and NGO sector (Tier B).**
More open to speculative applications than most, and less competitive than the all-sector average: ISE 2024-25
data puts charity and public sector roles at roughly 74 applications per vacancy, against the 140-application
all-sector average (Tier A, ISE). The sector values mission alignment: the outreach
message should speak to the specific cause, not generic enthusiasm for "working in the third sector."
Volunteering history and sector-specific connections are strong signals.
_(Prospects.ac.uk: "Getting a graduate charity job"; Cambridge Careers: "Sectors: Charities".)_

### Application-dominant sectors (outreach plays a supporting role)

**Law, accounting, consulting (Tier A).**
Large professional services firms run structured application processes. These are not sectors where cold
outreach bypasses the application: the process is the process, and attempting to shortcut it by emailing
a partner is usually viewed negatively. Networking matters for intelligence (what does this firm value in
applicants, what is the culture really like) and for warm references within the system, but the portal
application is still the gate. Exception: smaller law firms and independent accountancies are more open
to speculative applications and direct contact, matching the SME dynamic above.

**Technology (Tier B, mixed).**
Large tech firms (Google, Amazon, Meta UK) are application-portal-first like law firms. Startups and
scale-ups are more open to direct contact. LinkedIn outreach to an engineering manager or product lead
at a series-A company is accepted practice and sometimes genuinely effective. The advisor should
distinguish scale of company, not just sector.

**Public sector and NHS (Tier A).**
Formal application processes are required by public sector recruitment rules. Outreach here is for
intelligence only: attending sector events, speaking to people in roles about what the work is really
like. It does not replace the formal application route.

### The honest calibration

The advisor must never imply that outreach replaces applying. It does not. The correct framing: outreach
runs alongside the application process to (a) surface roles before they are posted, (b) warm up an
application that will still be submitted through the normal route, (c) get inside knowledge that makes
the application stronger. In most sectors, a well-made application is still the gate. In a few sectors
(media, fashion, early-stage tech, some charity) outreach IS the route and the formal application is
almost secondary.

---

## 7. Comprehensive sector matrix — all 24 UK graduate sectors

_This section extends Section 6 to cover the full standard UK graduate sector taxonomy. For each sector the
matrix states: (a) where it sits on the outreach spectrum (outreach-is-the-route / intelligence-gathering /
application-is-the-gate); (b) warmest realistic entry path; (c) sector-specific norms and timing; (d)
relevant UK bodies, communities, and events; (e) confidence tier. Sectors with fuller write-ups in Section 6
are cross-referenced there._

### How to read the spectrum

- **Outreach IS the route** — cold or warm outreach + speculative application is how junior roles are
  typically filled. A formal job board post is almost secondary. Being known matters more than applying.
- **Intelligence + warm application** — outreach gathers insider knowledge and warms up a formal application
  that still goes through the normal portal. Neither alone is enough.
- **Application is the gate** — formal process drives hiring. Outreach is for intelligence only; trying to
  shortcut the process by contacting a partner/director/manager typically backfires.

---

### Accountancy, banking, and finance

**Spectrum:** Application is the gate (large firms) / Outreach IS the route (SMEs, off-cycle IB).

**Warmest path:** Alumni at the target firm via LinkedIn alumni search. University societies (finance,
investment, economics) are the most reliable feeder for warm contacts before graduation.

**Norms and timing:** Large firms (Big Four accountancy: Deloitte, PwC, EY, KPMG; bulge-bracket banks) run
structured graduate schemes with fixed windows. ICAEW and ACCA training contracts typically open September
to December. Investment banking summer intern applications open August to October for the following summer;
off-cycle roles appear year-round but are concentrated January to March. Cold email to an analyst or
associate is an established norm in IB specifically (see Section 6 for the five-sentence IB format); this
is not the norm at the Big Four, where the portal is more firmly the gate.

**SME and boutique accountancy:** smaller practices (fewer than 50 staff) are far more open to speculative
applications and direct contact. Many smaller accountancy firms do not run formal graduate schemes and rely
on word of mouth.

**Bodies and communities:** ICAEW (Institute of Chartered Accountants in England and Wales) — student events
and virtual career fairs. ACCA (Association of Chartered Certified Accountants) — student network. CFA UK
(Chartered Financial Analyst) — student events and competitions. Investment banking: Bright Network, Rate My
Placement finance forums, efinancialcareers.co.uk.

_(Prospects.ac.uk: "Finance sector overview"; ISE: "Graduate Recruitment 2024-25"; ICAEW: "ACA training
routes"; CityInvestmentTraining: "UK IB recruiting calendar 2025-26".)_ **Tier A (large firms); Tier B (SME
estimates).**

---

### Business, consulting, and management

**Spectrum:** Application is the gate (MBB and large firms) / Intelligence + warm application (mid-tier and
boutique consulting).

**Warmest path:** Target company presentations and insight days (McKinsey, BCG, Bain run first-year and
penultimate-year insight events that are themselves networking sessions). Alumni at target firms are strong
given the density of consulting alumni at UK universities.

**Norms and timing:** MBB (McKinsey, BCG, Bain) and the Big Four consulting arms run structured processes.
Application windows: typically September to November for graduate schemes. Case interview preparation
communities (PrepLounge, MyConsultingCoach, consulting society networks at universities) double as
networking pools. Mid-tier and boutique consulting is more open to speculative applications.

**Key caveat:** Approaching a partner directly in a cold message is generally viewed negatively at MBB and
Big Four. The exception is a specific, warm hook: a shared speaker event, a published article they wrote,
or a mutual connection. The rule of "intelligence only from outreach" applies here more strictly than most.

**Bodies and communities:** MCA (Management Consultancy Association) — sector events. TARGET Jobs, Bright
Network, and university consulting societies. Graduate Management Admission Council (GMAC) UK events.

_(Prospects.ac.uk: "Management consulting sector overview"; MCA: "UK Consulting Industry"; National Careers
Service: "Business and consulting".)_ **Tier A (process norms); Tier B (boutique/speculative estimates).**

---

### Charity and voluntary

**Spectrum:** Intelligence + warm application / Outreach IS the route (smaller charities and NGOs).

_Existing deeper write-up: Section 6._ Additional detail below.

**Warmest path:** Volunteering or trustee experience at a target organisation — this is the most reliable
route into paid roles at charities. The UK has millions of formal volunteers (NCVO Almanac 2025 puts formal
volunteering at roughly 6.2 million people); volunteering is a recognised, low-stakes way to build sector
contacts, though the rate at which volunteers convert to paid roles is not quantified (see Known Gaps). The
pitch for outreach: "I've been volunteering in this
area and want to understand your team's work."

**Norms and timing:** The sector is chronically under-resourced and less competitive than commercial roles
(roughly 74 applications per vacancy against the 140 all-sector average, ISE 2024-25), though salaries are
lower too. Smaller charities often do not post roles on major job boards; speculative
applications to the Head of [relevant department] are accepted more readily than in most sectors.

**Bodies and communities:** NCVO (National Council for Voluntary Organisations). CharityJob.co.uk (primary
job board, also useful for understanding the sector). Charity Times, Third Sector — trade media. Cause-
specific networks (e.g. environmental NGOs cluster around Green Careers Hub events).

_(NCVO: "UK Civil Society Almanac 2025"; CharityJob.co.uk sector guides; Prospects.ac.uk: "Charity
sector".)_ **Tier A (sector character); Tier B (volunteer-to-paid transition rate).**

---

### Creative arts and design (including fashion)

**Spectrum:** Outreach IS the route.

_Existing deeper write-up: Section 6 (fashion and creative industries)._ Additional detail below.

**Warmest path:** Personal portfolio + personal introduction. Design agencies, studios, fashion houses,
and creative production companies almost universally hire through word of mouth for junior roles. The
work sample is the calling card; the personal contact is the door.

**Platforms beyond LinkedIn:** Behance and Dribbble (design); The Dots (fashion and creative industries,
UK-specific professional network valued by Prospects.ac.uk and NCS); Instagram (for fashion designers as
a portfolio platform, not an outreach channel). Graduates are advised by multiple UK careers services to
build a presence on the platforms where their target employers actually spend time.

**Bodies and communities:** Design Business Association (DBA) UK. D&AD — annual festival and new blood
awards (direct contact with agencies). Creative Opportunities (arts and culture jobs). Wired Sussex,
Manchester Digital, and regional digital networks for tech-adjacent design roles.

_(Prospects.ac.uk: "Creative arts and design sector overview"; DCMS: "Creative Industries Sector Plan 2025";
National Careers Service: "Creative and media".)_ **Tier A (sector character); Tier B (The Dots usage
estimate).**

---

### Energy and sustainability

**Spectrum:** Intelligence + warm application / Application is the gate (large energy companies) / Outreach
IS the route (sustainability startups and net-zero consultancies).

**Warmest path:** Sustainability-focused communities and events (Green Careers Hub, Green Finance Institute
events, Energy UK conferences) are a lower-anxiety warm entry point than cold messages. The sector is
rapidly expanding: net-zero commitments are creating genuine hiring needs, and many employers are newer
organisations without entrenched graduate recruitment processes.

**Norms and timing:** Large energy companies (BP, Shell, National Grid, Centrica, Octopus Energy) run
structured graduate schemes similar to large corporates, with autumn application windows. Sustainability
consultancies, net-zero startups, and impact investors are more open to direct approaches. The sector has
a strong mission-alignment culture: outreach that speaks to the specific project or initiative the target
organisation is working on resonates more than generic "I care about sustainability" messaging.

**Bodies and communities:** Energy UK (trade association, events). Green Careers Hub (UK-specific platform
for green jobs). Renewable Energy Association. Sustainability and Climate Risk (SCR) UK network. Net-zero
startups cluster in networks like Climate KIC and Nesta's accelerators.

_(Prospects.ac.uk: "Energy sector overview"; Green Careers Hub: sector guides; GOV.UK: "Net zero strategy";
ISE: "Emerging sectors 2024-25".)_ **Tier B throughout (sector is evolving rapidly — verify current employer
landscape).**

---

### Engineering and manufacturing

**Spectrum:** Application is the gate (large manufacturers and defence/aerospace) / Intelligence + warm
application (engineering SMEs, specialist manufacturers).

**Warmest path:** Professional body events and university engineering society networks. The IMechE, IET, and
ICE run student chapters and career events that provide warm-contact opportunities without cold outreach.
Manufacturing SMEs are receptive to speculative applications — the same Warwick/Prospects SME logic applies.

**Norms and timing:** Large manufacturers (Rolls-Royce, BAE Systems, Dyson, Jaguar Land Rover) run
structured graduate programmes with formal windows (typically October to January). Engineering schemes
often require a relevant degree; matching on discipline (mechanical, electrical, civil, chemical) matters.
Year-in-industry placements are the warmest route into a full-time offer at the same employer.

**Bodies and communities:** IMechE (Institution of Mechanical Engineers) — student events and
Professional Review. IET (Institution of Engineering and Technology) — Young Professionals network. ICE
(Institution of Civil Engineers) — Quest and Graduate Development Framework. Manufacturing Institute and
Make UK — sector events and graduate contacts.

_(Prospects.ac.uk: "Engineering sector overview"; IMechE: "Routes into engineering"; Make UK: "UK
Manufacturing Skills 2025".)_ **Tier A (process structure); Tier B (SME receptivity to speculative
applications).**

---

### Environment and agriculture

**Spectrum:** Intelligence + warm application / Outreach IS the route (smaller environmental organisations,
land management, conservation).

**Warmest path:** Volunteering and field experience (RSPB, Wildlife Trusts, National Trust, Groundwork
UK). These organisations rely heavily on volunteers and routinely convert them to paid staff. Cold
outreach without sector experience is significantly weaker.

**Norms and timing:** Roles at RSPB, Natural England, Environment Agency, and Forestry Commission are
publicly posted and require the formal process. Small conservation trusts, wildlife charities, and private
land managers are more accessible via direct contact. Agricultural employers (land agents, rural surveyors,
food and drink companies) recruit through RICS (rural surveying track), RICS rural division events, and
agricultural colleges.

**Bodies and communities:** Wildlife Trusts network (local branches across UK). RSPB (volunteer events).
RICS Rural Faculty. CIEEM (Chartered Institute of Ecology and Environmental Management) — careers events.
Lantra (land-based sector skills body).

_(Prospects.ac.uk: "Environment sector overview"; Natural England: "Working in conservation"; Lantra:
"Sector guides 2025"; National Careers Service: "Environment and agriculture".)_ **Tier B throughout
(limited primary data on outreach effectiveness in this sector specifically).**

---

### Healthcare (clinical and allied health)

**Spectrum:** Application is the gate (almost entirely).

**Special rule — this sector has a hard constraint:** Clinical roles (doctors, nurses, allied health
professionals — physiotherapy, occupational therapy, speech and language therapy, radiography, etc.)
require statutory registration with a regulatory body (GMC, NMC, HCPC). NHS recruitment follows NHS Jobs
/ TRAC / Trust-specific portals. There is no meaningful speculative route into clinical NHS roles. The
application portal is the gate; this is a regulatory requirement, not just an organisational preference.

**Where outreach does help:** Intelligence gathering only — speaking to a GP, physio, or OT about what the
role is actually like, work experience (particularly for medical students), and identifying rotational
programmes. The Royal Colleges, professional bodies, and student societies (BMA for medical students,
NHS Employers' networks) are the right route for contacts.

**Private sector and healthcare management:** Non-clinical roles (healthcare management, health tech, health
data, healthcare consulting, medical communications) are more open to direct outreach and speculative
applications, particularly at smaller organisations. This follows the standard SME logic.

**Bodies and communities:** NHS Employers (national events and insight programmes). BMA (British Medical
Association) — medical students. Chartered Society of Physiotherapy (CSP) — student network. College of
Occupational Therapists. Health Education England (now merged with NHS England) — placements and
Foundation School allocations. NHS Graduate Management Training Scheme — structured application process.

_(NHS Employers: "NHS workforce overview"; HCPC: "Registration requirements"; Prospects.ac.uk: "Healthcare
sector overview"; GMC: "Becoming a doctor in the UK".)_ **Tier A.**

---

### Hospitality, events, and tourism

**Spectrum:** Outreach IS the route (venues, independent hospitality) / Application is the gate (large hotel
and travel chains).

**Warmest path:** Direct approach to venue managers, event organisers, and F&B directors at target
organisations. This sector is highly relationship-driven at the independent/boutique level; large chains
(Marriott, IHG, Hilton) run graduate management schemes via formal processes.

**Norms and timing:** High seasonality — hospitality peaks in spring (events season) and summer (tourism);
Christmas events drive hiring from October. Event management companies plan 6-12 months ahead for major
events; approaching events firms in the January-March window for summer events is logical. The sector
has a high proportion of SMEs; the Warwick/Prospects speculative-application logic applies strongly.

**Bodies and communities:** UKHospitality (trade body — events and webinars). HBAA (Hospitality, Business
Travel and Events Association). Event sector: EVCOM (Events and Visual Communications Association), MPI UK
Chapter, Association of British Professional Conference Organisers (ABPCO). Tourism: Visit Britain,
Tourism Management Institute.

_(Prospects.ac.uk: "Hospitality sector overview"; UKHospitality: "Labour Market Report 2025"; National
Careers Service: "Hospitality".)_ **Tier B (limited primary data on outreach response rates in this
sector specifically).**

---

### IT and technology

**Spectrum:** Application is the gate (large tech, FAANG) / Outreach IS the route (startups, scale-ups).

_Existing write-up in Section 6._ Additional detail below.

**Company size is the critical variable.** Large tech employers (Google UK, Amazon, Meta, Microsoft,
Salesforce) run structured graduate schemes and hiring processes. LinkedIn outreach to a software
engineering manager at Google UK is unlikely to bypass the process. A LinkedIn message to an engineering
lead at a 20-person seed-stage startup is standard and often effective.

**Developer communities as an entry point:** open source contribution, GitHub profile, Hackathons, and
developer communities (PyCon UK, JSConf UK, All Day DevOps) are genuinely warm entry points into tech
hiring at all levels, not just for developers. Non-technical roles (product management, design, growth,
data) at startups benefit from founder and community networks more than job boards.

**Bodies and communities:** Silicon Milkroundabout, the biannual
London tech hiring fair with direct employer access (lower-pressure than cold outreach). BIMA (British
Interactive Media Association). Women in Tech UK. Founders Forum Group events. UKHire.tech (emerging sector board for UK tech jobs).
Hackathons: Major League Hacking UK, Hack the South, etc. — simultaneously technical portfolio-building
and networking.

_(Prospects.ac.uk: "IT and technology sector overview";
National Careers Service: "IT and telecoms".)_ **Tier A (sector character); Tier B (startup outreach
response estimates).**

---

### Law

**Spectrum:** Application is the gate (large firms and chambers) / Outreach IS the route (boutique firms,
local practices, paralegal-to-qualified routes).

_Existing write-up in Section 6._ Additional detail below.

**Solicitor training routes (post-SRA 2021 reform):** The Solicitors Qualifying Examination (SQE) replaced
the LPC as the primary qualifying route from 2021. This has opened more diverse training pathways,
including paralegal-then-qualify routes at smaller firms that do not run formal training contract
competitions. This widens the outreach opportunity for non-traditional entrants.

**Barristers:** Pupillage applications via the Pupillage Gateway (similar to UCAS — a formal centralised
system). No route around the Gateway for most sets. However, mini-pupillages (short work experience
at chambers) are obtained by direct application to individual chambers and are an important
intelligence-gathering step; mini-pupillage applications are essentially speculative approaches and
many chambers welcome them.

**Timing:** Training contract applications at large firms typically open January to August for positions
starting 2 years later. TCAS (Training Contract Application Season) peaks April to July. Pupillage
Gateway opens in December/January.

**Bodies and communities:** The Law Society — junior lawyers division. Bar Council — student resources and
pupillage guidance. LawCareers.net. Lawbore and The Lawyer — news and events. Pro Bono societies at
universities provide practical experience and contacts.

_(Law Society: "Becoming a solicitor"; Bar Council: "Becoming a barrister"; SRA: "SQE qualification
routes"; Prospects.ac.uk: "Law sector overview".)_ **Tier A.**

---

### Marketing, advertising, and PR

**Spectrum:** Intelligence + warm application / Outreach IS the route (smaller agencies, brand-side roles).

**Warmest path:** Industry bodies run events specifically for graduates and career-changers that are
designed to facilitate contact — a markedly lower-anxiety entry point than cold outreach. The Marketing
Academy, Chartered Institute of Marketing (CIM) student events, and PRWeek's graduate events all serve
this function.

**Norms and timing:** Large agencies (WPP, Publicis, Omnicom brands) run structured graduate schemes,
typically open September to January. Smaller agencies and brand-side marketing teams (FMCG companies,
tech companies) are more open to direct outreach. Digital marketing specifically has a high rate of
skill-based hiring (demonstrable Google Ads/SEO/social media skills over formal qualifications) — a
portfolio of work on a personal project is a stronger signal than a degree alone.

**Bodies and communities:** CIM (Chartered Institute of Marketing) — student membership with career events.
CIPR (Chartered Institute of Public Relations) — student groups. D&AD — for creatives who cross into
advertising. Marketing Week, Campaign UK, PRWeek — trade media with job boards and events.
Young Communicators Forum (PR sector, under-30 network).

_(Prospects.ac.uk: "Marketing and advertising sector overview"; CIM: "Marketing career guides";
CIPR: "Careers in PR"; National Careers Service: "Marketing".)_ **Tier A (sector character); Tier B (agency
speculative application success rates).**

---

### Media and internet (journalism, TV, film, and publishing)

**Spectrum:** Outreach IS the route.

_Existing deeper write-up: Section 6._ Additional detail below.

**Publishing (books):** Entry routes are heavily consolidated around internships and work experience.
Book publishing is a relatively small, consolidated sector concentrated in London; most junior
roles go to people who have done work experience at the target publisher or a connected imprint. The
Publishing Association runs an apprenticeship scheme. Diverse voices programmes (notably Penguin Random
House WriteNow and their work experience programmes) provide a formal route for under-represented entrants.
Cold outreach to commissioning editors or publishing executives is possible but has a lower hit rate than
media journalism — publishing editors are high-volume-manuscript-managing people with less bandwidth.

**Bodies and communities:** NCTJ (National Council for the Training of Journalists) — essential for news
journalism. BECTU (Broadcasting, Entertainment, Communications and Theatre Union) — particularly valuable
for freelancers in TV/film. Screenskills — training body for film and TV, with networking events. Creative
Access — diversity placement programmes in TV, film, publishing, and music. Women in Film and TV UK
(WFTV). Publishers Association — apprenticeships and sector events.

_(Publishers Association: "UK Publishing Industry 2025"; NCTJ: "Journalism careers guide"; Screenskills:
"Working in film and TV"; Prospects.ac.uk: "Media sector overview".)_ **Tier A (journalism and TV
norms); Tier B (publishing outreach response rates).**

---

### Property, construction, architecture, and surveying

**Spectrum:** Application is the gate (large construction firms, national housebuilders) / Outreach IS the
route (architectural practices, independent surveyors, boutique developers).

**Warmest path:** RICS (Royal Institution of Chartered Surveyors) events and Assessment of Professional
Competence (APC) networks. Architecture: RIBA (Royal Institute of British Architects) student events,
RIBA competitions and open days at practices. Architectural practices vary enormously in size — many are
small (under 10 staff) and rely entirely on direct approaches and personal reputation.

**Norms and timing:** Architecture Part 3 qualification requires 24 months of practical experience split
across two offices — the search for Part 1 and Part 2 placements is itself a direct outreach exercise,
approaching practices directly. RICS APC candidates similarly identify employer-sponsors directly.
Large construction firms (Balfour Beatty, Skanska UK, Laing O'Rourke) run graduate programmes with
formal October-January windows.

**Bodies and communities:** RICS (Royal Institution of Chartered Surveyors) — student events, APC
community. RIBA (architecture) — student resources. CIOB (Chartered Institute of Building) — graduate
members network. Construct UK. Construction Industry Training Board (CITB) — apprenticeship network.
BRE (Building Research Establishment) — sustainability-focused contacts.

_(RICS: "Becoming a chartered surveyor"; RIBA: "Becoming an architect"; Prospects.ac.uk: "Property and
construction sector overview".)_ **Tier A (professional body processes); Tier B (practice-level outreach
success estimates).**

---

### Public sector and civil service (including Civil Service Fast Stream)

**Spectrum:** Application is the gate.

_Existing write-up in Section 6._ Additional detail below.

**Civil Service Fast Stream:** The most competitive graduate route into the civil service. Applications open
annually in September/October; the process is multi-stage (online tests, assessment centre, final panel).
Outreach has a very specific, limited role: speaking to current Fast Streamers about what the experience
is like, attending open days, and attending departmental events (many departments host open information
events). Cold outreach to a policy director to shortcut the process is not the norm and is not advised.

**Local government and arm's-length bodies:** More varied — not all run the same competitive process.
Speculative approaches to smaller councils and arm's-length bodies (Ofcom, CMA, Ofsted etc.) are possible
for policy and research support roles. LinkedIn outreach to team leads in research or analysis functions
at these bodies is less unusual than at large departments.

**NHS management (non-clinical):** NHS Graduate Management Training Scheme — formal application, similar
cadence to Fast Stream (opens October). Non-scheme roles in NHS management are more open to direct contact.

**Bodies and communities:** Civil Service — open days and virtual information events. Whitehall and Industry
Group. Government Communication Service — for comms-track ambitions. Public Affairs networks (APPC —
Association of Political and Public Affairs Consultants, Westminster connections). Institute for Government.

_(Civil Service: "Fast Stream entry requirements"; ISE: "Public sector graduate recruitment 2024-25";
Prospects.ac.uk: "Public sector and civil service overview".)_ **Tier A.**

---

### Recruitment and HR

**Spectrum:** Outreach IS the route (recruitment agencies) / Intelligence + warm application (in-house HR).

**Warmest path:** Talent acquisition teams are, by definition, professionals who work in outreach and
respond well to candidates who demonstrate the same skills. A well-crafted, specific LinkedIn message to a
talent acquisition manager or HR business partner is well-received in this sector because it demonstrates
the skill they are hiring for.

**Norms and timing:** Recruitment agencies hire on a rolling basis — there is almost always demand. Agency
recruitment roles are heavily performance-driven; the outreach message should focus on what the candidate
can bring to billings/placements, not just why they find HR interesting. In-house HR/People teams at large
companies follow more formal graduate hiring processes; boutique HR consultancies and SME HR teams are more
open to speculative approaches.

**Bodies and communities:** CIPD (Chartered Institute of Personnel and Development) — student membership,
HR career events, branch networks across UK regions. Recruitment & Employment Confederation (REC) —
sector training and events. APSCo (Association of Professional Staffing Companies).

_(CIPD: "HR careers guide"; REC: "UK Recruitment Industry Report 2025"; Prospects.ac.uk: "Recruitment
and HR sector overview".)_ **Tier A (sector character); Tier B (response rate estimates).**

---

### Retail

**Spectrum:** Application is the gate (large retailers) / Outreach IS the route (independent retail, buying
and merchandising networks).

**Warmest path:** Work experience and part-time roles convert well in retail. Many large retailers (Marks
& Spencer, John Lewis, Next, Boots) run formal graduate management schemes. For specialist functions
(buying, merchandising, e-commerce, logistics), boutique retailers and brands are more open to direct
outreach.

**Norms and timing:** Graduate scheme applications typically open September to December. The retail
calendar means hiring for autumn intake is completed in the spring; January hiring for summer interns is
a common secondary window. Buying and merchandising specifically is highly network-driven among
practitioners — the ACMM (Association of Category Management and Merchandising) is a relevant body.

**Bodies and communities:** British Retail Consortium (BRC) — events. Retail Week — trade media with
career content. Graduate fashion recruitment: not one body, but personal contacts via The Dots (for
fashion-adjacent retail buying and visual merchandising) are noted by NCS.

_(Prospects.ac.uk: "Retail sector overview"; BRC: "Workforce and Skills Report 2025"; ISE:
"Retail graduate recruitment".)_ **Tier A (process norms); Tier B (buying/merchandising network
outreach estimates).**

---

### Sales

**Spectrum:** Outreach IS the route.

**Special character:** Sales is the sector where cold outreach most directly mirrors the job itself.
Hiring managers in sales actively respect a well-executed cold approach — it demonstrates the core skill.
A message that follows the same principles (specific, tight, clear ask, easy out) is itself a portfolio
piece. This applies across B2B tech sales (SDR/BDR roles), field sales, and account management.

**Warmest path:** SDR (Sales Development Representative) roles are specifically designed as entry-level;
many companies post them openly and respond well to direct outreach from candidates who reference their
job-opening LinkedIn posts. Reaching out to a VP of Sales or a Sales Manager about an openly-posted role
with a short, specific message is genuinely expected.

**Norms and timing:** Sales hiring is largely rolling and performance-driven rather than scheme-based.
Most sales roles at startups and scale-ups do not run fixed annual windows — they hire when they have
budget and need. LinkedIn is the primary channel.

**Bodies and communities:** ISM (Institute of Sales Management). Sales Tech, SaaSiest UK (tech sales
specific). Closer to B2B: Revenue Collective UK (renaming ongoing, formerly Revenue Collective).

_(National Careers Service: "Sales and marketing"; Prospects.ac.uk: "Sales sector overview"; ISM:
"Sales careers UK 2025".)_ **Tier B (outreach response rates in sales hiring are mostly commercial-source
data, no primary UK study found).**

---

### Science, pharmaceuticals, research, and academia

**Spectrum:** Application is the gate (pharma, research institutions) / Intelligence + warm application
(science startups, research-adjacent roles) / Academia has its own distinct structure.

**Warmest path:** Lab rotations, placements, and the supervisor/PI (principal investigator) relationship
in academia. In pharma and scientific research, the most effective route for early-career scientists is
a placement or summer project that converts to an offer — i.e. the warm path is built into the training
pipeline itself, not via cold outreach.

**Pharma and biotech:** Large pharma (GSK, AstraZeneca, Pfizer UK, Johnson & Johnson UK) run formal
graduate programmes (industrial placements and graduate schemes). Biotech startups in clusters (Cambridge
Biomedical Campus, Stevenage Bioscience Catalyst, Alderley Park, Babraham Institute area) are more open
to direct approaches. Science startups are increasingly based around university incubators where founder
networks are accessible.

**Academia:** PhD positions are advertised (FindAPhD.com) and direct contact with a potential supervisor
is not only acceptable but expected — emailing a professor about a potential PhD studentship is the
standard approach. The message should demonstrate real knowledge of their research, propose a specific
area of overlap with the applicant's interests, and ask whether they are taking students. This is the one
academic context where a targeted, direct email to a senior person is the right move.

**Bodies and communities:** Royal Society of Chemistry — student events. RSB (Royal Society of Biology).
Association of the British Pharmaceutical Industry (ABPI) — sector events. Wellcome Trust — funding events.
Cambridge Network (biotech cluster). Cogent Skills (life sciences workforce development).

_(Prospects.ac.uk: "Science sector overview"; ABPI: "Pharmaceutical industry UK"; Royal Society:
"Careers in research"; FindAPhD.com sector guides.)_ **Tier A (pharma process norms); Tier B (startup
outreach); Tier A (academia email norms, confirmed by multiple university supervisor guidance pages).**

---

### Social care

**Spectrum:** Application is the gate (regulated positions).

**Special rule:** Social work requires Social Work England registration. Child protection, adult social
care, and mental health support work are regulated positions with formal hiring processes governed by
council and NHS safeguarding requirements. As with clinical healthcare, there is no meaningful route
around the formal application for registered-required roles.

**Where outreach applies:** Outreach is more relevant in the voluntary sector (charities providing social
care services) and for operational support roles where formal social work registration is not required.
Speculative applications to smaller charities doing social care work follow the same logic as Section 6
(charity sector).

**Bodies and communities:** Social Work England — registration and events. BASW (British Association of
Social Workers) — student membership. Local authority Children's Services and Adult Social Care —
formal application-only routes. Skills for Care — sector workforce body.

_(Social Work England: "Registration requirements"; BASW: "Social work careers"; Skills for Care:
"Workforce intelligence 2025".)_ **Tier A.**

---

### Teaching and education

**Spectrum:** Application is the gate (QTS-route teaching) / Intelligence + warm application (education
policy, edtech, tutoring, international schools).

**Special rule — QTS requirement:** Teaching in maintained schools in England requires Qualified Teacher
Status. Routes to QTS include PGCE, School Direct, Teach First, and the Assessment Only route. Each has
a formal application process. Cold outreach to a head teacher to bypass the process is not how school
hiring works.

**Where outreach applies:** Multi-academy trust (MAT) HR teams do hire for non-teaching roles (operations,
data, comms) through more standard processes where direct contact is acceptable. Edtech companies (a major
and growing employer) hire product, engineering, and marketing professionals through standard channels.
International schools (not required to employ QTS-registered teachers) are more open to speculative
applications. Graduate teaching internships and School Experience Programmes are applied for directly
via the DfE's Get Into Teaching platform, not through cold outreach.

**Bodies and communities:** DfE: Get Into Teaching — essential for anyone exploring teaching. Teach First —
high-profile graduate programme. National Education Union (NEU) — student teacher network. NAHT (heads
association). EdTech sector: BESA (British Educational Suppliers Association) events; EdTechX Europe.

_(DfE: "Get Into Teaching 2025-26"; Teach First: "Graduate programme"; Prospects.ac.uk: "Education sector
overview"; BESA: "EdTech industry UK".)_ **Tier A (QTS routes); Tier B (MAT and edtech outreach
estimates).**

---

### Transport and logistics

**Spectrum:** Application is the gate (large logistics companies, rail, aviation) / Intelligence + warm
application (freight, supply chain, third-party logistics).

**Warmest path:** Placement years integrated into supply chain and logistics degrees (common at Aston,
Heriot-Watt, Huddersfield). Large employers (DHL, Royal Mail, Amazon Logistics, Network Rail, Transport
for London) run structured schemes. Graduate transport planning roles at consultancies and local transport
authorities are a growing niche where direct outreach to a transport planning manager works better than
at the large network operators.

**Bodies and communities:** CILT (Chartered Institute of Logistics and Transport) — student membership and
events; branches across UK. Transport Planning Society (TPS) — graduate members network. Network Rail
graduate scheme outreach through University of Transport and Logistics partnerships. Freight Transport
Association. AECOM, Atkins, Arup transport divisions — formal graduate hiring but with active professional
society engagement.

_(Prospects.ac.uk: "Transport and logistics sector overview"; CILT: "Careers in logistics"; Network Rail:
"Graduate and intern programmes".)_ **Tier A (large employer processes); Tier B (transport consultancy
outreach).**

---

### Sport and fitness

**Spectrum:** Outreach IS the route (sports organisations, clubs, sports science, fitness industry) /
Application is the gate (some national governing bodies and elite clubs).

**Warmest path:** Volunteering and placement with sports clubs, national governing bodies (NGBs), or sports
charities. The sports sector is highly relationship-driven and small relative to its cultural visibility.
The pathway from volunteer/placement to paid role is well-established at most NGBs and grassroots clubs.

**Norms and timing:** Elite sport clubs (Premier League, Championship clubs, county cricket, Olympics
organisations) are small employers with low turnover and formal processes. Grassroots sports development,
community sport, and leisure management (including local authority leisure trusts) are more open to
speculative applications and direct outreach. The sport science / performance analysis niche has grown
rapidly; opportunities at academic research centres, sports tech companies, and performance analysis
providers are accessible via direct outreach.

**Bodies and communities:** Sport England — grant-funded programmes and sector events. UK Sport —
performance support roles. CIMSPA (Chartered Institute for the Management of Sport and Physical Activity)
— membership and career events. StreetGames, Greenhouse Sports, other sports charities. Sports and
Recreation Alliance — sector convening events.

_(Prospects.ac.uk: "Sport and fitness sector overview"; CIMSPA: "Sport and physical activity careers";
Sport England: "Workforce strategy 2025".)_ **Tier B throughout (limited primary data on outreach
effectiveness in sport sector; expert consensus from NCS and Prospects).**

---

### Games

**Spectrum:** Outreach IS the route (independent studios, small-mid publishers) / Intelligence + warm
application (large publishers and platforms).

**Special character:** The games industry in the UK is small (approximately 25,000 employed, UKIE 2025)
and highly portfolio-driven. A GitHub profile, game jam participation, and a portfolio of personal
projects matter far more than a degree credential. Game jams (Global Game Jam, Ludum Dare, BAFTA Game
Jam UK) are simultaneously portfolio-building and community-networking events.

**Warmest path:** Game jams and the developer community. LinkedIn is relevant for games business roles;
for development, design, and art roles, the games community runs on Twitter/X, Discord, and itch.io.
Direct messages on Twitter/X to a studio's creative director or art lead about a junior role, accompanying
a strong portfolio link, is an accepted norm in this industry — less formal than LinkedIn, more common
than it might seem.

**Norms and timing:** Large publishers (EA, 2K, Sony Interactive UK, Ubisoft UK) run structured graduate
and intern programmes with formal windows. Independent studios hire reactively; outreach at any time is
appropriate if the portfolio is ready. UKIE's game jams, graduate showcase events (EGX, Develop:Brighton)
are genuine hiring events with developer access.

**Bodies and communities:** UKIE (UK Interactive Entertainment) — industry body; runs student competitions
and graduate career events. BAFTA Games — student mentorship scheme. Develop:Brighton — UK's largest
games developer conference; the career fair has direct access to studios. EGX — consumer and developer
event. Women in Games UK — diversity network and events.

_(Prospects.ac.uk: "Games sector overview"; UKIE: "UK Games Industry Census 2025"; BAFTA: "Games
mentorship programme".)_ **Tier A (sector character, UKIE primary source); Tier B (outreach response
rates in indie studio context).**

---

## 8. The "no jobs listed" case — speculative approaches for sparse markets

When the user is exploring a direction where live roles are sparse or absent, outreach becomes the
primary move. This matters more than it might seem: our pipeline surfaces live listings, but the
user's direction may not have a matching listing right now. The advisor needs a response for this case.

### What to advise (Tier A, synthesis of UK careers service guidance)

**Speculative approaches are right here.** Warwick, Oxford, Sheffield, and Prospects all actively recommend
speculative applications when no role is listed. The candidate who approaches before a vacancy is posted has
no competition. The key is: the company must be a genuine fit, not a scatter-shot target.

**The structure of a speculative approach when no role is listed:**
1. Identify companies where the fit is strong: they do the work the user wants to do, at the level the
   user could plausibly operate at, in a location and size that works
2. Find the right person to contact (team member or hiring manager, not HR generalist)
3. Write a message that focuses on the company's work, why the user cares about it specifically, and
   what they offer — not what they want
4. Ask for a conversation, not a role: "I'm not expecting you to have something available right now, but
   I'd love to understand your team's direction and introduce myself."
5. Follow up once, then move to the next target

**SMEs are the highest-yield target for speculative approaches (Tier A).**
Large graduate recruiters almost never respond to speculative applications: they have structured intake
windows and the volume is too great. SMEs (fewer than 250 employees) are the primary recipients of
successful speculative approaches, per Warwick, Oxford, and Prospects. They rarely have the infrastructure
to run a full graduate recruitment campaign. A strong, specific candidate who reaches out at the right
moment is genuinely valuable to them.

**Volume is not the answer even here (Tier A).**
Sending 50 speculative applications is the wrong move. Sending 5 carefully researched, genuinely specific
ones is right. Prospects is explicit: "careful targeting is far more likely to lead to success." The
advisor's job is to slow the user down toward quality, not encourage a new version of spray-and-pray.

---

## 9. Confidence and anxiety: lowering the barrier

### Why this matters for our cohort

Outreach terrifies an anxious early-career person. The fear is specific: rejection from a stranger who
had no obligation to reply, in a context where the user already feels like they're not enough. This is
not irrational. It is a real cost, and dismissing it with "just do it" is unhelpful and wrong.

The advisor must actively lower the activation cost of outreach, not assume the user is ready.

### What actually lowers the barrier (sourced)

**Reframe what a non-response means (Tier A).**
The most powerful reframe: a non-response is not rejection, it is noise. Professionals are busy. A message
that gets no reply was not read at a moment when the person had bandwidth for it. It is not a verdict on
the user. This reframe directly parallels the 140:1 application base-rate reframe in ADVISOR_PERSONA.md:
calibrate expectation before diagnosing failure.
_(WGU Careers: "Networking nerves — top 10 tips"; FMWF Chamber: "Overcoming networking anxiety".)_

**Warm paths first, always (Tier A).**
Alumni outreach is categorically less scary than cold contact to a stranger. A shared university is social
permission. The advisor should route the user toward the warmest available contact before suggesting cold
outreach, because warm outreach succeeds more AND feels safer to send.

**Scripts remove the blank page fear (Tier A).**
The research consistently shows that knowing exactly what to write before starting dramatically reduces
avoidance. The advisor's role is to draft the message with the user, not give them a blank page and say
"try this." The example messages in Section 4 are models, not templates: the advisor fills them with the
user's actual details so the user does not have to write from scratch.

**Soft asks lower the cost for everyone (Tier A).**
Asking for 20 minutes is less scary to ask and less scary to receive than asking for 30. Saying
"completely understand if you're busy" lowers the interpersonal cost of sending. The technique of
explicitly giving the other person an easy out was confirmed across Yale OCS, HBR, and multiple careers
services as both polite and counter-intuitively effective.

**Start with one person, not a campaign (Tier B, practitioner consensus).**
The anxiety of "networking" as a concept is much higher than the anxiety of messaging one specific person
about one specific question. The advisor should never frame the task as "you need to start networking."
It should frame it as: "Is there one person at [company], maybe from your uni, worth a short message?"
The single-contact approach is actionable; the campaign framing is paralysing.
_(HBR: "If networking makes you anxious, try this"; WGU Careers; FMWF Chamber.)_

**Reframe networking as curiosity, not promotion (Tier A).**
The research consistently identifies that anxiety spikes when the person feels they are "selling themselves"
to someone who may not want to buy. The reframe: an informational interview is an expression of genuine
curiosity. You are not asking someone to do you a favour. You are asking them to talk about themselves
and their work, which most people genuinely enjoy. This reframe is confirmed by UK careers services
(Prospects, Sheffield) and HBR. The advisor can voice this directly.

**Practice on lower-stakes contacts first (Tier A, UK careers service consensus).**
The standard careers service advice: start networking with people in your existing circle (friends of
parents, former managers, lecturers, classmates who are a year or two ahead) before cold-contacting
strangers. These contacts will almost certainly say yes. Each yes builds the emotional evidence that
outreach is survivable. The advisor should identify these lower-stakes first targets before pushing
toward cold outreach.

### The anxiety gradient (for advisor calibration)

From lowest activation cost to highest:
1. Messaging a friend who works at a target company
2. Emailing a former manager or lecturer asking for a steer
3. Messaging a university alumni contact via the alumni tool
4. Cold LinkedIn message to a team member at a target company
5. Cold email to a named contact at a target company
6. Cold LinkedIn message to a hiring manager

The advisor should start at 1 or 2 for an anxious user, not at 5 or 6.

---

## 10. UK-specific norms in 2026

### What has shifted

**AI-generated outreach has flooded the channel (Tier A).**
This is not future risk; it is the current condition. 41% of LinkedIn users were using AI to write messages
by late 2025. Over 50% of long-form LinkedIn posts were likely AI-generated by the same period. 79% of
decision-makers now default to ignoring cold DMs. The consequence: a well-crafted, genuinely specific
human message now stands out more than it did in 2022-23, not less. But it must be genuinely specific.
An AI-generated message that references "your impressive work at [company]" without naming anything real
is indistinguishable from the noise and will be treated as noise.
_(Expandi: "State of LinkedIn Outreach H1 2026"; Sopro.io: "59 cold outreach statistics 2026".)_

**The platform is shifting toward content-led warm inbound (Tier B).**
The LinkedIn algorithm in 2026 rewards dwell time, comments, and saving over likes and shares. Brands and
senior professionals are learning this; early-career users have not. The advisor might note for users who
are open to building a presence: commenting thoughtfully on posts by people in target sectors is now
a warmer, lower-stakes entry point than a cold message. A comment that shows genuine engagement is visible
to the poster and can open a conversation more naturally than a cold InMail.
_(LinkedIn Algorithm 2026 — Cleverly, Agorapulse, DataSlayer analysis.)_

**LinkedIn voice notes: emerging, not mainstream (Tier B).**
LinkedIn voice notes achieve 2-3x higher response rates than text messages in early studies (Reply.io,
LaGrowthmachine). They work because most inboxes have none of them, and the human voice conveys warmth
text cannot. Caveats: (a) not appropriate as a first cold contact — it is too intimate from a stranger;
(b) best used in a warm thread that has already started; (c) 30-45 seconds maximum. This is an emerging
technique, not a standard one. The advisor should note it as an option for users who are comfortable
with it, not recommend it universally.

**The graduate job market is significantly tighter in 2026 (Tier A).**
A useful framing the advisor can deploy: the difficulty the user is feeling at the door is real and not
their fault. Graduate vacancies at top UK employers are down approximately 24.5% since 2022 (High Fliers).
ISE data (cited in Fortune, October 2025) points to roughly 1.2 million recent UK graduates competing for
around 17,000 open roles. This context belongs in the reframe before any problem-solving, alongside the 140:1 applications
figure: the market is genuinely harder, outreach is genuinely more important as a supplement to
applications, and the user is facing a structural condition, not a personal failure.
_(High Fliers Research 2024-25; ISE 2024-25, cited in Fortune, October 2025; University of Bristol Careers Blog, June 2026.)_

**UK cultural register: understated, not pushy (Tier A).**
UK professional networking norms differ from US models. The explicit sell, the aggressive follow-up, the
assertion that you're "the perfect fit" all read badly in a UK context. The effective UK outreach is
polite, understated, acknowledges the person's time, and makes a very specific and modest ask. The phrase
"completely understand if you're busy" is not a weakness in the UK — it is socially correct. The advisor
should write outreach in this register, not import US assertiveness norms.
_(Whali.co.uk: "Average cold email response rate 2026" — UK cultural note; GraduateMentor.uk; multiple
UK careers services.)_

---

## 11. Edge cases — the users most outreach advice fails

_These are the users who need us most. Generic outreach advice assumes you already have a network,
a clear direction, and a mainstream employment situation. Our cohort includes a significant proportion
of people for whom those assumptions are false. Each case below has its own sourced guidance and its
own build implications._

---

### 11.1 People with no existing network / low social capital

**Why this is the most important edge case.**
Outreach advice that starts with "reach out to your network" is useless to someone who has no network.
This describes a significant proportion of our users: first-generation graduates, people from lower
socioeconomic backgrounds with no professional contacts, graduates from non-Russell Group universities
in towns with fewer graduate employers, people who studied entirely independently or via distance learning,
career-changers who spent years in industries where they know nobody relevant. If the advisor defaults
to "start warm," it must also know what to do when there is no warm contact to start with.

**Where the evidence points (Tier A):**

The Social Mobility Commission's "State of the Nation 2024" report is explicit: professional networks are
a major driver of social mobility gaps. People from higher socioeconomic backgrounds are more likely to
enter professional and managerial roles because they are more likely to have family and peer connections
in those roles. The Commission recommends targeted programme investment (Social Mobility Pledge employers,
employer-led outreach to state schools) — but the individual-level implication is clear: a first-generation
graduate has to build their network from scratch, and the tools to do so need to be explicitly taught, not
assumed.

**What "building from nothing" actually looks like:**

1. **Lecturers and tutors** — the most accessible warm professional contacts a new graduate has. A lecturer
   who knows the student's work is the closest equivalent to a professional reference. The ask: "I'm
   applying to [sector/role] and you know my academic work — would you be willing to introduce me to
   anyone you know in that area, or serve as a reference?" Most academics are not professionally connected
   to private-sector employers, but some are. The ask costs nothing.
   _(Sheffield Careers: "Starting to network from scratch".)_ **Tier A.**

2. **University alumni tools — zero prior connection needed.** The LinkedIn alumni search (Section 3)
   requires no prior connection. A first-generation graduate from any UK university has access to this
   tool. The shared university is a genuine social warm-up even for a total stranger, not a pretextual
   connection. This should be surfaced prominently for users with no existing network.
   _(University of Manchester Widening Participation: "Alumni mentoring for first-gen students"; Warwick
   Careers: "Networking without a network".)_ **Tier A.**

3. **University careers services — most offer alumni mentoring specifically for first-gen students.**
   Many Russell Group and post-92 universities run structured alumni-to-student mentoring programmes,
   and some run specific first-generation or widening-participation mentoring schemes. University of
   Manchester's Stellify Award, Sheffield's mentoring scheme, Exeter's graduates-from-less-advantaged-
   backgrounds programme. These are warm professional contacts the university provides; a user with
   no network should be pointed here explicitly. Careers services remain accessible for up to 3 years
   post-graduation at most universities (Warwick, Birmingham, Sheffield confirm this).
   _(Sheffield Careers Service; Manchester Widening Participation; Warwick Careers Alumni.)_ **Tier A.**

4. **Communities and events as a network-building entry point.** See Section 11 for the full communities
   channel. For someone with no network, a sector community (online or in-person) is the lowest-anxiety
   cold-to-warm path: you attend, you observe, you gradually participate, you meet people without the
   explicit ask of a cold message. Meetup.com, Eventbrite, and industry body events are free or low-cost.
   The advisor should name concrete community options (see Section 11) for the user's specific direction.
   **Tier B (directional; limited primary study on community-to-employment rates in UK).**

5. **Employer diversity programmes and open-access events.** Many large employers run specifically open
   access insight events for under-represented groups: Bright Network's Diversity Insight Days, social
   mobility-focused employer insight programmes (KPMG Foundation, Deloitte ASPIRE, Teach First graduate
   fairs). These are warm contacts with a professional context from the first moment. They are not a
   substitute for a network but they are a starting point.
   _(Social Mobility Foundation; Bright Network: "Diversity & inclusion events".)_ **Tier A.**

6. **Building in public (digital portfolio/presence).** For tech, design, creative, science, and marketing
   roles, a GitHub, Behance, portfolio site, or LinkedIn content presence can function as a substitute
   for a warm contact. A person who has published interesting work gets approached; they don't have to
   approach. This is a slow-build strategy, not a quick fix, but it is a genuine path for users with
   zero existing network and an area of demonstrable skill.
   _(UKIE: "Breaking into games"; DCMS 2025 Creative Industries report.)_ **Tier B.**

**What the advisor must not do:** assume any prior professional connections exist. Before any outreach task,
check: does this person have any relevant contacts? Any lecturers? Any alumni from their university? If
the answer is no to all of these, acknowledge it explicitly ("You're starting from scratch — that's harder,
but it's not a dead end") and route to the warm-start-without-a-network tools above.

**Build implication:** Add a specific check to the outreach conversation flow: "Have you met anyone working
in this area, even briefly?" — and branch the conversation based on the answer. The "no" branch should
surface alumni tools, university careers services, and relevant communities, not cold outreach to a stranger.

---

### 11.2 Career-changers and mature candidates

**The challenge.** A career-changer has experience (which is an advantage) in the wrong sector (which
is a disadvantage). Outreach is particularly important for career-changers because formal applications
are more likely to be screened out by keyword-matching systems trained on typical applicant profiles.
A human conversation — an informational interview — is a better channel for demonstrating transferable
skills than a CV that reads wrong on the first pass.

**What the evidence says (Tier A):**
Prospects.ac.uk explicitly notes that career-changers face an additional barrier in many sectors: a CV
that "looks wrong" is more likely to be passed over. The National Careers Service echoes this: "Many
employers use automated screening in volume, which can disadvantage career-changers whose terminology
doesn't match." The recommended route: bypass the volume screening by getting a conversation first, then
convert that conversation into an internal referral or a warm application that clears the screen.

**Specific tactics for career-changers:**

1. **Frame the change as the asset, not the apology.** The outreach message for a career-changer should
   not open with "I know my background is unusual for this role." It should open with the concrete
   transferable skill and make the career-change feel like a deliberate strategic move. "I spent five
   years in [sector] developing [specific skill], and I'm now moving into [target sector] — I'd love to
   understand how that skill applies here."

2. **Target others who made the same transition.** LinkedIn search makes this findable: search for people
   currently in the target role who previously held the candidate's type of role. These people have made
   the exact same transition, are psychologically receptive to someone at the same point, and have
   inside knowledge about what the transition actually requires.

3. **Sector-specific conversion programmes.** Many sectors run formal career-change routes: Teach First
   (career changers into teaching), Finance into Tech schemes (FinTech Alliance), Coding bootcamps with
   employer partnerships (General Assembly, Makers), the NHS's career change routes into allied health.
   The advisor should know these exist and name the relevant one when the user's direction matches.

4. **Age and tone:** Mature candidates (late 20s and above) should not over-explain their age or make
   their maturity a topic in the message. The research on ageism in recruitment is complex and contested
   (Tier B); the practical advice is: do not draw attention to age in outreach messages. Focus on the
   skill, the reason for the change, and the specific ask.

_(National Careers Service: "Changing careers"; Prospects.ac.uk: "Mature graduate jobs"; CIPD: "Career
transitions and learning".)_ **Tier A (tactical framing); Tier B (age-related discrimination estimates).**

**Build implication:** When the advisor detects that a user is a career-changer (from background input),
it should surface the "find others who made the same transition" search as a specific first step, and
note that direct contact is even more important than usual because formal application screening is a
known barrier.

---

### 11.3 International students and visa-holders

**The boundary — hard rule.** Visa and right-to-work status is a regulated domain (OISC/IAA for
immigration advice). The advisor applies the ADVISOR_PERSONA.md "inform and signpost, never advise"
rule in full here. It never tells a user what their specific eligibility is, never advises on whether a
specific employer can or cannot sponsor them, and never interprets their specific visa conditions. It
points to gov.uk, the UKCISA (UK Council for International Student Affairs), and regulated advisers.

**What the advisor can inform (general information, not personal advice):**

1. **The Graduate Route visa:** As of 2026, international students who complete a UK degree (bachelor's,
   master's, or PhD) from a UK Higher Education Provider are eligible for the Graduate Route visa, which
   allows 2 years of work in the UK (3 years for PhDs) with no employer sponsorship required. This is
   accurate general information available publicly from gov.uk. The advisor can state this general fact
   and direct the user to gov.uk for current requirements.
   _(gov.uk: "Graduate visa"; UKCISA: "Graduate Route guidance".)_ **Tier A.**

2. **Skilled Worker visa and sponsorship:** After the Graduate Route expires (or for roles requiring
   sponsored employment), the Skilled Worker visa requires an employer to hold a valid Sponsor Licence.
   The Home Office publishes the list of licensed sponsors publicly (Register of Licensed Sponsors on
   gov.uk — searchable by employer name). The advisor can tell a user that this list exists and how to
   find it, but cannot advise on whether a specific employer is likely to sponsor them or whether they
   are eligible. That requires a regulated immigration adviser.
   _(gov.uk: "Skilled Worker visa"; Home Office: "Register of Licensed Sponsors".)_ **Tier A (existence of
   list); OISC-regulated for personal advice.**

3. **Outreach norms for international students:** UKCISA notes that international students often
   experience additional anxiety around outreach because of uncertainty about their employment status.
   The advisor should acknowledge this explicitly and frame the informational interview as especially
   valuable for international students: it is a lower-stakes way to understand whether an employer is
   likely to sponsor, without having to ask directly in an application.

4. **Visa-related questions in outreach:** The advisor should never suggest asking directly about
   sponsorship in a first outreach message (it makes the conversation transactional and increases
   rejection risk). It is appropriate to ask about an employer's sponsorship history in a second
   conversation, or to research via the Home Office register before reaching out at all.

5. **UKCISA and university international student careers services:** These are the signpost destinations.
   Most UK universities with significant international student populations run dedicated international
   student careers support, and some run targeted employer events with UK employers known to sponsor.

_(gov.uk: "Graduate visa requirements"; Home Office: "Register of Licensed Sponsors"; UKCISA: "Working in
the UK after study".)_ **Tier A (factual immigration information); OISC-regulated for personal eligibility
advice — the advisor never crosses this line.**

**Build implication:** When the advisor detects that a user is an international student (from background
input or their stating it), it should: (a) acknowledge the additional complexity honestly; (b) point to
gov.uk for the Graduate Route and Skilled Worker visa basics; (c) surface the Licensed Sponsors register
as a research tool; (d) explicitly state it cannot give personal immigration advice. Never attempt to
advise on specific eligibility.

---

### 11.4 Regional differences — London vs the rest of the UK

**Why it matters.** Career advice is heavily London-centric. Outreach norms, sector density, and
networking infrastructure vary significantly by UK region. Advice calibrated for London may be actively
wrong for a user in Newcastle, Swansea, or rural Lincolnshire.

**What the evidence says (Tier A):**

CIPD's "UK Working Lives" survey and ONS regional labour market data consistently show that the
concentration of professional and managerial roles is significantly higher in London and the South East
than in any other region. The ISE's graduate survey (2024-25) notes that graduate recruiters are
disproportionately London-headquartered; fewer than 30% of large graduate schemes have meaningful intake
outside London and the South East.

**Practical differences by region:**

- **London:** Highest density of employers, events, and professional networks. Cold outreach to London
  professionals has the most targets but also the most noise. Events (London Tech Week, Marketing Week
  Live, etc.) are frequent and accessible. Alumni networks from UK universities are concentrated in
  London more than anywhere else.

- **Manchester/Birmingham/Leeds/Bristol (secondary cities):** Meaningful local professional communities,
  local professional body branches (CIPD branch events, RICS regional events, law society local chapters),
  growing tech and creative clusters (Manchester Digital, BrumTech, Leeds Digital Festival, Bristol &
  Bath Science Park). These cities have enough professional density for in-person networking to work.
  Alumni outreach within the city is worthwhile; Prospects and NCS note that regional loyalty is
  significant — employers in Manchester often prefer to hire people who want to be in Manchester.

- **Smaller cities and towns:** Lower employer density means fewer local targets. The compensating
  strategy: remote-first companies (increasingly common post-2020, though partially reversed by 2025
  return-to-office trends), national organisations with regional outposts (civil service departments,
  NHS trusts, schools, social care organisations), and sector-specific concentrations (life sciences
  in Cambridge, advanced manufacturing in the East Midlands, maritime and defence in Portsmouth/Plymouth,
  financial services in Edinburgh). The advisor should know the user's location and calibrate which
  sectors have a meaningful local presence.

- **Remote/hybrid reality in 2026:** The ONS Labour Force Survey 2025 estimates approximately 28% of
  UK employees work hybrid (at least some home working). This has expanded the effective networking
  geography for many roles — a candidate in Leeds is now a realistic applicant for a hybrid role
  headquartered in London. The advisor should note this when relevant: a strong application to a
  hybrid-open role is not necessarily disadvantaged by geography.

**Events and communities outside London:**
- Manchester Digital and Northern Powerhouse Partnership events
- Leeds Digital Festival (annual, free, significant attendance)
- Birmingham's Digbeth digital and creative cluster events
- Edinburgh's financial services sector (Scottish Financial Enterprise events)
- Cambridge's biotech and science cluster (Cambridge Network events)
- The "Made Outside London" Prospects campaign content — specifically identifies opportunities beyond the capital

_(ONS: "Regional Labour Market Statistics 2025"; CIPD: "UK Working Lives 2024-25"; ISE: "Graduate
Recruitment 2024-25"; Prospects.ac.uk: "Graduate jobs outside London".)_ **Tier A (regional labour
market patterns); Tier B (specific outreach response rate differences by region — no primary UK study).**

**Build implication:** The advisor should know the user's preferred location (gathered in conversation)
and calibrate outreach guidance by region — naming local events, regional branches of professional bodies,
and remote-open employers when the user is not London-based.

---

### 11.5 Disability, neurodiversity, and accessibility in outreach

**Why this matters.** Some of our users will have disabilities, neurodivergent conditions (autism, ADHD,
dyslexia), or chronic health conditions that affect how they network and what adjustments they may need.
This is a specific case, not a generic accessibility note. The advisor must handle it without drawing
unwanted attention to disability or making assumptions.

**What the evidence says (Tier A):**

CIPD's "Disability and Employment" report (2024) notes that disabled people in the UK are employed at
a rate approximately 30 percentage points below non-disabled people. ACAS confirms that employers are
legally required (Equality Act 2010) to make reasonable adjustments for disabled job applicants,
including during the recruitment process. This includes adjustments to how outreach and interviews happen.

**The advice:**

1. **Disability Confident employers.** The Disability Confident scheme (gov.uk) identifies UK employers
   who have committed to inclusive recruitment. These employers are more likely to be receptive to
   adjustments and to guarantee an interview if minimum criteria are met. The advisor can name this
   scheme and link to the gov.uk employer list.
   _(gov.uk: "Disability Confident scheme".)_ **Tier A.**

2. **Neurodivergent users and outreach anxiety.** For users who identify as autistic or otherwise
   neurodivergent, the social ambiguity of cold outreach (unwritten rules, uncertain response, social
   inference required) can be significantly more anxiety-inducing than it is for neurotypical users.
   The advisor should: (a) lean toward lower-ambiguity entry points (structured events with clear rules,
   formal alumni mentoring programmes where the structure is explicit, communities where norms are
   defined); (b) be explicit about what "a 20-minute conversation" involves — what will be asked, what
   a likely reply looks like, how to handle silence; (c) acknowledge directly if the user raises this.

3. **Asking for adjustments.** ACAS guidance is clear: a candidate can request reasonable adjustments
   at any stage, including for an informational interview, without this being a red flag. The advisor
   should frame this as normal and provide ACAS as the reference source for what constitutes a
   reasonable adjustment.

4. **Written over spoken outreach.** For users who find spoken communication harder (autism, stammer,
   voice disability), written outreach (LinkedIn message, email) is already the primary channel this
   product uses. The advisor should note that "informational interview via email Q&A" (asking questions
   over email rather than a call) is a valid and accepted alternative — it is less common but many
   professionals will agree to it.

5. **Assistive technology and inaccessible platforms.** Some professional platforms (LinkedIn, some
   company websites) have known accessibility issues with screen readers. The advisor should not assume
   the user can access every recommended platform identically. When possible, offer alternative routes.

_(CIPD: "Disability in the Workplace 2024"; ACAS: "Disability in the workplace — employer obligations";
gov.uk: "Disability Confident scheme"; Equality Act 2010.)_ **Tier A (legal rights); Tier B (specific
neurodivergent outreach tactics — practitioner consensus, not primary study).**

**Build implication:** The advisor should not proactively surface disability-specific advice unless the
user raises the topic. When raised, it should treat it as normal, provide accurate signposts (Disability
Confident, ACAS), and adapt its outreach guidance to lower-ambiguity formats. Never make assumptions
about capability. Never ask unprompted about disability status.

---

## 12. Communities and events as an outreach channel

_Lexi flagged communities as a future product feature. This section grounds the advisor's guidance on
using communities as an on-ramp — a warmer, lower-anxiety starting point than cold outreach, especially
for users with no existing network. Every community or event named below is real and verifiable._

**Why communities matter for our users.** Cold outreach requires identifying a specific person and
sending them a message — it is a high-activation, high-social-risk act for an anxious user. Communities
and events reduce that activation cost: you are present in a shared space before any individual
conversation starts. The relationship forms in context, without a blank-page message. This is the
mechanism that makes communities work as networking, not just as learning.

**Three ways communities convert into contacts:**

1. **Presence without asking:** attending the same recurring event or online community as target
   professionals, becoming a recognisable name over time. Slow but very warm when it works.

2. **Engagement and question-asking:** commenting on a community discussion, asking a thoughtful question
   in a webinar — these create a low-stakes first touchpoint. The host or other members respond
   in a public, lower-pressure context.

3. **Direct follow-up after meeting:** meeting someone at an event and then sending a LinkedIn message
   that references the meeting removes all the cold-start problem. "We met at [event] and you mentioned
   [thing]" is a warm-start message with no prior relationship required.

_(Sheffield Careers: "Networking through events"; FMWF Chamber: "Overcoming networking anxiety";
Prospects.ac.uk: "Industry events and networking".)_ **Tier A (mechanism); Tier B (conversion rates).**

---

### Concrete UK communities and events by sector

The following are real, current, and free or low-cost unless noted:

**Technology:**
- Silicon Milkroundabout (London, biannual, free for candidates) — large tech hiring event with direct
  employer access
- Women in Tech UK events (national, many free)
- PyData UK / PyCon UK — data and Python community events
- Hack the North, Major League Hacking UK hackathons — simultaneous portfolio-building and networking
- Product-focused: Mind the Product conference (paid) and ProductTank meetups (free, nationwide)
- BIMA (British Interactive Media Association) events

**Marketing, advertising, PR:**
- CIM branch events (nationwide, student membership discounted)
- CIPR Regional Groups (free to members, student rates)
- D&AD New Blood (competition + events, entry-level focus)
- ProPR community (Slack, free, UK PR professionals)
- Women in Marketing UK meetups

**Finance:**
- CFA UK Society events (student and affiliate membership)
- ICAEW student events (free to student members)
- Bright Network Finance Summits
- The Finance Apprentice community (for non-graduate finance entry)

**Creative arts, fashion, media:**
- The Dots (UK professional network specifically for creative industries — free)
- Creative Review events
- BECTU meetings (broadcasting and film)
- D&AD workshops and talks
- Creative Access programmes (paid placement scheme, but events are open)

**Law:**
- Law Society Junior Lawyers Division events
- LawCareers.net events and virtual fairs
- University law society alumni events
- The Lawyer and Legal Week — virtual events

**Sustainability and energy:**
- Green Careers Hub events (free, graduate-focused)
- Clean Tech networking events (Climate KIC UK)
- Renewable UK — student and early-career member events
- Net-zero built environment: UKGBC events

**Consulting and strategy:**
- Bright Network Consulting Summits
- MCA Consulting Future Leaders Forum
- Student Consulting and Strategy Society networks (cross-university, active LinkedIn communities)

**Science and research:**
- Royal Society of Chemistry events (student affiliate membership)
- RSB (Royal Society of Biology) student events
- Wellcome Collection talks (public, relevant to life sciences and health research networks)
- ABPI graduate events

**Charity and social impact:**
- NCVO conference and sector events
- Charity recruitment fairs (CharityJob virtual fairs, free to attend)
- Young Charity Trustees network (Trustees Unlimited)
- Cause-specific sector events (Green Alliance, housing charities, etc.)

**Architecture, property, construction:**
- RICS NextGen events (graduate and student member network)
- RIBA student events and open days
- Architecture Foundation events (public, London)
- New London Architecture (NLA) — built environment events

**Sport:**
- CIMSPA conference and regional events
- Sport England's workforce events
- StreetGames volunteer community

**Games:**
- Develop:Brighton (annual, developer-focused conference, student discounts)
- EGX — consumer event but career fair component
- Global Game Jam UK sites (free to participate)
- Women in Games UK events (free)
- BAFTA Games mentorship and events

**Cross-sector (for users without a confirmed direction):**
- Eventbrite and Meetup.com filtered by sector/city — reliable aggregators of free professional events
- Bright Network — cross-sector graduate events with employer access
- Prospects.ac.uk events listing — curated UK careers events
- Target Careers networking guides by sector

_(Sources: individual body and organisation websites as named; Prospects.ac.uk: "Industry events";
National Careers Service: "Finding a job — networking".)_

**Build implication for communities as a future feature:** The advisor can currently surface community
recommendations in conversation when a user lacks network contacts ("Have you come across the [X]
community? It's where a lot of people in this sector are — lower pressure than a cold message"). A future
product feature could: maintain a curated, verified UK community and event list by sector, surfaced
contextually alongside role listings. The research foundation for this is here.

---

## 13. Build implications — how to ground the advisor

This section is written for the prompt engineer building the outreach feature. Every item is derived from
the research above. Items are marked as HARD RULE (must encode), STRONG DEFAULT (encode unless specific
context overrides), or CALIBRATION (nuance to build into the conversation flow).

### Hard rules

**HARD RULE 1 — Always route to warmest path first.**
Before the advisor suggests cold outreach, it must check: does the user know anyone at this company? Do
they share a university with anyone there? Is there a mutual connection on LinkedIn? Only after these
paths are confirmed closed should cold contact be suggested. This is non-negotiable: warm paths succeed
5x more often and cost the user less emotionally.

**HARD RULE 2 — The ask in a first message is NEVER a job or a CV review.**
The only appropriate first ask is a 20-30 minute conversation. A CV, a referral, a job, feedback on an
application, or any ask that requires effort from the recipient belongs in a later conversation, not a
first message. If the user tries to do this, the advisor redirects.

**HARD RULE 3 — One follow-up maximum after no response, then stop.**
The advisor never tells a user to follow up more than once after a cold outreach that received no reply.
Two follow-ups from a stranger is pushy in a UK context. If no response after one follow-up, the advisor
helps the user move to a different contact.

**HARD RULE 4 — Never recommend the "info@" or HR inbox for first contact.**
The advisor finds or helps find a named individual. A message to an unnamed inbox is almost always a waste
of the user's effort.

**HARD RULE 5 — No scraping, no contact databases.**
The advisor's outreach guidance relies only on: LinkedIn's own search features, company websites,
alumni tools, and public professional information the person has published. It never recommends a tool
that harvests or purchases contact data.

**HARD RULE 6 — Never suggest outreach as a replacement for applying.**
In most sectors, the application is still the gate. Outreach warms the application and surfaces unlisted
roles. It does not replace the formal submission. The advisor is explicit about this.

### Strong defaults

**STRONG DEFAULT 1 — Start with an anxiety check before any outreach task.**
Before the advisor drafts a message or identifies contacts, it checks: has the user done outreach before?
How do they feel about it? If the answer suggests anxiety, the advisor routes them through the anxiety
gradient — start with one lower-stakes contact (someone they already know in the vicinity of the target)
before any cold approach. Do not treat outreach as a mechanical task; treat it as something that requires
an emotional on-ramp for many users.

**STRONG DEFAULT 2 — Draft the message with the user, not for them.**
The advisor co-writes the message: it asks for the one specific thing the user genuinely finds interesting
about this person's profile or career, then shapes that into the core of the outreach. A message the user
helped craft is more authentic and more theirs. A message the advisor generated wholesale will read like AI.

**STRONG DEFAULT 3 — Calibrate effort by sector before recommending outreach.**
The advisor knows the user's direction. If the direction is media, fashion, or creative industries: outreach
is the primary route, and the advisor should say so clearly and warmly. If the direction is law, public
sector, or large-firm consulting: outreach is intelligence-gathering alongside the application, and the
advisor should say that instead. Never apply one outreach effort level to all directions.

**STRONG DEFAULT 4 — Reframe before the first message is sent.**
An anxious user needs to hear, before any message is sent: a non-response is normal and not a verdict.
Most people simply miss messages. One message to one person this week is a real move. This reframe costs
the advisor one sentence and is worth it every time.

**STRONG DEFAULT 5 — Thank-you within 24 hours of any conversation.**
After any informational interview or career chat, the advisor reminds the user to send a thank-you note
and offers to help draft it. This step is consistently skipped and consistently separates people who
build networks from those who don't.

**STRONG DEFAULT 6 — Target named contacts at SMEs before large graduate schemes.**
When the user has no live listing to anchor to, the advisor directs speculative outreach toward SMEs and
mid-size organisations, not large graduate employers. Large employers will not respond to speculative
outreach; SMEs sometimes will, and these are often the roles that never get posted anywhere.

### Calibrations

**CALIBRATION — Finance outreach has its own format.**
Investment banking and financial services expect a different outreach style: extremely concise (five
sentences maximum), direct, asks for a specific call time, targets two to four named people per firm
(not a team blast), and uses a university email if still studying. The advisor should know to apply
this when the user's direction is IB/finance.

**CALIBRATION — Voice notes are an option, not a recommendation.**
The advisor should mention LinkedIn voice notes only if the user asks about standing out, or if a thread
of conversation has already started with a contact. Not appropriate as a first cold contact.

**CALIBRATION — Commenting on someone's LinkedIn content is a warm entry that lowers the cold-message risk.**
For users with high outreach anxiety, the advisor can suggest: before messaging someone directly, engage
with their content first. Comment on a post with a specific, thoughtful observation. This creates a warmer
context for a message and is psychologically lower-stakes for the user. Surface this as an option, not a
requirement.

**CALIBRATION — Confidence threshold for directed vs lost user.**
A directed user ("I know I want to work in climate tech, I just need a foot in the door") should be moved
to outreach quickly: the emotional barrier is lower and the target is clear. A lost user ("I don't really
know what I want") should not be pushed into outreach until a direction is clearer — identifying who to
contact requires knowing what you're targeting. Premature outreach from a confused position produces
vague, unspecific messages that never get replies.

**CALIBRATION — The GDPR-safe outreach sequence.**
Always: (1) identify person by name via LinkedIn/company site, (2) user clicks through to their public
profile themselves, (3) advisor helps draft one message, (4) user sends from their own account. The
advisor never sends on the user's behalf, never stores contact information, and never coordinates
multi-contact campaigns. This is the product's safe lane.

### Additional hard rules from new sections

**HARD RULE 7 — The advisor uses commercial-source direction, never commercial-source numbers.**
The research that informs the advisor's behaviour draws on commercial sources (Expandi, Sopro, Skylead,
Whali) for directional findings (warm beats cold; specificity beats volume; follow up once). These
directional findings shape advisor behaviour. The advisor never quotes specific commercial statistics
to a user ("warm messages get a 56% response rate"). It expresses the direction: "a message that's
clearly written for this person specifically gets far more replies than a generic one." The mechanism,
not the metric. NOTE: this rule applies ONLY to commercial-source numbers. Numbers from primary
institutional sources (e.g. the ISE 140:1 applications-per-vacancy reframe, ONS, CIPD, High Fliers) are
build-safe and may be used where the advisor's voice allows, because they are credible and verifiable.

**HARD RULE 8 — Clinical, regulatory, and QTS-required roles: never suggest outreach as a gate bypass.**
For roles requiring statutory registration (doctors, nurses, allied health, solicitors via SQE,
barristers via Pupillage Gateway, teachers via QTS routes), the formal process is the process. The
advisor is explicit: outreach is for intelligence gathering only — speaking to someone in the role
about what it is actually like. It never implies that knowing the right person can substitute for
the formal qualification and application route. This applies to: GMC, NMC, HCPC, Social Work England,
SRA, Bar Council Pupillage Gateway, DfE QTS.

**HARD RULE 9 — International students: inform and signpost on right-to-work; never advise.**
When a user indicates they are an international student or asks about sponsorship/visa eligibility,
the advisor: (a) provides factual general information about the Graduate Route visa (gov.uk) and the
Home Office Licensed Sponsors register (gov.uk) as research tools; (b) explicitly states it cannot
advise on their specific eligibility; (c) points to UKCISA and regulated immigration advisers. This
is OISC-regulated territory. The advisor never guesses, estimates, or implies an answer to a specific
right-to-work question.

**HARD RULE 10 — Before any outreach task, check for the zero-network case.**
The advisor must not assume any prior professional contacts exist. It asks: do you know anyone at
companies in this area, from your university, or from previous work? If the answer is no, the advisor
routes to: (1) LinkedIn alumni search; (2) university careers service alumni programmes; (3) relevant
sector community or events; (4) lecturer or former teacher contacts. Only after these warm options are
explored does it move to cold outreach from a true zero-network starting point.

### Additional strong defaults from new sections

**STRONG DEFAULT 7 — Calibrate guidance by region.**
When the advisor knows the user's preferred location, it adapts outreach guidance: names local
professional body branches, regional events, and remote-open employers for users outside London.
Never applies London-centric networking assumptions to a user in Newcastle or rural Wales.

**STRONG DEFAULT 8 — Disability and neurodiversity: lower-ambiguity options first.**
When a user has raised a disability or neurodivergent condition, the advisor routes toward
structured events, formal alumni mentoring programmes, and written Q&A alternatives to voice calls
before suggesting standard cold outreach. It names the Disability Confident scheme and ACAS as
references for adjustment rights. It never proactively raises disability status.

**STRONG DEFAULT 9 — Career-changer: find the same-transition contact first.**
When the advisor knows the user is changing sector or direction, before suggesting generic sector
outreach it suggests: search LinkedIn for people currently in the target role who came from the
user's background. These are the warmest possible contacts for a career-changer.

### Additional calibrations from new sections

**CALIBRATION — Sector matrix: application-is-the-gate sectors get the intelligence-only framing.**
When the user's direction is law (large firms), accountancy (Big Four), civil service Fast Stream,
clinical healthcare, or QTS teaching: the advisor's outreach guidance frames every conversation
as intelligence-gathering for a better application, not a route around it. This is an honest,
explicit framing: "In this sector, the process is the process — but talking to someone who's done
it gives your application real depth that most people's lack."

**CALIBRATION — Outreach-is-the-route sectors get urgent, warm framing.**
When the user's direction is media, fashion, creative arts, games (independent studios), early-stage
tech, or charity: the advisor makes clear that building relationships matters more than the
application in this context, and moves the user toward outreach earlier in the conversation than
it would in an application-dominant sector.

**CALIBRATION — The PhD/academic email is an exception to all cold-contact caution.**
For users targeting PhD positions or academic research roles, a direct email to a potential
supervisor about their research is not only acceptable but expected. The message structure differs:
it should demonstrate genuine engagement with the supervisor's published work, propose a specific
research direction, and ask directly whether they are taking students. This is the one context
where an unsolicited email to a senior person is the correct first move and the advisor should
say so clearly.

---

## 14. Known gaps and lower-confidence areas

_This section exists so omissions are visible, not silent — per the research bar (point 8). Every
item here is something this document could not resolve fully from available free primary sources.
A UK domain expert should sanity-check the areas marked with *.**

### Factual gaps (no reliable primary UK source found)

1. **Outreach response rates by UK sector.** No primary UK academic study was found measuring
   informational interview or speculative application response rates broken down by sector. The
   figures in this document (10-20% speculative application success rate; 40-56% personalised
   connection acceptance rate) derive from practitioner estimates and commercial tool analyses.
   They are directionally credible but should not be quoted publicly as hard numbers. A UK
   primary study comparable to the ISE's graduate recruitment survey does not appear to exist
   for outreach specifically.

2. **Regional outreach response rate differences.** No primary data comparing outreach success
   rates in London versus other UK regions was found. The regional differences section (11.4)
   relies on ONS/CIPD/ISE labour market concentration data as a proxy. The directional claim
   (less density of targets outside London) is solid; the magnitude is unknown.

3. **Community-to-employment conversion rates.** No UK study was found measuring what proportion
   of community or event engagement converts to employment outcomes. The communities section (12)
   rests on qualitative practitioner guidance and careers service consensus, not outcome data.

4. **Neurodivergent user outreach outcomes.** No UK primary study was found specifically on
   outreach behaviour, anxiety, or success rates for autistic or ADHD-identified job seekers.
   The guidance in 11.5 reflects CIPD, ACAS, and practitioner consensus, not empirical research
   on this specific population.

5. **Volunteering-to-paid-role conversion rate (charity sector).** The claim that NCVO estimates
   a meaningful proportion of volunteers convert to paid roles is sourced directionally to the
   NCVO Almanac, but an exact conversion rate figure is not stated in the Almanac and should not
   be quoted. *

6. **Career-changer outcomes versus direct-entry outcomes.** No UK study comparing the job-search
   success rate of career-changers using outreach versus formal applications was found. The
   guidance in 11.2 rests on NCS and Prospects practitioner consensus.

### Contested or uncertain areas

7. **The "hidden job market" figure.** As noted in Section 1, the oft-quoted "70-80% of jobs are
   never advertised" figure is unverifiable. The more cautious "30-50% through referral/informal
   routes" is also Tier B. Any speaker or adviser who cites a confident figure here is likely
   inflating it. The honest position: informal routes matter, especially for SMEs, and the
   magnitude is genuinely unknown.

8. **Ageism and mature candidate outcomes.** Age discrimination in UK hiring is documented (Equality
   Act 2010 covers age, CIPD research shows evidence of ageist attitudes) but quantified outcomes
   for "mature" graduate job seekers (25+) are not well-evidenced in primary UK research. The
   guidance to avoid mentioning age in outreach is practitioner consensus, not evidence-based.

9. **UK-specific LinkedIn response rate data.** The LinkedIn acceptance and response rate data
   (40-56% personalised acceptance rate; 10-25% InMail benchmark) derives from Skylead's analysis
   of 13,000+ accounts. This is likely international rather than UK-specific. UK response rates
   may differ from the global benchmark. Treat as directional.

10. **Graduate Route visa conditions in 2026.** Immigration policy is subject to change. The general
    information about the Graduate Route in Section 11.3 was accurate as of mid-2026. This should
    be verified against gov.uk before any advisor reference to it, and the advisor should always
    direct users to gov.uk rather than relying on this document's summary.

11. **The 140:1 figure is large-employer data, not SME.** The ISE applications-per-vacancy figures
    (140 all-sector, higher for IT and finance) come from the ISE's survey of structured large graduate
    employers. They do NOT describe the SME market this document repeatedly directs users toward for
    speculative outreach, where ratios are almost certainly different and harder to measure. The advisor
    should not imply the 140:1 odds apply to a speculative approach to a small company.

### Areas that need a domain expert sanity-check *

- **The five-sentence IB cold email format** (Section 6, finance calibration): sourced to FE Training
  and MergersAndInquisitions, both practitioner sources. An active investment banking recruiter should
  confirm this is still the correct format for 2026 UK/EMEA specifically.

- **Mini-pupillage outreach for barristers** (Section 7, law): sourced to Bar Council and Prospects.
  A practicing barrister or pupillage adviser should confirm norms around cold applications to chambers
  for mini-pupillages.

- **Games industry Twitter/X outreach norms** (Section 7, games): based on UKIE data and practitioner
  observations. An active games hiring manager should confirm that direct social outreach to studio
  leads is still an accepted norm in 2026.

- **Disability Confident scheme employer coverage:** the scheme's coverage and meaningfulness varies
  by employer. A disability employment specialist should assess how reliably Disability Confident
  membership predicts an inclusive recruitment experience.

---

## Where this leaves us — research complete (v2)

**The throughline:** outreach works best when it is warm (alumni, mutual connections), specific (about
the other person, not the user), modest in its ask (a conversation, not a job), and timed correctly
(before a role is posted for SMEs; during formal windows for structured schemes). The AI-saturated inbox
in 2026 makes genuine specificity a greater advantage than it was; the UK cultural register rewards
understatement. The advisor's job is to route the user toward the warmest available contact, help them
write something specific and human, calibrate expectations honestly before they send, and remind them
that one non-response is noise, not a verdict.

**V2 additions:** 24-sector matrix; five edge cases (zero-network, career-changers, international
students, regional, disability); sector-by-sector community and event list; 10 additional hard rules
and defaults; known-gaps section. The advisor now has sector-calibrated outreach guidance for every
direction a user might name.

**Three deliverables this feeds:**
1. **The outreach feature prompt section in ADVISOR_PERSONA.md** — hard rules, strong defaults, and
   calibrations (Section 13), especially the sector-specific calibrations, zero-network branch, and
   the international student signpost rules.
2. **The outreach UI spec** — the advisor co-writes the message, deep-links to LinkedIn search, surfaces
   alumni first, drafts the thank-you after a conversation is confirmed, and names relevant sector
   communities when a user has no network.
3. **The communities feature (future)** — Section 12 is the grounding research for a curated,
   contextually-surfaced UK community and event list aligned to the user's direction.

**Sources used — Tier A (primary and institutional) unless noted:**

_V1 sources (core mechanics, anxiety, message craft, initial sector write-ups):_
- [Prospects.ac.uk — speculative job applications](https://www.prospects.ac.uk/careers-advice/applying-for-jobs/how-to-write-a-speculative-job-application/)
- [Prospects.ac.uk — media sector overview](https://www.prospects.ac.uk/jobs-and-work-experience/job-sectors/media-and-internet/overview-of-the-uks-media-sector/)
- [Prospects.ac.uk — charity graduate jobs](https://www.prospects.ac.uk/jobs-and-work-experience/job-sectors/charity-and-voluntary-work/getting-a-graduate-charity-job/)
- [Oxford University Careers Service — speculative approaches](https://www.careers.ox.ac.uk/making-speculative-approaches)
- [Cambridge Careers — speculative applications](https://www.careers.cam.ac.uk/finding-jobs-work-experience/speculative-applications)
- [Warwick Careers Blog — hidden job market](https://warwick.ac.uk/services/careers/blog/understanding_the_hidden_job_market/)
- [Warwick Careers Blog — speculative applications](https://careersblog.warwick.ac.uk/2023/02/28/what-is-a-speculative-application/)
- [Sheffield Careers — networking and speculative approaches](https://www.sheffield.ac.uk/careers/new-site/student/act/networking)
- [Manchester Careers Service — using LinkedIn](https://www.careers.manchester.ac.uk/findjobs/job-search/linkedin/)
- [Reading Careers Blog — LinkedIn job search](https://blogs.reading.ac.uk/careers/navigating-the-job-search-with-linkedin-advanced-tips-and-techniques/)
- [University of Bristol Careers Blog — graduate job market 2026](https://universityofbristolcareers.blogs.bristol.ac.uk/2026/06/05/beyond-the-headlines-what-the-uk-graduate-job-market-really-looks-like-and-where-the-opportunities-are/)
- [GraduateMentor.uk — can networking help me get a graduate job?](https://graduatementor.uk/careers-advice/can-networking-help-me-get-a-graduate-job/)
- [Yale OCS — sample informational interview emails](https://ocs.yale.edu/resources/sample-emails-requesting-an-informational-interview/)
- [Berkeley Career Engagement — informational interviews](https://career.berkeley.edu/start-exploring/informational-interviews/)
- [HBR — if networking makes you anxious, try this](https://hbr.org/2022/05/if-networking-makes-you-anxious-try-this)
- [National Careers Service — creative and media careers](https://nationalcareers.service.gov.uk/job-categories/creative-and-media)
- [FE Training — investment banking cold email guide](https://www.fe.training/free-resources/investment-banking/the-ultimate-investment-banking-cold-email-guide/)
- [MergersAndInquisitions — IB networking](https://mergersandinquisitions.com/investment-banking/recruitment/networking/)
- [CityInvestmentTraining — UK IB recruiting calendar 2025-26](https://www.cityinvestmenttraining.com/post/investment-banking-recruiting-calendar-uk-europe-2025-26-guide)
- [Fortune/IES — Gen Z job crisis UK, October 2025](https://fortune.com/2025/10/28/gen-z-job-crisis-real-1-2-million-graduates-17000-jobs-uk-ai-labor-market-colleges/)
- [WGU Careers — networking anxiety tips](https://careers.wgu.edu/blog/2024/10/17/networking-nerves-top-10-tips-for-working-with-networking-anxiety/)
- [Indeed UK — alumni networking](https://uk.indeed.com/career-advice/career-development/alumni-networking)
- [ResumeWorded — informational interview email templates](https://resumeworded.com/networking-email-templates/informational-interview-templates/asking-for-informational-interview)
- [Expandi — State of LinkedIn Outreach H1 2026](https://expandi.io/blog/state-of-li-outreach-h1-2026/) _(Tier B — directional only)_
- [Sopro.io — 59 cold outreach statistics 2026](https://sopro.io/resources/blog/cold-outreach-statistics/) _(Tier B — directional only)_
- [Whali.co.uk — average cold email response rate 2026](https://whali.co.uk/blog/cold-email-response-rates-benchmarks) _(Tier B — directional only)_
- [Skylead — LinkedIn connection message templates and acceptance rates](https://skylead.io/blog/linkedin-connection-message-templates/) _(Tier B — directional only)_
- [GoSpaceWalk — alumni network career acceleration](https://www.gospacewalk.com/blog/the-evolution-of-alumni-networks-accelerating-career-success-in-a-digital-age) _(Tier B — directional only)_
- [Reply.io — LinkedIn voice messages 2026](https://reply.io/blog/linkedin-voice-messages/) _(Tier B — directional only)_

_V2 additional sources (sector matrix, edge cases, communities):_
- [ISE — Graduate Recruitment Survey 2024-25](https://ise.org.uk/research)
- [CIPD — UK Working Lives survey 2024-25](https://www.cipd.org/uk/knowledge/reports/uk-working-lives/)
- [CIPD — Disability in the Workplace 2024](https://www.cipd.org/uk/knowledge/reports/disability-employment-report/)
- [Social Mobility Commission — State of the Nation 2024](https://socialmobilitycommission.org.uk/publications/state-of-the-nation-2024/)
- [ONS — Regional Labour Market Statistics 2025](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/regionallabourmarket/latest)
- [gov.uk — Graduate visa](https://www.gov.uk/graduate-visa)
- [gov.uk — Skilled Worker visa](https://www.gov.uk/skilled-worker-visa)
- [gov.uk — Register of Licensed Sponsors](https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers)
- [gov.uk — Disability Confident scheme](https://www.gov.uk/government/collections/disability-confident-campaign)
- [UKCISA — Working in the UK after study](https://www.ukcisa.org.uk/Information--Advice/Working/Working-in-the-UK)
- [ACAS — Disability at work](https://www.acas.org.uk/disability-at-work)
- [NCVO — UK Civil Society Almanac 2025](https://almanac.ncvo.org.uk/)
- [DCMS — Creative Industries Sector Plan 2025](https://www.gov.uk/government/publications/creative-industries-sector-plan)
- [NHS Employers — workforce overview](https://www.nhsemployers.org/workforce-data)
- [HCPC — Registration requirements](https://www.hcpc-uk.org/registration/getting-on-the-register/)
- [GMC — Becoming a doctor in the UK](https://www.gmc-uk.org/education)
- [Social Work England — Registration](https://www.socialworkengland.org.uk/registration/)
- [Skills for Care — Workforce intelligence 2025](https://www.skillsforcare.org.uk/data-and-insight)
- [DfE — Get Into Teaching 2025-26](https://getintoteaching.education.gov.uk/)
- [Law Society — Becoming a solicitor](https://www.lawsociety.org.uk/career-advice/becoming-a-solicitor/)
- [Bar Council — Becoming a barrister](https://www.barcouncil.org.uk/becoming-a-barrister.html)
- [SRA — SQE qualification routes](https://www.sra.org.uk/become-solicitor/sqe/)
- [Prospects.ac.uk — Graduate jobs outside London](https://www.prospects.ac.uk/jobs-and-work-experience/job-sectors/graduate-jobs-outside-london)
- [National Careers Service — Changing careers](https://nationalcareers.service.gov.uk/careers-advice/career-change)
- [ICAEW — ACA training routes](https://www.icaew.com/qualifications/aca)
- [IMechE — Routes into engineering](https://www.imeche.org/career-development)
- [RICS — Becoming a chartered surveyor](https://www.rics.org/profession/pathway-routes/)
- [RIBA — Becoming an architect](https://www.architecture.com/education-cpd-and-careers/how-to-become-an-architect)
- [CIPD — HR careers guide](https://www.cipd.org/uk/careers/hr-careers/)
- [REC — Recruitment Industry Report 2025](https://www.rec.uk.com/our-view/research/recruitment-industry-trends)
- [Civil Service — Fast Stream](https://www.faststream.gov.uk/)
- [CILT — Careers in logistics](https://ciltuk.org.uk/careers)
- [CIMSPA — Sport and physical activity careers](https://www.cimspa.co.uk/careers)
- [UKIE — UK Games Industry Census 2025](https://ukie.org.uk/research)
- [ABPI — Pharmaceutical industry UK](https://www.abpi.org.uk/facts-and-figures/)
- [Royal Society of Chemistry — careers](https://www.rsc.org/careers/)
- [Green Careers Hub — sustainability sector](https://www.greencareershub.com/)
- [Publishers Association — UK Publishing 2025](https://www.publishers.org.uk/publications/)
- [Screenskills — Working in film and TV](https://www.screenskills.com/careers/)
- [NCTJ — Journalism careers guide](https://www.nctj.com/journalism-qualifications/careers-in-journalism/)
- [UKHospitality — Labour Market Report 2025](https://www.ukhospitality.org.uk/research/)
- [Make UK — Manufacturing Skills 2025](https://www.makeuk.org/insights/reports)
- [BRC — Workforce and Skills Report 2025](https://brc.org.uk/research/)
- [National Careers Service — sector career guides](https://nationalcareers.service.gov.uk/explore-careers)
- [Prospects.ac.uk — sector overview pages](https://www.prospects.ac.uk/jobs-and-work-experience/job-sectors) _(all sector pages; individual URLs in section text)_
