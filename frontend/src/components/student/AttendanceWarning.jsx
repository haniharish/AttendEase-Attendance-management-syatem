import React from 'react';
import { AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const AttendanceWarning = ({ warnings = [] }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="space-y-3">
      {warnings.map((w, index) => (
        <div
          key={w.subjectId || index}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50/50 to-red-50 border border-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                  Low Attendance Warning
                </span>
                <span className="text-xs font-bold text-brand-text">
                  {w.subjectCode || 'Course'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {w.message}
              </p>
              {w.classesNeeded > 0 && (
                <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Target: Attend the next <span className="font-extrabold underline">{w.classesNeeded} consecutive class{w.classesNeeded > 1 ? 'es' : ''}</span> without absence to cross 75%.
                </p>
              )}
            </div>
          </div>

          <Link
            to="/student/subjects"
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all shadow-2xs self-start sm:self-center"
          >
            <span>Review Subject</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AttendanceWarning;
