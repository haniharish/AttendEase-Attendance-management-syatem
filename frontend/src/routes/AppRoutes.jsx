import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

// Public Pages (Eagerly loaded for instant first paint)
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Admin Pages (Code-split with React.lazy)
const AdminDashboardPage = lazy(() => import('../pages/dashboards/AdminDashboardPage'));
const StudentManagementPage = lazy(() => import('../pages/admin/StudentManagementPage'));
const FacultyManagementPage = lazy(() => import('../pages/admin/FacultyManagementPage'));
const ClassManagementPage = lazy(() => import('../pages/admin/ClassManagementPage'));
const SubjectManagementPage = lazy(() => import('../pages/admin/SubjectManagementPage'));
const AttendanceReportsPage = lazy(() => import('../pages/admin/AttendanceReportsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

// Faculty Pages (Code-split with React.lazy)
const FacultyDashboardPage = lazy(() => import('../pages/dashboards/FacultyDashboardPage'));
const FacultyClassesPage = lazy(() => import('../pages/faculty/FacultyClassesPage'));
const FacultySubjectsPage = lazy(() => import('../pages/faculty/FacultySubjectsPage'));
const MarkAttendancePage = lazy(() => import('../pages/faculty/MarkAttendancePage'));
const AttendanceHistoryPage = lazy(() => import('../pages/faculty/AttendanceHistoryPage'));
const FacultyReportsPage = lazy(() => import('../pages/faculty/FacultyReportsPage'));
const FacultyProfilePage = lazy(() => import('../pages/faculty/FacultyProfilePage'));

// Student Pages (Code-split with React.lazy)
const StudentDashboardPage = lazy(() => import('../pages/dashboards/StudentDashboardPage'));
const MyAttendancePage = lazy(() => import('../pages/student/MyAttendancePage'));
const SubjectAttendancePage = lazy(() => import('../pages/student/SubjectAttendancePage'));
const StudentHistoryPage = lazy(() => import('../pages/student/StudentHistoryPage'));
const StudentReportsPage = lazy(() => import('../pages/student/StudentReportsPage'));
const StudentProfilePage = lazy(() => import('../pages/student/StudentProfilePage'));

const PageFallback = () => (
  <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-3">
    <LoadingSpinner size="lg" />
    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
      Loading AttendEase Workspace...
    </p>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
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

        {/* Role-Protected Student Routes (Part 4) */}
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
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['student']}>
                <MyAttendancePage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subjects"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['student']}>
                <SubjectAttendancePage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentHistoryPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/reports"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentReportsPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentProfilePage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Unauthorized & 404 Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
