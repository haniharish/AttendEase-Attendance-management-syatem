import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Search,
  BookOpen,
  Users,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Calendar,
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
  fetchClasses,
  fetchClassById,
  createClass,
  updateClass,
  deleteClass,
} from '../../services/adminService';

const ClassManagementPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [currentClass, setCurrentClass] = useState(null);
  const [detailedClass, setDetailedClass] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    section: 'A',
    academicYear: '2026-2027',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchClasses({ search: search.trim() || undefined });
      if (res.success) setClasses(res.data || []);
    } catch (err) {
      showNotification('error', err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Class / Program name is required';
    if (!formData.section.trim()) errs.section = 'Section is required';
    if (!formData.academicYear.trim()) errs.academicYear = 'Academic year is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      section: 'A',
      academicYear: '2026-2027',
      description: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setCurrentClass(cls);
    setFormData({
      name: cls.name,
      section: cls.section,
      academicYear: cls.academicYear,
      description: cls.description || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenView = async (cls) => {
    setCurrentClass(cls);
    setIsViewModalOpen(true);
    try {
      const res = await fetchClassById(cls._id);
      if (res.success) setDetailedClass(res.data);
    } catch (err) {
      console.warn('Error fetching class details:', err);
    }
  };

  const handleOpenDelete = (cls) => {
    setCurrentClass(cls);
    setIsDeleteOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setActionLoading(true);
    try {
      if (isAddModalOpen) {
        const res = await createClass(formData);
        if (res.success) {
          showNotification('success', 'Class created successfully');
          setIsAddModalOpen(false);
          loadClasses();
        }
      } else if (isEditModalOpen && currentClass) {
        const res = await updateClass(currentClass._id, formData);
        if (res.success) {
          showNotification('success', 'Class details updated successfully');
          setIsEditModalOpen(false);
          loadClasses();
        }
      }
    } catch (err) {
      showNotification('error', err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!currentClass) return;
    setActionLoading(true);
    try {
      const res = await deleteClass(currentClass._id);
      if (res.success) {
        showNotification('success', 'Class deleted successfully');
        setIsDeleteOpen(false);
        loadClasses();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete class');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Class & Section Management"
      subtitle="Establish academic branches, sections, term years, and monitor student counts"
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
                placeholder="Search classes or sections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>

            <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
              Create New Class
            </Button>
          </div>
        </Card>

        {/* Class Cards Grid */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner message="Loading classes and enrolled totals..." />
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card
                key={cls._id}
                hoverEffect
                className="p-6 bg-white border border-slate-100 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center font-bold text-sm">
                      <Layers className="w-6 h-6" />
                    </div>
                    <Badge variant="purple" size="sm">
                      Section {cls.section}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-brand-text leading-snug">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-brand-muted mt-1">
                      Term: <span className="font-semibold text-slate-700">{cls.academicYear}</span>
                    </p>
                    {cls.description && (
                      <p className="text-xs text-brand-muted mt-2 line-clamp-2">
                        {cls.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-50">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-brand-muted flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-brand-blue" />
                        Students
                      </span>
                      <strong className="text-brand-text">{cls.studentCount || 0}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-brand-muted flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
                        Subjects
                      </span>
                      <strong className="text-brand-text">{cls.subjectCount || 0}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleOpenView(cls)}
                    >
                      View Details
                    </Button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-orange hover:bg-orange-50 transition-colors"
                        title="Edit Class"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(cls)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-error hover:bg-red-50 transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white border border-slate-100 space-y-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-brand-text">No Classes Created Yet</h4>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              Get started by creating your first academic class or program section.
            </p>
            <Button variant="primary" size="md" onClick={handleOpenAdd}>
              Create First Class
            </Button>
          </Card>
        )}
      </div>

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Create New Class' : 'Edit Class Specifications'}
        subtitle="Manage program branches, section tags, and active academic year"
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <Input
            label="Class / Degree Program Name"
            name="name"
            placeholder="e.g. Computer Science & Engineering"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Section"
              name="section"
              placeholder="e.g. A, B, C"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              error={formErrors.section}
              required
            />
            <Input
              label="Academic Year"
              name="academicYear"
              placeholder="e.g. 2026-2027"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              error={formErrors.academicYear}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Provide batch details, schedule notes, or lecture hall info..."
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
              {isAddModalOpen ? 'Create Class' : 'Update Class'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Class Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setDetailedClass(null);
        }}
        title={`Class Breakdown: ${currentClass?.name} (${currentClass?.section})`}
        maxWidth="max-w-2xl"
      >
        {detailedClass ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                Academic Year {detailedClass.academicYear}
              </span>
              <h4 className="text-lg font-bold text-brand-text">
                {detailedClass.name} — Section {detailedClass.section}
              </h4>
              <p className="text-xs text-brand-muted">
                {detailedClass.description || 'Standard institutional section cohort'}
              </p>
            </div>

            {/* Sub-tabs: Students & Subjects */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Enrolled Students ({detailedClass.students?.length || 0})</span>
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-1">
                {detailedClass.students && detailedClass.students.length > 0 ? (
                  detailedClass.students.map((st) => (
                    <div
                      key={st._id}
                      className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-blue">#{st.rollNumber}</span>
                        <span className="font-semibold text-brand-text">{st.fullName}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{st.registrationNumber}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-muted italic py-3 text-center">No students currently enrolled in this class.</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Associated Subjects ({detailedClass.subjects?.length || 0})</span>
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-1">
                {detailedClass.subjects && detailedClass.subjects.length > 0 ? (
                  detailedClass.subjects.map((sb) => (
                    <div
                      key={sb._id}
                      className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-brand-text">{sb.code} - {sb.name}</span>
                      <span className="text-xs font-semibold text-brand-orange">
                        {sb.faculty?.fullName || 'Unassigned Faculty'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-muted italic py-3 text-center">No subjects mapped to this class.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12">
            <LoadingSpinner message="Fetching class roster..." />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteClass}
        title="Delete Academic Class"
        message={`Are you sure you want to delete ${currentClass?.name} (Section ${currentClass?.section})? Deletion is safely prevented if students or subjects are attached.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </AdminLayout>
  );
};

export default ClassManagementPage;
