import { useEffect, useState } from 'react'
import './App.css'

type Account = {
  id: number
  username: string
  email: string
  fullName: string
  role: string
  status: string
  lockReason: string | null
  lockedAt: string | null
  classesToHandover: string[]
}

type CurrentAccount = {
  username: string
  role: string
}

type TrainingClass = {
  id: number
  name: string
  instructorAccountId: number
}

type AccountForm = {
  username: string
  email: string
  fullName: string
  role: string
  status: string
}

const API_URL = 'http://localhost:8080/api/accounts'
const API_BASE_URL = 'http://localhost:8080/api'

const emptyForm: AccountForm = {
  username: '',
  email: '',
  fullName: '',
  role: 'USER',
  status: 'ACTIVE',
}

function App() {
  const [currentAccount, setCurrentAccount] = useState<CurrentAccount | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [trainingClasses, setTrainingClasses] = useState<TrainingClass[]>([])
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)

  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<AccountForm>(emptyForm)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [lockReason, setLockReason] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [instructorId, setInstructorId] = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then(async (response) => {
        if (response.ok) {
          setCurrentAccount(await response.json())
        } else if (response.status !== 401) {
          throw new Error('Không thể kiểm tra phiên đăng nhập.')
        }
      })
      .catch((sessionError: unknown) => {
        setLoginError(sessionError instanceof Error ? sessionError.message : 'Không thể kết nối tới Backend.')
      })
      .finally(() => setSessionChecked(true))
  }, [])

  const getCsrfToken = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: 'include' })
    if (!response.ok) {
      throw new Error('Không thể tạo mã bảo mật. Vui lòng thử lại.')
    }
    const data = await response.json()
    setCsrfToken(data.token)
    return data.token as string
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError('')
    try {
      const token = await getCsrfToken()
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }),
      })
      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.message ?? 'Đăng nhập không thành công.')
      }
      setCurrentAccount(body)
      setLoginPassword('')
      await getCsrfToken()
    } catch (loginFailure: unknown) {
      setLoginError(loginFailure instanceof Error ? loginFailure.message : 'Đăng nhập không thành công.')
    }
  }

  const handleLogout = async () => {
    try {
      const token = csrfToken || await getCsrfToken()
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': token },
      })
      if (!response.ok) {
        throw new Error('Không thể đăng xuất. Vui lòng thử lại.')
      }
      setCurrentAccount(null)
      setAccounts([])
    } catch (logoutFailure: unknown) {
      setError(logoutFailure instanceof Error ? logoutFailure.message : 'Không thể đăng xuất.')
    }
  }

  const loadAccounts = async () => {
    if (!currentAccount) return
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        username,
        role,
        status,
        page: String(page),
      })

      const response = await fetch(`${API_URL}?${params.toString()}`, { credentials: 'include' })

      if (!response.ok) {
        if (response.status === 401) {
          setCurrentAccount(null)
          return
        }
        throw new Error('Không thể lấy danh sách tài khoản')
      }

      const data = await response.json()

      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setAccounts(data.content.map((account: Account) => ({
        ...account,
        lockReason: account.lockReason ?? null,
        lockedAt: account.lockedAt ?? null,
        classesToHandover: account.classesToHandover ?? [],
      })))
    } catch (err) {
      setError('Không thể kết nối tới Backend. Hãy kiểm tra Spring Boot đang chạy ở port 8080.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!currentAccount) return
    loadAccounts()
    fetch(`${API_BASE_URL}/classes`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return
        setTrainingClasses(await response.json())
      })
      .catch((classError: unknown) => console.error(classError))
  }, [page, username, role, status, currentAccount])

  if (!sessionChecked) {
    return <main className="auth-page">Kiểm tra phiên đăng nhập...</main>
  }

  if (!currentAccount) {
    return (
      <main className="auth-page">
        <form className="auth-card" onSubmit={handleLogin}>
          <h1>Quản trị tài khoản</h1>
          <p>Đăng nhập bằng tài khoản quản trị hệ thống.</p>
          {loginError && <div className="error-message" role="alert">{loginError}</div>}
          <label htmlFor="login-username">Tên đăng nhập hoặc email</label>
          <input id="login-username" required autoComplete="username" value={loginUsername}
            onChange={(event) => setLoginUsername(event.target.value)} />
          <label htmlFor="login-password">Mật khẩu</label>
          <input id="login-password" required type="password" autoComplete="current-password"
            value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} />
          <button className="primary-button" type="submit">Đăng nhập</button>
        </form>
      </main>
    )
  }

  if (currentAccount.role?.toUpperCase() !== 'ADMIN') {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Không có quyền truy cập</h1>
          <p>Chỉ Quản trị hệ thống mới có thể quản lý trạng thái tài khoản.</p>
          <button className="reset-button" onClick={() => void handleLogout()}>Đăng xuất</button>
        </section>
      </main>
    )
  }

  const handleSearch = () => {
    setPage(0)
    loadAccounts()
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (account: Account) => {
    setEditingId(account.id)

    setForm({
      username: account.username,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      status: account.status,
    })

    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleFormChange = (
    field: keyof AccountForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.fullName.trim()
    ) {
      alert('Vui lòng nhập đầy đủ Username, Email và Họ tên.')
      return
    }

    try {
      setLoading(true)

      const url =
        editingId === null
          ? API_URL
          : `${API_URL}/${editingId}`

      const method = editingId === null ? 'POST' : 'PUT'

      const token = csrfToken || await getCsrfToken()
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': token,
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Không thể lưu tài khoản')
      }

      closeModal()
      await loadAccounts()
    } catch (err) {
      alert('Không thể lưu tài khoản. Hãy kiểm tra Backend.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa tài khoản này không?',
    )

    if (!confirmed) {
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      })

      if (!response.ok) {
        throw new Error('Không thể xóa tài khoản')
      }
      await loadAccounts()
    } catch (err) {
      alert('Không thể xóa tài khoản.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLockAccount = async () => {
    if (!selectedAccount || !lockReason.trim()) return
    try {
      const token = csrfToken || await getCsrfToken()
      const response = await fetch(`${API_URL}/${selectedAccount.id}/lock`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
        body: JSON.stringify({ reason: lockReason.trim() }),
      })
      if (!response.ok) {
        throw new Error(await response.text() || 'Không thể khóa tài khoản.')
      }
      setSelectedAccount(null)
      setLockReason('')
      await loadAccounts()
    } catch (lockFailure: unknown) {
      setError(lockFailure instanceof Error ? lockFailure.message : 'Không thể khóa tài khoản.')
    }
  }

  const handleUnlockAccount = async (accountId: number) => {
    try {
      const token = csrfToken || await getCsrfToken()
      const response = await fetch(`${API_URL}/${accountId}/unlock`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': token },
      })
      if (!response.ok) {
        throw new Error(await response.text() || 'Không thể mở khóa tài khoản.')
      }
      await loadAccounts()
    } catch (unlockFailure: unknown) {
      setError(unlockFailure instanceof Error ? unlockFailure.message : 'Không thể mở khóa tài khoản.')
    }
  }

  const handleCreateClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newClassName.trim() || !instructorId) return
    try {
      const token = csrfToken || await getCsrfToken()
      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
        body: JSON.stringify({ name: newClassName.trim(), instructorAccountId: Number(instructorId) }),
      })
      if (!response.ok) {
        throw new Error(await response.text() || 'Không thể ghi nhận lớp.')
      }
      setNewClassName('')
      const classResponse = await fetch(`${API_BASE_URL}/classes`, { credentials: 'include' })
      if (classResponse.ok) setTrainingClasses(await classResponse.json())
      await loadAccounts()
    } catch (classFailure: unknown) {
      setError(classFailure instanceof Error ? classFailure.message : 'Không thể ghi nhận lớp.')
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) {
      return
    }

    setPage(newPage)
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Quản trị viên: {currentAccount.username}</p>
        </div>

        <div className="header-actions">
          <button className="primary-button" onClick={openCreateModal}>+ Thêm tài khoản</button>
          <button className="reset-button" onClick={() => void handleLogout()}>Đăng xuất</button>
        </div>
      </header>

      <main className="container">
        <section className="filter-card">
          <div className="filter-item search-item">
            <label>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Nhập username..."
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                setPage(0)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
          </div>

          <div className="filter-item">
            <label>Vai trò</label>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value)
                setPage(0)
              }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Trạng thái</label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(0)
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="LOCKED">LOCKED</option>
            </select>
          </div>

          <button
            className="search-button"
            onClick={handleSearch}
          >
            🔎 Tìm kiếm
          </button>

          <button
            className="reset-button"
            onClick={() => {
              setUsername('')
              setRole('')
              setStatus('')
              setPage(0)
            }}
          >
            Đặt lại
          </button>
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="class-handover-card">
          <div>
            <h2>Lớp học cần bàn giao</h2>
            <p>Gán lớp cho giảng viên để hệ thống hiển thị cảnh báo khi khóa tài khoản.</p>
          </div>
          <form className="class-assignment-form" onSubmit={handleCreateClass}>
            <input
              required
              maxLength={200}
              aria-label="Tên lớp"
              placeholder="Tên lớp"
              value={newClassName}
              onChange={(event) => setNewClassName(event.target.value)}
            />
            <select
              required
              aria-label="Giảng viên phụ trách"
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
            >
              <option value="">Chọn nhân sự phụ trách</option>
              {accounts
                .filter((account) => account.role?.toUpperCase() !== 'ADMIN' && account.status === 'ACTIVE')
                .map((account) => (
                  <option key={account.id} value={account.id}>{account.fullName} ({account.username})</option>
                ))}
            </select>
            <button className="search-button" type="submit">Gán lớp</button>
          </form>
          {trainingClasses.length > 0 && (
            <p className="class-count">Đã ghi nhận {trainingClasses.length} lớp phụ trách.</p>
          )}
        </section>

        <section className="table-card">
          <div className="table-header">
            <div>
              <h2>Danh sách người dùng</h2>
              <span>
                Tổng số: {totalElements} tài khoản
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Họ và tên</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Bàn giao</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="empty">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty">
                      Không tìm thấy tài khoản
                    </td>
                  </tr>
                ) : (
                  accounts.map((account) => (
                    <tr key={account.id}>
                      <td>{account.id}</td>

                      <td className="username">
                        {account.username}
                      </td>

                      <td>{account.email}</td>

                      <td>{account.fullName}</td>

                      <td>
                        <span className="role-badge">
                          {account.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            account.status === 'ACTIVE'
                              ? 'status-badge active'
                              : account.status === 'LOCKED'
                                ? 'status-badge locked'
                                : 'status-badge inactive'
                          }
                        >
                          {account.status === 'LOCKED'
                            ? 'Đã khóa'
                            : account.status === 'ACTIVE'
                              ? 'Đang hoạt động'
                              : 'Ngừng hoạt động'}
                        </span>
                      </td>

                      <td>
                        {account.status === 'LOCKED' && account.classesToHandover.length > 0 ? (
                          <div className="handover-alert" role="alert">
                            <strong>Cần bàn giao:</strong> {account.classesToHandover.join(', ')}
                          </div>
                        ) : account.classesToHandover.length > 0 ? (
                          account.classesToHandover.join(', ')
                        ) : '—'}
                        {account.status === 'LOCKED' && account.lockReason && (
                          <div className="lock-reason">Lý do: {account.lockReason}</div>
                        )}
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditModal(account)
                            }
                          >
                            Sửa
                          </button>

                          {account.status === 'LOCKED' ? (
                            <button
                              className="unlock-button"
                              onClick={() => void handleUnlockAccount(account.id)}
                            >
                              Mở khóa
                            </button>
                          ) : account.username !== currentAccount.username && (
                            <button
                              className="lock-button"
                              onClick={() => {
                                setSelectedAccount(account)
                                setLockReason('')
                              }}
                            >
                              Khóa
                            </button>
                          )}

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(account.id)
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              disabled={page === 0}
              onClick={() =>
                handlePageChange(page - 1)
              }
            >
              ← Trước
            </button>

            <span>
              Trang <strong>{page + 1}</strong>
              {' / '}
              <strong>{Math.max(totalPages, 1)}</strong>
            </span>

            <button
              disabled={
                totalPages === 0 ||
                page >= totalPages - 1
              }
              onClick={() =>
                handlePageChange(page + 1)
              }
            >
              Sau →
            </button>
          </div>
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId === null
                    ? 'Thêm tài khoản'
                    : 'Sửa tài khoản'}
                </h2>

                <p>
                  {editingId === null
                    ? 'Hệ thống sẽ tự sinh mật khẩu tạm và gửi email.'
                    : 'Cập nhật thông tin tài khoản.'}
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Username</label>
                <input
                  value={form.username}
                  onChange={(event) =>
                    handleFormChange(
                      'username',
                      event.target.value,
                    )
                  }
                  placeholder="Nhập username"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    handleFormChange(
                      'email',
                      event.target.value,
                    )
                  }
                  placeholder="Nhập email"
                />
              </div>

              <div className="form-group full">
                <label>Họ và tên</label>
                <input
                  value={form.fullName}
                  onChange={(event) =>
                    handleFormChange(
                      'fullName',
                      event.target.value,
                    )
                  }
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={form.role}
                  onChange={(event) =>
                    handleFormChange(
                      'role',
                      event.target.value,
                    )
                  }
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    handleFormChange(
                      'status',
                      event.target.value,
                    )
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">
                    INACTIVE
                  </option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={closeModal}
              >
                Hủy
              </button>

              <button
                className="primary-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? 'Đang lưu...'
                  : editingId === null
                    ? 'Tạo tài khoản'
                    : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedAccount && (
        <div className="modal-overlay">
          <section className="modal lock-modal" role="dialog" aria-modal="true" aria-labelledby="lock-heading">
            <div className="modal-header">
              <div>
                <h2 id="lock-heading">Khóa tài khoản nhân sự</h2>
                <p>{selectedAccount.fullName} ({selectedAccount.username}) sẽ bị từ chối truy cập.</p>
              </div>
              <button className="close-button" aria-label="Đóng" onClick={() => setSelectedAccount(null)}>×</button>
            </div>
            {selectedAccount.classesToHandover.length > 0 && (
              <div className="handover-alert modal-handover" role="alert">
                <strong>Cần bàn giao {selectedAccount.classesToHandover.length} lớp:</strong>
                <ul>
                  {selectedAccount.classesToHandover.map((className) => <li key={className}>{className}</li>)}
                </ul>
              </div>
            )}
            <div className="lock-reason-field">
              <label htmlFor="lock-reason">Lý do khóa (bắt buộc)</label>
              <textarea
                id="lock-reason"
                required
                maxLength={1000}
                rows={4}
                value={lockReason}
                onChange={(event) => setLockReason(event.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setSelectedAccount(null)}>Hủy</button>
              <button
                className="lock-button"
                disabled={!lockReason.trim()}
                onClick={() => void handleLockAccount()}
              >
                Khóa và thu hồi phiên
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App