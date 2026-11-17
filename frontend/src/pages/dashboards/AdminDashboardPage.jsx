import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  UserCheck,
  UserX,
  TrendingUp,
  Plus,
  ArrowRight,
  CalendarCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchDashboardStats } from '../../services/adminService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Administrator Dashboard" subtitle="Loading metrics...">
        <div className="py-24">
          <LoadingSpinner size="lg" message="Loading administrative intelligence..." />
        </div>
      </AdminLayout>
    );
  }

  const counts = stats?.counts || {
    totalStudents: 0,
    totalFaculty: 0,
    totalClasses: 0,
    totalSubjects: 0,
    todayPresent: 0,
    todayAbsent: 0,
    overallRate: 0,
  };

  const weeklyTrend = stats?.weeklyTrend || [];
  const recentSessions = stats?.recentSessions || [];

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Institutional attendance monitoring, academic statistics, and quick management controls"
    >
      <div className="space-y-8">
        {/* Quick Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-card bg-white border border-slate-100 shadow-sm">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-brand-text">Quick Operations</h3>
            <p className="text-xs text-brand-muted">Instantly create entities or manage rosters</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/admin/students">
              <Button variant="primary" size="sm" icon={Plus}>
                Add Student
              </Button>
            </Link>
            <Link to="/admin/faculty">
              <Button variant="secondary" size="sm" icon={Plus}>
                Add Faculty
              </Button>
            </Link>
            <Link to="/admin/classes">
              <Button variant="secondary" size="sm" icon={Plus}>
                Create Class
              </Button>
            </Link>
            <Link to="/admin/subjects">
              <Button variant="secondary" size="sm" icon={Plus}>
                Add Subject
              </Button>
            </Link>
          </div>
        </div>

        {/* 6 Core Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="Total Students"
            value={counts.totalStudents}
            subtitle="Enrolled active learners"
            icon={Users}
            color="blue"
            badge={{ label: 'Academic Year', value: '2026-2027' }}
          />
          <StatCard
            title="Total Faculty"
            value={counts.totalFaculty}
            subtitle="Department educators"
            icon={GraduationCap}
            color="orange"
            badge={{ label: 'Status', value: 'Authorized' }}
          />
          <StatCard
            title="Total Classes"
            value={counts.totalClasses}
            subtitle="Active sections"
            icon={Layers}
            color="purple"
            badge={{ label: 'Terms', value: 'Full Year' }}
          />
          <StatCard
            title="Total Subjects"
            value={counts.totalSubjects}
            subtitle="Catalog courses"
            icon={BookOpen}
            color="pink"
            badge={{ label: 'Curriculum', value: 'Active' }}
          />
          <StatCard
            title="Today's Present"
            value={counts.todayPresent}
            subtitle="Verified attendance logs"
            icon={UserCheck}
            color="green"
            badge={{ label: 'Attendance Rate', value: `${counts.overallRate}%` }}
          />
          <StatCard
            title="Today's Absent"
            value={counts.todayAbsent}
            subtitle="Marked absent / unexcused"
            icon={UserX}
            color="orange"
            badge={{ label: 'Discrepancies', value: 'Flagged' }}
          />
        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 7-Day Attendance Trend Chart */}
          <Card className="lg:col-span-8 p-6 sm:p-7 bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="text-base font-bold text-brand-text">
                  Weekly Attendance Overview
                </h3>
                <p className="text-xs text-brand-muted">
                  Daily institutional attendance percentage across all classes
                </p>
              </div>
              <Badge variant="blue" size="md">
                Overall: {counts.overallRate}%
              </Badge>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#0d6efd"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#attendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Summary Card */}
          <Card className="lg:col-span-4 p-6 sm:p-7 bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-brand-text">
                  Attendance Health
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-brand-muted">Target Threshold</span>
                  <span className="text-brand-text">75.0% Min</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-blue h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(counts.overallRate, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-brand-muted text-right">
                  Current: <strong className="text-brand-blue">{counts.overallRate}%</strong>
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-brand-muted">Present Students</span>
                  <span className="font-bold text-emerald-600">{counts.todayPresent}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-brand-muted">Absent Students</span>
                  <span className="font-bold text-brand-error">{counts.todayAbsent}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-brand-muted">Total Active Classes</span>
                  <span className="font-bold text-brand-purple">{counts.totalClasses}</span>
                </div>
              </div>
            </div>

            <Link to="/admin/reports">
              <Button variant="outline" fullWidth size="md" icon={ArrowRight} iconPosition="right">
                View Full Reports
              </Button>
            </Link>
          </Card>
        </div>

        {/* Recent Attendance Activity Table */}
        <Card className="p-6 sm:p-7 bg-white border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-text">
                Recent Attendance Sessions
              </h3>
              <p className="text-xs text-brand-muted">
                Latest lecture rosters marked in MongoDB
              </p>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
            >
              <span>Explore all records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Class</th>
                  <th className="pb-3 px-2">Subject</th>
                  <th className="pb-3 px-2">Faculty</th>
                  <th className="pb-3 px-2">Turnout</th>
                  <th className="pb-3 px-2 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                {recentSessions && recentSessions.length > 0 ? (
                  recentSessions.map((session) => {
                    const rate = session.totalStudents > 0
                      ? Math.round((session.totalPresent / session.totalStudents) * 100)
                      : 0;
                    return (
                      <tr key={session._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-2 font-semibold text-brand-text">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-2">
                          {session.class ? `${session.class.name} (${session.class.section})` : 'N/A'}
                        </td>
                        <td className="py-3 px-2 font-bold text-brand-text">
                          {session.subject ? `${session.subject.code} - ${session.subject.name}` : 'N/A'}
                        </td>
                        <td className="py-3 px-2">{session.faculty?.fullName || 'N/A'}</td>
                        <td className="py-3 px-2">
                          <span className="font-semibold text-emerald-600">{session.totalPresent}</span>
                          <span className="text-slate-400"> / {session.totalStudents}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Badge
                            variant={rate >= 75 ? 'green' : 'warning'}
                            size="sm"
                          >
                            {rate}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-brand-muted italic">
                      No attendance sessions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
