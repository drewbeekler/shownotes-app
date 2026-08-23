const { createPage } = require('./_notion');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { gigName, typeOfSpot, location, amountPaid, additionalPay, paymentType, paymentReceived, expenses } = req.body;

    const today = new Date().toISOString().split('T')[0];
    const name = gigName ? `${typeOfSpot} - ${gigName}` : `${typeOfSpot} - ${location}`;

    const properties = {
      'Gig Name':     { title: [{ text: { content: name } }] },
      'Type of Spot': { select: { name: typeOfSpot } },
      'Gig Location': { select: { name: location } },
      'Amount paid':  { number: parseFloat(amountPaid) || 0 },
      'Gig Date':     { date: { start: today } },
      'Paid?':        { checkbox: !!paymentReceived },
    };

    if (additionalPay) properties['Additional Pay'] = { number: parseFloat(additionalPay) || 0 };
    if (paymentType)   properties['Payment Type']   = { select: { name: paymentType } };

    const page = await createPage(process.env.INCOME_DB_ID, properties);

    for (const exp of expenses || []) {
      if (!exp.type || !exp.amount) continue;
      try {
        await createPage(process.env.EXPENSES_DB_ID, {
          'Description':            { title: [{ text: { content: exp.type } }] },
          'Amount':                 { number: parseFloat(exp.amount) || 0 },
          'Expesive Type':          { select: { name: exp.type } },
          'Expense Date':           { date: { start: today } },
          'Connected to which Gig': { relation: [{ id: page.id }] },
        });
      } catch (e) {
        console.error('Expense error:', e.message);
      }
    }

    res.status(200).json({ success: true, id: page.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
