// Shared Stripe helper. Uses only Node's built-in fetch, so there are no dependencies to install.
// Requires env vars on Vercel: STRIPE_KEY (Bri's restricted key), BAR_PIN (bar staff PIN).
const API = 'https://api.stripe.com/v1';

async function stripe(path, { method = 'GET', form } = {}) {
  const key = process.env.STRIPE_KEY;
  if (!key) throw Object.assign(new Error('not_configured'), { code: 'not_configured' });
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + key,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data?.error?.message || 'stripe_error'), { code: data?.error?.code || 'stripe_error', status: res.status });
  return data;
}

// Session IDs look like cs_live_... (or cs_test_... in sandbox). Reject anything else before calling Stripe.
const validId = id => typeof id === 'string' && /^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(id);

// Load a Checkout Session and decide, strictly, whether it is a real completed payment.
async function check(sessionId) {
  if (!validId(sessionId)) return { verified: false, reason: 'bad_id' };
  let s;
  try {
    s = await stripe(`/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items&expand[]=payment_intent.latest_charge`);
  } catch (e) {
    if (e.code === 'not_configured') return { verified: false, reason: 'not_configured' };
    if (e.status === 404 || e.code === 'resource_missing') return { verified: false, reason: 'not_found' };
    return { verified: false, reason: 'stripe_error' };
  }
  const pi = s.payment_intent && typeof s.payment_intent === 'object' ? s.payment_intent : null;
  const paid =
    s.status === 'complete' &&
    s.payment_status === 'paid' &&
    pi && pi.status === 'succeeded' &&
    // a refunded or disputed payment does not count
    !(pi.latest_charge && typeof pi.latest_charge === 'object' && (pi.latest_charge.refunded || pi.latest_charge.disputed));
  const items = (s.line_items?.data || []).filter(li => li.quantity > 0).map(li => ({ name: li.description, qty: li.quantity }));
  const name = (s.customer_details?.name || '').trim().split(/\s+/)[0] || '';
  return {
    verified: !!paid,
    reason: paid ? 'paid' : 'not_paid',
    livemode: !!s.livemode,
    print: s.client_reference_id ? s.client_reference_id.replace(/-/g, ' ') : null,
    items,
    amount: s.amount_total,
    currency: s.currency,
    first_name: name,
    paid_at: pi ? pi.created : s.created,
    picked_up_at: pi?.metadata?.picked_up_at || null,
    order: pi ? pi.id.slice(-8).toUpperCase() : null,
    _pi: pi ? pi.id : null,
  };
}

module.exports = { stripe, check };
