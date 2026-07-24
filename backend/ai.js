import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
const OPENROUTER_BASE_URL = String(process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');

export async function generateAIContent(prompt, systemPrompt = '') {
  if (!OPENROUTER_API_KEY) {
    const err = new Error('AI service not configured (OPENROUTER_API_KEY missing)');
    err.statusCode = 503;
    throw err;
  }
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'Museum Manager AI'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'OpenRouter API error');
    }
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
}

export function parseAIJson(raw) {
  // Strategy 1: direct JSON parse
  try { return JSON.parse(raw); } catch {}

  // Strategy 2: extract markdown JSON block
  const blockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (blockMatch) {
    try { return JSON.parse(blockMatch[1].trim()); } catch {}
  }

  // Strategy 3: find outermost { } or [ ]
  const objMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objMatch) {
    try { return JSON.parse(objMatch[1]); } catch {}
  }

  // Fallback: return as raw text field
  return { raw_output: raw };
}
