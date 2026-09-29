const RISK_LEVELS = require('../config/riskLevels');

// Validates against docs/API_CONTRACT.md §4 (POST /api/alert) and §3
// (reason is mandatory once risk_level is WARNING or DANGER).
function validateAlert(req, res, next) {
  const { device_id, risk_level, timestamp, reason } = req.body || {};
  const errors = [];

  if (!device_id || typeof device_id !== 'string') {
    errors.push('device_id is required');
  }
  if (!RISK_LEVELS.includes(risk_level)) {
    errors.push(`risk_level is required and must be one of ${RISK_LEVELS.join(', ')}`);
  }
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) {
    errors.push('timestamp is required and must be a valid ISO 8601 date');
  }
  if (risk_level && risk_level !== 'SAFE' && (!reason || typeof reason !== 'string')) {
    errors.push('reason is required when risk_level is WARNING or DANGER');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  next();
}

module.exports = validateAlert;
