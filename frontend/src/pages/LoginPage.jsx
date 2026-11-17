import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../routes/PublicOnlyRoute';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login if specified in router state
  const destination = location.state?.from?.pathname;

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    const result = await login({
      email: formData.email.trim(),
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    setLoading(false);

    if (result.success && result.user) {
      // Role-based redirection:
      // If user came from a protected route matching their role or generic, go there, otherwise role dashboard
      const targetPath = destination || getRoleDashboardPath(result.user.role);
      navigate(targetPath, { replace: true });
    } else {
      setServerError(result.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  // Quick fill helper for review & testing
  const handleQuickFill = (roleEmail, rolePassword) => {
    setFormData({
      email: roleEmail,
      password: rolePassword,
      rememberMe: false,
    });
    setFormErrors({});
    setServerError('');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-blue rounded-xl p-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-blue/25 group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="text-2xl font-extrabold text-brand-text tracking-tight">
            Attend<span className="text-brand-blue">Ease</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-brand-muted">
          Sign in to access your attendance management portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-8 sm:p-10 bg-white border border-slate-100 shadow-xl">
          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-brand-error animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-snug">
                <span>{serverError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              icon={Mail}
              placeholder="name@university.edu"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              required
              autoComplete="email"
            />

            {/* Password Field */}
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/30 cursor-pointer"
                />
                <span className="text-slate-600 font-medium">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="font-semibold text-brand-blue hover:text-brand-blue-hover hover:underline transition-colors focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="mt-2 text-base font-bold py-3"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Demo Credentials (Click to fill)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student@attendease.com', 'StudentPassword123!')}
                className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-brand-blue hover:bg-blue-100 transition-colors border border-blue-100 text-center"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('faculty@attendease.com', 'FacultyPassword123!')}
                className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-brand-orange hover:bg-orange-100 transition-colors border border-orange-100 text-center"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@attendease.com', 'AdminPassword123!')}
                className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-brand-purple hover:bg-purple-100 transition-colors border border-purple-100 text-center"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Link to Signup */}
          <div className="mt-6 text-center text-sm text-brand-muted">
            <span>Don't have an account yet? </span>
            <Link
              to="/signup"
              className="font-bold text-brand-blue hover:text-brand-blue-hover hover:underline transition-colors"
            >
              Sign up as a Student
            </Link>
          </div>
        </Card>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-card max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-brand-blue">
              <HelpCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-brand-text">Password Reset</h3>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed">
              For security compliance, student and faculty password resets are managed through your university IT helpdesk or system administrator.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600">
              <p className="font-semibold text-brand-text">Need immediate access?</p>
              <p className="mt-0.5">Please contact <span className="font-medium text-brand-blue">support@attendease.edu</span> with your institutional roll number.</p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => setForgotModalOpen(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
