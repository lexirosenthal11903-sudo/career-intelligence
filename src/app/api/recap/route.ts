import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { getAuthedUser } from '@/lib/supabase/server';
import { normalizeAnalysisResult } from '@/lib/profile-normalize';

export const maxDuration = 30;

// The "Where we got to" recap (VOICE-IN-UI.md §3) — Kavanah / continuity on return.
// Structured so the card renders safely: a continuity greeting, then two short lists.
interface Recap {
  greeting: string;
  becomingClear: string[];
  doingNext: string[];
}

interface Profile {
  summary?: string;
  suggestedDirections?: Array<{ title?: string; why?: string }>;
  topRoleTitles?: string[];
  extractedSectors?: string[];
  locationSearch?: string;
}

interface ChatMessage {
  role?: string;
  content?: unknown;
}

// Distilled from ADVISOR_PERSONA.md + VOICE-IN-UI.md §3. The advisor recaps the
// relationship on return: warm, first-person, specific, NO mention of the gap, no
// cheerleading, no urgency. Output is strict JSON so the UI can't be broken by prose.
const RECAP_SYSTEM = `You are Arlo, a warm and economical career mentor speaking directly to one person — "I" and "you", never "we", never naming any technology. You are writing the "Where we got to" card a person sees when they return: a quiet act of continuity that proves you remember them.

Write a short recap with three parts, grounded ONLY in what you actually know about this person below:
1. "greeting": one or two warm sentences picking the thread back up. Reflect back something specific to them. NEVER mention how long it's been away, never guess at days ("yesterday"), never apologise for a gap, never cheerlead.
2. "becomingClear": 2-3 short bullet strings — what is genuinely becoming clear about their direction and what they want. Specific to them, not generic.
3. "doingNext": 1-2 short bullet strings — what you (the advisor) are doing for them next (e.g. the kinds of roles you're searching, where new matches will land). First person.

Rules: every line must be something a trusted mentor who had just read this person could say out loud. No filler. No headers inside the strings. No markdown. Keep each bullet to one sentence.

Respond with ONLY a JSON object, no prose around it:
{"greeting": string, "becomingClear": string[], "doingNext": string[]}`;

function firstName(meta: Record<string, unknown> | undefined): string {
  const full = (meta?.full_name as string) || '';
  return full.trim().split(/\s+/)[0] ?? '';
}

/** Pull the plain text out of a stored chat message (content may be a string or blocks). */
function messageText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((b) => (b && typeof b === 'object' && 'text' in b ? String((b as { text: unknown }).text) : ''))
      .join(' ');
  }
  return '';
}

async function generateRecap(
  profile: Profile,
  name: string,
  messages: ChatMessage[]
): Promise<Recap | null> {
  const directions = (profile.suggestedDirections ?? [])
    .filter((d) => d?.title)
    .map((d) => `- ${d.title}${d.why ? `: ${d.why}` : ''}`)
    .join('\n');

  // Last few human turns — enough to ground continuity, not the whole history.
  const recentTalk = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-12)
    .map((m) => `${m.role === 'user' ? 'Them' : 'Me'}: ${messageText(m.content).slice(0, 400)}`)
    .join('\n');

  const context = `WHAT I KNOW ABOUT THIS PERSON
${name ? `Their name: ${name}` : 'I do not know their name.'}
${profile.summary ? `\nWhat I saw in their background:\n${profile.summary}` : ''}
${directions ? `\nDirections I surfaced for them (these are observations, paths to explore):\n${directions}` : ''}
${profile.locationSearch ? `\nWhere they're based: ${profile.locationSearch}` : ''}
${profile.extractedSectors?.length ? `\nSectors they lean toward: ${profile.extractedSectors.join(', ')}` : ''}
${recentTalk ? `\nOur most recent conversation:\n${recentTalk}` : '\nWe have not spoken in the conversation yet — base the recap on their background and the directions above.'}`;

  let response: Response;
  try {
    response = await callClaude({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: RECAP_SYSTEM,
      messages: [{ role: 'user', content: context }],
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const data = await response.json();
  const text: string = Array.isArray(data?.content)
    ? data.content.map((b: { text?: string }) => b?.text ?? '').join('')
    : '';
  if (!text) return null;

  // The model is asked for bare JSON; recover the object even if it's wrapped.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Partial<Recap>;
    const greeting = typeof parsed.greeting === 'string' ? parsed.greeting.trim() : '';
    const becomingClear = Array.isArray(parsed.becomingClear)
      ? parsed.becomingClear.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : [];
    const doingNext = Array.isArray(parsed.doingNext)
      ? parsed.doingNext.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : [];
    if (!greeting || becomingClear.length === 0) return null;
    return { greeting, becomingClear, doingNext };
  } catch {
    return null;
  }
}

export async function GET() {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  // The recap is built from the analysis — no analysis, no recap (the returning
  // card simply doesn't show; the conversation just continues).
  const { data: resultRow } = await supabase
    .from('results')
    .select('data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  // Normalize array fields before use: older rows may have suggestedDirections
  // persisted as a string (pre-boundary-fix data), which would crash `.filter`.
  const normalized = resultRow?.data ? normalizeAnalysisResult(resultRow.data as { profile?: Profile }) : null;
  const profile: Profile | undefined = normalized?.profile;
  if (!profile) return NextResponse.json({ recap: null });

  const { data: convRow } = await supabase
    .from('conversations')
    .select('messages')
    .eq('user_id', user.id)
    .eq('page', 'workspace')
    .maybeSingle();
  const messages: ChatMessage[] = Array.isArray(convRow?.messages) ? convRow.messages : [];
  const messageCount = messages.length;

  // Serve the stored recap unless the conversation has moved on since it was built.
  const { data: stored } = await supabase
    .from('recaps')
    .select('recap, message_count')
    .eq('user_id', user.id)
    .maybeSingle();
  if (stored?.recap && stored.message_count === messageCount) {
    return NextResponse.json({ recap: stored.recap });
  }

  const name = firstName(user.user_metadata);
  const recap = await generateRecap(profile, name, messages);
  // On a generation hiccup, fall back to whatever we had (or null) — never an error card.
  if (!recap) return NextResponse.json({ recap: stored?.recap ?? null });

  await supabase
    .from('recaps')
    .upsert(
      { user_id: user.id, recap, message_count: messageCount, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  return NextResponse.json({ recap });
}
