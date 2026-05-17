export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { cvText, direction, location, workStyle, empType, salary, extra, selfKnowledge } = req.body;

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

  const userPrompt = `Please analyse my background carefully.
${cvText ? `CV:\n${cvText.slice(0, 8000)}` : ''}
${direction ? `Direction: ${direction}` : 'Direction: Not stated — infer from CV'}
${location ? `Location: ${location}` : ''}
${workStyle?.length ? `Work style: ${workStyle.join(', ')}` : ''}
${empType?.length ? `Employment type: ${empType.join(', ')}` : ''}
${salary ? `Salary: ${salary}` : ''}
${extra ? `Notes: ${extra}` : ''}${selfKnowledgeSection}`;

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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: systemPrompt,
        tools: [tool],
        tool_choice: { type: 'tool', name: 'submit_career_analysis' },
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'API error' });
    }

    const toolUse = data.content?.find(b => b.type === 'tool_use' && b.name === 'submit_career_analysis');
    if (!toolUse || !toolUse.input) {
      return res.status(500).json({ error: 'Model did not call the analysis tool', raw: data.content });
    }

    console.log('[analyse] full input keys:', Object.keys(toolUse.input));
    console.log('[analyse] skills:', JSON.stringify(toolUse.input.skills));
    console.log('[analyse] skills.gaps raw:', JSON.stringify(toolUse.input?.skills?.gaps));
    console.log('[analyse] full input:', JSON.stringify(toolUse.input));

    const { profile, skills, companyValues, outreachContext } = toolUse.input;
    res.status(200).json({ profile, skills, companyValues, outreachContext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
