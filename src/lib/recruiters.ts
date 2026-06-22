/**
 * Recruitment-agency detection for job listings.
 *
 * Decided 2026-06-22 (Lexi): agency listings are filtered OUT of job results.
 * A recruiter isn't the employer, which breaks our "who do I actually reach out
 * to" model; the posts are often evergreen pipeline ads rather than real
 * vacancies; and they pad the list with low-signal noise — against our
 * quality-over-quantity rule. The trade-off (a few agency-only real roles are
 * lost) is accepted. The analyse prompt already bans agencies from *company
 * suggestions*; this covers the live Adzuna/Reed *listings*, which don't.
 *
 * High-precision by design — we'd rather let an occasional agency through than
 * wrongly drop a real employer. Matches strong agency signals + a list of the
 * largest UK recruiters that frequently appear as the listing's "company".
 */

// Strong, high-precision signals in a company name.
const SIGNALS = [
  /\brecruit/i,            // recruitment, recruiters, recruiting
  /\bstaffing\b/i,
  /\bresourcing\b/i,
  /\bpersonnel\b/i,
  /employment agency/i,
  /talent (solutions|acquisition|partners|group)/i,
  /search (&|and) selection/i,
  /\bappointments\b/i,
];

// Largest UK agencies that often appear as the listing "company" without an
// obvious signal word. Word-boundary matched to avoid clipping real names.
const KNOWN = new RegExp(
  '\\b(' +
    [
      'hays', 'michael page', 'page personnel', 'adecco', 'randstad', 'manpower',
      'robert half', 'robert walters', 'pertemps', 'office angels', 'gi group',
      'kelly services', 'brook street', 'blue arrow', 'morgan hunt', 'venn group',
      'sthree', 'harnham', 'lorien', 'huntress', 'tiger recruitment', 'nigel wright',
      'sellick', 'service care', 'james andrews', 'katie bard', 'angela mortimer',
      'reed specialist', 'gleeson', 'parkside', 'search consultancy', 'hamilton barnes',
    ].join('|') +
    ')\\b',
  'i'
);

export function isRecruiter(company?: string | null): boolean {
  const name = (company || '').trim();
  if (!name) return false;
  if (/^reed$/i.test(name)) return true; // bare "Reed" = the agency, not the employer
  if (KNOWN.test(name)) return true;
  return SIGNALS.some((re) => re.test(name));
}
