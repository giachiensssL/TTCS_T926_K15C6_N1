import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'

export default function Error404Page() {
  const location = useLocation()

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-2">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
          MÃ LỖI 404 · TRANG KHÔNG TỒN TẠI (S1-07)
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Không tìm thấy trang yêu cầu
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
          Đường dẫn <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono text-xs">{location.pathname}</code> không tồn tại hoặc đã được di dời trong hệ thống.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
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
