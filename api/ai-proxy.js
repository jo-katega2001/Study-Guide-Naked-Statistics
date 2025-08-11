// Minimal Vercel Serverless Function to proxy AI requests to x.ai (Grok)
// Deploy to Vercel. Set environment variable: XAI_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { prompt, system } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server misconfigured: missing XAI_API_KEY' });
      return;
    }

    const url = 'https://api.x.ai/v1/chat/completions';
    const model = 'grok-4-latest';
    const payload = {
      model,
      messages: [
        { role: 'system', content: system || 'You are a helpful tutor inside an interactive study guide. Keep answers concise and under 120 words.' },
        { role: 'user', content: prompt }
      ]
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      res.status(r.status).json({ error: 'Upstream error', status: r.status, body: text });
      return;
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ content });
  } catch (e) {
    res.status(500).json({ error: 'Proxy failed', detail: String(e) });
  }
}
