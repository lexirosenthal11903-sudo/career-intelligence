import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Auth gate for the whole app.
 *
 * - Refreshes the Supabase session cookie on every matched request.
 * - Protected API routes return 401 JSON when there is no authenticated user.
 * - Dashboard pages redirect unauthenticated visitors to the homepage.
 *
 * Public API routes (`/api/jobs`, `/api/extract`) are intentionally left open —
 * they take no user data and power the unauthenticated landing experience.
 */

// /api/analyse is intentionally public — unauthenticated users must be able to
// run a full analysis to reach the "aha moment" before being prompted to sign up.
// Rate limiting (Upstash) guards this endpoint against abuse instead of auth.
const PROTECTED_API = [
  '/api/chat',
  '/api/save-job',
  '/api/save-result',
  '/api/score',
  '/api/profile',
  '/api/applications',
  '/api/results',
];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (PROTECTED_API.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/save-job/:path*',
    '/api/save-result/:path*',
    '/api/score/:path*',
    '/api/profile/:path*',
    '/api/applications/:path*',
    '/api/results/:path*',
  ],
};
