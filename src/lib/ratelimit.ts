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
let intakeRatelimiter: Ratelimit | null | undefined;
let chatRatelimiter: Ratelimit | null | undefined;

// A full analysis is two Claude calls — the expensive op — so it's capped tighter.
// 25/day/IP is comfortable for genuine use (a user runs 1-3) while still bounding abuse.
function getAnalyseRatelimiter(): Ratelimit | null {
  if (analyseRatelimiter !== undefined) return analyseRatelimiter;
  analyseRatelimiter = makeRatelimiter('ci:analyse', 25);
  return analyseRatelimiter;
}

// Discovery (intake) is one cheap Haiku turn and happens several times per session,
// so it MUST NOT share the analysis budget (that's what locked users out mid-session).
// Its own generous per-IP cap bounds abuse without starving a normal conversation.
function getIntakeRatelimiter(): Ratelimit | null {
  if (intakeRatelimiter !== undefined) return intakeRatelimiter;
  intakeRatelimiter = makeRatelimiter('ci:intake', 80);
  return intakeRatelimiter;
}

function getChatRatelimiter(): Ratelimit | null {
  if (chatRatelimiter !== undefined) return chatRatelimiter;
  chatRatelimiter = makeRatelimiter('ci:chat', 100);
  return chatRatelimiter;
}

// Shared IP-keyed limiter check for the public (pre-auth) endpoints. `message`
// builds the user-facing copy from the limit + reset time. Fails open when Upstash
// isn't configured so local dev works without Redis.
async function checkIpRateLimit(
  limiter: Ratelimit | null,
  request: NextRequest,
  message: (limit: number, resetTime: string) => string
): Promise<NextResponse | null> {
  if (!limiter) return null;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const { success, limit, remaining, reset } = await limiter.limit(ip);
  if (success) return null;

  const resetTime = new Date(reset).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
  });
  return NextResponse.json(
    { error: message(limit, resetTime), retryAfter: reset },
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

/** Rate limit for /api/analyse (full analysis — the expensive op). IP-keyed. */
export async function checkAnalyseRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  return checkIpRateLimit(
    getAnalyseRatelimiter(),
    request,
    (limit, resetTime) =>
      `We've hit today's limit of ${limit} full analyses from your connection. It resets after ${resetTime} — come back then and I'll pick this straight back up.`
  );
}

/** Rate limit for /api/intake (cheap discovery turns). Separate, generous budget. */
export async function checkIntakeRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  return checkIpRateLimit(
    getIntakeRatelimiter(),
    request,
    (_limit, resetTime) =>
      `We've talked a lot today — I need to pause until after ${resetTime}. Nothing's lost; come back then and we'll carry on.`
  );
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
