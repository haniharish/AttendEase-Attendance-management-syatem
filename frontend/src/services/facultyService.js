import api from './api';

/**
 * Fetch Faculty Dashboard statistics, weekly attendance trends, and recent sessions
 */
export const fetchFacultyDashboard = async () => {
  const response = await api.get('/faculty/dashboard');
  return response.data;
};

/**
 * Fetch assigned classes for the logged-in faculty
 */
export const fetchMyClasses = async (params = {}) => {
  const response = await api.get('/faculty/classes', { params });
  return response.data;
};

/**
 * Fetch enrolled students for a specific assigned class
 */
export const fetchClassStudents = async (classId) => {
  const response = await api.get(`/faculty/classes/${classId}/students`);
  return response.data;
};

/**
 * Fetch assigned subjects for the logged-in faculty
 */
export const fetchMySubjects = async () => {
  const response = await api.get('/faculty/subjects');
  return response.data;
};

/**
 * Mark and submit attendance roster
 * @param {Object} payload { classId, subjectId, date, records: [{ student, status, remarks }] }
 */
export const markAttendance = async (payload) => {
  const response = await api.post('/faculty/attendance', payload);
  return response.data;
};

/**
 * Fetch attendance logs history
 */
export const fetchAttendanceHistory = async (params = {}) => {
  const response = await api.get('/faculty/attendance/history', { params });
  return response.data;
};

/**
 * Fetch single attendance session detail by ID
 */
export const fetchAttendanceSession = async (id) => {
  const response = await api.get(`/faculty/attendance/${id}`);
  return response.data;
};

/**
 * Update existing attendance session records
 */
export const updateAttendanceSession = async (id, payload) => {
  const response = await api.put(`/faculty/attendance/${id}`, payload);
  return response.data;
};

/**
 * Fetch attendance visual reports & analytics
 */
export const fetchFacultyReports = async (params = {}) => {
  const response = await api.get('/faculty/reports', { params });
  return response.data;
};

/**
 * Fetch faculty profile
 */
export const fetchFacultyProfile = async () => {
  const response = await api.get('/faculty/profile');
  return response.data;
};

/**
 * Update faculty profile details
 */
export const updateFacultyProfile = async (data) => {
  const response = await api.put('/faculty/profile', data);
  return response.data;
};
