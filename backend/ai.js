import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

export async function generateAIContent(prompt, systemPrompt = '') {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
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
