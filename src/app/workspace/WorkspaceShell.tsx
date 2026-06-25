"use client";

/* Workspace shell — left nav + resizable split (chat | closable side panel).
   Three states (COMPONENT-INVENTORY §0):
     - "first"      → first session / the click: chat full-width, no panel ever.
     - "returning"  → split: chat | resize handle | closable side panel.
     - returning + closed → side panel closed, chat fills, reopen affordance shown.
   Split mechanics use react-resizable-panels (v4: Group / Panel / Separator).

   Step F — progressive disclosure: the returning shell owns the shared data
   (usePanelJobs) once, so the left-nav "Roles" count and the side-panel list read
   the SAME source. The first session deliberately renders its own lightweight tree
   (no jobs fetch, no nav progress) — the analysis is still streaming in the chat. */

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import s from "./workspace.module.css";
import LeftNav from "./LeftNav";
import ChatPane from "./ChatPane";
import SidePanel, { type PanelView } from "./SidePanel";
import { usePanelJobs } from "./usePanelJobs";
import { flushPendingCv } from "@/lib/cv";

type Variant = "first" | "returning" | "resolve";

export default function WorkspaceShell({ variant = "returning" }: { variant?: Variant }) {
  const resolved = useResolvedVariant(variant);
  // Once the first session goes live (user signed in and continues), promote to
  // returning so the full nav and side panel become accessible.
  const [firstSessionLive, setFirstSessionLive] = useState(false);
  const onFirstLive = useCallback(() => setFirstSessionLive(true), []);
  useEffect(() => {
    window.addEventListener("ci:first-session-live", onFirstLive);
    return () => window.removeEventListener("ci:first-session-live", onFirstLive);
  }, [onFirstLive]);

  const effective = (resolved === "first" && firstSessionLive) ? "returning" : resolved;
  return effective === "first" ? <FirstWorkspace /> : <ReturningWorkspace />;
}

const NOOP_SUBSCRIBE = () => () => {};
const cachedAnalysis = () => {
  try {
    return sessionStorage.getItem("analysis-result");
  } catch {
    return null;
  }
};

/* Resolve the "resolve" variant on the client: the server found no saved analysis,
   but a completed first session may be cached from before the user signed up. If so,
   they HAVE been read → returning (and we persist it so the server agrees next time).
   If not, this is a genuine first read → discovery.
   useSyncExternalStore reads the client-only cache with no hydration mismatch and no
   setState-in-effect: a true first-timer renders discovery immediately; only the rare
   just-signed-up case (cache present) reconciles to the workspace. */
function useResolvedVariant(variant: Variant): "first" | "returning" {
  const cached = useSyncExternalStore(NOOP_SUBSCRIBE, cachedAnalysis, () => null);

  useEffect(() => {
    if (variant !== "resolve" || !cached) return;
    try {
      fetch("/api/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: JSON.parse(cached) }),
      }).catch(() => {});
    } catch {
      /* malformed cache — still land them in the workspace */
    }
  }, [variant, cached]);

  if (variant !== "resolve") return variant;
  return cached ? "returning" : "first";
}

/* ---- first session / the click — chat full-width, surfaces still earning their place ---- */
function FirstWorkspace() {
  return (
    <div className={s.app}>
      <LeftNav variant="first" activeView={null} />
      <div className={`${s.work} ${s.closed}`}>
        <div className={s.pane} style={{ flex: "1 1 100%" }}>
          <ChatPane variant="first" />
        </div>
      </div>
    </div>
  );
}

/* ---- returning — split workspace; owns the shared jobs data once ---- */
function ReturningWorkspace() {
  // Open on Today — the conversation, full width. Surfaces (Roles/Direction/Documents)
  // open on demand; "Today" closes the panel again.
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelView, setPanelView] = useState<PanelView>("roles");
  // The specific saved role opened from the nav's "Recent" (saved-job detail view).
  const [savedJobId, setSavedJobId] = useState<string | null>(null);
  const split = panelOpen;

  // CV tailoring from chat — open the Documents panel so the user can find their CV.
  useEffect(() => {
    function onOpenDocuments() {
      setSavedJobId(null);
      setPanelView("documents");
      setPanelOpen(true);
    }
    window.addEventListener("ci:open-documents", onOpenDocuments);
    return () => window.removeEventListener("ci:open-documents", onOpenDocuments);
  }, []);

  // Shared jobs data — fetched once here so the nav count and the panel agree.
  const panelJobs = usePanelJobs();

  // A CV uploaded before signup is stashed; once the user lands here authed, persist
  // it to their Profile (the CV's home). No-op if there's nothing stashed.
  useEffect(() => { flushPendingCv(); }, []);

  // The nav "Roles" count = the roles that survive the same score filter the list
  // uses (low-scoring/senior results are dropped). Real progress, not a hard-coded 8.
  const rolesCount = useMemo(
    () => panelJobs.jobs.filter((j) => !j.relevanceScore || j.relevanceScore >= 4).length,
    [panelJobs.jobs]
  );

  // Nav drives what the panel shows; selecting a surface also opens the panel.
  function openSurface(view: PanelView) {
    setSavedJobId(null);
    setPanelView(view);
    setPanelOpen(true);
  }

  // Opening a saved role from "Recent" → the saved-job detail view.
  function openSaved(id: string) {
    setSavedJobId(id);
    setPanelView("saved");
    setPanelOpen(true);
  }

  return (
    <>
      <div className={s.app}>
        <LeftNav
          variant="returning"
          activeView={split ? panelView : null}
          onNavigate={openSurface}
          onToday={() => setPanelOpen(false)}
          onOpenSaved={openSaved}
          rolesCount={panelJobs.jobsLoading ? undefined : rolesCount}
        />

        {/* The chat Panel stays mounted whether or not the side panel is open — only
            the separator + side Panel toggle. Previously opening/closing the panel
            swapped ChatPane between two trees, remounting it and reloading the recap
            + conversation on every Today↔Roles toggle (walkthrough D). */}
        <div className={`${s.work} ${!split ? s.closed : ""}`}>
          <Group orientation="horizontal" id="ci-workspace" className={s.panelGroup}>
            {/* chat: never closable — hard pixel min-width */}
            <Panel id="chat" defaultSize={split ? "52%" : "100%"} minSize="380px" className={s.pane}>
              <ChatPane variant="returning" />
            </Panel>
            {split && <Separator className={s.divider} />}
            {split && (
              <Panel id="side" defaultSize="48%" minSize="340px" className={s.pane}>
                <SidePanel view={panelView} savedJobId={savedJobId} data={panelJobs} onClose={() => setPanelOpen(false)} onOpenRoles={() => openSurface("roles")} />
              </Panel>
            )}
          </Group>
        </div>
      </div>

    </>
  );
}
