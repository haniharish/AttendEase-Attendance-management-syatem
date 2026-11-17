import React, { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminRightSidebar from '../components/admin/AdminRightSidebar';
import { fetchActivityLogs } from '../services/adminService';

const AdminLayout = ({ children, title, subtitle, showRightSidebar = true }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await fetchActivityLogs();
        if (res.success && res.data) {
          setActivities(res.data);
        }
      } catch (err) {
        console.warn('Could not load activity logs:', err);
      }
    };
    loadActivities();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex text-brand-text">
      {/* 1. Left Navigation Sidebar (256px) */}
      <AdminSidebar mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile / Tablet Header Bar */}
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
            Attend<span className="text-brand-blue">Ease</span> Admin
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
      {showRightSidebar && <AdminRightSidebar activities={activities} />}
    </div>
  );
};

export default AdminLayout;
