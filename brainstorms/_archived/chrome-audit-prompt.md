# Chrome Audit Prompt — Brainstorm
_Status: In progress_

## Summary & Key Decisions

- **Test account:** Use lexi.rosenthal11903@gmail.com (Google OAuth). Lexi is comfortable with this — data is expendable.
- **Auth-first rule:** Prompt must start with a mandatory Step 0 that signs in AND verifies real data appears before proceeding.
- **Session 31 context:** 9 bugs fixed in this session (committed bd6f07e). Outstanding: Arlo unauthenticated chat shows no sign-in button — dead end. Still needs fixing.
- **Auth flow gap (undecided):** User who generates results then logs in with an EXISTING account — their new analysis overwrites the old one in Supabase (save-result upserts). Was never explicitly product-decided. For now: intentional (fresh start), but worth flagging in the audit.

## Q&A Log

**Q1: Who should Claude be logged in as for the audit? Risk of using real account?**
A: lexi.rosenthal11903@gmail.com. Lexi is comfortable — data is expendable. No need for separate test account.
Decision: Use real account. Prompt must use this email explicitly.

**Q2 (pending): What are the 4 auth scenarios the audit must cover?**
Identified by Lexi:
1. User who already has an account → logs in → sees prior data
2. User who generates results → signs up (new account) → what happens?
3. User who generates results → logs in with EXISTING account → what happens?
4. User who generates results → doesn't log in at all

**Q3 (pending): What fixes from this session need to be verified in the audit?**
From commit bd6f07e (2026-06-16):
- Applications loading (catch + error state + middleware fix)
- Direction card in Applications (all directions, correct label)
- Arlo bubbles (no more merging)
- Sidebar email truncation
- Profile preference defaults removed
- Arlo system prompt (no fake UI actions)
- Login modal copy
- Interested button error logging

**Q4 (pending): What's the right structure for the prompt — linear walkthrough vs scenario-based?**

**Q5 (pending): What should the report format look like?**

## Open Flags

- Arlo unauthenticated chat: says "sign in first" but no button/link — dead end. FIX BEFORE AUDIT.
- Auth flow for existing user running new analysis (overwrites old results) — not product-decided. Note in audit.
- Staging URL: needs to be fetched fresh from Vercel each time (prompt should instruct this)
- The audit prompt should be saved somewhere permanent (not just brainstorm) so it can be rerun. Suggest: `research/audit-prompt.md`
