/* Chat pane — never closable. Renders the returning recap+messages or the first-session "click".
   All advisor copy is verbatim from VOICE-IN-UI.md — do not edit wording here. */
import s from "./workspace.module.css";
import {
  RadiantAvatar,
  RadiantReveal,
  CheckIcon,
  PlusIcon,
  SendIcon,
  RolesIcon,
  FileIcon,
} from "./icons";

type Variant = "first" | "returning";

export default function ChatPane({
  variant,
  closed,
  onReopen,
}: {
  variant: Variant;
  closed?: boolean;
  onReopen?: () => void;
}) {
  const first = variant === "first";

  return (
    <section className={s.chat}>
      <div className={s.ctop}>
        <span className={s.pres} />
        <span className={s.t}>Career Intelligence</span>
        <span className={s.s}>· here with you</span>
        {first ? (
          <span className={s.day}>Today · 9:06</span>
        ) : closed ? (
          <button className={s.reopen} type="button" onClick={onReopen}>
            <RolesIcon /> Roles
          </button>
        ) : (
          <span className={s.day}>Tue · 9:14</span>
        )}
      </div>

      <div className={s.stream}>
        <div className={s.col}>
          {first ? <FirstSession /> : <ReturningSession />}
        </div>
      </div>

      <Composer variant={variant} />
    </section>
  );
}

/* ---- returning: "Where we got to" recap + the morning's two messages ---- */
function ReturningSession() {
  return (
    <>
      <div className={s.stamp}>Yesterday</div>

      <div className={s.recap}>
        <div className={s.recapH}>
          <span className={s.ic}>
            <CheckIcon />
          </span>
          <b>Where we got to</b>
          <span className={s.pill}>Direction forming</span>
        </div>
        <div className={s.recapB}>
          <p>
            Good talk yesterday, Ellie. You came in unsure a psychology degree led anywhere without a
            PhD — and by the end, <b>it clearly does.</b> Here&rsquo;s what I took away:
          </p>
          <div className={s.rlabel}>What&rsquo;s becoming clear</div>
          <ul className={s.rlist}>
            <li>
              The part of your degree you lit up about — <b>why people make the choices they do</b> —
              is a whole field of work, not a dead end.
            </li>
            <li>
              You&rsquo;d rather <b>understand people and design for them</b> than sit in pure
              analysis.
            </li>
            <li>London-based; drawn to charities and research orgs over big corporates.</li>
          </ul>
          <div className={s.rlabel}>What I&rsquo;m doing next</div>
          <ul className={s.rlist}>
            <li>
              Searching <b>behavioural &amp; UX research</b> roles, entry-level, ranked by fit.
            </li>
            <li>
              New matches land in <b>Roles</b> — I&rsquo;ll flag the strong ones here.
            </li>
          </ul>
        </div>
      </div>

      <div className={s.stamp}>Today</div>

      <div className={s.msg}>
        <div className={s.av}>
          <RadiantAvatar />
        </div>
        <div className={s.bub}>
          Two new roles came in overnight. The <em>Behavioural Researcher at Nesta</em> is almost
          exactly your dissertation question — it&rsquo;s top of your Roles on the right. Want to open
          it together?
        </div>
      </div>

      <div className={`${s.msg} ${s.me}`}>
        <div className={s.av}>E</div>
        <div className={s.bub}>Yes — that one actually makes me sit up.</div>
      </div>
    </>
  );
}

/* ---- first session: arrival → share + CV → wait → the click → bridge ---- */
function FirstSession() {
  return (
    <>
      <div className={s.stamp}>Today</div>

      {/* opener */}
      <div className={s.msg}>
        <div className={s.av}>
          <RadiantAvatar />
        </div>
        <div className={s.bub}>
          I&rsquo;m here to help you work out what you actually want — and then go and get it. No
          forms, no quiz. Tell me where you&rsquo;re at, or drop your CV in, and we&rsquo;ll start
          from there.
        </div>
      </div>

      {/* user shares + CV */}
      <div className={`${s.msg} ${s.me}`}>
        <div className={s.av}>E</div>
        <div className={s.bub}>
          Just finished a psychology degree and honestly I&rsquo;m a bit lost. Feels like it
          doesn&rsquo;t lead anywhere unless I do a PhD, which I don&rsquo;t want.
          <span className={s.fileatt}>
            <FileIcon /> Ellie_Hartley_CV.pdf
          </span>
        </div>
      </div>

      {/* the wait (replaces the loading screen) */}
      <div className={s.msg}>
        <div className={s.av}>
          <RadiantAvatar />
        </div>
        <div className={s.bub}>
          <span className={s.wait}>
            Give me a minute with this — I want to read it properly, not skim it.
            <span className={s.dots}>
              <i />
              <i />
              <i />
            </span>
          </span>
        </div>
      </div>

      {/* THE CLICK */}
      <div className={s.reveal}>
        <div className={s.revealH}>
          <span className={s.ic}>
            <RadiantReveal />
          </span>
          <b>Here&rsquo;s where I see this going</b>
          <span className={s.pill}>Worth exploring</span>
        </div>
        <div className={s.revealB}>
          <p>
            I&rsquo;ve read all of it, Ellie. The part you lit up about —{" "}
            <em>why people make the choices they do</em> — isn&rsquo;t a footnote in your degree.
            It&rsquo;s a whole field of work. And <b>you don&rsquo;t need the PhD to be in it.</b>
          </p>
          <div className={s.rlabel}>Three directions worth exploring</div>
          <ul className={s.dirs}>
            <li className={`${s.dir} ${s.lead}`}>
              <span className={s.num}>1</span>
              <span className={s.dt}>
                <b>Behavioural research</b> — your dissertation instinct, made into a job:
                understanding why people do what they do. <span className={s.leadTag}>The clearest fit.</span>
              </span>
            </li>
            <li className={s.dir}>
              <span className={s.num}>2</span>
              <span className={s.dt}>
                <b>UX research</b> — the same curiosity, pointed at how people use products and
                services.
              </span>
            </li>
            <li className={s.dir}>
              <span className={s.num}>3</span>
              <span className={s.dt}>
                <b>Service &amp; policy design</b> — designing the things people actually move through,
                for charities and public bodies.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* the bridge to roles */}
      <div className={s.msg}>
        <div className={s.av}>
          <RadiantAvatar />
        </div>
        <div className={s.bub}>
          The first one is where I&rsquo;d start. I&rsquo;ve already found a handful of real roles that
          fit — want to look at the first few together?
        </div>
      </div>
    </>
  );
}

/* ---- composer: chips + input bar. Chips differ per variant. ---- */
function Composer({ variant }: { variant: Variant }) {
  const first = variant === "first";
  return (
    <div className={s.composer}>
      <div className={s.chips}>
        {first ? (
          <>
            <span className={`${s.chip} ${s.lead}`}>Show me the first few roles</span>
            <span className={s.chip}>Tell me about behavioural research</span>
            <span className={s.chip}>Why these three?</span>
          </>
        ) : (
          <>
            <span className={s.chip}>Open the Nesta role</span>
            <span className={s.chip}>Refine my direction</span>
            <span className={s.chip}>Help with my CV</span>
            <span className={s.chip}>Salary for these roles</span>
          </>
        )}
      </div>
      <div className={s.cbar}>
        <button className={s.cplus} type="button" aria-label="Attach a file">
          <PlusIcon />
        </button>
        <input placeholder="Tell me what you're thinking…" />
        <button className={s.csend} type="button" aria-label="Send">
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
