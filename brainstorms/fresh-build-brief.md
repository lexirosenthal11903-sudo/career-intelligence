# Fresh-eyes build brief — paste into a blank chat

> Paste everything below the line into a brand-new conversation that has no
> knowledge of this project. It describes only what the product *does* — no
> layout or visual decisions — so you get a genuinely fresh perspective.

---

I want you to design and build a working front-end prototype of a product, from a
blank page. I'm deliberately telling you only what the product *does* and who it's
for — **not** how it should look or how the screens should be laid out. Those
decisions are yours to make. Bring real design judgement and a point of view.

## What the product is

It's a **career mentor you talk to**. Not a job board, not a CV tool, not an
"AI assistant." The closest real-world analogy is having one brilliant, warm
mentor who genuinely knows you, has time for you, and helps you work out what to
do with your working life — and then actually helps you do it.

**The mentor is the product.** It has a single name and *is* the thing you talk
to (like a person, not a feature). The whole experience is the relationship with
this mentor. Everything else — job listings, skills, applications — is something
the mentor brings out when it's useful, not a separate tool you operate. If a
screen ever feels like "a dashboard with a chatbot bolted on," it's wrong.

(The mentor's name is undecided — use a warm placeholder like "the mentor" or a
name of your choosing.)

## Who it's for, and how they feel

A graduate or early-career person (early 20s) who is **at a crossroads and
genuinely doesn't know what they want.** They're anxious, a bit lost, and tired
of advice that could apply to anyone. They can't "search for a job" yet because
they don't even know what they're looking for. The emotional job of the product
is to take someone from *lost and overwhelmed* to *clear and moving with
intention.* Calm, grounded hope — never hype, never cheerleading.

## The emotional arc (the spine of the whole thing)

1. **Arrive whole** — the person shows up with their messy, whole self.
2. **The click** — something clicks; a direction becomes visible. This is the
   pivotal emotional moment. Design for it.
3. **Move with intention** — they start taking real, specific steps, not flailing.

## What the product actually does

The mentor takes someone through this, conversationally:

1. **Listens to their background** — they talk about what they've studied/done
   and what's on their mind, or hand over a CV. Conversational, not a form.
2. **Infers a direction** — reflects back what it sees: not a verdict, but
   "here's where I think this could go." A *direction* = who they could become,
   not just a job title.
3. **Suggests role types**, then surfaces **real, live job listings ranked by how
   well they fit** the person (not by recency or keyword match).
4. **Matches them to companies** whose values fit, and can point to a **specific
   person to contact** and draft a **personalised outreach message.**
5. **Maps the skills gap** — what they already bring, and what's worth building.
6. **Gives a few concrete next actions** — small, specific, doable. Not a to-do
   firehose.

Crucially, the person must be able to **browse the actual job matches** when they
want to — a real, scannable list with fit, salary, company — even though the
mentor also raises roles naturally in conversation. Don't hide the jobs; don't
make them the homepage either.

## How the mentor behaves

- **It speaks first.** When you open it, the mentor initiates with something
  specific and earned ("I went back over what you said about X — here's a role
  that sits right on it"), never an empty "How can I help?"
- **It remembers.** One continuous relationship and memory — not a fresh, amnesiac
  chat each visit.
- **It reflects you back** in your own words. Voice: warm, direct, economical,
  always "I" and "you." Never generic advice. Never AI jargon ("AI-powered",
  "seamless", "leverage", "unlock").
- **It's a daily companion**, not a one-time tool. Returning should feel like
  value compounding: new roles matched, the direction getting sharper, the mentor
  knowing you better. **No gamification** — no streaks, points, badges. The reward
  is genuine progress, not mechanics.

## Principles

- **Quality over quantity.** The goal is *fewer, better* applications and real
  clarity — never volume or busywork metrics.
- **Desktop-first.**
- **It must feel human and premium**, like a considered product from a great
  studio — not a generic SaaS template and not a toy chatbot.

## Quality bar — hard "do not" list

I want a real, owned aesthetic, not the default look every AI product converges
on. **None of these may appear:**

- Grain/noise overlays, gradient-mesh backgrounds, glassmorphism (frosted-glass
  purple panels)
- Default "AI startup" type: Inter / Space Grotesk / Syne as the headline font,
  or a mono font (DM Mono etc.) on every label
- Section numbers as decoration (01 / 02 / 03), marquee/ticker scrolling bars
- Stagger-fade animation on every element on load; rotating gear/orbit/fan
  animations; animated SVG "watermarks"
- Neon-on-near-black "dark mode AI" palette
- Copy clichés: "AI-powered", "seamless", "leverage", "unlock", "supercharge",
  "your journey", and the words "precision / craft / bespoke / considered"
  stacked together

## Traps specific to this product (avoid by default)

- **Do not** default to a generic centred chat box (ChatGPT/Claude style) and
  call it the design. The conversation is central, but the *interface* should be
  a considered product, not a chat window.
- **Do not** give the mentor a cartoon avatar, mascot, or smiley face. It has
  *presence* and an identity, but it is not a costumed character.
- **Do not** open with a giant empty input field as the hero. The mentor speaks
  first; design for that.
- **Do not** make it look clinical or corporate. This person is anxious — the
  feeling is a calm, warm room, not a medical portal or a SaaS dashboard.

## Get these moments right

- **The "click"** (when the direction first becomes visible) is the emotional
  peak — give it real design weight, not a card that scrolls by.
- **The return** — opening it again on a normal day should feel like value has
  compounded and the mentor remembers you.
- **The anxious low-point** — there will be moments the person feels stuck or
  defeated; the product should feel steadying there, never chirpy.

## What I want from you

1. Decide the **structure and the screens** yourself. What does someone land on?
   How do they start? How does the mentor present a direction, and the jobs?
2. **Commit to a specific visual point of view** and *name your references*
   (real brands/products/movements) before you build — I don't want the
   statistical-average "AI app" look. Make a real aesthetic choice and justify it.
3. **Build it** as a working static front-end prototype (HTML/CSS, light JS for
   interaction is fine) covering the core flow end to end, with realistic content
   — invent a believable example user and real-sounding roles.
4. Make the **mentor relationship the unmistakable main event.**

Start by telling me, briefly, the concept and references you've chosen and the
screens you'll build — then build it.
