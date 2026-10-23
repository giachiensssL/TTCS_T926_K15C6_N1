import React, { useState, useEffect } from 'react'
import { getRolesApi, testUpdateTuitionApi, testUpdateGradesApi, RoleDetail } from '../api/usersApi'
import { extractApiError } from '../api/authApi'
import { useAuthStore, roleLabels } from '../store/authStore'
import { ShieldCheck, Play, CheckCircle2, AlertOctagon, Info } from 'lucide-react'

export default function RolesPermissionsPage() {
  const { user } = useAuthStore()
  const [roles, setRoles] = useState<RoleDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    action: string
    status: 'success' | 'forbidden' | 'error'
    code?: string
    message: string
  } | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    async function loadRoles() {
      setLoading(true)
      try {
        const res = await getRolesApi()
        setRoles(res.roles)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadRoles()
  }, [])

  // S1-05 Thử nghiệm: Kiểm quyền ở tầng Server (Giảng viên không sửa được học phí)
  const runTestTuition = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await testUpdateTuitionApi()
      setTestResult({
        action: 'Cập nhật học phí (Chỉ Kế toán & Admin)',
        status: 'success',
        message: res.message,
      })
    } catch (err) {
      const apiErr = extractApiError(err)
      setTestResult({
        action: 'Cập nhật học phí (Chỉ Kế toán & Admin)',
        status: 'forbidden',
        code: apiErr.code,
        message: apiErr.message,
      })
    } finally {
      setTesting(false)
    }
  }

  // S1-05 Thử nghiệm: Kiểm quyền ở tầng Server (Kế toán không sửa được điểm)
  const runTestGrades = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await testUpdateGradesApi()
      setTestResult({
        action: 'Cập nhật bảng điểm (Chỉ Giảng viên & Quản lý đào tạo)',
        status: 'success',
        message: res.message,
      })
    } catch (err) {
      const apiErr = extractApiError(err)
      setTestResult({
        action: 'Cập nhật bảng điểm (Chỉ Giảng viên & Quản lý đào tạo)',
        status: 'forbidden',
        code: apiErr.code,
        message: apiErr.message,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Phân quyền theo vai trò (RBAC) · S1-05
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Khai báo quyền cho 8 vai trò nghiệp vụ · Kiểm quyền chặt chẽ ở tầng Server (Mặc định từ chối)
            </p>
          </div>
        </div>
      </div>

      {/* S1-05 Interactive Server RBAC Tester */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm tracking-wide uppercase text-indigo-200">
              Công cụ kiểm thử RBAC trực tiếp ở Server Endpoint (S1-05)
            </h3>
          </div>
          <span className="text-xs text-indigo-300">
            Bạn đang đăng nhập vai trò: <strong className="text-white">{roleLabels[user?.activeRole || 'GUEST']}</strong>
          </span>
        </div>

        <p className="text-xs text-indigo-200/80 leading-relaxed">
          Nhấn các nút bên dưới để gửi request thực tế lên Server. Server sẽ đối chiếu quyền và trả về kết quả 200 OK hoặc chặn với mã 403 Forbidden kèm thông báo tiếng Việt:
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={runTestTuition}
            disabled={testing}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Thử sửa học phí</span>
            <span className="text-[10px] bg-indigo-800/80 px-2 py-0.5 rounded-md">Yêu cầu: Kế toán / Admin</span>
          </button>

          <button
            onClick={runTestGrades}
            disabled={testing}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Thử sửa điểm thi</span>
            <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-md">Yêu cầu: Giảng viên / Quản lý</span>
          </button>
        </div>

        {/* Kết quả kiểm thử trực tiếp */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs animate-in fade-in ${
              testResult.status === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {testResult.status === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {testResult.status === 'success' ? '✅ Được cấp quyền truy cập (200 OK)' : '🚫 Server từ chối truy cập (403 Forbidden)'}
                </p>
                <p className="text-gray-300">Thao tác: <strong>{testResult.action}</strong></p>
                <p className="font-mono bg-black/30 px-2.5 py-1.5 rounded-lg text-[11px] inline-block">
                  Thông báo từ Server: "{testResult.message}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8 Roles & Permissions Matrix */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Bảng ma trận 8 vai trò nghiệp vụ và phạm vi phân quyền</span>
        </h3>

        {loading ? (
          <div className="p-8 text-center text-gray-500 text-xs">Đang tải ma trận quyền...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${r.badgeColor}`}>
                    {r.name}
                  </span>
                  <span className="font-mono text-[10px] text-gray-400 font-semibold">{r.id}</span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed min-h-[36px]">
                  {r.description}
                </p>

                <div className="pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Quyền hạn (Permissions):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {r.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-mono text-[10px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
