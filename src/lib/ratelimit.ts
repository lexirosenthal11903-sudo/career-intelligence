import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { optionalEnv } from '@/lib/env';
import { NextRequest, NextResponse } from 'next/server';

function makeRatelimiter(prefix: string, limit: number): Ratelimit | null {
  const url = optionalEnv('UPSTASH_REDIS_REST_URL');
  const token = optionalEnv('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.fixedWindow(limit, '1 d'),
    analytics: false,
    prefix,
  });
}

let analyseRatelimiter: Ratelimit | null | undefined;
let chatRatelimiter: Ratelimit | null | undefined;

function getAnalyseRatelimiter(): Ratelimit | null {
  if (analyseRatelimiter !== undefined) return analyseRatelimiter;
  analyseRatelimiter = makeRatelimiter('ci:analyse', 10);
  return analyseRatelimiter;
}

function getChatRatelimiter(): Ratelimit | null {
  if (chatRatelimiter !== undefined) return chatRatelimiter;
  chatRatelimiter = makeRatelimiter('ci:chat', 100);
  return chatRatelimiter;
}

/**
 * Check the rate limit for /api/analyse.
 *
 * Keyed by IP address — used on the public analyse endpoint where the user may
 * not be authenticated yet. Returns a 429 response if the limit is exceeded,
 * or null if the request is allowed through.
 *
 * Fails open (allows the request) if Upstash is not configured, so the app
 * works in local development without Redis.
 */
export async function checkAnalyseRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  const limiter = getAnalyseRatelimiter();
  if (!limiter) return null;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    const resetDate = new Date(reset);
    const resetTime = resetDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
    });
    return NextResponse.json(
      {
        error: `You've run ${limit} analyses today — the daily limit. Come back after ${resetTime} to run another.`,
        retryAfter: reset,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    );
  }

  return null;
}

/**
 * Check the rate limit for /api/chat.
 *
 * Keyed by user ID — chat requires auth so we always have one. 100 messages/day
 * is generous for genuine use while blocking runaway loops or abuse.
 *
 * Fails open if Upstash is not configured.
 */
export async function checkChatRateLimit(userId: string): Promise<NextResponse | null> {
  const limiter = getChatRatelimiter();
  if (!limiter) return null;

  const { success, limit, remaining, reset } = await limiter.limit(userId);

  if (!success) {
    const resetDate = new Date(reset);
    const resetTime = resetDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
    });
    return NextResponse.json(
      {
        error: `You've sent ${limit} messages today — the daily limit. Come back after ${resetTime} to continue.`,
        retryAfter: reset,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    );
  }

  return null;
}
