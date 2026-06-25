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
  ApplicationsIcon,
} from "./icons";

type Variant = "first" | "returning";
type PanelView = "roles" | "direction" | "documents" | "profile" | "applications";

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

      {/* First session: brand only. The surfaces (Roles/Direction/Documents/Profile)
          haven't been earned yet — they'd just be empty tabs the user can't use. They
          appear once the user is in the workspace proper. (Lexi, 2026-06-24.) */}
      {first ? (
        <div className={s.sp} />
      ) : (
      <>
      <button
        className={`${s.nitem} ${activeView == null ? s.on : ""}`}
        type="button"
        onClick={onToday}
      >
        <TodayIcon /> Today
      </button>

      <button className={cls("direction")} type="button" onClick={() => onNavigate?.("direction")}>
        <DirectionIcon /> Your direction
      </button>

      <button className={cls("roles")} type="button" onClick={() => onNavigate?.("roles")}>
        <RolesIcon /> Roles
        {first ? (
          <span className={s.new}>new</span>
        ) : rolesCount != null && rolesCount > 0 ? (
          <span className={s.ct}>{rolesCount}</span>
        ) : null}
      </button>

      <button
        className={`${s.nitem} ${first ? s.locked : ""} ${activeView === "applications" ? s.on : ""}`}
        type="button"
        disabled={first}
        onClick={() => onNavigate?.("applications")}
      >
        <ApplicationsIcon /> Applications
      </button>

      <button
        className={`${s.nitem} ${first ? s.locked : ""} ${activeView === "documents" ? s.on : ""}`}
        type="button"
        disabled={first}
        onClick={() => onNavigate?.("documents")}
      >
        <DocumentsIcon /> Documents
      </button>

      <button
        className={`${s.nitem} ${first ? s.locked : ""} ${activeView === "profile" ? s.on : ""}`}
        type="button"
        disabled={first}
        onClick={() => onNavigate?.("profile")}
      >
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

      {!first && user && (
        <button className={s.user} type="button" onClick={() => onNavigate?.("profile")} title="Your profile">
          <div className={s.uav}>{initial}</div>
          <div>
            <div className={s.uname}>{name}</div>
            {email && <div className={s.umail}>{email}</div>}
          </div>
        </button>
      )}
      </>
      )}
    </nav>
  );
}
