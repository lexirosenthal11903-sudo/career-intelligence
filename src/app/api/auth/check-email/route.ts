import { NextRequest, NextResponse } from 'next/server';
import { serviceClient } from '@/lib/supabase/server';
import { checkCheckEmailRateLimit } from '@/lib/ratelimit';

/**
 * Does an account already exist for this email?
 *
 * Passwordless auth (OTP + Google) has no natural "account already exists" signal —
 * `signInWithOtp` just sends a code either way. To give the standard, expected
 * messaging ("you already have an account, log in" / "no account, sign up") the
 * client checks here before sending a code.
 *
 * Tradeoff: this is a mild email-enumeration oracle. Acceptable at this stage
 * (pre-launch, ~100 close-contact users, OTP so there's no password to attack).
 * Revisit before public launch — e.g. move to generic messaging or add captcha.
 *
 * Scale note: `listUsers` paginates; fine for a small user base. Swap for a
 * dedicated lookup (DB function / profiles mirror) once the user count grows.
 */
export async function POST(request: NextRequest) {
  const rateLimited = await checkCheckEmailRateLimit(request);
  if (rateLimited) return rateLimited;

  let email: string;
  try {
    const body = await request.json();
    email = String(body?.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  try {
    const admin = serviceClient();
    // Page through until found or exhausted (small user base — see scale note).
    let page = 1;
    const perPage = 200;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 });
      const found = data.users.some((u) => (u.email ?? '').toLowerCase() === email);
      if (found) return NextResponse.json({ exists: true });
      if (data.users.length < perPage) return NextResponse.json({ exists: false });
      page += 1;
      if (page > 50) return NextResponse.json({ exists: false }); // hard ceiling
    }
  } catch {
    return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 });
  }
}
