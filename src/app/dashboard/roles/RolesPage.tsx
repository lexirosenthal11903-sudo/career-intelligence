"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import s from "./roles.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";

const ARLO_42 = `<svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 31 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 31 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M30 50 Q40 55 50 50" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const ARLO_16 = `<svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 31 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 31 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M30 50 Q40 55 50 50" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

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

function capitalize(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function RolesPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "listings" ? "listings" : "types";
  const supabase = createSupabaseBrowserClient();

  const [tab, setTab] = useState<"types" | "listings">(initialTab);
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const { extraMsgs, sendMessage, isLoading: arloLoading } = useArloChat({
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
    if (saved !== null) setArloVisible(saved !== "false");
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
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
    (async () => {
      try {
        const res = await fetch("/api/save-job");
        if (!res.ok) return;
        const data = await res.json();
        const savedJobs: Array<{ id: string; status?: string }> = (data.jobs || []);
        const interestedIds = new Set(
          savedJobs.filter((j) => j.status === "interested").map((j) => j.id)
        );
        const passedIds = new Set(
          savedJobs.filter((j) => j.status === "passed").map((j) => j.id)
        );
        setInterested(interestedIds);
        setPassed(passedIds);
      } catch {
        // Not signed in — local state only
      }
    })();
  }, []);

  // ── Load analysis result ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setResultLoading(true);
      try {
        // Fast path: sessionStorage (fresh from analysis flow)
        const stored = sessionStorage.getItem("analysis-result");
        if (stored) {
          setAnalysisResult(JSON.parse(stored));
          setResultLoading(false);
          return;
        }
      } catch {
        // sessionStorage unavailable
      }

      // Fallback: Supabase (returning user)
      try {
        const res = await fetch("/api/results");
        if (res.ok) {
          const data = await res.json();
          if (data.result) setAnalysisResult(data.result);
        }
      } catch {
        // Fetch failed — no result available
      }
      setResultLoading(false);
    })();
  }, []);

  // ── Fetch and score jobs once we have the analysis result ─────────────────
  const fetchJobs = useCallback(async (result: AnalysisResult) => {
    const keywords = result.profile?.searchKeywords;
    const location = result.profile?.locationSearch;
    const sectors = result.profile?.extractedSectors;
    if (!keywords?.length) return;

    setJobsLoading(true);
    setJobsError(false);
    try {
      // Run Adzuna and Reed in parallel — Reed only returns results for niche sectors
      const [adzunaRes, reedRes] = await Promise.all([
        fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords, location: location || "london" }),
        }),
        fetch("/api/reed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords, location: location || "london", sectors }),
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
        if (scoreRes.ok) {
          const { jobs: scoredJobs } = await scoreRes.json();
          setJobs(scoredJobs || combined);
        } else {
          setJobs(combined);
        }
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
    if (analysisResult) fetchJobs(analysisResult);
  }, [analysisResult, fetchJobs]);

  // ── Interested / Pass ─────────────────────────────────────────────────────
  async function handleInterested(job: Job) {
    const id = String(job.id);
    setInterested((prev) => new Set([...prev, id]));
    setPassed((prev) => { const n = new Set(prev); n.delete(id); return n; });

    setSavingJob((prev) => new Set([...prev, id]));
    try {
      await fetch("/api/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, jobData: { ...job, id, status: "interested" } }),
      });
    } catch {
      // Silently fail — local state already updated
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
  const directions = profile?.suggestedDirections || [];
  const keywords = profile?.searchKeywords || [];

  const directionTagline = directions.length
    ? directions.map((d) => d.title).join(" · ")
    : null;

  const filterPills = ["All", "Passed"];

  // Filter out irrelevant jobs (score below 4) — only if enough remain, else show all
  const relevantJobs = jobs.filter((j) => !j.relevanceScore || j.relevanceScore >= 4);
  const displayJobs = relevantJobs.length >= 3 ? relevantJobs : jobs;

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
        <a href="/" className={s.brand}>Career Intelligence</a>

        <a href="/dashboard" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Home
        </a>
        <a href="/dashboard/roles" className={`${s.navItem} ${s.active}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Roles
        </a>
        <a href="/dashboard/applications" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4V2M15 4V2M3 9h18M9 14h6" />
          </svg>
          Applications
        </a>
        <a href="/dashboard/skills" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Skills
        </a>

        <div className={s.navGap} />

        <a href="/dashboard/profile" className={s.navProfile}>
          <div className={s.navAv}>L</div>
          <div>
            <div className={s.navName}>Lexi</div>
            <div className={s.navEmail}>lexi@email.com</div>
          </div>
        </a>
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
                <div className={s.directionLabel}>Your direction</div>
                <div className={`${s.directionTitle} ${s.skeleton}`} style={{ width: "60%", height: "1.4rem" }} />
                <div className={`${s.directionSub} ${s.skeleton}`} style={{ width: "40%", height: "0.85rem", marginTop: "0.5rem" }} />
              </div>
            ) : !analysisResult ? (
              <div className={s.directionCard}>
                <div className={s.directionLabel}>Your direction</div>
                <div className={s.directionTitle}>Complete your profile to see matches.</div>
                <a href="/input" className={s.directionCta}>Start your analysis →</a>
              </div>
            ) : (
              <div className={s.directionCard}>
                <div className={s.directionLabel}>Your direction</div>
                <div className={s.directionTitle}>{directionTagline || "Your direction"}</div>
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
                  <a key={role.title} href={`/dashboard/roles/${slugify(role.title)}`} className={s.roleCard}>
                    <div className={s.roleCardBody}>
                      <div className={s.roleCardTitle}>{role.title}</div>
                      <div className={s.roleCardDesc}>{role.why}</div>
                    </div>
                    <div className={s.roleCardArrow}>
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6h8M6 2l4 4-4 4" />
                      </svg>
                    </div>
                  </a>
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
                    <div className={s.emptyTitle}>Couldn't load listings.</div>
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
                    <div className={s.emptySub}><a href="/input">Start here →</a></div>
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
                        <div className={s.emptySub}>Check back soon — Adzuna updates daily.</div>
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
                              <a href="/dashboard/applications" className={s.btnViewApp}>
                                View in Applications →
                              </a>
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
              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  {directions.length > 0
                    ? `${directions.length} directions matched to your profile. Click into any role type and I'll tell you honestly whether it fits you — and what it would actually take to get there given your background.`
                    : "Once your analysis is complete, I'll show you the roles that fit your background and what it would take to get there."}
                </div>
                {jobs.length > 0 && (
                  <div className={s.aiBubble}>
                    {jobs.length} live listings pulled from Adzuna and Reed and ranked for you. The ones at the top scored highest against your profile — they're worth looking at first.
                  </div>
                )}
              </div>

              {extraMsgs.length > 0 && (
                <>
                  {extraMsgs.map((m, i) =>
                    m.role === "user" ? (
                      <div key={i} className={s.userMsg}><div className={s.userBubble}>{m.text}</div></div>
                    ) : (
                      <div key={i} className={s.aiMsg}><div className={s.aiBubble}>{m.text}</div></div>
                    )
                  )}
                </>
              )}
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
