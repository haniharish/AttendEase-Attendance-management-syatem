import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchMyClasses } from '../../services/facultyService';
import {
  Layers,
  Search,
  Users,
  BookOpen,
  Calendar,
  CheckSquare,
  AlertCircle,
  Filter,
} from 'lucide-react';

const FacultyClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchMyClasses();
        if (res.success && res.data) {
          setClasses(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve assigned classes.');
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  // Unique sections for filter
  const uniqueSections = ['ALL', ...new Set(classes.map((c) => c.section).filter(Boolean))];

  // Client-side filtering
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.description && cls.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSection = sectionFilter === 'ALL' || cls.section === sectionFilter;
    return matchesSearch && matchesSection;
  });

  return (
    <FacultyLayout
      title="My Assigned Classes"
      subtitle="View student cohorts and curricula assigned to your teaching load"
    >
      <div className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Filter and Search Bar */}
        <Card className="p-4 sm:p-5 bg-white border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search classes by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-brand-text placeholder-slate-400 focus:outline-hidden focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-brand-text bg-white focus:outline-hidden focus:border-brand-blue transition-all"
              >
                {uniqueSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec === 'ALL' ? 'All Sections' : `Section ${sec}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Classes Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-semibold text-brand-muted">Loading assigned classrooms...</p>
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <Card
                key={cls._id}
                hoverEffect
                className="p-6 bg-white border border-slate-100 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg shadow-2xs">
                      <Layers className="w-6 h-6" />
                    </div>
                    <Badge variant="blue" size="md">
                      Section {cls.section}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-brand-text tracking-tight">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-brand-muted mt-1 line-clamp-2">
                      {cls.description || 'No class description provided.'}
                    </p>
                  </div>

                  {/* Class Meta details */}
                  <div className="pt-3 border-t border-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-brand-muted">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-4 h-4 text-slate-400" />
                        Enrolled Students:
                      </span>
                      <span className="font-bold text-brand-text">
                        {cls.studentCount || 0} Learners
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-brand-muted">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Academic Year:
                      </span>
                      <span className="font-semibold text-brand-text">
                        {cls.academicYear || '2026-2027'}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Subjects in this class */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Assigned Subjects
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cls.subjects && cls.subjects.length > 0 ? (
                        cls.subjects.map((subj) => (
                          <span
                            key={subj._id}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200"
                          >
                            {subj.code}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No assigned courses</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    to={`/faculty/mark-attendance?classId=${cls._id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 font-bold"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Take Attendance</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white border border-slate-100">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-text">No classes found</h3>
            <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
              {searchTerm || sectionFilter !== 'ALL'
                ? 'No classes match your current search and filter criteria.'
                : 'No classes have been assigned to your faculty profile yet. Contact administration.'}
            </p>
          </Card>
        )}
      </div>
    </FacultyLayout>
  );
};

export default FacultyClassesPage;
