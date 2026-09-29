const store = require('./dataStore');

/**
 * Returns readings for a device, or null if the device has never been seen.
 * null is treated by the controller as "not found" (404).
 */
function getHistory(deviceId) {
  if (!store.isKnownDevice(deviceId)) {
    return null;
  }
  return store.getReadingsForDevice(deviceId);
}

module.exports = { getHistory };
