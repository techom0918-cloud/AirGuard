// Locked in docs/API_CONTRACT.md §1: header X-Device-Key, checked against
// a shared secret in the environment. No JWT/OAuth introduced.
function deviceAuth(req, res, next) {
  const key = req.header('X-Device-Key');

  if (!key || key !== process.env.DEVICE_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing device API key',
    });
  }

  next();
}

module.exports = deviceAuth;
