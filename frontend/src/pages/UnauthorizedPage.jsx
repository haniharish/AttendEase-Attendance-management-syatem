import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../routes/PublicOnlyRoute';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const UnauthorizedPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userRole = user?.role || location.state?.userRole || 'guest';

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-8 sm:p-10 text-center space-y-6 bg-white border border-slate-100 shadow-xl">
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-brand-error flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
              Access Restricted
            </h1>
            <p className="text-sm text-brand-muted leading-relaxed">
              You do not have the required role permissions to view this portal or perform this administrative action.
            </p>
          </div>

          {user && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Current Role:</span>
                <Badge variant={userRole === 'admin' ? 'purple' : userRole === 'faculty' ? 'orange' : 'blue'}>
                  {userRole.toUpperCase()}
                </Badge>
              </div>
              <p className="text-brand-muted">
                Signed in as <span className="font-semibold text-brand-text">{user.email}</span>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <Link to={getRoleDashboardPath(user.role)}>
                <Button variant="primary" fullWidth size="md" icon={LayoutDashboard}>
                  Go to My Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="primary" fullWidth size="md">
                  Sign In with Authorized Account
                </Button>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link to="/">
                <Button variant="secondary" fullWidth size="md" icon={ArrowLeft}>
                  Homepage
                </Button>
              </Link>
              {user && (
                <Button variant="ghost" fullWidth size="md" icon={LogOut} onClick={logout}>
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
