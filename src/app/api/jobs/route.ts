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

export async function POST(request: Request) {
  const { keywords, location, salaryMin, salaryMax } = await request.json();

  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    return NextResponse.json({ error: 'Adzuna credentials not configured' }, { status: 500 });
  }

  const searchLocation = location || 'london';

  const fetchKeyword = async (keyword: string) => {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: apiKey,
      what: keyword,
      where: searchLocation,
      results_per_page: '5',
      max_days_old: '30',
    });
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
      (keywords as string[]).slice(0, 5).map(fetchKeyword)
    );
    const allJobs = results.flat();

    const seen = new Set<string>();
    const unique = allJobs.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });

    return NextResponse.json({ jobs: unique });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
