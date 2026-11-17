import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/admin/Modal';
import {
  fetchMyClasses,
  fetchMySubjects,
  fetchClassStudents,
  markAttendance,
} from '../../services/facultyService';
import {
  CheckSquare,
  Users,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

const MarkAttendancePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL query params initialization
  const initialClassId = searchParams.get('classId') || '';
  const initialSubjectId = searchParams.get('subjectId') || '';

  // Data sources
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  // Selection states
  const [selectedClass, setSelectedClass] = useState(initialClassId);
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Student records: { [studentId]: { status: 'present' | 'absent' | 'late', remarks: string } }
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Loading and feedback states
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [duplicateConflict, setDuplicateConflict] = useState(null);

  // Fetch initial assigned classes and subjects
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoadingInitial(true);
        setErrorMessage(null);
        const [clsRes, subjRes] = await Promise.all([
          fetchMyClasses(),
          fetchMySubjects(),
        ]);

        if (clsRes.success && clsRes.data) {
          setClasses(clsRes.data);
          if (!initialClassId && clsRes.data.length > 0) {
            setSelectedClass(clsRes.data[0]._id);
          }
        }
        if (subjRes.success && subjRes.data) {
          setSubjects(subjRes.data);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to fetch assigned classes or subjects.');
      } finally {
        setLoadingInitial(false);
      }
    };

    loadAssignments();
  }, [initialClassId]);

  // Filter available subjects based on selected class
  const availableSubjects = useMemo(() => {
    if (!selectedClass) return subjects;
    return subjects.filter((s) => {
      const classId = typeof s.class === 'object' ? s.class?._id : s.class;
      return classId === selectedClass;
    });
  }, [subjects, selectedClass]);

  // Automatically select a valid subject when available subjects change
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const match = availableSubjects.find((s) => s._id === selectedSubject);
      if (!match) {
        setSelectedSubject(availableSubjects[0]._id);
      }
    } else {
      setSelectedSubject('');
    }
  }, [availableSubjects, selectedSubject]);

  // Load students when selectedClass changes
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setAttendanceRecords({});
      return;
    }

    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        setErrorMessage(null);
        setDuplicateConflict(null);
        setSuccessData(null);

        const res = await fetchClassStudents(selectedClass);
        if (res.success && res.data) {
          setStudents(res.data);
          // Default all enrolled students to 'present'
          const initialMap = {};
          res.data.forEach((st) => {
            initialMap[st._id] = {
              status: 'present',
              remarks: '',
            };
          });
          setAttendanceRecords(initialMap);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load enrolled students.');
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedClass]);

  // Handlers to mark student status
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarkChange = (studentId, remarks) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  // Bulk actions
  const markAllStatus = (status) => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = {
        ...attendanceRecords[st._id],
        status,
      };
    });
    setAttendanceRecords(updated);
  };

  const handleReset = () => {
    markAllStatus('present');
  };

  // Live Summary Counts
  const summary = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    Object.values(attendanceRecords).forEach((rec) => {
      if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'late') late++;
    });

    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, absent, late, percentage };
  }, [students, attendanceRecords]);

  // Submit attendance records
  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setErrorMessage(null);
      setDuplicateConflict(null);

      const formattedRecords = students.map((st) => ({
        student: st._id,
        status: attendanceRecords[st._id]?.status || 'present',
        remarks: attendanceRecords[st._id]?.remarks || '',
      }));

      const payload = {
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate,
        records: formattedRecords,
      };

      const res = await markAttendance(payload);

      if (res.success && res.data) {
        setShowConfirmModal(false);
        setSuccessData(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setShowConfirmModal(false);
      const msg = err.message || 'An error occurred while saving attendance.';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already been marked')) {
        setDuplicateConflict({
          message: msg,
          date: selectedDate,
          classId: selectedClass,
          subjectId: selectedSubject,
        });
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClassObj = classes.find((c) => c._id === selectedClass);
  const selectedSubjectObj = subjects.find((s) => s._id === selectedSubject);

  return (
    <FacultyLayout
      title="Mark Attendance Roster"
      subtitle="Record and verify student presence for today's assigned lecture sessions"
    >
      <div className="space-y-6">
        {/* Success Alert Banner */}
        {successData && (
          <Card className="p-6 bg-emerald-50 border border-emerald-200 shadow-xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md shadow-emerald-600/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950">
                    Attendance Saved Successfully!
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Logged {successData.totalPresent} present, {successData.totalLate || 0} late, and {successData.totalAbsent} absent for{' '}
                    <span className="font-semibold">{selectedSubjectObj?.code || 'Course'}</span> ({new Date(selectedDate).toDateString()}).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuccessData(null)}
                  className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 font-bold"
                >
                  Take Another
                </Button>
                <Link to="/faculty/history">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    View in History
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Duplicate Session Conflict Warning */}
        {duplicateConflict && (
          <Card className="p-5 bg-amber-50 border border-amber-200 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-amber-900 space-y-1">
                <p className="font-bold text-sm text-amber-950">Duplicate Attendance Session Detected</p>
                <p>{duplicateConflict.message}</p>
                <div className="pt-2">
                  <Link
                    to={`/faculty/history?subjectId=${selectedSubject}`}
                    className="inline-flex items-center gap-1.5 font-bold text-amber-800 hover:underline"
                  >
                    <span>Inspect or edit session in Attendance History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* General Error Notice */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* 1. Selection Controls Card (Class, Subject, Date) */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text">Session Parameters</h3>
                <p className="text-[11px] text-brand-muted">Select assigned cohort, course, and lecture date</p>
              </div>
            </div>
            <Badge variant="blue" size="sm">
              Live Configuration
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Class Selection */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                1. Select Assigned Class <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={loadingInitial || classes.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all disabled:bg-slate-50"
                >
                  {classes.length === 0 ? (
                    <option value="">No classes assigned</option>
                  ) : (
                    classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} (Section {cls.section})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                2. Select Subject / Course <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={loadingInitial || availableSubjects.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all disabled:bg-slate-50"
              >
                {availableSubjects.length === 0 ? (
                  <option value="">No assigned subjects for this class</option>
                ) : (
                  availableSubjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} - {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                3. Attendance Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>
          </div>
        </Card>

        {/* 2. Real-Time Summary Counters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="p-4 bg-white border border-slate-100 shadow-2xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
            <p className="text-2xl font-extrabold text-brand-text mt-0.5">{summary.total}</p>
          </Card>
          <Card className="p-4 bg-emerald-50/60 border border-emerald-100 shadow-2xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Present</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{summary.present}</p>
          </Card>
          <Card className="p-4 bg-amber-50/60 border border-amber-100 shadow-2xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Late</p>
            <p className="text-2xl font-extrabold text-amber-500 mt-0.5">{summary.late}</p>
          </Card>
          <Card className="p-4 bg-red-50/60 border border-red-100 shadow-2xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Absent</p>
            <p className="text-2xl font-extrabold text-red-500 mt-0.5">{summary.absent}</p>
          </Card>
          <Card className="col-span-2 sm:col-span-1 p-4 bg-blue-50/60 border border-blue-100 shadow-2xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">Turnout Rate</p>
            <p className="text-2xl font-extrabold text-brand-blue mt-0.5">{summary.percentage}%</p>
          </Card>
        </div>

        {/* 3. Action Controls & Student Attendance Roster */}
        <Card className="bg-white border border-slate-100 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
            <div>
              <h3 className="text-base font-bold text-brand-text">Class Roster</h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Mark status for each student enrolled in {selectedClassObj ? `${selectedClassObj.name} (${selectedClassObj.section})` : 'Class'}
              </p>
            </div>

            {/* Quick Bulk Marking Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllStatus('present')}
                disabled={students.length === 0}
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs font-bold"
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllStatus('absent')}
                disabled={students.length === 0}
                className="text-red-700 border-red-200 hover:bg-red-50 text-xs font-bold"
              >
                Mark All Absent
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReset}
                disabled={students.length === 0}
                className="text-slate-600 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loadingStudents ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm font-semibold text-brand-muted">Fetching enrolled learners...</p>
              </div>
            ) : students.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4 w-16">Roll #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Reg Number</th>
                    <th className="py-3 px-4 text-center">Status Control</th>
                    <th className="py-3 px-4">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.map((student, idx) => {
                    const currentRecord = attendanceRecords[student._id] || {
                      status: 'present',
                      remarks: '',
                    };
                    const currentStatus = currentRecord.status;

                    return (
                      <tr
                        key={student._id}
                        className={`transition-colors ${
                          currentStatus === 'absent'
                            ? 'bg-red-50/20 hover:bg-red-50/40'
                            : currentStatus === 'late'
                            ? 'bg-amber-50/20 hover:bg-amber-50/40'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Roll Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                          {student.rollNumber || String(idx + 1).padStart(2, '0')}
                        </td>

                        {/* Student Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-xs shrink-0">
                              {student.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-brand-text truncate">
                                {student.fullName}
                              </p>
                              <p className="text-[11px] text-brand-muted truncate">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Registration Number */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {student.registrationNumber}
                          </span>
                        </td>

                        {/* Interactive Status Marking Buttons */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5 bg-slate-100/70 p-1 rounded-xl max-w-fit mx-auto border border-slate-200/60">
                            {/* Present Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, 'present')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs scale-102'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white/60'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Late Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, 'late')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                currentStatus === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs scale-102'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-white/60'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>

                            {/* Absent Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, 'absent')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                currentStatus === 'absent'
                                  ? 'bg-red-500 text-white shadow-xs scale-102'
                                  : 'text-slate-600 hover:text-red-700 hover:bg-white/60'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>
                          </div>
                        </td>

                        {/* Remarks Input */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <input
                            type="text"
                            placeholder="Optional note..."
                            value={currentRecord.remarks}
                            onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 text-brand-text placeholder-slate-400 focus:outline-hidden focus:border-brand-blue"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-brand-muted">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-brand-text">No students enrolled in this class</p>
                <p className="text-xs text-brand-muted mt-1">Please select another class or contact administration.</p>
              </div>
            )}
          </div>

          {/* Bottom Submission Bar */}
          {students.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-brand-muted">
                Reviewing <span className="font-bold text-brand-text">{summary.present} present</span>,{' '}
                <span className="font-bold text-amber-600">{summary.late} late</span>, and{' '}
                <span className="font-bold text-red-600">{summary.absent} absent</span> learners.
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedClass || !selectedSubject || students.length === 0}
                  onClick={() => setShowConfirmModal(true)}
                  className="font-bold flex items-center gap-2 shadow-md shadow-brand-blue/20"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Submit Attendance Roster</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 4. Confirmation Dialog Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Attendance Submission"
          maxWidth="max-w-lg"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700">Class:</span>
                <span className="font-bold text-blue-950">
                  {selectedClassObj ? `${selectedClassObj.name} (${selectedClassObj.section})` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700">Subject:</span>
                <span className="font-bold text-blue-950">
                  {selectedSubjectObj ? `${selectedSubjectObj.code} - ${selectedSubjectObj.name}` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700">Date:</span>
                <span className="font-bold text-blue-950">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Attendance Tally Box */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
                <p className="text-lg font-bold text-brand-text">{summary.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] uppercase font-bold text-emerald-700">Present</p>
                <p className="text-lg font-bold text-emerald-600">{summary.present}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[10px] uppercase font-bold text-amber-700">Late</p>
                <p className="text-lg font-bold text-amber-500">{summary.late}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-[10px] uppercase font-bold text-red-700">Absent</p>
                <p className="text-lg font-bold text-red-500">{summary.absent}</p>
              </div>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed">
              Are you sure you want to save this attendance record? This will log an official session and update the student attendance averages.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Go Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleConfirmSubmit}
                loading={submitting}
                className="font-bold"
              >
                Confirm & Save
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </FacultyLayout>
  );
};

export default MarkAttendancePage;
