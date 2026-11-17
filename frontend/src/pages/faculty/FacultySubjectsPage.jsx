import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchMySubjects } from '../../services/facultyService';
import {
  BookOpen,
  Search,
  Users,
  Layers,
  CheckSquare,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

const FacultySubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchMySubjects();
        if (res.success && res.data) {
          setSubjects(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve assigned subjects.');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const filteredSubjects = subjects.filter((subj) => {
    const term = searchTerm.toLowerCase();
    const matchesName = subj.name.toLowerCase().includes(term);
    const matchesCode = subj.code.toLowerCase().includes(term);
    const matchesClass = subj.class?.name?.toLowerCase().includes(term);
    return matchesName || matchesCode || matchesClass;
  });

  return (
    <FacultyLayout
      title="My Assigned Subjects"
      subtitle="Courses and laboratory modules under your instruction"
    >
      <div className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <Card className="p-4 sm:p-5 bg-white border border-slate-100 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects by course name, course code, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-brand-text placeholder-slate-400 focus:outline-hidden focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
            />
          </div>
        </Card>

        {/* Subjects Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-semibold text-brand-muted">Loading assigned course curriculum...</p>
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subj) => (
              <Card
                key={subj._id}
                hoverEffect
                className="p-6 bg-white border border-slate-100 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center font-bold text-lg shadow-2xs">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <Badge variant="purple" size="md">
                      {subj.code}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-brand-text tracking-tight">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-brand-muted mt-1 line-clamp-2">
                      {subj.description || 'Core academic curriculum syllabus.'}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-3 border-t border-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-brand-muted">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Layers className="w-4 h-4 text-slate-400" />
                        Associated Class:
                      </span>
                      <span className="font-bold text-brand-text">
                        {subj.class ? `${subj.class.name} (${subj.class.section})` : 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-brand-muted">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-4 h-4 text-slate-400" />
                        Enrolled Cohort:
                      </span>
                      <span className="font-bold text-brand-text">
                        {subj.studentCount || 0} Learners
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-6 mt-6 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    to={`/faculty/mark-attendance?classId=${subj.class?._id}&subjectId=${subj._id}`}
                    className="w-full"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-1.5 font-bold text-xs"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Take Roll</span>
                    </Button>
                  </Link>

                  <Link
                    to={`/faculty/history?subjectId=${subj._id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-1.5 font-bold text-xs"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Logs</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white border border-slate-100">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-text">No subjects found</h3>
            <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No subjects match your search query.'
                : 'No course modules have been assigned to you yet.'}
            </p>
          </Card>
        )}
      </div>
    </FacultyLayout>
  );
};

export default FacultySubjectsPage;
