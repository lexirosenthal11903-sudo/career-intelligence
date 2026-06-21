"use client";

/**
 * Single source of truth for the user's analysis result on the client.
 *
 * Precedence is SERVER-FIRST. Before Step 0 each page read sessionStorage first
 * and only fell back to the server — so a stale or malformed cached copy could be
 * trusted over the real data (the Session 39 crash). Now:
 *
 *   1. /api/results (the `results` table) is authoritative for signed-in users.
 *      When it returns data we refresh the sessionStorage cache to match.
 *   2. sessionStorage is only a fallback — the pre-auth onboarding bridge, where
 *      a just-finished analysis lives before the user has saved/signed in. For
 *      unauthenticated users /api/results returns 401, so we use this path.
 *
 * The cache stays for speed and for the unauthenticated flow, but it is never the
 * authority. Returns null when there is no result anywhere.
 */
const KEY = "analysis-result";

export async function loadAnalysisResult<T = unknown>(): Promise<T | null> {
  // 1. Server — source of truth for signed-in users.
  try {
    const res = await fetch("/api/results");
    if (res.ok) {
      const data = await res.json();
      if (data?.result) {
        try {
          sessionStorage.setItem(KEY, JSON.stringify(data.result));
        } catch {
          /* cache write best-effort */
        }
        return data.result as T;
      }
    }
  } catch {
    /* network/auth error — fall through to the cache */
  }

  // 2. Fallback — pre-auth onboarding bridge held in sessionStorage.
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* malformed cache — treated as no result */
  }

  return null;
}

/** Write the fresh analysis into the session cache (used by the loading screen). */
export function cacheAnalysisResult(result: unknown): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    /* best-effort */
  }
}
