import { useEffect, useState } from 'react'
import './App.css'

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

type ImportRow = {
  rowNumber: number
  username: string
  email: string
  fullName: string
  role: string
  status: string
  valid: boolean
  errors: string[]
}

type ImportPreviewData = {
  totalRows: number
  validCount: number
  errorCount: number
  rows: ImportRow[]
}

type ImportSummaryData = {
  totalRead: number
  successCount: number
  skippedCount: number
  message: string
  successAccounts: Account[]
  failedRows: ImportRow[]
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

  // Import states
  const [showImportModal, setShowImportModal] = useState(false)
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'summary'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null)
  const [summaryData, setSummaryData] = useState<ImportSummaryData | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState('')

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

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${API_URL}/template`)
      if (!response.ok) {
        throw new Error('Không thể tải tệp mẫu')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mau_nhap_tai_khoan.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Không thể tải tệp mẫu. Hãy kiểm tra kết nối Backend.')
      console.error(err)
    }
  }

  const openImportModal = () => {
    setShowImportModal(true)
    setImportStep('upload')
    setSelectedFile(null)
    setPreviewData(null)
    setSummaryData(null)
    setImportError('')
  }

  const closeImportModal = () => {
    setShowImportModal(false)
    if (importStep === 'summary') {
      loadAccounts()
    }
    setImportStep('upload')
    setSelectedFile(null)
    setPreviewData(null)
    setSummaryData(null)
    setImportError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setImportError('')
    }
  }

  const handlePreviewImport = async () => {
    if (!selectedFile) {
      setImportError('Vui lòng chọn tệp để kiểm tra.')
      return
    }

    try {
      setImportLoading(true)
      setImportError('')

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${API_URL}/import/preview`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi kiểm tra tệp.')
      }

      setPreviewData(data)
      setImportStep('preview')
    } catch (err: any) {
      setImportError(err.message || 'Đã có lỗi xảy ra khi kiểm tra tệp.')
      console.error(err)
    } finally {
      setImportLoading(false)
    }
  }

  const handleExecuteImport = async () => {
    if (!selectedFile) {
      setImportError('Không tìm thấy tệp đã chọn.')
      return
    }

    try {
      setImportLoading(true)
      setImportError('')

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${API_URL}/import/execute`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi thực hiện nhập dữ liệu.')
      }

      setSummaryData(data)
      setImportStep('summary')
      loadAccounts()
    } catch (err: any) {
      setImportError(err.message || 'Đã có lỗi xảy ra khi nhập dữ liệu.')
      console.error(err)
    } finally {
      setImportLoading(false)
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
          <p>Quản lý tài khoản và phân quyền hệ thống</p>
        </div>

        <div className="header-actions">
          <button
            className="secondary-button"
            onClick={openImportModal}
          >
            📥 Nhập từ tệp (Import)
          </button>
          <button
            className="primary-button"
            onClick={openCreateModal}
          >
            + Thêm tài khoản
          </button>
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
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <div>
                <h2>
                  {importStep === 'upload' && 'Nhập tài khoản từ tệp'}
                  {importStep === 'preview' && 'Xem trước & Kiểm tra dữ liệu từng dòng'}
                  {importStep === 'summary' && 'Báo cáo tổng kết nhập dữ liệu'}
                </h2>
                <p>
                  {importStep === 'upload' && 'Tải lên tệp danh sách tài khoản theo mẫu (.xlsx, .xls, .csv).'}
                  {importStep === 'preview' && 'Hệ thống tự động phát hiện lỗi theo từng dòng trước khi nhập.'}
                  {importStep === 'summary' && 'Dòng lỗi đã bị bỏ qua, các dòng hợp lệ đã được nhập thành công.'}
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeImportModal}
              >
                ×
              </button>
            </div>

            <div className="import-modal-body">
              {importError && (
                <div className="error-message">
                  {importError}
                </div>
              )}

              {/* BƯỚC 1: TẢI TỆP MẪU & CHỌN TỆP */}
              {importStep === 'upload' && (
                <div className="import-step-upload">
                  <div className="template-card">
                    <div className="template-info">
                      <h3>Tải tệp mẫu Excel</h3>
                      <p>Sử dụng tệp mẫu chuẩn để chuẩn bị dữ liệu chính xác nhất.</p>
                    </div>
                    <button
                      type="button"
                      className="download-template-button"
                      onClick={handleDownloadTemplate}
                    >
                      📥 Tải tệp mẫu (.xlsx)
                    </button>
                  </div>

                  <div className="upload-dropzone">
                    <input
                      id="account-file-input"
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="account-file-input" className="file-drop-label">
                      <div className="upload-icon">📂</div>
                      <div className="upload-title">
                        {selectedFile ? selectedFile.name : 'Nhấp vào đây để chọn tệp từ máy tính'}
                      </div>
                      <div className="upload-hint">
                        {selectedFile
                          ? `Kích thước: ${(selectedFile.size / 1024).toFixed(1)} KB`
                          : 'Hỗ trợ định dạng: Excel (.xlsx, .xls) hoặc CSV (.csv)'}
                      </div>
                    </label>
                  </div>

                  <div className="import-guide-box">
                    <h4>Quy tắc kiểm tra dữ liệu:</h4>
                    <ul>
                      <li><strong>Username:</strong> Bắt buộc, không chứa khoảng trắng, tối thiểu 3 ký tự, không được trùng lặp.</li>
                      <li><strong>Email:</strong> Bắt buộc, đúng định dạng email (VD: abc@xyz.com), không được trùng lặp.</li>
                      <li><strong>Họ và tên:</strong> Bắt buộc nhập đầy đủ.</li>
                      <li><strong>Vai trò:</strong> ADMIN hoặc USER (để trống mặc định USER).</li>
                      <li><strong>Trạng thái:</strong> ACTIVE hoặc INACTIVE (để trống mặc định ACTIVE).</li>
                      <li><strong style={{ color: '#2563eb' }}>Cơ chế xử lý:</strong> Các dòng lỗi sẽ tự động bị bỏ qua, các dòng hợp lệ vẫn sẽ được nhập vào hệ thống.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* BƯỚC 2: XEM TRƯỚC & BÁO LỖI THEO TỪNG DÒNG */}
              {importStep === 'preview' && previewData && (
                <div className="import-step-preview">
                  <div className="stats-row">
                    <div className="stat-card">
                      <span className="stat-num">{previewData.totalRows}</span>
                      <span className="stat-label">Tổng số dòng</span>
                    </div>
                    <div className="stat-card stat-valid">
                      <span className="stat-num">{previewData.validCount}</span>
                      <span className="stat-label">✓ Dòng hợp lệ</span>
                    </div>
                    <div className="stat-card stat-error">
                      <span className="stat-num">{previewData.errorCount}</span>
                      <span className="stat-label">✕ Dòng có lỗi</span>
                    </div>
                  </div>

                  <div className="import-notice-banner">
                    💡 <strong>Lưu ý:</strong> Các dòng hiển thị trạng thái <strong>Lỗi</strong> sẽ tự động bị bỏ qua. Các dòng <strong>Hợp lệ</strong> sẽ được nhập vào hệ thống.
                  </div>

                  <div className="preview-table-container">
                    <table className="table preview-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>Dòng</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Họ và tên</th>
                          <th>Vai trò</th>
                          <th>Trạng thái</th>
                          <th style={{ width: '110px' }}>Kết quả</th>
                          <th>Chi tiết lỗi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.rows.map((row) => (
                          <tr
                            key={row.rowNumber}
                            className={row.valid ? 'preview-row-valid' : 'preview-row-invalid'}
                          >
                            <td className="row-num">#{row.rowNumber}</td>
                            <td className="username-cell">{row.username || '—'}</td>
                            <td>{row.email || '—'}</td>
                            <td>{row.fullName || '—'}</td>
                            <td>
                              <span className="role-badge">{row.role}</span>
                            </td>
                            <td>
                              <span
                                className={
                                  row.status === 'ACTIVE'
                                    ? 'status-badge active'
                                    : 'status-badge inactive'
                                }
                              >
                                {row.status}
                              </span>
                            </td>
                            <td>
                              {row.valid ? (
                                <span className="tag-valid">✓ Hợp lệ</span>
                              ) : (
                                <span className="tag-error">✕ Có lỗi</span>
                              )}
                            </td>
                            <td>
                              {row.errors.length > 0 ? (
                                <ul className="error-list">
                                  {row.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted">Không có lỗi</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* BƯỚC 3: BÁO CÁO TỔNG KẾT */}
              {importStep === 'summary' && summaryData && (
                <div className="import-step-summary">
                  <div className="summary-success-banner">
                    <div className="summary-icon">✅</div>
                    <div>
                      <h3>Nhập dữ liệu hoàn tất!</h3>
                      <p>{summaryData.message}</p>
                    </div>
                  </div>

                  <div className="stats-row">
                    <div className="stat-card">
                      <span className="stat-num">{summaryData.totalRead}</span>
                      <span className="stat-label">Tổng dòng đã đọc</span>
                    </div>
                    <div className="stat-card stat-valid">
                      <span className="stat-num">{summaryData.successCount}</span>
                      <span className="stat-label">Nhập thành công</span>
                    </div>
                    <div className="stat-card stat-error">
                      <span className="stat-num">{summaryData.skippedCount}</span>
                      <span className="stat-label">Bỏ qua do lỗi</span>
                    </div>
                  </div>

                  {summaryData.failedRows.length > 0 && (
                    <div className="summary-section">
                      <h4 className="section-title error-title">
                        Các dòng bị bỏ qua do lỗi ({summaryData.failedRows.length})
                      </h4>
                      <div className="preview-table-container">
                        <table className="table preview-table">
                          <thead>
                            <tr>
                              <th style={{ width: '60px' }}>Dòng</th>
                              <th>Username</th>
                              <th>Email</th>
                              <th>Họ và tên</th>
                              <th>Lý do bỏ qua</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summaryData.failedRows.map((row) => (
                              <tr key={row.rowNumber} className="preview-row-invalid">
                                <td className="row-num">#{row.rowNumber}</td>
                                <td>{row.username || '—'}</td>
                                <td>{row.email || '—'}</td>
                                <td>{row.fullName || '—'}</td>
                                <td>
                                  <ul className="error-list">
                                    {row.errors.map((err, i) => (
                                      <li key={i}>{err}</li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {summaryData.successAccounts.length > 0 && (
                    <div className="summary-section">
                      <h4 className="section-title success-title">
                        Các tài khoản đã nhập thành công ({summaryData.successAccounts.length})
                      </h4>
                      <div className="preview-table-container">
                        <table className="table preview-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Username</th>
                              <th>Email</th>
                              <th>Họ và tên</th>
                              <th>Vai trò</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summaryData.successAccounts.map((acc) => (
                              <tr key={acc.id} className="preview-row-valid">
                                <td>{acc.id}</td>
                                <td>{acc.username}</td>
                                <td>{acc.email}</td>
                                <td>{acc.fullName}</td>
                                <td>
                                  <span className="role-badge">{acc.role}</span>
                                </td>
                                <td>
                                  <span
                                    className={
                                      acc.status === 'ACTIVE'
                                        ? 'status-badge active'
                                        : 'status-badge inactive'
                                    }
                                  >
                                    {acc.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {importStep === 'upload' && (
                <>
                  <button
                    className="cancel-button"
                    onClick={closeImportModal}
                  >
                    Hủy
                  </button>
                  <button
                    className="primary-button"
                    onClick={handlePreviewImport}
                    disabled={!selectedFile || importLoading}
                  >
                    {importLoading ? 'Đang kiểm tra...' : 'Kiểm tra tệp & Xem trước →'}
                  </button>
                </>
              )}

              {importStep === 'preview' && (
                <>
                  <button
                    className="cancel-button"
                    onClick={() => setImportStep('upload')}
                    disabled={importLoading}
                  >
                    ← Chọn tệp khác
                  </button>
                  <button
                    className="primary-button"
                    onClick={handleExecuteImport}
                    disabled={!previewData || previewData.validCount === 0 || importLoading}
                  >
                    {importLoading
                      ? 'Đang nhập dữ liệu...'
                      : `Xác nhận nhập (${previewData?.validCount || 0} dòng hợp lệ)`}
                  </button>
                </>
              )}

              {importStep === 'summary' && (
                <button
                  className="primary-button"
                  onClick={closeImportModal}
                >
                  Hoàn tất & Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App