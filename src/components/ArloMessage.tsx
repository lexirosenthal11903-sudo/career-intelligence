import React from "react";

function applyInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part || null;
  });
}

export function ArloMessage({ text }: { text: string }) {
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
  return <>{elements}</>;
}
