const express = require('express');
const deviceAuth = require('../middleware/deviceAuth');
const validateSensorData = require('../middleware/validateSensorData');
const { postSensorData } = require('../controllers/sensorController');

const router = express.Router();

router.post('/sensor-data', deviceAuth, validateSensorData, postSensorData);

module.exports = router;
