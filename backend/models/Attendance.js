const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'present',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Please provide the attendance date'],
      index: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Please specify the class'],
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Please specify the subject'],
      index: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Please specify the faculty member'],
    },
    records: [attendanceRecordSchema],
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalAbsent: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate present and absent totals before saving
attendanceSchema.pre('save', function (next) {
  if (this.records && Array.isArray(this.records)) {
    this.totalStudents = this.records.length;
    this.totalPresent = this.records.filter((r) => r.status === 'present' || r.status === 'late').length;
    this.totalAbsent = this.records.filter((r) => r.status === 'absent').length;
  }
  next();
});

// Index to prevent duplicate attendance logs for same class, subject and date
attendanceSchema.index({ date: 1, class: 1, subject: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
