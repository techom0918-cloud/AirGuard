const express = require('express');

const router = express.Router();

router.use(require('./sensorRoutes'));
router.use(require('./alertRoutes'));
router.use(require('./historyRoutes'));

module.exports = router;
