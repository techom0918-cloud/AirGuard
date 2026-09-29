const historyService = require('../services/historyService');

// Response shape locked in docs/API_CONTRACT.md §4: 200 { readings: [...] }
function getHistory(req, res, next) {
  try {
    const { deviceId } = req.params;
    const readings = historyService.getHistory(deviceId);

    if (readings === null) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    res.status(200).json({ readings });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory };
