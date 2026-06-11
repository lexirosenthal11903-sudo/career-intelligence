"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import s from "./role-detail.module.css";

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

type ChatMsg = { role: "arlo" | "user"; text: string };

export default function RoleDetailPage() {
  const router = useRouter();
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [extraMsgs, setExtraMsgs] = useState<ChatMsg[]>([]);

  function handleSend() {
    const text = chatValue.trim();
    if (!text) return;
    setChatValue("");
    setExtraMsgs((prev) => [...prev, { role: "user", text }]);
    setTimeout(() => {
      setExtraMsgs((prev) => [...prev, { role: "arlo", text: "I hear you. I'll be able to respond properly once everything is connected — keep exploring for now." }]);
    }, 800);
  }
  function handleChatKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

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
            <button className={s.backBtn} onClick={() => router.push("/dashboard/roles")}>
              {backIcon}
              Roles
            </button>
            <div className={s.topbarSep} />
            <span className={s.topbarTitle}>Strategy Analyst</span>
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
            <div className={s.briefType}>Advisory · Strategy</div>
            <div className={s.briefTitle}>Strategy Analyst</div>

            <p className={s.briefSummary}>
              Structured problem-solving at scale. You&apos;re given a messy question and expected to break it
              down, find the signal in the data, and present a clear recommendation. The work spans multiple
              industries and problem types — breadth is the defining feature of the early career.
            </p>

            {/* Honest picture */}
            <div className={s.sLabel}>The honest picture</div>
            <div className={s.pictureGrid}>
              <div className={`${s.pictureCol} ${s.good}`}>
                <div className={s.pictureColLabel}>What&apos;s good</div>
                <ul className={s.pictureColList}>
                  <li>Unmatched breadth — you touch different industries and problems quickly</li>
                  <li>Strong analyst toolkit: modelling, frameworks, structured writing</li>
                  <li>Excellent exit options — VC, corporate strategy, PE, product</li>
                  <li>Direct exposure to senior decision-making early on</li>
                </ul>
              </div>
              <div className={`${s.pictureCol} ${s.hard}`}>
                <div className={s.pictureColLabel}>Worth knowing</div>
                <ul className={s.pictureColList}>
                  <li>First 1–2 years are heavily slide-production, not real strategy</li>
                  <li>Up-or-out culture at most firms — promotion pressure is constant</li>
                  <li>You rarely see long-term outcomes of your own work</li>
                  <li>Lifestyle demands vary widely — tier-one firms are intense</li>
                </ul>
              </div>
            </div>

            {/* Salary */}
            <div className={s.sLabel}>What it pays (UK)</div>
            <div className={s.salaryTable}>
              <div className={s.salaryRow}>
                <span className={s.salaryLevel} style={{ color: "var(--ink-3)", fontSize: "11px", letterSpacing: ".05em", textTransform: "uppercase", fontWeight: 700 }}>Level</span>
                <div className={s.salaryBar} style={{ opacity: 0 }} />
                <span className={s.salaryVal} style={{ color: "var(--ink-3)", fontSize: "11px", fontFamily: "var(--f)", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" }}>Typical range</span>
              </div>
              <div className={s.salaryRow}>
                <span className={s.salaryLevel}>Entry</span>
                <div className={s.salaryBar}><div className={s.salaryFill} style={{ width: "30%" }} /></div>
                <span className={s.salaryVal}>£35,000 – £55,000</span>
              </div>
              <div className={s.salaryRow}>
                <span className={s.salaryLevel}>Mid</span>
                <div className={s.salaryBar}><div className={s.salaryFill} style={{ width: "60%" }} /></div>
                <span className={s.salaryVal}>£65,000 – £120,000</span>
              </div>
              <div className={s.salaryRow}>
                <span className={s.salaryLevel}>Senior</span>
                <div className={s.salaryBar}><div className={s.salaryFill} style={{ width: "100%" }} /></div>
                <span className={`${s.salaryVal} ${s.top}`}>£120,000 – £250,000+</span>
              </div>
            </div>

            {/* What it rewards */}
            <div className={s.sLabel}>What it rewards</div>
            <div className={s.skillsList}>
              {[
                "Structured thinking — the ability to break a problem down before jumping to solutions",
                "Data fluency — not necessarily advanced, but comfortable building and reading models",
                "Storytelling through documents — translating analysis into a clear, persuasive narrative",
                "Intellectual curiosity across sectors — you need to care about unfamiliar industries",
                "Composure under ambiguity — you're often given a half-formed question and expected to sharpen it",
              ].map((skill) => (
                <div key={skill} className={s.skillItem}>
                  <div className={s.skillDot} />
                  {skill}
                </div>
              ))}
            </div>

            {/* Live listings link */}
            <a href="/dashboard/roles?tab=listings&filter=Strategy+Analyst" className={s.listingsLink}>
              <div>
                <div className={s.listingsLabel}>Live listings for Strategy Analyst</div>
                <div className={s.listingsSub}>6 listings · best match first</div>
              </div>
              <div className={s.listingsArrow}>→</div>
            </a>
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
                  This is a strong match for you. The way you described your thinking — wanting to understand
                  the why before the what — is exactly the instinct strategy roles reward. It&apos;s rare to
                  find that at entry level.
                </div>
                <div className={s.aiBubble}>
                  The honest limitation worth flagging: <strong>the first year is heavy on production
                  work.</strong> Decks, models, research. The actual strategic input comes as you prove your
                  judgement. That&apos;s worth knowing going in — people who find it frustrating usually
                  weren&apos;t told.
                </div>
                <div className={s.aiBubble}>
                  On getting in: you don&apos;t need a consulting background. You need to show that you think
                  in problems, not tasks. I&apos;d focus your application around one or two moments where you
                  diagnosed something that wasn&apos;t obvious and acted on it. That&apos;s what the interview
                  is really testing.
                </div>
              </div>

              <div className={s.userMsg}>
                <div className={s.userBubble}>What about consulting vs. in-house strategy?</div>
              </div>

              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  Consulting gives you breadth early and a strong exit platform. In-house gives you depth in
                  one organisation and a more sustainable lifestyle.{" "}
                  <strong>The real question is what you want at 27.</strong> Consulting alumni often move
                  in-house by then. In-house people rarely move to consulting. So consulting buys optionality;
                  in-house buys depth. Neither is wrong — depends on what you&apos;re optimising for.
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
                  placeholder="Ask Arlo anything about this role…"
                  value={chatValue}
                  onChange={(e) => setChatValue(e.target.value)}
                  onKeyDown={handleChatKey}
                />
                <button className={s.mentorSend} aria-label="Send" onClick={handleSend}>
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
