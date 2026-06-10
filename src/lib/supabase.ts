import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export function serviceClient(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function getAuthedUser(
  request: Request
): Promise<{ user: User; supabase: SupabaseClient } | { user: null; supabase: null }> {
  const token = (request.headers.get('authorization') || '').replace('Bearer ', '').trim();
  if (!token) return { user: null, supabase: null };

  const supabase = serviceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { user: null, supabase: null };

  return { user: data.user, supabase };
}
