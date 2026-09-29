const alertService = require('../services/alertService');

// Response shape locked in docs/API_CONTRACT.md §4: 201 { status: "alert_logged", id }
function postAlert(req, res, next) {
  try {
    const alert = alertService.ingestAlert(req.body);
    res.status(201).json({ status: 'alert_logged', id: alert.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { postAlert };
