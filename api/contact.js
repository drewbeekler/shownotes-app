const { createPage } = require('./_notion');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const {
      comicName, instagram, email,
      locations, typeOfContact,
      bookOnBigWave, anotherInfo,
    } = req.body;

    const properties = {
      'COMIC NAME':            { title: [{ text: { content: comicName.trim() } }] },
      'BOOK THEM ON BIG WAVE': { checkbox: !!bookOnBigWave },
      'LOCATION':              { multi_select: (locations || []).map(l => ({ name: l })) },
      'Type of Contact':       { multi_select: (typeOfContact || []).map(t => ({ name: t })) },
    };

    if (instagram && instagram.trim()) {
      const handle = instagram.trim().replace(/^@/, '');
      properties['INSTAGRAM'] = { url: `https://instagram.com/${handle}` };
    }
    if (email && email.trim()) {
      properties['Email'] = { email: email.trim() };
    }
    if (anotherInfo && anotherInfo.trim()) {
      properties['ANOTHER INFO?'] = { rich_text: [{ text: { content: anotherInfo.trim() } }] };
    }

    const page = await createPage(process.env.CONTACTS_DB_ID, properties);
    res.json({ success: true, id: page.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
