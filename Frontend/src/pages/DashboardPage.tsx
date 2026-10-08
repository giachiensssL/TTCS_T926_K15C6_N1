import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const roleLabels: Record<string, string> = {
  ADMIN: 'Quản trị hệ thống',
  TRAINING_MANAGER: 'Quản lý đào tạo',
  TEACHER: 'Giảng viên',
  ASSISTANT: 'Trợ giảng',
  CONSULTANT: 'Tư vấn tuyển sinh',
  ACCOUNTANT: 'Kế toán',
  STUDENT: 'Học viên',
  GUEST: 'Khách',
}

export default function DashboardPage() {
  const { role, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="bg-white rounded-2xl shadow-md px-8 py-10 text-center max-w-sm w-full">
        <div className="text-4xl mb-4">👋</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Xin chào!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Bạn đã đăng nhập với vai trò <span className="font-semibold text-indigo-600">{roleLabels[role ?? ''] ?? role}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
