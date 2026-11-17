import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please provide a valid email address.';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    setSuccessMessage('');

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    setLoading(false);

    if (result.success && result.user) {
      setSuccessMessage('Student account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/student/dashboard', { replace: true });
      }, 1000);
    } else {
      setServerError(result.error || 'Failed to create student account.');
    }
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
          Create student account
        </h2>
        <p className="mt-1.5 text-sm text-brand-muted">
          Register to view your attendance reports and analytics
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-8 sm:p-10 bg-white border border-slate-100 shadow-xl">
          {/* Important Security Notice Pill */}
          <div className="mb-6 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs font-semibold text-brand-blue">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Public Student Registration</span>
            </div>
            <Badge variant="blue" size="sm">Student Role</Badge>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <div className="text-sm font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Error Alert */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-brand-error animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-snug">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              icon={User}
              placeholder="Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              required
              autoComplete="name"
            />

            {/* Email Address */}
            <Input
              label="Student Email Address"
              id="email"
              name="email"
              type="email"
              icon={Mail}
              placeholder="alex.johnson@university.edu"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              required
              autoComplete="email"
            />

            {/* Password */}
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              helperText="Must be minimum 6 characters long"
              required
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              icon={Lock}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required
              autoComplete="new-password"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="mt-4 text-base font-bold py-3"
            >
              Register as Student
            </Button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center text-sm text-brand-muted">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-brand-blue hover:text-brand-blue-hover hover:underline transition-colors"
            >
              Sign In here
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
    </div>
  );
};

export default SignupPage;
