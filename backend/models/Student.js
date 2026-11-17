const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide the student full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please provide a unique registration number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Please assign a class to the student'],
    },
    section: {
      type: String,
      required: [true, 'Please specify section'],
      trim: true,
      uppercase: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Please provide a roll number'],
      trim: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on class and rollNumber to avoid duplicate rolls in same class
studentSchema.index({ class: 1, rollNumber: 1 }, { unique: true });
studentSchema.index({ user: 1 });

module.exports = mongoose.model('Student', studentSchema);
