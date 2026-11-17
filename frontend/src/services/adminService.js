import api from './api';

// --- Dashboard ---
export const fetchDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

export const fetchActivityLogs = async () => {
  const response = await api.get('/admin/dashboard/activities');
  return response.data;
};

// --- Students ---
export const fetchStudents = async (params = {}) => {
  const response = await api.get('/admin/students', { params });
  return response.data;
};

export const fetchStudentById = async (id) => {
  const response = await api.get(`/admin/students/${id}`);
  return response.data;
};

export const createStudent = async (data) => {
  const response = await api.post('/admin/students', data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/admin/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/admin/students/${id}`);
  return response.data;
};

// --- Faculty ---
export const fetchFaculty = async (params = {}) => {
  const response = await api.get('/admin/faculty', { params });
  return response.data;
};

export const fetchFacultyById = async (id) => {
  const response = await api.get(`/admin/faculty/${id}`);
  return response.data;
};

export const createFaculty = async (data) => {
  const response = await api.post('/admin/faculty', data);
  return response.data;
};

export const updateFaculty = async (id, data) => {
  const response = await api.put(`/admin/faculty/${id}`, data);
  return response.data;
};

export const deleteFaculty = async (id) => {
  const response = await api.delete(`/admin/faculty/${id}`);
  return response.data;
};

export const assignFaculty = async (id, data) => {
  const response = await api.post(`/admin/faculty/${id}/assign`, data);
  return response.data;
};

// --- Classes ---
export const fetchClasses = async (params = {}) => {
  const response = await api.get('/admin/classes', { params });
  return response.data;
};

export const fetchClassById = async (id) => {
  const response = await api.get(`/admin/classes/${id}`);
  return response.data;
};

export const createClass = async (data) => {
  const response = await api.post('/admin/classes', data);
  return response.data;
};

export const updateClass = async (id, data) => {
  const response = await api.put(`/admin/classes/${id}`, data);
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await api.delete(`/admin/classes/${id}`);
  return response.data;
};

// --- Subjects ---
export const fetchSubjects = async (params = {}) => {
  const response = await api.get('/admin/subjects', { params });
  return response.data;
};

export const fetchSubjectById = async (id) => {
  const response = await api.get(`/admin/subjects/${id}`);
  return response.data;
};

export const createSubject = async (data) => {
  const response = await api.post('/admin/subjects', data);
  return response.data;
};

export const updateSubject = async (id, data) => {
  const response = await api.put(`/admin/subjects/${id}`, data);
  return response.data;
};

export const deleteSubject = async (id) => {
  const response = await api.delete(`/admin/subjects/${id}`);
  return response.data;
};

export const assignFacultyToSubject = async (id, facultyId) => {
  const response = await api.post(`/admin/subjects/${id}/assign-faculty`, { facultyId });
  return response.data;
};

// --- Reports ---
export const fetchReportsOverview = async (params = {}) => {
  const response = await api.get('/admin/reports/overview', { params });
  return response.data;
};

export const fetchClassWiseReport = async () => {
  const response = await api.get('/admin/reports/class-wise');
  return response.data;
};

export const fetchSubjectWiseReport = async () => {
  const response = await api.get('/admin/reports/subject-wise');
  return response.data;
};

export const fetchDateWiseReport = async (params = {}) => {
  const response = await api.get('/admin/reports/date-wise', { params });
  return response.data;
};

export const fetchDetailedReports = async (params = {}) => {
  const response = await api.get('/admin/reports/detailed', { params });
  return response.data;
};
