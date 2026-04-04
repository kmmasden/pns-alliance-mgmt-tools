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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      }
    });

    if (!response.ok) {
      // If still blocked, return a helpful message
      return res.status(response.status).json({
        error: `Reddit returned ${response.status}. Reddit may require OAuth credentials for API access.`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Reddit fetch failed: ' + err.message });
  }
}
