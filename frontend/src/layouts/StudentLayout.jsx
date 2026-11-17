import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import StudentSidebar from '../components/student/StudentSidebar';
import StudentRightSidebar from '../components/student/StudentRightSidebar';
import { fetchStudentDashboard } from '../services/studentService';

const StudentLayout = ({
  children,
  title,
  subtitle,
  showRightSidebar = true,
  recentSessions: customRecentSessions,
  student: customStudent,
  stats: customStats,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (customRecentSessions) setSessions(customRecentSessions);
    if (customStudent) setStudent(customStudent);
    if (customStats) setStats(customStats);

    if (customRecentSessions && customStudent && customStats) return;

    const loadSidebarData = async () => {
      try {
        const res = await fetchStudentDashboard();
        if (res.success && res.data) {
          if (!customStudent && res.data.student) setStudent(res.data.student);
          if (!customStats && res.data.stats) setStats(res.data.stats);
          if (!customRecentSessions && res.data.recentActivity) setSessions(res.data.recentActivity);
        }
      } catch (err) {
        console.warn('Could not load student dashboard preview:', err);
      }
    };

    loadSidebarData();
  }, [customRecentSessions, customStudent, customStats]);

  return (
    <div className="min-h-screen bg-brand-bg flex text-brand-text">
      {/* 1. Left Navigation Sidebar (256px) */}
      <StudentSidebar mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-100 px-4 flex items-center justify-between sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-brand-blue hover:bg-slate-50"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-extrabold text-brand-text text-base">
            Attend<span className="text-brand-blue">Ease</span> Student
          </span>
          <div className="w-8" />
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-x-hidden">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-brand-muted mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* 3. Right Profile & Activity Sidebar (320px) */}
      {showRightSidebar && (
        <StudentRightSidebar
          student={student}
          recentSessions={sessions}
          stats={stats}
        />
      )}
    </div>
  );
};

export default StudentLayout;
