const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get all subjects with class and faculty details
 * @route   GET /api/admin/subjects
 * @access  Private (Admin)
 */
const getSubjects = async (req, res, next) => {
  try {
    const { search, classId, facultyId } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    if (classId) {
      query.class = classId;
    }

    if (facultyId) {
      query.faculty = facultyId;
    }

    const subjects = await Subject.find(query)
      .populate('class', 'name section academicYear')
      .populate('faculty', 'fullName email employeeId department')
      .sort({ code: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single subject by ID
 * @route   GET /api/admin/subjects/:id
 * @access  Private (Admin)
 */
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('class', 'name section academicYear')
      .populate('faculty', 'fullName email employeeId department');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new subject
 * @route   POST /api/admin/subjects
 * @access  Private (Admin)
 */
const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, class: classId, faculty: facultyId, credits } = req.body;

    if (!name || !code || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject name, unique subject code, and associated class.',
      });
    }

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Associated class not found.',
      });
    }

    // Check duplicate code
    const existingCode = await Subject.findOne({ code: code.trim().toUpperCase() });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: `Subject code '${code.trim().toUpperCase()}' is already in use.`,
      });
    }

    // If faculty assigned, verify faculty exists
    let assignedFaculty = null;
    if (facultyId) {
      assignedFaculty = await Faculty.findById(facultyId);
      if (!assignedFaculty) {
        return res.status(404).json({
          success: false,
          message: 'Selected faculty not found.',
        });
      }
    }

    const newSubject = await Subject.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      class: classId,
      faculty: facultyId || null,
      credits: credits || 3,
    });

    // If faculty was assigned, update faculty's assignedSubjects and assignedClasses
    if (assignedFaculty) {
      await Faculty.findByIdAndUpdate(assignedFaculty._id, {
        $addToSet: {
          assignedSubjects: newSubject._id,
          assignedClasses: classId,
        },
      });
    }

    await ActivityLog.create({
      action: 'CREATE_SUBJECT',
      entity: 'Subject',
      entityId: newSubject._id,
      details: `Created subject ${newSubject.name} (${newSubject.code}) for class ${classExists.name} (${classExists.section})`,
      performedBy: req.user._id,
    });

    const populated = await Subject.findById(newSubject._id)
      .populate('class', 'name section academicYear')
      .populate('faculty', 'fullName email employeeId department');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subject details or assign faculty
 * @route   PUT /api/admin/subjects/:id
 * @access  Private (Admin)
 */
const updateSubject = async (req, res, next) => {
  try {
    const { name, code, description, class: classId, faculty: facultyId, credits, isActive } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check code collision if code updated
    if (code && code.trim().toUpperCase() !== subject.code) {
      const codeExists = await Subject.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: subject._id },
      });
      if (codeExists) {
        return res.status(409).json({
          success: false,
          message: `Subject code '${code.trim().toUpperCase()}' is already in use.`,
        });
      }
      subject.code = code.trim().toUpperCase();
    }

    if (name) subject.name = name.trim();
    if (description !== undefined) subject.description = description.trim();
    if (credits !== undefined) subject.credits = credits;
    if (isActive !== undefined) subject.isActive = isActive;

    const oldFacultyId = subject.faculty?.toString();
    const newFacultyId = facultyId !== undefined ? facultyId : oldFacultyId;

    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
      subject.class = classId;
    }

    // Faculty assignment change
    if (facultyId !== undefined && oldFacultyId !== newFacultyId) {
      subject.faculty = newFacultyId || null;

      // Remove from old faculty's assignedSubjects
      if (oldFacultyId) {
        await Faculty.findByIdAndUpdate(oldFacultyId, {
          $pull: { assignedSubjects: subject._id },
        });
      }

      // Add to new faculty's assignedSubjects and assignedClasses
      if (newFacultyId) {
        await Faculty.findByIdAndUpdate(newFacultyId, {
          $addToSet: {
            assignedSubjects: subject._id,
            assignedClasses: subject.class,
          },
        });
      }
    }

    await subject.save();

    await ActivityLog.create({
      action: 'UPDATE_SUBJECT',
      entity: 'Subject',
      entityId: subject._id,
      details: `Updated subject ${subject.name} (${subject.code})`,
      performedBy: req.user._id,
    });

    const populated = await Subject.findById(subject._id)
      .populate('class', 'name section academicYear')
      .populate('faculty', 'fullName email employeeId department');

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete subject (safe dependency check)
 * @route   DELETE /api/admin/subjects/:id
 * @access  Private (Admin)
 */
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check attendance records
    const attendanceCount = await Attendance.countDocuments({ subject: subject._id });
    if (attendanceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subject '${subject.code}'. It has ${attendanceCount} linked attendance session(s).`,
      });
    }

    // Clean up faculty reference
    if (subject.faculty) {
      await Faculty.findByIdAndUpdate(subject.faculty, {
        $pull: { assignedSubjects: subject._id },
      });
    }

    await subject.deleteOne();

    await ActivityLog.create({
      action: 'DELETE_SUBJECT',
      entity: 'Subject',
      entityId: subject._id,
      details: `Deleted subject ${subject.name} (${subject.code})`,
      performedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign faculty to subject
 * @route   POST /api/admin/subjects/:id/assign-faculty
 * @access  Private (Admin)
 */
const assignFacultyToSubject = async (req, res, next) => {
  try {
    const { facultyId } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const oldFacultyId = subject.faculty?.toString();

    if (facultyId) {
      const faculty = await Faculty.findById(facultyId);
      if (!faculty) {
        return res.status(404).json({ success: false, message: 'Faculty not found' });
      }

      subject.faculty = faculty._id;
      await subject.save();

      // Add to new faculty
      await Faculty.findByIdAndUpdate(faculty._id, {
        $addToSet: {
          assignedSubjects: subject._id,
          assignedClasses: subject.class,
        },
      });
    } else {
      subject.faculty = null;
      await subject.save();
    }

    // Remove from old faculty if changed
    if (oldFacultyId && oldFacultyId !== facultyId) {
      await Faculty.findByIdAndUpdate(oldFacultyId, {
        $pull: { assignedSubjects: subject._id },
      });
    }

    const populated = await Subject.findById(subject._id)
      .populate('class', 'name section academicYear')
      .populate('faculty', 'fullName email employeeId department');

    res.status(200).json({
      success: true,
      message: 'Faculty assigned successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToSubject,
};
