"use client";

import { useRouter } from "next/navigation";
import s from "./onboarding-bridge.module.css";

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

export default function OnboardingBridgePage() {
  const router = useRouter();

  return (
    <div className={s.page}>

      {/* Arlo header */}
      <div className={s.arloRow}>
        <div className={s.arloFace}>{arloFace}</div>
        <div className={s.arloName}>Arlo</div>
      </div>

      {/* Direction card */}
      <div className={s.card}>
        <div className={s.cardLabel}>Your direction</div>
        <div className={s.directionStatement}>
          You think in systems, but you&apos;re drawn to people problems.
        </div>
        <p className={s.directionDetail}>
          Your background shows strong analytical instincts — but the way you talk about your
          work makes it clear the problems you find most satisfying involve how organisations
          function and how people move through them. That points toward strategy, operations,
          and the space where the two meet.
        </p>
        <div className={s.cardRule} />
        <div className={s.rolesLabel}>Roles worth exploring</div>
        <div className={s.rolesNames}>
          Strategy Analyst &nbsp;·&nbsp; Operations Associate &nbsp;·&nbsp; Business Analyst
          &nbsp;·&nbsp; Management Consultant &nbsp;·&nbsp; Chief of Staff
        </div>
      </div>

      {/* Arlo note */}
      <p className={s.arloNote}>
        These are the roles worth exploring properly. Go through them at your own pace — I&apos;ll
        be with you in the dashboard, and the more you tell me about what resonates, the sharper
        this gets.
      </p>

      {/* CTAs */}
      <div className={s.ctaRow}>
        <button className={s.btnPrimary} onClick={() => router.push("/dashboard")}>
          Go to my dashboard →
        </button>
        <button className={s.btnGhost} onClick={() => router.push("/input")}>
          Something doesn&apos;t feel right — adjust my direction
        </button>
      </div>

    </div>
  );
}
