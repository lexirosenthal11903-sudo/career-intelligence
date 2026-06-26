import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Career Intelligence" };

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #F7F6F3)", fontFamily: "var(--f, system-ui, sans-serif)" }}>
      <nav style={{ height: 56, display: "flex", alignItems: "center", padding: "0 40px", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
        <Link href="/" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-.02em", color: "var(--ink, #1A1610)", textDecoration: "none" }}>
          Career Intelligence
        </Link>
      </nav>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px 120px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3, #837B6D)", marginBottom: 16 }}>
          Privacy Policy
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-.025em", color: "var(--ink, #1A1610)", lineHeight: 1.2, marginBottom: 24 }}>
          How we handle your data.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--ink-3, #837B6D)" }}>
          This page is being written. We take data privacy seriously — your CV and personal
          information are encrypted, never sold, and deleted after 90 days of inactivity.
          Full policy coming soon.
        </p>
      </main>
    </div>
  );
}
