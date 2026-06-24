"use client";

/* Chat pane — never closable. Renders the returning recap+live conversation or the
   first-session "click".
   Step C: the returning conversation is wired to /api/chat via the existing
   useArloChat hook (message list + composer are live; advisor responds and the thread
   persists to the `conversations` table).
   Step E (this session): the first session is now LIVE — arrival → the user shares
   (+ optional CV) → /api/analyse streams inline (killing the old loading screen) →
   the "click" reveal is built from the real analysis (useFirstSession). The wait line,
   reveal structural copy, and bridge line are verbatim from VOICE-IN-UI.md — only the
   summary + direction content is generated. Do not edit advisor wording here. */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";
import { useFirstSession } from "@/hooks/useFirstSession";
import { useRecap } from "./useRecap";
import { ArloMessage } from "@/components/ArloMessage";
import s from "./workspace.module.css";
import {
  RadiantAvatar,
  RadiantReveal,
  CheckIcon,
  PlusIcon,
  SendIcon,
  FileIcon,
} from "./icons";

// Post-click continuation: a follow-up typed/clicked at the end of the first
// session is stashed here, then picked up once by the returning conversation
// (the one real /api/chat thread). Keeps intent from being lost on the handoff.
const PENDING_KEY = "pending-advisor-message";

type Variant = "first" | "returning";

export default function ChatPane({ variant }: { variant: Variant }) {
  const first = variant === "first";
  const router = useRouter();

  // Who's here — drives the user bubble avatar and gates the live conversation.
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  // No placeholder letter — an avatar initial only appears once we actually know
  // the user's name (the "E" bug: a stray initial shown before/without auth).
  const [userInitial, setUserInitial] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const name = user.user_metadata?.full_name ?? user.email ?? "";
      if (name) setUserInitial(name[0]!.toUpperCase());
    });
  }, [supabase]);

  // Live day + time for the header (was hardcoded "Tue · 9:14"). Computed after
  // mount to avoid a hydration mismatch, and ticks every 30s so it isn't frozen.
  const [stamp, setStamp] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-GB", { weekday: "short" });
      const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      setStamp(`${first ? "Today" : day} · ${time}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [first]);

  // The live conversation. The hook initiates on first load (advisor opens),
  // loads any persisted thread, and handles send → respond → persist. We keep the
  // first-session view dormant (userId null) — its streaming arrives in Step E.
  const chat = useArloChat({
    page: "workspace",
    supabase,
    userId: first ? null : userId,
  });

  // First-session streaming state machine (Step E). Inert until the user sends
  // their first message; replaces the old loading screen + onboarding bridge.
  const fs = useFirstSession();

  const [draft, setDraft] = useState("");

  // The side panel hands prompts to the conversation (Interested/Pass, reach-out,
  // outreach draft) via a window event — the panel displays, the advisor speaks.
  useEffect(() => {
    if (first) return;
    function onAsk(e: Event) {
      const prompt = (e as CustomEvent<string>).detail;
      if (prompt && !chat.isLoading) chat.sendMessage(prompt);
    }
    window.addEventListener("ci:ask-advisor", onAsk);
    return () => window.removeEventListener("ci:ask-advisor", onAsk);
  }, [first, chat]);

  // Pick up a follow-up carried over from the end of the first session, once.
  const seedSentRef = useRef(false);
  useEffect(() => {
    if (first || seedSentRef.current) return;
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_KEY);
      if (pending) sessionStorage.removeItem(PENDING_KEY);
    } catch {
      /* sessionStorage unavailable */
    }
    if (pending) {
      seedSentRef.current = true;
      chat.sendMessage(pending);
    }
  }, [first, chat]);

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

  // First session: kick off discovery from the user's first message.
  function startFirst() {
    const text = draft.trim();
    if (!text && !fs.hasCv()) return;
    setDraft("");
    fs.start(text);
  }

  // First session: answer a discovery question.
  function answerFirst() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    fs.answer(text);
  }

  // Post-click: continue into the real workspace conversation (lead chip = roles;
  // any follow-up is stashed so the returning thread picks it up).
  function continueToWorkspace(seed?: string) {
    if (seed) {
      try {
        sessionStorage.setItem(PENDING_KEY, seed);
      } catch {
        /* best-effort */
      }
    }
    router.push("/workspace");
  }

  return (
    <section className={s.chat}>
      <div className={s.ctop}>
        <span className={s.pres} />
        <span className={s.t}>Career Intelligence</span>
        <span className={s.day}>{stamp}</span>
      </div>

      <div className={s.stream}>
        <div className={s.col}>
          {first ? (
            <FirstSession fs={fs} userInitial={userInitial} />
          ) : (
            <ReturningSession
              chat={chat}
              userInitial={userInitial}
            />
          )}
        </div>
      </div>

      {first ? (
        <FirstComposer
          fs={fs}
          draft={draft}
          onChange={setDraft}
          onStart={startFirst}
          onAnswer={answerFirst}
          onContinue={continueToWorkspace}
        />
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
  // Real, per-user recap (VOICE-IN-UI §3). While it generates we hold the space with
  // a skeleton so the conversation doesn't jump; if there's no analysis yet, nothing
  // shows — the conversation just starts. No more hardcoded example copy.
  const { recap, loading } = useRecap();
  const showRecap = loading || !!recap;

  return (
    <>
      {showRecap && <div className={s.stamp}>Earlier</div>}

      {loading && !recap && <RecapSkeleton />}
      {recap && <RecapCard recap={recap} />}

      {showRecap && <div className={s.stamp}>Today</div>}

      {/* live conversation — wired to /api/chat (Step C) */}
      <LiveThread chat={chat} userInitial={userInitial} />
    </>
  );
}

/* ---- the real "Where we got to" recap (generated per user) ---- */
function RecapCard({ recap }: { recap: ReturnType<typeof useRecap>["recap"] }) {
  if (!recap) return null;
  return (
    <div className={s.recap}>
      <div className={s.recapH}>
        <span className={s.ic}>
          <CheckIcon />
        </span>
        <b>Where we got to</b>
      </div>
      <div className={s.recapB}>
        <p>{recap.greeting}</p>
        {recap.becomingClear.length > 0 && (
          <>
            <div className={s.rlabel}>What&rsquo;s becoming clear</div>
            <ul className={s.rlist}>
              {recap.becomingClear.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </>
        )}
        {recap.doingNext.length > 0 && (
          <>
            <div className={s.rlabel}>What I&rsquo;m doing next</div>
            <ul className={s.rlist}>
              {recap.doingNext.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/* ---- recap loading placeholder — holds the layout while it generates ---- */
function RecapSkeleton() {
  return (
    <div className={s.recap}>
      <div className={s.recapH}>
        <span className={s.ic}>
          <CheckIcon />
        </span>
        <b>Where we got to</b>
      </div>
      <div className={s.recapB}>
        <div className={s.skeleton} style={{ height: 16, width: "92%", marginBottom: 8 }} />
        <div className={s.skeleton} style={{ height: 16, width: "78%", marginBottom: 18 }} />
        <div className={s.skeleton} style={{ height: 12, width: "40%", marginBottom: 10 }} />
        <div className={s.skeleton} style={{ height: 14, width: "88%", marginBottom: 7 }} />
        <div className={s.skeleton} style={{ height: 14, width: "70%" }} />
      </div>
    </div>
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

/* ---- first session: arrival → share + CV → wait → the click → bridge (LIVE; Step E) ----
   The opener, wait line, reveal header/pill/label/lead-tag, and bridge line are verbatim
   from VOICE-IN-UI.md §1–§2. Only the summary + directions are generated (from /api/analyse). */
function FirstSession({
  fs,
  userInitial,
}: {
  fs: ReturnType<typeof useFirstSession>;
  userInitial: string;
}) {
  const { phase, userMessage, cvFileName, result, slow, discovery } = fs;
  const started = phase !== "arrival" && phase !== "extracting";

  // Scroll to follow the conversation. While analysing, land on the wait bubble.
  // On the reveal, frame the card's TOP — the "click" header is the moment; we never
  // scroll past it to the bottom. (Two rAFs so the card has laid out before we scroll.)
  const endRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Honour prefers-reduced-motion — smooth scrolling is JS here, so the global
    // CSS reduced-motion rule can't reach it; jump instantly instead.
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    if (phase === "analysing" || phase === "error" || phase === "discovery" || phase === "thinking") {
      endRef.current?.scrollIntoView({ behavior, block: "end" });
    } else if (phase === "revealed") {
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          revealRef.current?.scrollIntoView({ behavior, block: "start" })
        )
      );
    }
  }, [phase, result, discovery]);

  return (
    <>
      <div className={s.stamp}>Today</div>

      {/* opener (locked §1) */}
      <div className={s.msg}>
        <div className={s.av}>
          <RadiantAvatar />
        </div>
        <div className={s.bub}>
          I&rsquo;m here to help you work out what you actually want — and then go and get it. We
          start with the direction that fits you; the right roles come after, once they&rsquo;re worth
          your time. No forms, no quiz — just tell me where you&rsquo;re at, or drop your CV in.
        </div>
      </div>

      {/* user shares + CV — shown once the analysis has been kicked off */}
      {started && (
        <div className={`${s.msg} ${s.me}`}>
          <div className={s.av}>{userInitial}</div>
          <div className={s.bub}>
            {userMessage}
            {cvFileName && (
              <span className={s.fileatt}>
                <FileIcon /> {cvFileName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* discovery — the advisor asks before it tells (questions + the user's answers) */}
      {discovery.map((turn, i) =>
        turn.role === "arlo" ? (
          <div className={s.msg} key={i}>
            <div className={s.av}>
              <RadiantAvatar />
            </div>
            <div className={s.bub}>{turn.text}</div>
          </div>
        ) : (
          <div className={`${s.msg} ${s.me}`} key={i}>
            <div className={s.av}>{userInitial}</div>
            <div className={s.bub}>{turn.text}</div>
          </div>
        )
      )}

      {/* the advisor is composing its next question */}
      {phase === "thinking" && (
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

      {/* the wait (locked §1; replaces the loading screen) */}
      {phase === "analysing" && (
        <div className={s.msg}>
          <div className={s.av}>
            <RadiantAvatar />
          </div>
          <div className={s.bub}>
            <span className={s.wait}>
              {slow
                ? "Still working — this one's taking a bit longer than usual."
                : "Give me a minute with this — I want to read it properly, not skim it."}
              <span className={s.dots}>
                <i />
                <i />
                <i />
              </span>
            </span>
          </div>
        </div>
      )}

      {/* THE CLICK — built from the real analysis */}
      {phase === "revealed" && result && (
        <div ref={revealRef}>
          <RevealCard result={result} />
        </div>
      )}

      {/* Post-reveal beats — the advisor runs the session (first-session arc spec).
          Order: feelings beat (always) → roles offer (calibrated to clarity, never
          pushed first for an unsure user) → close on one concrete action. */}
      {phase === "revealed" && result && (
        <PostReveal result={result} clarity={fs.directionClarity} />
      )}

      {/* error — the advisor owns it (locked error voice), with a retry */}
      {phase === "error" && (
        <div className={s.msg}>
          <div className={s.av}>
            <RadiantAvatar />
          </div>
          <div className={s.bub}>
            Something went wrong on my end. It&rsquo;s not your CV — it&rsquo;s me.{" "}
            <button type="button" className={s.retry} onClick={fs.retry}>
              Want to try again?
            </button>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </>
  );
}

/* ---- the reveal / "the click" card (real data + locked structural copy) ---- */
function RevealCard({ result }: { result: ReturnType<typeof useFirstSession>["result"] }) {
  if (!result) return null;
  const { summary, directions } = result;
  const label = directions.length === 3 ? "Three directions worth exploring" : "Directions worth exploring";
  return (
    <div className={s.reveal}>
      <div className={s.revealH}>
        <span className={s.ic}>
          <RadiantReveal />
        </span>
        <b>Here&rsquo;s where I see this going</b>
      </div>
      <div className={s.revealB}>
        {summary && <p>{summary}</p>}
        {directions.length > 0 && (
          <>
            <div className={s.rlabel}>{label}</div>
            <ul className={s.dirs}>
              {directions.map((d, i) => (
                <li key={i} className={i === 0 ? `${s.dir} ${s.lead}` : s.dir}>
                  <span className={s.num}>{i + 1}</span>
                  <span className={s.dt}>
                    <b>{d.title}</b>
                    {d.why ? <> — {d.why}</> : null}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/* ---- post-reveal beats: feelings → calibrated roles offer → close on one action ----
   The feelings beat is required (it's what makes this mentorship, not output). Roles
   are "earned in": offered up front only to a DIRECTED user; held back, no-rush, for
   anyone unsure. The close is the generated, calibrated single next action (Beat 5). */
function PostReveal({
  result,
  clarity,
}: {
  result: NonNullable<ReturnType<typeof useFirstSession>["result"]>;
  clarity: ReturnType<typeof useFirstSession>["directionClarity"];
}) {
  const directed = clarity === "directed";
  return (
    <>
      {/* Beat 3 — the feelings beat (always) */}
      <AdvisorBubble>
        Before anything else — which of these feels like you, and which doesn&rsquo;t? That tells me
        more than any verdict from me would.
      </AdvisorBubble>

      {/* Beat 4 — roles, earned in (calibrated) */}
      <AdvisorBubble>
        {directed ? (
          <>
            The first one is where I&rsquo;d start. I&rsquo;ve already found a handful of real roles
            that fit — want to look at the first few together?
          </>
        ) : (
          <>
            No rush to look at roles yet. When one of these starts to feel right, tell me — I&rsquo;ll
            pull a small handful that genuinely fit, not a wall of them.
          </>
        )}
      </AdvisorBubble>

      {/* Beat 5 — close on one concrete action */}
      {result.nextAction && (
        <AdvisorBubble>For now, just one thing: {result.nextAction}</AdvisorBubble>
      )}
    </>
  );
}

/* ---- a single advisor bubble (avatar + text), for the scripted first-session beats ---- */
function AdvisorBubble({ children }: { children: ReactNode }) {
  return (
    <div className={s.msg}>
      <div className={s.av}>
        <RadiantAvatar />
      </div>
      <div className={s.bub}>{children}</div>
    </div>
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
  // Generic next-step prompts — no fabricated company/role names.
  const chips = [
    "What should I focus on today?",
    "Show me roles that fit",
    "Refine my direction",
    "Help with my CV",
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
          aria-label="Message Career Intelligence"
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

/* ---- first-session composer (LIVE; Step E) — phase-aware ----
   arrival/extracting → compose the first message + attach a CV (kicks off the stream).
   analysing/error    → inert (the wait/error own the turn; retry lives in the bubble).
   revealed           → the locked next-step chips + a live input that continue into the
                        real workspace conversation. */
function FirstComposer({
  fs,
  draft,
  onChange,
  onStart,
  onAnswer,
  onContinue,
}: {
  fs: ReturnType<typeof useFirstSession>;
  draft: string;
  onChange: (v: string) => void;
  onStart: () => void;
  onAnswer: () => void;
  onContinue: (seed?: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { phase, cvFileName, result } = fs;
  const revealed = phase === "revealed";
  const composing = phase === "arrival" || phase === "extracting";
  const extracting = phase === "extracting";
  const discovering = phase === "discovery"; // answering a discovery question
  const busy = phase === "thinking" || phase === "analysing"; // advisor's turn — input inert

  // Post-click chips reflect the real lead direction. For a DIRECTED user the lead is
  // roles; for anyone unsure the lead carries their FEELING forward (roles are earned
  // in, not pushed) — the seed picks up live in the workspace conversation.
  const leadTitle = result?.directions[0]?.title;
  const directed = fs.directionClarity === "directed";

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (revealed) {
      const text = draft.trim();
      if (text) onContinue(text);
    } else if (discovering) {
      onAnswer();
    } else if (composing) {
      onStart();
    }
  }

  return (
    <div className={s.composer}>
      {/* Confirm an attached CV before the user sends — otherwise the upload looks
          like nothing happened (the file chip otherwise only shows after sending). */}
      {composing && cvFileName && (
        <div className={s.chips}>
          <span className={s.cvchip}>
            <FileIcon /> {extracting ? `Reading ${cvFileName}…` : `${cvFileName} attached`}
          </span>
        </div>
      )}

      {revealed && directed && (
        <div className={s.chips}>
          <button
            type="button"
            className={`${s.chip} ${s.lead}`}
            onClick={() => onContinue()}
          >
            Show me the first few roles
          </button>
          {leadTitle && (
            <button
              type="button"
              className={s.chip}
              onClick={() => onContinue(`Tell me about ${leadTitle}`)}
            >
              Tell me about {leadTitle}
            </button>
          )}
          <button
            type="button"
            className={s.chip}
            onClick={() => onContinue("Why these three?")}
          >
            Why these three?
          </button>
        </div>
      )}

      {revealed && !directed && (
        <div className={s.chips}>
          {leadTitle && (
            <button
              type="button"
              className={`${s.chip} ${s.lead}`}
              onClick={() => onContinue(`I think ${leadTitle} is the one that feels right`)}
            >
              {leadTitle} feels right
            </button>
          )}
          <button
            type="button"
            className={s.chip}
            onClick={() => onContinue("Honestly, none of these quite fit me")}
          >
            None of these quite fit
          </button>
          <button
            type="button"
            className={s.chip}
            onClick={() => onContinue("Why these three?")}
          >
            Why these three?
          </button>
        </div>
      )}

      <div className={s.cbar}>
        <button
          className={s.cplus}
          type="button"
          aria-label="Attach your CV"
          onClick={() => fileRef.current?.click()}
          disabled={!composing || extracting}
        >
          <PlusIcon />
        </button>
        <input
          aria-label="Tell Career Intelligence where you're at, or attach your CV"
          placeholder={
            extracting
              ? "Reading your CV…"
              : busy
                ? "One moment…"
                : discovering
                  ? "Type your answer…"
                  : revealed
                    ? "Tell me what you're thinking…"
                    : cvFileName
                      ? "Add anything else, or just send…"
                      : "Tell me what you're thinking…"
          }
          value={draft}
          disabled={extracting || busy}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onInputKey}
        />
        <button
          className={s.csend}
          type="button"
          aria-label="Send"
          disabled={extracting || busy}
          onClick={() => {
            if (revealed) {
              const text = draft.trim();
              if (text) onContinue(text);
            } else if (discovering) {
              onAnswer();
            } else {
              onStart();
            }
          }}
        >
          <SendIcon />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) fs.extractCv(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
