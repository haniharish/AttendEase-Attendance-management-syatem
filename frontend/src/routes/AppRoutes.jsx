import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Admin Pages (Part 2)
import AdminDashboardPage from '../pages/dashboards/AdminDashboardPage';
import StudentManagementPage from '../pages/admin/StudentManagementPage';
import FacultyManagementPage from '../pages/admin/FacultyManagementPage';
import ClassManagementPage from '../pages/admin/ClassManagementPage';
import SubjectManagementPage from '../pages/admin/SubjectManagementPage';
import AttendanceReportsPage from '../pages/admin/AttendanceReportsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Faculty Pages (Part 3)
import FacultyDashboardPage from '../pages/dashboards/FacultyDashboardPage';
import FacultyClassesPage from '../pages/faculty/FacultyClassesPage';
import FacultySubjectsPage from '../pages/faculty/FacultySubjectsPage';
import MarkAttendancePage from '../pages/faculty/MarkAttendancePage';
import AttendanceHistoryPage from '../pages/faculty/AttendanceHistoryPage';
import FacultyReportsPage from '../pages/faculty/FacultyReportsPage';
import FacultyProfilePage from '../pages/faculty/FacultyProfilePage';

// Other Role Dashboards (Future Part 4)
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

      {/* Auth Routes */}
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

      {/* Admin Protected Routes (Part 2) */}
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
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <StudentManagementPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/faculty"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <FacultyManagementPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <ClassManagementPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <SubjectManagementPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AttendanceReportsPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminSettingsPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Role-Protected Faculty Routes (Part 3) */}
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
      <Route
        path="/faculty/classes"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['faculty']}>
              <FacultyClassesPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/subjects"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['faculty']}>
              <FacultySubjectsPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/mark-attendance"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['faculty']}>
              <MarkAttendancePage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/history"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['faculty']}>
              <AttendanceHistoryPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/reports"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['faculty']}>
              <FacultyReportsPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/profile"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['faculty']}>
              <FacultyProfilePage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Role-Protected Student Dashboard (Placeholder for Part 4) */}
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
