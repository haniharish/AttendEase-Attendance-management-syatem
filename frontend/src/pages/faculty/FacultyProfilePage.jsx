import React, { useState, useEffect } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchFacultyProfile, updateFacultyProfile } from '../../services/facultyService';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Layers,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Save,
} from 'lucide-react';

const FacultyProfilePage = () => {
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
        const res = await fetchFacultyProfile();
        if (res.success && res.data) {
          const fac = res.data.faculty || res.data;
          setProfile(fac);
          setPhoneNumber(fac.phoneNumber || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve faculty profile.');
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

      const res = await updateFacultyProfile({ phoneNumber });
      if (res.success && res.data) {
        setProfile((prev) => ({ ...prev, phoneNumber: res.data.phoneNumber }));
        setUpdateSuccess('Phone number updated successfully!');
        setTimeout(() => setUpdateSuccess(null), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <FacultyLayout title="Faculty Profile" subtitle="Loading credentials and assignments...">
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-brand-muted">Loading profile details...</p>
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout
      title="Faculty Profile & Teaching Load"
      subtitle="View your academic credentials, department affiliations, and teaching assignments"
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
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-brand-orange/20">
                {profile?.fullName?.charAt(0).toUpperCase() || 'F'}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-brand-text">
                  {profile?.fullName || 'Academic Faculty'}
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Employee ID: <span className="font-mono font-bold text-brand-text">{profile?.employeeId || 'FAC-1001'}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="orange" size="sm">
                    {profile?.department || 'Computer Science'} Department
                  </Badge>
                  <Badge variant="purple" size="sm">
                    Faculty Role
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Instructor</span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Institutional Email
              </span>
              <p className="font-bold text-brand-text text-sm mt-1">{profile?.email || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Academic Department
              </span>
              <p className="font-bold text-brand-text text-sm mt-1">{profile?.department || 'General'}</p>
            </div>
          </div>
        </Card>

        {/* 2. Contact Phone Number Form */}
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <h4 className="text-sm font-bold text-brand-text">Contact Information</h4>
          <p className="text-xs text-brand-muted mt-0.5 mb-4">
            Keep your official contact number updated for academic correspondence
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
              <span>Update</span>
            </Button>
          </form>
        </Card>

        {/* 3. Teaching Assignments Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Assigned Classes */}
          <Card className="p-6 bg-white border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-blue" />
                <h4 className="text-sm font-bold text-brand-text">Assigned Classes</h4>
              </div>
              <Badge variant="blue" size="sm">
                {profile?.assignedClasses?.length || 0} Cohorts
              </Badge>
            </div>

            <div className="space-y-2">
              {profile?.assignedClasses && profile.assignedClasses.length > 0 ? (
                profile.assignedClasses.map((cls) => (
                  <div
                    key={cls._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-brand-text">{cls.name}</p>
                      <p className="text-[11px] text-brand-muted">Academic Year {cls.academicYear}</p>
                    </div>
                    <Badge variant="blue" size="sm">
                      Sec {cls.section}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-muted italic py-4">No classes assigned yet.</p>
              )}
            </div>
          </Card>

          {/* Assigned Subjects */}
          <Card className="p-6 bg-white border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                <h4 className="text-sm font-bold text-brand-text">Assigned Courses</h4>
              </div>
              <Badge variant="purple" size="sm">
                {profile?.assignedSubjects?.length || 0} Subjects
              </Badge>
            </div>

            <div className="space-y-2">
              {profile?.assignedSubjects && profile.assignedSubjects.length > 0 ? (
                profile.assignedSubjects.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-brand-text">{s.code}</p>
                      <p className="text-[11px] text-brand-muted">{s.name}</p>
                    </div>
                    {s.credits && (
                      <span className="text-[10px] font-bold text-brand-purple px-2 py-0.5 rounded-md bg-purple-50">
                        {s.credits} Credits
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-muted italic py-4">No subjects assigned yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyProfilePage;
