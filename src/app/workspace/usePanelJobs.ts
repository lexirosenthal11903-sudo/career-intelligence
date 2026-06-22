"use client";

/* Panel jobs — the same /api/results → (/api/jobs + /api/reed) → /api/score flow the
   dashboard Roles tab uses (src/app/dashboard/roles/RolesPage.tsx), with the 30-min
   sessionStorage cache. Lifted here so the workspace side panel shows real listings.
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

const CACHE_KEY = "cached-jobs";

export function usePanelJobs() {
  const [profile, setProfile] = useState<AnalysisProfile | null>(null);
  const [hasResult, setHasResult] = useState<boolean | null>(null); // null = still loading
  const [jobs, setJobs] = useState<PanelJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(false);

  // ── Fetch + score jobs for a profile ───────────────────────────────────────
  const fetchJobs = useCallback(async (p: AnalysisProfile) => {
    const keywords = p.searchKeywords;
    const location = p.locationSearch;
    const sectors = p.extractedSectors;
    const seniority = p.seniorityLevel;
    if (!keywords?.length) return;

    // 30-minute sessionStorage cache so the list is stable across navigation.
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { jobs: cachedJobs, ts } = JSON.parse(cached);
        if (Date.now() - ts < 30 * 60 * 1000 && cachedJobs?.length) {
          setJobs(cachedJobs);
          return;
        }
      }
    } catch { /* ignore */ }

    setJobsLoading(true);
    setJobsError(false);
    try {
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

      if (!adzunaRes.ok) { setJobsError(true); return; }
      const { jobs: adzunaJobs } = await adzunaRes.json();
      const { jobs: reedJobs } = reedRes.ok ? await reedRes.json() : { jobs: [] };

      // Dedupe by normalised title+company across both sources.
      const seen = new Set<string>();
      const combined: PanelJob[] = [];
      for (const job of [...(adzunaJobs || []), ...(reedJobs || [])]) {
        const key = `${(job.title || "").toLowerCase().trim()}|${(job.company || "").toLowerCase().trim()}`;
        if (!seen.has(key)) { seen.add(key); combined.push(job); }
      }
      if (!combined.length) { setJobs([]); return; }

      try {
        const scoreRes = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobs: combined, profile: p }),
        });
        const finalJobs: PanelJob[] = scoreRes.ok ? ((await scoreRes.json()).jobs || combined) : combined;
        setJobs(finalJobs);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ jobs: finalJobs, ts: Date.now() })); } catch { /* ignore */ }
      } catch {
        setJobs(combined);
      }
    } catch {
      setJobsError(true);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  // Server-first load of the analysis result, then fetch jobs. All setState runs
  // after an await, so it never fires synchronously inside the effect body.
  const load = useCallback(async () => {
    const result = await loadAnalysisResult<AnalysisResult>();
    const p = result?.profile ?? null;
    setProfile(p);
    setHasResult(!!result);
    if (p) await fetchJobs(p);
  }, [fetchJobs]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadAnalysisResult<AnalysisResult>();
      if (cancelled) return;
      const p = result?.profile ?? null;
      setProfile(p);
      setHasResult(!!result);
      if (p) await fetchJobs(p);
    })();

    // The advisor can revise directions/keywords mid-conversation; when it does it
    // emits `ci:analysis-changed` (after busting the jobs cache). Re-read the analysis
    // and re-fetch jobs so the Direction tab, Roles list and nav count update live.
    function onAnalysisChanged() { load(); }
    window.addEventListener("ci:analysis-changed", onAnalysisChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("ci:analysis-changed", onAnalysisChanged);
    };
  }, [fetchJobs, load]);

  const retry = useCallback(() => { if (profile) fetchJobs(profile); }, [profile, fetchJobs]);

  return { profile, hasResult, jobs, jobsLoading, jobsError, retry };
}
