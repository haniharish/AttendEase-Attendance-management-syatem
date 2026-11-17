import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  Sparkles,
  BookOpen,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Badge from '../common/Badge';

const FacultyRightSidebar = ({ recentSessions = [], stats = null }) => {
  const { user } = useAuth();
  const today = new Date();

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-6 p-6 border-l border-slate-100 bg-white/50 overflow-y-auto">
      {/* 1. Faculty Profile Card */}
      <Card className="p-5 bg-white border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-orange/20">
            {user?.name?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-brand-text truncate">
              {user?.name || 'Faculty Member'}
            </h4>
            <p className="text-xs text-brand-muted truncate">{user?.email}</p>
            <div className="mt-1">
              <Badge variant="orange" size="sm">
                Academic Faculty
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </span>
          <span className="text-slate-400">Authenticated</span>
        </div>
      </Card>

      {/* 2. Current Date Widget */}
      <Card className="p-4 bg-gradient-to-br from-brand-blue to-indigo-600 text-white border-0 shadow-lg shadow-brand-blue/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Academic Calendar
            </span>
            <p className="text-sm font-bold leading-tight">{formattedDate}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>
      </Card>

      {/* 3. Quick Action CTA */}
      <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-brand-orange/20 text-brand-orange">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Fast Track
            </h4>
            <p className="text-sm font-bold text-white mt-0.5">Take Attendance</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Launch roster marking for your scheduled lecture today.
            </p>
          </div>
        </div>
        <Link
          to="/faculty/mark-attendance"
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-brand-blue/20 hover:scale-[1.02]"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Mark Roster Now</span>
        </Link>
      </Card>

      {/* 4. Recent Recorded Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Recent Sessions</span>
          </h4>
          <Link
            to="/faculty/history"
            className="text-[11px] font-semibold text-brand-blue hover:underline"
          >
            View all
          </Link>
        </div>

        {recentSessions && recentSessions.length > 0 ? (
          <div className="space-y-2.5">
            {recentSessions.slice(0, 4).map((session) => {
              const sessionDate = new Date(session.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              const rate =
                session.totalStudents > 0
                  ? Math.round((session.totalPresent / session.totalStudents) * 100)
                  : 0;

              return (
                <div
                  key={session._id}
                  className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-brand-text truncate">
                      {session.subject?.code || 'Course'} • {session.class?.name || 'Class'}
                    </p>
                    <p className="text-[10px] text-brand-muted mt-0.5">
                      {sessionDate} • {session.totalPresent}/{session.totalStudents} present
                    </p>
                  </div>
                  <Badge
                    variant={rate >= 75 ? 'success' : rate >= 60 ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {rate}%
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="p-4 text-center border-dashed border-slate-200">
            <p className="text-xs text-brand-muted">No attendance logs yet.</p>
          </Card>
        )}
      </div>
    </aside>
  );
};

export default FacultyRightSidebar;
