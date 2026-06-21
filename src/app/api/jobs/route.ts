import { NextResponse } from 'next/server';

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
const SENIOR_EXCLUDE = 'senior director head principal lead manager vp executive chief';

function isJuniorSeniority(seniority?: string): boolean {
  return /graduate|junior|entry.?level|early.?career|intern|assistant|trainee/i.test(seniority || '');
}

export async function POST(request: Request) {
  const { keywords, location, salaryMin, salaryMax, seniority } = await request.json();

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json(
      { error: 'At least one search keyword is required.' },
      { status: 400 }
    );
  }

  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    return NextResponse.json({ error: 'Adzuna credentials not configured' }, { status: 500 });
  }

  // Don't force London. An empty `where` searches all of Great Britain — the
  // London default was a real "wrong location" complaint for non-London users.
  const searchLocation = (typeof location === 'string' ? location : '').trim();
  const excludeSenior = isJuniorSeniority(seniority);

  const fetchKeyword = async (keyword: string) => {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: apiKey,
      what: keyword,
      results_per_page: '5',
      max_days_old: '30',
    });
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
        keyword,
      }));
    } catch {
      return [];
    }
  };

  try {
    const results = await Promise.all(
      (keywords as string[]).slice(0, 8).map(fetchKeyword)
    );
    const allJobs = results.flat();

    const seen = new Set<string>();
    const unique = allJobs.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });

    // Fallback: if sparse results, try the first word of each keyword — broader match
    if (unique.length < 5) {
      const fallbackTerms = [...new Set(
        (keywords as string[])
          .map((k: string) => k.split(' ')[0].toLowerCase())
          .filter((k: string) => k.length > 3)
      )].slice(0, 4);

      const fallbackResults = await Promise.all(fallbackTerms.map(fetchKeyword));
      const fallbackJobs = fallbackResults.flat().filter((j) => {
        if (seen.has(j.id)) return false;
        seen.add(j.id);
        return true;
      });
      unique.push(...fallbackJobs);
    }

    return NextResponse.json({ jobs: unique });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
