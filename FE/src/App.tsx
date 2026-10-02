import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminAccountsPage from './pages/AdminAccountsPage'
import { getCurrentUserApi } from './api/authApi'
import { type UserRole, roleToPath, useAuthStore } from './store/authStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute() {
  const role = useAuthStore((state) => state.role)
  return role === 'ADMIN'
    ? <AdminAccountsPage />
    : <Navigate to={role ? roleToPath[role] : '/login'} replace />
}

export default function App() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    getCurrentUserApi()
      .then(({ role }) => setAuth(role as UserRole))
      .catch((error: unknown) => {
        if (error instanceof AxiosError && error.response?.status === 401) {
          clearAuth()
          return
        }
        setSessionError('Không thể kiểm tra phiên đăng nhập. Vui lòng tải lại trang.')
      })
      .finally(() => setIsCheckingSession(false))
  }, [clearAuth, setAuth])

  if (isCheckingSession) {
    return <div className="min-h-screen grid place-items-center text-gray-600">Đang kiểm tra phiên đăng nhập...</div>
  }

  if (sessionError) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-center text-red-700" role="alert">
        {sessionError}
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/:role/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/accounts"
        element={
          <PrivateRoute>
            <AdminRoute />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
