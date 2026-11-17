const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ActivityLog = require('../models/ActivityLog');

const DEFAULT_ATTENDANCE_THRESHOLD = 75;

/**
 * Helper to securely get student document for authenticated user
 */
const getStudentDoc = async (userId, userEmail) => {
  let student = await Student.findOne({ user: userId })
    .populate('class', 'name section academicYear description');

  if (!student && userEmail) {
    student = await Student.findOne({ email: userEmail })
      .populate('class', 'name section academicYear description');
    if (student && !student.user) {
      student.user = userId;
      await student.save();
    }
  }

  return student;
};

/**
 * Helper to calculate required consecutive classes to reach target attendance percentage
 * Formula: (P + x) / (T + x) >= threshold / 100
 * => x >= (threshold*T - 100*P) / (100 - threshold)
 */
const calculateClassesNeeded = (attended, total, threshold = DEFAULT_ATTENDANCE_THRESHOLD) => {
  if (total === 0) return 0;
  const currentRate = (attended / total) * 100;
  if (currentRate >= threshold) return 0;

  const targetDecimal = threshold / 100;
  const needed = Math.ceil((targetDecimal * total - attended) / (1 - targetDecimal));
  return Math.max(0, needed);
};

/**
 * @desc    Get Student Dashboard Statistics & Overview
 * @route   GET /api/student/dashboard
 * @access  Private (Student)
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user._id, req.user.email);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found for authenticated user.',
      });
    }

    // Retrieve all attendance sessions for student's enrolled class
    const sessions = await Attendance.find({
      class: student.class?._id || student.class,
      'records.student': student._id,
    })
      .populate('subject', 'name code credits')
      .populate('faculty', 'fullName email')
      .sort({ date: -1 });

    let totalConducted = 0;
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;

    const sessionList = [];

    sessions.forEach((s) => {
      const record = s.records.find(
        (r) => r.student && r.student.toString() === student._id.toString()
      );
      if (record) {
        totalConducted++;
        if (record.status === 'present') totalPresent++;
        else if (record.status === 'late') totalLate++;
        else if (record.status === 'absent') totalAbsent++;

        sessionList.push({
          sessionId: s._id,
          date: s.date,
          subject: s.subject ? { id: s.subject._id, name: s.subject.name, code: s.subject.code } : null,
          faculty: s.faculty ? { fullName: s.faculty.fullName } : null,
          status: record.status,
          remarks: record.remarks || '',
        });
      }
    });

    const totalAttended = totalPresent + totalLate;
    const overallPercentage = totalConducted > 0
      ? Math.round((totalAttended / totalConducted) * 100)
      : 100;

    // Subjects enrolled for student's class
    const subjects = await Subject.find({
      class: student.class?._id || student.class,
      isActive: true,
    }).populate('faculty', 'fullName email');

    const subjectSummaries = subjects.map((subj) => {
      const subjSessions = sessionList.filter(
        (s) => s.subject && s.subject.id.toString() === subj._id.toString()
      );
      const subTotal = subjSessions.length;
      let subPresent = 0;
      let subLate = 0;
      let subAbsent = 0;

      subjSessions.forEach((s) => {
        if (s.status === 'present') subPresent++;
        else if (s.status === 'late') subLate++;
        else if (s.status === 'absent') subAbsent++;
      });

      const subAttended = subPresent + subLate;
      const subPercentage = subTotal > 0 ? Math.round((subAttended / subTotal) * 100) : 100;
      const isLow = subTotal > 0 && subPercentage < DEFAULT_ATTENDANCE_THRESHOLD;
      const classesNeeded = calculateClassesNeeded(subAttended, subTotal, DEFAULT_ATTENDANCE_THRESHOLD);

      return {
        subjectId: subj._id,
        name: subj.name,
        code: subj.code,
        faculty: subj.faculty ? { fullName: subj.faculty.fullName } : null,
        totalClasses: subTotal,
        attended: subAttended,
        present: subPresent,
        late: subLate,
        missed: subAbsent,
        percentage: subPercentage,
        status: subPercentage >= 75 ? 'healthy' : subPercentage >= 65 ? 'warning' : 'low',
        isWarning: isLow,
        classesNeeded,
      };
    });

    // Monthly attendance overview
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      monthMap[key] = { key, month: label, present: 0, late: 0, absent: 0, total: 0, percentage: 0 };
    }

    sessionList.forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        monthMap[key].total++;
        if (s.status === 'present') monthMap[key].present++;
        else if (s.status === 'late') monthMap[key].late++;
        else if (s.status === 'absent') monthMap[key].absent++;
      }
    });

    const monthlyTrend = Object.values(monthMap).map((m) => ({
      ...m,
      percentage: m.total > 0 ? Math.round(((m.present + m.late) / m.total) * 100) : 100,
    }));

    // Low attendance warnings
    const warnings = subjectSummaries
      .filter((s) => s.isWarning)
      .map((s) => ({
        subjectId: s.subjectId,
        subjectName: s.name,
        subjectCode: s.code,
        currentPercentage: s.percentage,
        threshold: DEFAULT_ATTENDANCE_THRESHOLD,
        classesNeeded: s.classesNeeded,
        message: `Your attendance in ${s.name} (${s.code}) is ${s.percentage}%, which is below the required ${DEFAULT_ATTENDANCE_THRESHOLD}% threshold.${
          s.classesNeeded > 0
            ? ` You must attend the next ${s.classesNeeded} consecutive class${s.classesNeeded > 1 ? 'es' : ''} to recover.`
            : ''
        }`,
      }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          overallPercentage,
          totalConducted,
          totalAttended,
          totalPresent,
          totalLate,
          totalMissed: totalAbsent,
        },
        student: {
          id: student._id,
          fullName: student.fullName,
          registrationNumber: student.registrationNumber,
          email: student.email,
          rollNumber: student.rollNumber,
          class: student.class ? { name: student.class.name, section: student.class.section, academicYear: student.class.academicYear } : null,
        },
        subjectSummaries,
        monthlyTrend,
        recentActivity: sessionList.slice(0, 7),
        warnings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Student Profile
 * @route   GET /api/student/profile
 * @access  Private (Student)
 */
const getStudentProfile = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user._id, req.user.email);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: student._id,
        fullName: student.fullName,
        registrationNumber: student.registrationNumber,
        email: student.email,
        phoneNumber: student.phoneNumber || '',
        class: student.class ? {
          id: student.class._id,
          name: student.class.name,
          section: student.class.section,
          academicYear: student.class.academicYear,
          description: student.class.description,
        } : null,
        section: student.section,
        rollNumber: student.rollNumber,
        enrollmentDate: student.enrollmentDate,
        role: 'student',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Student Profile (Permitted fields: phoneNumber only)
 * @route   PUT /api/student/profile
 * @access  Private (Student)
 */
const updateStudentProfile = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user._id, req.user.email);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const { phoneNumber } = req.body;
    if (phoneNumber !== undefined) {
      student.phoneNumber = phoneNumber.trim();
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile contact details updated successfully.',
      data: {
        id: student._id,
        fullName: student.fullName,
        registrationNumber: student.registrationNumber,
        email: student.email,
        phoneNumber: student.phoneNumber,
        class: student.class,
        section: student.section,
        rollNumber: student.rollNumber,
        enrollmentDate: student.enrollmentDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Detailed Attendance Overview with Date Filters
 * @route   GET /api/student/attendance
 * @access  Private (Student)
 */
const getStudentAttendance = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user._id, req.user.email);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const { filter = 'all', startDate, endDate } = req.query;

    const dateQuery = {};
    const now = new Date();

    if (filter === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));
      dateQuery.date = { $gte: todayStart, $lte: todayEnd };
    } else if (filter === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      dateQuery.date = { $gte: weekStart };
    } else if (filter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateQuery.date = { $gte: monthStart };
    } else if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        dateQuery.date.$lte = eDate;
      }
    }

    const sessions = await Attendance.find({
      class: student.class?._id || student.class,
      'records.student': student._id,
      ...dateQuery,
    })
      .populate('subject', 'name code credits')
      .populate('faculty', 'fullName email')
      .sort({ date: -1 });

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    const records = [];

    sessions.forEach((s) => {
      const rec = s.records.find(
        (r) => r.student && r.student.toString() === student._id.toString()
      );
      if (rec) {
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'late') lateCount++;
        else if (rec.status === 'absent') absentCount++;

        records.push({
          sessionId: s._id,
          date: s.date,
          subject: s.subject ? { id: s.subject._id, name: s.subject.name, code: s.subject.code } : null,
          faculty: s.faculty ? { fullName: s.faculty.fullName } : null,
          status: rec.status,
          remarks: rec.remarks || '',
        });
      }
    });

    const totalClasses = records.length;
    const attendedCount = presentCount + lateCount;
    const overallPercentage = totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 100;

    // Monthly breakdown
    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      monthlyMap[key] = { month: label, present: 0, late: 0, absent: 0, total: 0, percentage: 0 };
    }

    records.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        monthlyMap[key].total++;
        if (r.status === 'present') monthlyMap[key].present++;
        else if (r.status === 'late') monthlyMap[key].late++;
        else if (r.status === 'absent') monthlyMap[key].absent++;
      }
    });

    const monthlyTrend = Object.values(monthlyMap).map((m) => ({
      ...m,
      percentage: m.total > 0 ? Math.round(((m.present + m.late) / m.total) * 100) : 100,
    }));

    res.status(200).json({
      success: true,
      data: {
        overallPercentage,
        totalClasses,
        attendedCount,
        presentCount,
        lateCount,
        absentCount,
        monthlyTrend,
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Subject-Wise Attendance Breakdown
 * @route   GET /api/student/attendance/subjects
 * @access  Private (Student)
 */
const getStudentSubjectAttendance = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user._id, req.user.email);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const subjects = await Subject.find({
      class: student.class?._id || student.class,
      isActive: true,
    }).populate('faculty', 'fullName email phoneNumber');

    const sessions = await Attendance.find({
      class: student.class?._id || student.class,
      'records.student': student._id,
    }).sort({ date: 1 });

    const results = subjects.map((subj) => {
      const subjSessions = sessions.filter(
        (s) => s.subject && s.subject.toString() === subj._id.toString()
      );

      let totalClasses = 0;
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;

      subjSessions.forEach((s) => {
        const rec = s.records.find(
          (r) => r.student && r.student.toString() === student._id.toString()
        );
        if (rec) {
          totalClasses++;
          if (rec.status === 'present') presentCount++;
          else if (rec.status === 'late') lateCount++;
          else if (rec.status === 'absent') absentCount++;
        }
      });

      const attendedClasses = presentCount + lateCount;
      const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
      const isLow = totalClasses > 0 && percentage < DEFAULT_ATTENDANCE_THRESHOLD;
      const classesNeeded = calculateClassesNeeded(attendedClasses, totalClasses, DEFAULT_ATTENDANCE_THRESHOLD);

      return {
        subjectId: subj._id,
        name: subj.name,
        code: subj.code,
        credits: subj.credits || 3,
        faculty: subj.faculty
          ? {
              id: subj.faculty._id,
              fullName: subj.faculty.fullName,
              email: subj.faculty.email,
            }
          : null,
        totalClasses,
        attendedClasses,
        presentCount,
        lateCount,
        missedClasses: absentCount,
        percentage,
        warningThreshold: DEFAULT_ATTENDANCE_THRESHOLD,
        isLowAttendance: isLow,
        classesNeededToReachThreshold: classesNeeded,
        status: percentage >= 75 ? 'healthy' : percentage >= 65 ? 'warning' : 'low',
      };
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Student Attendance History (Paginated & Filterable)
 * @route   GET /api/student/attendance/history
 * @access  Private (Student)
 */
const getStudentAttendanceHistory = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user._id, req.user.email);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const {
      search = '',
      status = 'all',
      startDate,
      endDate,
      sort = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      class: student.class?._id || student.class,
      'records.student': student._id,
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        query.date.$lte = eDate;
      }
    }

    const sessions = await Attendance.find(query)
      .populate('subject', 'name code')
      .populate('faculty', 'fullName email')
      .sort({ date: sort === 'asc' ? 1 : -1 });

    let filteredRecords = [];

    sessions.forEach((s) => {
      const rec = s.records.find(
        (r) => r.student && r.student.toString() === student._id.toString()
      );
      if (!rec) return;

      const matchesStatus = status === 'all' || rec.status === status.toLowerCase();
      const subjectName = s.subject?.name?.toLowerCase() || '';
      const subjectCode = s.subject?.code?.toLowerCase() || '';
      const facultyName = s.faculty?.fullName?.toLowerCase() || '';
      const term = search.toLowerCase();

      const matchesSearch =
        !term ||
        subjectName.includes(term) ||
        subjectCode.includes(term) ||
        facultyName.includes(term);

      if (matchesStatus && matchesSearch) {
        filteredRecords.push({
          sessionId: s._id,
          date: s.date,
          subject: s.subject ? { id: s.subject._id, name: s.subject.name, code: s.subject.code } : null,
          faculty: s.faculty ? { fullName: s.faculty.fullName } : null,
          status: rec.status,
          remarks: rec.remarks || '',
        });
      }
    });

    const totalRecords = filteredRecords.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const startIndex = (pageNum - 1) * pageSize;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize);

    res.status(200).json({
      success: true,
      data: {
        records: paginatedRecords,
        totalRecords,
        totalPages,
        currentPage: pageNum,
        limit: pageSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Attendance Analytics (Charts & Visual Breakdown)
 * @route   GET /api/student/attendance/analytics
 * @access  Private (Student)
 */
const getStudentAttendanceAnalytics = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user._id, req.user.email);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const sessions = await Attendance.find({
      class: student.class?._id || student.class,
      'records.student': student._id,
    })
      .populate('subject', 'name code')
      .sort({ date: 1 });

    const subjects = await Subject.find({
      class: student.class?._id || student.class,
      isActive: true,
    });

    let presentTotal = 0;
    let lateTotal = 0;
    let absentTotal = 0;

    // 1. Monthly trend map
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      monthMap[key] = {
        key,
        month: monthLabel,
        year: d.getFullYear(),
        present: 0,
        late: 0,
        absent: 0,
        total: 0,
        percentage: 0,
      };
    }

    // 2. Subject breakdown map
    const subjectMap = {};
    subjects.forEach((s) => {
      subjectMap[s._id.toString()] = {
        id: s._id,
        name: s.name,
        code: s.code,
        attended: 0,
        missed: 0,
        total: 0,
        percentage: 0,
        threshold: DEFAULT_ATTENDANCE_THRESHOLD,
      };
    });

    sessions.forEach((s) => {
      const rec = s.records.find(
        (r) => r.student && r.student.toString() === student._id.toString()
      );
      if (!rec) return;

      if (rec.status === 'present') presentTotal++;
      else if (rec.status === 'late') lateTotal++;
      else if (rec.status === 'absent') absentTotal++;

      // Monthly mapping
      const d = new Date(s.date);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[mKey]) {
        monthMap[mKey].total++;
        if (rec.status === 'present') monthMap[mKey].present++;
        else if (rec.status === 'late') monthMap[mKey].late++;
        else if (rec.status === 'absent') monthMap[mKey].absent++;
      }

      // Subject mapping
      if (s.subject && subjectMap[s.subject._id.toString()]) {
        subjectMap[s.subject._id.toString()].total++;
        if (rec.status === 'present' || rec.status === 'late') {
          subjectMap[s.subject._id.toString()].attended++;
        } else {
          subjectMap[s.subject._id.toString()].missed++;
        }
      }
    });

    const monthlyTrend = Object.values(monthMap).map((m) => ({
      ...m,
      percentage: m.total > 0 ? Math.round(((m.present + m.late) / m.total) * 100) : 100,
    }));

    const subjectComparison = Object.values(subjectMap).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.attended / s.total) * 100) : 100,
    }));

    const totalRecords = presentTotal + lateTotal + absentTotal;

    const distribution = [
      { name: 'Present', value: presentTotal, color: '#10b981' },
      { name: 'Late', value: lateTotal, color: '#f59e0b' },
      { name: 'Absent', value: absentTotal, color: '#ef4444' },
    ];

    res.status(200).json({
      success: true,
      data: {
        monthlyTrend,
        subjectComparison,
        distribution,
        summary: {
          totalClasses: totalRecords,
          present: presentTotal,
          late: lateTotal,
          absent: absentTotal,
          overallPercentage: totalRecords > 0
            ? Math.round(((presentTotal + lateTotal) / totalRecords) * 100)
            : 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Low Attendance Warnings (< 75%)
 * @route   GET /api/student/attendance/warnings
 * @access  Private (Student)
 */
const getStudentAttendanceWarnings = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user._id, req.user.email);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const subjects = await Subject.find({
      class: student.class?._id || student.class,
      isActive: true,
    }).populate('faculty', 'fullName email');

    const sessions = await Attendance.find({
      class: student.class?._id || student.class,
      'records.student': student._id,
    });

    const warnings = [];

    subjects.forEach((subj) => {
      const subjSessions = sessions.filter(
        (s) => s.subject && s.subject.toString() === subj._id.toString()
      );

      let total = 0;
      let attended = 0;

      subjSessions.forEach((s) => {
        const rec = s.records.find(
          (r) => r.student && r.student.toString() === student._id.toString()
        );
        if (rec) {
          total++;
          if (rec.status === 'present' || rec.status === 'late') attended++;
        }
      });

      if (total > 0) {
        const percentage = Math.round((attended / total) * 100);
        if (percentage < DEFAULT_ATTENDANCE_THRESHOLD) {
          const needed = calculateClassesNeeded(attended, total, DEFAULT_ATTENDANCE_THRESHOLD);
          warnings.push({
            subjectId: subj._id,
            subjectName: subj.name,
            subjectCode: subj.code,
            faculty: subj.faculty ? { fullName: subj.faculty.fullName } : null,
            totalClasses: total,
            attendedClasses: attended,
            currentPercentage: percentage,
            threshold: DEFAULT_ATTENDANCE_THRESHOLD,
            classesNeeded: needed,
            message: `Your attendance in ${subj.name} is ${percentage}%. You are below the required ${DEFAULT_ATTENDANCE_THRESHOLD}% attendance threshold.${
              needed > 0
                ? ` You need to attend the next ${needed} consecutive class${needed > 1 ? 'es' : ''} to reach ${DEFAULT_ATTENDANCE_THRESHOLD}%.`
                : ''
            }`,
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        threshold: DEFAULT_ATTENDANCE_THRESHOLD,
        hasWarnings: warnings.length > 0,
        count: warnings.length,
        warnings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  getStudentAttendance,
  getStudentSubjectAttendance,
  getStudentAttendanceHistory,
  getStudentAttendanceAnalytics,
  getStudentAttendanceWarnings,
};
