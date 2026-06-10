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
                'One sentence in second person — "Your background in X makes you a strong fit..."',
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

  const fallback = () =>
    NextResponse.json({
      jobs: (jobs as JobToScore[]).map((j) => ({
        ...j,
        relevanceScore: 5,
        relevanceReason: 'Matched to your profile',
      })),
    });

  const systemPrompt = `You are a career intelligence platform scoring job matches. Write relevanceReason in second person, directly to the user — never "the candidate". Example: "Your background in X makes you a strong fit for this role." Be honest — not everything is a strong match.`;

  const userPrompt = `Score these jobs against this candidate profile.

CANDIDATE:
- Seniority: ${profile.seniorityLevel}
- Experience: ${profile.yearsExperience}
- Target roles: ${(profile.topRoleTitles || []).join(', ')}
- Key skills: ${(profile.extractedSkills || []).slice(0, 10).join(', ')}
- Sectors: ${(profile.extractedSectors || []).join(', ')}

JOBS TO SCORE:
${(jobs as JobToScore[])
  .map((j) => `ID: ${j.id}\nTitle: ${j.title}\nCompany: ${j.company}\nDescription: ${j.description}`)
  .join('\n---\n')}`;

  try {
    const response = await callClaude({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
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
      /graduate|early.?career/i.test(profile.seniorityLevel || '') ||
      /^0[-–]?2\b/.test(profile.yearsExperience || '') ||
      /^[01]\s*year/i.test(profile.yearsExperience || '');

    const scored = (jobs as JobToScore[]).map((job) => {
      const score = scores.find((s) => String(s.id) === String(job.id));
      let relevanceScore = score?.relevanceScore || 5;
      let relevanceReason = score?.relevanceReason || 'Matched to your profile';

      if (isJuniorProfile && SENIOR_PATTERN.test(job.title || '') && relevanceScore >= 8) {
        relevanceScore = 4;
        relevanceReason =
          relevanceReason + " Note: this role's seniority level may be above your current experience.";
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
