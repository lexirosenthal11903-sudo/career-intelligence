# Auth Overlay — Brainstorm
_Status: Complete_
_Session date: 2026-06-10_

## Summary & Key Decisions

### The shape of the auth overlay

Two distinct states — new user and returning user — different heading, different emotional register, same underlying mechanics.

**New user (post-analysis):** Arlo surfaces the invite — "If you want to keep this, log in or sign up to save your results." User clicks, overlay opens. Overlay is stripped down — no pitch, just the form. After sign-up: straight back to their results, now saved.

**Returning user:** Clicks "log in" on the landing page. Overlay opens. Authenticates. Lands directly on the dashboard home — Arlo handles re-orientation from there.

### Auth methods
Google OAuth (primary) + email OTP (secondary). "Continue with Google" as the first option, "or continue with email" below. No password. No OAuth for now beyond Google.

### OTP email
Custom copy via Resend (already set up). Warm, minimal: "Here's your code: [6 digits]. You're almost in." Not a system email.

### Waiting screen
One line: "It takes about 30 seconds to arrive." Removes dead-air anxiety.

### Escape links
- Email step: keep "Continue without signing in" (before any commitment)
- OTP step: remove escape. Replace with "Didn't get it? Resend" only.

### Error states
- Wrong code: "That code didn't match — try again, or resend." Inline, calm.
- Expired code: "That code has expired — we'll send you a fresh one." Auto-resend.

### Arlo on auth
Not present inside the overlay. Arlo is the voice that surfaces the save prompt before the overlay opens. The overlay itself is product UI, not advisor.

### Landing page
Static "sign in / log in" link — no pop-up, no interruption. Auth overlay only appears when the user asks for it.

## Q&A Log

### Q2 & Q3: Where does sign-up trigger — and how?

**Decision: Auth overlay is never uninvited. Always user-initiated.**

Three trigger points:
1. **Landing page** — static "sign in / log in" link (nav or dedicated section). No pop-up. No interruption. User clicks it when they choose.
2. **Post-analysis** — after results appear, a prompt in the UI: "If you like what you see, create an account." User clicks → overlay appears. The framing copy lives here, not inside the overlay.
3. **Returning user** — clicks "log in" on the landing page → goes straight into the sign-in flow.

**Design implication:** Because the post-analysis prompt does the convincing *before* the overlay opens, the overlay itself can be stripped right down — no pitch, just an email field. The overlay is the mechanic; the prompt is the moment.

**Open flag:** UI copy is placeholder for now — directionally right, not final. A dedicated UI copy session needs to be added to the roadmap (Phase 3).

---

### Q4: Is Arlo present on the auth overlay?

**Decision: Arlo is the voice that surfaces the save prompt — not present inside the overlay itself.**

After the analysis, Arlo says something like: "If you want to keep this, log in or sign up to save your results." Practical, not pushy. Arlo invites — the overlay just executes. The auth form itself stays clean and minimal. No Arlo copy inside the modal.

### Q5: OAuth (Google sign-in) — yes or no?

**Decision: Both. Google OAuth + email OTP.**

"Continue with Google" is well-established and reduces friction significantly (most users already logged in). Include both options. Pattern: "Continue with Google" as primary, "or continue with email" below it. Keep the visual hierarchy clear so it doesn't create decision paralysis.

---

### Q10: Error states inside the overlay

**Decision: Calm, product-voice inline errors. No red alerts.**

- Wrong code: "That code didn't match — try again, or resend."
- Expired code: "That code has expired — we'll send you a fresh one." Auto-resend, don't make the user click again.

Both errors feel like the product talking, not a system message.

---

### Q9: "Continue without signing in" — keep on OTP step?

**Decision: Remove from OTP step. Replace with "Resend code" only.**

Keep the escape on the email step (before any commitment — user changed their mind, that's fine).
Remove it from the OTP step — they've already entered their email and requested a code. Offering an escape here undermines the save and loses their results. Replace with "Didn't get it? Resend" only.

---

### Q8: Where does a new user land immediately after sign-up?

**Decision: Back to their results, which now save automatically.**

They authenticated mid-analysis to preserve their results — don't restart the input flow. The account was created to keep what they already did, not to redo it. Results are now saved and the dashboard is available.

---

### Q7: Where does the returning user land after auth?

**Decision: Directly on the dashboard home.**

The dashboard home IS the returning user experience — that's its purpose. Arlo's message there ("Welcome back. Here's where we left off.") handles re-orientation. No extra re-entry screen between auth and the dashboard.

---

### Q6: OTP email copy + waiting screen

**Decision: Custom copy via Resend (already set up). Waiting screen adds a timing expectation.**

OTP email: warm, minimal, product-voice. "Here's your code: [6 digits]. You're almost in." Not a system email.
Waiting screen: one small line — "It takes about 30 seconds to arrive." Removes anxiety from the dead air moment.

---

### Q1: Should new users and returning users see different auth screens?

**Decision: Yes — two distinct screens.**

New user: needs to feel safe handing over their email. The auth moment is pre-Meraki — they haven't committed yet. One line that earns the email before asking for it.

Returning user: already trusts the product. Needs frictionless re-entry. Stripped down — just a welcome back and an email field.

Same underlying mechanics (OTP), different emotional register and copy.

## Open Flags

- **UI copy session missing from roadmap** — voice examples + landing page copy sessions exist in Phase 3, but no dedicated UI copy session (labels, auth screen, button text, onboarding prompts). Needs adding to ROADMAP.md.
