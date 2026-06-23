import WorkspaceShell from "./WorkspaceShell";
import { getAuthedUser } from "@/lib/supabase/server";

/* Entry to the product. The variant decides which conversation the user gets:
   - "first"     → the discovery → reveal "click" (a user who hasn't been read yet)
   - "returning" → the workspace + live conversation (a user who has a real read)

   The decision is based on whether the user has actually been READ — a completed
   analysis — not on account age. (The old timing heuristic permanently trapped
   anyone with an existing account, including the founder, on the returning path,
   so they never saw discovery again.) */
export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;

  // Explicit first session — the homepage CTA and logged-out first-timers. Always wins.
  if (view === "first") return <WorkspaceShell variant="first" />;

  const { user, supabase } = await getAuthedUser();

  // Logged out with no explicit view — keep the workspace default (chat gates to sign-in).
  if (!user) return <WorkspaceShell variant="returning" />;

  // Has a saved analysis → they've been read → workspace.
  const { data } = await supabase
    .from("results")
    .select("created_at")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (data) return <WorkspaceShell variant="returning" />;

  // Authed, but nothing saved server-side yet. A completed analysis may still exist
  // client-side (finished pre-auth, not yet persisted) — let the client resolve so we
  // neither strand a just-signed-up user nor skip discovery for a genuine first-timer.
  return <WorkspaceShell variant="resolve" />;
}
