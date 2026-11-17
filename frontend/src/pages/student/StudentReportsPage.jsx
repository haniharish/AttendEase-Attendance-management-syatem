import React, { useState, useEffect } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/admin/StatCard';
import { fetchStudentAttendanceAnalytics } from '../../services/studentService';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const StudentReportsPage = () => {
  const [data, setData] = useState({
    monthlyTrend: [],
    subjectComparison: [],
    distribution: [],
    summary: {
      totalClasses: 0,
      present: 0,
      late: 0,
      absent: 0,
      overallPercentage: 100,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchStudentAttendanceAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attendance analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const { monthlyTrend = [], subjectComparison = [], distribution = [], summary } = data;

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <StudentLayout
      title="Attendance Reports & Analytics"
      subtitle="Visual breakdown, monthly trajectories, and course comparative metrics"
    >
      <div className="space-y-8">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* 1. Summary Statistics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Sessions"
            value={summary.totalClasses}
            subtitle="Conducted lectures"
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Present Logs"
            value={summary.present}
            subtitle="On-time attended"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Late Sign-Ins"
            value={summary.late}
            subtitle="Credited as present"
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Absences"
            value={summary.absent}
            subtitle="Missed lectures"
            icon={XCircle}
            color="pink"
          />
          <StatCard
            title="Overall Turnout"
            value={`${summary.overallPercentage}%`}
            subtitle={summary.overallPercentage >= 75 ? 'Healthy status' : 'Below 75% target'}
            icon={TrendingUp}
            color={summary.overallPercentage >= 75 ? 'green' : 'pink'}
          />
        </div>

        {/* 2. Charts Row 1: Monthly Attendance Trend Area Chart */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-brand-text">Overall Attendance Trajectory</h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Monthly cumulative attendance percentage over time
              </p>
            </div>
            <Badge variant="blue" size="sm">
              Monthly Trend
            </Badge>
          </div>

          <div className="h-72 mt-6">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studentReportGradient" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#studentReportGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                No monthly attendance trend data available yet.
              </div>
            )}
          </div>
        </Card>

        {/* 3. Charts Row 2: Subject Comparison vs Attendance Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Comparison Bar Chart (2 Columns) */}
          <Card className="lg:col-span-2 p-6 bg-white border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-brand-text">Subject Turnout Comparison</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Attendance percentages across registered curriculum courses
                </p>
              </div>
              <Badge variant="purple" size="sm">
                Subject Comparison
              </Badge>
            </div>

            <div className="h-72 mt-6">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : subjectComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="code"
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
                    <Bar
                      dataKey="percentage"
                      name="Attendance %"
                      fill="#a855f7"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                  No subject attendance data available.
                </div>
              )}
            </div>
          </Card>

          {/* Attendance Distribution Donut Chart (1 Column) */}
          <Card className="p-6 bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-brand-text">Attendance Distribution</h3>
                <Badge variant="orange" size="sm">
                  Participation
                </Badge>
              </div>

              <div className="h-56 mt-4">
                {distribution.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {distribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                    No records to distribute.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Present</span>
                </span>
                <span className="font-bold text-brand-text">{summary.present} sessions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-medium">Late</span>
                </span>
                <span className="font-bold text-brand-text">{summary.late} sessions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-600 font-medium">Absent</span>
                </span>
                <span className="font-bold text-brand-text">{summary.absent} sessions</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 4. Monthly Summary Performance Table */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-brand-text">Monthly Attendance Breakdown</h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Detailed record logs across consecutive academic periods
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {monthlyTrend.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Academic Month</th>
                    <th className="py-3 px-4 text-center">Conducted</th>
                    <th className="py-3 px-4 text-center">Present</th>
                    <th className="py-3 px-4 text-center">Late</th>
                    <th className="py-3 px-4 text-center">Absent</th>
                    <th className="py-3 px-4 text-center">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyTrend.map((m, idx) => (
                    <tr key={m.key || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-brand-text">
                        {m.month} {m.year || ''}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-600">
                        {m.total}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {m.present}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-500">
                        {m.late}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-red-500">
                        {m.absent}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            m.percentage >= 75
                              ? 'success'
                              : m.percentage >= 65
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {m.percentage}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-xs text-brand-muted">
                No monthly breakdown data available yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentReportsPage;
