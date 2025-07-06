export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');
  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(400).send('Failed to fetch');
    const text = await response.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send('Error fetching text');
  }
} 