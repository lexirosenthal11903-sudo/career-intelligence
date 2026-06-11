"use client";

import { useState } from "react";
import s from "./roles.module.css";

const ARLO_42 = `<svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 31 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 31 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M30 50 Q40 55 50 50" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const ARLO_16 = `<svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 31 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 31 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M30 50 Q40 55 50 50" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const sendIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 7h12M7 1l6 6-6 6" />
  </svg>
);

const ROLE_TYPES = [
  {
    id: "strategy-analyst",
    title: "Strategy Analyst",
    desc: "Turn ambiguous business problems into structured recommendations. Analysis-heavy, high exposure.",
    salary: { entry: "£35–55k", mid: "£65–120k", senior: "£120–250k+" },
  },
  {
    id: "operations-associate",
    title: "Operations Associate",
    desc: "Make organisations run better. Spans process design, resource planning, and cross-team coordination.",
    salary: { entry: "£30–45k", mid: "£50–90k", senior: "£90–180k+" },
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    desc: "Bridge between data and decisions. Translate business needs into clear analysis that shapes what happens next.",
    salary: { entry: "£28–42k", mid: "£50–80k", senior: "£80–150k+" },
  },
  {
    id: "management-consultant",
    title: "Management Consultant",
    desc: "Advise organisations on their biggest problems. Intense, well-paid, excellent exit options.",
    salary: { entry: "£40–65k", mid: "£80–140k", senior: "£150–400k+" },
  },
  {
    id: "chief-of-staff",
    title: "Chief of Staff",
    desc: "Run the operating system of an executive or team. High trust, high access, broad scope.",
    salary: { entry: "£35–55k", mid: "£65–120k", senior: "£120–300k+" },
  },
];

const JOBS = [
  {
    id: "monzo-strategy",
    title: "Strategy Analyst",
    company: "Monzo",
    location: "Hybrid · London",
    salary: "£38,000 – £48,000",
    age: "1d ago",
    tags: ["Strategy", "Operations", "Full-time"],
    desc: "Working with Monzo's growth and product teams to model strategic options and surface the decisions that matter most.",
    type: "strategy-analyst",
    initiallyInterested: true,
  },
  {
    id: "deliveroo-ba",
    title: "Business Analyst — Operations",
    company: "Deliveroo",
    location: "Hybrid · London",
    salary: "£34,000 – £44,000",
    age: "3d ago",
    tags: ["Business analysis", "Operations", "Full-time"],
    desc: "Diagnosing and improving how Deliveroo's logistics operations run, using data to find the friction and recommend fixes.",
    type: "business-analyst",
    initiallyInterested: false,
  },
  {
    id: "oliver-wyman",
    title: "Associate Consultant",
    company: "Oliver Wyman",
    location: "On-site · London",
    salary: "£45,000 – £60,000",
    age: "5d ago",
    tags: ["Consulting", "Strategy", "Graduate scheme"],
    desc: "Graduate-entry consulting across financial services and operations clients. Structured pathway with clear promotion milestones.",
    type: "management-consultant",
    initiallyInterested: false,
  },
];

const FILTERS = ["All", "Strategy Analyst", "Operations Associate", "Business Analyst", "Management Consultant", "Chief of Staff", "Passed"];

export default function RolesPage() {
  const [tab, setTab] = useState<"types" | "listings">("types");
  const [arloVisible, setArloVisible] = useState(true);
  const [chatValue, setChatValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [interested, setInterested] = useState<Set<string>>(
    new Set(JOBS.filter((j) => j.initiallyInterested).map((j) => j.id))
  );
  const [passed, setPassed] = useState<Set<string>>(new Set());

  function handleInterested(id: string) {
    setInterested((prev) => new Set([...prev, id]));
  }
  function handlePass(id: string) {
    setPassed((prev) => new Set([...prev, id]));
  }

  const visibleJobs = JOBS.filter((j) => {
    if (activeFilter === "Passed") return passed.has(j.id);
    if (activeFilter === "All") return !passed.has(j.id) || interested.has(j.id);
    const typeMatch = ROLE_TYPES.find((r) => r.id === j.type)?.title === activeFilter;
    return typeMatch && !passed.has(j.id);
  });

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
          <span className={s.topbarTitle}>Roles</span>
          <button className={s.arloToggle} onClick={() => setArloVisible((v) => !v)}>
            <span dangerouslySetInnerHTML={{ __html: ARLO_16 }} />
            {arloVisible ? "Hide Arlo" : "Show Arlo"}
          </button>
        </div>

        {/* Content split */}
        <div className={`${s.content}${!arloVisible ? ` ${s.arloHidden}` : ""}`}>

          {/* LEFT: Roles */}
          <div className={s.rolesPanel}>

            <div className={s.directionCard}>
              <div className={s.directionLabel}>Your direction</div>
              <div className={s.directionTitle}>Systems thinker, people problems.</div>
              <div className={s.directionSub}>5 role types matched · 18 live listings</div>
            </div>

            {/* Tab switcher */}
            <div className={s.tabRow}>
              <button
                className={`${s.tab}${tab === "types" ? ` ${s.tabActive}` : ""}`}
                onClick={() => setTab("types")}
              >
                Role types <span className={s.tabCount}>5</span>
              </button>
              <button
                className={`${s.tab}${tab === "listings" ? ` ${s.tabActive}` : ""}`}
                onClick={() => setTab("listings")}
              >
                Live listings <span className={s.tabCount}>18</span>
              </button>
            </div>

            {/* Panel: Role types */}
            {tab === "types" && (
              <div className={s.roleCards}>
                {ROLE_TYPES.map((role) => (
                  <div key={role.id} className={s.roleCard}>
                    <div className={s.roleCardBody}>
                      <div className={s.roleCardTitle}>{role.title}</div>
                      <div className={s.roleCardDesc}>{role.desc}</div>
                      <div className={s.roleCardSalary}>
                        Entry <span>{role.salary.entry}</span> · Mid{" "}
                        <span>{role.salary.mid}</span> · Senior{" "}
                        <span>{role.salary.senior}</span>
                      </div>
                    </div>
                    <div className={s.roleCardArrow}>
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6h8M6 2l4 4-4 4" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Panel: Live listings */}
            {tab === "listings" && (
              <>
                <div className={s.filterPills}>
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      className={`${s.fpill}${activeFilter === f ? ` ${s.fpillActive}` : ""}`}
                      onClick={() => setActiveFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className={s.jobs}>
                  {visibleJobs.map((job) => {
                    const isInterested = interested.has(job.id);
                    return (
                      <div key={job.id} className={`${s.job}${isInterested ? ` ${s.jobInterested}` : ""}`}>
                        <div className={s.jobTitleRow}>
                          <div className={s.jobTitle}>{job.title}</div>
                          {isInterested && (
                            <span className={s.jobBadge}>Interested</span>
                          )}
                        </div>
                        <div className={s.jobMeta}>
                          <span className={s.jobCompany}>{job.company}</span>
                          <span className={s.dot} />
                          <span>{job.location}</span>
                          <span className={s.dot} />
                          <span>{job.salary}</span>
                          <span className={s.dot} />
                          <span>{job.age}</span>
                        </div>
                        <div className={s.jobTags}>
                          {job.tags.map((t) => (
                            <span key={t} className={s.jobTag}>{t}</span>
                          ))}
                        </div>
                        <div className={s.jobDesc}>{job.desc}</div>
                        <div className={s.jobActions}>
                          {isInterested ? (
                            <a href="/dashboard/applications" className={s.btnViewApp}>
                              View in Applications →
                            </a>
                          ) : (
                            <>
                              <button className={s.btnInterested} onClick={() => handleInterested(job.id)}>
                                Interested
                              </button>
                              <button className={s.btnPass} onClick={() => handlePass(job.id)}>
                                Pass
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={s.loadMore}>
                  <button className={s.btnLoad}>Load 15 more</button>
                </div>
              </>
            )}

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
                  Five roles matched to your direction. Click into any of them and I&apos;ll
                  tell you honestly whether it fits you — and what it would actually take to
                  get there given your background.
                </div>
                <div className={s.aiBubble}>
                  The Monzo listing is worth looking at. They&apos;re building a strategy
                  function from scratch and tend to hire for instinct over credentials.
                </div>
              </div>

              <div className={s.userMsg}>
                <div className={s.userBubble}>Why Strategy Analyst specifically over the others?</div>
              </div>

              <div className={s.aiMsg}>
                <div className={s.aiBubble}>
                  Because of the way you described how you think. You don&apos;t just want to
                  execute — you want to understand why a decision is being made before you help
                  make it. That&apos;s the strategy mindset.{" "}
                  <strong>Operations</strong> is closer to execution.{" "}
                  <strong>Consulting</strong> has the same intellectual pull but the lifestyle
                  is different. Worth reading both briefs before you decide.
                </div>
              </div>
            </div>

            <div className={s.mentorInputWrap}>
              <div className={s.mentorInputCard}>
                <input
                  className={s.mentorInput}
                  type="text"
                  placeholder="Ask Arlo about any of these roles…"
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
