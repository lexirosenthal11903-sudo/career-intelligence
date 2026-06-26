"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import s from "./roles.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadAnalysisResult } from "@/lib/analysisResult";
import { useArloChat } from "@/hooks/useArloChat";
import { ArloMessage } from "@/components/ArloMessage";

const ARLO_42 = `<svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><line x1="2" y1="40" x2="78" y2="40" stroke="#F5E9DD" stroke-width="1.6" opacity="0.5"/><ellipse cx="40" cy="40" rx="14" ry="38" stroke="#F5E9DD" stroke-width="1.6" fill="none" opacity="0.5"/><circle cx="40" cy="40" r="3" fill="#F5E9DD" opacity="0.85"/></svg>`;

const ARLO_16 = `<svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><line x1="2" y1="40" x2="78" y2="40" stroke="#F5E9DD" stroke-width="1.6" opacity="0.5"/><ellipse cx="40" cy="40" rx="14" ry="38" stroke="#F5E9DD" stroke-width="1.6" fill="none" opacity="0.5"/><circle cx="40" cy="40" r="3" fill="#F5E9DD" opacity="0.85"/></svg>`;

const sendIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 7h12M7 1l6 6-6 6" />
  </svg>
);

interface AnalysisProfile {
  summary?: string;
  suggestedDirections?: Array<{ title: string; why: string }>;
  topRoleTitles?: string[];
  searchKeywords?: string[];
  locationSearch?: string;
  seniorityLevel?: string;
  yearsExperience?: string;
  extractedSkills?: string[];
  extractedSectors?: string[];
}

interface AnalysisResult {
  profile?: AnalysisProfile;
}

interface Job {
  id: string;
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

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function RolesPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "listings" ? "listings" : "types";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [tab, setTab] = useState<"types" | "listings">(initialTab);
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { extraMsgs, sendMessage, isLoading: arloLoading, messagesEndRef, hasPrevious, showPrevious, togglePrevious } = useArloChat({
    page: "roles",
    supabase,
    userId,
  });

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [resultLoading, setResultLoading] = useState(true);

  // Jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(false);

  // Interested / passed — keyed by job.id
  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [savingJob, setSavingJob] = useState<Set<string>>(new Set());

  // Filter
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(5);

  // ── Load Arlo visibility + user id ───────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("arlo-visible");
    // Read a persisted UI preference from localStorage on mount — external state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved !== null) setArloVisible(saved !== "false");
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setUserName(user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? null);
        setUserEmail(user.email ?? null);
      }
    });
  }, [supabase]);

  function toggleArlo() {
    setArloVisible((v) => {
      const next = !v;
      localStorage.setItem("arlo-visible", String(next));
      return next;
    });
  }

  // ── Load saved job state ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch("/api/save-job");
        if (!res.ok) {
          console.warn("[save-job GET] status:", res.status);
          return;
        }
        const data = await res.json();
        const savedJobs: Array<{ id: string | number; status?: string }> = (data.jobs || []);
        const interestedIds = new Set(
          savedJobs.filter((j) => j.status === "interested").map((j) => String(j.id))
        );
        const passedIds = new Set(
          savedJobs.filter((j) => j.status === "passed").map((j) => String(j.id))
        );
        setInterested(interestedIds);
        setPassed(passedIds);
      } catch (err) {
        console.warn("[save-job GET] failed:", err);
      }
    })();
  }, [userId]);

  // ── Load analysis result ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setResultLoading(true);
      // Server-first via the shared helper; sessionStorage is only a fallback
      // for the pre-auth onboarding flow.
      const result = await loadAnalysisResult<AnalysisResult>();
      if (result) setAnalysisResult(result);
      setResultLoading(false);
    })();
  }, []);

  // ── Fetch and score jobs once we have the analysis result ─────────────────
  const fetchJobs = useCallback(async (result: AnalysisResult) => {
    const keywords = result.profile?.searchKeywords;
    const location = result.profile?.locationSearch;
    const sectors = result.profile?.extractedSectors;
    const seniority = result.profile?.seniorityLevel;
    if (!keywords?.length) return;

    // Return cached jobs if fetched within the last 30 minutes
    try {
      const cached = sessionStorage.getItem("cached-jobs");
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
      // Run Adzuna and Reed in parallel — Reed only returns results for niche sectors
      const [adzunaRes, reedRes] = await Promise.all([
        fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // No location → nationwide (don't force London); seniority filters the search.
          // roleTitles + sectors drive the relevance fix (phrase + category search).
          body: JSON.stringify({ keywords, roleTitles: result.profile?.topRoleTitles, sectors, location: location || "", seniority }),
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

      // Deduplicate by normalised title+company across both sources
      const seen = new Set<string>();
      const combined: typeof adzunaJobs = [];
      for (const job of [...(adzunaJobs || []), ...(reedJobs || [])]) {
        const key = `${(job.title || "").toLowerCase().trim()}|${(job.company || "").toLowerCase().trim()}`;
        if (!seen.has(key)) { seen.add(key); combined.push(job); }
      }

      if (!combined.length) { setJobs([]); return; }

      // Score and rank all results together
      try {
        const scoreRes = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobs: combined, profile: result.profile }),
        });
        const finalJobs = scoreRes.ok ? ((await scoreRes.json()).jobs || combined) : combined;
        setJobs(finalJobs);
        try { sessionStorage.setItem("cached-jobs", JSON.stringify({ jobs: finalJobs, ts: Date.now() })); } catch { /* ignore */ }
      } catch {
        setJobs(combined);
      }
    } catch {
      setJobsError(true);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch live listings when the analysis changes — async external data, not derivable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (analysisResult) fetchJobs(analysisResult);
  }, [analysisResult, fetchJobs]);

  // ── Interested / Pass ─────────────────────────────────────────────────────
  async function handleInterested(job: Job) {
    if (!userId) {
      // Event handler, not render: a full navigation to the signup gate is intended.
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = "/?signup=required&next=/dashboard/roles";
      return;
    }
    const id = String(job.id);
    setInterested((prev) => new Set([...prev, id]));
    setPassed((prev) => { const n = new Set(prev); n.delete(id); return n; });

    setSavingJob((prev) => new Set([...prev, id]));
    const jobPayload = { ...job, id, status: "interested" };
    try {
      const [saveRes, appRes] = await Promise.all([
        fetch("/api/save-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: id, jobData: jobPayload }),
        }),
        fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: id, jobData: jobPayload }),
        }),
      ]);
      if (!saveRes.ok) {
        console.warn("[save-job POST] status:", saveRes.status, await saveRes.text().catch(() => ""));
      }
      if (!appRes.ok) {
        console.warn("[applications POST] status:", appRes.status, await appRes.text().catch(() => ""));
      }
    } catch (err) {
      console.warn("[handleInterested] failed:", err);
    } finally {
      setSavingJob((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  async function handlePass(job: Job) {
    const id = String(job.id);
    setPassed((prev) => new Set([...prev, id]));

    setSavingJob((prev) => new Set([...prev, id]));
    try {
      await fetch("/api/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, jobData: { ...job, id, status: "passed" } }),
      });
    } catch {
      // Silently fail
    } finally {
      setSavingJob((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  function handleSend() {
    const text = chatValue.trim();
    if (!text) return;
    setChatValue("");
    sendMessage(text);
  }
  function handleChatKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const profile = analysisResult?.profile;
  // Guard against malformed stored analyses where these were saved as a string
  // (older schema) — calling .map on a non-array crashed the whole page.
  const directions = Array.isArray(profile?.suggestedDirections) ? profile.suggestedDirections : [];

  const directionTagline = directions.length
    ? directions.map((d) => d.title).join(" · ")
    : null;

  const filterPills = ["All", "Passed"];

  // Always filter out senior roles and low-scoring jobs — never fall back to showing senior results
  const displayJobs = jobs.filter((j) => !j.relevanceScore || j.relevanceScore >= 4);

  const visibleJobs = displayJobs.filter((j) => {
    const id = String(j.id);
    if (passed.has(id) && !interested.has(id)) return activeFilter === "Passed";
    if (activeFilter === "Passed") return false;
    return true;
  });

  const paginatedJobs = visibleJobs.slice(0, visibleCount);
  const listingCount = displayJobs.filter((j) => !passed.has(String(j.id)) || interested.has(String(j.id))).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={s.shell}>

      {/* ── SIDEBAR ── */}
      <nav className={s.sidebar}>
        <Link href="/" className={s.brand}>Career Intelligence</Link>

        <Link href="/dashboard" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Home
        </Link>
        <Link href="/dashboard/roles" className={`${s.navItem} ${s.active}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Roles
        </Link>
        <Link href="/dashboard/applications" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4V2M15 4V2M3 9h18M9 14h6" />
          </svg>
          Applications
        </Link>
        <Link href="/dashboard/skills" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Skills
        </Link>

        <div className={s.navGap} />

        <Link href="/dashboard/profile" className={s.navProfile}>
          <div className={s.navAv}>{userName ? userName[0].toUpperCase() : "?"}</div>
          <div className={s.navInfo}>
            <div className={s.navName}>{userName ?? "You"}</div>
            <div className={s.navEmail}>{userEmail ?? ""}</div>
          </div>
        </Link>
      </nav>

      {/* ── MAIN ── */}
      <div className={s.main}>

        {/* Topbar */}
        <div className={s.topbar}>
          <span className={s.topbarTitle}>Roles</span>
          <button className={s.arloToggle} onClick={toggleArlo}>
            <span dangerouslySetInnerHTML={{ __html: ARLO_16 }} />
            {arloVisible ? "Hide Arlo" : "Show Arlo"}
          </button>
        </div>

        {/* Content split */}
        <div className={`${s.content}${!arloVisible ? ` ${s.arloHidden}` : ""}`}>

          {/* LEFT: Roles */}
          <div className={s.rolesPanel}>

            {/* Direction card */}
            {resultLoading ? (
              <div className={s.directionCard}>
                <div className={s.directionLabel}>Directions worth exploring</div>
                <div className={`${s.directionTitle} ${s.skeleton}`} style={{ width: "60%", height: "1.4rem" }} />
                <div className={`${s.directionSub} ${s.skeleton}`} style={{ width: "40%", height: "0.85rem", marginTop: "0.5rem" }} />
              </div>
            ) : !analysisResult ? (
              <div className={s.directionCard}>
                <div className={s.directionLabel}>Directions worth exploring</div>
                <div className={s.directionTitle}>Complete your profile to see matches.</div>
                <Link href="/input" className={s.directionCta}>Start your analysis →</Link>
              </div>
            ) : (
              <div className={s.directionCard}>
                <div className={s.directionLabel}>Directions worth exploring</div>
                <div className={s.directionTitle}>{directionTagline || "Directions worth exploring"}</div>
                <div className={s.directionSub}>
                  {directions.length > 0 && `${directions.length} role types matched`}
                  {directions.length > 0 && !jobsLoading && listingCount > 0 && ` · ${listingCount} live listings`}
                  {jobsLoading && " · Loading listings…"}
                </div>
              </div>
            )}

            {/* Tab switcher */}
            <div className={s.tabRow}>
              <button
                className={`${s.tab}${tab === "types" ? ` ${s.tabActive}` : ""}`}
                onClick={() => setTab("types")}
              >
                Role types <span className={s.tabCount}>{directions.length || 0}</span>
              </button>
              <button
                className={`${s.tab}${tab === "listings" ? ` ${s.tabActive}` : ""}`}
                onClick={() => setTab("listings")}
              >
                Live listings{" "}
                <span className={s.tabCount}>
                  {jobsLoading ? "…" : listingCount}
                </span>
              </button>
            </div>

            {/* Panel: Role types */}
            {tab === "types" && (
              <div className={s.roleCards}>
                {resultLoading && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`${s.roleCard} ${s.skeleton}`} style={{ height: "5rem" }} />
                    ))}
                  </>
                )}
                {!resultLoading && directions.length === 0 && (
                  <div className={s.emptyState}>
                    <div className={s.emptyTitle}>No role types yet.</div>
                    <div className={s.emptySub}>Complete your analysis to see matched directions.</div>
                  </div>
                )}
                {!resultLoading && directions.map((role) => (
                  <Link key={role.title} href={`/dashboard/roles/${slugify(role.title)}`} className={s.roleCard}>
                    <div className={s.roleCardBody}>
                      <div className={s.roleCardTitle}>{role.title}</div>
                      <div className={s.roleCardDesc}>{role.why?.split(/[.!?]/)[0]?.trim()}</div>
                    </div>
                    <div className={s.roleCardArrow}>
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6h8M6 2l4 4-4 4" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Panel: Live listings */}
            {tab === "listings" && (
              <>
                <div className={s.filterPills}>
                  {filterPills.map((f) => (
                    <button
                      key={f}
                      className={`${s.fpill}${activeFilter === f ? ` ${s.fpillActive}` : ""}`}
                      onClick={() => { setActiveFilter(f); setVisibleCount(5); }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Loading skeletons */}
                {jobsLoading && (
                  <div className={s.jobs}>
                    {[0, 1, 2, 4].map((i) => (
                      <div key={i} className={`${s.job} ${s.skeleton}`} style={{ height: "9rem" }} />
                    ))}
                  </div>
                )}

                {/* Error */}
                {!jobsLoading && jobsError && (
                  <div className={s.emptyState}>
                    <div className={s.emptyTitle}>Couldn&apos;t load listings.</div>
                    <div className={s.emptySub}>
                      <button className={s.retryBtn} onClick={() => analysisResult && fetchJobs(analysisResult)}>
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                {/* No result */}
                {!jobsLoading && !jobsError && !analysisResult && (
                  <div className={s.emptyState}>
                    <div className={s.emptyTitle}>Complete your analysis first.</div>
                    <div className={s.emptySub}><Link href="/input">Start here →</Link></div>
                  </div>
                )}

                {/* Empty filter result */}
                {!jobsLoading && !jobsError && analysisResult && visibleJobs.length === 0 && (
                  <div className={s.emptyState}>
                    {activeFilter === "Passed" ? (
                      <>
                        <div className={s.emptyTitle}>Nothing passed yet.</div>
                        <div className={s.emptySub}>Roles you pass on will appear here — you can always come back and reconsider.</div>
                      </>
                    ) : jobs.length === 0 ? (
                      <>
                        <div className={s.emptyTitle}>No listings found right now.</div>
                        <div className={s.emptySub}>Live listings update daily. Check back soon.</div>
                      </>
                    ) : (
                      <>
                        <div className={s.emptyTitle}>No listings for this filter.</div>
                        <div className={s.emptySub}>Try a different role type or check back soon.</div>
                      </>
                    )}
                  </div>
                )}

                {/* Jobs list */}
                {!jobsLoading && !jobsError && visibleJobs.length > 0 && (
                  <div className={s.jobs}>
                    {paginatedJobs.map((job) => {
                      const id = String(job.id);
                      const isInterested = interested.has(id);
                      const isSaving = savingJob.has(id);
                      return (
                        <div key={id} className={`${s.job}${isInterested ? ` ${s.jobInterested}` : ""}`}>
                          <div className={s.jobTitleRow}>
                            <div className={s.jobTitle}>{job.title}</div>
                            {isInterested && <span className={s.jobBadge}>Interested</span>}
                            {job.relevanceScore !== undefined && (
                              <span className={s.fitBadge} data-score={job.relevanceScore}>
                                {job.relevanceScore >= 8 ? "Strong fit" : job.relevanceScore >= 6 ? "Good fit" : "Possible fit"}
                              </span>
                            )}
                          </div>
                          <div className={s.jobMeta}>
                            <span className={s.jobCompany}>{job.company}</span>
                            <span className={s.dot} />
                            <span>{job.location}</span>
                            <span className={s.dot} />
                            <span>{job.salary}</span>
                            <span className={s.dot} />
                            <span>{job.datePosted}</span>
                          </div>
                          <div className={s.jobTags}>
                            <span className={s.jobTag}>{job.workStyle}</span>
                          </div>
                          <div className={s.jobDesc}>{job.description}</div>
                          {job.relevanceReason && (
                            <div className={s.jobReason}>{job.relevanceReason}</div>
                          )}
                          <div className={s.jobActions}>
                            {isInterested ? (
                              <Link href="/dashboard/applications" className={s.btnViewApp}>
                                View in Applications →
                              </Link>
                            ) : (
                              <>
                                <button
                                  className={s.btnInterested}
                                  onClick={() => handleInterested(job)}
                                  disabled={isSaving}
                                >
                                  Interested
                                </button>
                                <button
                                  className={s.btnPass}
                                  onClick={() => handlePass(job)}
                                  disabled={isSaving}
                                >
                                  Pass
                                </button>
                                {job.applyUrl && (
                                  <a
                                    href={job.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={s.btnApply}
                                  >
                                    View listing ↗
                                  </a>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!jobsLoading && !jobsError && visibleJobs.length > visibleCount && (
                  <div className={s.loadMore}>
                    <button
                      className={s.btnLoad}
                      onClick={() => setVisibleCount((n) => n + 5)}
                    >
                      Load more listings
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

          {/* RIGHT: Arlo */}
          <div className={`${s.mentorPanel}${!arloVisible ? ` ${s.hidden}` : ""}`}>
            <div className={s.mentorHead}>
              <div className={s.mentorAv} dangerouslySetInnerHTML={{ __html: ARLO_42 }} />
              <div>
                <div className={s.mentorHeadName}>Arlo</div>
                <div className={s.mentorHeadStatus}>{arloLoading ? "Thinking…" : "Here with you"}</div>
              </div>
            </div>

            <div className={s.mentorMessages}>
              {hasPrevious && (
                <button onClick={togglePrevious} style={{ display: "block", margin: "0 auto 8px", fontSize: 11, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {showPrevious ? "Hide previous conversation" : "View previous conversation"}
                </button>
              )}
              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  {directions.length > 0
                    ? `${directions.length} directions matched to your profile. Click into any role type and I'll tell you honestly whether it fits you — and what it would actually take to get there given your background.`
                    : "Once your analysis is complete, I'll show you the roles that fit your background and what it would take to get there."}
                </div>
                {jobs.length > 0 && (
                  <div className={s.aiBubble}>
                    {jobs.length} live listings pulled from Adzuna and Reed and ranked for you. The ones at the top scored highest against your profile — they&apos;re worth looking at first.
                  </div>
                )}
              </div>

              {extraMsgs.map((m, i) =>
                m.role === "divider" ? (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0", color: "var(--ink-3)", fontSize: 11, letterSpacing: ".04em" }}>
                    <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                    <span>New session</span>
                    <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  </div>
                ) : m.role === "user" ? (
                  <div key={i} className={s.userMsg}><div className={s.userBubble}>{m.text}</div></div>
                ) : (
                  <div key={i} className={s.aiMsg}><div className={s.aiBubble}><ArloMessage text={m.text} action={m.action} actions={m.actions} /></div></div>
                )
              )}
              {arloLoading && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble} style={{ opacity: 0.6, fontStyle: "italic" }}>Arlo is thinking…</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={s.mentorInputWrap}>
              <div className={s.mentorInputCard}>
                <input
                  className={s.mentorInput}
                  type="text"
                  placeholder="Ask Arlo about any of these roles…"
                  value={chatValue}
                  onChange={(e) => setChatValue(e.target.value)}
                  onKeyDown={handleChatKey}
                  disabled={arloLoading}
                />
                <button className={s.mentorSend} aria-label="Send" onClick={handleSend} disabled={arloLoading}>
                  {sendIcon}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
