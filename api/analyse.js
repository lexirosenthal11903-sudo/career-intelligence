export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { cvText, direction, location, workStyle, empType, salary, extra } = req.body;

  const systemPrompt = `You are a career intelligence platform speaking directly to the user. You have read their background carefully and you are now giving them warm, personal, second-person guidance — as if a trusted advisor is talking to them, not writing a report about them.

Rules for the analysis:
- searchKeywords: 3-5 short job title keywords (e.g. ["marketing manager", "brand strategist"])
- locationSearch: location to search jobs in, defaulting to london if not specified
- Be specific and honest — no generic advice
- suggestedDirections: exactly 3 directions. The "why" for each must speak directly to the user — e.g. "You've spent three years building X, which means you already have Y. This direction would let you..." Not "The candidate has experience in X."
- summary: write in second person, directly to the user. E.g. "You've built a strong foundation in..." or "Your background spans..." — warm, honest, specific. Never "The candidate" or "They have."
- skills.advice: also second person and direct — "You're strongest when..." or "The gap to close first is..."
- companySuggestions[].why: explain to the user why that type of company suits them specifically — "You'd thrive here because..."
- CRITICAL: Always return exactly 4 skill gaps in the gaps array, no matter how strong the candidate. Structure them in tiers: (1) Foundation — a core skill they should solidify, (2) Intermediate — a skill that would meaningfully strengthen their profile, (3) Advanced — a skill that would make them exceptional in their target roles, (4) Future — a skill to develop over the next 1-2 years that opens new directions. Every person can always improve. Never return fewer than 4 gaps. Frame them positively as growth opportunities, not deficiencies.`;

  const userPrompt = `Please analyse my background carefully.
${cvText ? `CV:\n${cvText.slice(0, 8000)}` : ''}
${direction ? `Direction: ${direction}` : 'Direction: Not stated — infer from CV'}
${location ? `Location: ${location}` : ''}
${workStyle?.length ? `Work style: ${workStyle.join(', ')}` : ''}
${empType?.length ? `Employment type: ${empType.join(', ')}` : ''}
${salary ? `Salary: ${salary}` : ''}
${extra ? `Notes: ${extra}` : ''}`;

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
            valuesSignals:       { type: 'array',  items: { type: 'string' } },
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
                     'extractedSkills', 'suggestedDirections', 'summary', 'locationSearch', 'searchKeywords']
        },
        skills: {
          type: 'object',
          properties: {
            strengths: { type: 'array', items: { type: 'string' } },
            gaps: {
              type: 'array',
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
    console.log('[analyse] full input:', JSON.stringify(toolUse.input));

    const { profile, skills, companyValues, outreachContext } = toolUse.input;
    res.status(200).json({ profile, skills, companyValues, outreachContext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
