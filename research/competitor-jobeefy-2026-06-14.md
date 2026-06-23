# Competitor Research — Jobeefy.app
_Analysed: 2026-06-14_

## What they are

Canadian job-search copilot. Built in Winnipeg by Jobeefy Labs Inc. Launched March 2026 (~12 weeks ahead of us). Phase 2, 57% complete. Built in public. Small team or solo founder. Geographic focus: Canada only.

## Their full feature set

| Feature | Detail |
|---|---|
| ATS resume scorer | Live score: keywords, format, experience, specificity dimensions |
| Resume tailoring | Job-specific bullet rewrites with diff view |
| Resume version history | Snapshot restore + side-by-side comparison |
| PDF/DOCX export | LaTeX-generated, ATS-safe |
| AI cover letter | Tone control (formal/warm/direct), editor, export |
| LinkedIn optimizer | Headline, About, Experience rewrite + variants |
| Text mock interview | STAR-scored, behavioural/technical/culture-fit questions |
| Voice mock interview | Speak answers, get spoken feedback, realtime audio (paid) |
| Application Kanban | Saved → Applied → Interview → Offer, drag-drop |
| Insights dashboard | Funnel, conversion rates, ATS score distribution |
| Live Canadian jobs | Job Bank feed, refreshed every 30 min |
| LMIA employer search | Searchable approved-employer database |
| NOC 2021 lookup | Full-text across codes and duties |
| ECA pathway guide | Credential recognition recommendations |
| Floating AI assistant | Page-aware Q&A bot |
| Bring your own API key | Encrypted OpenAI/Gemini key storage |
| Salary insights | CAD benchmarks by NOC + city (queued) |
| Saved searches + alerts | Daily digest emails (queued) |
| Mobile app shell | Bottom nav, touch-tuned (queued) |
| Auto-apply queue | Applications sent on your behalf (in progress) |

## Their pricing

| Plan | Price | What you get |
|---|---|---|
| Free Start | £0 | 1 resume, 1 daily tailoring, 1 weekly cover letter, 3 PDF exports |
| Job Hunt Starter | $9.99 CAD/30 days | 5 tailorings, 5 cover letters, 3 ATS scans, 3 text mocks |
| Job Hunt Plus | $19.99 CAD/30 days (most popular) | 20 of everything + 1 voice mock |
| Pro | $29 CAD/month | Fair-use text, 24 voice credits/month, priority queue |
| Voice add-ons | $5.99/mock, $19.99/4, $49.99/10 | Voice mocks only |

Honest positioning — explicitly markets "no fake unlimited." Voice mocks priced as a premium add-on because they cost real money to run.

## Their engineering stack (reconstructed)

- **ATS scoring:** PDF parse → LLM prompt with keyword/format/experience/specificity rubric → structured JSON subscores. Debounced live scoring as you edit.
- **Resume tailoring:** Resume + JD → LLM bullet rewrites → diff view.
- **LaTeX PDF export:** Resume data → LaTeX template (server-side) → pdflatex compilation → ATS-safe PDF. This is the correct approach for ATS compatibility — HTML-to-PDF tools produce unreliable text layers.
- **Voice mock interviews:** Web Audio API recording → OpenAI Whisper (STT) → LLM STAR scoring → OpenAI TTS or ElevenLabs (spoken feedback). 10-min cap per session for cost control.
- **Job Bank feed:** Canada Job Bank public API, polled every 30 min, results cached.
- **LMIA database:** ESDC quarterly CSV dumps ingested into Postgres. Not a live API — batch data.
- **Application Kanban:** Status column on applications table. react-beautiful-dnd or dnd-kit for drag-drop. Insights are SQL GROUP BY queries.
- **Floating AI assistant:** Current page type + user resume injected as system prompt context. Standard chat completion.
- **Version history:** Timestamped snapshots on every save. Side-by-side diff is text comparison.
- **Bring your own API key:** AES-256 encrypted key storage in database, decrypted at request time.

## Their design & UX

- Clean functional SaaS. Utility-first. No emotional personality.
- Dashboard-centric workspace.
- Streak mechanic on dashboard home (gamification). Not right for our product.
- "Do Next" task list on dashboard home — proactive, deadline-aware, company-specific.
- Copy: direct, practical, Canadian-specific. No emotional depth. No companion.
- No equivalent to Arlo. Their floating assistant is a FAQ bot, not a companion.

## Their go-to-market

- SEO-heavy blog: NOC guides, LMIA explainers, Canadian resume format, interview question banks. This is their acquisition channel.
- "Built in public" — open roadmap as trust signal.
- Free tier as top-of-funnel with strict limits.
- Ad-supported free tier (cookie consent reveals ads fund the free layer).
- No meaningful public review trail found (too new, niche market).

## Where we are clearly differentiated

| Dimension | Jobeefy | Career Intelligence |
|---|---|---|
| Core premise | Fix your application (assumes you know what you want) | Discover your direction (starts before you know) |
| Target user | Canadian job seeker who knows their field | UK graduate/early-career who doesn't know where to start |
| Emotional register | Transactional, utility-first | Warm, companion-like, anxiety-aware |
| AI advisor | Page-aware FAQ bot | Arlo — present on every screen, half the product |
| Identity discovery | None | Core pipeline: CV → direction → role titles → fit |
| Values matching | Not present | Company values → user values alignment |
| Design bar | Functional SaaS | Resend/Linear/Craft aesthetic — considerably higher |
| Geographic scope | Canada-specific | UK-first (Adzuna + Reed) |

## What's incorporated into our roadmap (2026-06-14)

- Glassdoor data (expanded with specific use cases — Phase 4)
- UK salary benchmarks two-step approach (Phase 4)
- Direction evolution tracking (Phase 4)
- Email alerts for new role matches via Resend (Phase 4)
- Voice interview practice with Arlo — Web Speech API MVP approach (Phase 5)
- Application funnel analytics — gated to 10+ applications (Phase 5)
- Auto-apply noted in Phase 6+ with Lexi's interest flagged

## What we actively decided NOT to adopt

- Streak mechanic — wrong register for anxious user (confirmed by Lexi 2026-06-14)
- Bring-your-own API key — not our user type
- ATS keyword scoring as primary metric — different philosophy (direction-fit, not keyword-fit)
- Canadian-specific features (NOC, LMIA, ECA) — wrong market
- Auto-apply — parked for future legal + product session, not before Phase 6
