import React, { useState, useEffect } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchStudentAttendanceHistory } from '../../services/studentService';
import {
  Clock,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

const StudentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search,
        status,
        sort,
        page,
        limit: 10,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await fetchStudentAttendanceHistory(params);
      if (res.success && res.data) {
        setHistory(res.data.records);
        setPagination({
          totalRecords: res.data.totalRecords,
          totalPages: res.data.totalPages,
          currentPage: res.data.currentPage,
          limit: res.data.limit,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search, status, startDate, endDate, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setSort('desc');
    setPage(1);
  };

  return (
    <StudentLayout
      title="Attendance History"
      subtitle="Complete chronology and audit trail of your lecture participation"
    >
      <div className="space-y-6">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Filter & Search Bar */}
        <Card className="p-4 sm:p-5 bg-white border border-slate-100 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject code, name, or faculty..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-text placeholder-slate-400 focus:outline-hidden focus:border-brand-blue"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            {/* Sort Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setSort((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-text bg-white hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Sort: {sort === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Date Range or Reset */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue"
                title="Filter from date"
              />
              {(search || status !== 'all' || startDate || endDate || sort !== 'desc') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
                  title="Reset filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* History Table Card */}
        <Card className="bg-white border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div>
              <h3 className="text-base font-bold text-brand-text">Lecture Attendance Logs</h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Showing {pagination.totalRecords} total attendance sessions recorded
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm font-semibold text-brand-muted">Fetching attendance records...</p>
              </div>
            ) : history.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Session Date</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Instructor</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {history.map((record, idx) => {
                    const recDate = new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr key={record.sessionId || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-brand-text whitespace-nowrap">
                          {recDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-brand-text">{record.subject?.code}</p>
                          <p className="text-[11px] text-brand-muted truncate max-w-[200px]">
                            {record.subject?.name}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {record.faculty?.fullName || 'Assigned Faculty'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            variant={
                              record.status === 'present'
                                ? 'success'
                                : record.status === 'late'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-brand-muted italic max-w-xs truncate">
                          {record.remarks || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-brand-muted">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-brand-text">No attendance records found</p>
                <p className="text-xs text-brand-muted mt-1">Try relaxing your search or filter settings.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-brand-muted bg-white">
              <span>
                Page <span className="font-bold text-brand-text">{pagination.currentPage}</span> of{' '}
                <span className="font-bold text-brand-text">{pagination.totalPages}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.currentPage <= 1 || loading}
                  className="flex items-center gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.currentPage >= pagination.totalPages || loading}
                  className="flex items-center gap-1 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentHistoryPage;
