"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ChatMsg = { role: "arlo" | "user" | "divider"; text: string; action?: "sign-in" };
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
  const [extraMsgs, setExtraMsgs] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiHistoryRef = useRef<ApiMsg[]>([]);
  const loadedRef = useRef(false);
  // Attach to a <div> at the end of the messages list; auto-scrolls on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          setExtraMsgs([
            ...stored.map((m) => ({
              role: (m.role === "assistant" ? "arlo" : "user") as ChatMsg["role"],
              text: m.content,
            })),
            { role: "divider" as const, text: "New session" },
          ]);
        }
      });
  }, [supabase, userId, page]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // Add user message to display immediately
      setExtraMsgs((prev) => [...prev, { role: "user", text: trimmed }]);

      // Unauthenticated — warm sign-in prompt, no API call
      if (!userId) {
        setExtraMsgs((prev) => [...prev, { role: "arlo", text: SIGN_IN_PROMPT, action: "sign-in" as const }]);
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
          setExtraMsgs((prev) => [...prev, { role: "arlo", text: ERROR_MSG }]);
          apiHistoryRef.current = apiHistoryRef.current.slice(0, -1);
          return;
        }

        const data = await res.json();
        const arloText =
          (data.content as Array<{ type: string; text?: string }>)
            ?.filter((b) => b.type === "text")
            .map((b) => b.text ?? "")
            .join("") || ERROR_MSG;

        setExtraMsgs((prev) => [...prev, { role: "arlo", text: arloText }]);

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
        setExtraMsgs((prev) => [...prev, { role: "arlo", text: ERROR_MSG }]);
        apiHistoryRef.current = apiHistoryRef.current.slice(0, -1);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, supabase, userId, page]
  );

  // Auto-scroll when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [extraMsgs, isLoading]);

  return { extraMsgs, sendMessage, isLoading, messagesEndRef };
}
