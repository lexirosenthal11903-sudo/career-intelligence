"use client";

/* The returning "Where we got to" recap (VOICE-IN-UI §3) — real, per-user, generated
   server-side from the analysis + the workspace conversation and cached in Supabase.
   `recap` is null until loaded, and stays null for users with no analysis yet (the
   card simply doesn't render) or if generation fails — never a broken/fake card. */
import { useEffect, useState } from "react";

export interface Recap {
  greeting: string;
  becomingClear: string[];
  doingNext: string[];
}

export function useRecap() {
  const [recap, setRecap] = useState<Recap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/recap");
        if (!cancelled && res.ok) {
          const data = await res.json();
          setRecap(data?.recap ?? null);
        }
      } catch {
        /* leave recap null — the card just doesn't show */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { recap, loading };
}
