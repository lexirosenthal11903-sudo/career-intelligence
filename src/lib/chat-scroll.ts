/**
 * The scrollTop that brings a message's START near the top of its scroll container, so a
 * long just-sent message reads from the start instead of having its top scrolled off
 * (intent set 2026-06-24: "the user message stays put, the reply appends below").
 *
 * Clamped on both ends: never past the bottom (a short message then just sits above the
 * composer, the old calm behaviour), never above 0. Pure on purpose — the rule is the
 * thing that regressed, so it's unit-tested here without needing a live (paid) chat turn.
 */
export function anchorScrollTop(args: {
  scrollTop: number; // container.scrollTop right now
  containerTop: number; // container.getBoundingClientRect().top (viewport coords)
  targetTop: number; // target message.getBoundingClientRect().top (viewport coords)
  maxTop: number; // scrollHeight - clientHeight (the furthest we can scroll)
  margin?: number; // breathing room above the message
}): number {
  const { scrollTop, containerTop, targetTop, maxTop, margin = 16 } = args;
  const desired = scrollTop + (targetTop - containerTop) - margin;
  return Math.max(0, Math.min(desired, maxTop));
}
