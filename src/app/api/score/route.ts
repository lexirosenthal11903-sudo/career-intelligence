import { NextResponse } from 'next/server';
import { callClaude, findToolUse } from '@/lib/anthropic';

export const maxDuration = 60;

interface JobToScore {
  id: string | number;
  title?: string;
  company?: string;
  description?: string;
  [key: string]: unknown;
}

interface JobScore {
  id: string | number;
  relevanceScore: number;
  relevanceReason: string;
}

const scoreTool = {
  name: 'submit_scores',
  description: 'Submit relevance scores for each job.',
  input_schema: {
    type: 'object',
    properties: {
      scores: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            relevanceScore: { type: 'number', description: '1-10 fit score' },
            relevanceReason: {
              type: 'string',
              description:
                '2-3 sentences in second person. Sentence 1: what in their specific background applies to this role. Sentence 2: what the role actually requires and why the fit exists. Sentence 3 (optional): any honest caveat or what would make them stand out. Never generic — cite their actual skills or background.',
            },
          },
          required: ['id', 'relevanceScore', 'relevanceReason'],
        },
      },
    },
    required: ['scores'],
  },
};

export async function POST(request: Request) {
  const { jobs, profile } = await request.json();

  if (!jobs?.length) {
    return NextResponse.json({ jobs: [] });
  }

  // Cap at 20 jobs before scoring — user sees 5 at a time, 20 is more than enough
  const jobsToScore = (jobs as JobToScore[]).slice(0, 20);

  const fallback = () =>
    NextResponse.json({
      jobs: jobsToScore.map((j) => ({
        ...j,
        relevanceScore: 5,
        relevanceReason: 'Matched to your profile',
      })),
    });

  const systemPrompt = `You are a career intelligence platform scoring job matches. Score on industry fit and transferable skills — not just whether the job title exactly matches. Be careful about cross-domain keyword collisions: a keyword like "acquisitions" used in a media context means content licensing/rights, not HR talent acquisition — score the latter as 1-2 if the candidate has no HR background. Similarly "coordinator" in media is different from admin coordination in unrelated industries. Always score from the candidate's actual industry and skill context. Give at least 5 to any role in the same industry or where transferable skills clearly apply. Write relevanceReason in second person, never "the candidate". Be specific — cite what in their background applies, not just that it does. Be honest but generous where skills genuinely transfer.`;

  const userPrompt = `Score these jobs against this candidate profile.

CANDIDATE:
- Seniority: ${profile.seniorityLevel}
- Experience: ${profile.yearsExperience}
- Target roles: ${(profile.topRoleTitles || []).join(', ')}
- Suggested directions: ${(profile.suggestedDirections || []).map((d: { title: string }) => d.title).join(', ')}
- Key skills: ${(profile.extractedSkills || []).slice(0, 10).join(', ')}
- Sectors: ${(profile.extractedSectors || []).join(', ')}

JOBS TO SCORE:
${jobsToScore
  .map((j) => `ID: ${j.id}\nTitle: ${j.title}\nCompany: ${j.company}\nDescription: ${j.description}`)
  .join('\n---\n')}`;

  try {
    const response = await callClaude({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: systemPrompt,
      tools: [scoreTool],
      tool_choice: { type: 'tool', name: 'submit_scores' },
      messages: [{ role: 'user', content: userPrompt }],
    });

    const data = await response.json();
    const toolInput = findToolUse(data.content, 'submit_scores');

    if (!toolInput?.scores) return fallback();

    const scores = toolInput.scores as JobScore[];

    const SENIOR_PATTERN = /\b(manager|senior|director|head of|vp|vice president|principal|lead)\b/i;
    const isJuniorProfile =
      /graduate|junior|entry.?level|early.?career|intern/i.test(profile.seniorityLevel || '') ||
      /^0[-–]?[12]\b/.test(profile.yearsExperience || '') ||
      /^[01]\s*year/i.test(profile.yearsExperience || '') ||
      /\b[01]\s*[-–]\s*[23]\s*year/i.test(profile.yearsExperience || '');

    const sectors = (profile.extractedSectors || []) as string[];
    const directions = (profile.suggestedDirections || []) as Array<{ title: string }>;

    const scored = jobsToScore.map((job) => {
      const score = scores.find((s) => String(s.id) === String(job.id));
      let relevanceScore = score?.relevanceScore || 5;
      let relevanceReason = score?.relevanceReason || 'Matched to your profile';

      // Industry-adjacent floor: if the job is in the same sector/direction, never below 5
      const jobTitle = (job.title || '').toLowerCase();
      const jobDesc = (job.description || '').toLowerCase();
      const inSector = sectors.some((sec) =>
        jobTitle.includes(sec.toLowerCase()) || jobDesc.includes(sec.toLowerCase())
      );
      const inDirection = directions.some((d) =>
        jobTitle.includes(d.title.toLowerCase().split(' ')[0])
      );
      if ((inSector || inDirection) && relevanceScore < 5) {
        relevanceScore = 5;
      }

      if (isJuniorProfile && SENIOR_PATTERN.test(job.title || '')) {
        relevanceScore = Math.min(relevanceScore, 2);
        relevanceReason = "This role requires seniority beyond your current experience — it's been deprioritised.";
      }

      return {
        ...job,
        relevanceScore,
        relevanceReason,
        contactName: 'Not found',
        contactTitle: 'Not found',
        contactLinkedIn: 'Not found',
      };
    });

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return NextResponse.json({ jobs: scored });
  } catch {
    return fallback();
  }
}
