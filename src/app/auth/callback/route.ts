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
        // Honour an explicit ?next (someone signing up mid-flow lands at their
        // destination). Otherwise send everyone to /workspace and let the page decide
        // first-session vs returning by whether they've actually been READ — not by
        // account age, which permanently trapped existing accounts on the returning
        // path and hid discovery from them forever.
        const explicitNext = searchParams.get('next');
        return NextResponse.redirect(`${origin}${explicitNext ?? '/workspace'}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth-error=true`);
}
