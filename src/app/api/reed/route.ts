import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';
import { isRecruiter } from '@/lib/recruiters';

// Reed API — stronger than Adzuna for charity, social sector, healthcare, public sector.
// Auth: HTTP Basic with API key as username, empty password.
// Docs: https://www.reed.co.uk/developers/jobseeker

interface ReedJob {
  jobId: number;
  jobTitle?: string;
  employerName?: string;
  locationName?: string;
  minimumSalary?: number;
  maximumSalary?: number;
  currency?: string;
  expirationDate?: string;
  date?: string;
  jobDescription?: string;
  jobUrl?: string;
  contractType?: string;
  partTime?: boolean;
  fullTime?: boolean;
}

function formatSalary(job: ReedJob): string {
  if (job.minimumSalary && job.maximumSalary) {
    const lo = Math.round(job.minimumSalary / 1000);
    const hi = Math.round(job.maximumSalary / 1000);
    return lo === hi ? `£${lo}k` : `£${lo}k–£${hi}k`;
  }
  if (job.minimumSalary) return `From £${Math.round(job.minimumSalary / 1000)}k`;
  return 'Not listed';
}

function formatWorkStyle(job: ReedJob): string {
  if (job.partTime) return 'Part-time';
  if (job.fullTime) return 'Full-time';
  if (job.contractType) return job.contractType;
  return 'Not listed';
}

const fetchKeyword = async (
  keyword: string,
  location: string,
  apiKey: string
): Promise<object[]> => {
  const params = new URLSearchParams({
    keywords: keyword,
    locationName: location,
    resultsToTake: '5',
    fullTime: 'true',
  });

  const url = `https://www.reed.co.uk/api/1.0/search?${params.toString()}`;
  const credentials = Buffer.from(`${apiKey}:`).toString('base64');

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return ((data.results || []) as ReedJob[]).map((job) => ({
      id: `reed-${job.jobId}`,
      title: job.jobTitle,
      company: job.employerName || 'Not listed',
      location: job.locationName || location,
      salary: formatSalary(job),
      datePosted: job.date
        ? new Date(job.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : 'Recent',
      description: (job.jobDescription || '').replace(/<[^>]+>/g, '').slice(0, 300),
      applyUrl: job.jobUrl || '',
      workStyle: formatWorkStyle(job),
      keyword,
      source: 'reed',
    }));
  } catch {
    return [];
  }
};

export async function POST(request: Request) {
  const { user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { keywords, location, sectors } = await request.json();

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'At least one keyword is required.' }, { status: 400 });
  }

  const apiKey = process.env.REED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Reed API key not configured.' }, { status: 500 });
  }

  const searchLocation = location || 'london';
  void sectors; // accepted for future use — currently run Reed for all profiles

  try {
    const results = await Promise.all(
      (keywords as string[]).slice(0, 6).map((kw) => fetchKeyword(kw, searchLocation, apiKey))
    );
    const allJobs = results.flat();

    const seen = new Set<string>();
    const unique = allJobs.filter((j) => {
      const job = j as { id: string; company?: string };
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      if (isRecruiter(job.company)) return false; // recruiters out (decided 2026-06-22)
      return true;
    });

    return NextResponse.json({ jobs: unique });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
