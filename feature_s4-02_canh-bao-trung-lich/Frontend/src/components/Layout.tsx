import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, roleLabels, roleColors, UserRole } from '../store/authStore'
import { switchRoleApi, logoutApi } from '../api/authApi'
import ChangePasswordModal from './ChangePasswordModal'
import UserProfileModal from './UserProfileModal'
import {
  User,
  Users,
  ShieldCheck,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  BookOpen,
  DollarSign,
  LogOut,
  KeyRound,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  FileText,
  Building2,
  CheckCircle2,
  Award,
  FileCheck2,
  UserPlus
} from 'lucide-react'

interface MenuItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  badge?: string
}

const ALL_MENU_ITEMS: MenuItem[] = [
  // 1. Dashboard chung
  { name: 'Cổng thông tin chung', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'ASSISTANT', 'CONSULTANT', 'ACCOUNTANT', 'STUDENT', 'GUEST'] },

  // 2. Thời khóa biểu & Lịch học
  { name: 'Thời khóa biểu & Lịch học', path: '/schedules', icon: Calendar, roles: ['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'ASSISTANT', 'STUDENT'], badge: 'Tự động' },

  // 3. Sổ điểm & Bảng điểm tích lũy chuẩn Đại học
  { name: 'Sổ điểm & Bảng điểm', path: '/grades', icon: Award, roles: ['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'STUDENT'], badge: 'Tín chỉ' },

  // 4. Đăng ký học phần tín chỉ
  { name: 'Đăng ký học phần', path: '/course-registration', icon: FileCheck2, roles: ['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'ASSISTANT', 'CONSULTANT', 'ACCOUNTANT', 'STUDENT', 'GUEST'], badge: 'Kỳ II' },

  // 5. Bài tập, Nộp bài & Chấm điểm LMS
  { name: 'Bài tập & Nộp bài LMS', path: '/assignments', icon: BookOpen, roles: ['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'STUDENT'], badge: 'Full LMS' },

  // 6. Dịch vụ Một Cửa Sinh Viên (Đơn từ điện tử)
  { name: 'Dịch vụ Một Cửa SV', path: '/student-services', icon: Building2, roles: ['ADMIN', 'TRAINING_MANAGER', 'STUDENT'], badge: 'Điện tử' },

  // 7. Quản lý Đào tạo, Chương trình, Lớp học
  { name: 'Lớp học & Chương trình', path: '/classes', icon: GraduationCap, roles: ['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'ASSISTANT', 'CONSULTANT', 'STUDENT', 'GUEST'] },

  // 8. Học phí & Biên lai điện tử
  { name: 'Học phí & Biên lai số', path: '/tuition', icon: DollarSign, roles: ['ADMIN', 'ACCOUNTANT', 'STUDENT'] },

  // 9. Cổng tuyển sinh & CRM Phễu hồ sơ
  { name: 'Tuyển sinh & Phễu CRM', path: '/admissions', icon: UserPlus, roles: ['ADMIN', 'TRAINING_MANAGER', 'CONSULTANT', 'GUEST'], badge: 'Online' },

  // 10. Quản trị tài khoản & Người dùng
  { name: 'Quản lý tài khoản (Users)', path: '/admin/users', icon: Users, roles: ['ADMIN', 'TRAINING_MANAGER'] },

  // 11. Phân quyền RBAC
  { name: 'Ma trận Phân quyền RBAC', path: '/admin/roles', icon: ShieldCheck, roles: ['ADMIN'] },

  // 12. Nhật ký hệ thống (Audit)
  { name: 'Nhật ký hệ thống (Audit)', path: '/admin/audit', icon: FileText, roles: ['ADMIN'] },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth, setActiveRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  if (!user) return null

  const activeRole = user.activeRole || user.roles[0] || 'GUEST'
  const roleColor = roleColors[activeRole] || roleColors.GUEST

  // S1-06: Lọc menu theo vai trò hiện tại
  const accessibleMenuItems = ALL_MENU_ITEMS.filter((item) => item.roles.includes(activeRole))

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // ignore
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  const handleSwitchRole = async (targetRole: UserRole) => {
    if (targetRole === activeRole) {
      setRoleSwitcherOpen(false)
      return
    }
    setSwitching(true)
    try {
      const res = await switchRoleApi(targetRole)
      setActiveRole(res.activeRole)
      setRoleSwitcherOpen(false)
      navigate('/dashboard')
    } catch (err) {
      console.error('Không thể chuyển vai trò:', err)
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Navbar (Tối ưu 360px per S1-06) */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-sm shadow-xs">
              TMS
            </div>
            <span className="font-bold text-gray-900 text-sm">Portal Đào Tạo</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${roleColor.bg} ${roleColor.text} ${roleColor.border}`}>
            {roleLabels[activeRole]}
          </span>
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName)}`}
            alt={user.fullName}
            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
          />
        </div>
      </header>

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-64 lg:w-72 shadow-xs ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-900 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-200">
              <Building2 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm tracking-tight leading-none uppercase">
                Đại Học Đào Tạo TMS
              </h1>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider">
                HỆ THỐNG QUẢN LÝ ĐÀO TẠO
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card & Role Switcher */}
        <div className="p-3.5 mx-3 my-3 bg-gradient-to-b from-blue-50/50 to-white rounded-2xl border border-blue-100/70 shadow-2xs">
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 cursor-pointer group"
            title="Nhấn để xem và chỉnh sửa hồ sơ cá nhân"
          >
            <div className="relative">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName)}`}
                alt={user.fullName}
                className="w-10 h-10 rounded-full border-2 border-white shadow-xs object-cover group-hover:ring-2 group-hover:ring-blue-600 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-gray-900 text-xs truncate group-hover:text-blue-700 transition-colors" title={user.fullName}>
                {user.fullName}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${roleColor.bg} ${roleColor.text} ${roleColor.border}`}>
                  {roleLabels[activeRole]}
                </span>
              </div>
            </div>
          </div>

          {/* S1-09: Đổi vai trò linh hoạt nếu sở hữu nhiều role */}
          {user.roles && user.roles.length > 1 && (
            <div className="mt-2.5 pt-2.5 border-t border-blue-100/60">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                  disabled={switching}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white border border-blue-200 rounded-xl text-[11px] font-bold text-blue-900 hover:bg-blue-50/50 transition-colors shadow-2xs"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Đổi vai trò: {roleLabels[activeRole]}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                </button>

                {roleSwitcherOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl py-1 z-30 animate-in fade-in">
                    {user.roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleSwitchRole(r)}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                          r === activeRole ? 'font-bold text-blue-600 bg-blue-50/40' : 'text-gray-700'
                        }`}
                      >
                        {roleLabels[r]}
                        {r === activeRole && <span className="text-[10px] text-blue-600">✓ Đang dùng</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Navigation Menu (S1-06) */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Chức năng theo thẩm quyền
          </p>
          {accessibleMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <KeyRound className="w-4 h-4 text-gray-400" />
            <span>Đổi mật khẩu</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 px-6 items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-black rounded-lg border border-blue-100 font-mono">
              HỌC KỲ I · 2026 - 2027
            </span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cổng Đào Tạo Trực Tuyến Đang Hoạt Động (100% OK)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Vai trò đang dùng:</span>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${roleColor.bg} ${roleColor.text} ${roleColor.border}`}>
                {roleLabels[activeRole]}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName)}`}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                />
                <span className="text-xs font-bold text-gray-800 max-w-[120px] truncate">
                  {user.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-40 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      setIsProfileModalOpen(true)
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      setIsPasswordModalOpen(true)
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4 text-gray-400" />
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 flex flex-col justify-between">
          <div className="flex-1">{children}</div>

          {/* Cổng Thông Tin Trường Đại Học Footer */}
          <footer className="pt-6 border-t border-gray-200 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center text-white font-bold text-xs">
                TMS
              </div>
              <div>
                <p className="font-bold text-gray-800 uppercase tracking-tight">
                  Trường Đại Học Công Nghệ & Quản Lý Đào Tạo TMS
                </p>
                <p className="text-[10px] text-gray-400">
                  Cơ quan chủ quản: Bộ Giáo dục và Đào tạo · Hệ thống Quản trị Đào tạo (TMS Portal v2.0)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-gray-600">
              <span className="flex items-center gap-1 text-blue-700">📞 Hotline: 1900 6868</span>
              <span>·</span>
              <span>✉️ daotao@tms.edu.vn</span>
              <span>·</span>
              <span>🏛️ Cơ sở 1: Khu Công Nghệ Cao, Hà Nội</span>
            </div>
          </footer>
        </main>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-2xs"
        />
      )}
    </div>
  )
}
