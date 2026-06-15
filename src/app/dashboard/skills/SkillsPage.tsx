"use client";

import { useState, useEffect, useRef } from "react";
import s from "./skills.module.css";
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

const uploadIcon = (
  <svg width="12" height="12" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 8V2M3 5l3-3 3 3M2 10h8" />
  </svg>
);

interface SkillGap {
  skill: string;
  tier: string;
  why: string;
  howToBuild: string;
}

interface AnalysisResult {
  suggestedDirections?: Array<{ title: string; why: string }>;
  skills?: {
    strengths?: string[];
    gaps?: SkillGap[];
    advice?: string;
  };
}

interface Skill {
  id: string;
  name: string;
  why: string;
  urgent?: boolean;
  resource: { label: string; type: "free" | "cert"; badge: string; url: string };
}

function parseResource(howToBuild: string): { label: string; type: "free" | "cert"; badge: string; url: string } {
  const urlMatch = howToBuild.match(/https?:\/\/[^\s)>\]]+/);
  const url = urlMatch ? urlMatch[0].replace(/[.,;]$/, "") : "";
  const isCert = url.includes("theforage.com");
  const label = howToBuild.replace(/https?:\/\/[^\s)>\]]+/g, "").replace(/[()[\]]/g, "").replace(/\s+/g, " ").trim();
  return {
    label: label || howToBuild,
    type: isCert ? "cert" : "free",
    badge: isCert ? "Free · Certificate" : "Free",
    url,
  };
}

function gapToSkill(gap: SkillGap, index: number): Skill {
  return {
    id: `gap-${index}`,
    name: gap.skill,
    why: gap.why,
    urgent: gap.tier === "Foundation",
    resource: parseResource(gap.howToBuild),
  };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function SkillsPage() {
  const supabase = createSupabaseBrowserClient();
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [beforeApply, setBeforeApply] = useState<Skill[]>([]);
  const [worthBuilding, setWorthBuilding] = useState<Skill[]>([]);

  const { extraMsgs, sendMessage, isLoading: arloLoading } = useArloChat({
    page: "skills",
    supabase,
    userId,
  });

  useEffect(() => {
    const saved = localStorage.getItem("arlo-visible");
    if (saved !== null) setArloVisible(saved !== "false");
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });

    try {
      const raw = sessionStorage.getItem("arlo-result");
      if (raw) {
        const result: AnalysisResult = JSON.parse(raw);
        setAnalysis(result);
        const gaps = result.skills?.gaps ?? [];
        setBeforeApply(
          gaps.filter((g) => g.tier === "Foundation").map((g, i) => gapToSkill(g, i))
        );
        setWorthBuilding(
          gaps.filter((g) => g.tier !== "Foundation").map((g, i) => gapToSkill(g, gaps.findIndex((x) => x === g)))
        );
      }
    } catch {
      // sessionStorage unavailable or malformed
    }
  }, [supabase]);

  function handleSend() {
    const text = chatValue.trim();
    if (!text) return;
    setChatValue("");
    sendMessage(text);
  }
  function handleChatKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const [completedOpen, setCompletedOpen] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [doneAt, setDoneAt] = useState<Record<string, Date>>({});
  const [inProgress, setInProgress] = useState<Set<string>>(new Set());
  const [certOpen, setCertOpen] = useState<Set<string>>(new Set());
  const [certMode, setCertMode] = useState<Record<string, "link" | "upload">>({});
  const [certLinks, setCertLinks] = useState<Record<string, string>>({});
  const [certLinkDraft, setCertLinkDraft] = useState<Record<string, string>>({});

  function toggleArlo() {
    setArloVisible((v) => {
      const next = !v;
      localStorage.setItem("arlo-visible", String(next));
      return next;
    });
  }

  function markStarted(id: string) { setInProgress((prev) => new Set([...prev, id])); }

  function markDone(id: string) {
    setDone((prev) => new Set([...prev, id]));
    setDoneAt((prev) => ({ ...prev, [id]: new Date() }));
    setInProgress((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setCompletedOpen(true);
  }

  function markIncomplete(id: string) {
    setDone((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setDoneAt((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  function undoStarted(id: string) {
    setInProgress((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  function toggleCert(id: string) {
    setCertOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function saveCertLink(id: string) {
    const link = certLinkDraft[id]?.trim();
    if (!link) return;
    setCertLinks((prev) => ({ ...prev, [id]: link }));
    setCertLinkDraft((prev) => ({ ...prev, [id]: "" }));
    setCertOpen((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  function tellArlo(skillName: string) {
    setChatValue(`I've completed ${skillName} and have my certificate.`);
    setTimeout(() => chatInputRef.current?.focus(), 50);
  }

  const allSkills = [...beforeApply, ...worthBuilding];
  const completedCount = done.size;

  const directionTitle = analysis?.suggestedDirections?.[0]?.title ?? null;
  const strengths = analysis?.skills?.strengths ?? [];

  function renderSkill(skill: Skill, showDone = false) {
    const isDone = done.has(skill.id);
    const isInProgress = inProgress.has(skill.id);
    const isCertOpen = certOpen.has(skill.id);
    const savedCertLink = certLinks[skill.id];
    const isCert = skill.resource.type === "cert";
    const currentCertMode = certMode[skill.id] ?? "link";

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
        </div>

        {skill.why && !isDone && (
          <div className={s.skillWhy}>{skill.why}</div>
        )}

        {!isDone && skill.resource.label && (
          <div className={s.skillResource}>
            <div className={`${s.resourceIcon} ${isCert ? s.resourceCert : s.resourceFree}`}>
              {isCert ? starIcon : plusIcon}
            </div>
            {skill.resource.url ? (
              <a href={skill.resource.url} className={s.resourceLink} target="_blank" rel="noopener noreferrer">
                {skill.resource.label}
              </a>
            ) : (
              <span className={s.resourceLink}>{skill.resource.label}</span>
            )}
            <span className={s.freeLabel}>{skill.resource.badge}</span>
          </div>
        )}

        {savedCertLink && (
          <div className={s.certSaved}>
            {checkSmall}
            <a href={savedCertLink} className={s.certSavedLink} target="_blank" rel="noreferrer">
              Certificate saved
            </a>
          </div>
        )}

        {isCert && !savedCertLink && (isInProgress || isDone) && (
          <div className={s.certSection}>
            {!isCertOpen ? (
              <button className={s.certAddBtn} onClick={() => toggleCert(skill.id)}>
                + Add certificate
              </button>
            ) : (
              <div className={s.certForm}>
                <div className={s.certModeTabs}>
                  <button
                    className={`${s.certModeTab}${currentCertMode === "link" ? ` ${s.certModeTabActive}` : ""}`}
                    onClick={() => setCertMode((p) => ({ ...p, [skill.id]: "link" }))}
                  >
                    Paste link
                  </button>
                  <button
                    className={`${s.certModeTab}${currentCertMode === "upload" ? ` ${s.certModeTabActive}` : ""}`}
                    onClick={() => setCertMode((p) => ({ ...p, [skill.id]: "upload" }))}
                  >
                    Upload file
                  </button>
                </div>

                {currentCertMode === "link" ? (
                  <div className={s.certInputRow}>
                    <input
                      className={s.certInput}
                      type="url"
                      placeholder="https://credential.net/..."
                      value={certLinkDraft[skill.id] ?? ""}
                      onChange={(e) => setCertLinkDraft((p) => ({ ...p, [skill.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") saveCertLink(skill.id); }}
                    />
                    <button className={s.certSaveBtn} onClick={() => saveCertLink(skill.id)}>
                      Save
                    </button>
                  </div>
                ) : (
                  <label className={s.certUploadArea}>
                    <input type="file" accept=".pdf,image/*" className={s.certFileInput} />
                    <span className={s.certUploadInner}>
                      {uploadIcon}
                      <span>Choose file or drag here</span>
                    </span>
                  </label>
                )}

                <button className={s.certTellArlo} onClick={() => { toggleCert(skill.id); tellArlo(skill.name); }}>
                  Tell Arlo instead →
                </button>
              </div>
            )}
          </div>
        )}

        <div className={s.skillFooter}>
          {isDone ? (
            <>
              <span className={s.doneDate}>
                {checkSmall}
                {doneAt[skill.id] ? formatDate(doneAt[skill.id]) : ""}
              </span>
              <button className={s.btnIncomplete} onClick={() => markIncomplete(skill.id)}>
                Mark as incomplete
              </button>
            </>
          ) : isInProgress ? (
            <>
              <div className={s.inProgressGroup}>
                <span className={s.inProgressDot} />
                <span className={s.inProgressLabel}>In progress</span>
                <button className={s.undoBtn} onClick={() => undoStarted(skill.id)}>· undo</button>
              </div>
              <button className={s.btnMarkDone} onClick={() => markDone(skill.id)}>
                Mark as done
              </button>
            </>
          ) : (
            <button className={s.btnStart} onClick={() => markStarted(skill.id)}>
              Start
            </button>
          )}
        </div>

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
              {directionTitle ? (
                <div className={s.directionTitle}>{directionTitle}</div>
              ) : (
                <div className={s.directionTitle} style={{ color: "var(--text-muted)" }}>
                  Complete your analysis to see your direction
                </div>
              )}
              {strengths.length > 0 && (
                <>
                  <div className={s.directionRule} />
                  <div className={s.strengthsLabel}>What you bring</div>
                  <div className={s.strengthsWrap}>
                    {strengths.map((str) => (
                      <div key={str} className={s.strengthChip}>
                        {checkSmall}
                        {str}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* No analysis state */}
            {!analysis && (
              <div className={s.emptyState}>
                <p>Your skills map will appear here after you complete your analysis.</p>
                <a href="/input" className={s.emptyLink}>Start your analysis →</a>
              </div>
            )}

            {/* Before you apply */}
            {beforeApply.length > 0 && (
              <div className={s.skillSection}>
                <div className={s.sectionHead}>Before you apply</div>
                <div className={s.skillList}>
                  {beforeApply.map((skill) => renderSkill(skill))}
                </div>
              </div>
            )}

            {/* Worth building */}
            {worthBuilding.length > 0 && (
              <div className={s.skillSection}>
                <div className={s.sectionHead}>Worth building</div>
                <div className={s.skillList}>
                  {worthBuilding.map((skill) => renderSkill(skill))}
                </div>
              </div>
            )}

            {/* Completed */}
            {analysis && (
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
                    {allSkills.filter((sk) => done.has(sk.id)).map((skill) => renderSkill(skill, true))}
                  </div>
                )}
              </div>
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
              {extraMsgs.length === 0 && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>
                    {analysis
                      ? "Here's what I'd focus on first. The skills marked \"Before you apply\" are the ones that will matter most for your immediate applications."
                      : "Complete your analysis and I'll help you build a skills plan tailored to where you're heading."}
                  </div>
                </div>
              )}
              {extraMsgs.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className={s.userMsg}><div className={s.userBubble}>{m.text}</div></div>
                ) : (
                  <div key={i} className={s.aiMsg}><div className={s.aiBubble}>{m.text}</div></div>
                )
              )}
            </div>

            <div className={s.mentorInputWrap}>
              <div className={s.mentorInputCard}>
                <input
                  ref={chatInputRef}
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
