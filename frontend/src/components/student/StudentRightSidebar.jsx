import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const StudentRightSidebar = ({
  student = null,
  recentSessions = [],
  stats = null,
}) => {
  // Horizontal mini-calendar: generate 7 days around current week or selected anchor
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate 7 consecutive days centered or starting around current week
  const weekDays = useMemo(() => {
    const days = [];
    const base = new Date(selectedDate);
    // start 3 days before selected
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Navigate calendar
  const handlePrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    setSelectedDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  // Find attendance record for selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const matchingSessions = recentSessions.filter((s) => {
    if (!s.date) return false;
    const sDate = new Date(s.date).toISOString().split('T')[0];
    return sDate === selectedDateStr;
  });

  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-6 p-6 border-l border-slate-100 bg-white/50 overflow-y-auto">
      {/* 1. Student Profile Card */}
      <Card className="p-5 bg-white border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-blue/20">
            {student?.fullName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-brand-text truncate">
              {student?.fullName || 'Student Learner'}
            </h4>
            <p className="text-xs font-mono font-semibold text-brand-muted truncate">
              {student?.registrationNumber || 'REG-PENDING'}
            </p>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <Badge variant="blue" size="sm">
                {student?.class?.name ? `${student.class.name} (${student.class.section})` : 'Class Enrolled'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span className="text-brand-muted">
            Academic Year: <span className="text-brand-text font-bold">{student?.class?.academicYear || '2026-2027'}</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Enrolled
          </span>
        </div>
      </Card>

      {/* 2. Mini Calendar (Horizontal Day Selector with Pink Highlight) */}
      <Card className="p-4 bg-white border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-brand-pink" />
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
              Attendance Calendar
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1 rounded-lg text-slate-400 hover:text-brand-text hover:bg-slate-50"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1 rounded-lg text-slate-400 hover:text-brand-text hover:bg-slate-50"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Day Selector */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const isSelected =
              d.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
            const isToday =
              d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#ec4899] text-white shadow-md shadow-[#ec4899]/30 scale-105'
                    : isToday
                    ? 'bg-pink-50 text-[#ec4899] font-bold border border-pink-200'
                    : 'bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-[9px] uppercase font-bold tracking-tight">
                  {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                </span>
                <span className="text-xs font-extrabold mt-0.5">
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Date Status Breakdown */}
        <div className="pt-2 border-t border-slate-50 text-xs">
          <p className="text-[11px] font-bold text-slate-500 mb-2">
            Status for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}:
          </p>
          {matchingSessions.length > 0 ? (
            <div className="space-y-1.5">
              {matchingSessions.map((s, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <span className="font-bold text-[11px] text-brand-text truncate max-w-[140px]">
                    {s.subject?.code || 'Course'}
                  </span>
                  <Badge
                    variant={
                      s.status === 'present'
                        ? 'success'
                        : s.status === 'late'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2.5 px-3 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-center text-slate-400 text-[11px]">
              No lectures logged on this date
            </div>
          )}
        </div>
      </Card>

      {/* 3. Attendance Summary Box */}
      <Card className="p-4 bg-white border border-slate-100 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
          Cumulative Attendance
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Present</p>
            <p className="text-base font-extrabold text-emerald-600 mt-0.5">
              {stats?.totalPresent ?? 0}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-[10px] font-bold uppercase text-amber-700">Late</p>
            <p className="text-base font-extrabold text-amber-500 mt-0.5">
              {stats?.totalLate ?? 0}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-[10px] font-bold uppercase text-red-700">Absent</p>
            <p className="text-base font-extrabold text-red-500 mt-0.5">
              {stats?.totalMissed ?? 0}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
          <span className="text-brand-muted">Turnout Average</span>
          <span className="font-extrabold text-brand-blue">
            {stats?.overallPercentage ?? 100}%
          </span>
        </div>
      </Card>

      {/* 4. Upcoming Activity Widget (Cohort / Curriculum Notice) */}
      <Card className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white/10 text-brand-pink shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Academic Milestone
            </h5>
            <p className="text-xs font-bold text-white mt-0.5">
              Term 2026-2027 Active
            </p>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Maintain &ge; 75% attendance across all registered courses for exam eligibility.
            </p>
          </div>
        </div>
      </Card>
    </aside>
  );
};

export default StudentRightSidebar;
