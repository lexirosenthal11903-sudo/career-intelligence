"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import s from "./profile.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";
import { ArloMessage } from "@/components/ArloMessage";

const ARLO_42 = `<svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const ARLO_16 = `<svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const sendIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 7h12M7 1l6 6-6 6" />
  </svg>
);

const chevronUpDown = (
  <svg width="12" height="12" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5l3-3 3 3M3 7l3 3 3-3" />
  </svg>
);

const fileIcon = (
  <svg fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.6" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM11 2v5h4M6 9h6M6 12h4" />
  </svg>
);

const WORK_STYLES = ["Hybrid", "Remote", "In-person"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Postgrad scheme"];

interface AnalysisProfile {
  summary?: string;
  suggestedDirections?: Array<{ title: string; why: string }>;
  topRoleTitles?: string[];
  valuesSignals?: string[];
}

interface AnalysisResult {
  profile?: AnalysisProfile;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeAppCount, setActiveAppCount] = useState<number | null>(null);

  const { extraMsgs, sendMessage, isLoading: arloLoading, messagesEndRef } = useArloChat({
    page: "profile",
    supabase,
    userId,
  });

  function handleSend() {
    const text = chatValue.trim();
    if (!text || arloLoading) return;
    setChatValue("");
    sendMessage(text);
  }
  function handleChatKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  useEffect(() => {
    const saved = localStorage.getItem("arlo-visible");
    if (saved !== null) setArloVisible(saved !== "false");
  }, []);

  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Load analysis result
    try {
      const stored = sessionStorage.getItem("analysis-result");
      if (stored) {
        setAnalysisResult(JSON.parse(stored));
      }
    } catch { /* ignore */ }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
      if (user) {
        setUserId(user.id);
        setUserName(user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? null);

        // Fallback: load analysis from Supabase if not in sessionStorage
        if (!sessionStorage.getItem("analysis-result")) {
          fetch("/api/results")
            .then((r) => r.json())
            .then((data) => {
              if (data?.result) {
                setAnalysisResult(data.result);
                try { sessionStorage.setItem("analysis-result", JSON.stringify(data.result)); } catch { /* ignore */ }
              }
            })
            .catch(() => {});
        }

        // Load active application count
        fetch("/api/applications")
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data?.applications)) {
              const active = data.applications.filter((a: { stage: string }) => a.stage !== "archive").length;
              setActiveAppCount(active);
            }
          })
          .catch(() => {});
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

  const [location, setLocation] = useState("London, UK");
  const [salaryMin, setSalaryMin] = useState("25,000");
  const [salaryMax, setSalaryMax] = useState("40,000");
  const [workStyle, setWorkStyle] = useState<Set<string>>(new Set(["Hybrid"]));
  const [employmentType, setEmploymentType] = useState<Set<string>>(new Set(["Full-time"]));

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function showSaved(field: string) {
    setSavedFields((prev) => new Set([...prev, field]));
    clearTimeout(saveTimers.current[field]);
    saveTimers.current[field] = setTimeout(() => {
      setSavedFields((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }, 1800);
  }

  function togglePill(setter: (fn: (prev: Set<string>) => Set<string>) => void, value: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function talkToArlo(msg: string) {
    setChatValue(msg);
    setTimeout(() => chatInputRef.current?.focus(), 50);
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
        <a href="/dashboard/skills" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Skills
        </a>

        <div className={s.navGap} />

        <a href="/dashboard/profile" className={`${s.navUser} ${s.navUserActive}`}>
          <div className={s.navAv}>{userName ? userName[0].toUpperCase() : "?"}</div>
          <div className={s.navUserInfo}>
            <div className={s.navName}>{userName ?? "You"}</div>
            <div className={s.navEmail}>{userEmail ?? ""}</div>
          </div>
          <span className={s.navUserChevron}>{chevronUpDown}</span>
        </a>
      </nav>

      {/* ── MAIN ── */}
      <div className={s.main}>

        {/* Topbar */}
        <div className={s.topbar}>
          <span className={s.topbarTitle}>Profile</span>
          <button className={s.arloToggle} onClick={toggleArlo}>
            <span dangerouslySetInnerHTML={{ __html: ARLO_16 }} />
            {arloVisible ? "Hide Arlo" : "Show Arlo"}
          </button>
        </div>

        {/* Content split */}
        <div className={`${s.content}${!arloVisible ? ` ${s.arloHidden}` : ""}`}>

          {/* LEFT: Profile */}
          <div className={s.profilePanel}>

            {/* Activity strip */}
            <div className={s.activityStrip}>
              {activeAppCount !== null && activeAppCount > 0 ? (
                <span><strong>{activeAppCount}</strong> application{activeAppCount !== 1 ? "s" : ""} active</span>
              ) : (
                <span>No applications tracked yet</span>
              )}
            </div>

            {/* Direction card */}
            <div className={s.directionCard}>
              <div className={s.directionCardLabel}>Directions worth exploring</div>
              {analysisResult?.profile?.suggestedDirections?.length ? (
                <>
                  {analysisResult.profile.summary && (
                    <div className={s.directionCardSub} style={{ marginBottom: "1rem" }}>
                      {analysisResult.profile.summary}
                    </div>
                  )}
                  <div className={s.directionCardRule} />
                  <div className={s.directionRolesLabel}>Based on your background</div>
                  <div className={s.rolesWrap}>
                    {analysisResult.profile.suggestedDirections.map((d) => (
                      <a
                        key={d.title}
                        href={`/dashboard/roles/${slugify(d.title)}`}
                        className={s.roleTypeChip}
                        style={{ textDecoration: "none" }}
                      >
                        {d.title}
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <div className={s.directionCardSub}>
                  Run your analysis to see your directions.{" "}
                  <a href="/input" style={{ color: "var(--accent)", textDecoration: "none" }}>Start now →</a>
                </div>
              )}
              <div className={s.directionRefine}>
                Want to explore further?{" "}
                <button
                  className={s.directionRefineLink}
                  onClick={() => talkToArlo("I want to talk through my directions.")}
                >
                  Ask Arlo →
                </button>
              </div>
            </div>

            {/* What Arlo knows */}
            <div className={s.knowsCard}>
              {analysisResult?.profile?.valuesSignals?.length ? (
                <>
                  <div className={s.knowsRow}>
                    <div className={s.knowsLabel}>What Arlo sees in you</div>
                    <div className={s.knowsText}>
                      {analysisResult.profile.valuesSignals.slice(0, 3).map((v, i) => (
                        <p key={i} style={{ margin: i === 0 ? 0 : "0.5rem 0 0" }}>{v}</p>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className={s.knowsRow}>
                  <div className={s.knowsLabel}>What Arlo knows</div>
                  <div className={s.knowsText}>
                    Complete your analysis and Arlo will build up a picture of what makes you specifically you.
                  </div>
                </div>
              )}
              <div className={s.knowsFooter}>
                Something&apos;s changed?{" "}
                <button
                  className={s.knowsFooterLink}
                  onClick={() => talkToArlo("Something about my background or preferences has changed.")}
                >
                  Tell Arlo →
                </button>
              </div>
            </div>

            {/* CV on file */}
            <div className={s.profileSection}>
              <div className={s.sectionHead}>CV on file</div>
              <div className={s.cvCard}>
                <div className={s.cvIcon}>{fileIcon}</div>
                <div className={s.cvMeta}>
                  <div className={s.cvName}>Your CV</div>
                  <div className={s.cvDate}>Used for your analysis</div>
                </div>
                <div className={s.cvActions}>
                  <button className={s.btnUpdate} onClick={() => router.push("/input")}>Update CV →</button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className={s.profileSection}>
              <div className={s.sectionHead}>Preferences</div>

              <div className={s.prefField}>
                <div className={s.prefLabel}>
                  Location
                  <span className={`${s.saveFeedback}${savedFields.has("location") ? ` ${s.saveFeedbackVisible}` : ""}`}>
                    Saved ✓
                  </span>
                </div>
                <input
                  className={s.prefInput}
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); showSaved("location"); }}
                />
              </div>

              <div className={s.prefField}>
                <div className={s.prefLabel}>
                  Salary range
                  <span className={`${s.saveFeedback}${savedFields.has("salary") ? ` ${s.saveFeedbackVisible}` : ""}`}>
                    Saved ✓
                  </span>
                </div>
                <div className={s.salaryRow}>
                  <div className={s.salaryWrap}>
                    <span className={s.salaryPrefix}>£</span>
                    <input
                      className={`${s.prefInput} ${s.salaryInput}`}
                      type="text"
                      value={salaryMin}
                      onChange={(e) => { setSalaryMin(e.target.value); showSaved("salary"); }}
                    />
                  </div>
                  <div className={s.salaryWrap}>
                    <span className={s.salaryPrefix}>£</span>
                    <input
                      className={`${s.prefInput} ${s.salaryInput}`}
                      type="text"
                      value={salaryMax}
                      onChange={(e) => { setSalaryMax(e.target.value); showSaved("salary"); }}
                    />
                  </div>
                </div>
              </div>

              <div className={s.prefField}>
                <div className={s.prefLabel}>Work style</div>
                <div className={s.pillGroup}>
                  {WORK_STYLES.map((ws) => (
                    <button
                      key={ws}
                      className={`${s.prefPill}${workStyle.has(ws) ? ` ${s.prefPillActive}` : ""}`}
                      onClick={() => togglePill(setWorkStyle, ws)}
                    >
                      {ws}
                    </button>
                  ))}
                </div>
              </div>

              <div className={s.prefField}>
                <div className={s.prefLabel}>Employment type</div>
                <div className={s.pillGroup}>
                  {EMPLOYMENT_TYPES.map((et) => (
                    <button
                      key={et}
                      className={`${s.prefPill}${employmentType.has(et) ? ` ${s.prefPillActive}` : ""}`}
                      onClick={() => togglePill(setEmploymentType, et)}
                    >
                      {et}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Account */}
            <div className={s.settingsSection}>
              <div className={s.sectionHead}>Account</div>
              <div className={s.settingsRow}>
                <span className={s.settingsLabel}>Email</span>
                <span className={s.settingsValue}>{userEmail ?? "—"}</span>
              </div>
              <div className={s.settingsRow}>
                <span className={s.settingsLabel}>Sign out</span>
                <button className={s.settingsBtn} onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>Sign out →</button>
              </div>
              <div className={s.settingsDivider} />
              <div className={s.settingsRow}>
                <div>
                  <div className={s.settingsLabel}>Start fresh</div>
                  <div className={s.settingsHint}>Re-run your analysis. Applications you&apos;re tracking stay safe.</div>
                </div>
                {confirmRestart ? (
                  <div className={s.inlineConfirm}>
                    <span className={s.inlineConfirmText}>Your analysis restarts. Applications you&apos;re tracking stay safe.</span>
                    <button className={s.inlineConfirmYes} onClick={() => router.push("/input")}>Start over</button>
                    <button className={s.inlineConfirmNo} onClick={() => setConfirmRestart(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className={s.settingsBtn} onClick={() => setConfirmRestart(true)}>Restart →</button>
                )}
              </div>
              <div className={s.settingsRow}>
                <div>
                  <div className={`${s.settingsLabel} ${s.settingsLabelDanger}`}>Delete account</div>
                  <div className={s.settingsHint}>Permanently removes all your data. This cannot be undone.</div>
                </div>
                {confirmDelete ? (
                  <div className={s.inlineConfirm}>
                    <span className={s.inlineConfirmText}>All your data will be deleted.</span>
                    <button className={s.inlineConfirmDanger} onClick={() => router.push("/")}>Delete everything</button>
                    <button className={s.inlineConfirmNo} onClick={() => setConfirmDelete(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className={`${s.settingsBtn} ${s.settingsBtnDanger}`} onClick={() => setConfirmDelete(true)}>Delete →</button>
                )}
              </div>
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
              {extraMsgs.length === 0 && (
                <>
                  <div className={s.aiMsg}>
                    <div className={s.aiBubble}>
                      This is everything I know about you. If anything feels off, just tell me.
                    </div>
                  </div>
                  <div className={s.aiMsg}>
                    <div className={s.aiBubble}>
                      You can update your CV, adjust your preferences, or just let me know if things have changed.
                    </div>
                  </div>
                </>
              )}
              {extraMsgs.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className={s.userMsg}><div className={s.userBubble}>{m.text}</div></div>
                ) : (
                  <div key={i} className={s.aiMsg}><div className={s.aiBubble}><ArloMessage text={m.text} /></div></div>
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
                  ref={chatInputRef}
                  className={s.mentorInput}
                  type="text"
                  placeholder="Ask Arlo…"
                  value={chatValue}
                  onChange={(e) => setChatValue(e.target.value)}
                  onKeyDown={handleChatKey}
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
