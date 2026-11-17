const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a class or program name'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Please provide a section (e.g. A, B)'],
      trim: true,
      uppercase: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Please provide an academic year (e.g. 2026-2027)'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure uniqueness of class name, section, and academic year
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

// Virtual to populate students
classSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'class',
});

// Virtual to populate subjects
classSchema.virtual('subjects', {
  ref: 'Subject',
  localField: '_id',
  foreignField: 'class',
});

module.exports = mongoose.model('Class', classSchema);
