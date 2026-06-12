import { NextRequest, NextResponse } from 'next/server';
import { callClaude, findToolUse } from '@/lib/anthropic';
import { checkAnalyseRateLimit } from '@/lib/ratelimit';

// 60s = Vercel Hobby plan limit. Upgrade to Pro (300s) before launch to avoid
// timeout on longer CVs. SSE lets the user see phase events within that window.
export const maxDuration = 60;

interface UserProfile {
  values?: string[];
  aspiration?: string;
  dealBreakers?: string[];
  rightToWork?: string;
  salaryFloor?: number | string;
  salaryCeiling?: number | string;
  currency?: string;
  workStyle?: { preference?: string; teamSize?: string; companyStage?: string };
  selfKnowledge?: Record<string, string>;
}

interface AnalysisProfile {
  seniorityLevel?: string;
  yearsExperience?: string;
  topRoleTitles?: string[];
  extractedSkills?: string[];
  summary?: string;
  [key: string]: unknown;
}

function buildUserProfileSection(p: UserProfile | undefined): string {
  if (!p || typeof p !== 'object') return '';
  const lines: string[] = [];
  if ((p.values || []).length) lines.push(`Values: ${p.values!.join(', ')}`);
  if (p.aspiration) lines.push(`Career aspiration (2-year goal): ${p.aspiration}`);
  if ((p.dealBreakers || []).length) lines.push(`Deal-breakers: ${p.dealBreakers!.join(', ')}`);
  if (p.rightToWork) lines.push(`Right to work: ${p.rightToWork}`);
  if (p.salaryFloor || p.salaryCeiling)
    lines.push(
      `Salary range: ${p.salaryFloor || '?'} – ${p.salaryCeiling || '?'} ${p.currency || 'GBP'}`
    );
  if (p.workStyle?.preference) lines.push(`Work preference: ${p.workStyle.preference}`);
  if (p.workStyle?.teamSize) lines.push(`Preferred team size: ${p.workStyle.teamSize}`);
  if (p.workStyle?.companyStage) lines.push(`Preferred company stage: ${p.workStyle.companyStage}`);
  const sk = p.selfKnowledge || {};
  (['q1', 'q2', 'q3', 'q4', 'q5'] as const).forEach((k, i) => {
    if (sk[k]) lines.push(`Self-knowledge Q${i + 1}: ${sk[k]}`);
  });
  if (!lines.length) return '';
  return `\n\nUSER PROFILE (persistent preferences — factor these heavily into directions, company suggestions, and values signals):\n${lines.join('\n')}`;
}

const enrichTool = {
  name: 'submit_enrichment',
  description: 'Submit the enriched profile fields.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      suggestedDirections: {
        type: 'array',
        items: {
          type: 'object',
          properties: { title: { type: 'string' }, why: { type: 'string' } },
          required: ['title', 'why'],
        },
      },
      valuesSignals: { type: 'array', minItems: 4, items: { type: 'string' } },
      companySuggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: { type: { type: 'string' }, why: { type: 'string' } },
          required: ['type', 'why'],
        },
      },
    },
    required: ['summary', 'suggestedDirections', 'valuesSignals', 'companySuggestions'],
  },
};

const analysisTool = {
  name: 'submit_career_analysis',
  description: 'Submit the complete career analysis for the user.',
  input_schema: {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: {
          seniorityLevel: { type: 'string' },
          yearsExperience: { type: 'string' },
          topRoleTitles: { type: 'array', items: { type: 'string' } },
          extractedSectors: { type: 'array', items: { type: 'string' } },
          extractedSkills: { type: 'array', items: { type: 'string' } },
          suggestedDirections: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, why: { type: 'string' } },
              required: ['title', 'why'],
            },
          },
          valuesSignals: {
            type: 'array',
            description:
              "Specific observations about this person's character and values as revealed by their background. Must contain 4-6 items. Each item is a full sentence observation, not a single word trait.",
            minItems: 4,
            items: { type: 'string' },
          },
          companySuggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: { type: { type: 'string' }, why: { type: 'string' } },
              required: ['type', 'why'],
            },
          },
          summary: { type: 'string' },
          locationSearch: { type: 'string' },
          searchKeywords: {
            type: 'array',
            minItems: 5,
            maxItems: 5,
            items: {
              type: 'string',
              description:
                'A short job title keyword suitable for a UK job search — e.g. "marketing manager", "strategy analyst", "product manager"',
            },
            description: 'Exactly 5 job title search keywords for this person. Must be 5, no fewer.',
          },
        },
        required: [
          'seniorityLevel',
          'yearsExperience',
          'topRoleTitles',
          'extractedSectors',
          'extractedSkills',
          'suggestedDirections',
          'valuesSignals',
          'summary',
          'locationSearch',
          'searchKeywords',
        ],
      },
      skills: {
        type: 'object',
        properties: {
          strengths: { type: 'array', items: { type: 'string' } },
          gaps: {
            type: 'array',
            minItems: 4,
            items: {
              type: 'object',
              properties: {
                skill: { type: 'string' },
                tier: { type: 'string' },
                why: { type: 'string' },
                howToBuild: { type: 'string' },
              },
              required: ['skill', 'tier', 'why', 'howToBuild'],
            },
          },
          advice: { type: 'string' },
        },
        required: ['strengths', 'gaps', 'advice'],
      },
      companyValues: {
        type: 'array',
        description:
          '3 to 5 real, named UK employers (not recruitment agencies) that genuinely suit this person based on their CV, values, and direction. Use actual company names only.',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description:
                'The real, specific name of the employer — e.g. Monzo, Bain and Company, Penguin Random House. Never a recruitment agency.',
            },
            why: {
              type: 'string',
              description:
                'Why this specific company suits this person — reference something specific about the company and something specific from their CV.',
            },
            culture: {
              type: 'string',
              description: "One sentence on the company's working culture and environment.",
            },
            values: {
              type: 'array',
              description: '3 to 5 values or traits this company is known for.',
              items: { type: 'string' },
            },
            openRole: {
              type: 'string',
              description:
                'A realistic job title this person could apply for at this company given their background.',
            },
          },
          required: ['name', 'why'],
        },
      },
      outreachContext: {
        type: 'object',
        properties: {
          tone: { type: 'string' },
          keyStrengths: { type: 'array', items: { type: 'string' } },
          uniqueAngle: { type: 'string' },
        },
        required: ['tone', 'keyStrengths', 'uniqueAngle'],
      },
    },
    required: ['profile', 'skills', 'companyValues', 'outreachContext'],
  },
};

const gapTool = {
  name: 'submit_gaps',
  description: 'Submit exactly 4 skill gaps.',
  input_schema: {
    type: 'object',
    properties: {
      strengths: { type: 'array', items: { type: 'string' } },
      gaps: {
        type: 'array',
        minItems: 4,
        items: {
          type: 'object',
          properties: {
            skill: { type: 'string' },
            tier: { type: 'string' },
            why: { type: 'string' },
            howToBuild: { type: 'string' },
          },
          required: ['skill', 'tier', 'why', 'howToBuild'],
        },
      },
      advice: { type: 'string' },
    },
    required: ['strengths', 'gaps', 'advice'],
  },
};

const SYSTEM_PROMPT = `You are a career intelligence platform speaking directly to the user. You have read their background carefully and you are now giving them warm, personal, second-person guidance — as if a trusted advisor is talking to them, not writing a report about them.

Rules for the analysis:
- searchKeywords: exactly 5 short job title keywords for UK job search (e.g. ["marketing manager", "brand strategist", "strategy consultant", "operations analyst", "project manager"])
- locationSearch: location to search jobs in, defaulting to london if not specified
- Be specific and honest — no generic advice
- suggestedDirections: exactly 3 directions. The "why" for each must speak directly to the user — e.g. "You've spent three years building X, which means you already have Y. This direction would let you..." Not "The candidate has experience in X."
- summary: write in second person, directly to the user. E.g. "You've built a strong foundation in..." or "Your background spans..." — warm, honest, specific. Never "The candidate" or "They have."
- skills.advice: also second person and direct — "You're strongest when..." or "The gap to close first is..."
- companySuggestions[].why: explain to the user why that type of company suits them specifically — "You'd thrive here because..."
- companyValues[]: name 3 to 5 real UK employers by name that suit this person. Never include recruitment agencies, staffing firms, or job boards. Each must be a real organisation this person could actually apply to.
- CRITICAL: The gaps array MUST contain exactly 4 items. No exceptions. Even the strongest candidate has skills to develop. If you think someone has no gaps, you are wrong — look harder. Use the four tiers: Foundation (something core to consolidate), Intermediate (something that would meaningfully strengthen them), Advanced (something that would make them exceptional), Future (something to develop over 1-2 years). Each gap MUST have skill, tier, why, and howToBuild with a real URL.
- If self-knowledge answers are provided, use them to make the summary, directions, and valuesSignals significantly more personal and specific. These answers reveal what the CV cannot — the person's actual motivations, natural strengths, and vision for their life. Weight them heavily.
- valuesSignals MUST always contain 4-6 specific observations about this person's character, work ethic, and values as revealed by their CV and questionnaire answers. Each signal should be a specific observation, not a generic trait. Example: "Chose postgraduate study over a full-time offer — prioritises long-term positioning over short-term gain" not just "Ambitious". Never return an empty valuesSignals array.
- TONE: Be honest and realistic, not falsely positive. If there are genuine gaps or challenges, name them clearly but constructively. The user is better served by accurate assessment than flattery. Think of yourself as a trusted advisor who respects the person enough to tell them the truth. Never butter someone up. Never say something is a strength if it isn't.
- In howToBuild for each skill gap, always include at least one specific named resource with its URL. Use real, free resources: Coursera (coursera.org), DataCamp (datacamp.com), Mode Analytics SQL tutorial (mode.com/sql-tutorial), LinkedIn Learning (linkedin.com/learning), Forage (theforage.com), Khan Academy (khanacademy.org). Format the URL plainly in the text, e.g. "Start with the Google Data Analytics course on coursera.org/professional-certificates/google-data-analytics".`;

function sseChunk(encoder: TextEncoder, obj: object): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);
}

export async function POST(request: NextRequest) {
  const enrichOnly = request.nextUrl.searchParams.get('enrichOnly') === 'true';

  interface AnalyseBody {
    cvText?: string;
    direction?: string;
    location?: string;
    workStyle?: string[];
    empType?: string[];
    salary?: string;
    extra?: string;
    selfKnowledge?: string[];
    profile?: AnalysisProfile;
    userProfile?: UserProfile;
  }

  const rateLimitResponse = await checkAnalyseRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  let body: AnalyseBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const {
    cvText,
    direction,
    location,
    workStyle,
    empType,
    salary,
    extra,
    selfKnowledge,
    profile: incomingProfile,
    userProfile,
  } = body;

  // ── ENRICH-ONLY mode: fast re-analysis from questionnaire answers only ──────
  if (enrichOnly) {
    const p: AnalysisProfile = incomingProfile || {};
    const selfSection = ((selfKnowledge || []) as string[])
      .map((a, i) => (a ? `Q${i + 1}: ${a}` : null))
      .filter(Boolean)
      .join('\n');

    try {
      const enrichRes = await callClaude({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: `You are a career intelligence platform. Update this person's career profile using their self-knowledge answers. Write entirely in second person ("you", "your"). Be specific and personal — these answers reveal the person behind the CV. Return 3 suggestedDirections and 4-6 valuesSignals as specific sentence observations.`,
        tools: [enrichTool],
        tool_choice: { type: 'tool', name: 'submit_enrichment' },
        messages: [
          {
            role: 'user',
            content: `Current profile:
- Seniority: ${p.seniorityLevel || 'unknown'}
- Target roles: ${(p.topRoleTitles || []).join(', ')}
- Summary: ${(p.summary || '').slice(0, 200)}

Self-knowledge answers:
${selfSection}

Update the summary, directions, valuesSignals, and companySuggestions to reflect what these answers reveal about who this person really is and what they want.`,
          },
        ],
      });
      const enrichData = await enrichRes.json();
      const enrichInput = findToolUse(enrichData.content, 'submit_enrichment');
      if (!enrichInput) {
        return NextResponse.json(
          { error: 'Enrichment tool not called', raw: enrichData.content },
          { status: 500 }
        );
      }
      return NextResponse.json({ profile: { ...p, ...enrichInput } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── FULL ANALYSIS — SSE streaming ───────────────────────────────────────────
  if (!cvText?.trim() && !direction?.trim()) {
    return NextResponse.json(
      { error: 'Provide a CV or a direction to analyse.' },
      { status: 400 }
    );
  }

  const selfKnowledgeSection = selfKnowledge?.length
    ? `\n\nSELF-KNOWLEDGE (what this person told us about themselves — use this to make the summary, directions, and values significantly more personal):\n${(selfKnowledge as string[])
        .map((a, i) => (a ? `Q${i + 1}: ${a}` : null))
        .filter(Boolean)
        .join('\n')}`
    : '';

  const userProfileSection = userProfile ? buildUserProfileSection(userProfile) : '';

  const userPrompt = `Please analyse my background carefully.
${cvText ? `CV:\n${cvText.slice(0, 8000)}` : ''}
${direction ? `Direction: ${direction}` : 'Direction: Not stated — infer from CV'}
${location ? `Location: ${location}` : ''}
${workStyle?.length ? `Work style: ${workStyle.join(', ')}` : ''}
${empType?.length ? `Employment type: ${empType.join(', ')}` : ''}
${salary ? `Salary: ${salary}` : ''}
${extra ? `Notes: ${extra}` : ''}${selfKnowledgeSection}${userProfileSection}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(sseChunk(encoder, { event: 'phase', phase: 'reading' }));

        const response = await callClaude({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          tools: [analysisTool],
          tool_choice: { type: 'tool', name: 'submit_career_analysis' },
          messages: [{ role: 'user', content: userPrompt }],
        });

        controller.enqueue(sseChunk(encoder, { event: 'phase', phase: 'analysing' }));

        const data = await response.json();

        if (data.error) {
          controller.enqueue(sseChunk(encoder, { event: 'error', message: data.error.message || 'API error' }));
          controller.close();
          return;
        }

        const toolInput = findToolUse(data.content, 'submit_career_analysis');
        if (!toolInput) {
          controller.enqueue(sseChunk(encoder, { event: 'error', message: 'Analysis did not complete' }));
          controller.close();
          return;
        }

        let result = toolInput as {
          profile?: AnalysisProfile;
          skills?: { gaps?: unknown[] };
          [key: string]: unknown;
        };

        // Skills fallback: if gaps are missing, run a focused second call
        if (!result.skills?.gaps?.length) {
          try {
            const profile = result.profile || {};
            const gapRes = await callClaude({
              model: 'claude-sonnet-4-6',
              max_tokens: 1200,
              system:
                'You are a career coach. You MUST return exactly 4 skill gaps using tiers: Foundation, Intermediate, Advanced, Future. Every person has gaps. Include a real resource URL in each howToBuild.',
              tools: [gapTool],
              tool_choice: { type: 'tool', name: 'submit_gaps' },
              messages: [
                {
                  role: 'user',
                  content: `Give skill gaps for: ${profile.seniorityLevel || ''} with ${profile.yearsExperience || ''} experience. Target roles: ${(profile.topRoleTitles || []).join(', ')}. Skills: ${(profile.extractedSkills || []).slice(0, 8).join(', ')}.`,
                },
              ],
            });
            const gapData = await gapRes.json();
            const gapInput = findToolUse(gapData.content, 'submit_gaps');
            if (gapInput) {
              result = { ...result, skills: gapInput as { gaps?: unknown[] } };
            }
          } catch {
            // fallback gap call failed — continue with original result
          }
        }

        controller.enqueue(sseChunk(encoder, { event: 'complete', result }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(sseChunk(encoder, { event: 'error', message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
