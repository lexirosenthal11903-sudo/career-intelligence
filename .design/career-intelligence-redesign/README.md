# Career Intelligence — Design Redesign

Folder structure (keep it this way; new files go in the right place):

```
career-intelligence-redesign/
├── README.md                  ← this file
├── DESIGN_BRIEF.md            ← design brief (update at session close)
├── INFORMATION_ARCHITECTURE.md
├── SESSION_DECISIONS.md       ← running log of everything confirmed this session (source of truth)
├── TASKS.md
├── mockups/                   ← all working HTML mockups
│   ├── homepage.html              (LOCKED direction)
│   ├── dashboard-language-board.html  (component kit)
│   └── … (one file per screen, descriptive names, no version numbers)
├── reference/                 ← reference screenshots (e.g. Linear) for parity-checking
└── archive/                   ← superseded / pre-session prototypes
```

Conventions:
- **One descriptive filename per screen** (e.g. `roles.html`), iterate in place. Don't accumulate `-v2`, `-v3` copies — when a version is superseded, delete it (keep storage clean).
- **Screenshot tool:** `../tools/shot.js` and `../tools/capture-sections.js`. Scratch screenshots live in `../tools/shots/` (disposable). Keepers (references) go in `reference/`.
- **SESSION_DECISIONS.md is the source of truth** for confirmed design decisions — read it first when resuming.
