import { NextResponse } from 'next/server';

/**
 * JSON response for an authenticated, per-user API READ that must never be cached.
 *
 * Without `Cache-Control: no-store`, a same-origin `fetch("/api/…")` GET is eligible
 * for the browser's heuristic cache, so a surface can be handed a STALE copy of the
 * user's private data. That is the "advisor says it's done but the screen still shows
 * the old thing" drift (e.g. a rejected direction kept rendering because /api/profile
 * served a cached response) — and it leaks private data into a cache besides. Use this
 * for every per-user GET so the live surfaces always re-read the real state.
 */
export function jsonNoStore(body: unknown, init?: ResponseInit): NextResponse {
  const res = NextResponse.json(body, init);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
