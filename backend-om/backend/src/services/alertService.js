const store = require('./dataStore');

function ingestAlert(data) {
  return store.addAlert({
    device_id: data.device_id,
    risk_level: data.risk_level,
    reason: data.reason || null,
    timestamp: data.timestamp,
  });
}

module.exports = { ingestAlert };
