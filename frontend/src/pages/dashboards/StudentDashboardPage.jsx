import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/admin/StatCard';
import AttendanceProgressBar from '../../components/student/AttendanceProgressBar';
import AttendanceWarning from '../../components/student/AttendanceWarning';
import { fetchStudentDashboard } from '../../services/studentService';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const StudentDashboardPage = () => {
  const [data, setData] = useState({
    stats: {
      overallPercentage: 100,
      totalConducted: 0,
      totalAttended: 0,
      totalPresent: 0,
      totalLate: 0,
      totalMissed: 0,
    },
    student: null,
    subjectSummaries: [],
    monthlyTrend: [],
    recentActivity: [],
    warnings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchStudentDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load student dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <StudentLayout title="Student Dashboard" subtitle="Loading your academic attendance profile...">
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-brand-muted">Retrieving attendance logs and course percentages...</p>
        </div>
      </StudentLayout>
    );
  }

  const { stats, student, subjectSummaries = [], monthlyTrend = [], recentActivity = [], warnings = [] } = data;

  const isLowAttendance = stats.overallPercentage < 75;

  return (
    <StudentLayout
      title="Student Attendance Hub"
      subtitle="Personal attendance metrics, subject breakdown, and status alerts"
      student={student}
      stats={stats}
      recentSessions={recentActivity}
    >
      <div className="space-y-8">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* 1. Low Attendance Warnings Banner (if any) */}
        <AttendanceWarning warnings={warnings} />

        {/* 2. Welcome & Status Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-blue via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-brand-blue/15">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Active Academic Session
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {student?.fullName || 'Student'}!
              </h2>
              <p className="text-sm text-blue-100 leading-relaxed">
                Your cumulative attendance stands at{' '}
                <span className="font-extrabold underline">{stats.overallPercentage}%</span>. Keep attending your scheduled lectures to ensure examination clearance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/student/subjects">
                <Button
                  variant="white"
                  className="bg-white text-brand-blue hover:bg-slate-50 font-bold shadow-md shadow-black/10 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-brand-blue" />
                  <span>Subject Breakdown</span>
                </Button>
              </Link>
              <Link to="/student/history">
                <Button
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 font-bold flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>View History</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none blur-2xl" />
        </div>

        {/* 3. Top Metrics Row (5 Key Statistics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Overall Attendance"
            value={`${stats.overallPercentage}%`}
            subtitle={stats.overallPercentage >= 75 ? 'Healthy status' : 'Below threshold'}
            icon={TrendingUp}
            color={stats.overallPercentage >= 75 ? 'green' : 'pink'}
          />
          <StatCard
            title="Total Conducted"
            value={stats.totalConducted}
            subtitle="Lectures scheduled"
            icon={CalendarCheck}
            color="blue"
          />
          <StatCard
            title="Classes Attended"
            value={stats.totalAttended}
            subtitle="Present & late"
            icon={CheckCircle2}
            color="purple"
          />
          <StatCard
            title="Classes Missed"
            value={stats.totalMissed}
            subtitle="Recorded absences"
            icon={XCircle}
            color="pink"
          />
          <StatCard
            title="Late Arrivals"
            value={stats.totalLate}
            subtitle="Delayed sign-ins"
            icon={Clock}
            color="orange"
          />
        </div>

        {/* 4. Middle Section: Overview Chart & Subject Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Attendance Overview Chart (2 Columns) */}
          <Card className="lg:col-span-2 p-6 bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-brand-text">
                    Monthly Attendance Overview
                  </h3>
                  <p className="text-xs text-brand-muted mt-0.5">
                    Attendance rate trajectory over recent months
                  </p>
                </div>
                <Badge variant="blue" size="sm">
                  Semester Trajectory
                </Badge>
              </div>

              <div className="h-64 mt-6">
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="studentTrendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        unit="%"
                      />
                      <Tooltip
                        formatter={(val) => [`${val}%`, 'Attendance Rate']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="#0d6efd"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#studentTrendGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                    No monthly attendance data recorded yet.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-brand-muted">
              <span>Threshold baseline: 75%</span>
              <Link to="/student/analytics" className="font-semibold text-brand-blue hover:underline flex items-center gap-1">
                Visual Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Subject Attendance Summary (1 Column) */}
          <Card className="p-6 bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-brand-text">Subject Summary</h3>
                <Link to="/student/subjects" className="text-xs font-semibold text-brand-blue hover:underline">
                  All ({subjectSummaries.length})
                </Link>
              </div>

              <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {subjectSummaries.length > 0 ? (
                  subjectSummaries.map((s) => (
                    <div
                      key={s.subjectId}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-brand-text truncate">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-100 text-brand-blue font-bold shrink-0">
                          {s.code}
                        </span>
                      </div>

                      <AttendanceProgressBar
                        percentage={s.percentage}
                        threshold={75}
                        size="sm"
                        showLabel={true}
                      />

                      <div className="flex items-center justify-between text-[10px] text-brand-muted pt-1">
                        <span>{s.attended}/{s.totalClasses} classes attended</span>
                        {s.isWarning && (
                          <span className="font-bold text-red-500">
                            Below 75%
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-brand-muted">
                    No curriculum subjects found for your class.
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/student/subjects"
              className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-brand-text font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              <span>Explore All Subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>

        {/* 5. Recent Attendance Activity */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-brand-text">
                Recent Attendance Activity
              </h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Latest lecture entries recorded by your instructors
              </p>
            </div>
            <Link to="/student/history">
              <Button variant="outline" size="sm" className="font-semibold text-xs">
                View Full Attendance History
              </Button>
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            {recentActivity.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {recentActivity.map((session, idx) => {
                    const sessionDate = new Date(session.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr key={session.sessionId || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-brand-text whitespace-nowrap">
                          {sessionDate}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-brand-text">
                            {session.subject?.code}
                          </span>{' '}
                          <span className="text-brand-muted text-[11px]">
                            ({session.subject?.name})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {session.faculty?.fullName || 'Assigned Faculty'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              session.status === 'present'
                                ? 'success'
                                : session.status === 'late'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-brand-muted italic max-w-xs truncate">
                          {session.remarks || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-brand-muted">
                <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-brand-text">No attendance records logged yet</p>
                <p className="text-xs text-brand-muted mt-1">Lecture records will appear as your faculty takes attendance.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboardPage;
