function buildUserProfileSection(p) {
  if (!p || typeof p !== 'object') return '';
  const lines = [];
  if ((p.values || []).length) lines.push(`Values: ${p.values.join(', ')}`);
  if (p.aspiration) lines.push(`Career aspiration (2-year goal): ${p.aspiration}`);
  if ((p.dealBreakers || []).length) lines.push(`Deal-breakers: ${p.dealBreakers.join(', ')}`);
  if (p.rightToWork) lines.push(`Right to work: ${p.rightToWork}`);
  if (p.salaryFloor || p.salaryCeiling) lines.push(`Salary range: ${p.salaryFloor || '?'} – ${p.salaryCeiling || '?'} ${p.currency || 'GBP'}`);
  if (p.workStyle?.preference) lines.push(`Work preference: ${p.workStyle.preference}`);
  if (p.workStyle?.teamSize) lines.push(`Preferred team size: ${p.workStyle.teamSize}`);
  if (p.workStyle?.companyStage) lines.push(`Preferred company stage: ${p.workStyle.companyStage}`);
  const sk = p.selfKnowledge || {};
  ['q1','q2','q3','q4','q5'].forEach((k, i) => {
    if (sk[k]) lines.push(`Self-knowledge Q${i+1}: ${sk[k]}`);
  });
  if (!lines.length) return '';
  return `\n\nUSER PROFILE (persistent preferences — factor these heavily into directions, company suggestions, and values signals):\n${lines.join('\n')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const enrichOnly = req.query?.enrichOnly === 'true';
  const { cvText, direction, location, workStyle, empType, salary, extra, selfKnowledge, profile: incomingProfile, userProfile } = req.body;

  // ── ENRICH-ONLY mode: fast re-analysis from questionnaire answers only ──────
  if (enrichOnly) {
    const p = incomingProfile || {};
    const selfSection = (selfKnowledge || []).map((a, i) => a ? `Q${i+1}: ${a}` : null).filter(Boolean).join('\n');

    const enrichTool = {
      name: 'submit_enrichment',
      description: 'Submit the enriched profile fields.',
      input_schema: {
        type: 'object',
        properties: {
          summary:             { type: 'string' },
          suggestedDirections: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, why: { type: 'string' } },
              required: ['title', 'why']
            }
          },
          valuesSignals:       { type: 'array', minItems: 4, items: { type: 'string' } },
          companySuggestions:  {
            type: 'array',
            items: {
              type: 'object',
              properties: { type: { type: 'string' }, why: { type: 'string' } },
              required: ['type', 'why']
            }
          }
        },
        required: ['summary', 'suggestedDirections', 'valuesSignals', 'companySuggestions']
      }
    };

    try {
      const enrichRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1500,
          system: `You are a career intelligence platform. Update this person's career profile using their self-knowledge answers. Write entirely in second person ("you", "your"). Be specific and personal — these answers reveal the person behind the CV. Return 3 suggestedDirections and 4-6 valuesSignals as specific sentence observations.`,
          tools: [enrichTool],
          tool_choice: { type: 'tool', name: 'submit_enrichment' },
          messages: [{
            role: 'user',
            content: `Current profile:
- Seniority: ${p.seniorityLevel || 'unknown'}
- Target roles: ${(p.topRoleTitles || []).join(', ')}
- Summary: ${(p.summary || '').slice(0, 200)}

Self-knowledge answers:
${selfSection}

Update the summary, directions, valuesSignals, and companySuggestions to reflect what these answers reveal about who this person really is and what they want.`
          }]
        })
      });
      const enrichData = await enrichRes.json();
      const enrichToolUse = enrichData.content?.find(b => b.type === 'tool_use' && b.name === 'submit_enrichment');
      if (!enrichToolUse?.input) {
        return res.status(500).json({ error: 'Enrichment tool not called', raw: enrichData.content });
      }
      return res.status(200).json({ profile: { ...p, ...enrichToolUse.input } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── FULL ANALYSIS ─────────────────────────────────────────────────────────────
  const systemPrompt = `You are a career intelligence platform speaking directly to the user. You have read their background carefully and you are now giving them warm, personal, second-person guidance — as if a trusted advisor is talking to them, not writing a report about them.

Rules for the analysis:
- searchKeywords: 3-5 short job title keywords (e.g. ["marketing manager", "brand strategist"])
- locationSearch: location to search jobs in, defaulting to london if not specified
- Be specific and honest — no generic advice
- suggestedDirections: exactly 3 directions. The "why" for each must speak directly to the user — e.g. "You've spent three years building X, which means you already have Y. This direction would let you..." Not "The candidate has experience in X."
- summary: write in second person, directly to the user. E.g. "You've built a strong foundation in..." or "Your background spans..." — warm, honest, specific. Never "The candidate" or "They have."
- skills.advice: also second person and direct — "You're strongest when..." or "The gap to close first is..."
- companySuggestions[].why: explain to the user why that type of company suits them specifically — "You'd thrive here because..."
- CRITICAL: The gaps array MUST contain exactly 4 items. No exceptions. Even the strongest candidate has skills to develop. If you think someone has no gaps, you are wrong — look harder. Use the four tiers: Foundation (something core to consolidate), Intermediate (something that would meaningfully strengthen them), Advanced (something that would make them exceptional), Future (something to develop over 1-2 years). Each gap MUST have skill, tier, why, and howToBuild with a real URL.
- If self-knowledge answers are provided, use them to make the summary, directions, and valuesSignals significantly more personal and specific. These answers reveal what the CV cannot — the person's actual motivations, natural strengths, and vision for their life. Weight them heavily.
- valuesSignals MUST always contain 4-6 specific observations about this person's character, work ethic, and values as revealed by their CV and questionnaire answers. Each signal should be a specific observation, not a generic trait. Example: "Chose postgraduate study over a full-time offer — prioritises long-term positioning over short-term gain" not just "Ambitious". Never return an empty valuesSignals array.
- TONE: Be honest and realistic, not falsely positive. If there are genuine gaps or challenges, name them clearly but constructively. The user is better served by accurate assessment than flattery. Think of yourself as a trusted advisor who respects the person enough to tell them the truth. Never butter someone up. Never say something is a strength if it isn't.
- In howToBuild for each skill gap, always include at least one specific named resource with its URL. Use real, free resources: Coursera (coursera.org), DataCamp (datacamp.com), Mode Analytics SQL tutorial (mode.com/sql-tutorial), LinkedIn Learning (linkedin.com/learning), Forage (theforage.com), Khan Academy (khanacademy.org). Format the URL plainly in the text, e.g. "Start with the Google Data Analytics course on coursera.org/professional-certificates/google-data-analytics".`;

  const selfKnowledgeSection = selfKnowledge?.length
    ? `\n\nSELF-KNOWLEDGE (what this person told us about themselves — use this to make the summary, directions, and values significantly more personal):\n${selfKnowledge.map((a, i) => a ? `Q${i+1}: ${a}` : null).filter(Boolean).join('\n')}`
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

  const tool = {
    name: 'submit_career_analysis',
    description: 'Submit the complete career analysis for the user.',
    input_schema: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            seniorityLevel:      { type: 'string' },
            yearsExperience:     { type: 'string' },
            topRoleTitles:       { type: 'array',  items: { type: 'string' } },
            extractedSectors:    { type: 'array',  items: { type: 'string' } },
            extractedSkills:     { type: 'array',  items: { type: 'string' } },
            suggestedDirections: {
              type: 'array',
              items: {
                type: 'object',
                properties: { title: { type: 'string' }, why: { type: 'string' } },
                required: ['title', 'why']
              }
            },
            valuesSignals: {
              type: 'array',
              description: 'Specific observations about this person\'s character and values as revealed by their background. Must contain 4-6 items. Each item is a full sentence observation, not a single word trait.',
              minItems: 4,
              items: { type: 'string' }
            },
            companySuggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: { type: { type: 'string' }, why: { type: 'string' } },
                required: ['type', 'why']
              }
            },
            summary:        { type: 'string' },
            locationSearch: { type: 'string' },
            searchKeywords: { type: 'array', items: { type: 'string' } }
          },
          required: ['seniorityLevel', 'yearsExperience', 'topRoleTitles', 'extractedSectors',
                     'extractedSkills', 'suggestedDirections', 'valuesSignals', 'summary', 'locationSearch', 'searchKeywords']
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
                  skill:      { type: 'string' },
                  tier:       { type: 'string' },
                  why:        { type: 'string' },
                  howToBuild: { type: 'string' }
                },
                required: ['skill', 'tier', 'why', 'howToBuild']
              }
            },
            advice: { type: 'string' }
          },
          required: ['strengths', 'gaps', 'advice']
        },
        companyValues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name:    { type: 'string' },
              why:     { type: 'string' },
              culture: { type: 'string' },
              values:  { type: 'array', items: { type: 'string' } },
              openRole:{ type: 'string' }
            },
            required: ['name', 'why']
          }
        },
        outreachContext: {
          type: 'object',
          properties: {
            tone:          { type: 'string' },
            keyStrengths:  { type: 'array', items: { type: 'string' } },
            uniqueAngle:   { type: 'string' }
          },
          required: ['tone', 'keyStrengths', 'uniqueAngle']
        }
      },
      required: ['profile', 'skills', 'companyValues', 'outreachContext']
    }
  };

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
        max_tokens: 4000,
        system: systemPrompt,
        tools: [tool],
        tool_choice: { type: 'tool', name: 'submit_career_analysis' },
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();

    if (data.error) { console.log("[analyse] Anthropic error:", JSON.stringify(data.error));
      return res.status(500).json({ error: data.error.message || 'API error' });
    }

    const toolUse = data.content?.find(b => b.type === 'tool_use' && b.name === 'submit_career_analysis');
    if (!toolUse || !toolUse.input) {
      return res.status(500).json({ error: 'Model did not call the analysis tool', raw: data.content });
    }

    let result = toolUse.input;

    console.log('[analyse] full input keys:', Object.keys(result));
    console.log('[analyse] skills:', JSON.stringify(result.skills));
    console.log('[analyse] skills.gaps raw:', JSON.stringify(result.skills?.gaps));

    // ── Skills fallback: if gaps are missing, run a focused second call ────────
    if (!result.skills?.gaps?.length) {
      console.log('[analyse] gaps missing — running fallback gap call');
      try {
        const profile = result.profile || {};
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
                    skill:      { type: 'string' },
                    tier:       { type: 'string' },
                    why:        { type: 'string' },
                    howToBuild: { type: 'string' }
                  },
                  required: ['skill', 'tier', 'why', 'howToBuild']
                }
              },
              advice: { type: 'string' }
            },
            required: ['strengths', 'gaps', 'advice']
          }
        };
        const gapRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 1500,
            system: 'You are a career coach. You MUST return exactly 4 skill gaps using tiers: Foundation, Intermediate, Advanced, Future. Every person has gaps. Include a real resource URL in each howToBuild.',
            tools: [gapTool],
            tool_choice: { type: 'tool', name: 'submit_gaps' },
            messages: [{
              role: 'user',
              content: `Give skill gaps for: ${profile.seniorityLevel || ''} with ${profile.yearsExperience || ''} experience. Target roles: ${(profile.topRoleTitles || []).join(', ')}. Skills: ${(profile.extractedSkills || []).slice(0, 8).join(', ')}.`
            }]
          })
        });
        const gapData = await gapRes.json();
        const gapToolUse = gapData.content?.find(b => b.type === 'tool_use' && b.name === 'submit_gaps');
        if (gapToolUse?.input) {
          console.log('[analyse] fallback gaps:', JSON.stringify(gapToolUse.input));
          result = { ...result, skills: gapToolUse.input };
        }
      } catch (gapErr) {
        console.log('[analyse] fallback gap call failed:', gapErr.message);
      }
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
