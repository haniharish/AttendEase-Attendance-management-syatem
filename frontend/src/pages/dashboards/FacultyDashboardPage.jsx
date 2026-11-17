import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/admin/StatCard';
import { fetchFacultyDashboard } from '../../services/facultyService';
import {
  Layers,
  BookOpen,
  Users,
  CheckSquare,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const FacultyDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    counts: {
      totalAssignedClasses: 0,
      totalAssignedSubjects: 0,
      totalStudentsUnderFaculty: 0,
      todaySessionsCount: 0,
      todayPresent: 0,
      todayAbsent: 0,
      todayLate: 0,
      overallRate: 0,
    },
    weeklyTrend: [],
    recentSessions: [],
    assignedClasses: [],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchFacultyDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load faculty dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <FacultyLayout title="Faculty Dashboard" subtitle="Loading your academic hub...">
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-brand-muted">Fetching assigned classes and attendance logs...</p>
        </div>
      </FacultyLayout>
    );
  }

  const { counts, weeklyTrend = [], recentSessions = [], assignedClasses = [] } = data;

  return (
    <FacultyLayout
      title="Faculty Dashboard"
      subtitle="Classroom roster management, session marking, and lecture attendance analytics"
      recentSessions={recentSessions}
      stats={counts}
    >
      <div className="space-y-8">
        {/* Error Alert if any */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* 1. Quick Welcome & Call-To-Action Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-blue via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-brand-blue/15">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Live Attendance Workspace
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to take attendance today?
              </h2>
              <p className="text-sm text-blue-100 leading-relaxed">
                Seamlessly mark student presence, log late arrivals, and generate instant session summaries for your assigned classes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/faculty/mark-attendance">
                <Button
                  variant="white"
                  className="bg-white text-brand-blue hover:bg-slate-50 font-bold shadow-md shadow-black/10 flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4 text-brand-blue" />
                  <span>Mark Attendance</span>
                </Button>
              </Link>
              <Link to="/faculty/history">
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
          {/* Subtle background decoration circle */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none blur-2xl" />
        </div>

        {/* 2. Top Statistics Row (5 Core Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Assigned Classes"
            value={counts.totalAssignedClasses || 0}
            subtitle="Active cohorts"
            icon={Layers}
            color="blue"
          />
          <StatCard
            title="Assigned Subjects"
            value={counts.totalAssignedSubjects || 0}
            subtitle="Curriculum courses"
            icon={BookOpen}
            color="purple"
          />
          <StatCard
            title="Students Under Faculty"
            value={counts.totalStudentsUnderFaculty || 0}
            subtitle="Enrolled learners"
            icon={Users}
            color="orange"
          />
          <StatCard
            title="Today's Sessions"
            value={counts.todaySessionsCount || 0}
            subtitle={`${counts.todayPresent || 0} present today`}
            icon={CalendarCheck}
            color="green"
          />
          <StatCard
            title="Turnout Rate"
            value={`${counts.overallRate || 0}%`}
            subtitle="Average attendance"
            icon={TrendingUp}
            color="pink"
          />
        </div>

        {/* 3. Middle Section: Weekly Attendance Chart & Class Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Attendance Overview Chart (2 Columns) */}
          <Card className="lg:col-span-2 p-6 bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-brand-text">
                    Weekly Attendance Overview
                  </h3>
                  <p className="text-xs text-brand-muted mt-0.5">
                    Presence, absence and late trend over the past 7 days
                  </p>
                </div>
                <Badge variant="blue" size="sm">
                  Last 7 Days
                </Badge>
              </div>

              <div className="h-72 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
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
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: '16px', fontSize: '11px', fontWeight: '600' }}
                    />
                    <Bar
                      dataKey="present"
                      name="Present"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="late"
                      name="Late"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="absent"
                      name="Absent"
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-brand-muted">
              <span>Automatic roll tally synchronized</span>
              <Link to="/faculty/reports" className="font-semibold text-brand-blue hover:underline flex items-center gap-1">
                Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Assigned Classes Summary (1 Column) */}
          <Card className="p-6 bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-brand-text">My Classes</h3>
                <Link to="/faculty/classes" className="text-xs font-semibold text-brand-blue hover:underline">
                  All ({assignedClasses.length})
                </Link>
              </div>

              <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {assignedClasses.length > 0 ? (
                  assignedClasses.map((cls) => (
                    <div
                      key={cls._id}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-brand-text truncate">
                            {cls.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-brand-blue font-bold">
                            Sec {cls.section}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-muted mt-0.5">
                          {cls.studentCount || 0} Students • {cls.academicYear || '2026-2027'}
                        </p>
                      </div>
                      <Link
                        to={`/faculty/mark-attendance?classId=${cls._id}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-blue hover:bg-white transition-colors"
                        title="Mark Attendance for Class"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-brand-muted">
                    No classes assigned yet. Please contact administration.
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/faculty/classes"
              className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-brand-text font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              <span>Manage Class Cohorts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>

        {/* 4. Recent Attendance Activity Table */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-brand-text">
                Recent Attendance Sessions
              </h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Latest lecture rosters marked and logged to database
              </p>
            </div>
            <Link to="/faculty/history">
              <Button variant="outline" size="sm" className="font-semibold text-xs">
                View Full Log History
              </Button>
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            {recentSessions.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Present</th>
                    <th className="py-3 px-4">Late</th>
                    <th className="py-3 px-4">Absent</th>
                    <th className="py-3 px-4">Turnout %</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {recentSessions.map((session) => {
                    const sessionDate = new Date(session.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const rate =
                      session.totalStudents > 0
                        ? Math.round(
                            (((session.totalPresent || 0) + (session.totalLate || 0)) /
                              session.totalStudents) *
                              100
                          )
                        : 0;

                    return (
                      <tr key={session._id} className="hover:bg-slate-50/60 transition-colors">
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
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant="blue" size="sm">
                            {session.class?.name} - {session.class?.section}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          {session.totalPresent}
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-500">
                          {session.totalLate || 0}
                        </td>
                        <td className="py-3 px-4 font-bold text-red-500">
                          {session.totalAbsent}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              rate >= 75
                                ? 'text-emerald-600'
                                : rate >= 60
                                ? 'text-amber-500'
                                : 'text-red-500'
                            }`}
                          >
                            {rate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            to={`/faculty/history?sessionId=${session._id}`}
                            className="font-semibold text-brand-blue hover:underline"
                          >
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-brand-text">No attendance sessions recorded yet</p>
                <p className="text-xs text-brand-muted mt-1">Start taking attendance for your assigned classes</p>
                <Link to="/faculty/mark-attendance" className="mt-4 inline-block">
                  <Button variant="primary" size="sm" className="font-bold">
                    Mark First Session
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboardPage;
