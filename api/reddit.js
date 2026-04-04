export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  try {
    const url = `https://www.reddit.com/r/puzzlesandsurvival/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=relevance&limit=10`;
    const response = await fetch(url, {
      headers: {
        // Reddit requires a User-Agent for API requests
        'User-Agent': 'PNS-State-Scout/1.0'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Reddit returned ${response.status}: ${text.slice(0, 200)}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Reddit fetch failed: ' + err.message });
  }
}
