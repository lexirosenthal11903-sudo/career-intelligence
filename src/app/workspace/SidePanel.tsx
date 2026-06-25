"use client";

/* Side panel — hosts one thing at a time (COMPONENT-INVENTORY §9): the roles list,
   a single role (with contact + outreach + skills *inside* it — never separate tabs),
   the direction, or documents. Which surface shows is driven by the left nav (`view`).
   Roles wire to the real pipeline via usePanelJobs (same flow as the dashboard Roles tab).
   All advisor copy is verbatim from VOICE-IN-UI.md — never invented here. Tokens only. */
import { useEffect, useMemo, useRef, useState } from "react";
import s from "./workspace.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { usePanelJobs, type PanelJob, type AnalysisProfile } from "./usePanelJobs";
import { RolesIcon, DirectionIcon, DocumentsIcon, ProfileIcon, CloseIcon, HintIcon, ChevronIcon } from "./icons";
import CompanyLogo from "./CompanyLogo";
export type PanelView = "roles" | "direction" | "documents" | "saved" | "profile";

const LOGO_TOKENS = ["--logo-1", "--logo-2", "--logo-3", "--logo-4", "--logo-5", "--logo-6"];

/* Deterministic decorative tile colour from the company name. */
function logoColour(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `var(${LOGO_TOKENS[h % LOGO_TOKENS.length]})`;
}

/* Ask the advisor about something — handed to the conversation pane (ChatPane listens). */
function askAdvisor(prompt: string) {
  window.dispatchEvent(new CustomEvent("ci:ask-advisor", { detail: prompt }));
}

const TAB = {
  roles: { icon: RolesIcon, label: "Roles for you", title: "Roles for you" },
  direction: { icon: DirectionIcon, label: "Your direction", title: "Your direction" },
  documents: { icon: DocumentsIcon, label: "Documents", title: "Documents" },
  saved: { icon: RolesIcon, label: "Saved role", title: "Saved role" },
  profile: { icon: ProfileIcon, label: "Your profile", title: "Your profile" },
} as const;

export default function SidePanel({
  view,
  savedJobId,
  data,
  onClose,
  onOpenRoles,
}: {
  view: PanelView;
  savedJobId?: string | null;
  data: ReturnType<typeof usePanelJobs>;
  onClose: () => void;
  onOpenRoles?: () => void;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { profile, hasResult, jobs, jobsLoading, jobsError, retry, markSeen } = data;

  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<PanelJob | null>(null);
  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [tailoring, setTailoring] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, [supabase]);

  // Load saved interested/passed state once signed in.
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch("/api/save-job");
        if (!res.ok) return;
        const data = await res.json();
        const saved: Array<{ id: string | number; status?: string }> = data.jobs || [];
        setInterested(new Set(saved.filter((j) => j.status === "interested").map((j) => String(j.id))));
        setPassed(new Set(saved.filter((j) => j.status === "passed").map((j) => String(j.id))));
      } catch { /* ignore */ }
    })();
  }, [userId]);

  // Switching surface clears any open role — adjusted during render (React docs
  // "storing information from previous renders"), not in an effect.
  const [prevView, setPrevView] = useState(view);
  if (view !== prevView) {
    setPrevView(view);
    setSelected(null);
  }

  // Clear the "new since you last looked" badges once the user leaves Roles —
  // honest: they're no longer new next time. Robust under Strict Mode (no cleanup).
  const leftRolesRef = useRef(view);
  useEffect(() => {
    if (leftRolesRef.current === "roles" && view !== "roles") markSeen();
    leftRolesRef.current = view;
  }, [view, markSeen]);

  const tab = TAB[view];
  const TabIcon = tab.icon;

  return (
    <aside className={s.side}>
      <div className={s.sideTabs}>
        <div className={s.stab}>
          <TabIcon width={14} height={14} /> {tab.label}
          <button className={s.x} type="button" onClick={onClose} aria-label="Close panel">
            <CloseIcon />
          </button>
        </div>
      </div>

      {view === "roles" && (
        selected ? (
          <RoleDetail
            job={selected}
            skills={profile?.extractedSkills ?? []}
            interested={interested.has(String(selected.id))}
            saving={saving.has(String(selected.id))}
            onBack={() => setSelected(null)}
            onInterested={() => handleInterested(selected)}
            onPass={() => handlePass(selected)}
            onTailorCV={() => handleTailorCV(selected)}
            tailoring={tailoring}
          />
        ) : (
          <RolesList
            hasResult={hasResult}
            jobs={jobs}
            jobsLoading={jobsLoading}
            jobsError={jobsError}
            passed={passed}
            interested={interested}
            onRetry={retry}
            onReview={setSelected}
          />
        )
      )}

      {view === "direction" && <DirectionView profile={profile} hasResult={hasResult} />}
      {view === "documents" && <DocumentsView />}
      {view === "saved" && <SavedJobDetail jobId={savedJobId ?? null} onOpenRoles={onOpenRoles} />}
      {view === "profile" && <ProfileView analysisProfile={profile} />}

    </aside>
  );

  // ── Interested / Pass — same data path as the dashboard Roles tab ──────────
  async function handleInterested(job: PanelJob) {
    if (!userId) {
      window.location.href = "/?signup=required&next=/workspace";
      return;
    }
    const id = String(job.id);
    setInterested((prev) => new Set([...prev, id]));
    setPassed((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setSaving((prev) => new Set([...prev, id]));
    const payload = { ...job, id, status: "interested" };
    try {
      await Promise.all([
        fetch("/api/save-job", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: id, jobData: payload }),
        }),
        fetch("/api/applications", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: id, jobData: payload }),
        }),
      ]);
    } catch { /* surfaced via state; advisor owns errors in chat */ }
    finally { setSaving((prev) => { const n = new Set(prev); n.delete(id); return n; }); }
    // Let the left-nav "Recent" pick this up without a reload (progressive disclosure).
    window.dispatchEvent(new CustomEvent("ci:roles-changed"));
    // Forward-looking so the advisor helps with it now, rather than acknowledging a
    // save it can already see in context (the "you've already done that" bug).
    askAdvisor(`I've just said I'm interested in the ${job.title} role at ${job.company} — what should we do about it?`);
  }

  async function handleTailorCV(job: PanelJob) {
    setTailoring(true);
    try {
      const res = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          jobCompany: job.company,
          jobDescription: job.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "no_cv") {
          window.dispatchEvent(new CustomEvent("ci:ask-advisor", {
            detail: "I tried to tailor my CV but don't have one on file yet. How do I add my CV?",
          }));
        } else {
          window.dispatchEvent(new CustomEvent("ci:ask-advisor", {
            detail: `Something went wrong tailoring my CV for the ${job.title} role. Can you help?`,
          }));
        }
        return;
      }
      window.dispatchEvent(new CustomEvent("ci:open-documents"));
    } catch {
      window.dispatchEvent(new CustomEvent("ci:ask-advisor", {
        detail: `I had trouble tailoring my CV for the ${job.title} role. Can you help?`,
      }));
    } finally {
      setTailoring(false);
    }
  }

  async function handlePass(job: PanelJob) {
    const id = String(job.id);
    setPassed((prev) => new Set([...prev, id]));
    setSaving((prev) => new Set([...prev, id]));
    try {
      await fetch("/api/save-job", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, jobData: { ...job, id, status: "passed" } }),
      });
    } catch { /* ignore */ }
    finally { setSaving((prev) => { const n = new Set(prev); n.delete(id); return n; }); }
    setSelected(null);
    window.dispatchEvent(new CustomEvent("ci:roles-changed"));
    askAdvisor(`I'll pass on the ${job.title} role at ${job.company}.`);
  }
}

/* ===== Roles list ========================================================== */
const INITIAL_VISIBLE = 8; // show a focused set first, not a wall (Lexi feedback 2026-06-22)

function RolesList({
  hasResult, jobs, jobsLoading, jobsError, passed, interested, onRetry, onReview,
}: {
  hasResult: boolean | null;
  jobs: PanelJob[];
  jobsLoading: boolean;
  jobsError: boolean;
  passed: Set<string>;
  interested: Set<string>;
  onRetry: () => void;
  onReview: (job: PanelJob) => void;
}) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  // Drop low-scoring/senior results (keep unscored); hide passed unless re-flagged interested.
  // Rank new-today first, then by fit, so the cap keeps the most relevant.
  const ranked = jobs
    .filter((j) => !j.relevanceScore || j.relevanceScore >= 4)
    .filter((j) => !passed.has(String(j.id)) || interested.has(String(j.id)))
    .sort((a, b) =>
      (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) ||
      (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
    );
  const total = ranked.length;
  const display = ranked.slice(0, visible);
  const strong = display.filter((j) => (j.relevanceScore ?? 0) >= 7);
  const good = display.filter((j) => (j.relevanceScore ?? 0) < 7);
  const hasMore = visible < total;
  const newCount = ranked.filter((j) => j.isNew).length;

  return (
    <>
      <div className={s.sideH}>
        <div className={s.ti}>
          <h3>Roles for you</h3>
          {!jobsLoading && total > 0 && <span className={s.n}>{total} live</span>}
        </div>
        <div className={s.sub}>
          Ranked by fit{newCount > 0 ? ` · ${newCount} new since you last looked` : " · stable until your direction changes"}
        </div>
        <div className={s.hint}>
          <HintIcon /> Don&rsquo;t scroll endlessly — just tell me what to change.
        </div>
      </div>

      <div className={s.sideB}>
        {/* loading */}
        {jobsLoading && [0, 1, 2, 3].map((i) => (
          <div key={i} className={`${s.job} ${s.skeleton}`} style={{ height: "66px" }} />
        ))}

        {/* error — advisor owns the error voice (ADVISOR_PERSONA / VOICE-IN-UI) */}
        {!jobsLoading && jobsError && (
          <div className={s.panelEmpty}>
            <p>Something went wrong on my end pulling these in. It&rsquo;s not you — it&rsquo;s me.</p>
            <button className={s.panelRetry} type="button" onClick={onRetry}>Try again</button>
          </div>
        )}

        {/* pre-analysis empty state (verbatim, VOICE-IN-UI §5) */}
        {!jobsLoading && !jobsError && hasResult === false && (
          <div className={s.panelEmpty}>
            <p>Once I&rsquo;ve read your background, the roles that actually fit show up here — ranked, not a wall of listings. We&rsquo;ll go through them together.</p>
          </div>
        )}

        {/* nothing new today (verbatim, VOICE-IN-UI §5) */}
        {!jobsLoading && !jobsError && hasResult && total === 0 && (
          <div className={s.panelEmpty}>
            <p>Nothing new worth showing you today — and that&rsquo;s fine. Better than padding it out with roles that don&rsquo;t fit. The moment something real lands, I&rsquo;ll flag it here.</p>
          </div>
        )}

        {/* grouped lists — labels, never numeric scores */}
        {!jobsLoading && !jobsError && total > 0 && (
          <>
            {strong.length > 0 && <div className={s.grp}>Strong fit</div>}
            {strong.map((j) => <JobRow key={String(j.id)} job={j} strong onReview={onReview} />)}
            {good.length > 0 && <div className={s.grp}>Good fit</div>}
            {good.map((j) => <JobRow key={String(j.id)} job={j} strong={false} onReview={onReview} />)}
            {hasMore && (
              <button className={s.showMore} type="button" onClick={() => setVisible((v) => v + INITIAL_VISIBLE)}>
                Show me more roles ({total - visible} more)
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

function JobRow({ job, strong, onReview }: { job: PanelJob; strong: boolean; onReview: (j: PanelJob) => void }) {
  const initial = (job.company || job.title || "?").trim()[0]?.toUpperCase() ?? "?";
  const meta = [job.company, job.location, job.salary].filter((x) => x && x !== "Not listed").join(" · ");
  return (
    <button className={s.job} type="button" onClick={() => onReview(job)}>
      <CompanyLogo
        company={job.company || job.title || "?"}
        fallbackColor={logoColour(job.company || job.title || "?")}
        initial={initial}
        className={s.jlogo}
      />
      <div className={s.jmid}>
        <div className={s.jt}>
          {strong && <span className={s.dot} />}
          {job.title}
          {job.isNew && <span className={s.newPill}>New</span>}
        </div>
        <div className={s.jc}>{meta}</div>
        <span className={`${s.jfit} ${strong ? "" : s.good}`}>{strong ? "Strong fit" : "Good fit"}</span>
      </div>
      <span className={s.jrev}>View <ChevronIcon /></span>
    </button>
  );
}

/* ===== Single role — contact + outreach + skills INSIDE the role =========== */
function RoleDetail({
  job, skills, interested, saving, onBack, onInterested, onPass, onTailorCV, tailoring,
}: {
  job: PanelJob;
  skills: string[];
  interested: boolean;
  saving: boolean;
  onBack: () => void;
  onInterested: () => void;
  onPass: () => void;
  onTailorCV: () => void;
  tailoring: boolean;
}) {
  const initial = (job.company || job.title || "?").trim()[0]?.toUpperCase() ?? "?";
  const strong = (job.relevanceScore ?? 0) >= 7;
  const meta = [job.company, job.location, job.salary].filter((x) => x && x !== "Not listed").join(" · ");

  return (
    <div className={s.sideB}>
      <button className={s.rdBack} type="button" onClick={onBack}>
        <ChevronIcon style={{ transform: "rotate(180deg)" }} /> Roles for you
      </button>

      <div className={s.rdHead}>
        <CompanyLogo
          company={job.company || job.title || "?"}
          fallbackColor={logoColour(job.company || job.title || "?")}
          initial={initial}
          className={s.rdLogo}
        />
        <div>
          <h3 className={s.rdTitle}>{job.title}</h3>
          <div className={s.rdMeta}>{meta}</div>
          <span className={`${s.jfit} ${strong ? "" : s.good}`}>{strong ? "Strong fit" : "Good fit"}</span>
        </div>
      </div>

      {job.relevanceReason && (
        <div className={s.rdSection}>
          <div className={s.rdLabel}>Why this fits you</div>
          <p className={s.rdReason}>{job.relevanceReason}</p>
        </div>
      )}

      {job.description && (
        <div className={s.rdSection}>
          <div className={s.rdLabel}>About the role</div>
          <p className={s.rdText}>{job.description}</p>
        </div>
      )}

      {/* Skills — what you'd bring, from the analysis (real data) */}
      {skills.length > 0 && (
        <div className={s.rdSection}>
          <div className={s.rdLabel}>What you&rsquo;d bring</div>
          <div className={s.rdSkills}>
            {skills.slice(0, 8).map((sk) => <span key={sk} className={s.rdSkill}>{sk}</span>)}
          </div>
        </div>
      )}

      {/* Contact — sourcing is parked for legal sign-off; the advisor coaches you in the
          conversation rather than scraping an address. The chip hands off to chat. */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>Reaching out</div>
        <p className={s.rdText}>Contacts aren&rsquo;t scraped or stored. Who to approach, and how, gets worked out in the conversation.</p>
        <button className={s.chip} type="button" onClick={() => window.dispatchEvent(new CustomEvent("ci:ask-advisor", { detail: `Who should I reach out to about the ${job.title} role at ${job.company}?` }))}>
          Help me find the right person
        </button>
      </div>

      {/* Outreach — drafted with the advisor (execution being reworked, plan §2). */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>Outreach draft</div>
        <p className={s.rdText}>Outreach messages get drafted in the conversation and saved here once you&rsquo;re happy with them.</p>
        <button className={s.chip} type="button" onClick={() => window.dispatchEvent(new CustomEvent("ci:ask-advisor", { detail: `Help me draft an outreach message for the ${job.title} role at ${job.company}.` }))}>
          Draft an outreach message
        </button>
      </div>

      <div className={s.rdActions}>
        {interested ? (
          <>
            <span className={s.rdInterested}>✓ Interested — tracked in Applications</span>
            <button
              className={s.rdTailorBtn}
              type="button"
              onClick={onTailorCV}
              disabled={tailoring}
            >
              {tailoring ? "Tailoring your CV…" : "Tailor my CV for this role"}
            </button>
          </>
        ) : (
          <>
            <button className={s.rdInterestedBtn} type="button" onClick={onInterested} disabled={saving}>I&rsquo;m interested</button>
            <button className={s.rdPassBtn} type="button" onClick={onPass} disabled={saving}>Pass</button>
          </>
        )}
        {job.applyUrl && (
          <a className={s.rdListing} href={job.applyUrl} target="_blank" rel="noopener noreferrer">View listing ↗</a>
        )}
      </div>
    </div>
  );
}

/* ===== Saved-job detail — the tracked-role page (J&J reference) ============= */
interface SavedApplication {
  job_id: string;
  job_data: PanelJob;
  stage: string;
  notes: string | null;
  created_at: string;
}

const STAGES: Array<{ key: string; label: string }> = [
  { key: "preparing", label: "Preparing" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
  return "last month";
}

function SavedJobDetail({ jobId, onOpenRoles }: { jobId: string | null; onOpenRoles?: () => void }) {
  const [app, setApp] = useState<SavedApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<string>("preparing");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/applications");
        if (!res.ok) { if (!cancelled) setApp(null); return; }
        const { applications } = await res.json();
        const found: SavedApplication | undefined = (applications || []).find(
          (a: SavedApplication) => String(a.job_id) === String(jobId)
        );
        if (cancelled) return;
        setApp(found ?? null);
        if (found) { setStage(found.stage || "preparing"); setNote(found.notes || ""); }
      } catch {
        if (!cancelled) setApp(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [jobId]);

  async function setStageAndSave(next: string) {
    if (!app) return;
    setStage(next);
    try {
      await fetch("/api/applications", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: app.job_id, stage: next }),
      });
    } catch { /* optimistic; advisor owns errors in chat */ }
  }

  async function saveNote() {
    if (!app) return;
    setNoteSaved(false);
    try {
      await fetch("/api/applications", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: app.job_id, notes: note }),
      });
      setNoteSaved(true);
    } catch { /* best-effort */ }
  }

  const backBtn = (
    <button className={s.rdBack} type="button" onClick={onOpenRoles}>
      <ChevronIcon style={{ transform: "rotate(180deg)" }} /> Saved roles
    </button>
  );

  if (loading) {
    return (
      <div className={s.sideB}>
        {backBtn}
        {[0, 1, 2].map((i) => <div key={i} className={`${s.job} ${s.skeleton}`} style={{ height: "66px" }} />)}
      </div>
    );
  }

  if (!app) {
    return (
      <div className={s.sideB}>
        {backBtn}
        <div className={s.panelEmpty}>
          <p>I couldn&rsquo;t find that saved role — it may have been removed. Your saved roles are all in Roles.</p>
        </div>
      </div>
    );
  }

  const job = app.job_data;
  const initial = (job.company || job.title || "?").trim()[0]?.toUpperCase() ?? "?";
  const strong = (job.relevanceScore ?? 0) >= 7;
  const meta = [job.company, job.location, job.salary].filter((x) => x && x !== "Not listed").join(" · ");

  return (
    <div className={s.sideB}>
      {backBtn}

      <div className={s.rdHead}>
        <CompanyLogo
          company={job.company || job.title || "?"}
          fallbackColor={logoColour(job.company || job.title || "?")}
          initial={initial}
          className={s.rdLogo}
        />
        <div>
          <h3 className={s.rdTitle}>{job.title}</h3>
          <div className={s.rdMeta}>{meta}</div>
          <span className={`${s.jfit} ${strong ? "" : s.good}`}>{strong ? "Strong fit" : "Good fit"}</span>
        </div>
      </div>

      {/* Stage — where this application is up to */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>Where this is up to</div>
        <div className={s.stageRow}>
          {STAGES.map((st) => (
            <button
              key={st.key}
              type="button"
              className={`${s.stageChip} ${stage === st.key ? s.stageOn : ""}`}
              onClick={() => setStageAndSave(st.key)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity log */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>Activity</div>
        <p className={s.rdText}>Saved · {relativeTime(app.created_at)}</p>
      </div>

      {job.relevanceReason && (
        <div className={s.rdSection}>
          <div className={s.rdLabel}>Why this fits you</div>
          <p className={s.rdReason}>{job.relevanceReason}</p>
        </div>
      )}

      {/* Interview-prep nudge — contextual, hands off to the conversation */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>When you&rsquo;re ready</div>
        <p className={s.rdText}>Want me to prep you for this one — what they do, what they&rsquo;ll ask, and the gaps worth getting ahead of?</p>
        <button className={s.chip} type="button" onClick={() => askAdvisor(`Help me prepare for the ${job.title} role at ${job.company}.`)}>
          Prep me for this role
        </button>
      </div>

      {/* Write a note */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>Your notes</div>
        <textarea
          className={s.noteBox}
          value={note}
          onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }}
          placeholder="Anything you want to remember about this one…"
          rows={3}
        />
        <button className={s.chip} type="button" onClick={saveNote}>
          {noteSaved ? "Saved ✓" : "Save note"}
        </button>
      </div>

      {job.applyUrl && (
        <div className={s.rdActions}>
          <a className={s.rdListing} href={job.applyUrl} target="_blank" rel="noopener noreferrer">View listing ↗</a>
        </div>
      )}
    </div>
  );
}

/* ===== Direction view ====================================================== */
function DirectionView({ profile, hasResult }: { profile: AnalysisProfile | null; hasResult: boolean | null }) {
  const directions = Array.isArray(profile?.suggestedDirections) ? profile.suggestedDirections : [];

  return (
    <>
      <div className={s.sideH}>
        <div className={s.ti}><h3>Your direction</h3></div>
        <div className={s.sub}>Where I see this going — worth exploring, not a verdict</div>
      </div>
      <div className={s.sideB}>
        {hasResult && directions.length > 0 ? (
          <>
            <div className={s.rdLabel} style={{ padding: "10px 10px 4px" }}>Directions worth exploring</div>
            <ul className={s.dirs} style={{ padding: "8px 10px" }}>
              {directions.map((d, i) => (
                <li key={d.title} className={`${s.dir} ${i === 0 ? s.lead : ""}`}>
                  <span className={s.num}>{i + 1}</span>
                  <span className={s.dt}>
                    <b>{d.title}</b>
                    {d.why && <><br />{d.why}</>}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className={s.panelEmpty}>
            <p>This fills in as we talk. I don&rsquo;t know enough yet — tell me about yourself, or drop your CV in, and I&rsquo;ll show you what I see.</p>
          </div>
        )}
      </div>
    </>
  );
}

/* ===== Profile view — the "what I know about you" mirror =================== */
interface StructuredProfile {
  values?: string[];
  dealBreakers?: string[];
  aspiration?: string;
  memory?: Array<{ note: string; at: string }>;
  cvFileName?: string;
  cvUpdatedAt?: string;
}

function ProfileView({ analysisProfile }: { analysisProfile: AnalysisProfile | null }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [account, setAccount] = useState<{ name: string; email: string } | null>(null);
  const [p, setP] = useState<StructuredProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: { user } }, res] = await Promise.all([
        supabase.auth.getUser(),
        fetch("/api/profile").catch(() => null),
      ]);
      if (cancelled) return;
      if (user) {
        setAccount({
          name: (user.user_metadata?.full_name as string) || "",
          email: user.email || "",
        });
      }
      if (res && res.ok) {
        try { const d = await res.json(); if (!cancelled) setP(d.profile ?? {}); } catch { /* ignore */ }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteError(false);
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      if (res.ok) {
        await supabase.auth.signOut().catch(() => {});
        window.location.href = "/";
        return;
      }
    } catch { /* fall through to error */ }
    setDeleting(false);
    setDeleteError(true);
  }

  const summary = analysisProfile?.summary;
  const seniority = analysisProfile?.seniorityLevel;
  const values = p?.values ?? [];
  const dealBreakers = p?.dealBreakers ?? [];
  const memory = p?.memory ?? [];
  const knowsSomething = !!summary || !!seniority || values.length > 0 || dealBreakers.length > 0 || !!p?.aspiration;

  return (
    <>
      <div className={s.sideH}>
        <div className={s.ti}><h3>Your profile</h3></div>
        <div className={s.sub}>What I know about you — it grows as we talk</div>
      </div>
      <div className={s.sideB}>
        {loading ? (
          [0, 1, 2].map((i) => <div key={i} className={`${s.job} ${s.skeleton}`} style={{ height: "54px" }} />)
        ) : !account ? (
          <div className={s.panelEmpty}>
            <p>Sign in and your profile — everything I learn about you — lives here.</p>
          </div>
        ) : (
          <>
            {/* What I know */}
            {knowsSomething ? (
              <>
                {summary && (
                  <div className={s.rdSection}>
                    <div className={s.rdLabel}>How I see you</div>
                    <p className={s.rdReason}>{summary}</p>
                  </div>
                )}
                {seniority && (
                  <div className={s.rdSection}>
                    <div className={s.rdLabel}>Where you&rsquo;re at</div>
                    <p className={s.rdText}>{seniority}</p>
                  </div>
                )}
                {p?.aspiration && (
                  <div className={s.rdSection}>
                    <div className={s.rdLabel}>What you&rsquo;re aiming for</div>
                    <p className={s.rdText}>{p.aspiration}</p>
                  </div>
                )}
                {values.length > 0 && (
                  <div className={s.rdSection}>
                    <div className={s.rdLabel}>What matters to you</div>
                    <div className={s.rdSkills}>{values.map((v) => <span key={v} className={s.rdSkill}>{v}</span>)}</div>
                  </div>
                )}
                {dealBreakers.length > 0 && (
                  <div className={s.rdSection}>
                    <div className={s.rdLabel}>Your deal-breakers</div>
                    <div className={s.rdSkills}>{dealBreakers.map((v) => <span key={v} className={s.rdSkill}>{v}</span>)}</div>
                  </div>
                )}
              </>
            ) : (
              <div className={s.panelEmpty}>
                <p>I&rsquo;m still getting to know you. As we talk, what I learn about you — what you want, what matters, what to avoid — fills in here.</p>
              </div>
            )}

            {/* What I've picked up over time (advisor memory) */}
            {memory.length > 0 && (
              <div className={s.rdSection}>
                <div className={s.rdLabel}>What I&rsquo;ve picked up</div>
                <ul className={s.rlist}>
                  {memory.slice(-8).reverse().map((m, i) => <li key={i}>{m.note}</li>)}
                </ul>
              </div>
            )}

            {/* CV on file */}
            <div className={s.rdSection}>
              <div className={s.rdLabel}>CV on file</div>
              {p?.cvFileName ? (
                <p className={s.rdText}>{p.cvFileName}{p.cvUpdatedAt ? ` · added ${relativeTime(p.cvUpdatedAt)}` : ""}</p>
              ) : (
                <p className={s.rdText}>No CV yet. Drop one into the conversation and I&rsquo;ll keep it here. (Tailored CVs will live in Documents.)</p>
              )}
            </div>

            {/* Account */}
            <div className={s.rdSection}>
              <div className={s.rdLabel}>Account</div>
              {account.name && <p className={s.rdText}>{account.name}</p>}
              {account.email && <p className={s.rdText}>{account.email}</p>}
              <div className={s.acctActions}>
                <button className={s.chip} type="button" onClick={signOut}>Sign out</button>
                {!confirmingDelete && (
                  <button className={s.dangerChip} type="button" onClick={() => setConfirmingDelete(true)}>
                    Delete account
                  </button>
                )}
              </div>

              {confirmingDelete && (
                <div className={s.dangerBox}>
                  <p className={s.rdText}>
                    This permanently deletes your account and everything I&rsquo;ve learned about you — your
                    analysis, saved roles, notes and our conversation. It can&rsquo;t be undone.
                  </p>
                  {deleteError && (
                    <p className={s.rdText} style={{ color: "var(--danger)" }}>
                      That didn&rsquo;t go through. Try again in a moment.
                    </p>
                  )}
                  <div className={s.acctActions}>
                    <button className={s.dangerBtn} type="button" onClick={deleteAccount} disabled={deleting}>
                      {deleting ? "Deleting…" : "Yes, delete everything"}
                    </button>
                    <button className={s.chip} type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ===== Documents view ====================================================== */
interface DocumentRecord {
  id: string;
  job_id: string;
  type: string;
  content: string;
  metadata: { changes?: string[]; jobTitle?: string; jobCompany?: string };
  created_at: string;
}

function openCvForPrinting(cv: string, title: string) {
  const escaped = cv.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; padding: 2cm; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 20px; border-bottom: 1px solid #ddd; margin-bottom: 24px; }
    .toolbar h1 { font-size: 14px; font-weight: 600; }
    .toolbar button { background: #000; color: #fff; border: none; padding: 8px 16px; font-size: 13px; cursor: pointer; border-radius: 4px; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; }
    @media print {
      .toolbar { display: none; }
      body { padding: 0; }
      @page { margin: 2cm; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>${title}</h1>
    <button onclick="window.print()">Save as PDF (Cmd+P / Ctrl+P)</button>
  </div>
  <pre>${escaped}</pre>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) w.addEventListener("load", () => URL.revokeObjectURL(url));
}

function DocumentsView() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setDocs(data.documents ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    window.addEventListener("ci:open-documents", load);
    return () => window.removeEventListener("ci:open-documents", load);
  }, []);

  const tailoredCvs = docs.filter((d) => d.type === "cv_tailored");

  return (
    <>
      <div className={s.sideH}>
        <div className={s.ti}><h3>Documents</h3></div>
        <div className={s.sub}>Tailored CVs and drafts — always here to find again</div>
      </div>
      <div className={s.sideB}>
        {loading && [0, 1].map((i) => (
          <div key={i} className={`${s.job} ${s.skeleton}`} style={{ height: "66px" }} />
        ))}

        {!loading && tailoredCvs.length === 0 && (
          <div className={s.panelEmpty}>
            <p>Nothing here yet. Ask me to tailor your CV for a role and it&rsquo;ll live here — always findable, never lost.</p>
          </div>
        )}

        {!loading && tailoredCvs.map((doc) => {
          const title = doc.metadata?.jobTitle
            ? `CV — ${doc.metadata.jobTitle}${doc.metadata.jobCompany ? ` at ${doc.metadata.jobCompany}` : ""}`
            : "Tailored CV";
          const isOpen = expanded === doc.id;
          const changes = doc.metadata?.changes ?? [];

          return (
            <div key={doc.id} className={s.docCard}>
              <div className={s.docHeader}>
                <div className={s.docTitle}>{title}</div>
                <div className={s.docActions}>
                  <button
                    className={s.chip}
                    type="button"
                    onClick={() => openCvForPrinting(doc.content, title)}
                  >
                    Download PDF
                  </button>
                  <button
                    className={s.chip}
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : doc.id)}
                  >
                    {isOpen ? "Hide" : "View"}
                  </button>
                </div>
              </div>

              {isOpen && (
                <>
                  {changes.length > 0 && (
                    <div className={s.docChanges}>
                      <div className={s.rdLabel}>What I changed and why</div>
                      <ul className={s.rlist}>
                        {changes.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className={s.docCvWrap}>
                    <pre className={s.docCvText}>{doc.content}</pre>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
