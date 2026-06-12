import { NextRequest, NextResponse } from 'next/server';
import { callClaude, findToolUse } from '@/lib/anthropic';
import { checkAnalyseRateLimit } from '@/lib/ratelimit';

// Architecture: two parallel Anthropic calls so neither exceeds ~1,200 output tokens.
// Single calls >1,200 tokens risk Vercel Hobby's 60s timeout on slow API days.
// Call 1: profile (~700 tokens) — directions, searchKeywords, summary
// Call 2: details (~1,100 tokens) — skills, companyValues, outreachContext
// Both run in parallel; complete event fires when both finish (~25s average).
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
    lines.push(`Salary range: ${p.salaryFloor || '?'} – ${p.salaryCeiling || '?'} ${p.currency || 'GBP'}`);
  if (p.workStyle?.preference) lines.push(`Work preference: ${p.workStyle.preference}`);
  if (p.workStyle?.teamSize) lines.push(`Preferred team size: ${p.workStyle.teamSize}`);
  if (p.workStyle?.companyStage) lines.push(`Preferred company stage: ${p.workStyle.companyStage}`);
  const sk = p.selfKnowledge || {};
  (['q1', 'q2', 'q3', 'q4', 'q5'] as const).forEach((k, i) => {
    if (sk[k]) lines.push(`Self-knowledge Q${i + 1}: ${sk[k]}`);
  });
  if (!lines.length) return '';
  return `\n\nUSER PROFILE:\n${lines.join('\n')}`;
}

// ── Tool 1: profile (~700 output tokens) ─────────────────────────────────────
const profileTool = {
  name: 'submit_career_profile',
  description: 'Submit the career profile section of the analysis.',
  input_schema: {
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
        description: 'Specific observations about this person\'s character and values. Must contain 4-6 items. Each item is a full sentence, not a single word trait.',
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
        maxItems: 8,
        items: {
          type: 'string',
          description: 'Short 1-3 word term for Adzuna UK job search. Must be broad enough to return results — never a long phrase.',
        },
        description: 'Generate a diverse mix: 2 specific role-title terms (e.g. "acquisitions coordinator", "content executive"), 2 industry/sector terms (e.g. "media", "broadcast"), 1-2 transferable function terms (e.g. "coordinator", "licensing"). Maximum 3 words per term.',
      },
    },
    required: [
      'seniorityLevel', 'yearsExperience', 'topRoleTitles', 'extractedSectors',
      'extractedSkills', 'suggestedDirections', 'valuesSignals', 'summary',
      'locationSearch', 'searchKeywords',
    ],
  },
};

// ── Tool 2: details (~1,100 output tokens) ────────────────────────────────────
const detailsTool = {
  name: 'submit_career_details',
  description: 'Submit the skills, company values, and outreach context.',
  input_schema: {
    type: 'object',
    properties: {
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
        description: '3 to 5 real, named UK employers that genuinely suit this person. Never recruitment agencies.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            why: { type: 'string' },
            culture: { type: 'string' },
            values: { type: 'array', items: { type: 'string' } },
            openRole: { type: 'string' },
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
    required: ['skills', 'companyValues', 'outreachContext'],
  },
};

// ── Enrich-only tool (unchanged) ──────────────────────────────────────────────
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

const PROFILE_SYSTEM = `You are a career intelligence platform speaking directly to the user. Analyse their background and produce their career profile.

Rules:
- searchKeywords: 5-8 search terms for Adzuna UK job board. CRITICAL: max 3 words each. Mix role titles ("acquisitions coordinator"), industry terms ("media", "broadcast"), and function terms ("licensing", "coordinator"). Good: "acquisitions", "content media", "broadcast coordinator". Bad: "Content Acquisitions & Licensing Assistant". Terms must be short and common enough to return real listings.
- locationSearch: default to "london" if not specified
- suggestedDirections: exactly 3. The "why" for each speaks directly to the user — "You've spent three years building X..."
- summary: second person, warm, honest, specific. Never "The candidate".
- valuesSignals: 4-6 specific sentence observations about character and values from their background. Never generic traits.
- companySuggestions: types of company that suit them, with why.
- Be honest, not falsely positive.
- If self-knowledge answers are provided, weight them heavily in summary, directions, and valuesSignals.`;

const DETAILS_SYSTEM = `You are a career intelligence platform. Analyse this person's background and produce their skills assessment, company matches, and outreach context.

Rules:
- skills.gaps: MUST contain exactly 4 items. Use tiers: Foundation, Intermediate, Advanced, Future. Include one specific named resource URL in each howToBuild.
- companyValues: 3 to 5 real, named UK employers (not agencies). Reference something specific from their CV in each "why".
- outreachContext: tone, key strengths, and unique angle for outreach.
- Be honest and realistic. Name genuine gaps constructively.
- Free resources for howToBuild: coursera.org, datacamp.com, mode.com/sql-tutorial, linkedin.com/learning, theforage.com, khanacademy.org.`;

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

  const { cvText, direction, location, workStyle, empType, salary, extra, selfKnowledge, profile: incomingProfile, userProfile } = body;

  // ── ENRICH-ONLY mode ──────────────────────────────────────────────────────
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
        system: `You are a career intelligence platform. Update this person's career profile using their self-knowledge answers. Write entirely in second person. Be specific and personal. Return 3 suggestedDirections and 4-6 valuesSignals as specific sentence observations.`,
        tools: [enrichTool],
        tool_choice: { type: 'tool', name: 'submit_enrichment' },
        messages: [{
          role: 'user',
          content: `Current profile:\n- Seniority: ${p.seniorityLevel || 'unknown'}\n- Target roles: ${(p.topRoleTitles || []).join(', ')}\n- Summary: ${(p.summary || '').slice(0, 200)}\n\nSelf-knowledge answers:\n${selfSection}\n\nUpdate the summary, directions, valuesSignals, and companySuggestions.`,
        }],
      });
      const enrichData = await enrichRes.json();
      const enrichInput = findToolUse(enrichData.content, 'submit_enrichment');
      if (!enrichInput) return NextResponse.json({ error: 'Enrichment tool not called', raw: enrichData.content }, { status: 500 });
      return NextResponse.json({ profile: { ...p, ...enrichInput } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── FULL ANALYSIS — two parallel SSE calls ────────────────────────────────
  if (!cvText?.trim() && !direction?.trim()) {
    return NextResponse.json({ error: 'Provide a CV or a direction to analyse.' }, { status: 400 });
  }

  const selfKnowledgeSection = selfKnowledge?.length
    ? `\n\nSELF-KNOWLEDGE (weight heavily for summary, directions, values):\n${(selfKnowledge as string[]).map((a, i) => (a ? `Q${i + 1}: ${a}` : null)).filter(Boolean).join('\n')}`
    : '';

  const userProfileSection = userProfile ? buildUserProfileSection(userProfile) : '';

  const userPrompt = `Please analyse my background carefully.
${cvText ? `CV:\n${cvText.slice(0, 3000)}` : ''}
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

        // Run both calls in parallel — neither exceeds ~1,200 output tokens
        const [profileRes, detailsRes] = await Promise.all([
          callClaude({
            model: 'claude-sonnet-4-6',
            max_tokens: 1200,
            system: PROFILE_SYSTEM,
            tools: [profileTool],
            tool_choice: { type: 'tool', name: 'submit_career_profile' },
            messages: [{ role: 'user', content: userPrompt }],
          }),
          callClaude({
            model: 'claude-sonnet-4-6',
            max_tokens: 1800,
            system: DETAILS_SYSTEM,
            tools: [detailsTool],
            tool_choice: { type: 'tool', name: 'submit_career_details' },
            messages: [{ role: 'user', content: userPrompt }],
          }),
        ]);

        controller.enqueue(sseChunk(encoder, { event: 'phase', phase: 'analysing' }));

        const [profileData, detailsData] = await Promise.all([
          profileRes.json(),
          detailsRes.json(),
        ]);

        if (profileData.error || detailsData.error) {
          const msg = profileData.error?.message || detailsData.error?.message || 'API error';
          controller.enqueue(sseChunk(encoder, { event: 'error', message: msg }));
          controller.close();
          return;
        }

        const profileInput = findToolUse(profileData.content, 'submit_career_profile');
        const detailsInput = findToolUse(detailsData.content, 'submit_career_details');

        if (!profileInput) {
          controller.enqueue(sseChunk(encoder, { event: 'error', message: 'Profile analysis did not complete' }));
          controller.close();
          return;
        }

        // Merge into the same shape as before — downstream code unchanged
        const result = {
          profile: profileInput,
          skills: detailsInput?.skills ?? { strengths: [], gaps: [], advice: '' },
          companyValues: detailsInput?.companyValues ?? [],
          outreachContext: detailsInput?.outreachContext ?? { tone: '', keyStrengths: [], uniqueAngle: '' },
        };

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
