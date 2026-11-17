import React, { useState, useEffect } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchStudentProfile, updateStudentProfile } from '../../services/studentService';
import {
  User,
  Mail,
  Phone,
  Layers,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Save,
  GraduationCap,
} from 'lucide-react';

const StudentProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchStudentProfile();
        if (res.success && res.data) {
          setProfile(res.data);
          setPhoneNumber(res.data.phoneNumber || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve student profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setUpdateSuccess(null);

      const res = await updateStudentProfile({ phoneNumber });
      if (res.success && res.data) {
        setProfile((prev) => ({ ...prev, phoneNumber: res.data.phoneNumber }));
        setUpdateSuccess('Contact phone number updated successfully!');
        setTimeout(() => setUpdateSuccess(null), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update student profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Student Profile" subtitle="Loading academic records and enrollment...">
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-brand-muted">Loading profile credentials...</p>
        </div>
      </StudentLayout>
    );
  }

  const enrollmentDateStr = profile?.enrollmentDate
    ? new Date(profile.enrollmentDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Aug 15, 2026';

  return (
    <StudentLayout
      title="My Academic Profile"
      subtitle="View your university registration details, cohort assignment, and update contact info"
      student={profile}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Feedback Messages */}
        {updateSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <p className="font-semibold">{updateSuccess}</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* 1. Profile Hero Card */}
        <Card className="p-6 sm:p-8 bg-white border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-blue to-indigo-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-brand-blue/20">
                {profile?.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-brand-text">
                  {profile?.fullName || 'Student Learner'}
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Registration No:{' '}
                  <span className="font-mono font-bold text-brand-text">
                    {profile?.registrationNumber || 'REG-PENDING'}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="blue" size="sm">
                    {profile?.class?.name || 'Class Enrolled'} (Sec {profile?.section || 'A'})
                  </Badge>
                  <Badge variant="purple" size="sm">
                    Roll #{profile?.rollNumber || '01'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Student</span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Institutional Email
              </span>
              <p className="font-bold text-brand-text text-sm mt-1">{profile?.email || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Assigned Section
              </span>
              <p className="font-bold text-brand-text text-sm mt-1">Section {profile?.section || 'A'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Academic Year
              </span>
              <p className="font-bold text-brand-text text-sm mt-1">
                {profile?.class?.academicYear || '2026-2027'}
              </p>
            </div>
          </div>
        </Card>

        {/* 2. Contact Phone Number Form (Permitted Update) */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <h4 className="text-sm font-bold text-brand-text">Contact Information</h4>
          <p className="text-xs text-brand-muted mt-0.5 mb-4">
            Students are permitted to update their personal mobile phone number for official SMS/notifications
          </p>

          <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-md">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-brand-text placeholder-slate-400 focus:outline-hidden focus:border-brand-blue"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={updating}
              className="font-bold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Phone</span>
            </Button>
          </form>
        </Card>

        {/* 3. Academic Enrollment Details (Read-Only) */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-brand-purple" />
            <h4 className="text-sm font-bold text-brand-text">Enrollment & Security Constraints</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Enrollment Date</span>
              <p className="font-bold text-brand-text">{enrollmentDateStr}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Class Cohort Description</span>
              <p className="font-bold text-brand-text">
                {profile?.class?.description || 'Core undergraduate cohort'}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Administrative records (Class allocation, Registration Number, and Roll Number) can only be modified by University Administration.
          </p>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentProfilePage;
