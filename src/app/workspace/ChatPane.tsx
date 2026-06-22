"use client";

/* Chat pane — never closable. Renders the returning recap+live conversation or the
   first-session "click".
   Step C (this session): the returning conversation is wired to /api/chat via the
   existing useArloChat hook (message list + composer are live; advisor responds and
   the thread persists to the `conversations` table). The recap card stays static, and
   the first-session "click" stays static — its streaming is Step E.
   All static advisor copy is verbatim from VOICE-IN-UI.md — do not edit wording here. */
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";
import { ArloMessage } from "@/components/ArloMessage";
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

  // Who's here — drives the user bubble avatar and gates the live conversation.
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("E");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const name = user.user_metadata?.full_name ?? user.email ?? "";
      if (name) setUserInitial(name[0]!.toUpperCase());
    });
  }, [supabase]);

  // The live conversation. The hook initiates on first load (advisor opens),
  // loads any persisted thread, and handles send → respond → persist. We keep the
  // first-session view dormant (userId null) — its streaming arrives in Step E.
  const chat = useArloChat({
    page: "workspace",
    supabase,
    userId: first ? null : userId,
  });

  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text || chat.isLoading) return;
    setDraft("");
    chat.sendMessage(text);
  }

  function sendChip(label: string) {
    if (chat.isLoading) return;
    chat.sendMessage(label);
  }

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
          {first ? (
            <FirstSession />
          ) : (
            <ReturningSession
              chat={chat}
              userInitial={userInitial}
            />
          )}
        </div>
      </div>

      {first ? (
        <StaticComposer />
      ) : (
        <LiveComposer
          draft={draft}
          onChange={setDraft}
          onSend={send}
          onChip={sendChip}
          disabled={chat.isLoading}
        />
      )}
    </section>
  );
}

/* ---- returning: static "Where we got to" recap, then the live conversation ---- */
function ReturningSession({
  chat,
  userInitial,
}: {
  chat: ReturnType<typeof useArloChat>;
  userInitial: string;
}) {
  return (
    <>
      <div className={s.stamp}>Yesterday</div>

      {/* recap stays static (Step C) — generated server-side in a later step */}
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

      {/* live conversation — wired to /api/chat (Step C) */}
      <LiveThread chat={chat} userInitial={userInitial} />
    </>
  );
}

/* ---- live message thread (advisor + user bubbles + thinking indicator) ---- */
function LiveThread({
  chat,
  userInitial,
}: {
  chat: ReturnType<typeof useArloChat>;
  userInitial: string;
}) {
  const { extraMsgs, isLoading, messagesEndRef } = chat;
  return (
    <>
      {extraMsgs.map((m, i) => {
        if (m.role === "divider") {
          return (
            <div key={i} className={s.stamp}>
              New session
            </div>
          );
        }
        if (m.role === "user") {
          return (
            <div key={i} className={`${s.msg} ${s.me}`}>
              <div className={s.av}>{userInitial}</div>
              <div className={s.bub}>{m.text}</div>
            </div>
          );
        }
        return (
          <div key={i} className={s.msg}>
            <div className={s.av}>
              <RadiantAvatar />
            </div>
            <div className={s.bub}>
              <ArloMessage text={m.text} action={m.action} actions={m.actions} />
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className={s.msg}>
          <div className={s.av}>
            <RadiantAvatar />
          </div>
          <div className={s.bub}>
            <span className={s.wait}>
              <span className={s.dots}>
                <i />
                <i />
                <i />
              </span>
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}

/* ---- first session: arrival → share + CV → wait → the click → bridge (static; Step E) ---- */
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

/* ---- live composer (returning): chips + input bar wired to the conversation ---- */
function LiveComposer({
  draft,
  onChange,
  onSend,
  onChip,
  disabled,
}: {
  draft: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onChip: (label: string) => void;
  disabled: boolean;
}) {
  const chips = [
    "Open the Nesta role",
    "Refine my direction",
    "Help with my CV",
    "Salary for these roles",
  ];
  return (
    <div className={s.composer}>
      <div className={s.chips}>
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            className={s.chip}
            onClick={() => onChip(c)}
            disabled={disabled}
          >
            {c}
          </button>
        ))}
      </div>
      <div className={s.cbar}>
        <button className={s.cplus} type="button" aria-label="Attach a file">
          <PlusIcon />
        </button>
        <input
          placeholder="Tell me what you're thinking…"
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button
          className={s.csend}
          type="button"
          aria-label="Send"
          onClick={onSend}
          disabled={disabled}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

/* ---- static composer (first session): not wired — streaming is Step E ---- */
function StaticComposer() {
  return (
    <div className={s.composer}>
      <div className={s.chips}>
        <span className={`${s.chip} ${s.lead}`}>Show me the first few roles</span>
        <span className={s.chip}>Tell me about behavioural research</span>
        <span className={s.chip}>Why these three?</span>
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
