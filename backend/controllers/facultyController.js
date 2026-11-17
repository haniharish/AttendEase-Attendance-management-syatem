const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get all faculty members with assigned classes and subjects
 * @route   GET /api/admin/faculty
 * @access  Private (Admin)
 */
const getFaculty = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = department;
    }

    const facultyList = await Faculty.find(query)
      .populate('assignedSubjects', 'name code class')
      .populate('assignedClasses', 'name section academicYear')
      .populate('user', 'name email role isActive')
      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      count: facultyList.length,
      data: facultyList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single faculty member by ID
 * @route   GET /api/admin/faculty/:id
 * @access  Private (Admin)
 */
const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('assignedSubjects', 'name code class credits')
      .populate('assignedClasses', 'name section academicYear')
      .populate('user', 'name email role isActive');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found',
      });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new faculty member & user login
 * @route   POST /api/admin/faculty
 * @access  Private (Admin)
 */
const createFaculty = async (req, res, next) => {
  try {
    const {
      fullName,
      employeeId,
      email,
      phoneNumber,
      department,
      password,
      assignedSubjects,
      assignedClasses,
    } = req.body;

    if (!fullName || !employeeId || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, employee ID, email address, and department.',
      });
    }

    const formattedEmpId = employeeId.trim().toUpperCase();
    const formattedEmail = email.trim().toLowerCase();

    // Check duplicate employee ID
    const existingEmpId = await Faculty.findOne({ employeeId: formattedEmpId });
    if (existingEmpId) {
      return res.status(409).json({
        success: false,
        message: `Employee ID '${formattedEmpId}' is already registered.`,
      });
    }

    // Check duplicate email in Faculty and User
    const [existingFacultyEmail, existingUser] = await Promise.all([
      Faculty.findOne({ email: formattedEmail }),
      User.findOne({ email: formattedEmail }),
    ]);

    if (existingFacultyEmail) {
      return res.status(409).json({
        success: false,
        message: `A faculty profile with email '${formattedEmail}' already exists.`,
      });
    }

    let user;
    if (existingUser) {
      // If user exists, ensure they are assigned role faculty
      existingUser.role = 'faculty';
      await existingUser.save();
      user = existingUser;
    } else {
      // Create new User account for faculty
      user = await User.create({
        name: fullName.trim(),
        email: formattedEmail,
        password: password || 'FacultyPassword123!',
        role: 'faculty',
        isActive: true,
      });
    }

    // Create Faculty Profile
    const newFaculty = await Faculty.create({
      user: user._id,
      fullName: fullName.trim(),
      employeeId: formattedEmpId,
      email: formattedEmail,
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      department: department.trim(),
      assignedSubjects: assignedSubjects || [],
      assignedClasses: assignedClasses || [],
    });

    // If assignedSubjects provided, update subjects' faculty field
    if (assignedSubjects && assignedSubjects.length > 0) {
      await Subject.updateMany(
        { _id: { $in: assignedSubjects } },
        { $set: { faculty: newFaculty._id } }
      );
    }

    await ActivityLog.create({
      action: 'CREATE_FACULTY',
      entity: 'Faculty',
      entityId: newFaculty._id,
      details: `Created faculty profile for ${newFaculty.fullName} (${newFaculty.employeeId}) in department ${newFaculty.department}`,
      performedBy: req.user._id,
    });

    const populated = await Faculty.findById(newFaculty._id)
      .populate('assignedSubjects', 'name code class')
      .populate('assignedClasses', 'name section academicYear')
      .populate('user', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully with login credentials',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update faculty details and assignments
 * @route   PUT /api/admin/faculty/:id
 * @access  Private (Admin)
 */
const updateFaculty = async (req, res, next) => {
  try {
    const {
      fullName,
      employeeId,
      email,
      phoneNumber,
      department,
      assignedSubjects,
      assignedClasses,
      isActive,
    } = req.body;

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found',
      });
    }

    if (employeeId && employeeId.trim().toUpperCase() !== faculty.employeeId) {
      const duplicateEmp = await Faculty.findOne({
        employeeId: employeeId.trim().toUpperCase(),
        _id: { $ne: faculty._id },
      });
      if (duplicateEmp) {
        return res.status(409).json({
          success: false,
          message: `Employee ID '${employeeId}' is already in use.`,
        });
      }
      faculty.employeeId = employeeId.trim().toUpperCase();
    }

    if (email && email.trim().toLowerCase() !== faculty.email) {
      const duplicateEmail = await Faculty.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: faculty._id },
      });
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: `Email address '${email}' is already in use.`,
        });
      }
      faculty.email = email.trim().toLowerCase();
      // Update User email as well
      await User.findByIdAndUpdate(faculty.user, { email: faculty.email });
    }

    if (fullName) {
      faculty.fullName = fullName.trim();
      await User.findByIdAndUpdate(faculty.user, { name: faculty.fullName });
    }
    if (phoneNumber !== undefined) faculty.phoneNumber = phoneNumber.trim();
    if (department) faculty.department = department.trim();
    if (isActive !== undefined) {
      faculty.isActive = isActive;
      await User.findByIdAndUpdate(faculty.user, { isActive });
    }

    // Update assigned subjects if provided
    if (assignedSubjects !== undefined) {
      // Remove faculty reference from previously assigned subjects no longer in list
      await Subject.updateMany(
        { faculty: faculty._id, _id: { $nin: assignedSubjects } },
        { $set: { faculty: null } }
      );
      // Assign faculty reference to new subjects
      await Subject.updateMany(
        { _id: { $in: assignedSubjects } },
        { $set: { faculty: faculty._id } }
      );
      faculty.assignedSubjects = assignedSubjects;
    }

    if (assignedClasses !== undefined) {
      faculty.assignedClasses = assignedClasses;
    }

    await faculty.save();

    await ActivityLog.create({
      action: 'UPDATE_FACULTY',
      entity: 'Faculty',
      entityId: faculty._id,
      details: `Updated faculty ${faculty.fullName} (${faculty.employeeId})`,
      performedBy: req.user._id,
    });

    const populated = await Faculty.findById(faculty._id)
      .populate('assignedSubjects', 'name code class')
      .populate('assignedClasses', 'name section academicYear')
      .populate('user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete faculty member
 * @route   DELETE /api/admin/faculty/:id
 * @access  Private (Admin)
 */
const deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found',
      });
    }

    // Unassign this faculty from any subjects
    await Subject.updateMany(
      { faculty: faculty._id },
      { $set: { faculty: null } }
    );

    // Deactivate or delete associated user account
    if (faculty.user) {
      await User.findByIdAndUpdate(faculty.user, { isActive: false });
    }

    await faculty.deleteOne();

    await ActivityLog.create({
      action: 'DELETE_FACULTY',
      entity: 'Faculty',
      entityId: faculty._id,
      details: `Deleted faculty ${faculty.fullName} (${faculty.employeeId})`,
      performedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Faculty member deleted and user deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign faculty to classes and subjects
 * @route   POST /api/admin/faculty/:id/assign
 * @access  Private (Admin)
 */
const assignFaculty = async (req, res, next) => {
  try {
    const { subjects = [], classes = [] } = req.body;
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // Update subjects
    await Subject.updateMany(
      { _id: { $in: subjects } },
      { $set: { faculty: faculty._id } }
    );

    faculty.assignedSubjects = Array.from(new Set([...faculty.assignedSubjects.map(String), ...subjects]));
    faculty.assignedClasses = Array.from(new Set([...faculty.assignedClasses.map(String), ...classes]));

    await faculty.save();

    const populated = await Faculty.findById(faculty._id)
      .populate('assignedSubjects', 'name code class')
      .populate('assignedClasses', 'name section academicYear');

    res.status(200).json({
      success: true,
      message: 'Assignments updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  assignFaculty,
};
