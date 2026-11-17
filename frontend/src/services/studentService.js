import api from './api';

/**
 * Fetch Student Dashboard overview statistics, monthly trends, and subject summaries
 */
export const fetchStudentDashboard = async () => {
  const response = await api.get('/student/dashboard');
  return response.data;
};

/**
 * Fetch Student Profile details
 */
export const fetchStudentProfile = async () => {
  const response = await api.get('/student/profile');
  return response.data;
};

/**
 * Update permitted student profile fields (e.g. phone number)
 */
export const updateStudentProfile = async (data) => {
  const response = await api.put('/student/profile', data);
  return response.data;
};

/**
 * Fetch detailed student attendance records with optional date filters
 */
export const fetchStudentAttendance = async (params = {}) => {
  const response = await api.get('/student/attendance', { params });
  return response.data;
};

/**
 * Fetch subject-wise attendance breakdown
 */
export const fetchStudentSubjectAttendance = async () => {
  const response = await api.get('/student/attendance/subjects');
  return response.data;
};

/**
 * Fetch student attendance history with search, status filters, and pagination
 */
export const fetchStudentAttendanceHistory = async (params = {}) => {
  const response = await api.get('/student/attendance/history', { params });
  return response.data;
};

/**
 * Fetch student attendance analytics for Recharts visual charts
 */
export const fetchStudentAttendanceAnalytics = async () => {
  const response = await api.get('/student/attendance/analytics');
  return response.data;
};

/**
 * Fetch low attendance warnings (< 75% threshold)
 */
export const fetchStudentAttendanceWarnings = async () => {
  const response = await api.get('/student/attendance/warnings');
  return response.data;
};
