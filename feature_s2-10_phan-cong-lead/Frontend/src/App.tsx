import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, UserRole } from './store/authStore'
import Layout from './components/Layout'

import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import UsersManagementPage from './pages/UsersManagementPage'
import RolesPermissionsPage from './pages/RolesPermissionsPage'
import AuditLogsPage from './pages/AuditLogsPage'
import GenericModulePage from './pages/GenericModulePage'
import SchedulePage from './pages/SchedulePage'
import AssignmentsPage from './pages/AssignmentsPage'
import ClassesPage from './pages/ClassesPage'
import TuitionPage from './pages/TuitionPage'
import GradebookPage from './pages/GradebookPage'
import CourseRegistrationPage from './pages/CourseRegistrationPage'
import StudentServicesPage from './pages/StudentServicesPage'
import AdmissionsPage from './pages/AdmissionsPage'
import PublicConsultationPage from './pages/PublicConsultationPage'
import Error403Page from './pages/Error403Page'
import Error404Page from './pages/Error404Page'

interface PrivateRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { accessToken, user } = useAuthStore()
  const location = useLocation()

  if (!accessToken || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // S1-05 & S1-07: Kiểm tra quyền truy cập route ở client
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = user.activeRole || user.roles[0]
    const hasPermission = user.roles.some((r) => allowedRoles.includes(r))
    if (!hasPermission) {
      return <Navigate to="/forbidden" replace />
    }
  }

  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/consultation" element={<PublicConsultationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Main Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/:role/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* S1-08, S1-09, S1-10: Quản lý người dùng */}
      <Route
        path="/admin/users"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'TRAINING_MANAGER']}>
            <UsersManagementPage />
          </PrivateRoute>
        }
      />

      {/* S1-05: Phân quyền theo vai trò */}
      <Route
        path="/admin/roles"
        element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <RolesPermissionsPage />
          </PrivateRoute>
        }
      />

      {/* S1-11: Nhật ký thao tác nhạy cảm */}
      <Route
        path="/admin/audit"
        element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AuditLogsPage />
          </PrivateRoute>
        }
      />

      {/* Core Academic Modules */}
      <Route
        path="/schedules"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'ASSISTANT', 'STUDENT']}>
            <SchedulePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'STUDENT']}>
            <AssignmentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'ASSISTANT', 'CONSULTANT', 'STUDENT', 'GUEST']}>
            <ClassesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tuition"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'ACCOUNTANT', 'STUDENT']}>
            <TuitionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/grades"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'STUDENT']}>
            <GradebookPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/course-registration"
        element={
          <PrivateRoute>
            <CourseRegistrationPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/student-services"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'TRAINING_MANAGER', 'STUDENT']}>
            <StudentServicesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admissions"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'TRAINING_MANAGER', 'CONSULTANT', 'GUEST']}>
            <AdmissionsPage />
          </PrivateRoute>
        }
      />

      {/* Subroutes mapping directly to functional pages */}
      <Route
        path="/manager/programs"
        element={
          <PrivateRoute allowedRoles={['TRAINING_MANAGER', 'ADMIN']}>
            <ClassesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/classes"
        element={
          <PrivateRoute allowedRoles={['TRAINING_MANAGER', 'ADMIN']}>
            <ClassesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/schedules"
        element={
          <PrivateRoute allowedRoles={['TRAINING_MANAGER', 'ADMIN']}>
            <SchedulePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/teacher/classes"
        element={
          <PrivateRoute allowedRoles={['TEACHER', 'ASSISTANT', 'ADMIN']}>
            <ClassesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <PrivateRoute allowedRoles={['TEACHER', 'ASSISTANT', 'TRAINING_MANAGER', 'ADMIN']}>
            <SchedulePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher/assignments"
        element={
          <PrivateRoute allowedRoles={['TEACHER', 'ADMIN']}>
            <AssignmentsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/consultant/leads"
        element={
          <PrivateRoute allowedRoles={['CONSULTANT', 'TRAINING_MANAGER', 'ADMIN']}>
            <AdmissionsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/consultant/funnel"
        element={
          <PrivateRoute allowedRoles={['CONSULTANT', 'TRAINING_MANAGER', 'ADMIN']}>
            <AdmissionsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/accountant/tuition"
        element={
          <PrivateRoute allowedRoles={['ACCOUNTANT', 'ADMIN']}>
            <TuitionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/accountant/debts"
        element={
          <PrivateRoute allowedRoles={['ACCOUNTANT', 'ADMIN']}>
            <TuitionPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/schedule"
        element={
          <PrivateRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <SchedulePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <PrivateRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <AssignmentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/tuition"
        element={
          <PrivateRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <TuitionPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/guest/courses"
        element={
          <PrivateRoute allowedRoles={['GUEST', 'ADMIN']}>
            <ClassesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/guest/register"
        element={
          <PrivateRoute allowedRoles={['GUEST', 'ADMIN']}>
            <AdmissionsPage />
          </PrivateRoute>
        }
      />

      {/* S1-07: Trang thông báo lỗi 403 Forbidden */}
      <Route
        path="/forbidden"
        element={
          <Layout>
            <Error403Page />
          </Layout>
        }
      />

      {/* Default & Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="*"
        element={
          <Layout>
            <Error404Page />
          </Layout>
        }
      />
    </Routes>
  )
}
