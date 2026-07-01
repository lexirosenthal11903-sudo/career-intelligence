// Outreach tracking — the pure model shared by the API, the advisor context, and the
// UI. Kept dependency-clean (no imports) so it unit-tests under `node --test` without
// the @/ alias problem. DB reads live in the routes that own auth; this file is just
// the status model, the follow-up timing, and the advisor's context line.
//
// Design (research/outreach-research.md §5 + prior-art pass 2026-07-01): status is
// user-self-reported (we have no inbox), the model is the honest minimum, and there is
// exactly ONE follow-up — the advisor surfaces it warmly when ~a working week has
// passed with no reply, never a red overdue badge, never a second chase.

export const OUTREACH_STATUSES = ['to_send', 'sent', 'replied', 'no_reply'] as const;
export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

export function isOutreachStatus(s: unknown): s is OutreachStatus {
  return typeof s === 'string' && (OUTREACH_STATUSES as readonly string[]).includes(s);
}

// User-facing chip labels (warm, no CRM-speak). "No reply" is soft and terminal.
export const OUTREACH_LABELS: Record<OutreachStatus, string> = {
  to_send: 'To send',
  sent: 'Sent',
  replied: 'They replied',
  no_reply: 'No reply',
};

export interface OutreachEntry {
  roleTitle: string;
  company?: string | null;
  personType?: string | null;
  status: OutreachStatus;
  sentAt?: string | null; // ISO; set when status moves to 'sent'
}

// One follow-up, and only after a full working week of silence. Research §5: wait 5-7
// business days, one follow-up, then stop. We use 5 as the earliest honest nudge point.
export const FOLLOW_UP_AFTER_BUSINESS_DAYS = 5;

/**
 * Whole business days (Mon-Fri) elapsed between two instants. 0 if b is before a.
 * All arithmetic is in UTC (getUTC / setUTC) so the count is deterministic wherever
 * the code runs: sentAt is a UTC ISO string, and a non-UTC server must not shift the
 * follow-up timing by a day.
 */
export function businessDaysBetween(a: Date, b: Date): number {
  if (b <= a) return 0;
  let count = 0;
  const cur = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()));
  const end = new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()));
  while (cur < end) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    const day = cur.getUTCDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

/**
 * Is this outreach ready for its single follow-up? True only when it was SENT, has had
 * no reply, and a working week has passed. Anything already replied / no_reply / to_send
 * is never a follow-up candidate — the advisor never chases twice.
 */
export function readyForFollowUp(entry: OutreachEntry, now: Date = new Date()): boolean {
  if (entry.status !== 'sent' || !entry.sentAt) return false;
  const sent = new Date(entry.sentAt);
  if (Number.isNaN(sent.getTime())) return false;
  return businessDaysBetween(sent, now) >= FOLLOW_UP_AFTER_BUSINESS_DAYS;
}

const roleLabel = (e: OutreachEntry) => `${e.roleTitle}${e.company ? ` at ${e.company}` : ''}`;

/**
 * The advisor's outreach context line. Tells it what the user has reached out about and,
 * crucially, which one is ready for its single gentle follow-up — so the advisor can
 * raise it warmly in conversation (never a notification, never a second chase). Empty
 * string when there's no live outreach worth mentioning.
 */
export function formatOutreachForAdvisor(entries: OutreachEntry[], now: Date = new Date()): string {
  const live = entries.filter((e) => e.status === 'sent' || e.status === 'to_send');
  if (!live.length) return '';

  const lines = live
    .map((e) => {
      if (e.status === 'to_send') return `${roleLabel(e)}: drafted, not sent yet`;
      const due = readyForFollowUp(e, now);
      return `${roleLabel(e)}: message sent, no reply yet${due ? ', and a working week has now passed, so this is the moment for ONE gentle follow-up if they want it' : ''}`;
    })
    .join('; ');

  const anyDue = live.some((e) => readyForFollowUp(e, now));
  const followUpRule = anyDue
    ? ' If they want to follow up on one that has gone quiet, offer to help with the single follow-up line, one only, warm and no pressure. Never suggest chasing a second time, and if a reply never comes, remind them gently that most outreach goes unanswered and it is not a verdict on them.'
    : '';

  return `Their outreach so far, so you can pick the thread back up (never re-draft one they already have): ${lines}.${followUpRule}`;
}
