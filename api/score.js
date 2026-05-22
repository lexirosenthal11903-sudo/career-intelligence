export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { jobs, profile, skills } = req.body;

  if (!jobs?.length) {
    return res.status(200).json({ jobs: [] });
  }

  const systemPrompt = `You are a career intelligence platform scoring job matches. Return ONLY a valid JSON array — no markdown, no backticks, no preamble.

For each job, return:
{
  "id": string,
  "relevanceScore": number (1-10),
  "relevanceReason": string (one sentence, specific),
  "contactName": "Not found",
  "contactTitle": "Not found",
  "contactLinkedIn": "Not found"
}

Write relevanceReason in second person, directly to the user. Never use "the candidate" or "candidate's" — use "you" and "your" instead. Example: "Your background in X makes you a strong fit for this role."`;

  const userPrompt = `Score these jobs against this candidate profile.

CANDIDATE:
- Seniority: ${profile.seniorityLevel}
- Experience: ${profile.yearsExperience}
- Target roles: ${(profile.topRoleTitles || []).join(', ')}
- Key skills: ${(profile.extractedSkills || []).slice(0, 10).join(', ')}
- Sectors: ${(profile.extractedSectors || []).join(', ')}
- Summary: ${profile.summary}

SKILL STRENGTHS: ${(skills.strengths || []).slice(0, 8).join(', ')}

JOBS TO SCORE:
${jobs.map(j => `ID: ${j.id}
Title: ${j.title}
Company: ${j.company}
Description: ${j.description}`).join('\n---\n')}

Return a JSON array scoring each job 1-10 for fit. Be honest — not everything is a strong match.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';

    let scores;
    try {
      const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const start = clean.indexOf('[');
      scores = JSON.parse(clean.slice(start));
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse scoring response', raw: text });
    }

    const SENIOR_PATTERN = /\b(manager|senior|director|head of|vp|vice president|principal|lead)\b/i;
    const isJuniorProfile =
      /graduate|early.?career/i.test(profile.seniorityLevel || '') ||
      /^0[-–]?2\b/.test(profile.yearsExperience || '') ||
      /^[01]\s*year/i.test(profile.yearsExperience || '');

    // Merge scores back into jobs
    const scored = jobs.map(job => {
      const score = scores.find(s => String(s.id) === String(job.id));
      let relevanceScore  = score?.relevanceScore  || 5;
      let relevanceReason = score?.relevanceReason || 'Matched to your profile';

      if (isJuniorProfile && SENIOR_PATTERN.test(job.title || '') && relevanceScore >= 8) {
        relevanceScore  = 4;
        relevanceReason = relevanceReason + ' Note: this role\'s seniority level is likely above your current experience.';
      }

      return {
        ...job,
        relevanceScore,
        relevanceReason,
        contactName:     score?.contactName     || 'Not found',
        contactTitle:    score?.contactTitle    || 'Not found',
        contactLinkedIn: score?.contactLinkedIn || 'Not found'
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.status(200).json({ jobs: scored });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
