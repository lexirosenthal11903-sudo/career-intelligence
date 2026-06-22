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
  "I'd love to respond properly — but I'll need you to sign in first to keep our conversation going. It takes about 30 seconds.";

const ERROR_MSG =
  "Something went wrong on my end — say that again?";

export function useArloChat({
  page,
  supabase,
  userId,
}: {
  page: string;
  supabase: SupabaseClient | null;
  userId: string | null;
}) {
  const [allMsgs, setAllMsgs] = useState<ChatMsg[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiHistoryRef = useRef<ApiMsg[]>([]);
  const loadedRef = useRef(false);
  // Attach to a <div> at the end of the messages list; auto-scrolls on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Arlo initiates: open the conversation with something specific instead of
  // waiting to be asked. One API call, only when there's no prior conversation.
  const initiate = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initiate: true }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const text =
        (data.content as Array<{ type: string; text?: string }>)
          ?.filter((b) => b.type === "text")
          .map((b) => b.text ?? "")
          .join("") || "";
      if (!text) return;
      setAllMsgs((prev) => [...prev, { role: "arlo", text }]);
      // Persist the opener so it isn't regenerated on the next load.
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
    if (!supabase || !userId || loadedRef.current) return;
    loadedRef.current = true;

    supabase
      .from("conversations")
      .select("messages")
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
        } else {
          // No history on this page yet — Arlo opens the conversation.
          initiate();
        }
      });
  }, [supabase, userId, page, initiate]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

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

  // Auto-scroll when messages change or loading state changes. Honour
  // prefers-reduced-motion — JS smooth scroll isn't covered by the CSS rule.
  useEffect(() => {
    const behavior: ScrollBehavior =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
    messagesEndRef.current?.scrollIntoView({ behavior, block: "nearest" });
  }, [allMsgs, isLoading]);

  // Split at divider: messages before it are "previous session", after are current
  const dividerIndex = allMsgs.findIndex((m) => m.role === "divider");
  const hasPrevious = dividerIndex > 0;
  const extraMsgs = !showPrevious && hasPrevious ? allMsgs.slice(dividerIndex) : allMsgs;

  const togglePrevious = useCallback(() => setShowPrevious((v) => !v), []);

  return { extraMsgs, sendMessage, isLoading, messagesEndRef, hasPrevious, showPrevious, togglePrevious };
}
