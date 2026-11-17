import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Layers,
  Edit2,
  Trash2,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import {
  fetchFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  assignFaculty,
  fetchClasses,
  fetchSubjects,
} from '../../services/adminService';

const FacultyManagementPage = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    phoneNumber: '',
    department: 'Computer Science & Engineering',
    password: '',
  });
  const [assignedSubIds, setAssignedSubIds] = useState([]);
  const [assignedClassIds, setAssignedClassIds] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [facRes, clsRes, subRes] = await Promise.all([
        fetchFaculty({
          search: search.trim() || undefined,
          department: selectedDept || undefined,
        }),
        fetchClasses(),
        fetchSubjects(),
      ]);

      if (facRes.success) setFacultyList(facRes.data || []);
      if (clsRes.success) setClasses(clsRes.data || []);
      if (subRes.success) setSubjects(subRes.data || []);
    } catch (err) {
      showNotification('error', err.message || 'Failed to load faculty');
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    if (!formData.department.trim()) errs.department = 'Department is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      employeeId: '',
      email: '',
      phoneNumber: '',
      department: 'Computer Science & Engineering',
      password: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (faculty) => {
    setCurrentFaculty(faculty);
    setFormData({
      fullName: faculty.fullName,
      employeeId: faculty.employeeId,
      email: faculty.email,
      phoneNumber: faculty.phoneNumber || '',
      department: faculty.department,
      password: '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenAssign = (faculty) => {
    setCurrentFaculty(faculty);
    setAssignedSubIds(faculty.assignedSubjects?.map((s) => s._id || s) || []);
    setAssignedClassIds(faculty.assignedClasses?.map((c) => c._id || c) || []);
    setIsAssignModalOpen(true);
  };

  const handleOpenDelete = (faculty) => {
    setCurrentFaculty(faculty);
    setIsDeleteOpen(true);
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      if (isAddModalOpen) {
        const res = await createFaculty(formData);
        if (res.success) {
          showNotification('success', 'Faculty profile created with active login');
          setIsAddModalOpen(false);
          loadData();
        }
      } else if (isEditModalOpen && currentFaculty) {
        const res = await updateFaculty(currentFaculty._id, formData);
        if (res.success) {
          showNotification('success', 'Faculty details updated successfully');
          setIsEditModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      showNotification('error', err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAssignments = async (e) => {
    e.preventDefault();
    if (!currentFaculty) return;

    setActionLoading(true);
    try {
      const res = await assignFaculty(currentFaculty._id, {
        subjects: assignedSubIds,
        classes: assignedClassIds,
      });
      if (res.success) {
        showNotification('success', 'Faculty subject & class assignments saved');
        setIsAssignModalOpen(false);
        loadData();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to update assignments');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!currentFaculty) return;
    setActionLoading(true);
    try {
      const res = await deleteFaculty(currentFaculty._id);
      if (res.success) {
        showNotification('success', 'Faculty member removed');
        setIsDeleteOpen(false);
        loadData();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete faculty');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Faculty & Academic Staff Management"
      subtitle="Manage instructors, department affiliations, subject allocations, and teaching credentials"
    >
      <div className="space-y-6">
        {/* Notification Alert */}
        {notification.message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-brand-error border border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-brand-error" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search faculty by name, ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value="">All Departments</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
              </select>

              <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
                Add Faculty
              </Button>
            </div>
          </div>
        </Card>

        {/* Faculty Data Table */}
        <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-text">Faculty Roster</h3>
              <Badge variant="orange" size="sm">
                {facultyList.length} Active Staff
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading faculty directory..." />
            </div>
          ) : facultyList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Emp ID</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Assigned Subjects</th>
                    <th className="py-3.5 px-4">Assigned Classes</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {facultyList.map((faculty) => (
                    <tr key={faculty._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs shrink-0">
                            {faculty.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-brand-text text-sm">
                              {faculty.fullName}
                            </p>
                            <p className="text-[11px] text-brand-muted">{faculty.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {faculty.employeeId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-brand-text">
                          {faculty.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {faculty.assignedSubjects && faculty.assignedSubjects.length > 0 ? (
                            faculty.assignedSubjects.map((sub) => (
                              <span
                                key={sub._id || sub}
                                className="px-2 py-0.5 rounded-md bg-blue-50 text-brand-blue font-bold text-[10px]"
                              >
                                {sub.code || 'Course'}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {faculty.assignedClasses && faculty.assignedClasses.length > 0 ? (
                            faculty.assignedClasses.map((cls) => (
                              <span
                                key={cls._id || cls}
                                className="px-2 py-0.5 rounded-md bg-purple-50 text-brand-purple font-bold text-[10px]"
                              >
                                {cls.name ? `${cls.name} (${cls.section})` : 'Class'}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenAssign(faculty)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-purple hover:bg-purple-50 transition-colors"
                          title="Assign Classes & Subjects"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(faculty)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-orange hover:bg-orange-50 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(faculty)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-error hover:bg-red-50 transition-colors"
                          title="Delete Faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">No faculty members found.</p>
              <Button variant="secondary" size="sm" onClick={handleOpenAdd}>
                Add Your First Faculty Member
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add Faculty Member' : 'Edit Faculty Information'}
        subtitle="New faculty automatically receive an authorized login account"
      >
        <form onSubmit={handleSaveFaculty} className="space-y-4">
          <Input
            label="Full Name & Title"
            name="fullName"
            placeholder="e.g. Dr. Sarah Jenkins"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={formErrors.fullName}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              name="employeeId"
              placeholder="e.g. FAC-1001"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              error={formErrors.employeeId}
              required
            />
            <Input
              label="Faculty Email Address"
              name="email"
              type="email"
              placeholder="sarah.jenkins@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-input border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-blue"
                required
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Humanities & Science">Humanities & Science</option>
              </select>
            </div>

            <Input
              label="Phone Number"
              name="phoneNumber"
              placeholder="+1 (555) 000-0000"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {isAddModalOpen && (
            <Input
              label="Initial Password (Optional)"
              name="password"
              type="password"
              placeholder="Default: FacultyPassword123!"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              helperText="If omitted, will default to FacultyPassword123!"
            />
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={actionLoading}
            >
              {isAddModalOpen ? 'Create Faculty' : 'Update Details'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Subjects & Classes Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Roster: ${currentFaculty?.fullName}`}
        subtitle="Select courses and classroom sections under this instructor's purview"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveAssignments} className="space-y-6">
          {/* Subjects Multiselect */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-blue" />
              <span>Teaching Subjects</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
              {subjects.map((sub) => {
                const isChecked = assignedSubIds.includes(sub._id);
                return (
                  <label
                    key={sub._id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-blue-50/70 border-brand-blue text-brand-blue font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignedSubIds([...assignedSubIds, sub._id]);
                        } else {
                          setAssignedSubIds(assignedSubIds.filter((id) => id !== sub._id));
                        }
                      }}
                      className="mt-0.5 rounded text-brand-blue"
                    />
                    <div>
                      <p className="font-bold">{sub.code} - {sub.name}</p>
                      <p className="text-[10px] text-slate-400">Class: {sub.class?.name || 'Assigned'}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Classes Multiselect */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-purple" />
              <span>Assigned Classroom Batches</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
              {classes.map((cls) => {
                const isChecked = assignedClassIds.includes(cls._id);
                return (
                  <label
                    key={cls._id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-purple-50/70 border-brand-purple text-brand-purple font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignedClassIds([...assignedClassIds, cls._id]);
                        } else {
                          setAssignedClassIds(assignedClassIds.filter((id) => id !== cls._id));
                        }
                      }}
                      className="mt-0.5 rounded text-brand-purple"
                    />
                    <div>
                      <p className="font-bold">{cls.name} ({cls.section})</p>
                      <p className="text-[10px] text-slate-400">Term: {cls.academicYear}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={actionLoading}
            >
              Save Assignments
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteFaculty}
        title="Delete Faculty Member"
        message={`Are you sure you want to delete ${currentFaculty?.fullName} (${currentFaculty?.employeeId})? Their course assignments will be cleared.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </AdminLayout>
  );
};

export default FacultyManagementPage;
