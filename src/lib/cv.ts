"use client";

/* The uploaded CV's home is the Profile (source identity), decided 2026-06-22.
   The CV is extracted during the first session, often BEFORE the user has signed
   up, so persisting it has the same shape as the analysis result: try to save now,
   and if the user isn't authed yet, stash it and flush once they land authed on the
   workspace. Tailored CVs / cover letters will live in Documents, separately. */

const CV_KEY = "pending-cv";

export interface PendingCv {
  fileName: string;
  text: string;
  at: string;
}

/** Parse a CV file to plain text via /api/extract. Returns the text, or null on
    failure (so callers can fall back to "describe your background instead"). */
export async function extractCvText(file: File): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/extract", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.text === "string" && data.text ? data.text : null;
  } catch {
    return null;
  }
}

/** Hold the just-extracted CV so a later authed surface can persist it. */
export function stashCv(fileName: string, text: string): void {
  if (!text) return;
  try {
    sessionStorage.setItem(CV_KEY, JSON.stringify({ fileName, text, at: new Date().toISOString() }));
  } catch {
    /* best-effort */
  }
}

/** Save a CV onto the user's profile. Returns true when it actually persisted
    (i.e. the user was authenticated; 401 for an anonymous user returns false). */
export async function saveCvToProfile(cv: PendingCv): Promise<boolean> {
  try {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvFileName: cv.fileName, cvText: cv.text, cvUpdatedAt: cv.at }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** On an authed surface, persist any stashed CV and clear the stash once saved. */
export async function flushPendingCv(): Promise<void> {
  let stashed: PendingCv | null = null;
  try {
    const raw = sessionStorage.getItem(CV_KEY);
    if (raw) stashed = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  if (!stashed?.text) return;
  const ok = await saveCvToProfile(stashed);
  if (ok) {
    try { sessionStorage.removeItem(CV_KEY); } catch { /* ignore */ }
  }
}
