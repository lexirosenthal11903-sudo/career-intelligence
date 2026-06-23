"use client";

/* Panel jobs — real listings for the workspace side panel.

   STABILITY MODEL (Session 41): a signed-in user's job set is PERSISTED server-side
   (`matched_jobs`, via /api/matched-jobs) so it does NOT reshuffle every login. The
   expensive orchestration (Adzuna + Reed fetch → Haiku scoring) stays client-side as
   before, to respect the Vercel Hobby budget; only the result is persisted.

     - Signed in, stored set matches the current keyword hash → use it (stable).
     - Keyword hash changed (direction revised) → rebuild + POST 'replace'.
     - Stored set > 24h old → fetch, diff against stored ids, surface 1–2 genuinely
       NEW listings, POST 'add' (real per-day detection).
     - Not signed in → unchanged: fetch + 30-min sessionStorage cache.

   Returns jobs ranked by fit; grouping into Strong/Good fit happens in the panel. */
import { useCallback, useEffect, useState } from "react";
import { loadAnalysisResult } from "@/lib/analysisResult";

export interface PanelJob {
  id: string | number;
  title: string;
  company: string;
  location: string;
  salary: string;
  datePosted: string;
  description: string;
  applyUrl: string;
  workStyle: string;
  keyword: string;
  relevanceScore?: number;
  relevanceReason?: string;
  isNew?: boolean;
}

export interface AnalysisProfile {
  summary?: string;
  suggestedDirections?: Array<{ title: string; why: string }>;
  topRoleTitles?: string[];
  searchKeywords?: string[];
  locationSearch?: string;
  seniorityLevel?: string;
  extractedSkills?: string[];
  extractedSectors?: string[];
}

interface AnalysisResult {
  profile?: AnalysisProfile;
}

const CACHE_KEY = "cached-jobs"; // unauthenticated fallback only
const DAY_MS = 24 * 60 * 60 * 1000;

/* Stable hash of the inputs that define a job set. When any of these change the
   stored set is rebuilt; otherwise it is reused verbatim (the stability guarantee). */
function keywordHash(p: AnalysisProfile): string {
  const basis = [
    [...(p.searchKeywords || [])].map((k) => k.toLowerCase().trim()).sort().join("|"),
    (p.locationSearch || "").toLowerCase().trim(),
    (p.seniorityLevel || "").toLowerCase().trim(),
  ].join("::");
  let h = 5381;
  for (let i = 0; i < basis.length; i++) h = ((h << 5) + h + basis.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function usePanelJobs() {
  const [profile, setProfile] = useState<AnalysisProfile | null>(null);
  const [hasResult, setHasResult] = useState<boolean | null>(null); // null = still loading
  const [jobs, setJobs] = useState<PanelJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(false);

  // ── Pure fetch + score for a profile (no state writes) ─────────────────────
  const fetchAndScore = useCallback(async (p: AnalysisProfile): Promise<PanelJob[]> => {
    const keywords = p.searchKeywords;
    if (!keywords?.length) return [];
    const location = p.locationSearch;
    const sectors = p.extractedSectors;
    const seniority = p.seniorityLevel;

    const [adzunaRes, reedRes] = await Promise.all([
      fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, location: location || "", seniority }),
      }),
      fetch("/api/reed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, location: location || "", sectors }),
      }),
    ]);

    if (!adzunaRes.ok) throw new Error("jobs fetch failed");
    const { jobs: adzunaJobs } = await adzunaRes.json();
    const { jobs: reedJobs } = reedRes.ok ? await reedRes.json() : { jobs: [] };

    // Dedupe by normalised title+company across both sources.
    const seen = new Set<string>();
    const combined: PanelJob[] = [];
    for (const job of [...(adzunaJobs || []), ...(reedJobs || [])]) {
      const key = `${(job.title || "").toLowerCase().trim()}|${(job.company || "").toLowerCase().trim()}`;
      if (!seen.has(key)) { seen.add(key); combined.push(job); }
    }
    if (!combined.length) return [];

    try {
      const scoreRes = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: combined, profile: p }),
      });
      return scoreRes.ok ? ((await scoreRes.json()).jobs || combined) : combined;
    } catch {
      return combined;
    }
  }, []);

  // ── Unauthenticated fallback: fetch + 30-min sessionStorage cache ──────────
  const fetchWithCache = useCallback(async (p: AnalysisProfile) => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { jobs: cachedJobs, ts } = JSON.parse(cached);
        if (Date.now() - ts < 30 * 60 * 1000 && cachedJobs?.length) { setJobs(cachedJobs); return; }
      }
    } catch { /* ignore */ }

    setJobsLoading(true);
    setJobsError(false);
    try {
      const result = await fetchAndScore(p);
      setJobs(result);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ jobs: result, ts: Date.now() })); } catch { /* ignore */ }
    } catch {
      setJobsError(true);
    } finally {
      setJobsLoading(false);
    }
  }, [fetchAndScore]);

  // ── Once-a-day detection: surface 1–2 genuinely new listings ───────────────
  const dailyDetect = useCallback(async (p: AnalysisProfile, hash: string, stored: PanelJob[]) => {
    try {
      const fresh = await fetchAndScore(p);
      const storedIds = new Set(stored.map((j) => String(j.id)));
      const newOnes = fresh.filter((j) => !storedIds.has(String(j.id))).slice(0, 2);
      if (newOnes.length) {
        await fetch("/api/matched-jobs", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", keywordHash: hash, jobs: newOnes }),
        });
        const flagged = newOnes.map((j) => ({ ...j, isNew: true }));
        const newIds = new Set(flagged.map((j) => String(j.id)));
        setJobs((prev) => [...flagged, ...prev.filter((j) => !newIds.has(String(j.id)))]);
      } else {
        await fetch("/api/matched-jobs", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "touch" }),
        });
      }
    } catch { /* daily detection is best-effort; the stable set still shows */ }
  }, [fetchAndScore]);

  // ── Persistence path (signed-in users) ─────────────────────────────────────
  const loadPersisted = useCallback(async (p: AnalysisProfile) => {
    const hash = keywordHash(p);
    let res: Response;
    try {
      res = await fetch("/api/matched-jobs");
    } catch {
      await fetchWithCache(p); return;
    }
    if (res.status === 401) { await fetchWithCache(p); return; } // not signed in
    if (!res.ok) { await fetchWithCache(p); return; }

    const { jobs: stored, keywordHash: storedHash, lastRefreshed } = await res.json();

    // Stable hit: stored set matches current keywords → use it verbatim.
    if (storedHash === hash && Array.isArray(stored) && stored.length) {
      setJobs(stored);
      if (!lastRefreshed || Date.now() - new Date(lastRefreshed).getTime() > DAY_MS) {
        dailyDetect(p, hash, stored); // non-blocking
      }
      return;
    }

    // No set, or keywords changed → build fresh and persist.
    setJobsLoading(true);
    setJobsError(false);
    try {
      const fresh = await fetchAndScore(p);
      setJobs(fresh);
      if (fresh.length) {
        await fetch("/api/matched-jobs", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "replace", keywordHash: hash, jobs: fresh }),
        });
      }
    } catch {
      setJobsError(true);
    } finally {
      setJobsLoading(false);
    }
  }, [fetchAndScore, fetchWithCache, dailyDetect]);

  // Server-first load of the analysis result, then jobs.
  const load = useCallback(async () => {
    const result = await loadAnalysisResult<AnalysisResult>();
    const p = result?.profile ?? null;
    setProfile(p);
    setHasResult(!!result);
    if (p) await loadPersisted(p);
  }, [loadPersisted]);

  // Mark the new-role badges seen (called by the panel once the user views them).
  const markSeen = useCallback(async () => {
    setJobs((prev) => prev.map((j) => (j.isNew ? { ...j, isNew: false } : j)));
    try {
      await fetch("/api/matched-jobs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seen" }),
      });
    } catch { /* best-effort */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadAnalysisResult<AnalysisResult>();
      if (cancelled) return;
      const p = result?.profile ?? null;
      setProfile(p);
      setHasResult(!!result);
      if (p) await loadPersisted(p);
    })();

    // The advisor can revise directions/keywords mid-conversation; when it does it
    // emits `ci:analysis-changed`. Re-read the analysis and re-evaluate — the new
    // keyword hash won't match the stored set, so the set rebuilds.
    function onAnalysisChanged() { load(); }
    window.addEventListener("ci:analysis-changed", onAnalysisChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("ci:analysis-changed", onAnalysisChanged);
    };
  }, [loadPersisted, load]);

  const retry = useCallback(() => { if (profile) loadPersisted(profile); }, [profile, loadPersisted]);

  // Only ever surface genuine fits. The scorer deprioritises senior roles (caps
  // them at 2) but they were still appearing at the bottom of the list — and a
  // stored set loads verbatim, so a senior role persisted across logins
  // (walkthrough G). Filter at the display boundary so it's fixed for both fresh
  // and already-stored data: drop low-relevance results, and for junior/entry/
  // career-changer profiles drop anything with a senior title outright.
  const isJunior = /graduate|junior|entry.?level|early.?career|intern|assistant|trainee|career.?chang|pivot|transition/i.test(
    profile?.seniorityLevel || ""
  );
  const SENIOR_TITLE = /\b(senior|director|head of|vp|vice president|principal|lead|chief|manager)\b/i;
  const visibleJobs = jobs.filter((j) => {
    if (j.relevanceScore != null && j.relevanceScore < 4) return false;
    if (isJunior && SENIOR_TITLE.test(j.title || "")) return false;
    return true;
  });

  return { profile, hasResult, jobs: visibleJobs, jobsLoading, jobsError, retry, markSeen };
}
