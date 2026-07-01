import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';
import { jsonNoStore } from '@/lib/api-response';
import { isOutreachStatus, type OutreachStatus } from '@/lib/outreach';
import { roleKey } from '@/lib/role-key';

// Per-user private data — never cache (see api-response.jsonNoStore + STATE-SYNC-AUDIT).
export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { data, error } = await supabase
    .from('outreach')
    .select('role_key, role_title, company, person_type, search_url, subject, message, follow_up, status, sent_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return jsonNoStore({ outreach: data ?? [] });
}

// PATCH the self-reported status of one role's outreach. Keyed by role (title+company)
// so it matches the row the draft_outreach tool wrote and the row the panel shows.
export async function PATCH(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let roleTitle: unknown, company: unknown, status: unknown;
  try {
    ({ roleTitle, company, status } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (typeof roleTitle !== 'string' || !roleTitle.trim()) {
    return NextResponse.json({ error: 'roleTitle required' }, { status: 400 });
  }
  if (!isOutreachStatus(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const key = roleKey(roleTitle, typeof company === 'string' ? company : '');
  const next = status as OutreachStatus;

  // Moving to 'sent' stamps sent_at (drives the single follow-up timing). Moving BACK
  // to to_send clears it so a re-sent thread times its follow-up afresh. replied/no_reply
  // leave sent_at untouched — it's still a true record of when it went out.
  const update: { status: OutreachStatus; updated_at: string; sent_at?: string | null } = {
    status: next,
    updated_at: new Date().toISOString(),
  };
  if (next === 'sent') update.sent_at = new Date().toISOString();
  if (next === 'to_send') update.sent_at = null;

  // .select() so we know whether a row actually matched — a zero-row update on a stale
  // or mismatched key must not report success (the UI would leave a chip lying).
  const { data, error } = await supabase
    .from('outreach')
    .update(update)
    .eq('user_id', user.id)
    .eq('role_key', key)
    .select('role_key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'No outreach found for that role' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
