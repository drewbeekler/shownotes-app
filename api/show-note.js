const { createPage } = require('./_notion');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { type, location, showName, showTime, videoRecorded, audioRecorded, crowdwork, howItWent, quickNote, paid, paymentReceived, amountPaid, paymentType, expenses } = req.body;
    const nameParts = [];
    if (showTime) nameParts.push(showTime);
    nameParts.push(type);
    if (showName) nameParts.push(showName);
    nameParts.push(location);
    const name = nameParts.join(' - ');

    const properties = {
      'Name':           { title: [{ text: { content: name } }] },
      'TYPE':           { select: { name: type } },
      'Video Recorded?':{ checkbox: !!videoRecorded },
      'Audio Recorded': { checkbox: !!audioRecorded },
      'Crowdwork':      { checkbox: !!crowdwork },
      "How'd it go?":   { status: { name: howItWent } },
      'Location':       { multi_select: [{ name: location }] },
    };
    if (quickNote) properties['Quick Note'] = { rich_text: [{ text: { content: quickNote } }] };

    await createPage(process.env.SHOW_NOTES_DB_ID, properties);

    // Optionally create an income entry + expenses
    if (paid) {
      const today = new Date().toISOString().split('T')[0];
      const incomeProps = {
        'Gig Name':     { title: [{ text: { content: name } }] },
        'Type of Spot': { select: { name: type === 'SPOT' ? 'Spot' : type === 'HOST' ? 'Host' : type } },
        'Gig Location': { select: { name: location } },
        'Amount paid':  { number: parseFloat(amountPaid) || 0 },
        'Gig Date':     { date: { start: today } },
        'Paid?':        { checkbox: !!paymentReceived },
      };
      if (paymentType) incomeProps['Payment Type'] = { select: { name: paymentType } };

      const incomePage = await createPage(process.env.INCOME_DB_ID, incomeProps);

      for (const exp of expenses || []) {
        if (!exp.type || !exp.amount) continue;
        try {
          await createPage(process.env.EXPENSES_DB_ID, {
            'Description':            { title: [{ text: { content: exp.type } }] },
            'Amount':                 { number: parseFloat(exp.amount) || 0 },
            'Expesive Type':          { select: { name: exp.type } },
            'Expense Date':           { date: { start: today } },
            'Connected to which Gig': { relation: [{ id: incomePage.id }] },
          });
        } catch (e) {
          console.error('Expense error:', e.message);
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
