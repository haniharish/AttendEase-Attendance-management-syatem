import React, { useState, useEffect } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/admin/StatCard';
import { fetchFacultyReports } from '../../services/facultyService';
import {
  BarChart3,
  Calendar,
  Layers,
  BookOpen,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const FacultyReportsPage = () => {
  const [days, setDays] = useState(14);
  const [data, setData] = useState({
    summary: {
      totalSessions: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalRecords: 0,
      overallPercentage: 0,
    },
    classWise: [],
    subjectWise: [],
    dailyTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchFacultyReports({ days });
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attendance analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [days]);

  const { summary, classWise = [], subjectWise = [], dailyTrend = [] } = data;

  return (
    <FacultyLayout
      title="Attendance Reports & Visual Analytics"
      subtitle="Comparative analytics, course breakdown, and learner engagement trends"
    >
      <div className="space-y-8">
        {/* Date Range Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-brand-blue" />
            <span className="text-xs font-bold text-brand-text">Analytics Reporting Window:</span>
          </div>

          <div className="flex items-center gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  days === d
                    ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Past {d} Days
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* 1. Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Recorded Sessions"
            value={summary.totalSessions || 0}
            subtitle="Lectures delivered"
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Present Logs"
            value={summary.totalPresent || 0}
            subtitle="On-time attendees"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Late Arrivals"
            value={summary.totalLate || 0}
            subtitle="Delayed arrivals"
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Absences"
            value={summary.totalAbsent || 0}
            subtitle="Missed lectures"
            icon={XCircle}
            color="pink"
          />
          <StatCard
            title="Overall Turnout"
            value={`${summary.overallPercentage || 0}%`}
            subtitle="Aggregate attendance"
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* 2. Visual Charts Row 1: Daily Turnout Trend Area Chart */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-brand-text">Daily Turnout Trend</h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Attendance rate percentage across all assigned classes over the last {days} days
              </p>
            </div>
            <Badge variant="blue" size="sm">
              Temporal Trajectory
            </Badge>
          </div>

          <div className="h-72 mt-6">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="turnoutGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="displayDate"
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
                    fill="url(#turnoutGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                No attendance trend data available in this time range.
              </div>
            )}
          </div>
        </Card>

        {/* 3. Visual Charts Row 2: Class Comparison vs Subject Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class-wise Comparison */}
          <Card className="p-6 bg-white border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-brand-text">Class Turnout Comparison</h3>
                <p className="text-xs text-brand-muted mt-0.5">Average attendance rate per cohort</p>
              </div>
              <Badge variant="purple" size="sm">
                Cohorts
              </Badge>
            </div>

            <div className="h-64 mt-6">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : classWise.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classWise} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
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
                      formatter={(val) => [`${val}%`, 'Turnout']}
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
                  No class attendance records logged yet.
                </div>
              )}
            </div>
          </Card>

          {/* Subject Breakdown */}
          <Card className="p-6 bg-white border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-brand-text">Subject Turnout Breakdown</h3>
                <p className="text-xs text-brand-muted mt-0.5">Attendance rates across taught courses</p>
              </div>
              <Badge variant="orange" size="sm">
                Courses
              </Badge>
            </div>

            <div className="h-64 mt-6">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : subjectWise.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectWise} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      formatter={(val) => [`${val}%`, 'Turnout']}
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
                      fill="#f97316"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                  No subject attendance records logged yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyReportsPage;
