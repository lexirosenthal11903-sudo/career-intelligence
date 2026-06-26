"use client";

import { useState, useEffect } from "react";
import s from "./offline-banner.module.css";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Seed from the browser's live connection status, then subscribe below —
    // external state plus a subscription, the sanctioned use of an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffline(!navigator.onLine);

    function handleOffline() { setOffline(true); }
    function handleOnline()  { setOffline(false); }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online",  handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online",  handleOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className={s.banner} role="alert">
      <div className={s.dot} />
      <span className={s.text}>You&apos;re offline — I&apos;ll reconnect when you&apos;re back.</span>
      <span className={s.reconnecting}>Reconnecting…</span>
    </div>
  );
}
