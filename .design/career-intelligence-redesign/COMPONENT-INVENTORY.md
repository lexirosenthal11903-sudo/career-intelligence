# Component Inventory — Visual Rebuild (Track 2, Step A)

_Locked Session 42 / captured Step A, 2026-06-21. Source of truth for the React component
build (Steps B–F). Every component below is lifted from the two canonical mockups:_

- **`mockups/ci-split.html`** — returning session: resizable split (chat | closable panel).
- **`mockups/ci-split-first.html`** — first session / **the click** (chat full-width).

**Hard rules for the build:**
- Every visual value is a token from `src/app/globals.css`. No stray hex. (CLAUDE.md contract.)
- All advisor wording comes from `VOICE-IN-UI.md` — never invent copy.
- Amber (`--accent`) appears **only** on: primary button, user chat bubble, active nav, lead markers, pills/badges. Left-border accent cards = banned. Espresso (`--deep`) bottom-only.
- Static in Steps A–B. Data wiring is Steps C–E.
- Split mechanics use **`react-resizable-panels`** (not hand-rolled drag) — see plan §3.

---

## 0. Shell layout

| Token / value | Use |
|---|---|
| `.app` grid `224px 1fr` | left nav fixed 224px, workspace fills rest. `height:100vh`, `overflow:hidden`. |
| `.work` flex | holds chat pane + divider + side pane. |
| `.chat` | `min-width:380px` — **never closable** (hard min). bg `--bg`. |
| `.divider` | 7px, `cursor:col-resize`; rail `--line`, hover/drag `--accent`. (Replaced by `react-resizable-panels` handle.) |
| `.side` | `min-width:340px`, bg `--surface`, `border-left:1px solid --line`. **closable** (× / nav toggle). |
| `closed` state | divider + side hidden; chat fills 100%; content `max-width` caps so it doesn't sprawl. |

States: **open/split** (returning, `ci-split.html`) · **closed** (chat full width) · **first-session** (no panel at all, chat full-width, `ci-split-first.html`).

---

## 1. Left nav

**Brand** — `.brand`: `.logo` 30px rounded square, amber gradient (`--accent`→`--accent-2`), radiant-point SVG (placeholder mark); wordmark "Career Intelligence" (two lines, weight 700). _Name is a working placeholder — see plan Phase 0b._

**Nav item** `.nitem` — icon (18px, `--ink-3`) + label (13.5px, `--ink-2`). States:
- **default** → hover `background:--panel`.
- **active** `.on` → `background:--accent-soft`, text + icon `--accent`, weight 600.
- **locked** `.locked` → `opacity:.42`, `cursor:default` — surface exists but not yet usable (first session: Documents).
- **count badge** `.ct` → amber pill, white text (returning: "Roles 8").
- **new flag** `.new` → uppercase amber "new", no fill (first session: Roles just unlocked at the click).

Items (in order): **Today · Roles · Your direction · Documents · Profile.**
Progressive disclosure: a surface earns its place. First session → Documents `locked`, Roles `new`; no "Recent", no count. Returning → Roles shows count, "Recent" section appears.

**Recent** (returning only) — `.nsec` uppercase label + `.recent` rows: amber star `.st`, bold name, muted descriptor. Hover `--panel`.

**Nav note** (first session only) — `.navnote`, muted: "We've only just met — more of this fills in as we talk."

**User block** `.user` — top-border, `.uav` 32px gradient avatar (initials), name 13px/600 + email 11px `--ink-3`.

---

## 2. Chat header `.ctop`

Sticky-feel bar: `--bg` @ 85% + `backdrop-filter:blur(8px)`, bottom hairline. `.pres` 8px amber presence dot · title "Career Intelligence" · `.s` muted "· here with you" · `.day` mono timestamp (right).
- **closed state**: `.day` hides; **`.reopen`** button appears (amber-soft pill) to bring the panel back.

---

## 3. Recap card `.recap` ("Where we got to")

Returning-session continuity (Kavanah). Plain `--surface` card, `--line` border, `--sh`. **No featured colour** — restraint.
- **Header** `.recap-h`: amber-soft circle icon (check) · bold "Where we got to" · right pill `.pill` amber-soft ("Direction forming").
- **Body** `.recap-b`: intro `<p>` (bold spans `--ink`) → `.rlabel` uppercase muted section labels → `.rlist` bullets (5px amber dot, bold spans).
- Sections: **What's becoming clear** / **What I'm doing next**.
- **Copy:** `VOICE-IN-UI.md` §3 (verbatim pattern; generated per user).

---

## 4. Reveal card `.reveal` — "the click"

The Satori moment (first session). **Same surface treatment as recap** (deliberately not a coloured hero — authority comes from specificity, not decoration).
- **Header** `.reveal-h`: amber-soft circle (radiant-point icon) · bold **"Here's where I see this going"** · pill "Worth exploring".
- **Body** `.reveal-b`: reveal `<p>` (`em` = amber for the user's reflected-back phrase; `b` = `--ink`) → `.rlabel` "Three directions worth exploring" → `.dirs` list.
- **Direction row** `.dir`: numbered chip `.num` (`--panel-2`); **lead** `.dir.lead .num` = amber fill, white. Text `.dt` with bold title + `.lead-tag` amber "The clearest fit."
- UI label is always **DIRECTIONS WORTH EXPLORING** — never "your direction". Directions = observations/possibilities, not a verdict.
- **Copy:** `VOICE-IN-UI.md` §2 (verbatim pattern).

---

## 5. Message bubble `.msg`

- **Advisor** (`.msg`): 28px gradient avatar `.av` (radiant-point icon) + `.bub` — `--surface`, `--line`, asymmetric radius `4px 14px 14px 14px`, `--sh`. `em` inside = amber emphasis.
- **User** (`.msg.me`): row-reversed, right-aligned, max 460–480px. `.av` = `--panel-2` initials; `.bub` = **`--accent` fill, white**, radius `14px 4px 14px 14px`.
- **Stamp** `.stamp` — centered muted day divider ("Yesterday" / "Today").
- **Copy:** advisor lines from `VOICE-IN-UI.md` (opener §1, role-surfacing §4, bridge §2).

---

## 6. Wait bubble `.bub .wait` (first session)

Advisor bubble variant that **replaces the old loading screen** while analysis streams. Muted text + `.dots` (three 5px amber dots @ .5 opacity, to animate as a typing/thinking indicator; respect reduced-motion).
- **Copy (locked):** "Give me a minute with this — I want to read it properly, not skim it." Slow-pipeline fallback: "Still working — this one's taking a bit longer than usual." (`VOICE-IN-UI.md` §1.)

---

## 7. File-attachment chip `.fileatt`

Inside a **user** bubble after a CV drop. Translucent white fill/border (sits on amber bubble), file icon + filename (e.g. "Ellie_Hartley_CV.pdf"). Wire to `/api/extract` in Step E.

---

## 8. Composer `.composer`

Pinned bottom, fades from transparent → `--bg`. Two stacked rows, both `max-width` matched to `.col`:
- **Chips row** `.chips`: `.chip` pills (`--surface`/`--line`), hover → amber border+text. **Lead chip** `.chip.lead` = amber-soft fill + amber border/text (first session: "Show me the first few roles"). Chips are suggested next actions.
- **Input bar** `.cbar`: `.cplus` attach (+) · text input (placeholder "Tell me what you're thinking…") · `.csend` amber send button (up-arrow). `--surface`, `--line`, `--sh`.

---

## 9. Side panel — tab + header (returning)

- **Tab strip** `.side-tabs` on `--panel`; `.stab` = active file-tab look (`--surface`, bottom-connected, sits +1px over header border), icon + label + **`.x` close** (hover `--panel-2`). Closing → shell `closed` state.
- **Panel header** `.side-h`: `.ti` h3 title + `.n` amber-soft count pill ("8 live"); `.sub` muted line ("Ranked by fit · refreshed this morning"); `.hint` panel hint on `--panel` with amber icon.
  - **Hint copy (locked):** "Don't scroll endlessly — just tell me what to change." (`VOICE-IN-UI.md` §5.)
- **Body** `.side-b`: scrolls; `.grp` uppercase group labels ("Strong fit" / "Good fit").

The panel hosts one thing at a time: **roles list**, a **single role** (contact + outreach + skills *inside* it), **direction**, or a **document** — never separate tabs for contacts/skills (plan §2.4).

---

## 10. Job row `.job` (roles list, in panel)

Row: `.jlogo` 40px rounded company tile (solid colour + initial) · `.jmid` (title `.jt` with amber `.dot` for strong picks, company/location/salary `.jc`, fit badge `.jfit`) · **`.jrev` Review** button (right, chevron; hover amber).
- **Fit badge:** `.jfit` (strong) = amber-soft + amber text "Strong fit"; `.jfit.good` = `--panel-2` + `--ink-3` "Good fit". **Labels, never numeric scores.**
- Grouped under `.grp` "Strong fit" / "Good fit". Wire to `/api/jobs` + `/api/score` (Step D).
- Pass/Interested actions + their advisor lines: `VOICE-IN-UI.md` §4.

---

## 11. Chips (shared) `.chip`

Pill action affordances. Default `--surface`/`--line` → hover amber. `.chip.lead` = amber-soft emphasis for the single recommended next step. Used in the composer; labels are contextual next actions, not navigation.

---

## 12. Empty states (per surface)

Plain warm copy, no urgency, no gamification. Verbatim from `VOICE-IN-UI.md` §5:
- **Roles — pre-analysis / nothing-new-today**
- **Your direction — pre-analysis**
- **Documents — empty**
- **Progress — empty** (Progress surface only appears once an application exists — progressive disclosure)

---

## 13. Error voice (locked — `ADVISOR_PERSONA.md`)

Advisor owns every error in first person, never blames the user, never shows raw system text.
- Analysis failure · Chat failure · Lost connection (banner only, no advisor line). Copy in `VOICE-IN-UI.md` "Error voice".

---

## Build order (from plan §4)

B: shell (nav + resizable split, static) → C: conversation pane (wire `/api/chat`) →
D: panel contents (roles `/api/jobs`+`/api/score`; role detail; direction; documents) →
E: first session streamed (`/api/analyse` streaming — the click) → F: progressive disclosure + emotional moments + reduced-motion + AA contrast.
