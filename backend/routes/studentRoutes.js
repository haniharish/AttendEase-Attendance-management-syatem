const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  getStudentAttendance,
  getStudentSubjectAttendance,
  getStudentAttendanceHistory,
  getStudentAttendanceAnalytics,
  getStudentAttendanceWarnings,
} = require('../controllers/studentAttendanceController');

// All Student endpoints require JWT authentication and 'student' role
router.use(protect, authorize('student'));

// Dashboard Overview
router.get('/dashboard', getStudentDashboard);

// Profile
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Attendance Modules
router.get('/attendance', getStudentAttendance);
router.get('/attendance/subjects', getStudentSubjectAttendance);
router.get('/attendance/history', getStudentAttendanceHistory);
router.get('/attendance/analytics', getStudentAttendanceAnalytics);
router.get('/attendance/warnings', getStudentAttendanceWarnings);

module.exports = router;
