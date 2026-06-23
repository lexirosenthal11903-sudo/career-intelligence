"use client";

/* Left nav — progressive disclosure: "first" (surfaces earn their place) vs "returning".
   First session: Roles flagged "new" (just unlocked at the click), Documents locked, a
   nav note instead of a count/Recent. Returning: Roles shows a real count, "Recent"
   appears once there are flagged roles, and the user block is the real signed-in user.
   The count comes from the shared jobs data (shell); user + Recent from useNavProgress. */
import s from "./workspace.module.css";
import { useNavProgress } from "./useNavProgress";
import {
  RadiantMark,
  TodayIcon,
  RolesIcon,
  DirectionIcon,
  DocumentsIcon,
  ProfileIcon,
} from "./icons";

type Variant = "first" | "returning";
type PanelView = "roles" | "direction" | "documents";

export default function LeftNav({
  variant,
  activeView,
  onNavigate,
  onToday,
  onOpenSaved,
  rolesCount,
}: {
  variant: Variant;
  activeView?: PanelView | "saved" | null;
  onNavigate?: (view: PanelView) => void;
  onToday?: () => void;
  onOpenSaved?: (id: string) => void;
  rolesCount?: number;
}) {
  const first = variant === "first";
  const { user, recent } = useNavProgress();
  const cls = (view: PanelView) => `${s.nitem} ${activeView === view ? s.on : ""}`;

  const initial = first ? "" : user?.initial ?? "";
  const name = first ? "" : user?.name ?? "";
  const email = first ? "" : user?.email ?? "";

  return (
    <nav className={s.nav}>
      <div className={s.brand}>
        <div className={s.logo}>
          <RadiantMark />
        </div>
        <div className={s.bn}>
          Career
          <br />
          Intelligence
        </div>
      </div>

      <button
        className={`${s.nitem} ${activeView == null ? s.on : ""}`}
        type="button"
        onClick={onToday}
      >
        <TodayIcon /> Today
      </button>

      <button className={cls("roles")} type="button" onClick={() => onNavigate?.("roles")}>
        <RolesIcon /> Roles
        {first ? (
          <span className={s.new}>new</span>
        ) : rolesCount != null && rolesCount > 0 ? (
          <span className={s.ct}>{rolesCount}</span>
        ) : null}
      </button>

      <button className={cls("direction")} type="button" onClick={() => onNavigate?.("direction")}>
        <DirectionIcon /> Your direction
      </button>

      <button
        className={`${s.nitem} ${first ? s.locked : ""} ${activeView === "documents" ? s.on : ""}`}
        type="button"
        disabled={first}
        onClick={() => onNavigate?.("documents")}
      >
        <DocumentsIcon /> Documents
      </button>

      {/* Profile view isn't built yet — show it as clearly locked rather than a
          dead button that does nothing when clicked (audit #8). */}
      <button className={`${s.nitem} ${s.locked}`} type="button" disabled title="Coming soon">
        <ProfileIcon /> Profile
      </button>

      {!first && recent.length > 0 && (
        <>
          <div className={s.nsec}>Recent</div>
          {recent.map((r) => (
            <button
              key={r.id}
              className={s.recent}
              type="button"
              onClick={() => onOpenSaved?.(r.id)}
            >
              <span className={s.st}>★</span>
              <span className={s.rtext}>
                <b>{r.company}</b>
                {r.title && <span>{r.title}</span>}
              </span>
            </button>
          ))}
        </>
      )}

      <div className={s.sp} />

      {first && (
        <div className={s.navnote}>We&rsquo;ve only just met — more of this fills in as we talk.</div>
      )}

      {!first && user && (
        <div className={s.user}>
          <div className={s.uav}>{initial}</div>
          <div>
            <div className={s.uname}>{name}</div>
            {email && <div className={s.umail}>{email}</div>}
          </div>
        </div>
      )}
    </nav>
  );
}
