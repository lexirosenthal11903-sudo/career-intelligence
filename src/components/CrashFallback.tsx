"use client";

/**
 * Shared crash UI for the App Router error boundaries (error.tsx / global-error.tsx).
 *
 * Before this existed, any uncaught error in a client component rendered a dead
 * page ("this page couldn't load"). This degrades a crash gracefully in Arlo's
 * voice — own it, never blame the user — and gives a way back.
 *
 * Voice matches /analysis-error and the chat error line: "Something went wrong
 * on my end." Self-contained inline styles so it renders even if app CSS or a
 * stylesheet chunk failed to load.
 */

const arloErrorFace = (
  <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 8 }}>
    <circle cx="40" cy="40" r="40" fill="#B87040" />
    <circle cx="28" cy="38" r="4.5" fill="#2C1A0E" />
    <circle cx="52" cy="38" r="4.5" fill="#2C1A0E" />
    <path d="M23 38 Q28 31 33 33" stroke="#1A0E06" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M47 33 Q52 31 57 38" stroke="#1A0E06" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity={0.4} />
    <circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity={0.4} />
    <path d="M32 52 Q40 50 48 52" stroke="#7A3E10" strokeWidth="1.5" strokeLinecap="round" opacity={0.7} />
  </svg>
);

interface CrashFallbackProps {
  /** Calls the boundary's reset() to re-render the failed segment. */
  onReset: () => void;
  /** Secondary action — navigate somewhere safe. */
  onSecondary: () => void;
  secondaryLabel: string;
}

export default function CrashFallback({ onReset, onSecondary, secondaryLabel }: CrashFallbackProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--surface, #FAFAF8)",
        fontFamily: "var(--f, system-ui, sans-serif)",
        textAlign: "center",
        padding: "40px 24px",
      }}
    >
      {arloErrorFace}
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2, #3D2E1A)" }}>Career Intelligence</div>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-.02em",
          color: "var(--ink, #1A1209)",
          margin: 0,
        }}
      >
        Something went wrong on my end.
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-3, #8B7355)",
          lineHeight: 1.6,
          maxWidth: 340,
          margin: 0,
        }}
      >
        It&apos;s not you — it&apos;s me. Your work is safe. Let&apos;s try that again.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={onReset}
          style={{
            background: "var(--accent, #A85E16)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 24px",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <button
          onClick={onSecondary}
          style={{
            background: "none",
            color: "var(--ink-3, #8B7355)",
            border: "1px solid var(--line, rgba(0,0,0,.12))",
            borderRadius: 10,
            padding: "12px 24px",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}
