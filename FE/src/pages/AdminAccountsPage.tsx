import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  createTrainingClassApi,
  getStaffAccountsApi,
  lockStaffAccountApi,
  unlockStaffAccountApi,
} from '../api/accountApi'
import type { StaffAccount } from '../api/accountApi'
import { logoutApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'

function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
  }
  return 'Không thể hoàn thành thao tác. Vui lòng thử lại.'
}

export default function AdminAccountsPage() {
  const navigate = useNavigate()
  const { role, clearAuth } = useAuthStore()
  const [accounts, setAccounts] = useState<StaffAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<StaffAccount | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [logoutError, setLogoutError] = useState('')
  const [className, setClassName] = useState('')
  const [instructorId, setInstructorId] = useState('')

  const loadAccounts = useCallback(async () => {
    setError('')
    try {
      const staff = await getStaffAccountsApi()
      setAccounts(staff)
      setInstructorId((currentId) =>
        staff.some((account) => account.id === currentId)
          ? currentId
          : staff.find((account) => account.roles.includes('GiangVien'))?.id ?? '',
      )
    } catch (loadError) {
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAccounts()
  }, [loadAccounts])

  const handleLock = async () => {
    if (!selectedAccount || !reason.trim()) return
    setBusyUserId(selectedAccount.id)
    setError('')
    try {
      await lockStaffAccountApi(selectedAccount.id, reason.trim())
      setSelectedAccount(null)
      setReason('')
      await loadAccounts()
    } catch (lockError) {
      setError(errorMessage(lockError))
    } finally {
      setBusyUserId(null)
    }
  }

  const handleUnlock = async (account: StaffAccount) => {
    setBusyUserId(account.id)
    setError('')
    try {
      await unlockStaffAccountApi(account.id)
      await loadAccounts()
    } catch (unlockError) {
      setError(errorMessage(unlockError))
    } finally {
      setBusyUserId(null)
    }
  }

  const handleCreateClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!className.trim() || !instructorId) return
    setError('')
    try {
      await createTrainingClassApi(className.trim(), instructorId)
      setClassName('')
      await loadAccounts()
    } catch (createError) {
      setError(errorMessage(createError))
    }
  }

  const handleLogout = async () => {
    try {
      await logoutApi()
      clearAuth()
      navigate('/login', { replace: true })
    } catch {
      setLogoutError('Không thể đăng xuất. Vui lòng thử lại.')
    }
  }

  if (role !== 'ADMIN') {
    return <div className="min-h-screen grid place-items-center text-gray-700">Bạn không có quyền truy cập trang này.</div>
  }

  const teachers = accounts.filter((account) => account.roles.includes('GiangVien'))

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Quản trị hệ thống</p>
            <h1 className="text-xl font-bold text-slate-900">Quản lý tài khoản nhân sự</h1>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {logoutError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {logoutError}
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Ghi nhận lớp cần bàn giao</h2>
          <p className="mt-1 text-sm text-slate-600">
            Lớp được gắn với giảng viên sẽ hiện cảnh báo bàn giao khi khóa tài khoản.
          </p>
          <form onSubmit={handleCreateClass} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              required
              maxLength={200}
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              placeholder="Tên lớp"
              aria-label="Tên lớp"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              required
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
              aria-label="Giảng viên phụ trách"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Chọn giảng viên phụ trách</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.email}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!teachers.length}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              Thêm lớp
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="font-semibold text-slate-900">Danh sách nhân sự</h2>
            <span className="text-sm text-slate-500">{accounts.length} tài khoản</span>
          </div>

          {loading ? (
            <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Đang tải danh sách...</p>
          ) : accounts.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Chưa có tài khoản nhân sự.</p>
          ) : (
            accounts.map((account) => (
              <article key={account.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{account.email}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        account.isLocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {account.isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{account.roles.join(', ')}</p>
                    {account.isLocked && account.lockReason && (
                      <p className="mt-2 text-sm text-slate-700">Lý do khóa: {account.lockReason}</p>
                    )}
                    {account.isLocked && account.classesToHandover.length > 0 && (
                      <div role="alert" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                        <p className="font-semibold">Cần bàn giao {account.classesToHandover.length} lớp:</p>
                        <ul className="mt-1 list-inside list-disc">
                          {account.classesToHandover.map((name) => <li key={name}>{name}</li>)}
                        </ul>
                      </div>
                    )}
                    {!account.isLocked && account.classesToHandover.length > 0 && (
                      <p className="mt-2 text-sm text-slate-600">
                        Đang phụ trách: {account.classesToHandover.join(', ')}
                      </p>
                    )}
                  </div>
                  {account.isLocked ? (
                    <button
                      type="button"
                      disabled={busyUserId === account.id}
                      onClick={() => void handleUnlock(account)}
                      className="shrink-0 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      {busyUserId === account.id ? 'Đang xử lý...' : 'Mở khóa'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setSelectedAccount(account); setReason('') }}
                      className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Khóa tài khoản
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {selectedAccount && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-slate-950/40 px-4 py-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="lock-account-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="lock-account-title" className="text-lg font-bold text-slate-900">Xác nhận khóa tài khoản</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tài khoản {selectedAccount.email} sẽ không thể đăng nhập và các phiên hiện tại sẽ bị thu hồi.
            </p>
            {selectedAccount.classesToHandover.length > 0 && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Lưu ý bàn giao: {selectedAccount.classesToHandover.join(', ')}
              </div>
            )}
            <label htmlFor="lock-reason" className="mt-4 block text-sm font-medium text-slate-700">
              Lý do khóa (bắt buộc)
            </label>
            <textarea
              id="lock-reason"
              required
              minLength={1}
              maxLength={1000}
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!reason.trim() || busyUserId === selectedAccount.id}
                onClick={() => void handleLock()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                Khóa ngay
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
