const express = require('express');
const deviceAuth = require('../middleware/deviceAuth');
const { getHistory } = require('../controllers/historyController');

const router = express.Router();

router.get('/history/:deviceId', deviceAuth, getHistory);

module.exports = router;
