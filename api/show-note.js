const { createPage } = require('./_notion');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const {
      type, time, location,
      videoRecorded, audioRecorded, crowdwork,
      howItWent, quickNote,
    } = req.body;

    // Auto-build name: "[time] TYPE - Location"
    const parts = [];
    if (time && time.trim()) parts.push(time.trim());
    parts.push(type);
    parts.push('-');
    parts.push(location);
    const name = parts.join(' ');

    const properties = {
      'Name':            { title: [{ text: { content: name } }] },
      'TYPE':            { select: { name: type } },
      'Video Recorded?': { checkbox: !!videoRecorded },
      'Audio Recorded':  { checkbox: !!audioRecorded },
      'Crowdwork':       { checkbox: !!crowdwork },
      "How'd it go?":   { select: { name: howItWent } },
      'Location':        { select: { name: location } },
    };

    if (quickNote && quickNote.trim()) {
      properties['Quick Note'] = { rich_text: [{ text: { content: quickNote.trim() } }] };
    }

    const page = await createPage(process.env.SHOW_NOTES_DB_ID, properties);
    res.json({ success: true, id: page.id, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
