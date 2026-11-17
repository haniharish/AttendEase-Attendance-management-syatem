import React, { useState, useEffect } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/admin/StatCard';
import { fetchStudentAttendance } from '../../services/studentService';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  Calendar,
  RotateCcw,
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

const MyAttendancePage = () => {
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [data, setData] = useState({
    overallPercentage: 100,
    totalClasses: 0,
    attendedCount: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    monthlyTrend: [],
    records: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAttendance = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStudentAttendance(params);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {};
    if (filterType !== 'custom') {
      params.filter = filterType;
    } else {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }
    loadAttendance(params);
  }, [filterType, startDate, endDate]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    if (type !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleResetFilters = () => {
    setFilterType('all');
    setStartDate('');
    setEndDate('');
  };

  const {
    overallPercentage,
    totalClasses,
    attendedCount,
    presentCount,
    lateCount,
    absentCount,
    monthlyTrend = [],
    records = [],
  } = data;

  return (
    <StudentLayout
      title="My Attendance Ledger"
      subtitle="Comprehensive view of your class participation, absence logs, and period trends"
    >
      <div className="space-y-6">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Date Filter Bar */}
        <Card className="p-4 sm:p-5 bg-white border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Time Filter:
              </span>
              {[
                { label: 'All Time', value: 'all' },
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'Custom Range', value: 'custom' },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleFilterChange(f.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === f.value
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filterType === 'custom' && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 font-semibold">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-brand-text font-semibold focus:outline-hidden focus:border-brand-blue"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 font-semibold">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-brand-text font-semibold focus:outline-hidden focus:border-brand-blue"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  title="Reset filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* 1. Statistics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Attendance Rate"
            value={`${overallPercentage}%`}
            subtitle={overallPercentage >= 75 ? 'Meets 75% rule' : 'Action needed'}
            icon={TrendingUp}
            color={overallPercentage >= 75 ? 'green' : 'pink'}
          />
          <StatCard
            title="Total Classes"
            value={totalClasses}
            subtitle="In selected period"
            icon={CalendarCheck}
            color="blue"
          />
          <StatCard
            title="Present Logs"
            value={presentCount}
            subtitle="On time"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Late Arrivals"
            value={lateCount}
            subtitle="Counted as attended"
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Absences"
            value={absentCount}
            subtitle="Missed sessions"
            icon={XCircle}
            color="pink"
          />
        </div>

        {/* 2. Monthly Trend Bar Chart */}
        {monthlyTrend.length > 0 && (
          <Card className="p-6 bg-white border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-brand-text">Monthly Attendance Distribution</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Breakdown of present, late, and absent records per month
                </p>
              </div>
              <Badge variant="blue" size="sm">
                Distribution
              </Badge>
            </div>

            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: '600' }}
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
          </Card>
        )}

        {/* 3. Detailed Attendance Records Table */}
        <Card className="bg-white border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div>
              <h3 className="text-base font-bold text-brand-text">Attendance Log Entries</h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Showing {records.length} lecture entries matching filter
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm font-semibold text-brand-muted">Loading attendance ledger...</p>
              </div>
            ) : records.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {records.map((r, idx) => {
                    const rDate = new Date(r.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr key={r.sessionId || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-brand-text whitespace-nowrap">
                          {rDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-brand-text">{r.subject?.code}</span>{' '}
                          <span className="text-brand-muted text-[11px]">({r.subject?.name})</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {r.faculty?.fullName || 'Assigned Instructor'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
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
                        <td className="py-3.5 px-4 text-brand-muted italic max-w-xs truncate">
                          {r.remarks || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-brand-muted">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-brand-text">No attendance records in this period</p>
                <p className="text-xs text-brand-muted mt-1">Try selecting a broader date filter range.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default MyAttendancePage;
