const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Student = require('../models/Student');

/**
 * @desc    Get comprehensive attendance report overview
 * @route   GET /api/admin/reports/overview
 * @access  Private (Admin)
 */
const getReportsOverview = async (req, res, next) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const sessions = await Attendance.find(filter)
      .populate('class', 'name section academicYear')
      .populate('subject', 'name code')
      .populate('faculty', 'fullName')
      .sort({ date: -1 });

    let totalRecordedSessions = sessions.length;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalRecords = 0;

    sessions.forEach((s) => {
      totalPresent += s.totalPresent || 0;
      totalAbsent += s.totalAbsent || 0;
      totalRecords += s.totalStudents || 0;
    });

    const overallPercentage = totalRecords > 0
      ? Math.round((totalPresent / totalRecords) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSessions: totalRecordedSessions,
        totalRecords,
        totalPresent,
        totalAbsent,
        overallPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get class-wise aggregated attendance percentages
 * @route   GET /api/admin/reports/class-wise
 * @access  Private (Admin)
 */
const getClassWiseReport = async (req, res, next) => {
  try {
    const classes = await Class.find({ isActive: true }).select('name section academicYear');

    const classStats = await Promise.all(
      classes.map(async (cls) => {
        const sessions = await Attendance.find({ class: cls._id });
        let totalStudentsCount = await Student.countDocuments({ class: cls._id, isActive: true });
        let totalPresent = 0;
        let totalExpected = 0;

        sessions.forEach((s) => {
          totalPresent += s.totalPresent || 0;
          totalExpected += s.totalStudents || 0;
        });

        const percentage = totalExpected > 0
          ? Math.round((totalPresent / totalExpected) * 100)
          : (sessions.length > 0 ? 100 : 0);

        return {
          classId: cls._id,
          className: cls.name,
          section: cls.section,
          academicYear: cls.academicYear,
          fullName: `${cls.name} (${cls.section})`,
          totalSessions: sessions.length,
          enrolledStudents: totalStudentsCount,
          totalPresent,
          totalExpected,
          attendancePercentage: percentage,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: classStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subject-wise attendance percentages
 * @route   GET /api/admin/reports/subject-wise
 * @access  Private (Admin)
 */
const getSubjectWiseReport = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .populate('class', 'name section')
      .populate('faculty', 'fullName');

    const subjectStats = await Promise.all(
      subjects.map(async (subj) => {
        const sessions = await Attendance.find({ subject: subj._id });
        let totalPresent = 0;
        let totalExpected = 0;

        sessions.forEach((s) => {
          totalPresent += s.totalPresent || 0;
          totalExpected += s.totalStudents || 0;
        });

        const percentage = totalExpected > 0
          ? Math.round((totalPresent / totalExpected) * 100)
          : 0;

        return {
          subjectId: subj._id,
          subjectName: subj.name,
          subjectCode: subj.code,
          className: subj.class ? `${subj.class.name} (${subj.class.section})` : 'N/A',
          facultyName: subj.faculty?.fullName || 'Unassigned',
          totalSessions: sessions.length,
          totalPresent,
          attendancePercentage: percentage,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: subjectStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get date-wise daily attendance trend
 * @route   GET /api/admin/reports/date-wise
 * @access  Private (Admin)
 */
const getDateWiseReport = async (req, res, next) => {
  try {
    const { days = 14, classId, subjectId } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    filter.date = { $gte: startDate };

    const sessions = await Attendance.find(filter).sort({ date: 1 }).lean();

    // Group by date YYYY-MM-DD
    const dateMap = {};

    // Initialize last N days
    for (let i = Number(days); i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[key] = {
        date: key,
        displayDate: formatted,
        present: 0,
        absent: 0,
        total: 0,
        sessions: 0,
        percentage: 0,
      };
    }

    sessions.forEach((s) => {
      const key = new Date(s.date).toISOString().split('T')[0];
      if (dateMap[key]) {
        dateMap[key].present += s.totalPresent || 0;
        dateMap[key].absent += s.totalAbsent || 0;
        dateMap[key].total += s.totalStudents || 0;
        dateMap[key].sessions += 1;
      }
    });

    const result = Object.values(dateMap).map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed attendance logs with filters
 * @route   GET /api/admin/reports/detailed
 * @access  Private (Admin)
 */
const getDetailedReports = async (req, res, next) => {
  try {
    const { classId, subjectId, date, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(filter);

    const sessions = await Attendance.find(filter)
      .populate('class', 'name section academicYear')
      .populate('subject', 'name code')
      .populate('faculty', 'fullName employeeId')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportsOverview,
  getClassWiseReport,
  getSubjectWiseReport,
  getDateWiseReport,
  getDetailedReports,
};
