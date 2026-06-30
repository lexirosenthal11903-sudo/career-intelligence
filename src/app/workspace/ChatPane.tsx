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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useArloChat } from "@/hooks/useArloChat";
import { useFirstSession } from "@/hooks/useFirstSession";
import { useRecap } from "./useRecap";
import { ArloMessage } from "@/components/ArloMessage";
import AuthModal from "@/components/AuthModal";
import {
  buildThread,
  stashThread,
  readThread,
  clearThread,
  OPENER,
  explorationInvite,
  type ApiMsg,
} from "@/lib/firstSessionThread";
import { extractCvText, saveCvToProfile } from "@/lib/cv";
import s from "./workspace.module.css";
import {
  RadiantAvatar,
  RadiantReveal,
  CheckIcon,
  PlusIcon,
  SendIcon,
  FileIcon,
} from "./icons";

type Variant = "first" | "returning";

export default function ChatPane({ variant }: { variant: Variant }) {
  const first = variant === "first";

  // Who's here — drives the user bubble avatar and gates the live conversation.
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  // Anonymous-auth: every visitor now has a real user id once they engage, so
  // "is there a userId" no longer means "has a real account". `isReal` is true
  // only for a permanent (non-anonymous) account — it gates the live advisor and
  // the sign-up prompt, which an anonymous visitor must still cross.
  const [isReal, setIsReal] = useState(false);
  // No placeholder letter — an avatar initial only appears once we actually know
  // the user's name (the "E" bug: a stray initial shown before/without auth).
  const [userInitial, setUserInitial] = useState("");

  // First-session continuation: once the reveal is done and the user replies, the
  // conversation goes LIVE in this same view (no navigation, no lost transcript).
  // `seedThread` carries the first-session conversation into the live chat.
  const [live, setLive] = useState(false);
  const [seedThread, setSeedThread] = useState<ApiMsg[] | null>(null);
  const [pendingSend, setPendingSend] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  // When WorkspaceShell promotes from first→returning, it destroys the first ChatPane
  // and mounts a new returning one. The first-session seed is bridged via sessionStorage
  // so the returning ChatPane can continue the conversation seamlessly.
  const [firstSessionSeed] = useState<{ messages: ApiMsg[]; pending: string } | undefined>(() => {
    if (typeof sessionStorage === "undefined" || variant !== "returning") return undefined;
    try {
      const raw = sessionStorage.getItem("ci:first-session-seed");
      if (!raw) return undefined;
      sessionStorage.removeItem("ci:first-session-seed");
      return JSON.parse(raw);
    } catch { return undefined; }
  });

  const setUserFrom = (user: { id: string; is_anonymous?: boolean; user_metadata?: { full_name?: string }; email?: string } | null) => {
    if (!user) {
      setUserId(null);
      setIsReal(false);
      return;
    }
    setUserId(user.id);
    setIsReal(!user.is_anonymous);
    const name = user.user_metadata?.full_name ?? user.email ?? "";
    if (name) setUserInitial(name[0]!.toUpperCase());
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserFrom(user));
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

  // The live conversation. For a returning user it loads/initiates as normal. For
  // the first session it stays dormant (userId null) until the user goes `live`
  // after the reveal — then it's SEEDED with the first-session transcript so the
  // conversation continues seamlessly instead of starting over.
  // First-session streaming state machine (Step E). Inert until the user sends
  // their first message; replaces the old loading screen + onboarding bridge.
  const fs = useFirstSession();

  // When we still hold the structured reveal in memory (OTP / authed-in-place
  // continuation), KEEP the reveal card on screen and append the live reply below
  // it. Only the OAuth-return path (state lost on the redirect) falls back to
  // rendering the transcript as bubbles.
  const keepCard = first && live && fs.phase === "revealed";

  // The live advisor (and its API cost) stays gated behind a REAL account. An
  // anonymous visitor has a userId but isReal is false, so the chat hook sees null
  // and prompts sign-up exactly as before — anon auth only persists data underneath.
  const liveUserId = isReal ? userId : null;

  const chat = useArloChat({
    page: "workspace",
    supabase,
    userId: first ? (live ? liveUserId : null) : liveUserId,
    seedThread: first && live ? seedThread ?? undefined : firstSessionSeed?.messages,
    autoSend: first && live ? pendingSend || undefined : firstSessionSeed?.pending,
    hideSeed: keepCard,
  });

  const [draft, setDraft] = useState("");

  // OAuth round-trip return: Google sign-in leaves the page and comes back to
  // ?continue=1. The first-session transcript was stashed before leaving — rehydrate
  // it and continue live, so the conversation survives the trip.
  const continuedRef = useRef(false);
  useEffect(() => {
    if (!first || continuedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("continue") !== "1") return;
    const stash = readThread();
    if (!stash) return;
    continuedRef.current = true;
    // Defer the state sync off the synchronous effect body (the workspace lint rule
    // forbids setState directly in an effect; after an await is the accepted pattern).
    (async () => {
      await Promise.resolve();
      try { sessionStorage.setItem("ci:first-session-seed", JSON.stringify(stash)); } catch { /* ignore */ }
      setSeedThread(stash.messages);
      setPendingSend(stash.pending);
      setLive(true);
      clearThread();
      window.dispatchEvent(new CustomEvent("ci:first-session-live"));
    })();
  }, [first]);

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

  // Build the first-session transcript from what actually happened on screen, so
  // the live conversation continues from it (and a later visit shows it as history).
  function buildFirstThread(): ApiMsg[] {
    const r = fs.result;
    const intake: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: fs.userMessage || "(shared a CV)" },
      ...fs.discovery.map((t) => ({
        role: (t.role === "arlo" ? "assistant" : "user") as "user" | "assistant",
        content: t.text,
      })),
    ];
    return buildThread({
      intake,
      summary: r?.summary ?? "",
      directions: r?.directions ?? [],
      nextAction: r?.nextAction ?? "",
      clarity: fs.directionClarity,
    });
  }

  // The user replies to the reveal/beats. If signed in, the conversation goes live
  // right here. If not, sign-in happens IN PLACE (over the conversation) — the
  // transcript is stashed so it survives even a Google OAuth round-trip.
  function beginContinue(seed?: string) {
    const pending = seed ?? "Show me the first few roles";
    const thread = buildFirstThread();
    // A real (signed-up) account continues live in place. An anonymous visitor —
    // who has a userId but no real account — crosses the sign-up gate first, which
    // now CONVERTS their anon account (keeping the CV + conversation already saved
    // to it) rather than creating an empty new one.
    if (isReal) {
      try { sessionStorage.setItem("ci:first-session-seed", JSON.stringify({ messages: thread, pending })); } catch { /* ignore */ }
      setSeedThread(thread);
      setPendingSend(pending);
      setLive(true);
      window.dispatchEvent(new CustomEvent("ci:first-session-live"));
    } else {
      stashThread(thread, pending);
      setAuthOpen(true);
    }
  }

  // OTP completed in place — no navigation. Pick up the stashed transcript + reply
  // and continue the conversation live, now authenticated.
  async function handleAuthed() {
    const { data: { user } } = await supabase.auth.getUser();
    setUserFrom(user);
    const stash = readThread();
    setAuthOpen(false);
    if (stash) {
      try { sessionStorage.setItem("ci:first-session-seed", JSON.stringify(stash)); } catch { /* ignore */ }
      setSeedThread(stash.messages);
      setPendingSend(stash.pending);
    }
    setLive(true);
    clearThread();
    window.dispatchEvent(new CustomEvent("ci:first-session-live"));
  }

  // "Maybe later" — the conversation can't continue without an account (the live
  // advisor needs auth), so don't pretend: just dismiss the modal and leave them on
  // the reveal with the pills still there. No collapse, no dropped question, no dead
  // end. They can pick any pill again whenever they're ready to sign in.
  function handleMaybeLater() {
    setAuthOpen(false);
    clearThread();
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
            live ? (
              keepCard ? (
                // Continuing in place: the structured reveal STAYS, the live reply
                // appends below it (no reformat). The seed is history-only here.
                <>
                  <FirstSession fs={fs} userInitial={userInitial} />
                  <LiveThread chat={chat} userInitial={userInitial} onSignIn={() => setAuthOpen(true)} />
                </>
              ) : (
                // OAuth-return: structured state was lost on the redirect, so the
                // transcript renders as the conversation. Still continuous, no recap.
                <LiveThread chat={chat} userInitial={userInitial} onSignIn={() => setAuthOpen(true)} />
              )
            ) : (
              <FirstSession fs={fs} userInitial={userInitial} />
            )
          ) : (
            <ReturningSession chat={chat} userInitial={userInitial} onSignIn={() => setAuthOpen(true)} skipRecap={!!firstSessionSeed} />
          )}
        </div>
      </div>

      {first && !live ? (
        <FirstComposer
          fs={fs}
          draft={draft}
          onChange={setDraft}
          onStart={startFirst}
          onAnswer={answerFirst}
          onContinue={beginContinue}
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

      <AuthModal
        isOpen={authOpen}
        initialView="signup"
        // First session continues in place (OTP) or round-trips back to ?continue=1
        // (OAuth). A returning logged-out user just reloads the workspace once authed.
        redirectTo={first ? "/workspace?view=first&continue=1" : "/workspace"}
        onAuthed={first ? handleAuthed : undefined}
        onContinueWithoutSaving={first ? handleMaybeLater : undefined}
        continueLabel={first ? "Maybe later" : undefined}
        onClose={() => {
          setAuthOpen(false);
          clearThread();
        }}
      />
    </section>
  );
}

/* ---- returning: static "Where we got to" recap, then the live conversation ---- */
function ReturningSession({
  chat,
  userInitial,
  onSignIn,
  skipRecap = false,
}: {
  chat: ReturnType<typeof useArloChat>;
  userInitial: string;
  onSignIn?: () => void;
  skipRecap?: boolean;
}) {
  // Real, per-user recap (VOICE-IN-UI §3). While it generates we hold the space with
  // a skeleton so the conversation doesn't jump; if there's no analysis yet, nothing
  // shows — the conversation just starts. No more hardcoded example copy.
  // Skip the recap when continuing directly from the first session — there's no "earlier"
  // to summarise, and the conversation should feel uninterrupted.
  const { recap, loading } = useRecap();
  const showRecap = !skipRecap && (loading || !!recap);

  return (
    <>
      {showRecap && <div className={s.stamp}>Earlier</div>}

      {showRecap && loading && !recap && <RecapSkeleton />}
      {showRecap && recap && <RecapCard recap={recap} />}

      {showRecap && <div className={s.stamp}>Today</div>}

      {/* live conversation — wired to /api/chat (Step C) */}
      <LiveThread chat={chat} userInitial={userInitial} onSignIn={onSignIn} />
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
  onSignIn,
}: {
  chat: ReturnType<typeof useArloChat>;
  userInitial: string;
  onSignIn?: () => void;
}) {
  const { extraMsgs, isLoading, messagesEndRef, lastMsgRef } = chat;
  return (
    <>
      {extraMsgs.map((m, i) => {
        // The last bubble is the anchor: on a new message the view brings ITS start near
        // the top, so a long just-sent message reads from the start (see useArloChat).
        const isLast = i === extraMsgs.length - 1;
        if (m.role === "divider") {
          return (
            <div key={i} className={s.stamp}>
              New session
            </div>
          );
        }
        if (m.role === "user") {
          return (
            <div key={i} ref={isLast ? lastMsgRef : undefined} className={`${s.msg} ${s.me}`}>
              <div className={s.av}>{userInitial}</div>
              <div className={s.bub}>{m.text}</div>
            </div>
          );
        }
        return (
          <div key={i} ref={isLast ? lastMsgRef : undefined} className={s.msg}>
            <div className={s.av}>
              <RadiantAvatar />
            </div>
            <div className={s.bub}>
              <ArloMessage text={m.text} action={m.action} actions={m.actions} onSignIn={onSignIn} />
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
        <div className={s.bub}>{OPENER}</div>
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
      {phase === "revealed" && result && <PostReveal clarity={fs.directionClarity} />}

      {/* error — the advisor owns it. A specific reason (e.g. a daily limit) is
          shown verbatim with NO retry (it can't help); otherwise the generic line
          + a retry. */}
      {phase === "error" && (
        <div className={s.msg}>
          <div className={s.av}>
            <RadiantAvatar />
          </div>
          <div className={s.bub}>
            {fs.errorMsg ? (
              fs.errorMsg
            ) : (
              <>
                Something went wrong on my end. It&rsquo;s not your CV — it&rsquo;s me.{" "}
                <button type="button" className={s.retry} onClick={fs.retry}>
                  Want to try again?
                </button>
              </>
            )}
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
                <li key={i} className={s.dir}>
                  <span className={s.num}>{i + 1}</span>
                  <span className={s.dt}>
                    <b>{d.title}</b>
                    {d.why ? <>: {d.why}</> : null}
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
  clarity,
}: {
  clarity: ReturnType<typeof useFirstSession>["directionClarity"];
}) {
  // ONE message after the reveal — invite exploration, permit not-knowing. The old
  // feelings + roles + close stack over-asked and made people feel they had to decide.
  return <AdvisorBubble>{explorationInvite(clarity)}</AdvisorBubble>;
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

  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // CV re-upload: a logged-in user can replace the CV on their profile straight
  // from the composer. Extract → save to profile; the advisor picks the new CV up
  // as context on the next turn (no faked "you typed this" message).
  const [cvStatus, setCvStatus] = useState<"idle" | "reading" | "saved" | "readError" | "saveError">("idle");

  // Clearing `draft` in state doesn't fire the textarea's onChange, so the inline
  // height set while typing would otherwise stay expanded after send. Reset it here.
  useEffect(() => {
    if (draft === "" && taRef.current) taRef.current.style.height = "auto";
  }, [draft]);

  async function handleCvFile(file: File) {
    setCvStatus("reading");
    const text = await extractCvText(file);
    if (!text) {
      setCvStatus("readError");
      return;
    }
    // Distinguish a parse failure from a save/auth failure — an anonymous visitor
    // can read a CV but not persist it, and "couldn't read that file" would be a lie.
    const ok = await saveCvToProfile({
      fileName: file.name,
      text,
      at: new Date().toISOString(),
    });
    setCvStatus(ok ? "saved" : "saveError");
    if (ok) window.setTimeout(() => setCvStatus("idle"), 4000);
  }

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
      {cvStatus !== "idle" && (
        <div className={s.cvStatus} role="status">
          {cvStatus === "reading" && "Reading your CV…"}
          {cvStatus === "saved" && "CV updated — I'll use it from here."}
          {cvStatus === "readError" && "I couldn't read that file. Try a PDF or DOCX."}
          {cvStatus === "saveError" && "I read it, but couldn't save it. Sign in and try again."}
        </div>
      )}
      <div className={s.cbar}>
        <button
          className={s.cplus}
          type="button"
          aria-label="Replace your CV"
          title="Replace the CV on your profile"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || cvStatus === "reading"}
        >
          <PlusIcon />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCvFile(f);
            e.target.value = "";
          }}
        />
        <textarea
          ref={taRef}
          aria-label="Message Career Intelligence"
          placeholder="Tell me what you're thinking…"
          rows={1}
          value={draft}
          onChange={(e) => {
            onChange(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
          }}
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
  const { phase, cvFileName, result, extracting } = fs;
  const revealed = phase === "revealed";
  const composing = phase === "arrival";
  const discovering = phase === "discovery"; // answering a discovery question
  const busy = phase === "thinking" || phase === "analysing"; // advisor's turn — input inert
  // A CV can be attached while composing the first message OR mid-discovery (e.g. after
  // pasting a link that can't be read) — not only at the very start.
  const canAttach = (composing || discovering) && !extracting;

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
            className={s.chip}
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
              className={s.chip}
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
          disabled={!canAttach}
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
          accept=".pdf,.docx"
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
