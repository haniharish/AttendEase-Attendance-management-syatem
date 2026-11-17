const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get all students with pagination, search, and class/section filters
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
const getStudents = async (req, res, next) => {
  try {
    const { search, classId, section, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (classId) {
      query.class = classId;
    }

    if (section) {
      query.section = section.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Student.countDocuments(query);

    const students = await Student.find(query)
      .populate('class', 'name section academicYear')
      .populate('user', 'name email role')
      .sort({ 'class.name': 1, rollNumber: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student details with attendance record breakdown
 * @route   GET /api/admin/students/:id
 * @access  Private (Admin)
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name section academicYear')
      .populate('user', 'name email role');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Query attendance records for this student
    const attendanceSessions = await Attendance.find({
      'records.student': student._id,
    })
      .populate('subject', 'name code')
      .populate('faculty', 'fullName')
      .sort({ date: -1 })
      .limit(50)
      .lean();

    let totalSessions = attendanceSessions.length;
    let presentSessions = 0;
    let absentSessions = 0;

    const studentHistory = attendanceSessions.map((session) => {
      const record = session.records.find(
        (r) => r.student.toString() === student._id.toString()
      );
      const status = record ? record.status : 'absent';
      if (status === 'present' || status === 'late') presentSessions++;
      if (status === 'absent') absentSessions++;

      return {
        _id: session._id,
        date: session.date,
        subject: session.subject,
        faculty: session.faculty,
        status,
        remarks: record?.remarks || '',
      };
    });

    const percentage = totalSessions > 0
      ? Math.round((presentSessions / totalSessions) * 100)
      : 100;

    res.status(200).json({
      success: true,
      data: {
        ...student.toObject(),
        attendanceSummary: {
          totalSessions,
          presentSessions,
          absentSessions,
          percentage,
        },
        recentAttendance: studentHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new student
 * @route   POST /api/admin/students
 * @access  Private (Admin)
 */
const createStudent = async (req, res, next) => {
  try {
    const {
      fullName,
      registrationNumber,
      email,
      phoneNumber,
      class: classId,
      section,
      rollNumber,
      enrollmentDate,
    } = req.body;

    if (!fullName || !registrationNumber || !email || !classId || !section || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, registration number, email, class, section, and roll number.',
      });
    }

    const formattedRegNum = registrationNumber.trim().toUpperCase();
    const formattedEmail = email.trim().toLowerCase();
    const formattedSection = section.trim().toUpperCase();
    const formattedRoll = rollNumber.trim();

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Specified class does not exist.',
      });
    }

    // Check duplicate registration number
    const existingReg = await Student.findOne({ registrationNumber: formattedRegNum });
    if (existingReg) {
      return res.status(409).json({
        success: false,
        message: `Registration number '${formattedRegNum}' is already assigned to ${existingReg.fullName}.`,
      });
    }

    // Check duplicate email
    const existingEmail = await Student.findOne({ email: formattedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Email address '${formattedEmail}' is already in use by another student.`,
      });
    }

    // Check duplicate roll number in same class
    const existingRoll = await Student.findOne({ class: classId, rollNumber: formattedRoll });
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: `Roll number '${formattedRoll}' is already assigned to ${existingRoll.fullName} in this class.`,
      });
    }

    // Check or create associated User account
    let user = await User.findOne({ email: formattedEmail });
    if (!user) {
      user = await User.create({
        name: fullName.trim(),
        email: formattedEmail,
        password: 'StudentPassword123!',
        role: 'student',
        isActive: true,
      });
    }

    const newStudent = await Student.create({
      user: user._id,
      fullName: fullName.trim(),
      registrationNumber: formattedRegNum,
      email: formattedEmail,
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      class: classId,
      section: formattedSection,
      rollNumber: formattedRoll,
      enrollmentDate: enrollmentDate || Date.now(),
    });

    await ActivityLog.create({
      action: 'CREATE_STUDENT',
      entity: 'Student',
      entityId: newStudent._id,
      details: `Enrolled student ${newStudent.fullName} (${newStudent.registrationNumber}) in ${classExists.name} - ${formattedSection}`,
      performedBy: req.user._id,
    });

    const populated = await Student.findById(newStudent._id)
      .populate('class', 'name section academicYear')
      .populate('user', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student details
 * @route   PUT /api/admin/students/:id
 * @access  Private (Admin)
 */
const updateStudent = async (req, res, next) => {
  try {
    const {
      fullName,
      registrationNumber,
      email,
      phoneNumber,
      class: classId,
      section,
      rollNumber,
      enrollmentDate,
      isActive,
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (registrationNumber && registrationNumber.trim().toUpperCase() !== student.registrationNumber) {
      const dup = await Student.findOne({
        registrationNumber: registrationNumber.trim().toUpperCase(),
        _id: { $ne: student._id },
      });
      if (dup) {
        return res.status(409).json({
          success: false,
          message: `Registration number '${registrationNumber}' is already in use.`,
        });
      }
      student.registrationNumber = registrationNumber.trim().toUpperCase();
    }

    if (email && email.trim().toLowerCase() !== student.email) {
      const dup = await Student.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: student._id },
      });
      if (dup) {
        return res.status(409).json({
          success: false,
          message: `Email address '${email}' is already in use.`,
        });
      }
      student.email = email.trim().toLowerCase();
      if (student.user) {
        await User.findByIdAndUpdate(student.user, { email: student.email });
      }
    }

    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
      student.class = classId;
    }

    if (rollNumber) {
      const checkClass = classId || student.class;
      const dupRoll = await Student.findOne({
        class: checkClass,
        rollNumber: rollNumber.trim(),
        _id: { $ne: student._id },
      });
      if (dupRoll) {
        return res.status(409).json({
          success: false,
          message: `Roll number '${rollNumber}' is already in use in this class.`,
        });
      }
      student.rollNumber = rollNumber.trim();
    }

    if (fullName) {
      student.fullName = fullName.trim();
      if (student.user) {
        await User.findByIdAndUpdate(student.user, { name: student.fullName });
      }
    }

    if (phoneNumber !== undefined) student.phoneNumber = phoneNumber.trim();
    if (section) student.section = section.trim().toUpperCase();
    if (enrollmentDate) student.enrollmentDate = enrollmentDate;
    if (isActive !== undefined) {
      student.isActive = isActive;
      if (student.user) {
        await User.findByIdAndUpdate(student.user, { isActive });
      }
    }

    await student.save();

    await ActivityLog.create({
      action: 'UPDATE_STUDENT',
      entity: 'Student',
      entityId: student._id,
      details: `Updated student record for ${student.fullName} (${student.registrationNumber})`,
      performedBy: req.user._id,
    });

    const populated = await Student.findById(student._id)
      .populate('class', 'name section academicYear')
      .populate('user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student record
 * @route   DELETE /api/admin/students/:id
 * @access  Private (Admin)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Safely remove student references in attendance records
    await Attendance.updateMany(
      { 'records.student': student._id },
      { $pull: { records: { student: student._id } } }
    );

    // Deactivate user if exists
    if (student.user) {
      await User.findByIdAndUpdate(student.user, { isActive: false });
    }

    await student.deleteOne();

    await ActivityLog.create({
      action: 'DELETE_STUDENT',
      entity: 'Student',
      entityId: student._id,
      details: `Deleted student ${student.fullName} (${student.registrationNumber})`,
      performedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
