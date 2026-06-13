"use client";

import { useState, useEffect } from "react";
import s from "./applications.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";

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

const checkIcon = (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 4.5l2 2 4-4" />
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

interface TimelineItem {
  label: string;
  date: string;
  pending?: boolean;
}

interface Application {
  id: string;
  role: string;
  company: string;
  location: string;
  stage: Stage;
  nextAction: string;
  closing?: string;
  closingUrgent?: boolean;
  assessmentDue?: string;
  moveLabel: string;
  timeline?: TimelineItem[];
}

const APPS: Application[] = [
  {
    id: "monzo-pm",
    role: "Product Manager",
    company: "Monzo",
    location: "London",
    stage: "interview",
    nextAction: "Prepare for second-round interview",
    closing: "Closes 2 Jul",
    moveLabel: "Move to Offer",
    timeline: [
      { label: "Applied", date: "2 Jun" },
      { label: "Online assessment", date: "8 Jun · 6 days later" },
      { label: "First-round interview", date: "12 Jun · upcoming", pending: true },
      { label: "Second-round interview", date: "25 Jun · pending", pending: true },
    ],
  },
  {
    id: "deloitte-strategy",
    role: "Strategy Analyst",
    company: "Deloitte",
    location: "London",
    stage: "applied",
    nextAction: "Follow up if no response by Friday",
    closing: "Closes 20 Jun · 9 days",
    closingUrgent: false,
    moveLabel: "Move to Interview",
  },
  {
    id: "hsbc-grad",
    role: "Graduate Scheme",
    company: "HSBC",
    location: "London",
    stage: "applied",
    nextAction: "Complete online assessment",
    assessmentDue: "Assessment due 18 Jun · 7 days",
    closing: "Application closes 30 Jun",
    moveLabel: "Move to Interview",
  },
  {
    id: "deliveroo-ops",
    role: "Operations Associate",
    company: "Deliveroo",
    location: "London",
    stage: "preparing",
    nextAction: "Draft cover letter",
    closing: "Closes 28 Jun",
    moveLabel: "Mark as applied",
  },
  {
    id: "wise-ux",
    role: "UX Researcher",
    company: "Wise",
    location: "London",
    stage: "preparing",
    nextAction: "Complete online skills test",
    closing: "Closes 25 Jun",
    moveLabel: "Mark as applied",
  },
];

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
  const supabase = createSupabaseBrowserClient();
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const { extraMsgs, sendMessage, isLoading: arloLoading } = useArloChat({
    page: "applications",
    supabase,
    userId,
  });

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
  const [archived, setArchived] = useState<Set<string>>(new Set());
  const [stages, setStages] = useState<Record<string, Stage>>(
    () => Object.fromEntries(APPS.map((a) => [a.id, a.stage]))
  );

  function archiveApp(id: string) {
    setArchived((prev) => new Set([...prev, id]));
  }
  function unarchiveApp(id: string) {
    setArchived((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }
  function moveStage(id: string) {
    setStages((prev) => {
      const next = NEXT_STAGE[prev[id]];
      if (!next) return prev;
      return { ...prev, [id]: next };
    });
  }

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

  function toggleTimeline(id: string) {
    setExpandedTimelines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const counts = APPS.reduce(
    (acc, app) => {
      const stage = archived.has(app.id) ? "archive" : stages[app.id];
      acc[stage] = (acc[stage] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const activeCount = APPS.filter((a) => !archived.has(a.id) && stages[a.id] !== "archive").length;

  const visible =
    activeFilter === "archive"
      ? APPS.filter((a) => archived.has(a.id) || stages[a.id] === "archive")
      : activeFilter === "all"
      ? APPS.filter((a) => !archived.has(a.id) && stages[a.id] !== "archive")
      : APPS.filter((a) => !archived.has(a.id) && stages[a.id] === activeFilter);

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
          <div className={s.navAv}>L</div>
          <div>
            <div className={s.navName}>Lexi</div>
            <div className={s.navEmail}>lexi@email.com</div>
          </div>
        </a>
      </nav>

      {/* ── MAIN ── */}
      <div className={s.main}>

        <div className={s.topbar}>
          <div className={s.topbarLeft}>
            <span className={s.topbarTitle}>Applications</span>
            <span className={s.topbarCount}>{activeCount} active</span>
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
              <div className={s.directionLabel}>Your direction</div>
              <div className={s.directionTitle}>Management Consulting</div>
              <div className={s.directionSub}>Strategy, operations, and business analysis roles</div>
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
                className={`${s.stagePill} ${s.stagePillArchive}`}
                onClick={() => setActiveFilter("archive")}
              >
                Archive
                <span className={s.pillCount}>{counts.archive ?? 0}</span>
              </button>
            </div>

            <div className={s.appList}>
              {visible.map((app) => {
                const timelineOpen = expandedTimelines.has(app.id);
                const currentStage = stages[app.id];
                const moveLabel = MOVE_LABELS[currentStage];
                return (
                  <div key={app.id} className={s.appCard}>

                    <div className={s.appCardHeader}>
                      <div className={s.appCardMeta}>
                        <div className={s.appRole}>{app.role}</div>
                        <div className={s.appCompany}>
                          {app.company}
                          <span className={s.appDot} />
                          {app.location}
                        </div>
                      </div>
                      <span className={`${s.stageBadge} ${STAGE_BADGE[currentStage]}`}>
                        {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}
                      </span>
                    </div>

                    <div className={s.nextAction}>
                      <span className={s.nextArrow}>→</span>
                      <span className={s.nextText}>{app.nextAction}</span>
                    </div>

                    {/* Collapsible timeline */}
                    {app.timeline && (
                      <div className={s.timelineWrap}>
                        <button
                          className={s.timelineToggle}
                          aria-expanded={timelineOpen}
                          onClick={() => toggleTimeline(app.id)}
                        >
                          <span className={s.timelineSummary}>
                            <span className={s.timelineSummaryDot} />
                            3 stages completed · Applied → 2nd round
                          </span>
                          <span className={`${s.timelineChevron}${timelineOpen ? ` ${s.timelineChevronOpen}` : ""}`}>
                            {chevronDown}
                          </span>
                        </button>
                        {timelineOpen && (
                          <div className={s.timeline}>
                            {app.timeline.map((item, i) => (
                              <div key={i} className={s.timelineItem}>
                                <div className={s.timelineLeft}>
                                  <div className={`${s.timelineDot}${item.pending ? ` ${s.timelineDotPending}` : ""}`} />
                                  {i < app.timeline!.length - 1 && <div className={s.timelineLine} />}
                                </div>
                                <div className={s.timelineBody}>
                                  <div className={`${s.timelineLabel}${item.pending ? ` ${s.timelineLabelPending}` : ""}`}>
                                    {item.label}
                                  </div>
                                  <div className={s.timelineDate}>{item.date}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`${s.appCardFooter}${app.timeline ? ` ${s.appCardFooterSpaced}` : ""}`}>
                      <div className={s.closingGroup}>
                        {app.assessmentDue && (
                          <div className={`${s.closing} ${s.closingUrgent}`}>
                            <span className={s.closingDot} />
                            {app.assessmentDue}
                          </div>
                        )}
                        {app.closing && (
                          <div className={`${s.closing}${app.closingUrgent ? ` ${s.closingUrgent}` : ""}`}>
                            {app.closingUrgent && <span className={s.closingDot} />}
                            {app.closing}
                          </div>
                        )}
                      </div>
                      <div className={s.footerActions}>
                        {archived.has(app.id) ? (
                          <button className={s.btnMove} onClick={() => unarchiveApp(app.id)}>
                            Restore
                          </button>
                        ) : (
                          <>
                            <button className={s.btnArchive} onClick={() => archiveApp(app.id)}>
                              Archive
                            </button>
                            {moveLabel && (
                              <button
                                className={`${s.btnMove}${currentStage === "interview" ? ` ${s.btnMovePrimary}` : ""}`}
                                onClick={() => moveStage(app.id)}
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
              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  Your <strong>Deloitte</strong> application closes in 3 days and you
                  haven&apos;t heard back. A short follow-up email today would be worth sending.
                </div>
                <div className={s.aiBubble}>
                  You&apos;re also through to the second round at <strong>Monzo</strong> — that&apos;s
                  a real win. Want me to help you prepare?
                </div>
              </div>
              <div className={s.userMsg}>
                <div className={s.userBubble}>Yes please — what should I focus on?</div>
              </div>
              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  Second rounds at Monzo tend to be case-based. Given your background, I&apos;d
                  focus on structuring your thinking clearly rather than knowing every answer.
                  Want me to run a practice question with you?
                </div>
              </div>
            </div>

            {extraMsgs.length > 0 && (
              <div className={s.mentorMessages} style={{ paddingTop: 0 }}>
                {extraMsgs.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className={s.userMsg}><div className={s.userBubble}>{m.text}</div></div>
                  ) : (
                    <div key={i} className={s.aiMsg}><div className={s.aiBubble}>{m.text}</div></div>
                  )
                )}
              </div>
            )}
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
