"use client";

/* Left-nav progressive disclosure data (returning view).
   Two real signals so the nav reflects the relationship, not a mock-up:
     - who's here   → the user block (name / email / initial), from Supabase auth.
     - "Recent"     → the roles the user has flagged interested, newest first.
   "Recent" refetches when a role is flagged/passed (the `ci:roles-changed` event the
   side panel emits), so it stays in step without a reload. A surface that has no
   content yet simply doesn't appear — the section earns its place. */
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { displayNameForUI } from "@/lib/user-state";

export interface NavUser {
  name: string;
  email: string;
  initial: string;
}

export interface RecentRole {
  id: string;
  company: string;
  title: string;
}

export function useNavProgress() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<NavUser | null>(null);
  const [recent, setRecent] = useState<RecentRole[]>([]);
  // Total roles the user has taken into Applications — drives the nav count badge.
  const [applicationsCount, setApplicationsCount] = useState(0);

  // Who's here. The name a stored preferredName ("Lexi") always wins over the formal
  // signup name ("Alexandra"), so the nav can't say one thing while the advisor says
  // another (STATE-SYNC-AUDIT #3). Falls back to the full name, then email.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: { user } }, res] = await Promise.all([
        supabase.auth.getUser(),
        fetch("/api/profile").catch(() => null),
      ]);
      if (cancelled || !user) return;
      let preferredName = "";
      if (res && res.ok) {
        try {
          const d = await res.json();
          preferredName = typeof d?.profile?.preferredName === "string" ? d.profile.preferredName : "";
        } catch { /* ignore, fall back to the signup name */ }
      }
      const fullName = (user.user_metadata?.full_name as string) || "";
      const name = displayNameForUI(preferredName, fullName) || user.email || "You";
      const source = name || user.email || "Y";
      if (cancelled) return;
      setUser({
        name,
        email: user.email ?? "",
        initial: source.trim()[0]?.toUpperCase() ?? "Y",
      });
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  // Recent + count come from the real Applications board (saved_applications), so the
  // nav reflects LIVE applications only — a closed/rejected role drops out of both the
  // count and Recent, matching what the user sees on the board. Newest first.
  useEffect(() => {
    let cancelled = false;
    const CLOSED = new Set(["rejected", "archive"]);
    async function load() {
      try {
        const res = await fetch("/api/applications");
        if (!res.ok) return;
        const data = await res.json();
        type AppRow = { job_id?: string | number; stage?: string; job_data?: { company?: string; title?: string } };
        const apps: AppRow[] = data.applications || [];
        const live = apps
          .filter((a) => !CLOSED.has(a.stage ?? "saved"))
          .map((a) => {
            const jd = a.job_data ?? {};
            return {
              id: String(a.job_id ?? `${jd.company}-${jd.title}`),
              company: jd.company || jd.title || "",
              title: jd.company ? jd.title || "" : "",
            };
          })
          .filter((r) => r.company || r.title);
        if (!cancelled) {
          setApplicationsCount(live.length);
          setRecent(live.slice(0, 3));
        }
      } catch {
        /* nav "Recent" simply stays empty */
      }
    }
    load();
    // Refetch when a role is flagged/passed in the panel (ci:roles-changed) AND when
    // the advisor saves a role, moves a stage, or a role is removed from the
    // conversation/board (ci:application-changed) — otherwise the nav count drifts
    // out of step with the Applications board after any chat-driven change.
    window.addEventListener("ci:roles-changed", load);
    window.addEventListener("ci:application-changed", load);
    return () => {
      cancelled = true;
      window.removeEventListener("ci:roles-changed", load);
      window.removeEventListener("ci:application-changed", load);
    };
  }, []);

  return { user, recent, applicationsCount };
}
