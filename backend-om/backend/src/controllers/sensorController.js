const sensorService = require('../services/sensorService');

// Response shape locked in docs/API_CONTRACT.md §4: 201 { status: "logged", id }
function postSensorData(req, res, next) {
  try {
    const reading = sensorService.ingestReading(req.body);
    res.status(201).json({ status: 'logged', id: reading.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { postSensorData };
