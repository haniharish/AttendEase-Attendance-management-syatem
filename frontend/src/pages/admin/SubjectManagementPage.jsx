import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  GraduationCap,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
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
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToSubject,
  fetchClasses,
  fetchFaculty,
} from '../../services/adminService';

const SubjectManagementPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [currentSubject, setCurrentSubject] = useState(null);
  const [assignedFacultyId, setAssignedFacultyId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    class: '',
    faculty: '',
    credits: 3,
  });
  const [formErrors, setFormErrors] = useState({});

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [subRes, clsRes, facRes] = await Promise.all([
        fetchSubjects({
          search: search.trim() || undefined,
          classId: selectedClass || undefined,
        }),
        fetchClasses(),
        fetchFaculty(),
      ]);

      if (subRes.success) setSubjects(subRes.data || []);
      if (clsRes.success) setClasses(clsRes.data || []);
      if (facRes.success) setFacultyList(facRes.data || []);
    } catch (err) {
      showNotification('error', err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, [search, selectedClass]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Subject name is required';
    if (!formData.code.trim()) errs.code = 'Subject code is required';
    if (!formData.class) errs.class = 'Associated class is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      class: classes.length > 0 ? classes[0]._id : '',
      faculty: '',
      credits: 3,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (subject) => {
    setCurrentSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      class: subject.class?._id || subject.class || '',
      faculty: subject.faculty?._id || subject.faculty || '',
      credits: subject.credits || 3,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenAssign = (subject) => {
    setCurrentSubject(subject);
    setAssignedFacultyId(subject.faculty?._id || subject.faculty || '');
    setIsAssignModalOpen(true);
  };

  const handleOpenDelete = (subject) => {
    setCurrentSubject(subject);
    setIsDeleteOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setActionLoading(true);
    try {
      if (isAddModalOpen) {
        const res = await createSubject(formData);
        if (res.success) {
          showNotification('success', 'Subject created successfully');
          setIsAddModalOpen(false);
          loadData();
        }
      } else if (isEditModalOpen && currentSubject) {
        const res = await updateSubject(currentSubject._id, formData);
        if (res.success) {
          showNotification('success', 'Subject updated successfully');
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

  const handleSaveFacultyAssignment = async (e) => {
    e.preventDefault();
    if (!currentSubject) return;

    setActionLoading(true);
    try {
      const res = await assignFacultyToSubject(currentSubject._id, assignedFacultyId || null);
      if (res.success) {
        showNotification('success', 'Faculty assignment updated successfully');
        setIsAssignModalOpen(false);
        loadData();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to assign faculty');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!currentSubject) return;
    setActionLoading(true);
    try {
      const res = await deleteSubject(currentSubject._id);
      if (res.success) {
        showNotification('success', 'Subject deleted successfully');
        setIsDeleteOpen(false);
        loadData();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete subject');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Course & Subject Management"
      subtitle="Catalog subjects, assign academic courses to classes, and allocate teaching faculty"
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

        {/* Filter and Add Button */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search subject by code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value="">All Associated Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.section})
                  </option>
                ))}
              </select>

              <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
                Add Subject
              </Button>
            </div>
          </div>
        </Card>

        {/* Subjects Data Table */}
        <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-text">Active Subjects</h3>
              <Badge variant="pink" size="sm">
                {subjects.length} Courses
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading academic subject catalog..." />
            </div>
          ) : subjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Class & Section</th>
                    <th className="py-3.5 px-4">Assigned Instructor</th>
                    <th className="py-3.5 px-4">Credits</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {subjects.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-100 text-brand-pink flex items-center justify-center font-bold text-xs shrink-0">
                            {sub.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-brand-text text-sm">{sub.name}</p>
                            {sub.description && (
                              <p className="text-[11px] text-brand-muted line-clamp-1">{sub.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">
                        {sub.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-brand-text">
                          {sub.class ? `${sub.class.name} (${sub.class.section})` : 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.faculty ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-brand-orange">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {sub.faculty.fullName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No Faculty Assigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {sub.credits} Credits
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenAssign(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-orange hover:bg-orange-50 transition-colors"
                          title="Assign Faculty"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition-colors"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-error hover:bg-red-50 transition-colors"
                          title="Delete Subject"
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
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">No subjects found.</p>
              <Button variant="secondary" size="sm" onClick={handleOpenAdd}>
                Add First Subject
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Course Subject' : 'Edit Subject Specifications'}
        subtitle="Associate subjects with classes and map faculty teaching responsibilities"
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <Input
            label="Subject Name"
            name="name"
            placeholder="e.g. Database Management Systems"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              name="code"
              placeholder="e.g. CS-301"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              error={formErrors.code}
              required
            />
            <Input
              label="Academic Credits"
              name="credits"
              type="number"
              min={1}
              max={10}
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Associated Class *
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full rounded-input border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-blue"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.section})
                  </option>
                ))}
              </select>
              {formErrors.class && (
                <p className="text-xs text-brand-error">{formErrors.class}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Assigned Faculty (Optional)
              </label>
              <select
                name="faculty"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                className="w-full rounded-input border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-blue"
              >
                <option value="">Unassigned</option>
                {facultyList.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.fullName} ({fac.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Subject Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Course overview, syllabus milestones, laboratory requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-input border border-slate-200 bg-white p-3 text-sm text-brand-text focus:outline-none focus:border-brand-blue"
            />
          </div>

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
              {isAddModalOpen ? 'Create Subject' : 'Update Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Assign Faculty Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Instructor: ${currentSubject?.code}`}
        subtitle={`Select a qualified faculty member to teach ${currentSubject?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveFacultyAssignment} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Faculty Member
            </label>
            <select
              value={assignedFacultyId}
              onChange={(e) => setAssignedFacultyId(e.target.value)}
              className="w-full rounded-input border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-blue"
            >
              <option value="">-- No Faculty (Unassigned) --</option>
              {facultyList.map((fac) => (
                <option key={fac._id} value={fac._id}>
                  {fac.fullName} • {fac.department} ({fac.employeeId})
                </option>
              ))}
            </select>
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
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteSubject}
        title="Delete Academic Subject"
        message={`Are you sure you want to delete ${currentSubject?.name} (${currentSubject?.code})? This will unmap faculty and prevent future attendance sessions.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </AdminLayout>
  );
};

export default SubjectManagementPage;
