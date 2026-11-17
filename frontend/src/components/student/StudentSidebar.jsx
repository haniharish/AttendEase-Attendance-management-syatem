import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  Clock,
  BarChart3,
  User,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
  { name: 'Subject-Wise Attendance', path: '/student/subjects', icon: BookOpen },
  { name: 'Attendance History', path: '/student/history', icon: Clock },
  { name: 'Attendance Reports', path: '/student/reports', icon: BarChart3 },
  { name: 'My Profile', path: '/student/profile', icon: User },
];

const StudentSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 select-none">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
        <Link to="/student/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md shadow-brand-blue/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-brand-text tracking-tight">
              Attend<span className="text-brand-blue">Ease</span>
            </span>
            <span className="text-[10px] font-bold text-brand-blue tracking-widest uppercase -mt-1">
              Student Portal
            </span>
          </div>
        </Link>

        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-brand-text hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Student Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25 translate-x-1'
                    : 'text-brand-muted hover:text-brand-text hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-blue'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom User & Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-2xl border border-slate-100 mb-3 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brand-text truncate">
              {user?.name || 'Student Member'}
            </p>
            <p className="text-[10px] text-brand-muted truncate capitalize">
              Enrolled Learner
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:text-white hover:bg-red-500 transition-all duration-200 border border-red-100 hover:border-red-500 shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar (256px = w-64) */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-30 shadow-xs">
        {navContent}
      </aside>

      {/* Desktop Spacer to offset fixed sidebar */}
      <div className="hidden lg:block w-64 shrink-0" />

      {/* Mobile Offcanvas Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default StudentSidebar;
