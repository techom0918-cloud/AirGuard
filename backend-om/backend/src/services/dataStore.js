/**
 * Mock in-memory data layer.
 *
 * Phase 1/2 docs describe Firestore collections (devices, readings, alerts) —
 * see docs/API_CONTRACT.md §5. Firebase/Firestore integration was not listed
 * as Phase 3 scope, so this module stands in with the same shape, so the
 * real Firestore service can drop in later without touching controllers.
 *
 * Data resets whenever the process restarts. Not for anything beyond
 * hackathon/dev testing.
 */

const devices = new Map(); // device_id -> { device_id, registered_at }
const readings = [];       // { id, device_id, pm25, temp, humidity, risk_level, timestamp }
const alerts = [];         // { id, device_id, risk_level, reason, timestamp, resolved }

function ensureDevice(deviceId) {
  if (!devices.has(deviceId)) {
    devices.set(deviceId, {
      device_id: deviceId,
      registered_at: new Date().toISOString(),
    });
  }
}

function isKnownDevice(deviceId) {
  return devices.has(deviceId);
}

function addReading(reading) {
  ensureDevice(reading.device_id);
  const stored = { id: `r_${readings.length + 1}`, ...reading };
  readings.push(stored);
  return stored;
}

function addAlert(alert) {
  ensureDevice(alert.device_id);
  const stored = { id: `a_${alerts.length + 1}`, resolved: false, ...alert };
  alerts.push(stored);
  return stored;
}

function getReadingsForDevice(deviceId) {
  return readings.filter((r) => r.device_id === deviceId);
}

// Test-only helper — lets the Jest suite start from a clean slate between tests.
function _reset() {
  devices.clear();
  readings.length = 0;
  alerts.length = 0;
}

module.exports = {
  ensureDevice,
  isKnownDevice,
  addReading,
  addAlert,
  getReadingsForDevice,
  _reset,
};
