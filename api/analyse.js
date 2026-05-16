export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { cvText, direction, location, workStyle, empType, salary, extra } = req.body;

  const systemPrompt = `IMPORTANT: Your response must be raw JSON only. Do not use markdown. Do not use code blocks. Do not use backticks. Start with { and end with }. Any other formatting will cause a critical error.

You are a career intelligence platform speaking directly to the user. You have read their background carefully and you are now giving them warm, personal, second-person guidance — as if a trusted advisor is talking to them, not writing a report about them.

CRITICAL FORMATTING RULE: Return ONLY a valid JSON object. Do not use markdown. Do not use backticks. Do not write anything before or after the JSON. Your entire response must start with { and end with }

The JSON must have this exact structure:
{
  "profile": {
    "seniorityLevel": "string",
    "yearsExperience": "string",
    "topRoleTitles": ["string"],
    "extractedSectors": ["string"],
    "extractedSkills": ["string"],
    "suggestedDirections": [{ "title": "string", "why": "string" }],
    "valuesSignals": ["string"],
    "companySuggestions": [{ "type": "string", "why": "string" }],
    "summary": "string",
    "locationSearch": "string",
    "searchKeywords": ["string"]
  },
  "skills": {
    "strengths": ["string"],
    "gaps": [{ "skill": "string", "why": "string", "howToBuild": "string" }],
    "advice": "string"
  },
  "companyValues": [
    {
      "name": "string",
      "why": "string",
      "culture": "string",
      "values": ["string"],
      "openRole": "string"
    }
  ],
  "outreachContext": {
    "tone": "string",
    "keyStrengths": ["string"],
    "uniqueAngle": "string"
  }
}

Rules:
- searchKeywords: 3-5 short job title keywords (e.g. ["marketing manager", "brand strategist"])
- locationSearch: location to search jobs in, defaulting to london if not specified
- Be specific and honest — no generic advice
- suggestedDirections: exactly 3 directions. The "why" for each must speak directly to the user — e.g. "You've spent three years building X, which means you already have Y. This direction would let you..." Not "The candidate has experience in X."
- summary: write in second person, directly to the user. E.g. "You've built a strong foundation in..." or "Your background spans..." — warm, honest, specific. Never "The candidate" or "They have."
- skills.advice: also second person and direct — "You're strongest when..." or "The gap to close first is..."
- companySuggestions[].why: explain to the user why that type of company suits them specifically — "You'd thrive here because..."
- Start your response with { and nothing else`;

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
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'API error' });
    }

    const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';

    let parsed;
    try {
      let clean = text;
      // Strip markdown code blocks
      clean = clean.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      // Find the first { and match to its closing }
      const start = clean.indexOf('{');
      if (start === -1) throw new Error('No JSON object found');
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
