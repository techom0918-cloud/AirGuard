const store = require('./dataStore');

/**
 * Stores an incoming sensor reading.
 *
 * Phase 1 decision (docs/API_CONTRACT.md §4): the backend automatically
 * logs an alert whenever a reading's risk_level is WARNING or DANGER, so
 * ESP32/Swapnil's module doesn't have to call /api/alert separately for
 * the common case.
 */
function ingestReading(data) {
  const reading = store.addReading(data);

  if (data.risk_level === 'WARNING' || data.risk_level === 'DANGER') {
    store.addAlert({
      device_id: data.device_id,
      risk_level: data.risk_level,
      reason: data.reason || null,
      timestamp: data.timestamp,
    });
  }

  return reading;
}

module.exports = { ingestReading };
