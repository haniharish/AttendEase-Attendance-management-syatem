const Attendance = require('../models/Attendance');
const Faculty = require('../models/Faculty');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const ActivityLog = require('../models/ActivityLog');

/**
 * Helper to ensure faculty document is attached to req
 */
const getFacultyDoc = async (userId, userEmail) => {
  let faculty = await Faculty.findOne({ user: userId });
  if (!faculty && userEmail) {
    faculty = await Faculty.findOne({ email: userEmail });
    if (faculty && !faculty.user) {
      faculty.user = userId;
      await faculty.save();
    }
  }
  return faculty;
};

/**
 * @desc    Get Faculty Dashboard Overview Statistics
 * @route   GET /api/faculty/dashboard
 * @access  Private (Faculty)
 */
const getDashboard = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const assignedClassIds = faculty.assignedClasses || [];
    const assignedSubjectIds = faculty.assignedSubjects || [];

    // Total unique students across assigned classes
    const totalStudents = await Student.countDocuments({
      class: { $in: assignedClassIds },
      isActive: true,
    });

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todaySessions, allFacultySessions] = await Promise.all([
      Attendance.find({
        faculty: faculty._id,
        date: { $gte: todayStart, $lte: todayEnd },
      }),
      Attendance.find({ faculty: faculty._id })
        .populate('class', 'name section')
        .populate('subject', 'name code')
        .sort({ date: -1 })
        .limit(10),
    ]);

    // Calculate today's stats
    let todayPresent = 0;
    let todayAbsent = 0;
    let todayLate = 0;
    let todayTotal = 0;

    todaySessions.forEach((s) => {
      todayPresent += s.totalPresent || 0;
      todayAbsent += s.totalAbsent || 0;
      todayLate += s.totalLate || 0;
      todayTotal += s.totalStudents || 0;
    });

    // Weekly attendance trend (past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pastWeekSessions = await Attendance.find({
      faculty: faculty._id,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      trendMap[key] = {
        date: key,
        day: dayName,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        percentage: 0,
      };
    }

    pastWeekSessions.forEach((s) => {
      const key = new Date(s.date).toISOString().split('T')[0];
      if (trendMap[key]) {
        trendMap[key].present += s.totalPresent || 0;
        trendMap[key].absent += s.totalAbsent || 0;
        trendMap[key].late += s.totalLate || 0;
        trendMap[key].total += s.totalStudents || 0;
      }
    });

    const weeklyTrend = Object.values(trendMap).map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round(((item.present + item.late) / item.total) * 100) : 0,
    }));

    // Overall attendance rate across all faculty sessions
    let totalAllPresent = 0;
    let totalAllStudents = 0;
    allFacultySessions.forEach((s) => {
      totalAllPresent += (s.totalPresent || 0) + (s.totalLate || 0);
      totalAllStudents += s.totalStudents || 0;
    });

    const overallRate = totalAllStudents > 0
      ? Math.round((totalAllPresent / totalAllStudents) * 100)
      : 92;

    // Assigned classes summary list
    const assignedClasses = await Class.find({
      _id: { $in: assignedClassIds },
      isActive: true,
    }).lean();

    const classSummaries = await Promise.all(
      assignedClasses.map(async (cls) => {
        const studentCount = await Student.countDocuments({ class: cls._id, isActive: true });
        const subjectsInClass = await Subject.find({
          class: cls._id,
          faculty: faculty._id,
          isActive: true,
        }).select('name code');
        return {
          ...cls,
          studentCount,
          subjects: subjectsInClass,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalAssignedClasses: assignedClassIds.length,
          totalAssignedSubjects: assignedSubjectIds.length,
          totalStudentsUnderFaculty: totalStudents,
          todaySessionsCount: todaySessions.length,
          todayPresent,
          todayAbsent,
          todayLate,
          overallRate,
        },
        stats: {
          totalClasses: assignedClassIds.length,
          totalSubjects: assignedSubjectIds.length,
          totalStudents,
          todaySessions: todaySessions.length,
          turnoutPercentage: overallRate,
        },
        weeklyTrend,
        weeklyTrends: weeklyTrend,
        recentSessions: allFacultySessions.slice(0, 5),
        assignedClasses: classSummaries,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get classes assigned to logged-in faculty
 * @route   GET /api/faculty/classes
 * @access  Private (Faculty)
 */
const getMyClasses = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const { search, section } = req.query;
    const query = {
      _id: { $in: faculty.assignedClasses },
      isActive: true,
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (section) {
      query.section = section.toUpperCase();
    }

    const classes = await Class.find(query).lean();

    const enrichedClasses = await Promise.all(
      classes.map(async (cls) => {
        const [studentCount, subjects] = await Promise.all([
          Student.countDocuments({ class: cls._id, isActive: true }),
          Subject.find({ class: cls._id, faculty: faculty._id, isActive: true }).select('name code credits'),
        ]);

        return {
          ...cls,
          studentCount,
          assignedSubjects: subjects,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedClasses.length,
      data: enrichedClasses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subjects assigned to logged-in faculty
 * @route   GET /api/faculty/subjects
 * @access  Private (Faculty)
 */
const getMySubjects = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const { search } = req.query;
    const query = {
      $or: [
        { _id: { $in: faculty.assignedSubjects } },
        { faculty: faculty._id },
      ],
      isActive: true,
    };

    if (search) {
      query.$and = [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const subjects = await Subject.find(query)
      .populate('class', 'name section academicYear')
      .lean();

    const enrichedSubjects = await Promise.all(
      subjects.map(async (sub) => {
        let studentCount = 0;
        let totalSessionsMarked = 0;
        if (sub.class?._id) {
          studentCount = await Student.countDocuments({ class: sub.class._id, isActive: true });
          totalSessionsMarked = await Attendance.countDocuments({ subject: sub._id, faculty: faculty._id });
        }

        return {
          ...sub,
          studentCount,
          totalSessionsMarked,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedSubjects.length,
      data: enrichedSubjects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get enrolled students for an assigned class
 * @route   GET /api/faculty/students/:classId
 * @access  Private (Faculty)
 */
const getClassStudents = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const { classId } = req.params;

    // Authorization check: class must be assigned to this faculty
    const isAssigned = faculty.assignedClasses.some((c) => c.toString() === classId);
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: You are not authorized to view students of this unassigned class.',
      });
    }

    const students = await Student.find({ class: classId, isActive: true })
      .select('fullName registrationNumber rollNumber section email')
      .sort({ rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark & Save Attendance for a Class and Subject
 * @route   POST /api/faculty/attendance
 * @access  Private (Faculty)
 */
const markAttendance = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const { classId, subjectId, date, records } = req.body;

    if (!classId || !subjectId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classId, subjectId, date, and student attendance records.',
      });
    }

    // Authorization check: class must be assigned
    const isClassAssigned = faculty.assignedClasses.some((c) => c.toString() === classId);
    if (!isClassAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot mark attendance for a class not assigned to you.',
      });
    }

    // Authorization check: subject must be assigned
    const isSubjectAssigned =
      faculty.assignedSubjects.some((s) => s.toString() === subjectId) ||
      (await Subject.exists({ _id: subjectId, faculty: faculty._id }));

    if (!isSubjectAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot mark attendance for a subject not assigned to you.',
      });
    }

    // Check duplicate attendance session for same date, class, and subject
    const sessionDate = new Date(date);
    const dayStart = new Date(sessionDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(sessionDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingSession = await Attendance.findOne({
      class: classId,
      subject: subjectId,
      date: { $gte: dayStart, $lte: dayEnd },
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: 'Attendance record already exists for this subject and date. You can edit the existing session in Attendance History.',
        existingSessionId: existingSession._id,
      });
    }

    // Clean & format records
    const formattedRecords = records.map((r) => ({
      student: r.student || r.studentId,
      status: ['present', 'absent', 'late', 'excused'].includes(r.status?.toLowerCase())
        ? r.status.toLowerCase()
        : 'present',
      remarks: r.remarks || '',
    }));

    const attendanceSession = await Attendance.create({
      date: sessionDate,
      class: classId,
      subject: subjectId,
      faculty: faculty._id,
      records: formattedRecords,
    });

    // Populate class and subject names for response and logging
    const [cls, subj] = await Promise.all([
      Class.findById(classId).select('name section'),
      Subject.findById(subjectId).select('name code'),
    ]);

    await ActivityLog.create({
      action: 'MARK_ATTENDANCE',
      entity: 'Attendance',
      entityId: attendanceSession._id,
      details: `${faculty.fullName} marked attendance for ${subj?.code || 'Course'} (${cls?.name || 'Class'} - ${cls?.section || 'Sec'}) with ${attendanceSession.totalPresent} present / ${attendanceSession.totalStudents} total`,
      performedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendanceSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Attendance History for Logged-In Faculty
 * @route   GET /api/faculty/attendance
 * @access  Private (Faculty)
 */
const getAttendanceHistory = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const { classId, subjectId, date, page = 1, limit = 20 } = req.query;

    const filter = { faculty: faculty._id };

    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;

    if (date) {
      const targetDate = new Date(date);
      const start = new Date(targetDate.setHours(0, 0, 0, 0));
      const end = new Date(targetDate.setHours(23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(filter);

    const sessions = await Attendance.find(filter)
      .populate('class', 'name section academicYear')
      .populate('subject', 'name code credits')
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

/**
 * @desc    Get single attendance session with student details
 * @route   GET /api/faculty/attendance/:id
 * @access  Private (Faculty)
 */
const getAttendanceSessionById = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const session = await Attendance.findById(req.params.id)
      .populate('class', 'name section academicYear')
      .populate('subject', 'name code credits')
      .populate('records.student', 'fullName registrationNumber rollNumber section');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found' });
    }

    // Check authorization: must belong to this faculty
    if (session.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: You cannot view attendance logs belonging to another faculty member.',
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update / Edit an Existing Attendance Session
 * @route   PUT /api/faculty/attendance/:id
 * @access  Private (Faculty)
 */
const updateAttendanceSession = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const session = await Attendance.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found' });
    }

    if (session.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: You cannot edit attendance logs marked by another faculty member.',
      });
    }

    const { records, date } = req.body;

    if (date) {
      session.date = new Date(date);
    }

    if (records && Array.isArray(records)) {
      session.records = records.map((r) => ({
        student: r.student || r.studentId,
        status: ['present', 'absent', 'late', 'excused'].includes(r.status?.toLowerCase())
          ? r.status.toLowerCase()
          : 'present',
        remarks: r.remarks || '',
      }));
    }

    await session.save();

    await ActivityLog.create({
      action: 'UPDATE_ATTENDANCE',
      entity: 'Attendance',
      entityId: session._id,
      details: `${faculty.fullName} updated attendance records for session on ${session.date.toDateString()}`,
      performedBy: req.user._id,
    });

    const populated = await Attendance.findById(session._id)
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .populate('records.student', 'fullName registrationNumber rollNumber');

    res.status(200).json({
      success: true,
      message: 'Attendance session updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Faculty Attendance Reports & Visual Analytics
 * @route   GET /api/faculty/reports
 * @access  Private (Faculty)
 */
const getFacultyReports = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const { classId, subjectId, days = 14 } = req.query;

    const filter = { faculty: faculty._id };
    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;

    const allSessions = await Attendance.find(filter)
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .sort({ date: 1 });

    let totalRecordedSessions = allSessions.length;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalRecords = 0;

    allSessions.forEach((s) => {
      totalPresent += s.totalPresent || 0;
      totalAbsent += s.totalAbsent || 0;
      totalLate += s.totalLate || 0;
      totalRecords += s.totalStudents || 0;
    });

    const overallPercentage = totalRecords > 0
      ? Math.round(((totalPresent + totalLate) / totalRecords) * 100)
      : 0;

    // Class-wise breakdown
    const classMap = {};
    allSessions.forEach((s) => {
      const clsName = s.class ? `${s.class.name} (${s.class.section})` : 'Class';
      if (!classMap[clsName]) {
        classMap[clsName] = { name: clsName, present: 0, absent: 0, total: 0 };
      }
      classMap[clsName].present += (s.totalPresent || 0) + (s.totalLate || 0);
      classMap[clsName].absent += s.totalAbsent || 0;
      classMap[clsName].total += s.totalStudents || 0;
    });

    const classWise = Object.values(classMap).map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    }));

    // Subject-wise breakdown
    const subjectMap = {};
    allSessions.forEach((s) => {
      const subCode = s.subject ? `${s.subject.code}` : 'Subject';
      if (!subjectMap[subCode]) {
        subjectMap[subCode] = {
          code: subCode,
          name: s.subject?.name || subCode,
          present: 0,
          absent: 0,
          total: 0,
        };
      }
      subjectMap[subCode].present += (s.totalPresent || 0) + (s.totalLate || 0);
      subjectMap[subCode].absent += s.totalAbsent || 0;
      subjectMap[subCode].total += s.totalStudents || 0;
    });

    const subjectWise = Object.values(subjectMap).map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    }));

    // Daily trend
    const dateMap = {};
    for (let i = Number(days); i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[key] = { date: key, displayDate, present: 0, absent: 0, total: 0, percentage: 0 };
    }

    allSessions.forEach((s) => {
      const key = new Date(s.date).toISOString().split('T')[0];
      if (dateMap[key]) {
        dateMap[key].present += (s.totalPresent || 0) + (s.totalLate || 0);
        dateMap[key].absent += s.totalAbsent || 0;
        dateMap[key].total += s.totalStudents || 0;
      }
    });

    const dailyTrend = Object.values(dateMap).map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSessions: totalRecordedSessions,
          totalPresent,
          totalAbsent,
          totalLate,
          totalRecords,
          overallPercentage,
        },
        classWise,
        classComparison: classWise,
        subjectWise,
        subjectBreakdown: subjectWise,
        dailyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Faculty Profile
 * @route   GET /api/faculty/profile
 * @access  Private (Faculty)
 */
const getProfile = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const populated = await Faculty.findById(faculty._id)
      .populate('assignedClasses', 'name section academicYear')
      .populate('assignedSubjects', 'name code credits');

    res.status(200).json({
      success: true,
      data: {
        ...populated.toObject(),
        faculty: populated,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Faculty Profile (Phone Number)
 * @route   PUT /api/faculty/profile
 * @access  Private (Faculty)
 */
const updateProfile = async (req, res, next) => {
  try {
    const faculty = await getFacultyDoc(req.user._id, req.user.email);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const { phoneNumber } = req.body;
    if (phoneNumber !== undefined) {
      faculty.phoneNumber = phoneNumber.trim();
      await faculty.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
