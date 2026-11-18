const monitoringService = require('./monitoring.service');

/**
 * @desc    Get overall monitoring summary
 * @route   GET /api/monitoring/summary
 * @access  Private (Admin only)
 */
const getMonitoringSummary = async (req, res, next) => {
  try {
    const summary = await monitoringService.getSummary();
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get monitored hosts
 * @route   GET /api/monitoring/hosts
 * @access  Private (Admin only)
 */
const getMonitoredHosts = async (req, res, next) => {
  try {
    const hosts = await monitoringService.getHosts();
    res.status(200).json({
      success: true,
      count: hosts.length,
      data: { hosts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get monitored services
 * @route   GET /api/monitoring/services
 * @access  Private (Admin only)
 */
const getMonitoredServices = async (req, res, next) => {
  try {
    const services = await monitoringService.getServices();
    res.status(200).json({
      success: true,
      count: services.length,
      data: { services },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active monitoring alerts
 * @route   GET /api/monitoring/alerts
 * @access  Private (Admin only)
 */
const getMonitoringAlerts = async (req, res, next) => {
  try {
    const alerts = await monitoringService.getAlerts();
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: { activeAlerts: alerts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system resource metrics (CPU, RAM, Disk, Uptime)
 * @route   GET /api/monitoring/resources
 * @access  Private (Admin only)
 */
const getMonitoringResources = async (req, res, next) => {
  try {
    const resources = await monitoringService.getResources();
    res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonitoringSummary,
  getMonitoredHosts,
  getMonitoredServices,
  getMonitoringAlerts,
  getMonitoringResources,
};
