import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordApi, extractApiError } from '../api/authApi'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ExternalLink, ShieldCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [demoResetUrl, setDemoResetUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setDemoResetUrl(null)

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.')
      return
    }

    setLoading(true)
    try {
      const res = await forgotPasswordApi(email.trim())
      setMessage(res.message)
      if (res.demoResetUrl) {
        setDemoResetUrl(res.demoResetUrl)
      }
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
            <KeyRound className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Khôi phục mật khẩu</h2>
          <p className="mt-1 text-xs text-slate-600">
            Hệ thống xác thực một cửa (SSO) · Nhập email để nhận liên kết đặt lại mật khẩu an toàn
          </p>
        </div>

        <div className="mt-6 bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 font-medium leading-relaxed">{message}</p>
              </div>

              {demoResetUrl && (
                <div className="pt-2 border-t border-emerald-200/60">
                  <p className="text-[11px] text-emerald-700 font-semibold mb-1.5">
                    Liên kết khôi phục (Thử nghiệm trực tiếp):
                  </p>
                  <Link
                    to={demoResetUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <span>Mở trang đặt lại mật khẩu</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Địa chỉ email đăng ký <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email (ví dụ: teacher@tms.edu.vn)"
                  disabled={loading}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/70 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 hover:from-blue-800 hover:via-blue-700 hover:to-slate-800 transition-all shadow-md shadow-blue-900/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang kiểm tra hệ thống...' : 'Gửi liên kết khôi phục'}
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