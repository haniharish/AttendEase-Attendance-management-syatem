import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  CheckSquare,
  FileSpreadsheet,
  Users,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const FacultyDashboardPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      title="Faculty Attendance Hub"
      subtitle="Classroom roster management, session marking, and lecture records"
      role="Faculty"
      badgeVariant="orange"
    >
      <div className="space-y-8">
        {/* Verification Status Card */}
        <Card className="p-6 sm:p-8 bg-white border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text">Authentication & Role Verified</h3>
                <p className="text-xs text-brand-muted">
                  Session Token: Active & Validated • Role: <span className="font-semibold text-brand-orange">faculty</span>
                </p>
              </div>
            </div>
            <Badge variant="orange" size="md">
              Part 1 Phase Complete
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Instructor ID</p>
              <p className="font-mono font-bold text-brand-text mt-1 truncate">{user?._id || 'N/A'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Email Address</p>
              <p className="font-semibold text-brand-text mt-1 truncate">{user?.email}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Account Status</p>
              <p className="font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Active & Authorized
              </p>
            </div>
          </div>
        </Card>

        {/* Phase 3 Preview Placeholder */}
        <Card className="p-8 sm:p-10 bg-gradient-to-br from-white to-orange-50/30 border border-orange-100 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upcoming Roadmap: Part 3</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
              Faculty Attendance Management & Marking
            </h2>

            <p className="text-sm text-brand-muted leading-relaxed">
              In Part 3, this hub will feature rich daily teaching controls:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-100 text-xs font-semibold text-brand-text shadow-sm">
                <CheckSquare className="w-4 h-4 text-brand-orange" />
                <span>Single-Click Attendance Marking</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-100 text-xs font-semibold text-brand-text shadow-sm">
                <Users className="w-4 h-4 text-brand-orange" />
                <span>Subject & Class Rosters</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-100 text-xs font-semibold text-brand-text shadow-sm">
                <FileSpreadsheet className="w-4 h-4 text-brand-orange" />
                <span>Class-Wise Reports & Export</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-100 text-xs font-semibold text-brand-text shadow-sm">
                <CalendarCheck className="w-4 h-4 text-brand-orange" />
                <span>Historical Attendance Adjustments</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboardPage;
