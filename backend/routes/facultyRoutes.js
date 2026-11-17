const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getDashboard,
  getMyClasses,
  getMySubjects,
  getClassStudents,
  markAttendance,
  getAttendanceHistory,
  getAttendanceSessionById,
  updateAttendanceSession,
  getFacultyReports,
  getProfile,
  updateProfile,
} = require('../controllers/facultyAttendanceController');

// All Faculty routes require authentication and 'faculty' role
router.use(protect, authorize('faculty'));

// Dashboard stats & recent activity
router.get('/dashboard', getDashboard);

// Assigned Classes
router.get('/classes', getMyClasses);
router.get('/classes/:classId/students', getClassStudents);

// Assigned Subjects
router.get('/subjects', getMySubjects);

// Attendance Marking & History
router.post('/attendance', markAttendance);
router.get('/attendance/history', getAttendanceHistory);
router.get('/attendance/:id', getAttendanceSessionById);
router.put('/attendance/:id', updateAttendanceSession);

// Attendance Analytics & Reports
router.get('/reports', getFacultyReports);

// Faculty Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
