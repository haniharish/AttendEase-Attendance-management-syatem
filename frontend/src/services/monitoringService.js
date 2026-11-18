import api from './api';

/**
 * Fetch overall system monitoring summary, status, and component statuses
 */
export const fetchMonitoringSummary = async () => {
  const response = await api.get('/monitoring/summary');
  return response.data;
};

/**
 * Fetch monitored host objects and their statuses
 */
export const fetchMonitoringHosts = async () => {
  const response = await api.get('/monitoring/hosts');
  return response.data;
};

/**
 * Fetch monitored services with filtering options
 */
export const fetchMonitoringServices = async () => {
  const response = await api.get('/monitoring/services');
  return response.data;
};

/**
 * Fetch active alerts and recent state events
 */
export const fetchMonitoringAlerts = async () => {
  const response = await api.get('/monitoring/alerts');
  return response.data;
};

/**
 * Fetch system resource utilization (CPU, Memory, Disk, Uptime)
 */
export const fetchMonitoringResources = async () => {
  const response = await api.get('/monitoring/resources');
  return response.data;
};
