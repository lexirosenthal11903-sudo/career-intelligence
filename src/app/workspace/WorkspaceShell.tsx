"use client";

/* Workspace shell — left nav + resizable split (chat | closable side panel).
   Three states (COMPONENT-INVENTORY §0):
     - "first"      → first session / the click: chat full-width, no panel ever.
     - "returning"  → split: chat | resize handle | closable side panel.
     - returning + closed → side panel closed, chat fills, reopen affordance shown.
   Split mechanics use react-resizable-panels (v4: Group / Panel / Separator).
   Static only — no data wiring (Steps C–E). */

import { useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import s from "./workspace.module.css";
import LeftNav from "./LeftNav";
import ChatPane from "./ChatPane";
import SidePanel, { type PanelView } from "./SidePanel";

type Variant = "first" | "returning";

export default function WorkspaceShell({ variant = "returning" }: { variant?: Variant }) {
  const [panelOpen, setPanelOpen] = useState(variant === "returning");
  const [panelView, setPanelView] = useState<PanelView>("roles");
  const first = variant === "first";
  const split = !first && panelOpen;

  // Nav drives what the panel shows; selecting a surface also opens the panel.
  function openSurface(view: PanelView) {
    setPanelView(view);
    setPanelOpen(true);
  }

  return (
    <div className={s.app}>
      <LeftNav
        variant={variant}
        activeView={split ? panelView : null}
        onNavigate={first ? undefined : openSurface}
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
              <SidePanel view={panelView} onClose={() => setPanelOpen(false)} />
            </Panel>
          </Group>
        ) : (
          <div className={s.pane} style={{ flex: "1 1 100%" }}>
            <ChatPane variant={variant} closed={!first} onReopen={() => setPanelOpen(true)} />
          </div>
        )}
      </div>
    </div>
  );
}
