const { createPage } = require('./_notion');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { type, location, videoRecorded, audioRecorded, crowdwork, howItWent, quickNote } = req.body;
    const name = `${type} - ${location}`;
    const properties = {
      'Name': { title: [{ text: { content: name } }] },
      'TYPE': { select: { name: type } },
      'Video Recorded?': { checkbox: !!videoRecorded },
      'Audio Recorded': { checkbox: !!audioRecorded },
      'Crowdwork': { checkbox: !!crowdwork },
      "How'd it go?": { status: { name: howItWent } },
      'Location': { multi_select: [{ name: location }] }
    };
    if (quickNote) {
      properties['Quick Note'] = { rich_text: [{ text: { content: quickNote } }] };
    }
    const page = await createPage(process.env.SHOW_NOTES_DB_ID, properties);
    res.status(200).json({ success: true, id: page.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
