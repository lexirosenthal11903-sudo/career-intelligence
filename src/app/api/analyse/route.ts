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
      'seniorityLevel', 'yearsExperience', 'locationSearch', 'searchKeywords',
      'topRoleTitles', 'extractedSectors', 'extractedSkills',
      'suggestedDirections', 'summary', 'valuesSignals', 'companySuggestions',
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

SPECIFICITY RULES — these override everything else:
- Every suggestedDirection.why MUST cite specific evidence from the CV: named employers, actual job titles held, real years of experience, specific achievements or projects. "You've spent three years doing X at Y" not "You have a strong background in X". If you cannot cite specific evidence, do not make the claim.
- For candidates with limited work history (students, recent graduates with minimal professional experience): anchor evidence in degree subject and institution, dissertation or project work, extracurricular leadership, self-knowledge answers, or stated aspirations. Never invent experience that isn't there. A politics dissertation on housing policy is better evidence than "your academic background."
- Every valuesSignal MUST be an observation that could only be written about this specific person — not any ambitious graduate. Start each one with "You". Reference something concrete from their history. Write in the voice of a trusted mentor who just finished reading this CV: warm, economical, direct. Specific enough that a different person reading it would know it wasn't written about them.
- summary: write it so that if sent to a different user, it would be obviously wrong. Name their actual background, actual roles, actual sector. Never "The candidate". Second person. Warm, honest, economical.

DIRECTIONS RULES:
- suggestedDirections: exactly 3. At least one must expand beyond what the candidate stated or obviously fits — propose an adjacent direction they may not have considered. The "why" for this unexpected direction must acknowledge the surprise: "This might not have been on your radar, but..." or "You probably haven't thought about this, but..." — framing it as discovery, not confusion.
- When a candidate is making a significant pivot away from their background (different sector, non-traditional route into a competitive field): name the competitive reality honestly in the relevant direction's "why". Who they'd be competing against, what those candidates typically have that this person doesn't, and what concrete action addresses that gap. Tone: honest about the challenge, specific about the path forward. Never false optimism. Never pure discouragement. "This is the direction — here's what you're up against, and here's what to do about it."
- CRITICAL: each direction "why" must be exactly 3 sentences. No more. Cite specific evidence in sentence 1, name the honest challenge in sentence 2, give the concrete path forward in sentence 3.

KEYWORD RULES:
- searchKeywords: 5-8 terms for Adzuna UK. CRITICAL: max 3 words each. Must be short enough to return real results.
- Adapt keyword strategy to the person's sector:
  - Commercial/consulting/finance: job title terms + function terms (e.g. "analyst", "strategy", "operations")
  - Creative/media/entertainment: use specific format terms — "television production", "radio", "content production", "film", "publishing", "licensing", "digital media". Do NOT use "broadcast" alone — it returns AV/transmission engineering roles, not editorial or creative. NEVER use bare "production" as a keyword — it returns factory and manufacturing jobs. Always qualify: "television production", "film production", "content production".
  - Charity/NGO/social sector: use "programme", "impact", "fundraising", "charity", "advocacy", "community"
  - Public sector/policy: use "policy", "research", "government", "public sector"
  - Technology: use "product", "data", "growth", "engineering"
  - Academic-adjacent: use "research", "think tank", "knowledge", "publishing"
- CRITICAL seniority rule: if seniorityLevel contains "Graduate" or "Entry" OR yearsExperience is 0-2 years: ALL role-title keywords MUST start with "junior", "graduate", or "assistant" (e.g. "junior analyst", "graduate consultant", "assistant coordinator"). Never include a bare role title like "analyst" or "consultant" for a graduate profile — it will return senior roles.
- locationSearch: default to "london" if not specified.

OTHER RULES:
- companySuggestions: types of company (not named employers) that suit this person, with a specific why anchored to their background.
- Be honest, not falsely positive.
- If self-knowledge answers are provided, weight them heavily in summary, directions, and valuesSignals.`;

const DETAILS_SYSTEM = `You are a career intelligence platform. Analyse this person's background and produce their skills assessment, company matches, and outreach context.

Rules:
- skills.gaps: MUST contain exactly 4 items. Use tiers: Foundation, Intermediate, Advanced, Future. Include one specific named resource URL in each howToBuild. The "why" for each gap must reference this person's specific background — why this gap matters for the roles they're heading toward.
- companyValues: 3 to 5 real, named UK employers (not agencies). Reference something specific from their CV in each "why" — a named skill, past employer, or stated value. Never generic praise.
- outreachContext: tone, key strengths, and unique angle for outreach. The uniqueAngle must be something that genuinely distinguishes this person — not a generic positive.
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

        // Profile call on Haiku (fast, structured output — directions/keywords/signals)
        // Details call on Sonnet (richer reasoning — skills gaps, company matches)
        // Parallel execution; Haiku finishes first, total time well within 60s
        const [profileRes, detailsRes] = await Promise.all([
          callClaude({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1600,
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
