import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/workspace';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // If a ?next param was explicitly passed, honour it for all users.
        // This covers the case where someone has already run analysis and signs up
        // mid-flow — they should land at their destination, not the default entry.
        const explicitNext = searchParams.get('next');
        if (explicitNext) {
          return NextResponse.redirect(`${origin}${explicitNext}`);
        }
        // New users start the first session (the click); returning users land in
        // their workspace. The old /input + /dashboard flow stays as a fallback.
        const createdAt = new Date(user.created_at).getTime();
        const lastSignIn = new Date(user.last_sign_in_at ?? user.created_at).getTime();
        const isNewUser = lastSignIn - createdAt < 10000;
        return NextResponse.redirect(`${origin}${isNewUser ? '/workspace?view=first' : '/workspace'}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth-error=true`);
}
