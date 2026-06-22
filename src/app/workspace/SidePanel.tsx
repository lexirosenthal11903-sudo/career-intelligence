/* Side panel — closable + resizable. Hosts one thing at a time; here: the roles list.
   Panel hint copy is verbatim from VOICE-IN-UI.md §5. */
import s from "./workspace.module.css";
import { RolesIcon, CloseIcon, HintIcon, ChevronIcon } from "./icons";

type Job = {
  initial: string;
  colour: string;
  title: string;
  meta: string;
  strong: boolean;
};

const STRONG: Job[] = [
  { initial: "N", colour: "#2E5E46", title: "Behavioural Researcher", meta: "Nesta · London / hybrid · £32–38k", strong: true },
  { initial: "C", colour: "#3A4DA8", title: "UX Researcher (Junior)", meta: "Citizens Advice · Remote · £29–34k", strong: true },
];

const GOOD: Job[] = [
  { initial: "K", colour: "#8A3B3B", title: "Insight Assistant", meta: "The King's Fund · London · £27–30k", strong: false },
  { initial: "M", colour: "#5B5BA0", title: "Research Assistant, People & Behaviour", meta: "MoreThanNow · Hybrid · £26–31k", strong: false },
  { initial: "B", colour: "#B0681E", title: "Service Designer (Entry)", meta: "Brave Bison · Manchester · £28–33k", strong: false },
];

function JobRow({ job }: { job: Job }) {
  return (
    <button className={s.job} type="button">
      <div className={s.jlogo} style={{ background: job.colour }}>
        {job.initial}
      </div>
      <div className={s.jmid}>
        <div className={s.jt}>
          {job.strong && <span className={s.dot} />}
          {job.title}
        </div>
        <div className={s.jc}>{job.meta}</div>
        <span className={`${s.jfit} ${job.strong ? "" : s.good}`}>
          {job.strong ? "Strong fit" : "Good fit"}
        </span>
      </div>
      <span className={s.jrev}>
        Review <ChevronIcon />
      </span>
    </button>
  );
}

export default function SidePanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className={s.side}>
      <div className={s.sideTabs}>
        <div className={s.stab}>
          <RolesIcon width={14} height={14} /> Roles for you
          <button className={s.x} type="button" onClick={onClose} aria-label="Close panel">
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className={s.sideH}>
        <div className={s.ti}>
          <h3>Roles for you</h3>
          <span className={s.n}>8 live</span>
        </div>
        <div className={s.sub}>Ranked by fit · refreshed this morning</div>
        <div className={s.hint}>
          <HintIcon /> Don&rsquo;t scroll endlessly — just tell me what to change.
        </div>
      </div>

      <div className={s.sideB}>
        <div className={s.grp}>Strong fit</div>
        {STRONG.map((j) => (
          <JobRow key={j.title} job={j} />
        ))}
        <div className={s.grp}>Good fit</div>
        {GOOD.map((j) => (
          <JobRow key={j.title} job={j} />
        ))}
      </div>
    </aside>
  );
}
