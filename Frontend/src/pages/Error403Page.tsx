import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, roleLabels } from '../store/authStore'
import { ShieldAlert, ArrowLeft, Home, Sparkles } from 'lucide-react'

export default function Error403Page() {
  const { user } = useAuthStore()
  const activeRole = user?.activeRole || 'GUEST'

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-2">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
          MÃ LỖI 403 · KHÔNG CÓ QUYỀN TRUY CẬP (S1-07)
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Bạn không có quyền thực hiện thao tác này
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
          Vai trò hiện tại của bạn là <strong className="text-gray-800">{roleLabels[activeRole]}</strong>. Chức năng này được bảo vệ bởi chính sách phân quyền RBAC và chỉ dành cho các vai trò được cấp phép.
        </p>
      </div>

      {user && user.roles.length > 1 && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Bạn có nhiều vai trò! Hãy thử chuyển đổi vai trò ở menu góc trái để truy cập.
          </span>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ của bạn</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang trước</span>
        </button>
      </div>
    </div>
  )
}
