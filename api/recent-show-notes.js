module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.SHOW_NOTES_DB_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sorts: [{ timestamp: 'created_time', direction: 'descending' }],
          page_size: 10,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Notion API error');

    const notes = data.results.map(page => ({
      id: page.id,
      name: page.properties['Name']?.title?.[0]?.plain_text || 'Untitled',
      howItWent: page.properties["How'd it go?"]?.status?.name || '',
      created: page.created_time,
    }));

    res.status(200).json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
