const RISK_LEVELS = require('../config/riskLevels');

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

// Validates against the LOCKED sensor data contract (docs/API_CONTRACT.md §2).
// device_id, pm25, temp, humidity, risk_level, timestamp — no other fields required.
function validateSensorData(req, res, next) {
  const { device_id, pm25, temp, humidity, risk_level, timestamp } = req.body || {};
  const errors = [];

  if (!device_id || typeof device_id !== 'string') {
    errors.push('device_id is required');
  }
  if (!isFiniteNumber(pm25) || pm25 < 0) {
    errors.push('pm25 is required and must be a number >= 0');
  }
  if (!isFiniteNumber(temp)) {
    errors.push('temp is required and must be a number');
  }
  if (!isFiniteNumber(humidity) || humidity < 0 || humidity > 100) {
    errors.push('humidity is required and must be a number between 0 and 100');
  }
  if (!RISK_LEVELS.includes(risk_level)) {
    errors.push(`risk_level is required and must be one of ${RISK_LEVELS.join(', ')}`);
  }
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) {
    errors.push('timestamp is required and must be a valid ISO 8601 date');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  next();
}

module.exports = validateSensorData;
