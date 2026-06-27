import Link from "next/link";
import React from "react";

function applyInline(text: string): React.ReactNode[] {
  // Handle **bold** and [label](url) markdown links. Links open in a new tab and
  // are scheme-restricted to http(s)/mailto so model output can never inject a
  // javascript: or data: URL.
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const label = link[1];
      const href = link[2];
      if (!/^(https?:|mailto:)/i.test(href)) return label;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          {label}
        </a>
      );
    }
    return part;
  });
}

export function ArloMessage({
  text,
  action,
  actions,
  onSignIn,
}: {
  text: string;
  action?: "sign-in";
  actions?: string[];
  /** When set, the sign-in CTA opens the in-place modal instead of navigating to
      the homepage (which used to dump the user onto the landing page). */
  onSignIn?: () => void;
}) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  function flushList(key: string) {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} style={{ margin: "0 0 8px 16px", padding: 0 }}>
          {listItems}
        </ul>
      );
      listItems = [];
    }
  }

  lines.forEach((line, i) => {
    const isBullet = line.startsWith("- ") || line.startsWith("* ");
    if (isBullet) {
      listItems.push(<li key={i}>{applyInline(line.slice(2))}</li>);
    } else {
      flushList(`ul-${i}`);
      if (line.trim()) {
        elements.push(<p key={i} style={{ margin: "0 0 8px" }}>{applyInline(line)}</p>);
      }
    }
  });

  flushList("ul-final");
  return (
    <>
      {elements}
      {/* Visible echo of real changes Arlo just made — "done" is felt, not buried. */}
      {actions && actions.length > 0 && (
        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {actions.map((a, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--green, #3E9B6B)",
                fontFamily: "var(--f)",
              }}
            >
              <span aria-hidden>✓</span>
              {a}
            </span>
          ))}
        </div>
      )}
      {action === "sign-in" &&
        (onSignIn ? (
          <button
            type="button"
            onClick={onSignIn}
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "7px 16px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--f)",
            }}
          >
            Sign in
          </button>
        ) : (
          <Link
            href="/?signup=required"
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "7px 16px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "var(--f)",
            }}
          >
            Sign in
          </Link>
        ))}
    </>
  );
}
