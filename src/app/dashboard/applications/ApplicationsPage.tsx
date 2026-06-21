"use client";

import { useState, useEffect, useMemo } from "react";
import s from "./applications.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadAnalysisResult } from "@/lib/analysisResult";
import { useArloChat } from "@/hooks/useArloChat";
import { ArloMessage } from "@/components/ArloMessage";

const ARLO_42 = `<svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const ARLO_16 = `<svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const sendIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 7h12M7 1l6 6-6 6" />
  </svg>
);

const chevronDown = (
  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5l4 4 4-4" />
  </svg>
);

type Stage = "preparing" | "applied" | "interview" | "offer" | "archive";

const NEXT_STAGE: Partial<Record<Stage, Stage>> = {
  preparing: "applied",
  applied: "interview",
  interview: "offer",
};
const MOVE_LABELS: Partial<Record<Stage, string>> = {
  preparing: "Mark as applied",
  applied: "Move to Interview",
  interview: "Move to Offer",
};

interface Application {
  id: string;
  job_id: string;
  job_data: {
    title?: string;
    company?: string;
    location?: string;
    relevanceReason?: string;
    [key: string]: unknown;
  };
  stage: Stage;
  created_at: string;
}

const STAGE_LABELS: { key: Stage | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "preparing", label: "Preparing" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

const STAGE_BADGE: Record<Stage, string> = {
  preparing: s.badgePreparing,
  applied: s.badgeApplied,
  interview: s.badgeInterview,
  offer: s.badgeOffer,
  archive: s.badgeArchive,
};

export default function ApplicationsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stages, setStages] = useState<Record<string, Stage>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [directionTitle, setDirectionTitle] = useState<string | null>(null);
  const [allDirections, setAllDirections] = useState<Array<{ title: string }>>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { extraMsgs, sendMessage, isLoading: arloLoading, messagesEndRef, hasPrevious, showPrevious, togglePrevious } = useArloChat({
    page: "applications",
    supabase,
    userId,
  });

  useEffect(() => {
    const saved = localStorage.getItem("arlo-visible");
    if (saved !== null) setArloVisible(saved !== "false");

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setUserName(user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? null);
        setUserEmail(user.email ?? null);
      }
    });

    // Server-first via the shared helper; sessionStorage is only a fallback.
    loadAnalysisResult<{ profile?: { suggestedDirections?: unknown } }>().then((result) => {
      // Guard: older analyses stored suggestedDirections as a string; calling
      // .map on a non-array crashed the page.
      const raw_dirs = result?.profile?.suggestedDirections;
      const dirs = (Array.isArray(raw_dirs) ? raw_dirs : []) as Array<{ title: string }>;
      setAllDirections(dirs);
      setDirectionTitle(dirs[0]?.title ?? null);
    });

    loadApplications();
  }, [supabase]);

  async function loadApplications() {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) {
        setLoadError(true);
        return;
      }
      const { applications: data } = await res.json();
      const apps: Application[] = data ?? [];
      setApplications(apps);
      setStages(Object.fromEntries(apps.map((a: Application) => [a.job_id, a.stage])));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    const text = chatValue.trim();
    if (!text) return;
    setChatValue("");
    sendMessage(text);
  }
  function handleChatKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const [activeFilter, setActiveFilter] = useState<Stage | "all">("all");
  const [expandedTimelines, setExpandedTimelines] = useState<Set<string>>(new Set());

  function toggleArlo() {
    setArloVisible((v) => {
      const next = !v;
      localStorage.setItem("arlo-visible", String(next));
      return next;
    });
  }

  function toggleTimeline(id: string) {
    setExpandedTimelines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function moveStage(jobId: string) {
    const current = stages[jobId];
    const next = NEXT_STAGE[current];
    if (!next) return;

    setStages((prev) => ({ ...prev, [jobId]: next }));

    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, stage: next }),
    });
  }

  async function archiveApp(jobId: string) {
    setStages((prev) => ({ ...prev, [jobId]: "archive" }));
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, stage: "archive" }),
    });
  }

  async function unarchiveApp(jobId: string) {
    setStages((prev) => ({ ...prev, [jobId]: "preparing" }));
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, stage: "preparing" }),
    });
  }

  const counts = applications.reduce((acc, app) => {
    const stage = stages[app.job_id] ?? app.stage;
    acc[stage] = (acc[stage] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeCount = applications.filter((a) => (stages[a.job_id] ?? a.stage) !== "archive").length;

  const visible = applications.filter((app) => {
    const stage = stages[app.job_id] ?? app.stage;
    if (activeFilter === "archive") return stage === "archive";
    if (activeFilter === "all") return stage !== "archive";
    return stage === activeFilter;
  });

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
        <a href="/dashboard/roles" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Roles
        </a>
        <a href="/dashboard/applications" className={`${s.navItem} ${s.active}`}>
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
          <div className={s.navAv}>{userName ? userName[0].toUpperCase() : "?"}</div>
          <div className={s.navInfo}>
            <div className={s.navName}>{userName ?? "You"}</div>
            <div className={s.navEmail}>{userEmail ?? ""}</div>
          </div>
        </a>
      </nav>

      {/* ── MAIN ── */}
      <div className={s.main}>

        <div className={s.topbar}>
          <div className={s.topbarLeft}>
            <span className={s.topbarTitle}>Applications</span>
            {!loading && <span className={s.topbarCount}>{activeCount} active</span>}
          </div>
          <button className={s.arloToggle} onClick={toggleArlo}>
            <span dangerouslySetInnerHTML={{ __html: ARLO_16 }} />
            {arloVisible ? "Hide Arlo" : "Show Arlo"}
          </button>
        </div>

        <div className={`${s.content}${!arloVisible ? ` ${s.arloHidden}` : ""}`}>

          {/* LEFT */}
          <div className={s.appPanel}>

            <div className={s.directionCard}>
              <div className={s.directionLabel}>Directions worth exploring</div>
              <div className={s.directionTitle}>
                {allDirections.length > 0
                  ? allDirections.map((d) => d.title).join(" · ")
                  : directionTitle ?? "Complete your analysis to see your directions"}
              </div>
            </div>

            <div className={s.stageFilter}>
              {STAGE_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`${s.stagePill}${activeFilter === key ? ` ${s.stagePillActive}` : ""}`}
                  onClick={() => setActiveFilter(key)}
                >
                  {label}
                  <span className={s.pillCount}>
                    {key === "all" ? activeCount : (counts[key] ?? 0)}
                  </span>
                </button>
              ))}
              <button
                className={`${s.stagePill} ${s.stagePillArchive}${activeFilter === "archive" ? ` ${s.stagePillActive}` : ""}`}
                onClick={() => setActiveFilter("archive")}
              >
                Archive
                <span className={s.pillCount}>{counts.archive ?? 0}</span>
              </button>
            </div>

            <div className={s.appList}>
              {loading && (
                <div className={s.emptyState}>
                  <p>Loading…</p>
                </div>
              )}

              {!loading && loadError && (
                <div className={s.emptyState}>
                  <div className={s.emptyTitle}>Couldn&apos;t load your applications.</div>
                  <div className={s.emptySub}>
                    <button className={s.emptyLink} onClick={loadApplications}>Try again</button>
                  </div>
                </div>
              )}

              {!loading && !loadError && applications.length === 0 && (
                <div className={s.emptyState}>
                  <div className={s.emptyTitle}>No applications yet.</div>
                  <div className={s.emptySub}>
                    Mark roles as Interested in the{" "}
                    <a href="/dashboard/roles" className={s.emptyLink}>Roles tab</a>{" "}
                    to start tracking them here.
                  </div>
                </div>
              )}

              {!loading && !loadError && applications.length > 0 && visible.length === 0 && (
                <div className={s.emptyState}>
                  <div className={s.emptyTitle}>
                    {activeFilter === "archive" ? "Nothing archived yet." : `No applications in ${activeFilter}.`}
                  </div>
                </div>
              )}

              {visible.map((app) => {
                const currentStage = stages[app.job_id] ?? app.stage;
                const moveLabel = MOVE_LABELS[currentStage];
                const isArchived = currentStage === "archive";
                const timelineOpen = expandedTimelines.has(app.job_id);

                return (
                  <div key={app.job_id} className={s.appCard}>

                    <div className={s.appCardHeader}>
                      <div className={s.appCardMeta}>
                        <div className={s.appRole}>{app.job_data.title ?? "Role"}</div>
                        <div className={s.appCompany}>
                          {app.job_data.company ?? "Company"}
                          {app.job_data.location && (
                            <>
                              <span className={s.appDot} />
                              {app.job_data.location}
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`${s.stageBadge} ${STAGE_BADGE[currentStage]}`}>
                        {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}
                      </span>
                    </div>

                    {app.job_data.relevanceReason && (
                      <div className={s.nextAction}>
                        <span className={s.nextArrow}>→</span>
                        <span className={s.nextText}>{app.job_data.relevanceReason}</span>
                      </div>
                    )}

                    <div className={s.appCardFooter}>
                      <div className={s.closingGroup} />
                      <div className={s.footerActions}>
                        {isArchived ? (
                          <button className={s.btnMove} onClick={() => unarchiveApp(app.job_id)}>
                            Restore
                          </button>
                        ) : (
                          <>
                            <button className={s.btnArchive} onClick={() => archiveApp(app.job_id)}>
                              Archive
                            </button>
                            {moveLabel && (
                              <button
                                className={`${s.btnMove}${currentStage === "interview" ? ` ${s.btnMovePrimary}` : ""}`}
                                onClick={() => moveStage(app.job_id)}
                              >
                                {moveLabel}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

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
              {extraMsgs.length === 0 && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>
                    {applications.length === 0
                      ? "When you mark roles as Interested, they'll appear here. I'll help you track each one and prepare for every stage."
                      : "I can see your applications. Let me know when you want to prepare for an interview, draft a follow-up, or work on anything specific."}
                  </div>
                </div>
              )}
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
                  <div key={i} className={s.aiMsg}><div className={s.aiBubble}><ArloMessage text={m.text} action={m.action} /></div></div>
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
                  placeholder="Ask Arlo…"
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
