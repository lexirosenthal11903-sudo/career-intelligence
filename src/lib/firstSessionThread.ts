// First-session → workspace handoff: the conversation must SURVIVE the seam.
//
// The first session (opener → discovery → reveal → beats) lives only in client
// state. When the user continues — and especially when they sign in — that whole
// conversation used to be thrown away (a fresh /workspace load). This module turns
// the first session into a real chat transcript and stashes it across the auth
// round-trip (Google OAuth leaves the page; sessionStorage survives the return),
// so the live conversation picks up exactly where the first session left off.

import type { DirectionClarity as Clarity } from "@/hooks/useFirstSession";

export interface ApiMsg {
  role: "user" | "assistant";
  content: string;
}

// ── The advisor's locked first-session lines, as plain strings ────────────────
// Single source of truth: ChatPane renders these AND they become the transcript,
// so the conversation history matches what the user actually saw. (VOICE-IN-UI §1/§2a.)
export const OPENER =
  "I'm here to help you work out what you actually want — and then go and get it. We start with the direction that fits you; the right roles come after, once they're worth your time. No forms, no quiz — just tell me where you're at, or drop your CV in.";

// ONE warm message after the reveal (not a stack). Invites a reaction, explicitly
// permits not-knowing, offers to explore together, reassures memory — never a demand
// to decide on the spot, never a separate "here's your homework" close. (Lexi, 2026-06-24.)
export function explorationInvite(clarity: Clarity | null): string {
  const base =
    "Do any of these feel like you — or not quite? You don't have to decide now. We can dig into any of them together, and I'll remember everything as we go.";
  return clarity === "directed"
    ? `${base} And when you want, I can show you what these look like as real roles.`
    : base;
}

// The reveal card, rendered as text for the conversation history (the card itself
// was the "click" moment; once we're continuing, it becomes part of the thread).
export function revealText(
  summary: string,
  directions: { title: string; why: string }[]
): string {
  const lines: string[] = ["Here's where I see this going."];
  if (summary) lines.push(summary);
  if (directions.length) {
    lines.push("Directions worth exploring:");
    for (const d of directions) lines.push(`- ${d.title}${d.why ? ` — ${d.why}` : ""}`);
  }
  return lines.join("\n");
}

export interface ThreadInputs {
  /** The discovery transcript: opening share + each Q/A, in order. */
  intake: { role: "user" | "assistant"; content: string }[];
  summary: string;
  directions: { title: string; why: string }[];
  nextAction: string;
  clarity: Clarity | null;
}

/** Assemble the full first-session transcript the workspace conversation continues. */
export function buildThread(i: ThreadInputs): ApiMsg[] {
  const msgs: ApiMsg[] = [{ role: "assistant", content: OPENER }];
  // The discovery turns already alternate user/assistant (opening share is first).
  for (const m of i.intake) msgs.push({ role: m.role, content: m.content });
  msgs.push({ role: "assistant", content: revealText(i.summary, i.directions) });
  msgs.push({ role: "assistant", content: explorationInvite(i.clarity) });
  return msgs;
}

// ── Cross-navigation stash (survives the OAuth round-trip) ─────────────────────
const STASH_KEY = "first-session-thread";

interface StashShape {
  messages: ApiMsg[];
  pending: string; // the user's reply that should be sent once the live chat takes over
}

export function stashThread(messages: ApiMsg[], pending: string): void {
  try {
    sessionStorage.setItem(STASH_KEY, JSON.stringify({ messages, pending }));
  } catch {
    /* sessionStorage unavailable — the in-place (no-nav) path still works from memory */
  }
}

export function readThread(): StashShape | null {
  try {
    const raw = sessionStorage.getItem(STASH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StashShape;
    if (!Array.isArray(parsed.messages)) return null;
    return { messages: parsed.messages, pending: typeof parsed.pending === "string" ? parsed.pending : "" };
  } catch {
    return null;
  }
}

export function clearThread(): void {
  try {
    sessionStorage.removeItem(STASH_KEY);
  } catch {
    /* ignore */
  }
}
