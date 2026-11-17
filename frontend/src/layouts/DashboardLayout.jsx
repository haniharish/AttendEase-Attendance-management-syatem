import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const DashboardLayout = ({ title, subtitle, role, badgeVariant = 'blue', children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-brand-text tracking-tight">
                  Attend<span className="text-brand-blue">Ease</span>
                </span>
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider -mt-1">
                  {role} Portal
                </span>
              </div>
            </Link>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-bold text-brand-text leading-tight">{user?.name}</span>
                  <span className="text-xs text-brand-muted leading-tight">{user?.email}</span>
                </div>
                <Badge variant={badgeVariant} size="sm" className="ml-1">
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="text-slate-600 hover:text-brand-error hover:bg-red-50"
              >
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              {role} Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-brand-muted mt-1">{subtitle}</p>}
        </div>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
