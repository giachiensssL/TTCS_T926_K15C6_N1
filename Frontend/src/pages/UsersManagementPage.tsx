import React, { useState, useEffect, useCallback } from 'react'

import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  updateAvatarApi,
  assignRoleApi,
  revokeRoleApi,
  lockUserApi,
  unlockUserApi,
} from '../api/usersApi'

import type { UserItem } from '../api/usersApi'

import { extractApiError } from '../api/authApi'

import { useAuthStore, roleLabels, roleColors } from '../store/authStore'
import type { UserRole } from '../store/authStore'
import {
  Search,
  UserPlus,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Copy,
  Edit2,
  AlertCircle
} from 'lucide-react'

const ALL_ROLES: UserRole[] = [
  'ADMIN',
  'TRAINING_MANAGER',
  'TEACHER',
  'ASSISTANT',
  'CONSULTANT',
  'ACCOUNTANT',
  'STUDENT',
  'GUEST',
]

export default function UsersManagementPage() {
  const currentAdmin = useAuthStore((s) => s.user)
  // S2-03: Ảnh đại diện
const [avatarModalOpen, setAvatarModalOpen] = useState(false)
const [avatarFile, setAvatarFile] = useState<File | null>(null)
const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
const [avatarMimeType, setAvatarMimeType] =
  useState<'image/jpeg' | 'image/png' | null>(null)
const [avatarSize, setAvatarSize] = useState(0)
const [avatarUploading, setAvatarUploading] = useState(false)

  // State danh sách
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(20) // S1-08: Mặc định 20 dòng

  // Bộ lọc tìm kiếm
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Thông báo phản hồi
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; warning?: string } | null>(null)

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [lockModalOpen, setLockModalOpen] = useState(false)

  // User đang được chọn thao tác
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  
  const handleAvatarFileChange = (file: File | null) => {
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png']

  if (!allowedTypes.includes(file.type)) {
    setFeedback({
      type: 'error',
      message: 'Chỉ chấp nhận ảnh JPG hoặc PNG.',
    })
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    setFeedback({
      type: 'error',
      message: 'Ảnh không được vượt quá 2MB.',
    })
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    const image = new Image()

    image.onload = () => {
      const size = Math.min(image.width, image.height)
      const sx = (image.width - size) / 2
      const sy = (image.height - size) / 2

      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 400

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        setFeedback({
          type: 'error',
          message: 'Không thể xử lý ảnh.',
        })
        return
      }

      ctx.drawImage(
        image,
        sx,
        sy,
        size,
        size,
        0,
        0,
        400,
        400,
      )

      const cropped = canvas.toDataURL(file.type, 0.9)

      setAvatarFile(file)
      setAvatarPreview(cropped)
      setAvatarMimeType(file.type as 'image/jpeg' | 'image/png')
      setAvatarSize(file.size)
    }

    image.src = reader.result as string
  }

  reader.readAsDataURL(file)
}
const openAvatarModal = (user: UserItem) => {
  setSelectedUser(user)
  setAvatarFile(null)
  setAvatarPreview(user.avatar || null)
  setAvatarMimeType(null)
  setAvatarSize(0)
  setAvatarModalOpen(true)
}
const handleSaveAvatar = async () => {
  if (!selectedUser || !avatarPreview || !avatarMimeType || !avatarFile) {
    setFeedback({
      type: 'error',
      message: 'Vui lòng chọn ảnh đại diện.',
    })
    return
  }

  try {
    setAvatarUploading(true)

    const res = await updateAvatarApi({
      avatar: avatarPreview,
      mimeType: avatarMimeType,
      size: avatarSize,
    })

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id
          ? { ...user, avatar: res.avatar }
          : user,
      ),
    )

    setSelectedUser((prev) =>
      prev ? { ...prev, avatar: res.avatar } : prev,
    )

    setFeedback({
      type: 'success',
      message: 'Cập nhật ảnh đại diện thành công.',
    })

    setAvatarModalOpen(false)
  } catch (err) {
    setFeedback({
      type: 'error',
      message: extractApiError(err)?.toString() || 'Không thể cập nhật ảnh đại diện.',
    })
  } finally {
    setAvatarUploading(false)
  }
}


  // Form Thêm tài khoản mới (S1-08)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRoles, setNewRoles] = useState<UserRole[]>(['STUDENT'])
  const [createdResult, setCreatedResult] = useState<{ user: UserItem; tempPassword?: string } | null>(null)

  // Form Sửa tài khoản (S1-08)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')

  // Form Gán/Thu hồi vai trò (S1-09)
  const [roleToAssign, setRoleToAssign] = useState<UserRole>('TEACHER')

  // Form Khoá tài khoản (S1-10)
  const [lockReason, setLockReason] = useState('')
  const [, setLockWarning] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUsersApi({
        search,
        role: selectedRole,
        status: selectedStatus,
        page,
        limit,
      })
      setUsers(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setLoading(false)
    }
  }, [search, selectedRole, selectedStatus, page, limit])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Xử lý tạo tài khoản mới (S1-08)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    try {
      const res = await createUserApi({
        fullName: newName,
        email: newEmail,
        phone: newPhone,
        roles: newRoles,
      })
      setCreatedResult({ user: res.user, tempPassword: res.tempPassword })
      setFeedback({ type: 'success', message: res.message })
      fetchUsers()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    }
  }

  // Xử lý cập nhật thông tin người dùng (S1-08)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setFeedback(null)
    try {
      const res = await updateUserApi(selectedUser.id, {
        fullName: editName,
        phone: editPhone,
      })
      setFeedback({ type: 'success', message: res.message })
      setEditModalOpen(false)
      fetchUsers()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    }
  }

  // Xử lý gán vai trò (S1-09)
  const handleAssignRole = async () => {
    if (!selectedUser) return
    setFeedback(null)
    try {
      const res = await assignRoleApi(selectedUser.id, roleToAssign)
      setFeedback({ type: 'success', message: res.message })
      setSelectedUser({ ...selectedUser, roles: res.roles })
      fetchUsers()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    }
  }

  // Xử lý thu hồi vai trò (S1-09)
  const handleRevokeRole = async (roleName: UserRole) => {
    if (!selectedUser) return
    setFeedback(null)

    // Kiểm tra quy tắc tự bảo vệ của Admin
    if (roleName === 'ADMIN' && currentAdmin && selectedUser.id === currentAdmin.id) {
      setFeedback({
        type: 'error',
        message: 'Bạn không thể tự thu hồi vai trò Quản trị viên (ADMIN) của chính mình.',
      })
      return
    }

    try {
      const res = await revokeRoleApi(selectedUser.id, roleName)
      setFeedback({ type: 'success', message: res.message })
      setSelectedUser({ ...selectedUser, roles: res.roles })
      fetchUsers()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    }
  }

  // Xử lý khoá tài khoản (S1-10)
  const handleLockUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    if (!lockReason.trim()) {
      setFeedback({ type: 'error', message: 'Bắt buộc nhập lý do khoá tài khoản.' })
      return
    }

    try {
      const res = await lockUserApi(selectedUser.id, lockReason)
      setFeedback({
        type: 'success',
        message: res.message,
        warning: res.warningMessage,
      })
      setLockModalOpen(false)
      setLockReason('')
      fetchUsers()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    }
  }

  // Xử lý mở khoá tài khoản (S1-10)
  const handleUnlockUser = async (user: UserItem) => {
    setFeedback(null)
    try {
      const res = await unlockUserApi(user.id)
      setFeedback({ type: 'success', message: res.message })
      fetchUsers()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý tài khoản người dùng</h1>
          <p className="text-xs text-gray-500 mt-1">
            Sprint 1: S1-08 (Tạo, sửa, tìm kiếm) · S1-09 (Gán/thu hồi vai trò) · S1-10 (Khoá/mở khoá)
          </p>
        </div>
        <button
          onClick={() => {
            setCreatedResult(null)
            setNewName('')
            setNewEmail('')
            setNewPhone('')
            setNewRoles(['STUDENT'])
            setCreateModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      {/* Thông báo Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            {feedback.warning && (
              <div className="flex items-center gap-2 text-amber-800 bg-amber-100/60 px-3 py-1.5 rounded-lg text-xs font-semibold mt-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{feedback.warning}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Tìm theo họ tên, email, số điện thoại..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter by Role */}
        <div className="flex items-center gap-2 sm:w-56">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả vai trò</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabels[r]}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div className="sm:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="LOCKED">Đã khoá</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/80 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Người dùng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Vai trò (RBAC)</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-2" />
                    <p>Đang tải danh sách người dùng...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = currentAdmin?.id === u.id
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.fullName)}`}
                            alt={u.fullName}
                            className="w-9 h-9 rounded-full border border-gray-200 object-cover shrink-0"
                          />
                          <button
  type="button"
  onClick={() => openAvatarModal(u)}
  className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
>
  Đổi ảnh
</button>
                          <div className="overflow-hidden">
                            <p className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                              {u.fullName}
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">
                                  Bạn
                                </span>
                              )}
                            </p>
                            <p className="text-gray-500 text-[11px] truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-mono">
                        {u.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.roles.map((r) => {
                            const c = roleColors[r] || roleColors.GUEST
                            return (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}
                              >
                                {roleLabels[r]}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Hoạt động
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Đã khoá
                            </span>
                            {u.lockReason && (
                              <p className="text-[10px] text-gray-400 italic max-w-xs truncate" title={u.lockReason}>
                                Lý do: {u.lockReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sửa thông tin */}
                          <button
                            onClick={() => {
                              setSelectedUser(u)
                              setEditName(u.fullName)
                              setEditPhone(u.phone || '')
                              setEditModalOpen(true)
                            }}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Quản lý vai trò (S1-09) */}
                          <button
                            onClick={() => {
                              setSelectedUser(u)
                              setRoleModalOpen(true)
                            }}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Gán/thu hồi vai trò"
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          {/* Khoá / Mở khoá (S1-10) */}
                          {u.status === 'ACTIVE' ? (
                            <button
                              onClick={() => {
                                setSelectedUser(u)
                                setLockReason('')
                                setLockWarning(null)
                                setLockModalOpen(true)
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Khoá tài khoản"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnlockUser(u)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Mở khoá tài khoản"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (S1-08: Mặc định 20 dòng) */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Hiển thị <span className="font-semibold text-gray-800">{users.length}</span> trên tổng số{' '}
            <span className="font-semibold text-gray-800">{total}</span> người dùng (20 dòng/trang)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Trang {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Tạo tài khoản mới (S1-08) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">Tạo tài khoản người dùng mới (S1-08)</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdResult ? (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Tạo tài khoản thành công!</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Email kích hoạt kèm thông tin đăng nhập đã được gửi tới người dùng:
                    </p>
                    <div className="mt-3 p-3 bg-white border border-emerald-200 rounded-xl space-y-1 font-mono text-xs text-gray-800">
                      <p>Email: <span className="font-bold">{createdResult.user.email}</span></p>
                      <p className="flex items-center gap-2">
                        Mật khẩu tạm: <span className="font-bold text-indigo-600">{createdResult.tempPassword}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(createdResult.tempPassword || '')}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500"
                          title="Sao chép"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setCreatedResult(null)
                      setCreateModalOpen(false)
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                  >
                    Hoàn tất & Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">
                    Email tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nguyenvana@tms.edu.vn"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    required
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Hệ thống sẽ từ chối nếu email đã tồn tại (S1-08 AC-02).</p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1.5">
                    Vai trò khởi tạo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_ROLES.map((r) => {
                      const checked = newRoles.includes(r)
                      return (
                        <label
                          key={r}
                          className={`flex items-center gap-2 p-2 border rounded-xl cursor-pointer transition-all ${
                            checked ? 'bg-indigo-50 border-indigo-300 font-semibold text-indigo-900' : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRoles([...newRoles, r])
                              } else {
                                if (newRoles.length > 1) {
                                  setNewRoles(newRoles.filter((item) => item !== r))
                                }
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{roleLabels[r]}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-xs"
                  >
                    Tạo tài khoản & gửi email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Sửa thông tin người dùng (S1-08) */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">Sửa thông tin: {selectedUser.email}</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Gán và thu hồi vai trò (S1-09) */}
      {roleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Gán và thu hồi vai trò (S1-09)</h3>
                <p className="text-[11px] text-gray-500">{selectedUser.fullName} ({selectedUser.email})</p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Vai trò hiện tại */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-2">
                  Vai trò đang nắm giữ (Một người dùng có thể giữ nhiều vai trò):
                </label>
                <div className="space-y-2">
                  {selectedUser.roles.map((r) => {
                    const c = roleColors[r] || roleColors.GUEST
                    const isSelfAdmin = r === 'ADMIN' && currentAdmin?.id === selectedUser.id
                    return (
                      <div
                        key={r}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200/70"
                      >
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
                          {roleLabels[r]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRevokeRole(r)}
                          disabled={selectedUser.roles.length <= 1 || isSelfAdmin}
                          className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg font-medium text-[11px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isSelfAdmin ? 'Không thể tự thu hồi (S1-09)' : 'Thu hồi vai trò'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Gán thêm vai trò */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block font-semibold text-gray-700 uppercase mb-2">
                  Gán thêm vai trò mới:
                </label>
                <div className="flex gap-2">
                  <select
                    value={roleToAssign}
                    onChange={(e) => setRoleToAssign(e.target.value as UserRole)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {ALL_ROLES.filter((r) => !selectedUser.roles.includes(r)).map((r) => (
                      <option key={r} value={r}>
                        {roleLabels[r]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignRole}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Gán vai trò
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Khoá tài khoản (S1-10) */}
      {lockModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-950 text-sm">Khoá tài khoản người dùng (S1-10)</h3>
              </div>
              <button
                onClick={() => setLockModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLockUser} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <p className="font-bold">⚠️ Hành động này sẽ:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Chặn đăng nhập ngay lập tức đối với {selectedUser.email}.</li>
                  <li>Thu hồi toàn bộ các phiên làm việc đang mở trên mọi thiết bị.</li>
                  <li>Kiểm tra và cảnh báo bàn giao các lớp học mà nhân sự này phụ trách.</li>
                </ul>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Lý do khoá tài khoản <span className="text-red-500">* (Bắt buộc per S1-10)</span>
                </label>
                <textarea
                  rows={3}
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Ví dụ: Nhân sự đã nghỉ việc từ ngày 01/10/2026..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLockModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Xác nhận khoá tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL S2-03: Cập nhật ảnh đại diện */}
{avatarModalOpen && selectedUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">
            Cập nhật ảnh đại diện (S2-03)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedUser.fullName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAvatarModalOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="text-center">
          <img
            src={
              avatarPreview ||
              selectedUser.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                selectedUser.fullName,
              )}`
            }
            alt={selectedUser.fullName}
            className="w-32 h-32 mx-auto rounded-xl object-cover border border-gray-200"
          />

          <p className="text-xs text-gray-500 mt-2">
            Ảnh sẽ tự động được cắt vuông 1:1
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Chọn ảnh JPG hoặc PNG
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) =>
              handleAvatarFileChange(e.target.files?.[0] || null)
            }
            className="block w-full text-xs text-gray-600
              file:mr-3 file:py-2 file:px-3
              file:rounded-lg file:border-0
              file:text-xs file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />

          <p className="text-[11px] text-gray-500 mt-2">
            Dung lượng tối đa: 2MB.
          </p>
        </div>

        {avatarPreview && avatarFile && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200">
            <p className="text-xs text-green-700">
              ✓ Ảnh đã được xử lý và tạo preview thành công.
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setAvatarModalOpen(false)}
          className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 text-xs"
        >
          Hủy
        </button>

        <button
          type="button"
          onClick={handleSaveAvatar}
          disabled={
            avatarUploading ||
            !avatarFile ||
            !avatarPreview ||
            !avatarMimeType
          }
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold"
        >
          {avatarUploading ? 'Đang lưu...' : 'Lưu ảnh đại diện'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  )
}

