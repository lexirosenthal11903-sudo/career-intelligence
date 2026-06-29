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

interface SavedJob {
  id?: string | number;
  status?: string;
  title?: string;
  company?: string;
}

export function useNavProgress() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<NavUser | null>(null);
  const [recent, setRecent] = useState<RecentRole[]>([]);
  // Total roles the user has taken into Applications — drives the nav count badge.
  const [applicationsCount, setApplicationsCount] = useState(0);

  // Who's here.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      const name = (user.user_metadata?.full_name as string) || user.email || "You";
      const source = name || user.email || "Y";
      setUser({
        name,
        email: user.email ?? "",
        initial: source.trim()[0]?.toUpperCase() ?? "Y",
      });
    });
    return () => { cancelled = true; };
  }, [supabase]);

  // Recent = flagged-interested roles, newest first. Refetch on change.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/save-job");
        if (!res.ok) return;
        const data = await res.json();
        const saved: SavedJob[] = data.jobs || [];
        const interested = saved
          .filter((j) => j.status === "interested" && (j.company || j.title))
          .map((j) => ({
            id: String(j.id ?? `${j.company}-${j.title}`),
            company: j.company || j.title || "",
            title: j.company ? j.title || "" : "",
          }))
          .reverse();
        if (!cancelled) {
          setApplicationsCount(interested.length);
          setRecent(interested.slice(0, 3));
        }
      } catch {
        /* nav "Recent" simply stays empty */
      }
    }
    load();
    window.addEventListener("ci:roles-changed", load);
    return () => {
      cancelled = true;
      window.removeEventListener("ci:roles-changed", load);
    };
  }, []);

  return { user, recent, applicationsCount };
}
