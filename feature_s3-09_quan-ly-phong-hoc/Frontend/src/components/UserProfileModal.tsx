import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore, roleLabels, roleColors, UserRole } from '../store/authStore'
import { updateProfileApi, updateAvatarApi, extractApiError } from '../api/authApi'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Camera,
  CheckCircle2,
  AlertTriangle,
  X,
  Upload,
  Crop,
  Sparkles
} from 'lucide-react'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateUser } = useAuthStore()

  // Form states (S2-02)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')

  // Avatar state (S2-03)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [rawImageFile, setRawImageFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Status & Notifications
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName || '')
      setPhone(user.phone || '')
      setDob(user.dob || '')
      setAddress(user.address || '')
      setAvatarPreview(user.avatar || null)
      setNotification(null)
      setPhoneError(null)
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  // S2-02: Kiểm tra định dạng số điện thoại Việt Nam (10 chữ số, đầu số hợp lệ)
  const validatePhoneVN = (val: string) => {
    if (!val.trim()) {
      setPhoneError(null)
      return true
    }
    const clean = val.trim().replace(/[\s.-]/g, '')
    const regex = /^(0|\+84)[35789][0-9]{8}$/
    if (!regex.test(clean)) {
      setPhoneError('Số điện thoại không đúng định dạng Việt Nam (10 chữ số, ví dụ 0912345678 hoặc +84912345678).')
      return false
    }
    setPhoneError(null)
    return true
  }

  // S2-03: Xử lý chọn tệp ảnh & cắt vuông tạo thumbnail
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Kiểm tra định dạng JPG/PNG
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setNotification({
        type: 'error',
        message: 'Chỉ chấp nhận tệp hình ảnh định dạng JPG hoặc PNG!',
      })
      return
    }

    // 2. Kiểm tra dung lượng tối đa 2MB
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setNotification({
        type: 'error',
        message: 'Dung lượng ảnh vượt quá 2MB. Vui lòng chọn tệp nhỏ hơn!',
      })
      return
    }

    // 3. Cắt vuông (center square crop) và tạo thumbnail 256x256 bằng HTML5 Canvas
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 256
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        if (ctx) {
          // Tính toán vùng vuông trung tâm
          const minDim = Math.min(img.width, img.height)
          const startX = (img.width - minDim) / 2
          const startY = (img.height - minDim) / 2

          // Vẽ ảnh vuông thu nhỏ
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size)

          // Xuất Data URL chất lượng cao
          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
          setAvatarPreview(croppedDataUrl)
          setRawImageFile(file)
          setNotification({
            type: 'success',
            message: 'Ảnh đã được cắt vuông và tạo bản thu nhỏ sắc nét! Nhấn "Lưu hồ sơ" để hoàn tất.',
          })
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      setNotification({ type: 'error', message: 'Họ và tên không được để trống.' })
      return
    }

    if (!validatePhoneVN(phone)) {
      return
    }

    setSaving(true)
    setNotification(null)

    try {
      // 1. Cập nhật Avatar nếu có thay đổi (S2-03)
      if (avatarPreview && avatarPreview !== user.avatar) {
        setUploadingAvatar(true)
        await updateAvatarApi(avatarPreview)
        updateUser({ avatar: avatarPreview })
        setUploadingAvatar(false)
      }

      // 2. Cập nhật thông tin cá nhân (S2-02)
      const res = await updateProfileApi({
        fullName: fullName.trim(),
        phone: phone.trim(),
        dob: dob || undefined,
        address: address.trim() || undefined,
      })

      updateUser({
        fullName: res.user.fullName,
        phone: res.user.phone,
        dob: res.user.dob,
        address: res.user.address,
        avatar: res.user.avatar || avatarPreview || user.avatar,
      })

      setNotification({
        type: 'success',
        message: 'Cập nhật hồ sơ cá nhân và ảnh đại diện thành công!',
      })

      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: extractApiError(err).message,
      })
    } finally {
      setSaving(false)
      setUploadingAvatar(false)
    }
  }

  const activeRole = user.activeRole || user.roles[0] || 'STUDENT'
  const roleColor = roleColors[activeRole] || roleColors.STUDENT

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-purple-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Hồ sơ cá nhân</h3>
              <p className="text-xs text-gray-500">Xem và cập nhật thông tin liên lạc chuẩn đại học</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-6 flex-1">
          {notification && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium border ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* S2-03: Ảnh đại diện với tính năng Cắt vuông & Thumbnail */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="relative group">
              <img
                src={
                  avatarPreview ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName)}`
                }
                alt={user.fullName}
                className="w-24 h-24 rounded-2xl border-2 border-white shadow-md object-cover bg-white"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs cursor-pointer"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Cắt vuông</span>
              </button>
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-bold text-gray-900 text-sm">{user.fullName}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${roleColor.bg} ${roleColor.text} ${roleColor.border}`}
                >
                  {roleLabels[activeRole]}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Chấp nhận file <strong className="text-gray-700">JPG hoặc PNG</strong>, dung lượng tối đa{' '}
                <strong className="text-gray-700">2MB</strong>. Ảnh tự động cắt vuông và tối ưu thumbnail sắc nét.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn ảnh mới từ máy</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Họ và tên (Editable) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-hidden transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Email (Read-only per S2-02) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Địa chỉ Email <span className="text-[11px] font-normal text-amber-600">(Không thể tự đổi)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed select-none"
                  title="Theo quy định đào tạo, email tài khoản là định danh duy nhất và không thể tự thay đổi"
                />
              </div>
            </div>

            {/* Số điện thoại (Editable với kiểm tra chuẩn VN - S2-02) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    validatePhoneVN(e.target.value)
                  }}
                  placeholder="0912345678"
                  className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-xs font-medium focus:ring-2 outline-hidden transition-all shadow-2xs ${
                    phoneError
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                      : 'border-gray-200 focus:ring-indigo-600 focus:border-transparent'
                  }`}
                  required
                />
              </div>
              {phoneError && <p className="text-[11px] text-red-600 mt-1 font-medium">{phoneError}</p>}
            </div>

            {/* Ngày sinh (Editable - S2-02) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Ngày sinh</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Địa chỉ cư trú (Editable - S2-02) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Địa chỉ liên lạc / Thường trú</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                rows={2}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-hidden transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Vai trò nghiệp vụ (Read-only per S2-02) */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-950">
                Vai trò được cấp phép trong hệ thống:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {user.roles.map((r: UserRole) => {
                  const col = roleColors[r] || roleColors.STUDENT
                  return (
                    <span
                      key={r}
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${col.bg} ${col.text} ${col.border}`}
                    >
                      {roleLabels[r]}
                    </span>
                  )
                })}
              </div>
              <p className="text-[10px] text-gray-500 pt-1">
                * Vai trò do Quản trị hệ thống phê duyệt phân quyền, người dùng không thể tự thay đổi vai trò.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving || Boolean(phoneError)}
              className="px-5 py-2.5 rounded-xl bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
            >
              {saving ? (
                <span>Đang lưu thông tin...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu hồ sơ cá nhân</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
