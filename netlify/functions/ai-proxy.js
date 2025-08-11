// Netlify Function: ai-proxy
// Deploy on Netlify and set environment variable: XAI_API_KEY

// CommonJS export for Netlify Functions
async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const { prompt, system } = JSON.parse(event.body || '{}');
    if (!prompt || typeof prompt !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt' }) };
    }
    // Provider selection via env: AI_PROVIDER preferred, fallback to PROVIDER. Options: 'deepseek' | 'gemini' | 'xai'
    const provider = (process.env.AI_PROVIDER || process.env.PROVIDER || 'xai').toLowerCase();

    if (provider === 'gemini') {
      const gkey = process.env.GEMINI_API_KEY;
      if (!gkey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured: missing GEMINI_API_KEY' }) };
      }

      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(gkey)}`;

      const sys = system || 'You are a helpful tutor inside an interactive study guide. Keep answers concise and under 120 words.';
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `System: ${sys}` },
              { text: prompt }
            ]
          }
        ]
      };

      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!r.ok) {
        const text = await r.text();
        return { statusCode: r.status, body: JSON.stringify({ error: 'Upstream error', status: r.status, body: text }) };
      }

      const data = await r.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const content = parts.map(p => p.text || '').join('\n');
      return { statusCode: 200, body: JSON.stringify({ content }) };
    }

    // DeepSeek provider (OpenAI-compatible Chat API)
    if (provider === 'deepseek') {
      const dsKey = process.env.DEEPSEEK_API_KEY;
      if (!dsKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured: missing DEEPSEEK_API_KEY' }) };
      }
      const url = 'https://api.deepseek.com/chat/completions';
      const dsModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
      const dsPayload = {
        model: dsModel,
        messages: [
          { role: 'system', content: system || 'You are a helpful tutor inside an interactive study guide. Keep answers concise and under 120 words.' },
          { role: 'user', content: prompt }
        ],
        stream: false
      };

      const dsr = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${dsKey}`
        },
        body: JSON.stringify(dsPayload)
      });

      if (!dsr.ok) {
        const text = await dsr.text();
        return { statusCode: dsr.status, body: JSON.stringify({ error: 'Upstream error', status: dsr.status, body: text }) };
      }

      const dsData = await dsr.json();
      const content = dsData?.choices?.[0]?.message?.content || '';
      return { statusCode: 200, body: JSON.stringify({ content }) };
    }

    // Default: x.ai
    const xaiKey = process.env.XAI_API_KEY;
    if (!xaiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured: missing XAI_API_KEY' }) };
    }
    const url = 'https://api.x.ai/v1/chat/completions';
    const xModel = process.env.XAI_MODEL || 'grok-4-latest';
    const xPayload = {
      model: xModel,
      messages: [
        { role: 'system', content: system || 'You are a helpful tutor inside an interactive study guide. Keep answers concise and under 120 words.' },
        { role: 'user', content: prompt }
      ]
    };

    const xr = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${xaiKey}`
      },
      body: JSON.stringify(xPayload)
    });

    if (!xr.ok) {
      const text = await xr.text();
      return { statusCode: xr.status, body: JSON.stringify({ error: 'Upstream error', status: xr.status, body: text }) };
    }

    const xData = await xr.json();
    const content = xData?.choices?.[0]?.message?.content || '';
    return { statusCode: 200, body: JSON.stringify({ content }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Proxy failed', detail: String(e) }) };
  }
}

module.exports = { handler };
