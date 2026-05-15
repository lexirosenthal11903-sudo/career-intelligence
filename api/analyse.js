export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { cvText, direction, location, workStyle, empType, salary, extra } = req.body;

  const systemPrompt = `You are a career intelligence platform. Read the person's background carefully and extract structured insight. Be warm, precise, and honest. Do not rush.

Return ONLY a valid JSON object with this exact structure — no markdown, no backticks, no preamble:

{
  "profile": {
    "seniorityLevel": string,
    "yearsExperience": string,
    "topRoleTitles": [string],
    "extractedSectors": [string],
    "extractedSkills": [string],
    "suggestedDirections": [{ "title": string, "why": string }],
    "valuesSignals": [string],
    "companySuggestions": [{ "type": string, "why": string }],
    "summary": string,
    "locationSearch": string,
    "searchKeywords": [string]
  },
  "skills": {
    "strengths": [string],
    "gaps": [{ "skill": string, "why": string, "howToBuild": string }],
    "advice": string
  },
  "companyValues": [
    {
      "name": string,
      "why": string,
      "culture": string,
      "values": [string],
      "openRole": string
    }
  ],
  "outreachContext": {
    "tone": string,
    "keyStrengths": [string],
    "uniqueAngle": string
  }
}

Rules:
- searchKeywords: 3-5 short job title keywords to search for (e.g. ["marketing manager", "brand strategist"])
- locationSearch: the location to search jobs in, defaulting to UK if not specified
- Be specific and honest — no generic advice
- suggestedDirections: exactly 3 directions with clear reasoning`;

  const userPrompt = `Please analyse my background carefully.

${cvText ? `CV:\n${cvText.slice(0, 8000)}` : ''}
${direction ? `Direction: ${direction}` : 'Direction: Not stated — infer from CV'}
${location ? `Location: ${location}` : ''}
${workStyle?.length ? `Work style: ${workStyle.join(', ')}` : ''}
${empType?.length ? `Employment type: ${empType.join(', ')}` : ''}
${salary ? `Salary: ${salary}` : ''}
${extra ? `Notes: ${extra}` : ''}`;

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
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';

    let parsed;
    try {
      const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const start = clean.indexOf('{');
      if (start === -1) throw new Error('No JSON found');
      // Find the matching closing brace
      let depth = 0, end = -1;
      for (let i = start; i < clean.length; i++) {
        if (clean[i] === '{') depth++;
        else if (clean[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end === -1) throw new Error('Incomplete JSON');
      parsed = JSON.parse(clean.slice(start, end + 1));
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse analysis response', raw: text });
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
