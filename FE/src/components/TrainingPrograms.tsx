import { useEffect, useState } from 'react'

export type TrainingProgram = {
  id: number
  code: string
  name: string
  description: string
  totalDuration: number | null
  standardTuition: number | null
  status: string
  runningClassesCount: number
  totalClassesCount: number
  createdAt?: string
  updatedAt?: string
}

export type TrainingProgramForm = {
  code: string
  name: string
  description: string
  totalDuration: string
  standardTuition: string
  status: string
}

export type TrainingClass = {
  id: number
  code: string
  name: string
  status: string
  programId: number
  programCode: string
  programName: string
  createdAt?: string
}

const API_BASE = 'http://localhost:8080/api/training-programs'

const emptyForm: TrainingProgramForm = {
  code: '',
  name: '',
  description: '',
  totalDuration: '',
  standardTuition: '',
  status: 'ACTIVE',
}

export function TrainingPrograms() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modal Khai báo / Sửa chương trình
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TrainingProgramForm>(emptyForm)
  const [formError, setFormError] = useState('')

  // Modal Quản lý lớp học của chương trình
  const [classModalProgram, setClassModalProgram] = useState<TrainingProgram | null>(null)
  const [classes, setClasses] = useState<TrainingClass[]>([])
  const [classForm, setClassForm] = useState({ code: '', name: '', status: 'RUNNING' })
  const [classLoading, setClassLoading] = useState(false)
  const [classError, setClassError] = useState('')

  // Load danh sách chương trình đào tạo
  const loadPrograms = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        keyword,
        status: statusFilter,
        page: String(page),
        size: '10',
      })

      const res = await fetch(`${API_BASE}?${params.toString()}`)
      if (!res.ok) {
        throw new Error('Không thể lấy danh sách chương trình đào tạo.')
      }

      const data = await res.json()
      setPrograms(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err: unknown) {
      setError('Không thể kết nối tới Backend. Hãy chắc chắn Spring Boot đang chạy ở cổng 8080.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrograms()
  }, [page, statusFilter])

  const handleSearch = () => {
    setPage(0)
    loadPrograms()
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (p: TrainingProgram) => {
    setEditingId(p.id)
    setForm({
      code: p.code,
      name: p.name,
      description: p.description || '',
      totalDuration: p.totalDuration !== null && p.totalDuration !== undefined ? String(p.totalDuration) : '',
      standardTuition: p.standardTuition !== null && p.standardTuition !== undefined ? String(p.standardTuition) : '',
      status: p.status || 'ACTIVE',
    })
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
  }

  const handleSubmit = async () => {
    setFormError('')
    if (!form.code.trim()) {
      setFormError('Mã chương trình là bắt buộc và phải là duy nhất!')
      return
    }
    if (!form.name.trim()) {
      setFormError('Tên chương trình là bắt buộc!')
      return
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim(),
      totalDuration: form.totalDuration ? parseInt(form.totalDuration, 10) : 0,
      standardTuition: form.standardTuition ? parseFloat(form.standardTuition) : 0,
      status: form.status,
    }

    try {
      setLoading(true)
      const url = editingId === null ? API_BASE : `${API_BASE}/${editingId}`
      const method = editingId === null ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const message = data?.message || 'Có lỗi xảy ra khi lưu chương trình đào tạo.'
        setFormError(message)
        return
      }

      closeModal()
      setSuccessMsg(editingId === null ? 'Khai báo chương trình đào tạo thành công!' : 'Cập nhật chương trình đào tạo thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadPrograms()
    } catch (err: unknown) {
      setFormError('Không thể kết nối máy chủ để lưu chương trình.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Đổi trạng thái nhanh (Đang áp dụng <-> Ngừng áp dụng)
  const handleToggleStatus = async (program: TrainingProgram) => {
    const nextStatus = program.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const statusText = nextStatus === 'ACTIVE' ? 'Áp dụng lại' : 'Ngừng áp dụng'

    const confirmAction = window.confirm(`Bạn có muốn chuyển chương trình "${program.name}" sang trạng thái "${statusText}" không?`)
    if (!confirmAction) return

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/${program.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Không thể đổi trạng thái chương trình.')
      }

      setSuccessMsg(`Đã chuyển trạng thái chương trình thành "${statusText}"!`)
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadPrograms()
    } catch (err: unknown) {
      alert((err as Error).message || 'Có lỗi xảy ra khi đổi trạng thái.')
    } finally {
      setLoading(false)
    }
  }

  // Xoá chương trình đào tạo (Kiểm tra quy tắc: Chương trình đang có lớp chạy không được xoá)
  const handleDelete = async (program: TrainingProgram) => {
    // Kiểm tra trực tiếp trên client trước
    if (program.runningClassesCount > 0) {
      const confirmDeactivate = window.confirm(
        `⚠️ QUY TẮC NGHIỆP VỤ:\nChương trình "${program.name}" đang có ${program.runningClassesCount} lớp học đang chạy, KHÔNG ĐƯỢC PHÉP XOÁ!\n\nBạn có muốn chuyển chương trình sang trạng thái "Ngừng áp dụng" không?`
      )
      if (confirmDeactivate) {
        await handleToggleStatus(program)
      }
      return
    }

    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa chương trình đào tạo "${program.name}" (${program.code}) không?`)
    if (!confirmed) return

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/${program.id}`, {
        method: 'DELETE',
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        // Backend từ chối xóa vì có lớp chạy
        alert(`❌ Lỗi: ${data?.message || 'Không thể xóa chương trình đào tạo này.'}`)
        return
      }

      setSuccessMsg('Xóa chương trình đào tạo thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadPrograms()
    } catch (err: unknown) {
      alert('Có lỗi xảy ra khi xóa chương trình.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Quản lý lớp học modal
  const openClassModal = async (program: TrainingProgram) => {
    setClassModalProgram(program)
    setClassError('')
    setClassForm({ code: '', name: '', status: 'RUNNING' })
    await loadClasses(program.id)
  }

  const closeClassModal = () => {
    setClassModalProgram(null)
    setClasses([])
    setClassError('')
    loadPrograms()
  }

  const loadClasses = async (programId: number) => {
    try {
      setClassLoading(true)
      const res = await fetch(`${API_BASE}/${programId}/classes`)
      if (res.ok) {
        const data = await res.json()
        setClasses(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setClassLoading(false)
    }
  }

  const handleAddClass = async () => {
    if (!classModalProgram) return
    if (!classForm.code.trim() || !classForm.name.trim()) {
      setClassError('Vui lòng nhập Mã lớp và Tên lớp!')
      return
    }

    try {
      setClassLoading(true)
      setClassError('')
      const res = await fetch(`${API_BASE}/${classModalProgram.id}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classForm),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setClassError(data?.message || 'Không thể thêm lớp học.')
        return
      }
      setClassForm({ code: '', name: '', status: 'RUNNING' })
      await loadClasses(classModalProgram.id)
    } catch (err) {
      setClassError('Lỗi kết nối khi thêm lớp.')
      console.error(err)
    } finally {
      setClassLoading(false)
    }
  }

  const handleUpdateClassStatus = async (classId: number, currentStatus: string) => {
    if (!classModalProgram) return
    const nextStatus = currentStatus === 'RUNNING' ? 'COMPLETED' : 'RUNNING'
    try {
      setClassLoading(true)
      const res = await fetch(`${API_BASE}/${classModalProgram.id}/classes/${classId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        await loadClasses(classModalProgram.id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setClassLoading(false)
    }
  }

  const handleDeleteClass = async (classId: number) => {
    if (!classModalProgram) return
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return
    try {
      setClassLoading(true)
      const res = await fetch(`${API_BASE}/${classModalProgram.id}/classes/${classId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await loadClasses(classModalProgram.id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setClassLoading(false)
    }
  }

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  return (
    <div className="programs-view">
      <div className="sub-header">
        <div>
          <h2>Quản lý Chương trình đào tạo</h2>
          <p className="sub-text">
            Khai báo mã, tên, mô tả, tổng thời lượng, học phí chuẩn và trạng thái. Áp dụng quy tắc kiểm tra mã duy nhất và cấm xóa khi có lớp đang chạy.
          </p>
        </div>

        <button className="primary-button" onClick={openCreateModal}>
          + Khai báo chương trình mới
        </button>
      </div>

      {/* Thông báo quy định nghiệp vụ */}
      <div className="rule-banner">
        <div className="rule-badge">📌 QUY ĐỊNH NGHIỆP VỤ</div>
        <ul>
          <li><strong>Mã chương trình là duy nhất:</strong> Hệ thống kiểm tra và ngăn chặn trùng lặp mã trên toàn hệ thống khi tạo và cập nhật.</li>
          <li><strong>Chương trình đang có lớp chạy không được xoá:</strong> Chỉ được phép ngừng áp dụng (chuyển sang trạng thái "Ngừng áp dụng") để bảo toàn dữ liệu lớp học.</li>
        </ul>
      </div>

      {successMsg && <div className="success-banner">✓ {successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Bộ lọc tìm kiếm */}
      <section className="filter-card">
        <div className="filter-item search-item">
          <label>Tìm kiếm chương trình</label>
          <input
            type="text"
            placeholder="Nhập mã hoặc tên chương trình..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
          />
        </div>

        <div className="filter-item">
          <label>Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(0)
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang áp dụng</option>
            <option value="INACTIVE">Ngừng áp dụng</option>
          </select>
        </div>

        <button className="search-button" onClick={handleSearch}>
          🔎 Tìm kiếm
        </button>

        <button
          className="reset-button"
          onClick={() => {
            setKeyword('')
            setStatusFilter('')
            setPage(0)
          }}
        >
          Đặt lại
        </button>
      </section>

      {/* Bảng danh sách chương trình đào tạo */}
      <section className="table-card">
        <div className="table-header">
          <div>
            <h3>Danh sách chương trình ({totalElements})</h3>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Mã chương trình</th>
                <th>Tên chương trình</th>
                <th>Mô tả</th>
                <th style={{ width: '110px' }}>Thời lượng</th>
                <th style={{ width: '140px' }}>Học phí chuẩn</th>
                <th style={{ width: '150px' }}>Lớp học đang chạy</th>
                <th style={{ width: '140px' }}>Trạng thái</th>
                <th style={{ width: '220px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="empty">
                    Đang tải dữ liệu chương trình đào tạo...
                  </td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty">
                    Không tìm thấy chương trình đào tạo nào
                  </td>
                </tr>
              ) : (
                programs.map((p) => {
                  const hasRunning = p.runningClassesCount > 0
                  return (
                    <tr key={p.id}>
                      <td className="program-code">
                        <span className="code-pill">{p.code}</span>
                      </td>
                      <td className="program-name">
                        <strong>{p.name}</strong>
                      </td>
                      <td className="program-desc" title={p.description}>
                        {p.description || <span className="text-muted">(Chưa có mô tả)</span>}
                      </td>
                      <td>{p.totalDuration ? `${p.totalDuration} giờ` : 'Chưa thiết lập'}</td>
                      <td className="tuition-cell">{formatCurrency(p.standardTuition)}</td>
                      <td>
                        <div className="class-status-badge-container">
                          {hasRunning ? (
                            <span className="running-class-badge" title="Chương trình đang có lớp học đang chạy!">
                              ⚠️ {p.runningClassesCount} lớp đang chạy
                            </span>
                          ) : (
                            <span className="no-running-class-badge">
                              {p.totalClassesCount > 0 ? `${p.totalClassesCount} lớp (đã kết thúc)` : 'Chưa có lớp'}
                            </span>
                          )}
                          <button
                            className="manage-classes-btn"
                            onClick={() => openClassModal(p)}
                            title="Xem và quản lý các lớp học của chương trình này"
                          >
                            Quản lý lớp ({p.totalClassesCount})
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={p.status === 'ACTIVE' ? 'status-badge active' : 'status-badge inactive'}>
                          {p.status === 'ACTIVE' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="edit-button" onClick={() => openEditModal(p)} title="Sửa thông tin chương trình">
                            Sửa
                          </button>

                          <button
                            className={p.status === 'ACTIVE' ? 'status-toggle-btn deact' : 'status-toggle-btn act'}
                            onClick={() => handleToggleStatus(p)}
                            title={p.status === 'ACTIVE' ? 'Chuyển sang ngừng áp dụng' : 'Áp dụng lại chương trình'}
                          >
                            {p.status === 'ACTIVE' ? 'Ngừng áp dụng' : 'Áp dụng'}
                          </button>

                          <button
                            className={`delete-button ${hasRunning ? 'delete-disabled' : ''}`}
                            onClick={() => handleDelete(p)}
                            title={
                              hasRunning
                                ? 'Không được xoá vì đang có lớp học chạy! Chỉ được ngừng áp dụng.'
                                : 'Xóa chương trình đào tạo'
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>
            ← Trước
          </button>
          <span>
            Trang <strong>{page + 1}</strong> / <strong>{Math.max(totalPages, 1)}</strong>
          </span>
          <button disabled={totalPages === 0 || page >= totalPages - 1} onClick={() => setPage((prev) => prev + 1)}>
            Sau →
          </button>
        </div>
      </section>

      {/* Modal Khai báo / Sửa chương trình đào tạo */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h2>{editingId === null ? 'Khai báo chương trình đào tạo' : 'Cập nhật chương trình đào tạo'}</h2>
                <p>
                  {editingId === null
                    ? 'Nhập các thông tin chuẩn hoá của chương trình đào tạo.'
                    : 'Chỉnh sửa thông tin chi tiết chương trình đào tạo.'}
                </p>
              </div>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            {formError && <div className="modal-form-error">{formError}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Mã chương trình <span className="req">*</span> <small>(Duy nhất)</small>
                </label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="VD: CT-JAVA-01"
                />
              </div>

              <div className="form-group">
                <label>
                  Tên chương trình <span className="req">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Lập trình Java Fullstack"
                />
              </div>

              <div className="form-group">
                <label>Tổng thời lượng (giờ)</label>
                <input
                  type="number"
                  min="0"
                  value={form.totalDuration}
                  onChange={(e) => setForm({ ...form, totalDuration: e.target.value })}
                  placeholder="VD: 120"
                />
              </div>

              <div className="form-group">
                <label>Học phí chuẩn (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={form.standardTuition}
                  onChange={(e) => setForm({ ...form, standardTuition: e.target.value })}
                  placeholder="VD: 8500000"
                />
              </div>

              <div className="form-group full">
                <label>Trạng thái</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Đang áp dụng (ACTIVE)</option>
                  <option value="INACTIVE">Ngừng áp dụng (INACTIVE)</option>
                </select>
              </div>

              <div className="form-group full">
                <label>Mô tả chương trình</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả mục tiêu, nội dung giảng dạy của chương trình..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={closeModal}>
                Hủy
              </button>
              <button className="primary-button" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Đang lưu...' : editingId === null ? 'Khai báo chương trình' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý lớp học của chương trình */}
      {classModalProgram && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <h2>Quản lý lớp học: {classModalProgram.name}</h2>
                <p>
                  Mã chương trình: <strong>{classModalProgram.code}</strong>. Thêm lớp hoặc chuyển trạng thái để kiểm chứng quy tắc "Chương trình đang có lớp chạy không được xoá".
                </p>
              </div>
              <button className="close-button" onClick={closeClassModal}>
                ×
              </button>
            </div>

            {classError && <div className="modal-form-error">{classError}</div>}

            {/* Form thêm lớp mới */}
            <div className="add-class-box">
              <h4>+ Thêm lớp học mới vào chương trình</h4>
              <div className="add-class-form">
                <input
                  type="text"
                  placeholder="Mã lớp (VD: LOP-01)"
                  value={classForm.code}
                  onChange={(e) => setClassForm({ ...classForm, code: e.target.value.toUpperCase() })}
                />
                <input
                  type="text"
                  placeholder="Tên lớp (VD: Lớp Web K15)"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                />
                <select
                  value={classForm.status}
                  onChange={(e) => setClassForm({ ...classForm, status: e.target.value })}
                >
                  <option value="RUNNING">Đang chạy (RUNNING)</option>
                  <option value="COMPLETED">Đã kết thúc (COMPLETED)</option>
                </select>
                <button className="primary-button add-sub-btn" onClick={handleAddClass} disabled={classLoading}>
                  Thêm lớp
                </button>
              </div>
            </div>

            {/* Danh sách lớp */}
            <div className="classes-list-box">
              <h4>Danh sách lớp học ({classes.length})</h4>
              {classes.length === 0 ? (
                <div className="empty-classes">Chương trình này hiện chưa có lớp học nào. (Có thể xóa chương trình an toàn)</div>
              ) : (
                <table className="inner-table">
                  <thead>
                    <tr>
                      <th>Mã lớp</th>
                      <th>Tên lớp</th>
                      <th>Trạng thái lớp</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.code}</strong></td>
                        <td>{c.name}</td>
                        <td>
                          {c.status === 'RUNNING' ? (
                            <span className="class-badge running">Đang chạy (RUNNING)</span>
                          ) : (
                            <span className="class-badge completed">Đã kết thúc (COMPLETED)</span>
                          )}
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="class-toggle-btn"
                              onClick={() => handleUpdateClassStatus(c.id, c.status)}
                              title="Chuyển trạng thái giữa Đang chạy và Đã kết thúc"
                            >
                              {c.status === 'RUNNING' ? 'Đánh dấu Đã kết thúc' : 'Đánh dấu Đang chạy'}
                            </button>
                            <button
                              className="class-del-btn"
                              onClick={() => handleDeleteClass(c.id)}
                              title="Xóa lớp học"
                            >
                              Xóa lớp
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              <button className="primary-button" onClick={closeClassModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
