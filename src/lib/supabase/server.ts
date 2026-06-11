import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from '@/lib/env';

/**
 * Request-scoped Supabase client backed by the user's session cookies.
 *
 * Use this inside API route handlers and server components. It carries the
 * authenticated user's session, so all queries respect Row Level Security.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where cookies are read-only.
            // The middleware refreshes the session, so this is safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * Resolve the authenticated user for a request from session cookies.
 * Returns { user: null } when there is no valid session.
 */
export async function getAuthedUser(): Promise<
  { user: NonNullable<Awaited<ReturnType<SupabaseClient['auth']['getUser']>>['data']['user']>; supabase: SupabaseClient }
  | { user: null; supabase: null }
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { user: null, supabase: null };
  return { user: data.user, supabase };
}

/**
 * Admin client that bypasses RLS. Only for trusted server-side operations that
 * legitimately need to act outside a single user's scope. Never expose to the
 * client.
 */
export function serviceClient(): SupabaseClient {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_KEY')
  );
}
