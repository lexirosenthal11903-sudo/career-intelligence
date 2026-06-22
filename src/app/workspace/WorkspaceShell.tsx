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

import { useMemo, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import s from "./workspace.module.css";
import LeftNav from "./LeftNav";
import ChatPane from "./ChatPane";
import SidePanel, { type PanelView } from "./SidePanel";
import { usePanelJobs } from "./usePanelJobs";

type Variant = "first" | "returning";

export default function WorkspaceShell({ variant = "returning" }: { variant?: Variant }) {
  return variant === "first" ? <FirstWorkspace /> : <ReturningWorkspace />;
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
  const split = panelOpen;

  // Shared jobs data — fetched once here so the nav count and the panel agree.
  const panelJobs = usePanelJobs();

  // The nav "Roles" count = the roles that survive the same score filter the list
  // uses (low-scoring/senior results are dropped). Real progress, not a hard-coded 8.
  const rolesCount = useMemo(
    () => panelJobs.jobs.filter((j) => !j.relevanceScore || j.relevanceScore >= 4).length,
    [panelJobs.jobs]
  );

  // Nav drives what the panel shows; selecting a surface also opens the panel.
  function openSurface(view: PanelView) {
    setPanelView(view);
    setPanelOpen(true);
  }

  return (
    <div className={s.app}>
      <LeftNav
        variant="returning"
        activeView={split ? panelView : null}
        onNavigate={openSurface}
        onToday={() => setPanelOpen(false)}
        rolesCount={panelJobs.jobsLoading ? undefined : rolesCount}
      />

      <div className={`${s.work} ${!split ? s.closed : ""}`}>
        {split ? (
          <Group orientation="horizontal" id="ci-workspace" className={s.panelGroup}>
            {/* chat: never closable — hard pixel min-width */}
            <Panel id="chat" defaultSize="52%" minSize="380px" className={s.pane}>
              <ChatPane variant="returning" />
            </Panel>
            <Separator className={s.divider} />
            {/* side: closable + resizable — hard pixel min-width */}
            <Panel id="side" defaultSize="48%" minSize="340px" className={s.pane}>
              <SidePanel view={panelView} data={panelJobs} onClose={() => setPanelOpen(false)} />
            </Panel>
          </Group>
        ) : (
          <div className={s.pane} style={{ flex: "1 1 100%" }}>
            <ChatPane variant="returning" closed onReopen={() => setPanelOpen(true)} />
          </div>
        )}
      </div>
    </div>
  );
}
