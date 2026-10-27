const crypto = require('crypto');
const { stripe, check } = require('./_stripe');
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const pin = process.env.BAR_PIN;
  if (!pin) return res.status(200).json({ ok: false, reason: 'not_configured' });
  if (!eq(body.pin || '', pin)) return res.status(200).json({ ok: false, reason: 'wrong_pin' });
  const r = await check(String(body.session_id || ''));
  if (!r.verified) return res.status(200).json({ ok: false, reason: r.reason });
  if (r.picked_up_at) return res.status(200).json({ ok: false, reason: 'already_picked_up', picked_up_at: r.picked_up_at });
  const now = new Date().toISOString();
  try {
    await stripe(`/payment_intents/${r._pi}`, { method: 'POST', form: { 'metadata[picked_up_at]': now } });
  } catch (e) { return res.status(200).json({ ok: false, reason: 'stripe_error' }); }
  res.status(200).json({ ok: true, picked_up_at: now });
};
