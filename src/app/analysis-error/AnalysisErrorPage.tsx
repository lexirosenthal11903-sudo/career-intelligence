"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import s from "./analysis-error.module.css";

const arloErrorFace = (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#B87040" />
    {/* eyes */}
    <circle cx="28" cy="38" r="4.5" fill="#2C1A0E" />
    <circle cx="52" cy="38" r="4.5" fill="#2C1A0E" />
    {/* brows — inner corners raised, apologetic */}
    <path d="M23 38 Q28 31 33 33" stroke="#1A0E06" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M47 33 Q52 31 57 38" stroke="#1A0E06" strokeWidth="1.8" strokeLinecap="round" />
    {/* eye highlights */}
    <circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4" />
    <circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4" />
    {/* mouth — subtly downturned */}
    <path d="M32 52 Q40 50 48 52" stroke="#7A3E10" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
  </svg>
);

export default function AnalysisErrorPage() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  function handleRetry() {
    setRetrying(true);
    // Inputs stay in sessionStorage on failure (only removed on success) — retry directly
    const hasInputs = !!sessionStorage.getItem("analysis-inputs");
    setTimeout(() => router.push(hasInputs ? "/loading" : "/input"), 1200);
  }

  return (
    <div className={s.stage}>
      <div className={s.group}>
        <div className={s.face}>{arloErrorFace}</div>
        <div className={s.name}>Arlo</div>

        <p className={s.message}>
          Something went wrong on my end.<br />
          <strong>It&apos;s not your CV — it&apos;s me.</strong><br />
          Want to try again?
        </p>

        <button
          className={s.btnRetry}
          onClick={handleRetry}
          disabled={retrying}
        >
          {retrying ? "Trying…" : "Try again"}
        </button>

        <button className={s.btnBack} onClick={() => router.push("/input")}>
          or go back and edit my CV
        </button>
      </div>
    </div>
  );
}
