import s from "./page.module.css";
import RevealObserver from "@/components/RevealObserver";
import HomepageNav from "@/components/HomepageNav";

const ArloSvgLg = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#B87040" />
    <circle cx="28" cy="38" r="5" fill="#2C1A0E" />
    <circle cx="52" cy="38" r="5" fill="#2C1A0E" />
    <path d="M23 36 Q28 33 33 36" stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M47 36 Q52 33 57 36" stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4" />
    <circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4" />
    <path d="M32 51 Q40 53 48 51" stroke="#7A3E10" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const ArloSvgSm = () => (
  <svg viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="40" fill="#B87040" />
    <circle cx="28" cy="38" r="5" fill="#2C1A0E" />
    <circle cx="52" cy="38" r="5" fill="#2C1A0E" />
    <path d="M23 36 Q28 33 33 36" stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M47 36 Q52 33 57 36" stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4" />
    <circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4" />
    <path d="M32 51 Q40 53 48 51" stroke="#7A3E10" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

export default function HomePage() {
  return (
    <>
      <RevealObserver />

      {/* NAV */}
      <HomepageNav />

      {/* HERO */}
      <div className={s.heroZone}>
        <div className={s.wrap}>
          <section className={s.hero}>
            <h1 className={`${s.heroH1} reveal`}>
              You shouldn&rsquo;t have to figure out your career alone.
            </h1>
            <p className={`${s.heroSub} reveal`}>
              Arlo maps your direction, finds the roles that actually fit, and walks every step of the search with you — one clear action at a time.
            </p>
            <div className={`${s.heroActions} reveal`}>
              <a href="/workspace?view=first" className={s.ctaLg}>Start with who you are →</a>
              <span className={s.heroReassure}>Takes about a minute · No CV required</span>
            </div>
          </section>
        </div>

        {/* PRODUCT SHOT */}
        <section className={`${s.shot} reveal`}>
          <div className={s.shotFrame}>

            {/* Sidebar */}
            <nav className={s.shotNav}>
              <div className={s.shotBrand}>Career Intelligence</div>
              <div className={`${s.shotNi} ${s.shotNiActive}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Home
              </div>
              <div className={s.shotNi}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Roles
              </div>
              <div className={s.shotNi}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4V2M15 4V2M3 9h18M9 14h6" />
                </svg>
                Applications
              </div>
              <div className={s.shotNi}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19V10M10 19V5M16 19v-6M22 19H2" />
                </svg>
                Skills
              </div>
              <div className={s.shotGap} />
              <div className={s.shotProfile}>
                <div className={s.shotAv}>A</div>
                <div>
                  <div className={s.shotPname}>Alex C.</div>
                  <div className={s.shotPemail}>alex@email.com</div>
                </div>
              </div>
            </nav>

            {/* Left column */}
            <div className={s.shotLeft}>
              <div className={s.shotDate}>Good afternoon · Monday, 15 June</div>
              <div className={s.shotWelcome}>Welcome back, Alex.</div>
              <div className={s.shotDir}>
                <div className={s.shotDlabel}>Your direction</div>
                <div className={s.shotDtitle}>Early-stage fintech, moving fast.</div>
                <div className={s.shotDbody}>
                  You&rsquo;ve built real product instinct — not from a textbook, but from actually doing things. The roles that suit you aren&rsquo;t the obvious ones on a job board.
                </div>
              </div>
              <div className={s.shotTodayLabel}>Today</div>
              <div className={s.shotTodayAction}>Reach out to Sarah Chen at Monzo.</div>
              <div className={s.shotTodayWhy}>
                She came from a non-traditional background and has written about it publicly. Your story will land with her in a way a cold CV never would.
              </div>
              <div className={s.shotBtns}>
                <button className={s.shotBtnP}>Draft message →</button>
                <button className={s.shotBtnG}>Not today</button>
              </div>
            </div>

            {/* Arlo panel */}
            <div className={s.shotArlo}>
              <div className={s.shotArloHead}>
                <div className={s.shotArloAv}><ArloSvgLg /></div>
                <div>
                  <div className={s.shotArloName}>Arlo</div>
                  <div className={s.shotArloStatus}>Here with you</div>
                </div>
              </div>
              <div className={s.shotMsgs}>
                <div className={s.shotAi}>
                  Good afternoon, Alex. You have <strong>3 roles waiting</strong>, and Monzo is ahead by some distance. Want to talk through why?
                </div>
                <div className={s.shotUser}>Yes — why Monzo specifically?</div>
                <div className={s.shotAi}>
                  Their APM programme actively recruits non-traditional backgrounds — they&rsquo;ve said so publicly. And your instinct toward products that genuinely help people with money maps directly to what they&rsquo;re building.<br /><br />
                  <strong>You&rsquo;re not a stretch here. You&rsquo;re exactly who they&rsquo;re looking for.</strong>
                </div>
              </div>
              <div className={s.shotInputWrap}>
                <div className={s.shotInputCard}>
                  <input className={s.shotInput} type="text" placeholder="Ask me anything…" readOnly />
                  <button className={s.shotSend}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* FEATURES */}
      <div className={s.wrap}>
        <section className={s.featSec}>

          {/* Feature 1: Your direction */}
          <div className={`${s.featBlock} reveal`}>
            <div>
              <div className={s.featEyebrow}>01 · Your direction</div>
              <h2 className={s.featH2}>From who you are to where you&rsquo;re going.</h2>
              <p className={s.featBody}>
                Tell Arlo about yourself — not your CV, but you. Your instincts, what you&rsquo;ve actually done, what energises you. In return: a clear direction in plain words. Not a quiz result. Not a list of job titles. A real read of where you fit.
              </p>
              <div className={s.featIllo}>
                <svg width="120" height="86" viewBox="0 0 130 90" fill="none">
                  <path d="M65 10 L105 30 L65 50 L25 30 Z" stroke="#B05E16" strokeWidth="1.6" />
                  <path d="M65 30 L105 50 L65 70 L25 50 Z" stroke="#837B6D" strokeWidth="1.6" />
                  <path d="M65 50 L105 70 L65 90 L25 70 Z" stroke="#BDB7AC" strokeWidth="1.4" opacity="0.5" />
                  <line x1="65" y1="0" x2="65" y2="12" stroke="#B05E16" strokeWidth="1.8" />
                  <circle cx="65" cy="0" r="3.5" fill="#B05E16" />
                </svg>
              </div>
            </div>
            <div className={s.featVis}>
              <div className={s.f1Dir}>
                <div className={s.f1Dlabel}>Your direction</div>
                <div className={s.f1Dtitle}>
                  Product &amp; strategy in early-stage tech — because of what you&rsquo;ve already built, not where you went to university.
                </div>
                <div className={s.f1Dbody} style={{ marginTop: 10 }}>
                  Your instinct for product came from doing, not studying. You built things, saw what worked, and learned from what didn&rsquo;t. The companies that will value you most are the ones building fast — where that kind of instinct matters more than credentials.
                </div>
              </div>
              <div className={s.f1ArloNote}>
                <div className={s.f1ArloAv}><ArloSvgSm /></div>
                <p className={s.f1ArloText}>
                  I can see three roles where your background is genuinely rare. I want to show you them in order.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2: Roles that fit */}
          <div className={`${s.featBlock} reveal`}>
            <div className={s.featVis}>
              <div className={s.f2Roles}>
                <div className={s.f2Rcard}>
                  <div>
                    <div className={s.f2Rco}>Monzo</div>
                    <div className={s.f2Rro}>Associate Product Manager · London · £55k</div>
                  </div>
                  <div className={`${s.f2Fit} ${s.f2FitStrong}`}>Strong fit</div>
                </div>
                <div className={s.f2Rcard}>
                  <div>
                    <div className={s.f2Rco}>Wise</div>
                    <div className={s.f2Rro}>Product Analyst · Remote · £48k</div>
                  </div>
                  <div className={`${s.f2Fit} ${s.f2FitGood}`}>Good fit</div>
                </div>
                <div className={s.f2Rcard}>
                  <div>
                    <div className={s.f2Rco}>Cleo</div>
                    <div className={s.f2Rro}>Associate PM · London · £52k</div>
                  </div>
                  <div className={`${s.f2Fit} ${s.f2FitGood}`}>Good fit</div>
                </div>
              </div>
            </div>
            <div>
              <div className={s.featEyebrow}>02 · Roles that fit</div>
              <h2 className={s.featH2}>Live listings. Ranked by how close you already are.</h2>
              <p className={s.featBody}>
                Real roles, updated daily. Each one scored against your direction and background — not keywords, but fit. Each one tells you exactly why it&rsquo;s right and who to reach out to. No scrolling through hundreds of listings that aren&rsquo;t for you.
              </p>
              <div className={s.featIllo}>
                <svg width="120" height="86" viewBox="0 0 130 90" fill="none">
                  <path d="M38 28 L56 37 L38 46 L20 37 Z" stroke="#BDB7AC" strokeWidth="1.4" />
                  <path d="M20 37 L20 55 L38 64 L38 46 Z" stroke="#BDB7AC" strokeWidth="1.4" />
                  <path d="M56 37 L56 55 L38 64 L38 46 Z" stroke="#BDB7AC" strokeWidth="1.4" />
                  <path d="M92 36 L110 45 L92 54 L74 45 Z" stroke="#BDB7AC" strokeWidth="1.4" />
                  <path d="M74 45 L74 63 L92 72 L92 54 Z" stroke="#BDB7AC" strokeWidth="1.4" />
                  <path d="M110 45 L110 63 L92 72 L92 54 Z" stroke="#BDB7AC" strokeWidth="1.4" />
                  <path d="M65 50 L83 59 L65 68 L47 59 Z" stroke="#B05E16" strokeWidth="1.8" />
                  <path d="M47 59 L47 81 L65 90 L65 68 Z" stroke="#B05E16" strokeWidth="1.8" />
                  <path d="M83 59 L83 81 L65 90 L65 68 Z" stroke="#B05E16" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature 3: Every day */}
          <div className={`${s.featBlock} reveal`}>
            <div>
              <div className={s.featEyebrow}>03 · Every day</div>
              <h2 className={s.featH2}>Close the gap. One step at a time.</h2>
              <p className={s.featBody}>
                Arlo knows exactly what stands between you and the role — and what to do about it today. Not a generic skills list. A specific plan, updated as you make progress, from someone who knows your whole search.
              </p>
              <div className={s.featIllo}>
                <svg width="130" height="86" viewBox="0 0 150 86" fill="none">
                  <line x1="14" y1="14" x2="136" y2="14" stroke="#B05E16" strokeWidth="1.2" strokeDasharray="3 4" />
                  <path d="M28 52 L40 58 L28 64 L16 58 Z" stroke="#BDB7AC" strokeWidth="1.4" opacity="0.5" />
                  <path d="M16 58 L16 76 L28 82 L28 64 Z" stroke="#BDB7AC" strokeWidth="1.4" opacity="0.5" />
                  <path d="M40 58 L40 76 L28 82 L28 64 Z" stroke="#BDB7AC" strokeWidth="1.4" opacity="0.5" />
                  <path d="M68 40 L80 46 L68 52 L56 46 Z" stroke="#837B6D" strokeWidth="1.4" />
                  <path d="M56 46 L56 76 L68 82 L68 52 Z" stroke="#837B6D" strokeWidth="1.4" />
                  <path d="M80 46 L80 76 L68 82 L68 52 Z" stroke="#837B6D" strokeWidth="1.4" />
                  <path d="M108 20 L120 26 L108 32 L96 26 Z" stroke="#B05E16" strokeWidth="1.8" />
                  <path d="M96 26 L96 76 L108 82 L108 32 Z" stroke="#B05E16" strokeWidth="1.8" />
                  <path d="M120 26 L120 76 L108 82 L108 32 Z" stroke="#B05E16" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
            <div className={`${s.featVis} ${s.featVisCream}`}>
              <div className={s.f3ArloHead}>
                <div className={s.f3ArloAv}><ArloSvgLg /></div>
                <div>
                  <div className={s.f3ArloName}>Arlo</div>
                  <div className={s.f3ArloStatus}>Here with you</div>
                </div>
              </div>
              <div className={s.f3Msgs}>
                <div className={s.f3Ai}>
                  SQL is the gap worth closing first. You&rsquo;re at 35% — <strong>three focused weeks</strong> gets you past what Monzo actually needs for this role.
                  <div className={s.f3BarWrap} style={{ marginTop: 12 }}>
                    <div className={s.f3BarLabel}>
                      SQL <span>Monzo APM level →</span>
                    </div>
                    <div className={s.f3Track}>
                      <div className={s.f3Fill} />
                      <div className={s.f3Target} />
                    </div>
                  </div>
                </div>
                <div className={s.f3User}>Where do I start?</div>
                <div className={s.f3Ai}>
                  Mode Analytics — two hours today. I&rsquo;ll check in tomorrow and adjust if needed.
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>

      {/* QUOTES */}
      <div className={s.wrap}>
        <section className={`${s.quotesSec} reveal`}>
          <div className={s.quotesEyebrow}>Built from conversations like these</div>
          <div className={s.quotesGrid}>
            <div className={s.quoteCard}>
              <div className={s.quoteMark}>&ldquo;</div>
              <p className={s.quoteText}>You question your worth. You question — when am I going to start my life?</p>
              <div className={s.quoteAttr}>Finance graduate · UCL, 2025</div>
            </div>
            <div className={s.quoteCard}>
              <div className={s.quoteMark}>&ldquo;</div>
              <p className={s.quoteText}>I can&rsquo;t be bothered because the process is so horrible.</p>
              <div className={s.quoteAttr}>Graduate · Fashion, 2025</div>
            </div>
            <div className={s.quoteCard}>
              <div className={s.quoteMark}>&ldquo;</div>
              <p className={s.quoteText}>I did low-key get to a point where I was like, I&rsquo;ll take anything.</p>
              <div className={s.quoteAttr}>PPE graduate · Politics &amp; comms, 2024</div>
            </div>
          </div>
        </section>
      </div>

      {/* CLOSING CTA */}
      <div className={s.wrap}>
        <section className={`${s.closing} reveal`}>
          <h2 className={s.closingH2}>Your career deserves more than a job board.</h2>
          <p className={s.closingP}>Start with one minute. Tell Arlo who you are.</p>
          <a href="/workspace?view=first" className={s.ctaLg}>Start with who you are →</a>
          <span className={s.closingReassure}>Takes about a minute · No CV required</span>
        </section>
      </div>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footIn}>
          <div>
            <span className={s.footWordmark}>Career Intelligence</span>
            <p className={s.footBlurb}>For graduates at a crossroads. Start from who you are.</p>
          </div>
          <div className={s.footRight}>
            <div className={s.footLinks}>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="mailto:hello@careerintelligence.co">Contact</a>
            </div>
            <div className={s.footCopy}>© 2026 Career Intelligence</div>
          </div>
        </div>
      </footer>
    </>
  );
}
