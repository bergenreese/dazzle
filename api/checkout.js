const { stripe } = require('./_stripe');
const { SIZES, BUNDLE, CATALOG } = require('./_catalog');
const SITE = 'https://briannaraephoto.com';
const LABEL = { '4x6': '4×6 print', '5x7': '5×7 print' };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const lines = Array.isArray(body?.lines) ? body.lines.slice(0, 40) : [];
  const from = body?.from === 'wall' ? 'wall' : 'shop';
  const items = []; const names = []; let ship = false, framedCount = 0;
  const img = t => `${SITE}/${CATALOG[t].img}`;
  for (const l of lines) {
    if (l?.k === 'bundle') {
      const t = Array.isArray(l.titles) ? l.titles : [];
      if (t.length !== 3 || new Set(t).size !== 3 || !t.every(x => CATALOG[x])) return res.status(400).json({ error: 'bad_bundle', message: 'A bundle needs three different prints.' });
      items.push({ name: `Bundle of 3 · 4×6 prints`, desc: t.join(' · '), amount: BUNDLE, qty: 1, img: img(t[0]) });
      names.push(...t); ship = true; continue;
    }
    const c = CATALOG[l?.title];
    if (!c) return res.status(400).json({ error: 'unknown', message: 'One of these prints is no longer available.' });
    if (l.size === 'framed') {
      if (!c.framed) return res.status(400).json({ error: 'no_framed', message: `${l.title} framed: please ask at the bar.` });
      items.push({ name: `${l.title} · Framed original`, desc: `${c.card} · pick up at Wild Tulips`, amount: c.framed, qty: 1, img: img(l.title) });
      framedCount++;
    } else if (SIZES[l.size]) {
      const q = Math.max(1, Math.min(10, parseInt(l.qty, 10) || 1));
      items.push({ name: `${l.title} · ${LABEL[l.size]}`, desc: 'Unframed print · Dazzle by Brianna Rae', amount: SIZES[l.size], qty: q, img: img(l.title) });
      ship = true;
    } else return res.status(400).json({ error: 'bad_size' });
    names.push(l.title);
  }
  if (!items.length) return res.status(400).json({ error: 'empty', message: 'Your bag is empty.' });

  const form = {
    mode: 'payment',
    success_url: `${SITE}/paid.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}/${from}.html?bag=open`,
    client_reference_id: [...new Set(names)].join(', ').replace(/[^\w ,’'!.-]/g, '').slice(0, 200),
    'metadata[source]': from,
    'metadata[framed]': String(framedCount),
    'metadata[prints]': [...new Set(names)].join(', ').slice(0, 480),
    billing_address_collection: 'auto',
  };
  items.forEach((it, i) => {
    form[`line_items[${i}][quantity]`] = it.qty;
    form[`line_items[${i}][price_data][currency]`] = 'usd';
    form[`line_items[${i}][price_data][unit_amount]`] = it.amount;
    form[`line_items[${i}][price_data][product_data][name]`] = it.name;
    form[`line_items[${i}][price_data][product_data][description]`] = it.desc;
    form[`line_items[${i}][price_data][product_data][images][0]`] = it.img;
  });
  if (ship) form['shipping_address_collection[allowed_countries][0]'] = 'US';
  try {
    const s = await stripe('/checkout/sessions', { method: 'POST', form });
    res.status(200).json({ url: s.url });
  } catch (e) {
    res.status(e.code === 'not_configured' ? 503 : 502).json({ error: e.code === 'not_configured' ? 'not_configured' : 'stripe_error', message: e.code === 'not_configured' ? undefined : 'Checkout could not start. Please try again.' });
  }
};
