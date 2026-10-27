const { check } = require('./_stripe');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const r = await check(String(req.query.session_id || ''));
  // Only a confirmed payment gets details back; anything else is a bare "not verified".
  res.status(200).json(r.verified ? (({ _pi, ...rest }) => rest)(r) : { verified: false, reason: r.reason });
};
