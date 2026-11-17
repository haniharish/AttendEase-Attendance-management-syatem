import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/admin/Modal';
import {
  fetchAttendanceHistory,
  fetchAttendanceSession,
  updateAttendanceSession,
  fetchMyClasses,
  fetchMySubjects,
} from '../../services/facultyService';
import {
  Clock,
  Search,
  Filter,
  Eye,
  Edit2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  RotateCcw,
} from 'lucide-react';

const AttendanceHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const querySessionId = searchParams.get('sessionId');
  const querySubjectId = searchParams.get('subjectId');
  const queryClassId = searchParams.get('classId');

  const [history, setHistory] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState(queryClassId || 'ALL');
  const [subjectFilter, setSubjectFilter] = useState(querySubjectId || 'ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [viewSession, setViewSession] = useState(null);
  const [loadingSessionDetails, setLoadingSessionDetails] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [editRecords, setEditRecords] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [histRes, clsRes, subjRes] = await Promise.all([
          fetchAttendanceHistory(),
          fetchMyClasses(),
          fetchMySubjects(),
        ]);

        if (histRes.success && histRes.data) {
          setHistory(histRes.data);
        }
        if (clsRes.success && clsRes.data) {
          setClasses(clsRes.data);
        }
        if (subjRes.success && subjRes.data) {
          setSubjects(subjRes.data);
        }

        // If querySessionId was provided, auto-open view modal
        if (querySessionId) {
          handleOpenView(querySessionId);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve attendance logs.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [querySessionId]);

  // Open View Session Modal
  const handleOpenView = async (sessionId) => {
    try {
      setLoadingSessionDetails(true);
      const res = await fetchAttendanceSession(sessionId);
      if (res.success && res.data) {
        setViewSession(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve session details.');
    } finally {
      setLoadingSessionDetails(false);
    }
  };

  // Open Edit Session Modal
  const handleOpenEdit = async (session) => {
    try {
      setLoadingSessionDetails(true);
      const res = await fetchAttendanceSession(session._id);
      if (res.success && res.data) {
        setEditSession(res.data);
        setEditRecords(
          res.data.records.map((r) => ({
            student: r.student?._id || r.student,
            fullName: r.student?.fullName || 'Student',
            rollNumber: r.student?.rollNumber || '',
            registrationNumber: r.student?.registrationNumber || '',
            status: r.status,
            remarks: r.remarks || '',
          }))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to load session for editing.');
    } finally {
      setLoadingSessionDetails(false);
    }
  };

  // Change status in edit modal
  const handleEditStatusChange = (index, status) => {
    setEditRecords((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status };
      return copy;
    });
  };

  const handleEditRemarkChange = (index, remarks) => {
    setEditRecords((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], remarks };
      return copy;
    });
  };

  // Save edited attendance
  const handleSaveEdit = async () => {
    try {
      setSavingEdit(true);
      setError(null);
      const payload = {
        records: editRecords.map((r) => ({
          student: r.student,
          status: r.status,
          remarks: r.remarks,
        })),
      };

      const res = await updateAttendanceSession(editSession._id, payload);
      if (res.success && res.data) {
        // Update local history
        setHistory((prev) =>
          prev.map((s) => (s._id === res.data._id ? res.data : s))
        );
        setEditSession(null);
        setSaveSuccess('Attendance session was successfully rectified!');
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update attendance session.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Client-side filtering
  const filteredHistory = history.filter((session) => {
    const sessionDate = new Date(session.date).toISOString().split('T')[0];
    const className = session.class?.name?.toLowerCase() || '';
    const subjectName = session.subject?.name?.toLowerCase() || '';
    const subjectCode = session.subject?.code?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      className.includes(term) ||
      subjectName.includes(term) ||
      subjectCode.includes(term);

    const matchesClass =
      classFilter === 'ALL' || session.class?._id === classFilter;
    const matchesSubject =
      subjectFilter === 'ALL' || session.subject?._id === subjectFilter;
    const matchesDate = !dateFilter || sessionDate === dateFilter;

    return matchesSearch && matchesClass && matchesSubject && matchesDate;
  });

  return (
    <FacultyLayout
      title="Attendance History & Logs"
      subtitle="Comprehensive audit trail and records of previously marked lectures"
    >
      <div className="space-y-6">
        {/* Save success feedback */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <p className="font-semibold">{saveSuccess}</p>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Search & Multi-criteria Filter Bar */}
        <Card className="p-4 sm:p-5 bg-white border border-slate-100 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search class or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-text placeholder-slate-400 focus:outline-hidden focus:border-brand-blue"
              />
            </div>

            {/* Class Filter */}
            <div>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue"
              >
                <option value="ALL">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.section})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  title="Clear date"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Sessions Table Card */}
        <Card className="bg-white border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div>
              <h3 className="text-base font-bold text-brand-text">Past Lecture Sessions</h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Showing {filteredHistory.length} recorded attendance logs
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm font-semibold text-brand-muted">Loading attendance ledger...</p>
              </div>
            ) : filteredHistory.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Session Date</th>
                    <th className="py-3.5 px-4">Course / Subject</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4 text-center">Present</th>
                    <th className="py-3.5 px-4 text-center">Late</th>
                    <th className="py-3.5 px-4 text-center">Absent</th>
                    <th className="py-3.5 px-4 text-center">Turnout</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredHistory.map((s) => {
                    const sessionDate = new Date(s.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const rate =
                      s.totalStudents > 0
                        ? Math.round(
                            (((s.totalPresent || 0) + (s.totalLate || 0)) / s.totalStudents) *
                              100
                          )
                        : 0;

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Date */}
                        <td className="py-3.5 px-4 font-semibold text-brand-text whitespace-nowrap">
                          {sessionDate}
                        </td>

                        {/* Subject */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-brand-text">{s.subject?.code}</p>
                          <p className="text-[11px] text-brand-muted truncate max-w-[180px]">
                            {s.subject?.name}
                          </p>
                        </td>

                        {/* Class */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge variant="blue" size="sm">
                            {s.class?.name} ({s.class?.section})
                          </Badge>
                        </td>

                        {/* Present */}
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                          {s.totalPresent}
                        </td>

                        {/* Late */}
                        <td className="py-3.5 px-4 text-center font-bold text-amber-500">
                          {s.totalLate || 0}
                        </td>

                        {/* Absent */}
                        <td className="py-3.5 px-4 text-center font-bold text-red-500">
                          {s.totalAbsent}
                        </td>

                        {/* Turnout % */}
                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            variant={rate >= 75 ? 'success' : rate >= 60 ? 'warning' : 'danger'}
                            size="sm"
                          >
                            {rate}%
                          </Badge>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenView(s._id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-blue hover:bg-slate-100 transition-colors"
                              title="View session roster"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(s)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-orange hover:bg-slate-100 transition-colors"
                              title="Edit / Rectify records"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-brand-muted">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-brand-text">No attendance logs found</p>
                <p className="text-xs text-brand-muted mt-1">Try relaxing your search or filter filters.</p>
              </div>
            )}
          </div>
        </Card>

        {/* 1. View Session Detail Modal */}
        <Modal
          isOpen={!!viewSession}
          onClose={() => setViewSession(null)}
          title="Attendance Session Breakdown"
          maxWidth="max-w-2xl"
        >
          {viewSession && (
            <div className="space-y-5">
              {/* Session Meta Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Date</span>
                  <p className="font-bold text-brand-text mt-0.5">
                    {new Date(viewSession.date).toDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Class</span>
                  <p className="font-bold text-brand-text mt-0.5">
                    {viewSession.class?.name} ({viewSession.class?.section})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Course</span>
                  <p className="font-bold text-brand-text mt-0.5">
                    {viewSession.subject?.code}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Turnout</span>
                  <p className="font-bold text-emerald-600 mt-0.5">
                    {viewSession.totalPresent} / {viewSession.totalStudents} (
                    {viewSession.totalStudents > 0
                      ? Math.round((viewSession.totalPresent / viewSession.totalStudents) * 100)
                      : 0}
                    %)
                  </p>
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Roll</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewSession.records?.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 px-4 font-mono font-semibold text-slate-400">
                          {r.student?.rollNumber || i + 1}
                        </td>
                        <td className="py-2 px-4 font-bold text-brand-text">
                          {r.student?.fullName || 'Student'}
                        </td>
                        <td className="py-2 px-4">
                          <Badge
                            variant={
                              r.status === 'present'
                                ? 'success'
                                : r.status === 'late'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-brand-muted italic">
                          {r.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="secondary" size="sm" onClick={() => setViewSession(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* 2. Edit Session Modal */}
        <Modal
          isOpen={!!editSession}
          onClose={() => setEditSession(null)}
          title="Rectify / Edit Attendance Session"
          maxWidth="max-w-2xl"
        >
          {editSession && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <p>
                  Editing attendance for <span className="font-bold">{editSession.subject?.code}</span> on{' '}
                  <span className="font-bold">{new Date(editSession.date).toDateString()}</span>. All edits will be logged with your faculty credentials.
                </p>
              </div>

              {/* Student editable list */}
              <div className="max-h-96 overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-100 text-xs">
                {editRecords.map((r, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-brand-text truncate">
                        {r.rollNumber ? `#${r.rollNumber} - ` : ''}
                        {r.fullName}
                      </p>
                      <input
                        type="text"
                        placeholder="Remarks / justification..."
                        value={r.remarks}
                        onChange={(e) => handleEditRemarkChange(idx, e.target.value)}
                        className="mt-1 w-full max-w-xs text-[11px] px-2 py-1 rounded-md border border-slate-200"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditStatusChange(idx, 'present')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          r.status === 'present'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditStatusChange(idx, 'late')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          r.status === 'late'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-amber-700'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditStatusChange(idx, 'absent')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          r.status === 'absent'
                            ? 'bg-red-500 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-red-700'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setEditSession(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSaveEdit}
                  loading={savingEdit}
                  className="font-bold"
                >
                  Save Corrections
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </FacultyLayout>
  );
};

export default AttendanceHistoryPage;
