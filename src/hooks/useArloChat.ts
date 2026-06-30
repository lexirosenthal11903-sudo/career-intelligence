"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ChatMsg = {
  role: "arlo" | "user" | "divider";
  text: string;
  action?: "sign-in";
  actions?: string[]; // visible echo of real changes Arlo just made this turn
};
type ApiMsg = { role: "user" | "assistant"; content: string };

const SIGN_IN_PROMPT =
  "There's a lot here I'd like to get into properly with you. Sign in and we can keep going from right where we are.";

const ERROR_MSG =
  "Something went wrong on my end — say that again?";

// A "meaningful return" = a new calendar day, or a gap of at least ~6 hours since
// the last activity. The advisor speaks first only on these — not on same-session
// navigation (which would be overbearing). `updated_at` tracks the last write, so
// firing the opener (which writes) also stops it re-firing within the same return.
function isMeaningfulReturn(updatedAt?: string | null): boolean {
  if (!updatedAt) return false;
  const lastMs = new Date(updatedAt).getTime();
  if (Number.isNaN(lastMs)) return false;
  if ((Date.now() - lastMs) / 3.6e6 >= 6) return true;
  return new Date(updatedAt).toDateString() !== new Date().toDateString();
}

export function useArloChat({
  page,
  supabase,
  userId,
  seedThread,
  autoSend,
  hideSeed,
}: {
  page: string;
  supabase: SupabaseClient | null;
  userId: string | null;
  // The first-session transcript to continue from. When set, it IS the
  // conversation (rendered as the thread, persisted, no recap/divider) — the DB
  // load + the advisor's cold opener are skipped. This is the handoff that stops
  // the first-session conversation from vanishing at sign-in.
  seedThread?: ApiMsg[];
  // A pending user message to send the instant the seeded conversation takes over
  // (the reply the user gave to the first-session beats).
  autoSend?: string;
  // When true, the seed transcript is used as conversation HISTORY only — not
  // re-rendered as bubbles. The first session keeps its structured reveal card on
  // screen and the live reply appends below it, so nothing reformats. (Lexi, 2026-06-24.)
  hideSeed?: boolean;
}) {
  const [allMsgs, setAllMsgs] = useState<ChatMsg[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiHistoryRef = useRef<ApiMsg[]>([]);
  const loadedRef = useRef(false);
  // Set once the user sends a message. Used to suppress a proactive opener that's
  // still in flight when the user has already started the conversation themselves —
  // silence beats talking over them.
  const userEngagedRef = useRef(false);
  // Attach to a <div> at the end of the messages list; auto-scrolls on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Arlo initiates: open the conversation with something specific instead of
  // waiting to be asked. One API call. Two modes:
  //  - cold open (no `resume`): brand-new conversation, no history.
  //  - resume: pass the recent transcript so the advisor picks up an unresolved
  //    thread on a meaningful return rather than cold-opening blind.
  const initiate = useCallback(async (resume?: ApiMsg[]) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const body =
        resume && resume.length
          ? { initiate: true, resume: true, messages: resume }
          : { initiate: true };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const data = await res.json();
      const text =
        (data.content as Array<{ type: string; text?: string }>)
          ?.filter((b) => b.type === "text")
          .map((b) => b.text ?? "")
          .join("") || "";
      if (!text) return;
      // If the user started talking while this was in flight, don't talk over them.
      if (userEngagedRef.current) return;
      setAllMsgs((prev) => [...prev, { role: "arlo", text }]);
      // Persist the opener (appended to any history) so it isn't regenerated next load.
      const opener: ApiMsg = { role: "assistant", content: text };
      apiHistoryRef.current = [...apiHistoryRef.current, opener];
      if (supabase) {
        supabase
          .from("conversations")
          .upsert(
            { user_id: userId, page, messages: apiHistoryRef.current, updated_at: new Date().toISOString() },
            { onConflict: "user_id,page" }
          )
          .then(() => {});
      }
    } catch {
      // initiating is best-effort — silence beats a visible error on page open
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId, page]);

  // Load persisted conversation from Supabase on mount
  useEffect(() => {
    // A seeded conversation (first-session handoff) takes precedence — never
    // overwrite it with a DB load or the cold opener.
    if (seedThread) return;
    if (!supabase || !userId || loadedRef.current) return;
    loadedRef.current = true;

    supabase
      .from("conversations")
      .select("messages, updated_at")
      .eq("user_id", userId)
      .eq("page", page)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          const stored = data.messages as ApiMsg[];
          apiHistoryRef.current = stored;
          // Convert API format → display format, then mark session boundary
          setAllMsgs([
            ...stored.map((m) => ({
              role: (m.role === "assistant" ? "arlo" : "user") as ChatMsg["role"],
              text: m.content,
            })),
            { role: "divider" as const, text: "New session" },
          ]);
          // On a meaningful return (new day / real gap), the advisor speaks first,
          // picking up an unresolved thread from the transcript it now holds. Stays
          // quiet on same-session navigation, and never talks over a user who's
          // already started (guarded inside initiate via userEngagedRef).
          if (isMeaningfulReturn(data.updated_at as string | null) && !userEngagedRef.current) {
            initiate(stored);
          }
        } else {
          // No history on this page yet — Arlo opens the conversation.
          initiate();
        }
      });
  }, [supabase, userId, page, initiate, seedThread]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // The user is driving now — suppress any proactive opener still in flight.
      userEngagedRef.current = true;

      // Add user message to display immediately
      setAllMsgs((prev) => [...prev, { role: "user", text: trimmed }]);

      // Unauthenticated — warm sign-in prompt, no API call
      if (!userId) {
        setAllMsgs((prev) => [...prev, { role: "arlo", text: SIGN_IN_PROMPT, action: "sign-in" as const }]);
        return;
      }

      const newUserMsg: ApiMsg = { role: "user", content: trimmed };
      const history = [...apiHistoryRef.current, newUserMsg];
      apiHistoryRef.current = history;

      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok) {
          setAllMsgs((prev) => [...prev, { role: "arlo", text: ERROR_MSG }]);
          apiHistoryRef.current = apiHistoryRef.current.slice(0, -1);
          return;
        }

        const data = await res.json();
        const arloText =
          (data.content as Array<{ type: string; text?: string }>)
            ?.filter((b) => b.type === "text")
            .map((b) => b.text ?? "")
            .join("") || ERROR_MSG;
        const actions = Array.isArray(data.meridianActions) ? (data.meridianActions as string[]) : undefined;

        // Some advisor changes alter the canonical analysis (directions/roles). Bust
        // the stale jobs cache and tell the workspace surfaces to re-read, so the
        // Direction tab, Roles list and nav count update live — the advisor only ever
        // says "done" because it really is.
        const signals = Array.isArray(data.meridianSignals) ? (data.meridianSignals as string[]) : [];
        if (signals.includes("analysis-changed") && typeof window !== "undefined") {
          try { sessionStorage.removeItem("cached-jobs"); } catch { /* ignore */ }
          window.dispatchEvent(new CustomEvent("ci:analysis-changed"));
        }
        if (signals.includes("cv-tailored") && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ci:open-documents"));
        }
        // A saved role moved stage (or a new one was saved) — tell the Applications
        // surface to re-read so its pills/list update live. Quiet by design: this
        // refreshes data, it never moves the user (research §3).
        if (signals.includes("application-changed") && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ci:application-changed"));
        }
        // The advisor changed a profile fact (preferred name, salary, a direction
        // reaction). Tell the nav, Profile and Direction surfaces to re-read so they
        // can't show stale info while the advisor says it's updated.
        if (signals.includes("profile-changed") && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ci:profile-changed"));
        }
        // The user explicitly asked to be taken to a surface — open it. Only ever
        // fires because the advisor chose the open_surface tool in response to a
        // direct request; never a side-effect of another change.
        if (signals.includes("open-surface") && typeof window !== "undefined") {
          const payload = (data.meridianData as Record<string, { surface?: string }> | undefined)?.["open-surface"];
          const surface = payload?.surface;
          if (surface) window.dispatchEvent(new CustomEvent("ci:open-surface", { detail: surface }));
        }

        setAllMsgs((prev) => [...prev, { role: "arlo", text: arloText, actions }]);

        const newArloMsg: ApiMsg = { role: "assistant", content: arloText };
        const updatedHistory = [...apiHistoryRef.current, newArloMsg];
        apiHistoryRef.current = updatedHistory;

        // Persist to Supabase (fire and forget)
        if (supabase) {
          supabase
            .from("conversations")
            .upsert(
              {
                user_id: userId,
                page,
                messages: updatedHistory,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id,page" }
            )
            .then(() => {});
        }
      } catch {
        setAllMsgs((prev) => [...prev, { role: "arlo", text: ERROR_MSG }]);
        apiHistoryRef.current = apiHistoryRef.current.slice(0, -1);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, supabase, userId, page]
  );

  // Seed the conversation from the first session (the handoff). Renders the
  // transcript as the live thread, persists it (so a later visit shows it as
  // history), and fires the user's pending reply so the advisor responds in place.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!seedThread || seededRef.current) return;
    seededRef.current = true;
    loadedRef.current = true;
    apiHistoryRef.current = seedThread;

    const display = seedThread.map((m) => ({
      role: (m.role === "assistant" ? "arlo" : "user") as ChatMsg["role"],
      text: m.content,
    }));

    // Defer off the synchronous effect body (workspace lint rule: no setState
    // directly in an effect — after an await is the accepted pattern).
    (async () => {
      await Promise.resolve();
      // hideSeed: keep the seed as history only (the structured reveal stays on
      // screen); otherwise render it as the conversation (OAuth-return path).
      if (!hideSeed) setAllMsgs(display);
      // Persistence + a live reply both need an authed user. Unauthed ("continue
      // without saving") still SEES the conversation; sending prompts a sign-in.
      if (userId && supabase) {
        supabase
          .from("conversations")
          .upsert(
            { user_id: userId, page, messages: seedThread, updated_at: new Date().toISOString() },
            { onConflict: "user_id,page" }
          )
          .then(() => {});
      }
      if (autoSend && userId) sendMessage(autoSend);
    })();
  }, [seedThread, autoSend, userId, supabase, page, sendMessage, hideSeed]);

  // Auto-scroll when messages change or loading state changes. Honour
  // prefers-reduced-motion — JS smooth scroll isn't covered by the CSS rule.
  // Two rAFs so a tall new message (markdown reply) has finished laying out before
  // we scroll — without them the scroll lands short of the newest message.
  //
  // We drive the SCROLL CONTAINER to its full scrollHeight rather than
  // scrollIntoView on the end anchor: the stream has a large bottom padding to clear
  // the fixed composer, and the anchor sits ABOVE that padding, so block:"end" parked
  // the newest message behind the composer (it read as "no scroll, I had to scroll
  // myself"). Going to scrollHeight scrolls past the padding so the latest message
  // lands fully visible above the composer. Anchor scroll is the fallback.
  useEffect(() => {
    const behavior: ScrollBehavior =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const anchor = messagesEndRef.current;
        if (!anchor) return;
        let el: HTMLElement | null = anchor.parentElement;
        while (el) {
          const oy = getComputedStyle(el).overflowY;
          if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) break;
          el = el.parentElement;
        }
        if (el) el.scrollTo({ top: el.scrollHeight, behavior });
        else anchor.scrollIntoView({ behavior, block: "end" });
      })
    );
    return () => cancelAnimationFrame(id);
  }, [allMsgs, isLoading]);

  // Split at divider: messages before it are "previous session", after are current
  const dividerIndex = allMsgs.findIndex((m) => m.role === "divider");
  const hasPrevious = dividerIndex > 0;
  const extraMsgs = !showPrevious && hasPrevious ? allMsgs.slice(dividerIndex) : allMsgs;

  const togglePrevious = useCallback(() => setShowPrevious((v) => !v), []);

  return { extraMsgs, sendMessage, isLoading, messagesEndRef, hasPrevious, showPrevious, togglePrevious };
}
