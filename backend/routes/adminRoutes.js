const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Controllers
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/classController');

const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToSubject,
} = require('../controllers/subjectController');

const {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  assignFaculty,
} = require('../controllers/facultyController');

const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

const {
  getReportsOverview,
  getClassWiseReport,
  getSubjectWiseReport,
  getDateWiseReport,
  getDetailedReports,
} = require('../controllers/reportController');

const {
  getDashboardStats,
  getActivityLogs,
} = require('../controllers/dashboardController');

// All Admin routes require authentication AND 'admin' role
router.use(protect, authorize('admin'));

// --- Dashboard Routes ---
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/activities', getActivityLogs);

// --- Class Routes ---
router.route('/classes')
  .get(getClasses)
  .post(createClass);

router.route('/classes/:id')
  .get(getClassById)
  .put(updateClass)
  .delete(deleteClass);

// --- Subject Routes ---
router.route('/subjects')
  .get(getSubjects)
  .post(createSubject);

router.route('/subjects/:id')
  .get(getSubjectById)
  .put(updateSubject)
  .delete(deleteSubject);

router.post('/subjects/:id/assign-faculty', assignFacultyToSubject);

// --- Faculty Routes ---
router.route('/faculty')
  .get(getFaculty)
  .post(createFaculty);

router.route('/faculty/:id')
  .get(getFacultyById)
  .put(updateFaculty)
  .delete(deleteFaculty);

router.post('/faculty/:id/assign', assignFaculty);

// --- Student Routes ---
router.route('/students')
  .get(getStudents)
  .post(createStudent);

router.route('/students/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

// --- Attendance Report Routes ---
router.get('/reports/overview', getReportsOverview);
router.get('/reports/class-wise', getClassWiseReport);
router.get('/reports/subject-wise', getSubjectWiseReport);
router.get('/reports/date-wise', getDateWiseReport);
router.get('/reports/detailed', getDetailedReports);

module.exports = router;
