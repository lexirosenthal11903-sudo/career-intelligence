"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import s from "./dashboard.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";

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
  const supabase = createSupabaseBrowserClient();
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [todayDismissed, setTodayDismissed] = useState(false);
  const [todayFading, setTodayFading] = useState(false);
  const [homeState, setHomeState] = useState<HomeState>("nothing-new");
  const chatInputRef = useRef<HTMLInputElement>(null);

  const { extraMsgs, sendMessage, isLoading } = useArloChat({
    page: "home",
    supabase,
    userId,
  });

  // Derive home state + fix unauthenticated result persistence
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const id = user.id;
        const name = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? null;
        setUserId(id);
        setUserName(name);

        // homeState: new-roles if result exists and user hasn't dismissed the banner
        const sessionResult = sessionStorage.getItem("analysisResult");
        if (sessionResult) {
          const seen = localStorage.getItem(`ci-new-roles-seen-${id}`);
          if (!seen) setHomeState("new-roles");
        }

        // Unauthenticated result persistence fix:
        // If sessionStorage has a result but Supabase doesn't, save it now
        if (sessionResult) {
          fetch("/api/results")
            .then((r) => r.json())
            .then((data) => {
              if (!data?.data) {
                fetch("/api/save-result", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ data: JSON.parse(sessionResult) }),
                }).catch(() => {});
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
            <div className={s.greetingName}>{userName ? `Welcome back, ${userName}.` : `${getGreeting()}.`}</div>

            <div className={s.directionCard}>
              <h2>Your direction</h2>
              <div className={s.directionTitle}>Operations and strategy in early-stage companies.</div>
              <p className={s.directionBody}>
                You think in systems — how things connect, where the friction is, what&apos;s holding a team back.
                The roles where you&apos;ll do your best work are ones where those instincts are the job.
              </p>
            </div>

            {/* ── STATE: New roles ── */}
            {homeState === "new-roles" && !todayDismissed && (
              <div className={`${s.todaySection}${todayFading ? ` ${s.todayFading}` : ""}`}>
                <div className={s.sectionLabel}>New since your last visit</div>
                <div className={s.todayAction}>3 new roles matched to your profile.</div>
                <div className={s.todayWhy}>
                  One of them is particularly strong — a strategy role at a fast-growing logistics company.
                  Less obvious than it sounds. Arlo has thoughts on why it fits.
                </div>
                <div className={s.btnRow}>
                  <button className={s.btnPrimary} onClick={handleSeeNewMatches}>See new matches →</button>
                  <button className={s.btnGhost} onClick={dismissToday}>Later</button>
                </div>
              </div>
            )}

            {/* ── STATE: Deadline urgency ── */}
            {homeState === "deadline" && !todayDismissed && (
              <div className={`${s.todaySection}${todayFading ? ` ${s.todayFading}` : ""}`}>
                <div className={s.urgencyBadge}>Closes in 2 days</div>
                <div className={s.sectionLabel}>This week</div>
                <div className={s.todayAction}>Your Bloom &amp; Wild application closes Friday.</div>
                <div className={s.todayWhy}>
                  You saved this role but haven&apos;t applied yet. It&apos;s one of your stronger matches —
                  Arlo has a draft outline ready if you want to move on it today.
                </div>
                <div className={s.btnRow}>
                  <button className={`${s.btnPrimary} ${s.btnUrgent}`} onClick={() => router.push("/dashboard/applications")}>Start application →</button>
                  <button className={s.btnGhost} onClick={dismissToday}>Not today</button>
                </div>
              </div>
            )}

            {/* ── STATE: Nothing new ── */}
            {homeState === "nothing-new" && !todayDismissed && (
              <div className={`${s.todaySection}${todayFading ? ` ${s.todayFading}` : ""}`}>
                <div className={s.sectionLabel}>Pick up here</div>
                <div className={s.todayAction}>You saved Bloom &amp; Wild&apos;s ops role — ready to do something with it?</div>
                <div className={s.todayWhy}>
                  You haven&apos;t looked at the details yet. There&apos;s a specific person there worth reaching
                  out to — it&apos;s a better route in than applying cold.
                </div>
                <div className={s.btnRow}>
                  <button className={s.btnPrimary} onClick={() => router.push("/dashboard/roles")}>Look at the role →</button>
                  <button className={s.btnGhost} onClick={dismissToday}>Not today</button>
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
                <div className={s.exploreCardN}>
                  {homeState === "new-roles" ? "8 →" : "5 →"}
                </div>
              </a>
              <a href="/dashboard/skills" className={s.exploreCard}>
                <div>
                  <div className={s.exploreCardLabel}>Skills to focus on</div>
                  <div className={s.exploreCardSub}>The gaps closest to closing</div>
                </div>
                <div className={s.exploreCardN}>3 →</div>
              </a>
              <a href="/dashboard/applications" className={s.exploreCard}>
                <div>
                  <div className={s.exploreCardLabel}>Applications</div>
                  <div className={s.exploreCardSub}>Track where things stand</div>
                </div>
                <div className={s.exploreCardN}>2 →</div>
              </a>
            </div>

            <div className={s.momentum}>
              <div className={s.momentumDot} />
              <span><strong>12 active days</strong> into your search. Good to have you back.</span>
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

              {homeState === "new-roles" && extraMsgs.length === 0 && (
                <>
                  <div className={s.aiMsg}>
                    <div className={s.aiBubble}>Welcome back. What did you get up to since we last spoke?</div>
                    <div className={s.aiBubble}>While you were away, three new roles came in. The logistics one caught my attention — the job title doesn&apos;t do it justice. I&apos;ll explain why when you&apos;re ready.</div>
                  </div>
                </>
              )}

              {homeState === "deadline" && extraMsgs.length === 0 && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>Welcome back. What did you get up to?</div>
                  <div className={s.aiBubble}>Something to flag before anything else — your Bloom &amp; Wild application closes Friday. Two days. You saved it a while back but haven&apos;t applied yet.</div>
                  <div className={s.aiBubble}>I have a draft outline ready. It won&apos;t take long if you want to move on it today. What do you think?</div>
                </div>
              )}

              {homeState === "nothing-new" && extraMsgs.length === 0 && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>Welcome back. What did you get up to?</div>
                  <div className={s.aiBubble}>Nothing new on the roles front since your last visit — I&apos;ll let you know when something comes in.</div>
                  <div className={s.aiBubble}>You saved the Bloom &amp; Wild ops role a while back. There&apos;s a specific person there worth reaching out to directly. Better route in than applying cold. Worth a look?</div>
                </div>
              )}

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
