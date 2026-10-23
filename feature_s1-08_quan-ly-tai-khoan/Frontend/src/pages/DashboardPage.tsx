import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, roleLabels, roleColors, UserRole } from '../store/authStore'
import {
  Users,
  ShieldCheck,
  Calendar,
  GraduationCap,
  BookOpen,
  DollarSign,
  UserCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  if (!user) return null

  const role = user.activeRole || user.roles[0] || 'GUEST'
  const roleColor = roleColors[role] || roleColors.GUEST

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Đang trực tuyến: {roleLabels[role]}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {user.fullName}!
          </h1>
          <p className="mt-2 text-blue-100 text-xs sm:text-sm leading-relaxed">
            Chào mừng bạn đến với Cổng quản trị đào tạo <strong>TMS (Training Management System)</strong>. Màn hình làm việc và hệ thống menu đã được cá nhân hóa tự động theo đúng quyền hạn vai trò của bạn.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-blue-200">Các vai trò bạn đang có:</span>
            {user.roles.map((r) => (
              <span
                key={r}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  r === role ? 'bg-white text-blue-900 shadow-xs' : 'bg-white/20 text-white'
                }`}
              >
                {roleLabels[r]} {r === role && '★ (Đang dùng)'}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Role-Specific Dashboard Content (S1-06) */}
      {role === 'ADMIN' && <AdminDashboard />}
      {role === 'TRAINING_MANAGER' && <ManagerDashboard />}
      {role === 'TEACHER' && <TeacherDashboard />}
      {role === 'ASSISTANT' && <AssistantDashboard />}
      {role === 'CONSULTANT' && <ConsultantDashboard />}
      {role === 'ACCOUNTANT' && <AccountantDashboard />}
      {role === 'STUDENT' && <StudentDashboard />}
      {role === 'GUEST' && <GuestDashboard />}
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng tài khoản</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">34</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ Đã kích hoạt 30 · Đã khoá 4</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vai trò nghiệp vụ</span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">8</p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Phân quyền RBAC chuẩn hoá</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">An ninh phiên</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">100%</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Chặn truy cập trái quyền (403)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tiến độ Sprint 1</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600">10 / 10</p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">42 / 42 Story points hoàn thành</p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xs">Quản lý Tài khoản</h3>
              <p className="text-[11px] text-gray-500">Tạo, phân quyền, khóa tài khoản</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-blue-600">
            <span>Truy cập</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/schedules"
          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xs">Thời khóa biểu & Xếp lịch</h3>
              <p className="text-[11px] text-gray-500">Tự động tạo lịch, check trùng</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-emerald-600">
            <span>Xem lịch</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/assignments"
          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xs">Bài tập LMS & Chấm điểm</h3>
              <p className="text-[11px] text-gray-500">Nộp Git/báo cáo, chấm Rubric</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-blue-600">
            <span>Vào hệ thống</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/tuition"
          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xs">Học phí & Biên lai số</h3>
              <p className="text-[11px] text-gray-500">Thu phí, in biên lai, công nợ</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-amber-600">
            <span>Chi tiết</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  )
}

function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Chương trình đào tạo</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">4 Chương trình</p>
          <p className="text-xs text-gray-400 mt-1">Lập trình Web, Mobile, DevOps, AI</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Lớp đang vận hành</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">12 Lớp học</p>
          <p className="text-xs text-emerald-600 mt-1">100% đã xếp giảng viên</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Tỷ lệ chuyên cần trung bình</h4>
          <p className="text-2xl font-bold text-blue-600 mt-1">94.8%</p>
          <p className="text-xs text-gray-400 mt-1">Trên toàn trung tâm</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/schedules"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Sinh Lịch học & Thời khóa biểu Tự động</h4>
              <p className="text-xs text-gray-500">Tự động chia ca, phòng học, phát hiện trùng lịch giáo viên</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>
        <Link
          to="/classes"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Quản lý Lớp học & Khung đào tạo</h4>
              <p className="text-xs text-gray-500">Phân bổ giảng viên, quản lý danh sách học viên theo lớp</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>
    </div>
  )
}

function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Lớp phụ trách hôm nay</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">2 Lớp học</p>
          <p className="text-xs text-blue-600 mt-1">Ca 1: 18h00 · Ca 2: 20h00</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Bài tập cần chấm điểm</h4>
          <p className="text-2xl font-bold text-amber-600 mt-1">3 Bài nộp</p>
          <p className="text-xs text-gray-400 mt-1">Lớp REACT-K15-01</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Điểm danh chuyên cần</h4>
          <p className="text-2xl font-bold text-emerald-600 mt-1">Sẵn sàng</p>
          <p className="text-xs text-gray-400 mt-1">Điểm danh 4 trạng thái &lt; 60 giây</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/assignments"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Chấm điểm Bài tập (Rubrics)</h4>
              <p className="text-xs text-gray-500">Đánh giá tiêu chí & nhận xét bài làm</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>

        <Link
          to="/grades"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Sổ điểm Lớp học phần</h4>
              <p className="text-xs text-gray-500">Nhập điểm quá trình & thi kết thúc môn</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>

        <Link
          to="/schedules"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Lịch giảng dạy & Điểm danh</h4>
              <p className="text-xs text-gray-500">Xem phòng & điểm danh chuyên cần</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>
    </div>
  )
}

function AssistantDashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Lớp trợ giảng</h4>
        <p className="text-2xl font-bold text-gray-900 mt-1">3 Lớp học</p>
        <p className="text-xs text-teal-600 mt-1">Hỗ trợ học viên thực hành lab</p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Yêu cầu trợ giúp mở</h4>
        <p className="text-2xl font-bold text-blue-600 mt-1">5 Học viên</p>
        <p className="text-xs text-gray-400 mt-1">Cần hỗ trợ gỡ lỗi bài tập</p>
      </div>
    </div>
  )
}

function ConsultantDashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Leads mới cần gọi</h4>
        <p className="text-2xl font-bold text-amber-600 mt-1">8 Khách hàng</p>
        <p className="text-xs text-gray-400 mt-1">Từ Landing page đăng ký</p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Hẹn trải nghiệm thử</h4>
        <p className="text-2xl font-bold text-blue-600 mt-1">4 Lịch hẹn</p>
        <p className="text-xs text-gray-400 mt-1">Trong tuần này</p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Tỷ lệ chốt tháng này</h4>
        <p className="text-2xl font-bold text-emerald-600 mt-1">32.5%</p>
        <p className="text-xs text-emerald-600 mt-1">Vượt chỉ tiêu trung tâm</p>
      </div>
    </div>
  )
}

function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Học phí đã thu</h4>
          <p className="text-2xl font-bold text-emerald-600 mt-1">11.400.000 ₫</p>
          <p className="text-xs text-gray-400 mt-1">Đã xuất biên lai đầy đủ</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Công nợ cần nhắc đóng</h4>
          <p className="text-2xl font-bold text-rose-600 mt-1">13.200.000 ₫</p>
          <p className="text-xs text-gray-400 mt-1">3 học viên còn nợ học phí</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Biên lai điện tử</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">TMS-REC-001</p>
          <p className="text-xs text-gray-400 mt-1">Mã xác thực duy nhất</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">Quản trị Học phí & Thu tiền Học viên</h4>
            <p className="text-xs text-gray-500">Ghi nhận thanh toán tiền mặt/chuyển khoản, in biên lai điện tử chuẩn nhà trường</p>
          </div>
        </div>
        <Link
          to="/tuition"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Mở Sổ Thu Phí
        </Link>
      </div>
    </div>
  )
}

function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Lớp học hiện tại</h4>
          <p className="text-lg font-bold text-gray-900 mt-1 truncate">REACT-K15-01</p>
          <p className="text-xs text-blue-600 mt-1">Phòng Lab A2-301 · T2, T4, T6</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Điểm CPA tích lũy</h4>
          <p className="text-2xl font-black text-blue-600 mt-1">3.93 / 4.0</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">★ Xếp loại: Xuất sắc</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Đăng ký học phần</h4>
          <p className="text-2xl font-bold text-teal-600 mt-1">2 Môn học</p>
          <p className="text-xs text-gray-500 mt-1">6 / 24 Tín chỉ Kỳ II</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Dịch vụ một cửa</h4>
          <p className="text-2xl font-bold text-emerald-600 mt-1">2 Hồ sơ</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Đã cấp xác nhận số</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/schedules"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Thời khóa biểu cá nhân</h4>
              <p className="text-[11px] text-gray-500">Xem ca học, phòng học, giảng viên</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-blue-600">
            <span>Mở lịch</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/grades"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Bảng điểm & CPA tích lũy</h4>
              <p className="text-[11px] text-gray-500">Xem điểm chi tiết, in bảng điểm</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-amber-600">
            <span>Mở bảng điểm</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/course-registration"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-105 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Đăng ký học phần tín chỉ</h4>
              <p className="text-[11px] text-gray-500">Đăng ký môn học Kỳ II (2026-2027)</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-teal-600">
            <span>Đăng ký ngay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/assignments"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Bài tập & Nộp bài LMS</h4>
              <p className="text-[11px] text-gray-500">Nộp link Git, xem điểm & nhận xét</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-blue-600">
            <span>Vào nộp bài</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/student-services"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Dịch vụ Một cửa Sinh viên</h4>
              <p className="text-[11px] text-gray-500">Xin xác nhận sinh viên, in giấy mộc đỏ</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-blue-600">
            <span>Gửi yêu cầu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/tuition"
          className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Học phí & Biên lai điện tử</h4>
              <p className="text-[11px] text-gray-500">Tra cứu công nợ & in biên lai số</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-emerald-600">
            <span>Tra cứu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  )
}

function GuestDashboard() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <h3 className="font-bold text-gray-900 text-base">Chào mừng Khách tham quan!</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        Bạn đang truy cập hệ thống với tư cách Khách. Vui lòng liên hệ bộ phận Tuyển sinh hoặc Quản trị viên để được cấp tài khoản chính thức.
      </p>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
        <p className="font-semibold text-gray-800">Liên hệ tư vấn:</p>
        <p className="text-gray-600">📞 Hotline: 1900 6868 · ✉️ Email: contact@tms.edu.vn</p>
      </div>
    </div>
  )
}
