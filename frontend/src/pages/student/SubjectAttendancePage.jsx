import React, { useState, useEffect } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AttendanceProgressBar from '../../components/student/AttendanceProgressBar';
import { fetchStudentSubjectAttendance } from '../../services/studentService';
import {
  BookOpen,
  Search,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  AlertCircle,
  Info,
} from 'lucide-react';

const SubjectAttendancePage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchStudentSubjectAttendance();
        if (res.success && res.data) {
          setSubjects(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve subject attendance.');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const filteredSubjects = subjects.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      (s.faculty && s.faculty.fullName.toLowerCase().includes(term))
    );
  });

  return (
    <StudentLayout
      title="Subject-Wise Attendance"
      subtitle="Course-by-course attendance ratios, minimum thresholds, and recovery targets"
    >
      <div className="space-y-6">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Policy Info Card */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <p className="font-bold text-blue-950">Institutional 75% Attendance Requirement</p>
            <p className="mt-0.5 text-blue-800">
              Per university policy, students must maintain a minimum of 75% attendance in each registered subject to be eligible for end-semester examinations.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="p-4 sm:p-5 bg-white border border-slate-100 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course by name, code, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-text placeholder-slate-400 focus:outline-hidden focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
            />
          </div>
        </Card>

        {/* Subjects Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-semibold text-brand-muted">Calculating subject percentages...</p>
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((s) => {
              const isBelowThreshold = s.percentage < 75 && s.totalClasses > 0;
              const statusVariant =
                s.percentage >= 75 ? 'success' : s.percentage >= 65 ? 'warning' : 'danger';

              return (
                <Card
                  key={s.subjectId}
                  hoverEffect
                  className={`p-6 bg-white border transition-all flex flex-col justify-between ${
                    isBelowThreshold
                      ? 'border-red-200 shadow-sm shadow-red-500/5'
                      : 'border-slate-100 shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg shadow-2xs">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <Badge variant={statusVariant} size="md">
                        {s.code}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-brand-text tracking-tight">
                        {s.name}
                      </h3>
                      <p className="text-xs text-brand-muted mt-0.5 flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Instructor: {s.faculty?.fullName || 'Academic Faculty'}
                      </p>
                    </div>

                    {/* Progress Bar Component */}
                    <div className="pt-2">
                      <AttendanceProgressBar
                        percentage={s.percentage}
                        threshold={75}
                        size="md"
                        showLabel={true}
                      />
                    </div>

                    {/* Tally Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                        <p className="font-extrabold text-brand-text mt-0.5">{s.totalClasses}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <span className="text-[10px] uppercase font-bold text-emerald-700">Attended</span>
                        <p className="font-extrabold text-emerald-600 mt-0.5">{s.attendedClasses}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-100">
                        <span className="text-[10px] uppercase font-bold text-red-700">Missed</span>
                        <p className="font-extrabold text-red-500 mt-0.5">{s.missedClasses}</p>
                      </div>
                    </div>
                  </div>

                  {/* Warning / Target Footer Box */}
                  <div className="pt-4 mt-5 border-t border-slate-100">
                    {isBelowThreshold ? (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Shortage Alert ({s.percentage}%)</span>
                        </div>
                        {s.classesNeededToReachThreshold > 0 ? (
                          <p className="text-[11px] text-red-600 leading-snug">
                            Attend the next <span className="font-bold underline">{s.classesNeededToReachThreshold} class{s.classesNeededToReachThreshold > 1 ? 'es' : ''}</span> without absence to reach 75%.
                          </p>
                        ) : (
                          <p className="text-[11px] text-red-600 leading-snug">
                            Attendance is below the minimum 75% standard.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Eligible for Exam
                        </span>
                        <span className="font-bold">{s.percentage}%</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white border border-slate-100">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-text">No subjects found</h3>
            <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No registered courses match your search criteria.'
                : 'No course curricula are currently assigned to your class.'}
            </p>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
};

export default SubjectAttendancePage;
