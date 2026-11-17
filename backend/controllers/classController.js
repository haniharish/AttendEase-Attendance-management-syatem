const Class = require('../models/Class');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get all classes with student and subject counts
 * @route   GET /api/admin/classes
 * @access  Private (Admin)
 */
const getClasses = async (req, res, next) => {
  try {
    const { search, academicYear } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } },
      ];
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    const classes = await Class.find(query).sort({ name: 1, section: 1 }).lean();

    // Attach student and subject counts
    const classIds = classes.map((c) => c._id);
    const [studentCounts, subjectCounts] = await Promise.all([
      Student.aggregate([
        { $match: { class: { $in: classIds }, isActive: true } },
        { $group: { _id: '$class', count: { $sum: 1 } } },
      ]),
      Subject.aggregate([
        { $match: { class: { $in: classIds }, isActive: true } },
        { $group: { _id: '$class', count: { $sum: 1 } } },
      ]),
    ]);

    const studentCountMap = {};
    studentCounts.forEach((s) => {
      studentCountMap[s._id.toString()] = s.count;
    });

    const subjectCountMap = {};
    subjectCounts.forEach((s) => {
      subjectCountMap[s._id.toString()] = s.count;
    });

    const enrichedClasses = classes.map((c) => ({
      ...c,
      studentCount: studentCountMap[c._id.toString()] || 0,
      subjectCount: subjectCountMap[c._id.toString()] || 0,
    }));

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
 * @desc    Get single class by ID with enrolled students and subjects
 * @route   GET /api/admin/classes/:id
 * @access  Private (Admin)
 */
const getClassById = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const [students, subjects] = await Promise.all([
      Student.find({ class: classItem._id, isActive: true }).select('fullName rollNumber registrationNumber email'),
      Subject.find({ class: classItem._id, isActive: true }).populate('faculty', 'fullName email employeeId'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...classItem.toObject(),
        students,
        subjects,
        studentCount: students.length,
        subjectCount: subjects.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new class
 * @route   POST /api/admin/classes
 * @access  Private (Admin)
 */
const createClass = async (req, res, next) => {
  try {
    const { name, section, academicYear, description } = req.body;

    if (!name || !section || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide class name, section, and academic year.',
      });
    }

    // Check duplicate
    const existing = await Class.findOne({
      name: name.trim(),
      section: section.trim().toUpperCase(),
      academicYear: academicYear.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Class '${name}' Section '${section}' for academic year '${academicYear}' already exists.`,
      });
    }

    const newClass = await Class.create({
      name: name.trim(),
      section: section.trim().toUpperCase(),
      academicYear: academicYear.trim(),
      description: description ? description.trim() : '',
    });

    // Log Activity
    await ActivityLog.create({
      action: 'CREATE_CLASS',
      entity: 'Class',
      entityId: newClass._id,
      details: `Created class ${newClass.name} (Section ${newClass.section}) for ${newClass.academicYear}`,
      performedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update class details
 * @route   PUT /api/admin/classes/:id
 * @access  Private (Admin)
 */
const updateClass = async (req, res, next) => {
  try {
    const { name, section, academicYear, description, isActive } = req.body;

    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    if (name) classItem.name = name.trim();
    if (section) classItem.section = section.trim().toUpperCase();
    if (academicYear) classItem.academicYear = academicYear.trim();
    if (description !== undefined) classItem.description = description.trim();
    if (isActive !== undefined) classItem.isActive = isActive;

    await classItem.save();

    await ActivityLog.create({
      action: 'UPDATE_CLASS',
      entity: 'Class',
      entityId: classItem._id,
      details: `Updated class ${classItem.name} (Section ${classItem.section})`,
      performedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: classItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete class (safe dependency check)
 * @route   DELETE /api/admin/classes/:id
 * @access  Private (Admin)
 */
const deleteClass = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // Dependency check: students and subjects
    const [studentCount, subjectCount] = await Promise.all([
      Student.countDocuments({ class: classItem._id }),
      Subject.countDocuments({ class: classItem._id }),
    ]);

    if (studentCount > 0 || subjectCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class. It contains ${studentCount} enrolled student(s) and ${subjectCount} subject(s). Please reassign or remove them first.`,
      });
    }

    await classItem.deleteOne();

    await ActivityLog.create({
      action: 'DELETE_CLASS',
      entity: 'Class',
      entityId: classItem._id,
      details: `Deleted class ${classItem.name} (Section ${classItem.section})`,
      performedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
