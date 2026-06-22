/* Left nav — progressive disclosure: "first" (surfaces earn their place) vs "returning". */
import s from "./workspace.module.css";
import {
  RadiantMark,
  TodayIcon,
  RolesIcon,
  DirectionIcon,
  DocumentsIcon,
  ProfileIcon,
} from "./icons";

type Variant = "first" | "returning";

export default function LeftNav({ variant }: { variant: Variant }) {
  const first = variant === "first";

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

      <button className={`${s.nitem} ${s.on}`} type="button">
        <TodayIcon /> Today
      </button>

      <button className={s.nitem} type="button">
        <RolesIcon /> Roles
        {first ? <span className={s.new}>new</span> : <span className={s.ct}>8</span>}
      </button>

      <button className={s.nitem} type="button">
        <DirectionIcon /> Your direction
      </button>

      <button className={`${s.nitem} ${first ? s.locked : ""}`} type="button" disabled={first}>
        <DocumentsIcon /> Documents
      </button>

      <button className={s.nitem} type="button">
        <ProfileIcon /> Profile
      </button>

      {!first && (
        <>
          <div className={s.nsec}>Recent</div>
          <button className={s.recent} type="button">
            <span className={s.st}>★</span>
            <b>Nesta</b>
            <span>· Behavioural Researcher</span>
          </button>
          <button className={s.recent} type="button">
            <span className={s.st}>★</span>
            <b>Citizens Advice</b>
            <span>· UX Researcher</span>
          </button>
        </>
      )}

      <div className={s.sp} />

      {first && (
        <div className={s.navnote}>We&rsquo;ve only just met — more of this fills in as we talk.</div>
      )}

      <div className={s.user}>
        <div className={s.uav}>E</div>
        <div>
          <div className={s.uname}>Ellie Hartley</div>
          <div className={s.umail}>ellie.hartley@gmail.com</div>
        </div>
      </div>
    </nav>
  );
}
