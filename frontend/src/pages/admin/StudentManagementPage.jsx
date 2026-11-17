import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
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
  fetchStudents,
  fetchStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  fetchClasses,
} from '../../services/adminService';

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected student states
  const [currentStudent, setCurrentStudent] = useState(null);
  const [detailedStudent, setDetailedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    registrationNumber: '',
    email: '',
    phoneNumber: '',
    class: '',
    section: 'A',
    rollNumber: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState({});

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        fetchStudents({
          search: search.trim() || undefined,
          classId: selectedClass || undefined,
          section: selectedSection || undefined,
        }),
        fetchClasses(),
      ]);

      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (classesRes.success) setClasses(classesRes.data || []);
    } catch (err) {
      showNotification('error', err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, selectedClass, selectedSection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.registrationNumber.trim()) errs.registrationNumber = 'Registration number is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    if (!formData.class) errs.class = 'Class selection is required';
    if (!formData.section.trim()) errs.section = 'Section is required';
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Roll number is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      registrationNumber: '',
      email: '',
      phoneNumber: '',
      class: classes.length > 0 ? classes[0]._id : '',
      section: 'A',
      rollNumber: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      fullName: student.fullName,
      registrationNumber: student.registrationNumber,
      email: student.email,
      phoneNumber: student.phoneNumber || '',
      class: student.class?._id || student.class || '',
      section: student.section,
      rollNumber: student.rollNumber,
      enrollmentDate: student.enrollmentDate
        ? new Date(student.enrollmentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenView = async (student) => {
    setCurrentStudent(student);
    setIsViewModalOpen(true);
    try {
      const res = await fetchStudentById(student._id);
      if (res.success) setDetailedStudent(res.data);
    } catch (err) {
      console.warn('Error fetching detailed student:', err);
    }
  };

  const handleOpenDelete = (student) => {
    setCurrentStudent(student);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      if (isAddModalOpen) {
        const res = await createStudent(formData);
        if (res.success) {
          showNotification('success', 'Student enrolled successfully');
          setIsAddModalOpen(false);
          loadData();
        }
      } else if (isEditModalOpen && currentStudent) {
        const res = await updateStudent(currentStudent._id, formData);
        if (res.success) {
          showNotification('success', 'Student details updated successfully');
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

  const handleDeleteStudent = async () => {
    if (!currentStudent) return;
    setActionLoading(true);
    try {
      const res = await deleteStudent(currentStudent._id);
      if (res.success) {
        showNotification('success', 'Student deleted successfully');
        setIsDeleteOpen(false);
        loadData();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete student');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Student Directory & Roster Management"
      subtitle="Enroll, update, and manage student assignments and participation records"
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
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, roll, reg #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>

            {/* Filters and Add Action */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.section})
                  </option>
                ))}
              </select>

              {/* Section Filter */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>

              <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
                Add Student
              </Button>
            </div>
          </div>
        </Card>

        {/* Students Data Table */}
        <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-text">Enrolled Students</h3>
              <Badge variant="blue" size="sm">
                {students.length} Total
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading student records..." />
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Reg #</th>
                    <th className="py-3.5 px-4">Class & Section</th>
                    <th className="py-3.5 px-4">Roll</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-xs shrink-0">
                            {student.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-brand-text text-sm">
                              {student.fullName}
                            </p>
                            <p className="text-[11px] text-brand-muted">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {student.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-brand-text">
                          {student.class?.name || 'Unassigned'}
                        </span>
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold">
                          {student.section}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-text">
                        #{student.rollNumber}
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted">
                        {student.phoneNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={student.isActive ? 'green' : 'error'} size="sm">
                          {student.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenView(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-orange hover:bg-orange-50 transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-error hover:bg-red-50 transition-colors"
                          title="Delete Student"
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
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">No students found matching query.</p>
              <Button variant="secondary" size="sm" onClick={handleOpenAdd}>
                Add Your First Student
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Enroll New Student' : 'Edit Student Details'}
        subtitle="Ensure registration and roll numbers are accurate for academic rosters"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            placeholder="e.g. Alex Johnson"
            value={formData.fullName}
            onChange={handleFormChange}
            error={formErrors.fullName}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              name="registrationNumber"
              placeholder="e.g. REG-2026-001"
              value={formData.registrationNumber}
              onChange={handleFormChange}
              error={formErrors.registrationNumber}
              required
            />
            <Input
              label="Student Email Address"
              name="email"
              type="email"
              placeholder="alex@university.edu"
              value={formData.email}
              onChange={handleFormChange}
              error={formErrors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Class *
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleFormChange}
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

            <Input
              label="Section"
              name="section"
              placeholder="A, B, C"
              value={formData.section}
              onChange={handleFormChange}
              error={formErrors.section}
              required
            />

            <Input
              label="Roll Number"
              name="rollNumber"
              placeholder="e.g. 01"
              value={formData.rollNumber}
              onChange={handleFormChange}
              error={formErrors.rollNumber}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number (Optional)"
              name="phoneNumber"
              placeholder="+1 (555) 000-0000"
              value={formData.phoneNumber}
              onChange={handleFormChange}
            />

            <Input
              label="Enrollment Date"
              name="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={handleFormChange}
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
              {isAddModalOpen ? 'Save Student' : 'Update Details'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setDetailedStudent(null);
        }}
        title="Student Profile & Attendance Record"
        maxWidth="max-w-2xl"
      >
        {detailedStudent ? (
          <div className="space-y-6">
            {/* Header Profile Info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-bold text-xl shadow-md shadow-brand-blue/20">
                {detailedStudent.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-brand-text">
                  {detailedStudent.fullName}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                  <span className="font-semibold text-brand-text">Reg: {detailedStudent.registrationNumber}</span>
                  <span>•</span>
                  <span>Class: {detailedStudent.class?.name} ({detailedStudent.section})</span>
                  <span>•</span>
                  <span>Roll: #{detailedStudent.rollNumber}</span>
                </div>
              </div>
            </div>

            {/* Attendance Percentage Metric */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-bold uppercase text-brand-blue">Total Sessions</p>
                <p className="text-xl font-extrabold text-brand-text mt-1">
                  {detailedStudent.attendanceSummary?.totalSessions || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Present Sessions</p>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">
                  {detailedStudent.attendanceSummary?.presentSessions || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <p className="text-[10px] font-bold uppercase text-brand-purple">Attendance %</p>
                <p className="text-xl font-extrabold text-brand-purple mt-1">
                  {detailedStudent.attendanceSummary?.percentage || 0}%
                </p>
              </div>
            </div>

            {/* Recent Attendance Session Logs */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Attendance Sessions
              </h5>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {detailedStudent.recentAttendance && detailedStudent.recentAttendance.length > 0 ? (
                  detailedStudent.recentAttendance.map((rec) => (
                    <div
                      key={rec._id}
                      className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-brand-text">
                          {rec.subject?.code} - {rec.subject?.name}
                        </p>
                        <p className="text-[10px] text-brand-muted">
                          {new Date(rec.date).toLocaleDateString()} • Faculty: {rec.faculty?.fullName}
                        </p>
                      </div>
                      <Badge
                        variant={rec.status === 'present' ? 'green' : rec.status === 'late' ? 'warning' : 'error'}
                        size="sm"
                      >
                        {rec.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-muted italic text-center py-4">
                    No attendance sessions logged for this student yet.
                  </p>
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
            <LoadingSpinner message="Fetching attendance history..." />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${currentStudent?.fullName} (${currentStudent?.registrationNumber})? This will remove all their enrollments.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </AdminLayout>
  );
};

export default StudentManagementPage;
