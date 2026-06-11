"use client";

import { useState, useEffect } from "react";
import s from "./dashboard.module.css";

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
        <a href="/dashboard/skills" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19V10M10 19V5M16 19v-6M22 19H2" />
          </svg>
          Skills
        </a>
        <a href="/dashboard/applications" className={s.navItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4V2M15 4V2M3 9h18M9 14h6" />
          </svg>
          Applications
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

        {/* Topbar */}
        <div className={s.topbar}>
          <span className={s.topbarTitle}>Home</span>
          <button
            className={s.arloToggle}
            onClick={toggleArlo}
          >
            <span dangerouslySetInnerHTML={{ __html: ARLO_16 }} />
            {arloVisible ? "Hide Arlo" : "Show Arlo"}
          </button>
        </div>

        {/* Content split */}
        <div className={`${s.content}${!arloVisible ? ` ${s.arloHidden}` : ""}`}>

          {/* LEFT: Opportunities */}
          <div className={s.homePanel}>
            <div className={s.greetingDate}>Good morning · Monday, 11 June</div>
            <div className={s.greetingName}>Welcome back, Lexi.</div>

            <div className={s.directionCard}>
              <h2>Your direction</h2>
              <div className={s.directionTitle}>Early-stage fintech, moving fast.</div>
              <p className={s.directionBody}>
                You&apos;ve built real product instinct — not from a textbook, but from actually doing things.
                The roles that suit you aren&apos;t the obvious ones on a job board.
                I&apos;ll show you where you&apos;ll make the most impact.
              </p>
            </div>

            <div className={s.todaySection}>
              <div className={s.sectionLabel}>Today</div>
              <div className={s.todayAction}>Reach out to Sarah Chen at Monzo.</div>
              <div className={s.todayWhy}>
                She came from a non-traditional background and has written about it publicly.
                Your story will land with her in a way a cold CV never would.
              </div>
              <div className={s.btnRow}>
                <button className={s.btnPrimary}>Draft message →</button>
                <button className={s.btnGhost}>Not today</button>
              </div>
            </div>

            <div className={s.exploreLabel}>Explore</div>
            <div className={s.exploreCards}>
              <a href="/dashboard/roles" className={s.exploreCard}>
                <div>
                  <div className={s.exploreCardLabel}>Your role matches</div>
                  <div className={s.exploreCardSub}>Ranked by how well they fit your profile</div>
                </div>
                <div className={s.exploreCardN}>3 →</div>
              </a>
              <a href="/dashboard/skills" className={s.exploreCard}>
                <div>
                  <div className={s.exploreCardLabel}>Skills to focus on</div>
                  <div className={s.exploreCardSub}>The gaps closest to closing</div>
                </div>
                <div className={s.exploreCardN}>2 →</div>
              </a>
              <a href="/dashboard/applications" className={s.exploreCard}>
                <div>
                  <div className={s.exploreCardLabel}>People to reach out to</div>
                  <div className={s.exploreCardSub}>Real contacts at your matched companies</div>
                </div>
                <div className={s.exploreCardN}>2 →</div>
              </a>
            </div>

            <div className={s.momentum}>
              <div className={s.momentumDot} />
              <span><strong>12 active days</strong> into your search — you&apos;re building something.</span>
            </div>
          </div>

          {/* RIGHT: Arlo */}
          <div className={`${s.mentorPanel}${!arloVisible ? ` ${s.hidden}` : ""}`}>
            <div className={s.mentorHead}>
              <div
                className={s.mentorAv}
                dangerouslySetInnerHTML={{ __html: ARLO_42 }}
              />
              <div>
                <div className={s.mentorHeadName}>Arlo</div>
                <div className={s.mentorHeadStatus}>Here with you</div>
              </div>
            </div>

            <div className={s.mentorMessages}>
              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  Good morning, Lexi. I&apos;ve been looking at your profile — you have{" "}
                  <strong>3 roles waiting</strong>, and Monzo is ahead by some distance.
                  Want to talk through why it&apos;s the right fit?
                </div>
              </div>

              <div className={s.userMsg}>
                <div className={s.userBubble}>Yes — why Monzo specifically?</div>
              </div>

              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  Two things. Their APM programme actively recruits non-traditional backgrounds — they&apos;ve
                  said so publicly. And your instinct toward products that genuinely help people with money
                  maps directly to what Monzo is building.
                  <br /><br />
                  <strong>You&apos;re not a stretch here. You&apos;re exactly who they&apos;re looking for.</strong>
                </div>
              </div>

              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  The message to Sarah practically writes itself. Should I draft it now?
                </div>
              </div>
            </div>

            <div className={s.mentorInputWrap}>
              <div className={s.mentorInputCard}>
                <input
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
