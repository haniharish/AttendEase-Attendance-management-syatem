import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import FacultySidebar from '../components/faculty/FacultySidebar';
import FacultyRightSidebar from '../components/faculty/FacultyRightSidebar';
import { fetchFacultyDashboard } from '../services/facultyService';

const FacultyLayout = ({
  children,
  title,
  subtitle,
  showRightSidebar = true,
  recentSessions: customRecentSessions,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (customRecentSessions) {
      setSessions(customRecentSessions);
      return;
    }

    const loadSidebarData = async () => {
      try {
        const res = await fetchFacultyDashboard();
        if (res.success && res.data) {
          if (res.data.recentSessions) {
            setSessions(res.data.recentSessions);
          }
          if (res.data.counts || res.data.stats) {
            setStats(res.data.counts || res.data.stats);
          }
        }
      } catch (err) {
        console.warn('Could not load faculty dashboard preview:', err);
      }
    };

    loadSidebarData();
  }, [customRecentSessions]);

  return (
    <div className="min-h-screen bg-brand-bg flex text-brand-text">
      {/* 1. Left Navigation Sidebar (256px) */}
      <FacultySidebar mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />

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
            Attend<span className="text-brand-blue">Ease</span> Faculty
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

      {/* 3. Right Profile/Quick Action Sidebar (320px) */}
      {showRightSidebar && (
        <FacultyRightSidebar recentSessions={sessions} stats={stats} />
      )}
    </div>
  );
};

export default FacultyLayout;
