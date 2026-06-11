"use client";

import { useState, useEffect, useRef } from "react";
import s from "./dashboard.module.css";

type HomeState = "new-roles" | "deadline" | "nothing-new"; // Phase 3: derive from real data

const ARLO_42 = `<svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const ARLO_16 = `<svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const sendIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function DashboardHome() {
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  // Phase 3: derive from real data (new matches since last login, deadline urgency, nothing new)
  const homeState = "new-roles" as HomeState;
  const chatInputRef = useRef<HTMLInputElement>(null);

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
            <div className={s.greetingDate}>Good morning · Wednesday, 11 June</div>
            <div className={s.greetingName}>Welcome back, Lexi.</div>

            <div className={s.directionCard}>
              <h2>Your direction</h2>
              <div className={s.directionTitle}>Operations and strategy in early-stage companies.</div>
              <p className={s.directionBody}>
                You think in systems — how things connect, where the friction is, what&apos;s holding a team back.
                The roles where you&apos;ll do your best work are ones where those instincts are the job.
              </p>
            </div>

            {/* ── STATE: New roles ── */}
            {homeState === "new-roles" && (
              <div className={s.todaySection}>
                <div className={s.sectionLabel}>New since your last visit</div>
                <div className={s.todayAction}>3 new roles matched to your profile.</div>
                <div className={s.todayWhy}>
                  One of them is particularly strong — a strategy role at a fast-growing logistics company.
                  Less obvious than it sounds. Arlo has thoughts on why it fits.
                </div>
                <div className={s.btnRow}>
                  <button className={s.btnPrimary}>See new matches →</button>
                  <button className={s.btnGhost}>Later</button>
                </div>
              </div>
            )}

            {/* ── STATE: Deadline urgency ── */}
            {homeState === "deadline" && (
              <div className={s.todaySection}>
                <div className={s.urgencyBadge}>Closes in 2 days</div>
                <div className={s.sectionLabel}>This week</div>
                <div className={s.todayAction}>Your Bloom &amp; Wild application closes Friday.</div>
                <div className={s.todayWhy}>
                  You saved this role but haven&apos;t applied yet. It&apos;s one of your stronger matches —
                  Arlo has a draft outline ready if you want to move on it today.
                </div>
                <div className={s.btnRow}>
                  <button className={`${s.btnPrimary} ${s.btnUrgent}`}>Start application →</button>
                  <button className={s.btnGhost}>Not today</button>
                </div>
              </div>
            )}

            {/* ── STATE: Nothing new ── */}
            {homeState === "nothing-new" && (
              <div className={s.todaySection}>
                <div className={s.sectionLabel}>Pick up here</div>
                <div className={s.todayAction}>You saved Bloom &amp; Wild&apos;s ops role — ready to do something with it?</div>
                <div className={s.todayWhy}>
                  You haven&apos;t looked at the details yet. There&apos;s a specific person there worth reaching
                  out to — it&apos;s a better route in than applying cold.
                </div>
                <div className={s.btnRow}>
                  <button className={s.btnPrimary}>Look at the role →</button>
                  <button className={s.btnGhost}>Not today</button>
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
                <div className={s.mentorHeadStatus}>Here with you</div>
              </div>
            </div>

            <div className={s.mentorMessages}>

              {homeState === "new-roles" && (
                <>
                  <div className={s.aiMsg}>
                    <div className={s.aiBubble}>Welcome back. What did you get up to since we last spoke?</div>
                    <div className={s.aiBubble}>While you were away, three new roles came in. The logistics one caught my attention — the job title doesn&apos;t do it justice. I&apos;ll explain why when you&apos;re ready.</div>
                  </div>
                  <div className={s.userMsg}>
                    <div className={s.userBubble}>Just had a busy week. What&apos;s the logistics role?</div>
                  </div>
                  <div className={s.aiMsg}>
                    <div className={s.aiBubble}>Head of Operations at Relay — they move goods for small brands that can&apos;t afford their own logistics. Fast, lean, real problems to solve every day. <strong>Your instinct for finding where friction lives is exactly what they need.</strong></div>
                    <div className={s.aiBubble}>Want to look at it properly?</div>
                  </div>
                </>
              )}

              {homeState === "deadline" && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>Welcome back. What did you get up to?</div>
                  <div className={s.aiBubble}>Something to flag before anything else — your Bloom &amp; Wild application closes Friday. Two days. You saved it a while back but haven&apos;t applied yet.</div>
                  <div className={s.aiBubble}>I have a draft outline ready. It won&apos;t take long if you want to move on it today. What do you think?</div>
                </div>
              )}

              {homeState === "nothing-new" && (
                <div className={s.aiMsg}>
                  <div className={s.aiBubble}>Welcome back. What did you get up to?</div>
                  <div className={s.aiBubble}>Nothing new on the roles front since your last visit — I&apos;ll let you know when something comes in.</div>
                  <div className={s.aiBubble}>You saved the Bloom &amp; Wild ops role a while back. There&apos;s a specific person there worth reaching out to directly. Better route in than applying cold. Worth a look?</div>
                </div>
              )}

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
