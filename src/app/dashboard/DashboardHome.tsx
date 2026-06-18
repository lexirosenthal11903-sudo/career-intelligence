"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import s from "./dashboard.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";
import { ArloMessage } from "@/components/ArloMessage";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDateLabel(): string {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

type HomeState = "new-roles" | "deadline" | "nothing-new";

const ARLO_42 = `<svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const ARLO_16 = `<svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const sendIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function DashboardHome() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [todayDismissed, setTodayDismissed] = useState(false);
  const [todayFading, setTodayFading] = useState(false);
  const [homeState, setHomeState] = useState<HomeState>("nothing-new");
  const [directions, setDirections] = useState<Array<{ title: string; why: string }>>([]);
  const [companySuggestions, setCompanySuggestions] = useState<Array<{ type: string; why: string }>>([]);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const { extraMsgs, sendMessage, isLoading, messagesEndRef } = useArloChat({
    page: "home",
    supabase,
    userId,
  });

  // Load direction card data and derive home state
  useEffect(() => {
    function applyResult(parsed: Record<string, unknown>) {
      const profile = parsed?.profile as Record<string, unknown> | undefined;
      const dirs = profile?.suggestedDirections;
      if (Array.isArray(dirs) && dirs.length) setDirections(dirs);
      const suggestions = profile?.companySuggestions;
      if (Array.isArray(suggestions) && suggestions.length) {
        setCompanySuggestions((suggestions as Array<{ type: string; why: string }>).slice(0, 3));
      }
    }

    // Try sessionStorage first (fastest, works for fresh analyses)
    let hasSession = false;
    try {
      const sessionResult = sessionStorage.getItem("analysis-result");
      if (sessionResult) {
        applyResult(JSON.parse(sessionResult));
        hasSession = true;
      }
    } catch {
      // malformed — fall through to Supabase
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const id = user.id;
        const name = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? null;
        setUserId(id);
        setUserName(name);

        if (hasSession) {
          const seen = localStorage.getItem(`ci-new-roles-seen-${id}`);
          if (!seen) setHomeState("new-roles");

          // Persist to Supabase if not already saved
          fetch("/api/results")
            .then((r) => r.json())
            .then((data) => {
              if (!data?.data) {
                const sessionResult = sessionStorage.getItem("analysis-result");
                if (sessionResult) {
                  fetch("/api/save-result", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: JSON.parse(sessionResult) }),
                  }).catch(() => {});
                }
              }
            })
            .catch(() => {});
        } else {
          // Returning user with no sessionStorage — load from Supabase
          fetch("/api/results")
            .then((r) => r.json())
            .then((data) => {
              if (data?.result) {
                applyResult(data.result);
                // Cache in sessionStorage for this session
                try {
                  sessionStorage.setItem("analysis-result", JSON.stringify(data.result));
                } catch { /* ignore */ }
                const seen = localStorage.getItem(`ci-new-roles-seen-${id}`);
                if (!seen) setHomeState("new-roles");
              }
            })
            .catch(() => {});
        }
      }
    });
  }, [supabase]);

  useEffect(() => {
    const saved = localStorage.getItem("arlo-visible");
    if (saved !== null) setArloVisible(saved !== "false");
  }, []);

  function dismissToday() {
    if (userId) localStorage.setItem(`ci-new-roles-seen-${userId}`, "1");
    setTodayFading(true);
    setTimeout(() => setTodayDismissed(true), 220);
  }

  function handleSeeNewMatches() {
    if (userId) localStorage.setItem(`ci-new-roles-seen-${userId}`, "1");
    router.push("/dashboard/roles?tab=listings");
  }

  function toggleArlo() {
    setArloVisible((v) => {
      const next = !v;
      localStorage.setItem("arlo-visible", String(next));
      return next;
    });
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

  return (
    <div className={s.shell}>

      {/* ── SIDEBAR ── */}
      <nav className={s.sidebar}>
        <a href="/" className={s.brand}>Career Intelligence</a>

        <a href="/dashboard" className={`${s.navItem} ${s.active}`}>
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

        <a href="/dashboard/profile" className={s.navProfile}>
          <div className={s.navAv}>{userName ? userName[0].toUpperCase() : "?"}</div>
          <div>
            <div className={s.navName}>{userName ?? "You"}</div>
            <div className={s.navEmail}></div>
          </div>
        </a>
      </nav>

      {/* ── MAIN ── */}
      <div className={s.main}>

        {/* Topbar */}
        <div className={s.topbar}>
          <div className={s.topbarLeft}>
            <span className={s.topbarTitle}>Home</span>
          </div>
          <button className={s.arloToggle} onClick={toggleArlo}>
            <span dangerouslySetInnerHTML={{ __html: ARLO_16 }} />
            {arloVisible ? "Hide Arlo" : "Show Arlo"}
          </button>
        </div>

        {/* Content split */}
        <div className={`${s.content}${!arloVisible ? ` ${s.arloHidden}` : ""}`}>

          {/* LEFT */}
          <div className={s.homePanel}>
            <div className={s.greetingDate}>{getGreeting()} · {getDateLabel()}</div>
            {userName === null
              ? <div className={s.greetingSkeleton} />
              : <div className={s.greetingName}>{`Welcome back, ${userName}.`}</div>
            }

            <div className={s.directionCard}>
              <h2>Directions worth exploring</h2>
              {directions.length > 0 ? (
                <>
                  <p className={s.directionBody} style={{ marginBottom: "1rem" }}>
                    Based on what you&apos;ve shared, these are the directions that fit your background — some obvious, some you may not have considered.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {directions.map((d, i) => (
                      <a key={i} href="/dashboard/roles" className={s.directionLink}>
                        <span>{d.title}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2 6h8M6 2l4 4-4 4"/></svg>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <p className={s.directionBody}>
                  Your directions will appear here once you&apos;ve shared your background.{" "}
                  <a href="/input" style={{ color: "var(--accent)", textDecoration: "none" }}>Start now →</a>
                </p>
              )}
            </div>

            {/* ── STATE: New roles ── */}
            {homeState === "new-roles" && !todayDismissed && (
              <div className={`${s.todaySection}${todayFading ? ` ${s.todayFading}` : ""}`}>
                <div className={s.sectionLabel}>Your analysis is ready</div>
                <div className={s.todayAction}>New roles have been matched to your profile.</div>
                <div className={s.todayWhy}>
                  Arlo has scored each one against your background. Start with the Role types tab to understand the directions, then browse live listings.
                </div>
                <div className={s.btnRow}>
                  <button className={s.btnPrimary} onClick={handleSeeNewMatches}>See your matches →</button>
                  <button className={s.btnGhost} onClick={dismissToday}>Later</button>
                </div>
              </div>
            )}

            {/* ── STATE: Deadline urgency ── */}
            {homeState === "deadline" && !todayDismissed && (
              <div className={`${s.todaySection}${todayFading ? ` ${s.todayFading}` : ""}`}>
                <div className={s.sectionLabel}>Application closing soon</div>
                <div className={s.todayAction}>One of your saved roles has a deadline coming up.</div>
                <div className={s.todayWhy}>
                  Check your applications to see what&apos;s closing and what still needs doing.
                </div>
                <div className={s.btnRow}>
                  <button className={`${s.btnPrimary} ${s.btnUrgent}`} onClick={() => router.push("/dashboard/applications")}>Check applications →</button>
                  <button className={s.btnGhost} onClick={dismissToday}>Not today</button>
                </div>
              </div>
            )}

            {/* ── STATE: Nothing new ── */}
            {homeState === "nothing-new" && !todayDismissed && (
              <div className={`${s.todaySection}${todayFading ? ` ${s.todayFading}` : ""}`}>
                <div className={s.sectionLabel}>Where to start</div>
                <div className={s.todayAction}>Browse your matched roles and save the ones worth pursuing.</div>
                <div className={s.todayWhy}>
                  Arlo has matched roles to your background. Save the ones that feel right — even if you&apos;re not sure yet. You can always pass later.
                </div>
                <div className={s.btnRow}>
                  <button className={s.btnPrimary} onClick={() => router.push("/dashboard/roles")}>See your matched roles →</button>
                  <button className={s.btnGhost} onClick={dismissToday}>Later</button>
                </div>
              </div>
            )}

            <div className={s.exploreLabel}>Explore</div>
            <div className={s.exploreCards}>
              <a href="/dashboard/roles" className={s.exploreCard}>
                <div>
                  <div className={s.exploreCardLabel}>Your role matches</div>
                  <div className={s.exploreCardSub}>All matches, ranked by fit</div>
                </div>
                <div className={s.exploreCardN}>→</div>
              </a>
              <a href="/dashboard/skills" className={s.exploreCard}>
                <div>
                  <div className={s.exploreCardLabel}>Skills to focus on</div>
                  <div className={s.exploreCardSub}>The gaps closest to closing</div>
                </div>
                <div className={s.exploreCardN}>→</div>
              </a>
              <a href="/dashboard/applications" className={s.exploreCard}>
                <div>
                  <div className={s.exploreCardLabel}>Applications</div>
                  <div className={s.exploreCardSub}>Track where things stand</div>
                </div>
                <div className={s.exploreCardN}>→</div>
              </a>
            </div>

            <div className={s.momentum}>
              <div className={s.momentumDot} />
              <span>Good to have you back.</span>
            </div>
          </div>

          {/* RIGHT: Arlo */}
          <div className={`${s.mentorPanel}${!arloVisible ? ` ${s.hidden}` : ""}`}>
            <div className={s.mentorHead}>
              <div className={s.mentorAv} dangerouslySetInnerHTML={{ __html: ARLO_42 }} />
              <div>
                <div className={s.mentorHeadName}>Arlo</div>
                <div className={s.mentorHeadStatus}>{isLoading ? "Thinking…" : "Here with you"}</div>
              </div>
            </div>

            <div className={s.mentorMessages}>

              {/* Initial Arlo message — only before any conversation starts */}
              {extraMsgs.length === 0 && homeState === "new-roles" && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>Your analysis is done. I&apos;ve matched roles to your background and ranked them by fit. Start with the Role types tab — it tells you the why behind each direction, not just the what.</div>
                  <div className={s.aiBubble}>Ask me anything. What do you want to understand first?</div>
                </div>
              )}
              {extraMsgs.length === 0 && homeState === "deadline" && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>Welcome back. You have a deadline coming up on one of your saved roles — check your applications so nothing slips.</div>
                  <div className={s.aiBubble}>What else is on your mind?</div>
                </div>
              )}
              {extraMsgs.length === 0 && homeState === "nothing-new" && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>Good to have you back. Nothing new on the roles front yet — I&apos;ll let you know when something comes in that&apos;s worth your attention.</div>
                  <div className={s.aiBubble}>What are you thinking about today?</div>
                </div>
              )}

              {/* Conversation history */}
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

              {/* Typing indicator */}
              {isLoading && (
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
                  placeholder="Ask me anything…"
                  value={chatValue}
                  onChange={(e) => setChatValue(e.target.value)}
                  onKeyDown={handleChatKey}
                  disabled={isLoading}
                />
                <button className={s.mentorSend} aria-label="Send" onClick={handleSend} disabled={isLoading}>
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
