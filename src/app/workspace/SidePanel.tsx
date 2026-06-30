"use client";

/* Side panel — hosts one thing at a time (COMPONENT-INVENTORY §9): the roles list,
   a single role (with contact + outreach + skills *inside* it — never separate tabs),
   the direction, or documents. Which surface shows is driven by the left nav (`view`).
   Roles wire to the real pipeline via usePanelJobs (same flow as the dashboard Roles tab).
   All advisor copy is verbatim from VOICE-IN-UI.md — never invented here. Tokens only. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import s from "./workspace.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { usePanelJobs, type PanelJob, type AnalysisProfile } from "./usePanelJobs";
import { RolesIcon, DirectionIcon, DocumentsIcon, ProfileIcon, CloseIcon, ChevronIcon, ApplicationsIcon } from "./icons";
import CompanyLogo from "./CompanyLogo";
import { roleKey, normRolePart, isInApplications } from "@/lib/role-key";
import { activeDirections } from "@/lib/user-state";
export type PanelView = "roles" | "direction" | "documents" | "saved" | "profile" | "applications";

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
  applications: { icon: ApplicationsIcon, label: "Applications", title: "Applications" },
} as const;

export default function SidePanel({
  view,
  savedJobId,
  data,
  onClose,
}: {
  view: PanelView;
  savedJobId?: string | null;
  data: ReturnType<typeof usePanelJobs>;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { profile, hasResult, jobs, jobsLoading, jobsError, retry, markSeen } = data;

  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<PanelJob | null>(null);
  const [interested, setInterested] = useState<Set<string>>(new Set());
  // roleKey(title,company) of every interested role, so the "In Applications" badge also
  // matches advisor-saved roles whose synthetic id never equals a live listing id
  // (STATE-SYNC-AUDIT #1).
  const [interestedKeys, setInterestedKeys] = useState<Set<string>>(new Set());
  const [passed, setPassed] = useState<Set<string>>(new Set());
  // Roles the user told the advisor aren't for them. Two sets: exact title+company,
  // and title-only for hides where the advisor didn't capture a company (so they
  // still match the live job, which always carries one). Item-level only.
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [hiddenTitles, setHiddenTitles] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [tailoring, setTailoring] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, [supabase]);

  // Load saved interested/passed state + roles the advisor was told aren't for them.
  const loadSavedState = useCallback(async () => {
    try {
      const res = await fetch("/api/save-job");
      if (!res.ok) return;
      const data = await res.json();
      const saved: Array<{ id: string | number; status?: string; title?: string; company?: string }> = data.jobs || [];
      const interestedRoles = saved.filter((j) => j.status === "interested");
      setInterested(new Set(interestedRoles.map((j) => String(j.id))));
      setInterestedKeys(new Set(interestedRoles.map((j) => roleKey(j.title, j.company))));
      setPassed(new Set(saved.filter((j) => j.status === "passed").map((j) => String(j.id))));
      const hidden: Array<{ title?: string; company?: string }> = data.hiddenRoles || [];
      setHiddenKeys(new Set(hidden.filter((h) => normRolePart(h.company)).map((h) => roleKey(h.title, h.company))));
      setHiddenTitles(new Set(hidden.filter((h) => !normRolePart(h.company)).map((h) => normRolePart(h.title))));
    } catch { /* ignore */ }
  }, []);

  // Reload on sign-in AND whenever the advisor changes application state — so the
  // "✓ In Applications" badge and the Live-roles hide stay in step with the board
  // (e.g. a removed role's badge clears; a "not for me" role drops out of Live roles).
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    // Initial load deferred past an await (workspace lint rule); the event listener
    // is the accepted subscribe case — it re-reads when the advisor changes state.
    (async () => { await Promise.resolve(); if (!cancelled) loadSavedState(); })();
    window.addEventListener("ci:application-changed", loadSavedState);
    return () => { cancelled = true; window.removeEventListener("ci:application-changed", loadSavedState); };
  }, [userId, loadSavedState]);

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
            interested={isInApplications(selected, interested, interestedKeys)}
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
            interestedKeys={interestedKeys}
            hiddenKeys={hiddenKeys}
            hiddenTitles={hiddenTitles}
            onRetry={retry}
            onReview={setSelected}
          />
        )
      )}

      {view === "direction" && <DirectionView profile={profile} hasResult={hasResult} />}
      {view === "documents" && <DocumentsView />}
      {view === "profile" && <ProfileView analysisProfile={profile} />}
      {/* A saved role IS an application — opening one from "Recent" lands inside
          Applications (preselected), never a separate surface. Keyed so changing the
          target role while already on Applications re-opens the right one. */}
      {view === "applications" && (
        <ApplicationsView key={savedJobId ?? "list"} initialJobId={savedJobId ?? null} />
      )}

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
    // A clean interest statement, NOT "what should we do about it" — that biased the
    // advisor toward an action menu (jumping to docs). The role-interest section of the
    // prompt now drives a curious-first response: one genuine question, then a plan,
    // documents only later. The role is already saved above, so the advisor never re-saves.
    askAdvisor(`I'm interested in the ${job.title} role at ${job.company}.`);
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
  hasResult, jobs, jobsLoading, jobsError, passed, interested, interestedKeys, hiddenKeys, hiddenTitles, onRetry, onReview,
}: {
  hasResult: boolean | null;
  jobs: PanelJob[];
  jobsLoading: boolean;
  jobsError: boolean;
  passed: Set<string>;
  interested: Set<string>;
  interestedKeys: Set<string>;
  hiddenKeys: Set<string>;
  hiddenTitles: Set<string>;
  onRetry: () => void;
  onReview: (job: PanelJob) => void;
}) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  // Drop low-scoring/senior results (keep unscored); hide passed unless re-flagged interested.
  // Rank new-today first, then by fit, so the cap keeps the most relevant.
  const ranked = jobs
    .filter((j) => !j.relevanceScore || j.relevanceScore >= 4)
    .filter((j) => !passed.has(String(j.id)) || isInApplications(j, interested, interestedKeys))
    // Drop roles the user told the advisor aren't for them — exact title+company, or
    // title-only when the advisor didn't capture a company.
    .filter((j) => !hiddenKeys.has(roleKey(j.title, j.company)) && !hiddenTitles.has(normRolePart(j.title)))
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
            {strong.map((j) => <JobRow key={String(j.id)} job={j} strong inApps={isInApplications(j, interested, interestedKeys)} onReview={onReview} />)}
            {good.length > 0 && <div className={s.grp}>Good fit</div>}
            {good.map((j) => <JobRow key={String(j.id)} job={j} strong={false} inApps={isInApplications(j, interested, interestedKeys)} onReview={onReview} />)}
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

function JobRow({ job, strong, inApps, onReview }: { job: PanelJob; strong: boolean; inApps: boolean; onReview: (j: PanelJob) => void }) {
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
        {/* Once a role is in Applications, say so on the card so it never reads as
            "not yet acted on" — the fit label gives way to the status. */}
        {inApps
          ? <span className={s.jInApps}>✓ In Applications</span>
          : <span className={`${s.jfit} ${strong ? "" : s.good}`}>{strong ? "Strong fit" : "Good fit"}</span>}
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
  { key: "saved", label: "Saved" },
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

function SavedJobDetail({ jobId, onOpenRoles, backLabel = "Saved roles", onStageChange }: { jobId: string | null; onOpenRoles?: () => void; backLabel?: string; onStageChange?: (jobId: string, stage: string) => void }) {
  const [app, setApp] = useState<SavedApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<string>("saved");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [jobDocs, setJobDocs] = useState<DocumentRecord[]>([]);
  const [jobDocsLoading, setJobDocsLoading] = useState(false);
  const [docExpanded, setDocExpanded] = useState<string | null>(null);
  const [clExpanded, setClExpanded] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  // `silent` skips the skeleton + leaves the note input alone — used when the advisor
  // changes this application's stage from the conversation (ci:application-changed),
  // so the chip updates live without flashing or clobbering a half-typed note.
  const loadApp = useCallback(async (silent = false) => {
    if (!jobId) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) { if (!silent) setApp(null); return; }
      const { applications } = await res.json();
      const found: SavedApplication | undefined = (applications || []).find(
        (a: SavedApplication) => String(a.job_id) === String(jobId)
      );
      if (!found) {
        // On a silent refresh (e.g. this row was just removed) leave the view as-is —
        // the removal flow navigates away and unmounts us; nulling here would flash an
        // inconsistent frame. Only the initial/non-silent load clears to the not-found state.
        if (!silent) setApp(null);
        return;
      }
      setApp(found);
      setStage(found.stage || "saved");
      if (!silent) setNote(found.notes || "");
    } catch {
      if (!silent) setApp(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    let cancelled = false;
    // Defer the initial load past an await (workspace lint rule: no synchronous
    // setState in an effect body). The event listener is the accepted subscribe case.
    (async () => { await Promise.resolve(); if (!cancelled) loadApp(); })();
    const onChanged = () => loadApp(true);
    window.addEventListener("ci:application-changed", onChanged);
    return () => { cancelled = true; window.removeEventListener("ci:application-changed", onChanged); };
  }, [loadApp]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    // Loading flag for an async document fetch keyed on jobId — external data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJobDocsLoading(true);
    fetch(`/api/documents?jobId=${encodeURIComponent(jobId)}`)
      .then((r) => r.ok ? r.json() : { documents: [] })
      .then((d) => { if (!cancelled) setJobDocs(d.documents ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setJobDocsLoading(false); });
    return () => { cancelled = true; };
  }, [jobId]);

  async function setStageAndSave(next: string) {
    if (!app) return;
    setStage(next);
    // Tell the parent list so its pill re-derives from the same state (optimistic —
    // the list shouldn't keep showing "Saved" after the stage moves on in here).
    onStageChange?.(String(app.job_id), next);
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

  async function removeApplication() {
    if (!app) return;
    setRemoving(true);
    try {
      // A saved role IS an application — it lives in two tables: saved_applications
      // (the board) and saved_jobs (what the advisor knows it has saved). Remove from
      // both so it leaves Applications AND the advisor stops referencing it.
      const [appsRes, jobRes] = await Promise.all([
        fetch("/api/applications", {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: app.job_id }),
        }),
        fetch("/api/save-job", {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: app.job_id }),
        }),
      ]);
      // fetch only rejects on network error, so check status explicitly — otherwise a
      // failed delete would still navigate away and claim success while the row remains.
      if (!appsRes.ok || !jobRes.ok) { setRemoving(false); return; }
      onOpenRoles?.(); // unmount this detail first → back to the Applications list
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("ci:application-changed"));
      // Non-blocking: the remove has already happened. Let the advisor ask why in
      // conversation (optional) — a genuine "not for me" sharpens future matches and
      // hides the role from Live roles; "just tidying" changes nothing. (Research:
      // rejection-state-model-research.md fork 2 — ask, but never block the action.)
      const jd = app.job_data;
      const roleName = jd.title ? `the ${jd.title} role${jd.company ? ` at ${jd.company}` : ""}` : "a role";
      askAdvisor(`I've taken ${roleName} off my applications.`);
    } catch {
      setRemoving(false);
    }
  }

  const backBtn = (
    <button className={s.rdBack} type="button" onClick={onOpenRoles}>
      <ChevronIcon style={{ transform: "rotate(180deg)" }} /> {backLabel}
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
          <p>I couldn&rsquo;t find that role — it may have been removed. Everything you&rsquo;ve saved lives in Applications.</p>
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

      {/* Activity — the genuine "saved" event plus where it is now. A full dated
          timeline of every stage move is a separate feature (needs stored events);
          we don't fake timestamps here. */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>Activity</div>
        <p className={s.rdText}>Saved · {relativeTime(app.created_at)}</p>
        {stage !== "saved" && (
          // Closed outcomes (rejected/archive) aren't forward chips in STAGES, so fall
          // back to the soft STAGE_LABELS ("Not this time") — never leak the raw word.
          <p className={s.rdText}>Now: {STAGES.find((st) => st.key === stage)?.label ?? STAGE_LABELS[stage] ?? stage}</p>
        )}
      </div>

      {/* Why this closed — the note captured from the conversation when it was closed,
          so they can remind themselves later. Only on a closed role, only if we have one. */}
      {CLOSED_STAGES.has(stage) && (job as { closeReason?: string }).closeReason && (
        <div className={s.rdSection}>
          <div className={s.rdLabel}>Why this closed</div>
          <p className={s.rdText}>{(job as { closeReason?: string }).closeReason}</p>
        </div>
      )}

      {job.relevanceReason && (
        <div className={s.rdSection}>
          <div className={s.rdLabel}>Why this fits you</div>
          <p className={s.rdReason}>{job.relevanceReason}</p>
        </div>
      )}

      {/* Tailored CV for this role */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>CV for this role</div>
        {jobDocsLoading ? (
          <div className={`${s.job} ${s.skeleton}`} style={{ height: "36px" }} />
        ) : jobDocs.filter((d) => d.type === "cv_tailored").length > 0 ? (
          jobDocs.filter((d) => d.type === "cv_tailored").map((doc) => {
            const title = doc.metadata?.jobTitle
              ? `CV — ${doc.metadata.jobTitle}${doc.metadata.jobCompany ? ` at ${doc.metadata.jobCompany}` : ""}`
              : "Tailored CV";
            const isOpen = docExpanded === doc.id;
            const changes = doc.metadata?.changes ?? [];
            return (
              <div key={doc.id} className={s.docCard} style={{ marginTop: "6px" }}>
                <div className={s.docHeader}>
                  <div className={s.docTitle}>{title}</div>
                  <div className={s.docActions}>
                    <button className={s.chip} type="button" onClick={() => openCvForPrinting(doc.content, title)}>Download PDF</button>
                    <button className={s.chip} type="button" onClick={() => setDocExpanded(isOpen ? null : doc.id)}>{isOpen ? "Hide" : "View"}</button>
                  </div>
                </div>
                {isOpen && (
                  <>
                    {changes.length > 0 && (
                      <div className={s.docChanges}>
                        <div className={s.rdLabel}>What I changed and why</div>
                        <ul className={s.rlist}>{changes.map((c, i) => <li key={i}>{c}</li>)}</ul>
                      </div>
                    )}
                    <div className={s.docCvWrap}><pre className={s.docCvText}>{doc.content}</pre></div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <>
            <p className={s.rdText}>No tailored CV yet for this role.</p>
            <button className={s.chip} type="button" onClick={() => askAdvisor(`Tailor my CV for the ${job.title} role at ${job.company}.`)}>
              Tailor my CV for this role
            </button>
          </>
        )}
      </div>

      {/* Cover letter for this role */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>Cover letter</div>
        {jobDocsLoading ? (
          <div className={`${s.job} ${s.skeleton}`} style={{ height: "36px" }} />
        ) : jobDocs.filter((d) => d.type === "cover_letter").length > 0 ? (
          jobDocs.filter((d) => d.type === "cover_letter").map((doc) => {
            const title = doc.metadata?.jobTitle
              ? `Cover letter — ${doc.metadata.jobTitle}${doc.metadata.jobCompany ? ` at ${doc.metadata.jobCompany}` : ""}`
              : "Cover letter";
            const isOpen = clExpanded === doc.id;
            const notes: string[] = (doc.metadata as { notes?: string[] })?.notes ?? [];
            return (
              <div key={doc.id} className={s.docCard} style={{ marginTop: "6px" }}>
                <div className={s.docHeader}>
                  <div className={s.docTitle}>{title}</div>
                  <div className={s.docActions}>
                    <button className={s.chip} type="button" onClick={() => openCvForPrinting(doc.content, title)}>Download PDF</button>
                    <button className={s.chip} type="button" onClick={() => setClExpanded(isOpen ? null : doc.id)}>{isOpen ? "Hide" : "View"}</button>
                  </div>
                </div>
                {isOpen && (
                  <>
                    {notes.length > 0 && (
                      <div className={s.docChanges}>
                        <div className={s.rdLabel}>What I emphasised and why</div>
                        <ul className={s.rlist}>{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                      </div>
                    )}
                    <div className={s.docCvWrap}><pre className={s.docCvText}>{doc.content}</pre></div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <>
            <p className={s.rdText}>No cover letter yet for this role.</p>
            <button className={s.chip} type="button" onClick={() => askAdvisor(`Write a cover letter for the ${job.title} role at ${job.company}.`)}>
              Write cover letter
            </button>
          </>
        )}
      </div>

      {/* Interview-prep nudge — contextual, hands off to the conversation */}
      <div className={s.rdSection}>
        <div className={s.rdLabel}>When you&rsquo;re ready</div>
        <p className={s.rdText}>Want me to prep you for this one — what they do, what they&rsquo;ll ask, and the gaps worth getting ahead of? Or we can run a mock interview when you&rsquo;re ready to rehearse out loud.</p>
        <button className={s.chip} type="button" onClick={() => askAdvisor(`Help me prepare for the ${job.title} role at ${job.company}.`)}>
          Prep me for this role
        </button>
        <button className={s.chip} type="button" onClick={() => askAdvisor(`Run a mock interview with me for the ${job.title} role at ${job.company}.`)}>
          Run a mock interview
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

      {/* Remove from applications — two-step, since it also clears any tailored CV /
          cover letter / notes for this role. Quiet and at the bottom by design. */}
      <div className={s.rdSection}>
        {!confirmingRemove ? (
          <button className={s.dangerChip} type="button" onClick={() => setConfirmingRemove(true)}>
            Remove from applications
          </button>
        ) : (
          <div className={s.dangerBox}>
            <p className={s.rdText}>
              This removes {job.title} from your applications, along with anything saved against it —
              its tailored CV, cover letter and notes. It can&rsquo;t be undone.
            </p>
            <div className={s.acctActions}>
              <button className={s.chip} type="button" onClick={() => setConfirmingRemove(false)} disabled={removing}>
                Keep it
              </button>
              <button className={s.dangerBtn} type="button" onClick={removeApplication} disabled={removing}>
                {removing ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Direction view ====================================================== */
function DirectionView({ profile, hasResult }: { profile: AnalysisProfile | null; hasResult: boolean | null }) {
  const all = Array.isArray(profile?.suggestedDirections) ? profile.suggestedDirections : [];
  // A direction the user rejected must drop off this page (STATE-SYNC-AUDIT #2): the
  // advisor says it's set aside, so the screen must agree. directionFeedback lives in the
  // structured profile, so fetch it and filter. Re-reads when the advisor changes state.
  const [feedback, setFeedback] = useState<Array<{ direction?: string; status?: string }>>([]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const d = await res.json();
        if (!cancelled) setFeedback(Array.isArray(d?.profile?.directionFeedback) ? d.profile.directionFeedback : []);
      } catch { /* ignore, show all directions */ }
    };
    load();
    // Re-read when the advisor records a direction reaction (profile-changed) or revises
    // the direction set (analysis-changed), so a rejected direction drops off live.
    window.addEventListener("ci:profile-changed", load);
    window.addEventListener("ci:analysis-changed", load);
    return () => {
      cancelled = true;
      window.removeEventListener("ci:profile-changed", load);
      window.removeEventListener("ci:analysis-changed", load);
    };
  }, []);
  const directions = activeDirections(all, feedback);

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
              {/* Equal visual weight — no lead highlight on #1. Asserting one direction
                  as "the" answer is an unearned verdict (honest-matching, REBUILD item 5);
                  these are options worth exploring, ordered but not ranked-as-truth. */}
              {directions.map((d, i) => (
                <li key={d.title} className={s.dir}>
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
  preferredName?: string;
  values?: string[];
  dealBreakers?: string[];
  aspiration?: string;
  salaryFloor?: number;
  salaryCeiling?: number;
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
    const load = async () => {
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
    };
    load();
    // Re-read when the advisor updates a profile fact (name, salary), so the mirror
    // doesn't show stale info while the advisor says it saved.
    window.addEventListener("ci:profile-changed", load);
    return () => { cancelled = true; window.removeEventListener("ci:profile-changed", load); };
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
  // Salary the advisor holds, shown here so what it "knows" is visible to the user and
  // they can correct it, instead of it being invisible while the advisor quotes it
  // (STATE-SYNC-AUDIT #5). GBP, rendered as a range / floor / ceiling depending on what's set.
  const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;
  const salary =
    p?.salaryFloor && p?.salaryCeiling
      ? `${gbp(p.salaryFloor)} to ${gbp(p.salaryCeiling)}`
      : p?.salaryFloor
        ? `From ${gbp(p.salaryFloor)}`
        : p?.salaryCeiling
          ? `Up to ${gbp(p.salaryCeiling)}`
          : "";
  const knowsSomething =
    !!summary || !!seniority || values.length > 0 || dealBreakers.length > 0 || !!p?.aspiration || !!salary;

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
                {salary && (
                  <div className={s.rdSection}>
                    <div className={s.rdLabel}>What you&rsquo;re looking for on pay</div>
                    <p className={s.rdText}>{salary}</p>
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
              {p?.preferredName && <p className={s.rdText}>You go by {p.preferredName}</p>}
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

/* ===== Applications view =================================================== */
interface ApplicationListItem {
  job_id: string;
  job_data: PanelJob;
  stage: string;
  created_at: string;
}

const STAGE_LABELS: Record<string, string> = {
  saved: "Saved",
  preparing: "Preparing",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  // Closed outcomes — kept as real records, shown quietly below the active board.
  // Soft labels by design (rejection-fatigue research): never the bare word "Rejected".
  rejected: "Not this time",
  archive: "Set aside",
};
const CLOSED_STAGES = new Set(["rejected", "archive"]);

function ApplicationsView({ initialJobId = null }: { initialJobId?: string | null }) {
  const [apps, setApps] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initialJobId);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) return;
      const { applications } = await res.json();
      setApps(applications ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // The advisor can save a role or move a stage from the conversation; when it
    // does it emits ci:application-changed. Re-read so the list/pills update live
    // without the user closing and reopening the panel. Initial load deferred past
    // an await (workspace lint rule); the listener is the accepted subscribe case.
    (async () => { await Promise.resolve(); if (!cancelled) reload(); })();
    window.addEventListener("ci:application-changed", reload);
    return () => { cancelled = true; window.removeEventListener("ci:application-changed", reload); };
  }, [reload]);

  if (selectedId) {
    return (
      <SavedJobDetail
        jobId={selectedId}
        onOpenRoles={() => setSelectedId(null)}
        backLabel="Applications"
        onStageChange={(jobId, stage) =>
          setApps((prev) => prev.map((a) => (String(a.job_id) === jobId ? { ...a, stage } : a)))
        }
      />
    );
  }

  // Active pipeline stays on the board; closed outcomes (didn't get it / set aside)
  // drop into a quiet collapsed group below — present and on record, never a wall.
  const active = apps.filter((a) => !CLOSED_STAGES.has(a.stage));
  const closed = apps.filter((a) => CLOSED_STAGES.has(a.stage));

  const renderCard = (app: ApplicationListItem) => {
    const job = app.job_data;
    const initial = (job.company || job.title || "?").trim()[0]?.toUpperCase() ?? "?";
    const stageLabel = STAGE_LABELS[app.stage] ?? "Saved";
    // Saved reads quietest; once you've actually applied it carries more weight; an
    // offer is the win (success token); a closed outcome reads quietest of all.
    const stageClass =
      app.stage === "offer" ? s.appStageOffer
      : CLOSED_STAGES.has(app.stage) ? s.appStageClosed
      : app.stage === "saved" ? s.appStageSaved
      : s.appStageLive;
    return (
      <button
        key={app.job_id}
        className={s.job}
        type="button"
        onClick={() => setSelectedId(app.job_id)}
      >
        <CompanyLogo
          company={job.company || job.title || "?"}
          fallbackColor={logoColour(job.company || job.title || "?")}
          initial={initial}
          className={s.jlogo}
        />
        <div className={s.jmid}>
          <div className={s.jt}>{job.title}</div>
          <div className={s.jc}>{job.company}{job.location ? ` · ${job.location}` : ""}</div>
        </div>
        <span className={`${s.appStage} ${stageClass}`}>{stageLabel}</span>
      </button>
    );
  };

  return (
    <>
      <div className={s.sideH}>
        <div className={s.ti}><h3>Applications</h3></div>
        <div className={s.sub}>Everything about each role — in one place</div>
      </div>
      <div className={s.sideB}>
        {loading && [0, 1, 2].map((i) => (
          <div key={i} className={`${s.job} ${s.skeleton}`} style={{ height: "66px" }} />
        ))}

        {!loading && apps.length === 0 && (
          <div className={s.panelEmpty}>
            <p>No saved roles yet. Mark a role as interested and it appears here — with your tailored CV, notes, and prep all in one place.</p>
          </div>
        )}

        {!loading && active.map(renderCard)}

        {!loading && closed.length > 0 && (
          <details className={s.closedGroup}>
            <summary className={s.closedSummary}>Closed · {closed.length}</summary>
            {closed.map(renderCard)}
          </details>
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
    // Fetch documents on mount and subscribe to the refresh event — external data
    // plus a subscription, the sanctioned use of an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    window.addEventListener("ci:open-documents", load);
    return () => window.removeEventListener("ci:open-documents", load);
  }, []);

  // The library is the all-files view: every tailored CV AND cover letter, newest first.
  // (Cover letters also live under their job in Applications — this is the cross-job home.)
  const files = docs.filter((d) => d.type === "cv_tailored" || d.type === "cover_letter");

  return (
    <>
      <div className={s.sideH}>
        <div className={s.ti}><h3>Documents</h3></div>
        <div className={s.sub}>Every tailored CV and cover letter — always here to find again</div>
      </div>
      <div className={s.sideB}>
        {loading && [0, 1].map((i) => (
          <div key={i} className={`${s.job} ${s.skeleton}`} style={{ height: "66px" }} />
        ))}

        {!loading && files.length === 0 && (
          <div className={s.panelEmpty}>
            <p>Nothing here yet. Ask me to tailor your CV or write a cover letter for a role and it&rsquo;ll live here — always findable, never lost.</p>
          </div>
        )}

        {!loading && files.map((doc) => {
          const isCover = doc.type === "cover_letter";
          const kind = isCover ? "Cover letter" : "CV";
          const title = doc.metadata?.jobTitle
            ? `${kind} — ${doc.metadata.jobTitle}${doc.metadata.jobCompany ? ` at ${doc.metadata.jobCompany}` : ""}`
            : isCover ? "Cover letter" : "Tailored CV";
          const isOpen = expanded === doc.id;
          const points = isCover
            ? ((doc.metadata as { notes?: string[] })?.notes ?? [])
            : (doc.metadata?.changes ?? []);
          const pointsLabel = isCover ? "What I emphasised and why" : "What I changed and why";

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
                  {points.length > 0 && (
                    <div className={s.docChanges}>
                      <div className={s.rdLabel}>{pointsLabel}</div>
                      <ul className={s.rlist}>
                        {points.map((c, i) => <li key={i}>{c}</li>)}
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
