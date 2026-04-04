export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set in Vercel environment variables.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request body: ' + err.message });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    // Always try to return JSON, even if Anthropic returned an error
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch {
      // Anthropic returned non-JSON — surface it clearly
      return res.status(502).json({ error: 'Unexpected response from Anthropic API: ' + text.slice(0, 300) });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Proxy fetch failed: ' + err.message });
  }
}
