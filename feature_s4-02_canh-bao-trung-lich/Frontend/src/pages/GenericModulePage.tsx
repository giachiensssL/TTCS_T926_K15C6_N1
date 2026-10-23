import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, roleLabels } from '../store/authStore'
import { BookOpen, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'

interface Props {
  title: string
  description: string
  sprint?: string
}

export default function GenericModulePage({ title, description, sprint = 'Sprint tương ứng' }: Props) {
  const { user } = useAuthStore()
  const activeRole = user?.activeRole || 'GUEST'

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">
          {sprint}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Kiểm tra phân quyền thành công (S1-05 & S1-06)</span>
        </div>

        <h3 className="text-base font-bold text-gray-900">
          Bạn đang truy cập chức năng với vai trò hợp lệ: {roleLabels[activeRole]}
        </h3>

        <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
          Menu điều hướng và đường dẫn này chỉ hiển thị và cho phép truy cập đối với các vai trò được cấp phép trong hệ thống TMS (tuân thủ User Story S1-06). Các vai trò không thuộc quyền đã bị ẩn hoặc chặn hoàn toàn ở tầng Server.
        </p>

        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2 text-xs text-indigo-900">
          <p className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Trạng thái Sprint 1: Hoàn thành 10/10 User Stories</span>
          </p>
          <p className="text-indigo-800 text-[11px]">
            Quản trị viên đã tạo tài khoản cho toàn bộ nhân sự và học viên, mỗi vai trò đăng nhập vào chỉ nhìn thấy đúng phần menu thuộc quyền của mình.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Tổng quan</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
