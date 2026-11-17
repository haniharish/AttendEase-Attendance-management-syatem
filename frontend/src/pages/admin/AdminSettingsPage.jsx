import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  Building,
  Calendar,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    institutionName: 'AttendEase University Campus',
    academicYear: '2026-2027',
    attendanceThreshold: 75,
    enableEmailAlerts: true,
    allowFacultyLateMarking: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout
      title="System & Institutional Settings"
      subtitle="Configure academic calendars, policy compliance thresholds, and operational rules"
    >
      <div className="max-w-4xl space-y-6">
        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2 text-sm font-semibold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Settings successfully saved and applied.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Institutional Setup */}
          <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Building className="w-5 h-5 text-brand-blue" />
              <h3 className="text-base font-bold text-brand-text">Institution Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institution Name"
                value={settings.institutionName}
                onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                required
              />
              <Input
                label="Active Academic Term"
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                required
              />
            </div>
          </Card>

          {/* Attendance Rules & Policies */}
          <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-brand-orange" />
              <h3 className="text-base font-bold text-brand-text">Attendance Policy Rules</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  label="Minimum Required Attendance (%)"
                  type="number"
                  min={50}
                  max={100}
                  value={settings.attendanceThreshold}
                  onChange={(e) => setSettings({ ...settings, attendanceThreshold: Number(e.target.value) })}
                  helperText="Students falling below this percentage will be flagged on dashboards."
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableEmailAlerts}
                    onChange={(e) => setSettings({ ...settings, enableEmailAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue"
                  />
                  <div>
                    <p className="text-xs font-bold text-brand-text">Automated Shortfall Notifications</p>
                    <p className="text-[11px] text-brand-muted">Notify students when their percentage drops below the threshold.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowFacultyLateMarking}
                    onChange={(e) => setSettings({ ...settings, allowFacultyLateMarking: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue"
                  />
                  <div>
                    <p className="text-xs font-bold text-brand-text">Allow Late Attendance Adjustments</p>
                    <p className="text-[11px] text-brand-muted">Permit faculty to edit historical attendance logs up to 7 days post-lecture.</p>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Security & Access Overview */}
          <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Shield className="w-5 h-5 text-brand-purple" />
              <h3 className="text-base font-bold text-brand-text">Security Architecture</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Session Protection</p>
                <p className="font-bold text-brand-text mt-0.5">HTTP-Only Cookies</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Role Enforcement</p>
                <p className="font-bold text-brand-text mt-0.5">JWT Claims (Admin)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Audit Logging</p>
                <p className="font-bold text-brand-text mt-0.5">Enabled (MongoDB)</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" icon={Save}>
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
