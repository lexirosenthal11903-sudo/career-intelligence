"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, background: "#1A1610", color: "#F7F6F3",
      borderRadius: 12, padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 20,
      boxShadow: "0 4px 24px rgba(0,0,0,.18)",
      fontSize: 13, lineHeight: 1.5,
      maxWidth: 560, width: "calc(100% - 48px)",
    }}>
      <span style={{ flex: 1, color: "rgba(247,246,243,.75)" }}>
        We use cookies to keep you signed in and remember your preferences.{" "}
        <a href="/privacy" style={{ color: "#F7F6F3", textDecoration: "underline" }}>Privacy policy</a>
      </span>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: "none", border: "1px solid rgba(247,246,243,.2)",
            borderRadius: 7, padding: "6px 14px", color: "rgba(247,246,243,.6)",
            fontSize: 13, cursor: "pointer",
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            background: "#A85E16", border: "none",
            borderRadius: 7, padding: "6px 14px", color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
