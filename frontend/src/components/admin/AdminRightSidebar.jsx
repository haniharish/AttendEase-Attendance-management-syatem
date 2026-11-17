import React from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Badge from '../common/Badge';

const AdminRightSidebar = ({ activities = [] }) => {
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
      {/* 1. Admin Profile Card */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-purple/20">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-brand-text truncate">
              {user?.name || 'Administrator'}
            </h4>
            <p className="text-xs text-brand-muted truncate">{user?.email}</p>
            <div className="mt-1">
              <Badge variant="purple" size="sm">
                System Administrator
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </span>
          <span>Verified Token</span>
        </div>
      </Card>

      {/* 2. Current Date Widget */}
      <Card className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/15">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Institutional Calendar
            </span>
            <p className="text-sm font-bold tracking-tight">{formattedDate}</p>
            <p className="text-xs text-blue-100">Academic Term: 2026–2027</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </Card>

      {/* 3. System Notifications */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-brand-blue" />
            <span>Alerts & Notifications</span>
          </h4>
          <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
            2 New
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-semibold text-brand-text">Semester Term 2 Active</p>
            <p className="text-[11px] text-brand-muted">All course rosters and subject codes synchronized.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-semibold text-brand-text">Audit Ready</p>
            <p className="text-[11px] text-brand-muted">Automated attendance records backup completed.</p>
          </div>
        </div>
      </Card>

      {/* 4. Recent System Activities */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-purple" />
            <span>Recent Activities</span>
          </h4>
        </div>

        <div className="space-y-3">
          {activities && activities.length > 0 ? (
            activities.slice(0, 5).map((act, i) => (
              <div key={act._id || i} className="flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-text leading-tight truncate">
                    {act.details}
                  </p>
                  <p className="text-[10px] text-brand-muted mt-0.5">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-brand-muted italic">No recent logs recorded.</p>
          )}
        </div>
      </Card>
    </aside>
  );
};

export default AdminRightSidebar;
