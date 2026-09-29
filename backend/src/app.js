const express = require('express');
const cors = require('cors');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Health check — unchanged from Phase 2.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'AirGuard Backend',
  });
});

// Phase 3: sensor-data / alert / history endpoints (see docs/API_CONTRACT.md).
app.use('/api', require('./routes'));

// 404 handler — anything not matched above
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found',
  });
});

// Generic error handler — catches anything passed to next(err) by a controller.
// Field-level validation errors are handled earlier, in the validate* middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

module.exports = app;
