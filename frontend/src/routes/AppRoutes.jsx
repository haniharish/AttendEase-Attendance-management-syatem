import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Dashboards (Part 1 Placeholders with complete role guards)
import AdminDashboardPage from '../pages/dashboards/AdminDashboardPage';
import FacultyDashboardPage from '../pages/dashboards/FacultyDashboardPage';
import StudentDashboardPage from '../pages/dashboards/StudentDashboardPage';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes: Redirect to role dashboard if already signed in */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />

      {/* Role-Protected Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Role-Protected Faculty Dashboard */}
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboardPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Role-Protected Student Dashboard */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['student']}>
              <StudentDashboardPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Unauthorized & 404 Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
