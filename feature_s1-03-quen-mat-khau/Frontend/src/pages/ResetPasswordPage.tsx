import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { resetPasswordApi, extractApiError } from '../api/authApi'
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Mã xác thực (token) không tồn tại hoặc đã hết hạn.')
      return
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự.')
      return
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Mật khẩu mới phải bao gồm cả chữ cái và chữ số.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không trùng khớp.')
      return
    }

    setLoading(true)
    try {
      const res = await resetPasswordApi(token, newPassword)
      setSuccess(res.message)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const apiErr = extractApiError(err)
      setError(apiErr.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-900 text-white shadow-md shadow-blue-900/20 ring-4 ring-blue-100 mb-4">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Đặt lại mật khẩu</h2>
          <p className="mt-1 text-xs text-slate-600">
            Hệ thống xác thực một cửa (SSO) · Thiết lập mật khẩu mới an toàn cho tài khoản của bạn
          </p>
        </div>

        <div className="mt-6 bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200">
          {!token && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-2 mb-4">
              <p className="font-semibold">⚠️ Không tìm thấy liên kết token đặt lại mật khẩu.</p>
              <p>Vui lòng yêu cầu lại liên kết từ trang Quên mật khẩu.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
              <p className="text-[11px] text-emerald-700">Hệ thống sẽ tự động chuyển hướng về trang Đăng nhập trong 3 giây...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                disabled={loading || !token || Boolean(success)}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, gồm cả chữ và số"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/70 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900 disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                disabled={loading || !token || Boolean(success)}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/70 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900 disabled:opacity-50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token || Boolean(success)}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 hover:from-blue-800 hover:via-blue-700 hover:to-slate-800 transition-all shadow-md shadow-blue-900/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang cập nhật mật khẩu...' : 'Cập nhật mật khẩu mới'}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại màn hình Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}