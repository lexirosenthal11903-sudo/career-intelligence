"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import s from "./role-detail.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";
import { ArloMessage } from "@/components/ArloMessage";

const ARLO_42 = `<svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 31 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 31 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M30 50 Q40 55 50 50" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const ARLO_16 = `<svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const sendIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const backIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 2L4 7l5 5" />
  </svg>
);

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Direction {
  title: string;
  why: string;
}

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.id === "string" ? params.id : "";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [allDirections, setAllDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);

  const { extraMsgs, sendMessage, isLoading: arloLoading, messagesEndRef, hasPrevious, showPrevious, togglePrevious } = useArloChat({
    page: `role-${slug}`,
    supabase,
    userId,
  });

  useEffect(() => {
    const saved = localStorage.getItem("arlo-visible");
    if (saved !== null) setArloVisible(saved !== "false");

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setUserName(
          user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? null
        );
      }
    });

    // Load direction from sessionStorage
    let found = false;
    try {
      const stored = sessionStorage.getItem("analysis-result");
      if (stored) {
        const parsed = JSON.parse(stored);
        const dirs: Direction[] = parsed?.profile?.suggestedDirections ?? [];
        setAllDirections(dirs);
        const match = dirs.find((d) => slugify(d.title) === slug);
        if (match) {
          setDirection(match);
          found = true;
        }
      }
    } catch { /* ignore */ }

    // Fallback: /api/results
    if (!found) {
      fetch("/api/results")
        .then((r) => r.json())
        .then((data) => {
          const dirs: Direction[] = data?.result?.profile?.suggestedDirections ?? [];
          setAllDirections(dirs);
          const match = dirs.find((d) => slugify(d.title) === slug);
          if (match) setDirection(match);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [supabase, slug]);

  function toggleArlo() {
    setArloVisible((v) => {
      const next = !v;
      localStorage.setItem("arlo-visible", String(next));
      return next;
    });
  }

  function handleSend() {
    const text = chatValue.trim();
    if (!text || arloLoading) return;
    setChatValue("");
    sendMessage(text);
  }

  function handleChatKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleArloPrompt(prompt: string) {
    sendMessage(prompt);
  }

  const displayTitle = direction?.title ?? (loading ? "" : "Direction");

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
          <div className={s.navAv}>{userName ? userName[0].toUpperCase() : "?"}</div>
          <div>
            <div className={s.navName}>{userName ?? "You"}</div>
          </div>
        </a>
      </nav>

      {/* ── MAIN ── */}
      <div className={s.main}>

        {/* Topbar */}
        <div className={s.topbar}>
          <div className={s.topbarLeft}>
            <button className={s.backBtn} onClick={() => router.push("/dashboard/roles")}>
              {backIcon}
              Roles
            </button>
            <div className={s.topbarSep} />
            <span className={s.topbarTitle}>{displayTitle || "Loading…"}</span>
          </div>
          <button className={s.arloToggle} onClick={toggleArlo}>
            <span dangerouslySetInnerHTML={{ __html: ARLO_16 }} />
            {arloVisible ? "Hide Arlo" : "Show Arlo"}
          </button>
        </div>

        {/* Content split */}
        <div className={`${s.content}${!arloVisible ? ` ${s.arloHidden}` : ""}`}>

          {/* LEFT: Brief */}
          <div className={s.brief}>
            {loading ? (
              <>
                <div className={`${s.briefTitle} ${s.skeleton}`} style={{ width: "50%", height: "1.6rem" }} />
                <div className={`${s.briefSummary} ${s.skeleton}`} style={{ width: "100%", height: "4rem", marginTop: "1rem" }} />
              </>
            ) : direction ? (
              <>
                <div className={s.briefTitle}>{direction.title}</div>

                <div className={s.sLabel} style={{ marginTop: "1.5rem" }}>Why this fits you</div>
                <p className={s.briefSummary}>{direction.why}</p>

                {/* Other directions in this analysis */}
                {allDirections.length > 1 && (
                  <>
                    <div className={s.sLabel} style={{ marginTop: "2rem" }}>Other directions worth exploring</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {allDirections
                        .filter((d) => slugify(d.title) !== slug)
                        .map((d) => (
                          <a
                            key={d.title}
                            href={`/dashboard/roles/${slugify(d.title)}`}
                            className={s.listingsLink}
                            style={{ textDecoration: "none" }}
                          >
                            <div>
                              <div className={s.listingsLabel}>{d.title}</div>
                              <div className={s.listingsSub}>{d.why?.split(/[.!?]/)[0]?.trim()}</div>
                            </div>
                            <div className={s.listingsArrow}>→</div>
                          </a>
                        ))}
                    </div>
                  </>
                )}

                {/* Ask Arlo prompts */}
                <div className={s.sLabel} style={{ marginTop: "2rem" }}>Ask Arlo</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    `What does a ${direction.title} actually do day to day?`,
                    `What does it take to get into ${direction.title} from my background?`,
                    `What's the honest downside of ${direction.title}?`,
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      className={s.listingsLink}
                      style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                      onClick={() => handleArloPrompt(prompt)}
                    >
                      <div className={s.listingsLabel}>{prompt}</div>
                      <div className={s.listingsArrow}>→</div>
                    </button>
                  ))}
                </div>

                {/* Live listings link */}
                <a
                  href={`/dashboard/roles?tab=listings&filter=${encodeURIComponent(direction.title)}`}
                  className={s.listingsLink}
                  style={{ marginTop: "2rem" }}
                >
                  <div>
                    <div className={s.listingsLabel}>Live listings for {direction.title}</div>
                    <div className={s.listingsSub}>See all matched roles →</div>
                  </div>
                  <div className={s.listingsArrow}>→</div>
                </a>
              </>
            ) : (
              <div>
                <div className={s.briefTitle}>Direction not found</div>
                <p className={s.briefSummary}>
                  We couldn&apos;t find this direction in your analysis.{" "}
                  <a href="/dashboard/roles" style={{ color: "var(--accent)", textDecoration: "none" }}>
                    Go back to your matched roles →
                  </a>
                </p>
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
              {hasPrevious && (
                <button onClick={togglePrevious} style={{ display: "block", margin: "0 auto 8px", fontSize: 11, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {showPrevious ? "Hide previous conversation" : "View previous conversation"}
                </button>
              )}
              {extraMsgs.length === 0 && direction && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>
                    {direction.title} is a direction I matched to you for specific reasons — not just because it sounds right on paper. Ask me anything about it: what it actually involves, whether it fits your background, what getting in looks like, or what the honest downsides are.
                  </div>
                </div>
              )}
              {extraMsgs.length === 0 && !direction && !loading && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>
                    Run your analysis first and I&apos;ll be able to tell you exactly why this direction fits you — and what it would take to get there.
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
                  placeholder="Ask Arlo anything about this role…"
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
