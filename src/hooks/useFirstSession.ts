"use client";

/**
 * First-session state machine — the "click" (Track 2, Step E).
 *
 * The first session is NOT an /api/chat conversation. It is a one-shot
 * /api/analyse SSE stream that produces a *structured* direction reveal. This
 * hook owns that streaming lifecycle, mirroring the old LoadingScreen consumer
 * (which it replaces — the wait now happens inline in the conversation, not on a
 * separate screen).
 *
 * Phases:
 *   arrival     → opener shown, composer live; nothing sent yet.
 *   extracting  → a CV file is being read by /api/extract.
 *   analysing   → /api/analyse is streaming; the wait bubble shows.
 *   revealed    → complete event received; the reveal card + bridge show.
 *   error       → stream failed / closed without complete; advisor owns it, retry offered.
 *
 * On complete: the result is cached to sessionStorage (so /workspace reads it)
 * and saved to the `results` table fire-and-forget (401 for unauth is fine —
 * the cache covers the pre-auth path, exactly as the old loading screen did).
 */

import { useCallback, useRef, useState } from "react";
import { cacheAnalysisResult } from "@/lib/analysisResult";
import { stashCv, flushPendingCv } from "@/lib/cv";

export type FirstPhase =
  | "arrival"
  | "extracting"
  | "discovery" // the advisor is asking discovery questions (asks before it tells)
  | "thinking" // waiting on the next intake question
  | "analysing"
  | "revealed"
  | "error";

export interface DiscoveryTurn {
  role: "arlo" | "user";
  text: string;
}

export interface RevealDirection {
  title: string;
  why: string;
}
export interface RevealResult {
  summary: string;
  directions: RevealDirection[];
}

// The slow-pipeline threshold — past this the wait line swaps to the locked
// fallback ("Still working — this one's taking a bit longer than usual").
const SLOW_MS = 30_000;

interface AnalyseResultShape {
  profile?: {
    summary?: string;
    suggestedDirections?: unknown;
  };
}

function toDirections(value: unknown): RevealDirection[] {
  // Defensive: the pipeline has historically persisted this as a string (S41).
  let arr: unknown = value;
  if (typeof arr === "string") {
    try {
      arr = JSON.parse(arr);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((d): d is RevealDirection => !!d && typeof (d as RevealDirection).title === "string")
    .map((d) => ({ title: d.title, why: d.why ?? "" }));
}

export function useFirstSession() {
  const [phase, setPhase] = useState<FirstPhase>("arrival");
  const [userMessage, setUserMessage] = useState("");
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [result, setResult] = useState<RevealResult | null>(null);
  const [slow, setSlow] = useState(false);
  // The discovery conversation shown in the UI (advisor questions + user answers).
  const [discovery, setDiscovery] = useState<DiscoveryTurn[]>([]);

  const cvTextRef = useRef("");
  const cvFileNameRef = useRef<string>("");
  const userMessageRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Full intake transcript sent to /api/intake (and later to /api/analyse as context).
  const intakeRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const questionsAskedRef = useRef(0);

  // Read a dropped/selected CV. Best-effort: a failed extract still lets the
  // user type their background, so we keep the filename chip and move on.
  const extractCv = useCallback(async (file: File) => {
    setPhase("extracting");
    setCvFileName(file.name);
    cvFileNameRef.current = file.name;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.text) cvTextRef.current = data.text;
    } catch {
      // extraction failed — user can still describe their background
    } finally {
      setPhase("arrival");
    }
  }, []);

  const runStream = useCallback(async (message: string) => {
    const controller = new AbortController();
    abortRef.current = controller;

    setSlow(false);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setSlow(true), SLOW_MS);

    // Everything the user told us in discovery becomes context for the analysis,
    // so the read reflects what they actually said — not an assumption.
    const discoveryContext = intakeRef.current
      .slice(1) // first turn is the opening share, already passed as `direction`
      .map((m) => (m.role === "assistant" ? `You asked: ${m.content}` : `They answered: ${m.content}`))
      .join("\n");

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: cvTextRef.current,
          direction: message,
          extra: discoveryContext || undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setPhase("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedComplete = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Stream closed without a complete event — Vercel timeout or drop.
          if (!receivedComplete) setPhase("error");
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          if (!chunk.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(chunk.slice(6)) as {
              event: string;
              result?: AnalyseResultShape;
              message?: string;
            };

            if (event.event === "complete" && event.result) {
              receivedComplete = true;
              // Cache for /workspace + persist (fire-and-forget; unauth → 401, fine).
              cacheAnalysisResult(event.result);
              fetch("/api/save-result", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: event.result }),
              }).catch(() => undefined);

              // The uploaded CV's home is the Profile. Stash it, then try to persist
              // now — if the user hasn't signed up yet it stays stashed and is flushed
              // when they land authed on the workspace (mirrors save-result).
              if (cvTextRef.current) {
                stashCv(cvFileNameRef.current || "Your CV", cvTextRef.current);
                flushPendingCv();
              }

              setResult({
                summary: event.result.profile?.summary ?? "",
                directions: toDirections(event.result.profile?.suggestedDirections),
              });
              setPhase("revealed");
            } else if (event.event === "error") {
              setPhase("error");
            }
          } catch {
            // malformed SSE chunk — skip
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") setPhase("error");
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setSlow(false);
    }
  }, []);

  // Move from discovery into the real analysis (the user's opening share = direction).
  const beginAnalysis = useCallback(() => {
    setPhase("analysing");
    runStream(userMessageRef.current);
  }, [runStream]);

  // One round-trip with the intake advisor: ask the next question, or — when it has
  // enough — fall through to analysis. Fails open (any error → just analyse).
  const runIntake = useCallback(async () => {
    setPhase("thinking");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: cvTextRef.current,
          messages: intakeRef.current,
          questionsAsked: questionsAskedRef.current,
        }),
      });
      const data = res.ok ? await res.json() : { ready: true };
      if (data.ready || !data.question) {
        beginAnalysis();
        return;
      }
      const q: string = data.acknowledgement ? `${data.acknowledgement} ${data.question}` : data.question;
      intakeRef.current = [...intakeRef.current, { role: "assistant", content: q }];
      questionsAskedRef.current += 1;
      setDiscovery((prev) => [...prev, { role: "arlo", text: q }]);
      setPhase("discovery");
    } catch {
      beginAnalysis();
    }
  }, [beginAnalysis]);

  // Kick off the first session from the user's opening share (+ any attached CV).
  // We no longer jump straight to analysis — the advisor asks first.
  const start = useCallback(
    (message: string) => {
      const text = message.trim();
      // Allow a CV-only start ("or drop your CV in") — need text OR extracted CV.
      if (!text && !cvTextRef.current) return;
      setUserMessage(text);
      userMessageRef.current = text;
      intakeRef.current = [{ role: "user", content: text || "(shared a CV)" }];
      questionsAskedRef.current = 0;
      runIntake();
    },
    [runIntake]
  );

  // The user answers a discovery question → record it and get the next turn.
  const answer = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      intakeRef.current = [...intakeRef.current, { role: "user", content: trimmed }];
      setDiscovery((prev) => [...prev, { role: "user", text: trimmed }]);
      runIntake();
    },
    [runIntake]
  );

  const retry = useCallback(() => {
    setPhase("analysing");
    runStream(userMessageRef.current);
  }, [runStream]);

  return {
    phase,
    userMessage,
    cvFileName,
    result,
    slow,
    discovery,
    hasCv: () => cvTextRef.current.length > 0,
    extractCv,
    start,
    answer,
    retry,
  };
}
