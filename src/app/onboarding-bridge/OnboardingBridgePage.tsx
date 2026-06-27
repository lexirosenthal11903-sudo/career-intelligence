"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import s from "./onboarding-bridge.module.css";
import AuthModal from "@/components/AuthModal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadAnalysisResult } from "@/lib/analysisResult";
import { ArloMessage } from "@/components/ArloMessage";

const arloFace = (
  <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="40" fill="#B87040" />
    <circle cx="28" cy="38" r="5" fill="#2C1A0E" />
    <circle cx="52" cy="38" r="5" fill="#2C1A0E" />
    <path d="M23 36 Q28 31 33 36" stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M47 36 Q52 31 57 36" stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity={0.4} />
    <circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity={0.4} />
    <path d="M30 50 Q40 55 50 50" stroke="#7A3E10" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.7} />
  </svg>
);

const sendIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

type ChatMsg = { role: "arlo" | "user"; text: string };

interface AnalysisProfile {
  summary?: string;
  suggestedDirections?: Array<{ title: string; why: string }>;
  topRoleTitles?: string[];
}

interface AnalysisResult {
  profile?: AnalysisProfile;
}

const FALLBACK_DIRECTION = "You think in systems, but you're drawn to people problems.";
const FALLBACK_DETAIL = "Your background shows strong analytical instincts, but the problems you find most satisfying involve how organisations function and how people move through them. That points toward strategy, operations, and the space where the two meet.";
const FALLBACK_ROLES = "Strategy Analyst · Operations Associate · Business Analyst · Management Consultant · Chief of Staff";

export default function OnboardingBridgePage() {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "arlo", text: "What doesn't feel right to you?" },
  ]);
  const [replied, setReplied] = useState(false);
  const [sending, setSending] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [resultMounted, setResultMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Server-first via the shared helper; for an unauthenticated user mid-onboarding
    // the server returns nothing and this falls back to the sessionStorage bridge.
    loadAnalysisResult<AnalysisResult>()
      .then((result) => { if (result) setAnalysisResult(result); })
      .finally(() => setResultMounted(true));
  }, []);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [chatOpen]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setMsgs((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setReplied(true);
    // Phase 3b: send to real re-analysis with this feedback
    setTimeout(() => {
      setMsgs((prev) => [
        ...prev,
        {
          role: "arlo",
          text: "Got it — that's useful. I'll factor that in as we go. Head to your dashboard for now, and I'll have a sharper direction ready the more you engage with what's there.",
        },
      ]);
      setSending(false);
    }, 800);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleGoToDashboard() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push("/dashboard");
    } else {
      setAuthOpen(true);
    }
  }

  const profile = analysisResult?.profile;
  // Guard against older analyses that stored these as strings, not arrays.
  const directionsArr = Array.isArray(profile?.suggestedDirections) ? profile.suggestedDirections : [];
  const primaryDirection = directionsArr[0];
  const directionStatement = primaryDirection?.title ?? FALLBACK_DIRECTION;
  const directionDetail = profile?.summary ?? FALLBACK_DETAIL;
  const rolesDisplay = Array.isArray(profile?.topRoleTitles) ? profile.topRoleTitles.join(' · ') : FALLBACK_ROLES;
  const totalDirections = directionsArr.length;

  return (
    <div className={s.page}>

      {/* Arlo header */}
      <div className={s.arloRow}>
        <div className={s.arloFace}>{arloFace}</div>
        <div className={s.arloName}>Career Intelligence</div>
      </div>

      {/* Direction card — always visible */}
      <div className={s.card}>
        <div className={s.cardLabel}>Your direction</div>
        {!resultMounted ? (
          <>
            <div style={{ height: "1.6rem", width: "70%", borderRadius: 6, background: "var(--cream-2)", marginBottom: "0.75rem" }} />
            <div style={{ height: "0.85rem", width: "90%", borderRadius: 6, background: "var(--cream-2)", marginBottom: "0.4rem" }} />
            <div style={{ height: "0.85rem", width: "60%", borderRadius: 6, background: "var(--cream-2)" }} />
          </>
        ) : (
          <>
            <div className={s.directionStatement}>{directionStatement}</div>
            <p className={s.directionDetail}>{directionDetail}</p>
            <div className={s.cardRule} />
            <div className={s.rolesLabel}>Roles worth exploring</div>
            <div className={s.rolesNames}>{rolesDisplay}</div>
          </>
        )}
      </div>

      {/* Default state */}
      {!chatOpen && (
        <>
          <p className={s.arloNote}>
            {totalDirections > 1
              ? `I've matched you with ${totalDirections} directions — this is the strongest fit. You'll see all of them on your dashboard, and the more you explore, the sharper this gets.`
              : "These are the roles worth exploring properly. Go through them at your own pace — I'll be with you in the dashboard, and the more you tell me about what resonates, the sharper this gets."
            }
          </p>
          <div className={s.ctaRow}>
            <button className={s.btnPrimary} onClick={handleGoToDashboard}>
              Go to my dashboard →
            </button>
            <button className={s.btnGhost} onClick={() => setChatOpen(true)}>
              Something doesn&apos;t feel right — adjust my direction
            </button>
          </div>
        </>
      )}

      {/* Feedback chat — direction card stays visible above */}
      {chatOpen && (
        <div className={s.chatWrap}>
          <div className={s.chatMsgs}>
            {msgs.map((m, i) => (
              m.role === "arlo" ? (
                <div key={i} className={s.aiMsg}>
                  <div className={s.aiBubble}><ArloMessage text={m.text} /></div>
                </div>
              ) : (
                <div key={i} className={s.userMsg}>
                  <div className={s.userBubble}>{m.text}</div>
                </div>
              )
            ))}
            <div ref={msgsEndRef} />
          </div>

          <div className={s.chatInputCard}>
            <input
              ref={inputRef}
              className={s.chatInput}
              type="text"
              placeholder="Tell me what's off…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className={s.chatSend} onClick={handleSend} aria-label="Send" disabled={sending}>
              {sendIcon}
            </button>
          </div>

          {replied && (
            <button
              className={s.btnPrimaryChat}
              onClick={handleGoToDashboard}
            >
              Go to my dashboard →
            </button>
          )}

          <button className={s.btnGhostChat} onClick={() => setChatOpen(false)}>
            ← Back
          </button>
        </div>
      )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialView="signup"
        redirectTo="/dashboard"
        onContinueWithoutSaving={() => {
          setAuthOpen(false);
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
