"use client";

/* Company logo with graceful fallback (progressive enhancement).
   Tries the real logo resolved by /api/logo; on no-key / no-match / load error it
   shows the existing colour+letter tile — which stays the design's clean default.
   Resolved URLs are cached per company for the session so navigating doesn't reflash. */
import { useEffect, useState } from "react";
import s from "./workspace.module.css";

const urlCache = new Map<string, string | null>();

export default function CompanyLogo({
  company,
  fallbackColor,
  initial,
  className,
}: {
  company: string;
  fallbackColor: string;
  initial: string;
  className: string;
}) {
  const key = company.trim().toLowerCase();
  const [url, setUrl] = useState<string | null>(() => urlCache.get(key) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!company || urlCache.has(key)) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/logo?company=${encodeURIComponent(company)}`);
        const data = res.ok ? await res.json() : { url: null };
        urlCache.set(key, data?.url ?? null);
        if (!cancelled) setUrl(data?.url ?? null);
      } catch {
        urlCache.set(key, null);
      }
    })();
    return () => { cancelled = true; };
  }, [company, key]);

  const showLogo = !!url && !failed;

  return (
    <div className={className} style={{ background: showLogo ? "var(--surface)" : fallbackColor }}>
      {showLogo ? (
        // Raw <img>: external dynamic logo URL with an onError → tile fallback;
        // next/image can't express that fallback and would need per-domain config.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={s.logoImg} onError={() => setFailed(true)} />
      ) : (
        initial
      )}
    </div>
  );
}
