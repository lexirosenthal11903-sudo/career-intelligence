export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { keywords, location, salaryMin, salaryMax } = req.body;

  const appId  = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    return res.status(500).json({ error: 'Adzuna credentials not configured' });
  }

  try {
    const searchLocation = location || 'london';
    const allJobs = [];

    for (const keyword of keywords.slice(0, 3)) {
      const params = new URLSearchParams({
        app_id: appId,
        app_key: apiKey,
        what: keyword,
        where: searchLocation,
        results_per_page: '5',
        max_days_old: '30'
      });
      if (salaryMin) params.set('salary_min', String(salaryMin));
      if (salaryMax) params.set('salary_max', String(salaryMax));

      const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?${params.toString()}`;

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });

if (!response.ok) {
  const errText = await response.text();
  console.error('Adzuna error:', response.status, errText);
  continue;
}

      const data = await response.json();
      const jobs = (data.results || []).map(job => ({
        id:          job.id,
        title:       job.title,
        company:     job.company?.display_name || 'Not listed',
        location:    job.location?.display_name || searchLocation,
        salary:      job.salary_min && job.salary_max
                       ? (Math.round(job.salary_min/1000) === Math.round(job.salary_max/1000)
                           ? `£${Math.round(job.salary_min/1000)}k`
                           : `£${Math.round(job.salary_min/1000)}k–£${Math.round(job.salary_max/1000)}k`)
                       : job.salary_min
                         ? `From £${Math.round(job.salary_min/1000)}k`
                         : 'Not listed',
        datePosted:  job.created ? new Date(job.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recent',
        description: (job.description || '').slice(0, 300),
        applyUrl:    job.redirect_url || '',
        workStyle:   job.contract_time === 'full_time' ? 'Full-time' : job.contract_time || 'Not listed',
        keyword:     keyword
      }));

      allJobs.push(...jobs);
    }

    const seen = new Set();
    const unique = allJobs.filter(j => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });

    res.status(200).json({ jobs: unique });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
