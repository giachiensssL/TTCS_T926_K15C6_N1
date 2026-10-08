import { useEffect, useState } from 'react'
import './App.css'
import { TrainingPrograms } from './components/TrainingPrograms'

type Account = {
  id: number
  username: string
  email: string
  fullName: string
  role: string
  status: string
}

type AccountForm = {
  username: string
  email: string
  fullName: string
  role: string
  status: string
}

const API_URL = 'http://localhost:8080/api/accounts'

const emptyForm: AccountForm = {
  username: '',
  email: '',
  fullName: '',
  role: 'USER',
  status: 'ACTIVE',
}

function App() {
  const [currentTab, setCurrentTab] = useState<'programs' | 'users'>('programs')
  const [accounts, setAccounts] = useState<Account[]>([])
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

  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        username,
        role,
        status,
        page: String(page),
      })

      const response = await fetch(`${API_URL}?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách tài khoản')
      }

      const data = await response.json()

      setAccounts(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err) {
      setError('Không thể kết nối tới Backend. Hãy kiểm tra Spring Boot đang chạy ở port 8080.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [page, username, role, status])

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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
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
          <h1>Hệ Thống Quản Lý Đào Tạo (TMS)</h1>
          <div className="top-nav">
            <button
              className={`tab-btn ${currentTab === 'programs' ? 'active' : ''}`}
              onClick={() => setCurrentTab('programs')}
            >
              📚 Chương trình đào tạo
            </button>
            <button
              className={`tab-btn ${currentTab === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentTab('users')}
            >
              👥 Quản lý người dùng
            </button>
          </div>
        </div>

        {currentTab === 'users' && (
          <button
            className="primary-button"
            onClick={openCreateModal}
          >
            + Thêm tài khoản
          </button>
        )}
      </header>

      <main className="container">
        {currentTab === 'programs' ? (
          <TrainingPrograms />
        ) : (
          <>
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
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="empty">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty">
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
                              : 'status-badge inactive'
                          }
                        >
                          {account.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
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
        </>
        )}
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
    </div>
  )
}

export default App