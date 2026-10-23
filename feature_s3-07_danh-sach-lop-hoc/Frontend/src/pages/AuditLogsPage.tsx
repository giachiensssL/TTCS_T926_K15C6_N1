import React, { useState, useEffect } from 'react'
import { getAuditLogsApi, AuditLogItem } from '../api/usersApi'
import { FileText, ShieldAlert } from 'lucide-react'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadLogs() {
      setLoading(true)
      try {
        const res = await getAuditLogsApi()
        setLogs(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Nhật ký hệ thống & Thao tác nhạy cảm (Audit Log)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Ghi vết bảo mật: Phân quyền, khoá/mở khoá tài khoản, đổi mật khẩu và cập nhật dữ liệu quan trọng
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/80 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Thời điểm</th>
                <th className="py-3.5 px-4">Hành động</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Chi tiết thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">Đang tải nhật ký...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">Chưa có nhật ký nào được ghi nhận.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-mono font-semibold text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">
                      {log.actorId}
                    </td>
                    <td className="py-3.5 px-4 text-gray-800">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
