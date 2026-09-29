const express = require('express');
const deviceAuth = require('../middleware/deviceAuth');
const validateAlert = require('../middleware/validateAlert');
const { postAlert } = require('../controllers/alertController');

const router = express.Router();

router.post('/alert', deviceAuth, validateAlert, postAlert);

module.exports = router;
