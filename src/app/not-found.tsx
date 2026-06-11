"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "var(--surface, #FAFAF8)",
        fontFamily: "var(--f, system-ui, sans-serif)",
        textAlign: "center",
        padding: "40px 24px",
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 80 80"
        fill="none"
        style={{ marginBottom: "8px" }}
      >
        <circle cx="40" cy="40" r="40" fill="#B87040" />
        <circle cx="28" cy="38" r="5" fill="#2C1A0E" />
        <circle cx="52" cy="38" r="5" fill="#2C1A0E" />
        <path d="M23 36 Q28 33 33 36" stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M47 36 Q52 33 57 36" stroke="#1A0E06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity={0.4} />
        <circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity={0.4} />
        <path d="M32 51 Q40 46 48 51" stroke="#7A3E10" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.7} />
      </svg>

      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--ink-3, #8B7355)",
          letterSpacing: ".06em",
          textTransform: "uppercase",
        }}
      >
        404
      </div>

      <h1
        style={{
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "-.02em",
          color: "var(--ink, #1A1209)",
          margin: 0,
        }}
      >
        Nothing here.
      </h1>

      <p
        style={{
          fontSize: "14px",
          color: "var(--ink-3, #8B7355)",
          lineHeight: 1.6,
          maxWidth: "340px",
          margin: 0,
        }}
      >
        That page doesn&apos;t exist. Let&apos;s get you back on track.
      </p>

      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "8px",
          background: "var(--accent, #A85E16)",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          padding: "12px 24px",
          fontFamily: "var(--f, system-ui, sans-serif)",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Go home
      </button>
    </div>
  );
}
