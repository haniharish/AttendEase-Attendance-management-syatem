import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleDashboardPath } from '../../routes/PublicOnlyRoute';
import Button from './Button';
import Badge from './Badge';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Features', href: '/#features' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      if (location.pathname !== '/') {
        // Navigate to home then scroll
        navigate('/');
        setTimeout(() => {
          const id = href.replace('/#', '');
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        e.preventDefault();
        const id = href.replace('/#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const roleBadgeVariant = {
    admin: 'purple',
    faculty: 'orange',
    student: 'blue',
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-white border-b border-slate-100/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-blue rounded-lg p-1"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md shadow-brand-blue/20 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-brand-text tracking-tight flex items-center gap-1">
                Attend<span className="text-brand-blue">Ease</span>
              </span>
              <span className="text-[10px] font-semibold text-brand-muted tracking-wider uppercase -mt-1">
                Attendance OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-semibold text-slate-600 hover:text-brand-blue transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-btn bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-semibold text-brand-text transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">{user.name}</span>
                    <span className="text-[10px] text-brand-muted capitalize leading-none">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-card bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Signed in as</p>
                      <p className="text-sm font-bold text-brand-text truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <Badge variant={roleBadgeVariant[user.role] || 'blue'} size="sm">
                          {user.role?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <Link
                      to={getRoleDashboardPath(user.role)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-blue" />
                      <span>Open Dashboard</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-brand-error hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="md">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-btn text-slate-600 hover:text-brand-blue hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-btn text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-2 bg-slate-50 rounded-btn flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-text">{user.name}</p>
                    <p className="text-xs text-brand-muted">{user.email}</p>
                  </div>
                  <Badge variant={roleBadgeVariant[user.role] || 'blue'} size="sm">
                    {user.role}
                  </Badge>
                </div>
                <Link to={getRoleDashboardPath(user.role)}>
                  <Button variant="primary" fullWidth size="md" icon={LayoutDashboard}>
                    Go to Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" fullWidth size="md" onClick={logout} icon={LogOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login">
                  <Button variant="secondary" fullWidth size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" fullWidth size="md">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
