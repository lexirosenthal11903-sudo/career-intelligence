import { NextResponse } from 'next/server';
import { isRecruiter } from '@/lib/recruiters';
import { mapAdzunaCategory } from '@/lib/adzunaCategory';

interface AdzunaJob {
  id: string;
  created?: string;
  title?: string;
  description?: string;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
}

function formatSalary(job: AdzunaJob): string {
  if (job.salary_min && job.salary_max) {
    const lo = Math.round(job.salary_min / 1000);
    const hi = Math.round(job.salary_max / 1000);
    return lo === hi ? `£${lo}k` : `£${lo}k–£${hi}k`;
  }
  if (job.salary_min) return `From £${Math.round(job.salary_min / 1000)}k`;
  return 'Not listed';
}

// Senior-role terms we exclude from the search for entry-level candidates, so
// listings come back at the right seniority instead of being re-ranked down
// after the fact (Adzuna `what_exclude` filters at source).
// Unambiguous senior terms only. "manager"/"lead" were excluded here too, which
// suppressed legitimate entry roles (Account Manager, Lead Generation Exec) at the
// source — a big reason results felt irrelevant for junior profiles.
const SENIOR_EXCLUDE = 'senior director head principal vp executive chief';

function isJuniorSeniority(seniority?: string): boolean {
  // Career-changers entering a NEW field are entry-level *for that field*, even
  // when their seniority string reads "mid-level career changer" — so the
  // senior-term exclusion must still apply, or senior listings leak through
  // (audit #13: a teacher pivoting to UX was shown senior UX roles).
  return /graduate|junior|entry.?level|early.?career|intern|assistant|trainee|career.?chang|pivot|transition/i.test(
    seniority || ''
  );
}

export async function POST(request: Request) {
  const { keywords, roleTitles, sectors, location, salaryMin, salaryMax, seniority } = await request.json();

  const titles: string[] = Array.isArray(roleTitles) ? roleTitles.filter((t) => typeof t === 'string' && t.trim()) : [];
  const kw: string[] = Array.isArray(keywords) ? keywords.filter((k) => typeof k === 'string' && k.trim()) : [];

  if (titles.length === 0 && kw.length === 0) {
    return NextResponse.json(
      { error: 'At least one role title or search keyword is required.' },
      { status: 400 }
    );
  }

  // Constrain the whole search to one Adzuna occupation category when we can
  // identify it — the biggest lever against off-target results (a design grad
  // seeing a media lawyer). Null → unconstrained (better than the wrong category).
  const category = mapAdzunaCategory(
    Array.isArray(sectors) ? sectors : [],
    titles,
    kw
  );

  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    return NextResponse.json({ error: 'Adzuna credentials not configured' }, { status: 500 });
  }

  // Don't force London. An empty `where` searches all of Great Britain — the
  // London default was a real "wrong location" complaint for non-London users.
  const searchLocation = (typeof location === 'string' ? location : '').trim();
  const excludeSenior = isJuniorSeniority(seniority);

  // One Adzuna search for a term. `phrase` matches the words together (a role
  // title like "junior data analyst" stays intact instead of OR-ing the words);
  // `category` constrains to the occupation taxonomy.
  const fetchTerm = async (term: string, opts: { phrase?: boolean; noCategory?: boolean } = {}) => {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: apiKey,
      results_per_page: '8',
      max_days_old: '30',
    });
    if (opts.phrase) params.set('what_phrase', term);
    else params.set('what', term);
    if (category && !opts.noCategory) params.set('category', category);
    if (searchLocation) params.set('where', searchLocation);
    if (excludeSenior) params.set('what_exclude', SENIOR_EXCLUDE);
    if (salaryMin) params.set('salary_min', String(salaryMin));
    if (salaryMax) params.set('salary_max', String(salaryMax));

    const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?${params.toString()}`;

    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) return [];
      const data = await response.json();
      return ((data.results || []) as AdzunaJob[]).map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company?.display_name || 'Not listed',
        location: job.location?.display_name || searchLocation,
        salary: formatSalary(job),
        datePosted: job.created
          ? new Date(job.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
          : 'Recent',
        description: (job.description || '').slice(0, 300),
        applyUrl: job.redirect_url || '',
        workStyle: job.contract_time === 'full_time' ? 'Full-time' : job.contract_time || 'Not listed',
        keyword: term,
      }));
    } catch {
      return [];
    }
  };

  const dedupe = (jobs: Awaited<ReturnType<typeof fetchTerm>>, seen: Set<string>) =>
    jobs.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      if (isRecruiter(j.company)) return false; // recruiters out (decided 2026-06-22)
      return true;
    });

  try {
    const seen = new Set<string>();

    // Primary: search the person's REAL role titles as phrases, inside their
    // category. This is the relevant set — intact titles, not OR'd buzzwords.
    const titleResults = await Promise.all(
      titles.slice(0, 5).map((t) => fetchTerm(t, { phrase: true }))
    );
    const unique = dedupe(titleResults.flat(), seen);

    // Top-up (only if sparse): the analysis keywords, still constrained to the
    // category — NOT the old wild first-word search that pulled in noise.
    if (unique.length < 5 && kw.length) {
      const kwResults = await Promise.all(kw.slice(0, 6).map((k) => fetchTerm(k)));
      unique.push(...dedupe(kwResults.flat(), seen));
    }

    // Last resort: if the category constraint left us empty, retry the titles
    // unconstrained so the user never sees a blank list (relevance over nothing).
    if (unique.length === 0 && category && titles.length) {
      const broad = await Promise.all(titles.slice(0, 5).map((t) => fetchTerm(t, { phrase: true, noCategory: true })));
      unique.push(...dedupe(broad.flat(), seen));
    }

    return NextResponse.json({ jobs: unique, category });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
