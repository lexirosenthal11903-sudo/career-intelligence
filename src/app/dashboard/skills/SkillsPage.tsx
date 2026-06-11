"use client";

import { useState, useEffect } from "react";
import s from "./skills.module.css";

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

const checkSmall = (
  <svg width="10" height="10" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 5l2.5 2.5 4.5-4.5" />
  </svg>
);

const plusIcon = (
  <svg fill="none" viewBox="0 0 9 9" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" d="M4.5 1v7M1 4.5h7" />
  </svg>
);

const starIcon = (
  <svg fill="none" viewBox="0 0 9 9" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 1l.9 2.6h2.7l-2.2 1.6.8 2.6-2.2-1.6-2.2 1.6.8-2.6L.9 3.6h2.7z" />
  </svg>
);

interface Skill {
  id: string;
  name: string;
  time: string;
  tags: string[];
  urgent?: boolean;
  resource: { label: string; type: "free" | "cert"; badge: string };
  initiallyInProgress?: boolean;
  initiallyDone?: boolean;
}

const BEFORE_APPLY: Skill[] = [
  {
    id: "advanced-excel",
    name: "Advanced Excel",
    time: "~ 4 hrs",
    tags: ["Deliveroo · Operations"],
    urgent: true,
    resource: { label: "Excel for Data Analysis — Microsoft Learn", type: "free", badge: "Free" },
  },
  {
    id: "structured-problem-solving",
    name: "Structured problem-solving",
    time: "~ 1 hr left",
    tags: ["Monzo · PM", "Deliveroo · Operations"],
    urgent: true,
    resource: { label: "McKinsey Problem Solving — Coursera", type: "free", badge: "Free" },
    initiallyInProgress: true,
  },
];

const WORTH_BUILDING: Skill[] = [
  {
    id: "sql-basics",
    name: "SQL basics",
    time: "~ 6 hrs",
    tags: ["Monzo · PM", "Management consulting"],
    resource: { label: "SQL for Beginners — Mode Analytics", type: "free", badge: "Free" },
  },
  {
    id: "deloitte-virtual",
    name: "Deloitte Virtual Internship",
    time: "~ 5 hrs",
    tags: ["Management consulting"],
    resource: { label: "Deloitte Technology — Forage", type: "cert", badge: "Free · Certificate" },
  },
];

const INITIAL_DONE: Skill[] = [
  {
    id: "bcg-simulation",
    name: "BCG Strategy Simulation",
    time: "",
    tags: ["Management consulting"],
    resource: { label: "", type: "free", badge: "" },
    initiallyDone: true,
  },
];

const ALL_SKILLS = [...BEFORE_APPLY, ...WORTH_BUILDING, ...INITIAL_DONE];

export default function SkillsPage() {
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [completedOpen, setCompletedOpen] = useState(false);
  const [done, setDone] = useState<Set<string>>(
    new Set(ALL_SKILLS.filter((s) => s.initiallyDone).map((s) => s.id))
  );
  const [inProgress, setInProgress] = useState<Set<string>>(
    new Set(ALL_SKILLS.filter((s) => s.initiallyInProgress).map((s) => s.id))
  );

  useEffect(() => {
    const saved = localStorage.getItem("arlo-visible");
    if (saved !== null) setArloVisible(saved !== "false");
  }, []);

  function toggleArlo() {
    setArloVisible((v) => {
      const next = !v;
      localStorage.setItem("arlo-visible", String(next));
      return next;
    });
  }

  function markDone(id: string) {
    setDone((prev) => new Set([...prev, id]));
    setInProgress((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  function toggleInProgress(id: string) {
    setInProgress((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const completedCount = done.size;

  function renderSkill(skill: Skill, showDone = false) {
    const isDone = done.has(skill.id);
    const isInProgress = inProgress.has(skill.id);

    if (isDone && !showDone) return null;
    if (!isDone && showDone) return null;

    const cardClass = [
      s.skillItem,
      isDone ? s.skillDone : "",
      skill.urgent && !isDone ? s.skillUrgent : "",
      isInProgress && !isDone ? s.skillInProgress : "",
    ].filter(Boolean).join(" ");

    return (
      <div key={skill.id} className={cardClass}>
        <div className={s.skillTop}>
          <div className={s.skillName}>{skill.name}</div>
          {isDone ? (
            <div className={s.doneBadge}>
              {checkSmall}
              Done
            </div>
          ) : (
            <div className={s.skillTime}>{skill.time}</div>
          )}
        </div>

        {skill.tags.length > 0 && (
          <div className={s.skillMeta}>
            {skill.tags.map((t) => (
              <span key={t} className={s.roleTag}>{t}</span>
            ))}
            {skill.urgent && !isDone && <span className={s.urgentFlag}>Required</span>}
          </div>
        )}

        {!isDone && skill.resource.label && (
          <div className={s.skillResource}>
            <div className={`${s.resourceIcon} ${skill.resource.type === "cert" ? s.resourceCert : s.resourceFree}`}>
              {skill.resource.type === "cert" ? starIcon : plusIcon}
            </div>
            <a href="#" className={s.resourceLink}>{skill.resource.label}</a>
            <span className={s.freeLabel}>{skill.resource.badge}</span>
          </div>
        )}

        {isInProgress && !isDone && (
          <div className={s.inProgressBadge}>
            <span className={s.inProgressDot} />
            In progress
          </div>
        )}

        {!isDone && (
          <div className={s.skillActions}>
            {!isInProgress && (
              <button className={s.btnStarted} onClick={() => toggleInProgress(skill.id)}>
                Mark as started
              </button>
            )}
            <button className={s.btnDone} onClick={() => markDone(skill.id)}>
              Mark as done
            </button>
          </div>
        )}
      </div>
    );
  }

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
        <a href="/dashboard/applications" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4V2M15 4V2M3 9h18M9 14h6" />
          </svg>
          Applications
        </a>
        <a href="/dashboard/skills" className={`${s.navItem} ${s.active}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Skills
        </a>

        <div className={s.navGap} />

        <div className={s.navProfile}>
          <div className={s.navAv}>L</div>
          <div>
            <div className={s.navName}>Lexi</div>
            <div className={s.navEmail}>lexi@email.com</div>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div className={s.main}>

        <div className={s.topbar}>
          <span className={s.topbarTitle}>Skills</span>
          <button className={s.arloToggle} onClick={toggleArlo}>
            <span dangerouslySetInnerHTML={{ __html: ARLO_16 }} />
            {arloVisible ? "Hide Arlo" : "Show Arlo"}
          </button>
        </div>

        <div className={`${s.content}${!arloVisible ? ` ${s.arloHidden}` : ""}`}>

          {/* LEFT: Skills */}
          <div className={s.skillsPanel}>

            {/* Direction card */}
            <div className={s.directionCard}>
              <div className={s.directionLabel}>Your direction</div>
              <div className={s.directionTitle}>Management Consulting</div>
              <div className={s.directionSub}>Strategy, operations, and business analysis roles</div>
              <div className={s.directionRule} />
              <div className={s.strengthsLabel}>What you bring</div>
              <div className={s.strengthsWrap}>
                {["Analytical thinking", "Written communication", "Research", "Microsoft Office"].map((str) => (
                  <div key={str} className={s.strengthChip}>
                    {checkSmall}
                    {str}
                  </div>
                ))}
              </div>
            </div>

            {/* Before you apply */}
            <div className={s.skillSection}>
              <div className={s.sectionHead}>Before you apply</div>
              <div className={s.skillList}>
                {BEFORE_APPLY.map((skill) => renderSkill(skill))}
              </div>
            </div>

            {/* Worth building */}
            <div className={s.skillSection}>
              <div className={s.sectionHead}>Worth building</div>
              <div className={s.skillList}>
                {WORTH_BUILDING.map((skill) => renderSkill(skill))}
              </div>
            </div>

            {/* Completed */}
            <div className={s.skillSection}>
              <button
                className={s.completedToggle}
                aria-expanded={completedOpen}
                onClick={() => setCompletedOpen((v) => !v)}
              >
                <span className={s.completedLabel}>
                  Completed
                  <span className={s.completedCount}>{completedCount}</span>
                </span>
                <span className={`${s.completedChevron}${completedOpen ? ` ${s.completedChevronOpen}` : ""}`}>
                  {chevronDown}
                </span>
              </button>
              {completedOpen && (
                <div className={s.completedList}>
                  {ALL_SKILLS.filter((sk) => done.has(sk.id)).map((skill) => renderSkill(skill, true))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: Arlo */}
          <div className={`${s.mentorPanel}${!arloVisible ? ` ${s.hidden}` : ""}`}>
            <div className={s.mentorHead}>
              <div className={s.mentorAv} dangerouslySetInnerHTML={{ __html: ARLO_42 }} />
              <div>
                <div className={s.mentorHeadName}>Arlo</div>
                <div className={s.mentorHeadStatus}>Here with you</div>
              </div>
            </div>

            <div className={s.mentorMessages}>
              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  You&apos;re already strong where it counts for consulting — analytical thinking
                  and communication are the foundation.
                </div>
                <div className={s.aiBubble}>
                  Two things to close before you apply to <strong>Deliveroo</strong>: Advanced
                  Excel and structured problem-solving. You&apos;ve already started the
                  problem-solving one — finishing it is the next move.
                </div>
              </div>

              <div className={s.userMsg}>
                <div className={s.userBubble}>Just finished the BCG Forward simulation</div>
              </div>

              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  Good — that&apos;s a real differentiator for consulting roles. Share the
                  certificate and I&apos;ll mark it as complete and add it to your profile.
                </div>
              </div>

              <div className={s.userMsg}>
                <div className={s.userBubble}>Here&apos;s the link: bcg.com/forward/certificate/...</div>
              </div>

              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  Done — it&apos;s on your profile. Want me to add it to your CV too?
                </div>
                <div className={s.aiBubble}>
                  When you&apos;ve finished the problem-solving module, SQL basics is worth
                  picking up next — it comes up a lot at <strong>Monzo</strong> and it&apos;s free.
                </div>
              </div>

              <div className={`${s.aiBubble} ${s.aiBubbleSignpost}`}>
                Ask me about anything else — interview prep, networking, or something you just
                want to learn.
              </div>
            </div>

            <div className={s.mentorInputWrap}>
              <div className={s.mentorInputCard}>
                <input
                  className={s.mentorInput}
                  type="text"
                  placeholder="Ask Arlo…"
                  value={chatValue}
                  onChange={(e) => setChatValue(e.target.value)}
                />
                <button className={s.mentorSend} aria-label="Send">
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
