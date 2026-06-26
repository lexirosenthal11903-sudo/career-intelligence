"use client";

/* Anonymous-auth bootstrap — the sign-up carry-forward fix.
 *
 * The visitor used to use the product (CV, conversation, directions) with no
 * account, held only in sessionStorage and fire-and-forgotten to the server
 * (those calls 401'd while unauthenticated). On sign-up nothing reliably
 * persisted, so the advisor opened against an empty account and treated a
 * just-signed-up user as a stranger.
 *
 * Instead we give them a REAL (anonymous) account the moment they engage, so
 * every save is a normal authed write from second one. On sign-up the email is
 * attached to the SAME account (AuthModal → updateUser), so nothing is "carried
 * forward" — it was always theirs.
 *
 * Created LAZILY (at first-session start, not on page load): CAPTCHA is still
 * deferred, so creating an account on every page hit would let bots/bounces
 * inflate the user table with no protection. The writes that matter happen at
 * the END of the analysis, so creating the session when the user actually starts
 * is both sufficient and strictly safer.
 */

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// One in-flight promise so concurrent callers (start() fires it, the save path
// awaits it) share a single sign-in rather than racing two.
let inflight: Promise<void> | null = null;

/**
 * Ensure there is a Supabase session for this browser. No-op if one already
 * exists (anonymous OR real). Otherwise signs in anonymously. Idempotent and
 * safe to call from multiple places; await it before any authed write to
 * guarantee the cookie is set first.
 */
export function ensureAnonSession(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) return; // already have one — never replace a real account
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      // Allow a later retry; don't trap the app in a failed-bootstrap state.
      inflight = null;
      throw error;
    }
  })();
  return inflight;
}
