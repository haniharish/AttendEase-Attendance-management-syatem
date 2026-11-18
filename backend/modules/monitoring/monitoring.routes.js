const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const {
  getMonitoringSummary,
  getMonitoredHosts,
  getMonitoredServices,
  getMonitoringAlerts,
  getMonitoringResources,
} = require('./monitoring.controller');

// STRICT SECURITY RULE: Monitoring routes require valid authentication AND 'admin' role
router.use(protect, authorize('admin'));

// Monitoring Endpoints
router.get('/summary', getMonitoringSummary);
router.get('/hosts', getMonitoredHosts);
router.get('/services', getMonitoredServices);
router.get('/alerts', getMonitoringAlerts);
router.get('/resources', getMonitoringResources);

module.exports = router;
