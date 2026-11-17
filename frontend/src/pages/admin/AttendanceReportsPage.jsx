import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  Layers,
  BookOpen,
  Filter,
  TrendingUp,
  Download,
  Users,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  fetchReportsOverview,
  fetchClassWiseReport,
  fetchSubjectWiseReport,
  fetchDateWiseReport,
  fetchDetailedReports,
  fetchClasses,
  fetchSubjects,
} from '../../services/adminService';

const AttendanceReportsPage = () => {
  const [overview, setOverview] = useState(null);
  const [classStats, setClassStats] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [dateStats, setDateStats] = useState([]);
  const [detailedSessions, setDetailedSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [daysRange, setDaysRange] = useState(14);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        classRes,
        subjectRes,
        dateRes,
        detailedRes,
        clsListRes,
        subListRes,
      ] = await Promise.all([
        fetchReportsOverview({ classId: selectedClass || undefined, subjectId: selectedSubject || undefined }),
        fetchClassWiseReport(),
        fetchSubjectWiseReport(),
        fetchDateWiseReport({ days: daysRange, classId: selectedClass || undefined, subjectId: selectedSubject || undefined }),
        fetchDetailedReports({ classId: selectedClass || undefined, subjectId: selectedSubject || undefined }),
        fetchClasses(),
        fetchSubjects(),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (classRes.success) setClassStats(classRes.data || []);
      if (subjectRes.success) setSubjectStats(subjectRes.data || []);
      if (dateRes.success) setDateStats(dateRes.data || []);
      if (detailedRes.success) setDetailedSessions(detailedRes.data || []);
      if (clsListRes.success) setClasses(clsListRes.data || []);
      if (subListRes.success) setSubjects(subListRes.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSubject, daysRange]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const COLORS = ['#0d6efd', '#f97316', '#10b981', '#ec4899', '#a855f7', '#f59e0b'];

  return (
    <AdminLayout
      title="Attendance Intelligence & Audit Reports"
      subtitle="Comprehensive data visualizations, multi-parameter breakdowns, and daily lecture participation records"
    >
      <div className="space-y-8">
        {/* Filter Bar */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-text">
              <Filter className="w-4 h-4 text-brand-blue" />
              <span>Report Filters</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value="">All Academic Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.section})
                  </option>
                ))}
              </select>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>

              {/* Time Range Filter */}
              <select
                value={daysRange}
                onChange={(e) => setDaysRange(Number(e.target.value))}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="py-24">
            <LoadingSpinner size="lg" message="Aggregating attendance analytics from database..." />
          </div>
        ) : (
          <>
            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="p-5 bg-white border border-slate-100 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Overall Turnout Rate
                </span>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-3xl font-extrabold text-brand-blue">
                    {overview?.overallPercentage || 0}%
                  </h3>
                  <Badge variant={overview?.overallPercentage >= 75 ? 'green' : 'warning'} size="sm">
                    {overview?.overallPercentage >= 75 ? 'Healthy' : 'Below 75%'}
                  </Badge>
                </div>
                <p className="text-xs text-brand-muted">Across filtered criteria</p>
              </Card>

              <Card className="p-5 bg-white border border-slate-100 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Total Lecture Sessions
                </span>
                <h3 className="text-3xl font-extrabold text-brand-text">
                  {overview?.totalSessions || 0}
                </h3>
                <p className="text-xs text-brand-muted">Verified attendance rosters</p>
              </Card>

              <Card className="p-5 bg-white border border-slate-100 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Present Student Logs
                </span>
                <h3 className="text-3xl font-extrabold text-emerald-600">
                  {overview?.totalPresent || 0}
                </h3>
                <p className="text-xs text-brand-muted">Attended or excused status</p>
              </Card>

              <Card className="p-5 bg-white border border-slate-100 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Absent Entries
                </span>
                <h3 className="text-3xl font-extrabold text-brand-error">
                  {overview?.totalAbsent || 0}
                </h3>
                <p className="text-xs text-brand-muted">Unexcused missed sessions</p>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Trend Line Chart */}
              <Card className="lg:col-span-7 p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h3 className="text-base font-bold text-brand-text">Daily Turnout Trend</h3>
                    <p className="text-xs text-brand-muted">Attendance percentage day-by-day</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md">
                    Past {daysRange} Days
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dateStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [`${val}%`, 'Attendance Rate']}
                      />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="#0d6efd"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#0d6efd' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Class-wise Bar Comparison */}
              <Card className="lg:col-span-5 p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h3 className="text-base font-bold text-brand-text">Class Turnout Comparison</h3>
                    <p className="text-xs text-brand-muted">Attendance by academic cohort</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="fullName" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [`${val}%`, 'Attendance']}
                      />
                      <Bar dataKey="attendancePercentage" radius={[6, 6, 0, 0]}>
                        {classStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Subject-Wise Turnout Breakdown Table */}
            <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-brand-text">Subject-Wise Analytics</h3>
                  <p className="text-xs text-brand-muted">Aggregated attendance percentages by course</p>
                </div>
                <Badge variant="pink" size="sm">
                  {subjectStats.length} Subjects Analyzed
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4">Total Sessions</th>
                      <th className="py-3 px-4">Present Turnout</th>
                      <th className="py-3 px-4 text-right">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {subjectStats.map((sub, i) => (
                      <tr key={sub.subjectId || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-brand-text">{sub.subjectCode}</span>
                          <span className="ml-2 text-slate-600">{sub.subjectName}</span>
                        </td>
                        <td className="py-3 px-4">{sub.className}</td>
                        <td className="py-3 px-4 text-brand-orange font-semibold">{sub.facultyName}</td>
                        <td className="py-3 px-4 font-bold">{sub.totalSessions}</td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">{sub.totalPresent}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge
                            variant={sub.attendancePercentage >= 75 ? 'green' : 'warning'}
                            size="sm"
                          >
                            {sub.attendancePercentage}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Detailed Attendance Records Table */}
            <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-brand-text">Detailed Attendance Logs</h3>
                  <p className="text-xs text-brand-muted">Individual recorded lecture sessions in MongoDB</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Faculty</th>
                      <th className="py-3 px-4">Present / Enrolled</th>
                      <th className="py-3 px-4 text-right">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {detailedSessions && detailedSessions.length > 0 ? (
                      detailedSessions.map((s) => {
                        const pct = s.totalStudents > 0
                          ? Math.round((s.totalPresent / s.totalStudents) * 100)
                          : 0;
                        return (
                          <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-semibold text-brand-text">
                              {new Date(s.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-4">
                              {s.class ? `${s.class.name} (${s.class.section})` : 'N/A'}
                            </td>
                            <td className="py-3 px-4 font-bold text-brand-text">
                              {s.subject ? `${s.subject.code} - ${s.subject.name}` : 'N/A'}
                            </td>
                            <td className="py-3 px-4">{s.faculty?.fullName || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-emerald-600">{s.totalPresent}</span>
                              <span className="text-slate-400"> / {s.totalStudents}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Badge variant={pct >= 75 ? 'green' : 'warning'} size="sm">
                                {pct}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-brand-muted italic">
                          No detailed attendance records match the selected criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AttendanceReportsPage;
