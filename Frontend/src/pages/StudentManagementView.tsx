import React, { useEffect, useState } from 'react'
import {
  fetchStudents,
  updateStudentProfileApi,
} from '../api/studentApi'
import { StudentProfile, StudentUpdateForm } from '../types/student'

export default function StudentManagementView() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [entryLevel, setEntryLevel] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // State cho xem và sửa hồ sơ
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<StudentUpdateForm>({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    dateOfBirth: '',
    address: '',
    entryLevel: '',
    note: '',
    status: 'DANG_HOC',
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchStudents(keyword, status, entryLevel, page, 10)
      setStudents(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      setError('Lỗi khi tải danh sách học viên.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, status, entryLevel])

  const handleSearch = () => {
    setPage(0)
    loadData()
  }

  const handleReset = () => {
    setKeyword('')
    setStatus('')
    setEntryLevel('')
    setPage(0)
  }

  const openProfile = (student: StudentProfile, editMode = false) => {
    setSelectedStudent(student)
    setIsEditing(editMode)
    setSaveSuccessMsg('')
    setEditForm({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      gender: student.gender || 'Nam',
      dateOfBirth: student.dateOfBirth || '',
      address: student.address || '',
      entryLevel: student.entryLevel || 'Cơ bản',
      note: student.note || '',
      status: student.status || 'DANG_HOC',
    })
    setShowProfileModal(true)
  }

  const handleFormChange = (field: keyof StudentUpdateForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    if (!editForm.fullName.trim() || !editForm.phone.trim()) {
      alert('Vui lòng nhập đầy đủ Họ và tên, Số điện thoại.')
      return
    }

    try {
      setSaveLoading(true)
      const updated = await updateStudentProfileApi(selectedStudent.id, editForm)
      setSelectedStudent(updated)
      setIsEditing(false)
      setSaveSuccessMsg('✓ Đã cập nhật thông tin học viên thành công!')
      // Refresh danh sách
      await loadData()
    } catch (err: any) {
      alert('Lỗi cập nhật: ' + (err.message || 'Không thể lưu'))
    } finally {
      setSaveLoading(false)
    }
  }

  const renderStatusBadge = (st: string) => {
    switch (st) {
      case 'DANG_HOC':
        return <span className="status-badge active">Đang học</span>
      case 'HOAN_THANH':
        return <span className="status-badge completed">Đã học xong</span>
      case 'BAO_LUU':
        return <span className="status-badge inactive">Bảo lưu</span>
      case 'DA_TOT_NGHIEP':
        return <span className="status-badge active">Đã tốt nghiệp</span>
      default:
        return <span className="status-badge">{st}</span>
    }
  }

  return (
    <div className="student-management-view">
      {/* Bộ lọc tìm kiếm theo Mã học viên, Tên, Số điện thoại */}
      <section className="filter-card">
        <div className="filter-item search-item">
          <label>Tìm kiếm học viên</label>
          <input
            type="text"
            placeholder="Nhập mã học viên, tên hoặc số điện thoại..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
          />
        </div>

        <div className="filter-item">
          <label>Trình độ đầu vào</label>
          <select
            value={entryLevel}
            onChange={(e) => {
              setEntryLevel(e.target.value)
              setPage(0)
            }}
          >
            <option value="">Tất cả trình độ</option>
            <option value="Mất gốc">Mất gốc</option>
            <option value="Cơ bản">Cơ bản</option>
            <option value="Tiền trung cấp (B1)">Tiền trung cấp (B1)</option>
            <option value="Trung cấp (B2)">Trung cấp (B2)</option>
            <option value="Nâng cao">Nâng cao</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Trạng thái</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(0)
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DANG_HOC">Đang học</option>
            <option value="BAO_LUU">Bảo lưu</option>
            <option value="DA_TOT_NGHIEP">Đã tốt nghiệp</option>
            <option value="DA_NGHI">Đã nghỉ</option>
          </select>
        </div>

        <button className="search-button" onClick={handleSearch}>
          🔎 Tìm kiếm
        </button>

        <button className="reset-button" onClick={handleReset}>
          Đặt lại
        </button>
      </section>

      {error && <div className="error-message">{error}</div>}

      {/* Bảng danh sách học viên */}
      <section className="table-card">
        <div className="table-header">
          <div>
            <h2>Hồ sơ học viên</h2>
            <span>Tổng số: {totalElements} học viên</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Mã học viên</th>
                <th>Họ và tên</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Trình độ đầu vào</th>
                <th>Lớp đang học</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="empty">
                    Đang tải danh sách học viên...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty">
                    Không tìm thấy học viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <span className="code-pill">{st.studentCode}</span>
                    </td>
                    <td className="font-semibold text-gray-900">{st.fullName}</td>
                    <td>{st.phone}</td>
                    <td>{st.email || '—'}</td>
                    <td>
                      <span className="level-badge">{st.entryLevel || 'Chưa xác định'}</span>
                    </td>
                    <td>
                      {st.currentClasses && st.currentClasses.length > 0 ? (
                        <div className="class-tag-list">
                          {st.currentClasses.map((c) => (
                            <span key={c.id} className="class-tag">
                              {c.classCode}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">Chưa xếp lớp</span>
                      )}
                    </td>
                    <td>{renderStatusBadge(st.status)}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="view-btn"
                          onClick={() => openProfile(st, false)}
                          title="Xem trang hồ sơ chi tiết"
                        >
                          👁️ Xem hồ sơ
                        </button>
                        <button
                          className="edit-button"
                          onClick={() => openProfile(st, true)}
                          title="Chỉnh sửa thông tin cá nhân, trình độ, ghi chú"
                        >
                          ✏️ Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="pagination">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ← Trước
          </button>
          <span>
            Trang <strong>{page + 1}</strong> / <strong>{Math.max(totalPages, 1)}</strong>
          </span>
          <button
            disabled={totalPages === 0 || page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau →
          </button>
        </div>
      </section>

      {/* Modal Trang hồ sơ học viên: Xem và sửa thông tin cá nhân, trình độ đầu vào, ghi chú, lớp đang học & lịch sử lớp học */}
      {showProfileModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal modal-profile">
            <div className="modal-header">
              <div>
                <h2>
                  Hồ sơ học viên: {selectedStudent.fullName}
                  <span className="code-pill ml-2">{selectedStudent.studentCode}</span>
                </h2>
                <p>Xem và chỉnh sửa thông tin cá nhân, trình độ đầu vào, ghi chú và lịch sử lớp học.</p>
              </div>
              <button className="close-button" onClick={() => setShowProfileModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-profile-body">
              {saveSuccessMsg && <div className="success-banner">{saveSuccessMsg}</div>}

              {/* Chế độ xem & sửa thông tin cá nhân */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <h3>👤 Thông tin cá nhân & Trình độ</h3>
                  {!isEditing ? (
                    <button
                      type="button"
                      className="edit-action-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Chỉnh sửa thông tin
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="cancel-action-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="profile-info-grid">
                    <div className="info-item">
                      <span className="label">Mã học viên:</span>
                      <span className="value font-bold text-indigo-700">
                        {selectedStudent.studentCode}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Họ và tên:</span>
                      <span className="value font-semibold">{selectedStudent.fullName}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Số điện thoại:</span>
                      <span className="value">{selectedStudent.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedStudent.email || '—'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Giới tính:</span>
                      <span className="value">{selectedStudent.gender || 'Nam'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Ngày sinh:</span>
                      <span className="value">{selectedStudent.dateOfBirth || '—'}</span>
                    </div>
                    <div className="info-item full">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">{selectedStudent.address || '—'}</span>
                    </div>
                    <div className="info-item full highlighted-level">
                      <span className="label">🎯 Trình độ đầu vào:</span>
                      <span className="value level-text">
                        {selectedStudent.entryLevel || 'Chưa thiết lập'}
                      </span>
                    </div>
                    <div className="info-item full highlighted-note">
                      <span className="label">📝 Ghi chú về học viên:</span>
                      <p className="value note-text">
                        {selectedStudent.note || 'Chưa có ghi chú nào.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="profile-edit-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Họ và tên (*)</label>
                        <input
                          value={editForm.fullName}
                          onChange={(e) => handleFormChange('fullName', e.target.value)}
                          placeholder="Nhập họ và tên..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Số điện thoại (*)</label>
                        <input
                          value={editForm.phone}
                          onChange={(e) => handleFormChange('phone', e.target.value)}
                          placeholder="Nhập số điện thoại..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          placeholder="Nhập email..."
                        />
                      </div>
                      <div className="form-group">
                        <label>Giới tính</label>
                        <select
                          value={editForm.gender}
                          onChange={(e) => handleFormChange('gender', e.target.value)}
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Ngày sinh</label>
                        <input
                          type="date"
                          value={editForm.dateOfBirth || ''}
                          onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>🎯 Trình độ đầu vào (*)</label>
                        <select
                          value={editForm.entryLevel}
                          onChange={(e) => handleFormChange('entryLevel', e.target.value)}
                        >
                          <option value="Mất gốc">Mất gốc</option>
                          <option value="Cơ bản">Cơ bản</option>
                          <option value="Tiền trung cấp (B1)">Tiền trung cấp (B1)</option>
                          <option value="Trung cấp (B2)">Trung cấp (B2)</option>
                          <option value="Nâng cao">Nâng cao</option>
                        </select>
                      </div>
                      <div className="form-group full">
                        <label>Địa chỉ</label>
                        <input
                          value={editForm.address}
                          onChange={(e) => handleFormChange('address', e.target.value)}
                          placeholder="Địa chỉ cư trú..."
                        />
                      </div>
                      <div className="form-group full">
                        <label>📝 Ghi chú về học viên</label>
                        <textarea
                          rows={3}
                          value={editForm.note}
                          onChange={(e) => handleFormChange('note', e.target.value)}
                          placeholder="Nhập ghi chú về mục tiêu, định hướng học tập, yêu cầu của học viên..."
                        />
                      </div>
                    </div>

                    <div className="form-action-footer">
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setIsEditing(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="primary-button"
                        disabled={saveLoading}
                      >
                        {saveLoading ? 'Đang lưu...' : 'Lưu thông tin'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* LỚP ĐANG HỌC */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <h3>
                    📖 Lớp đang học ({selectedStudent.currentClasses?.length || 0})
                  </h3>
                </div>
                {selectedStudent.currentClasses && selectedStudent.currentClasses.length > 0 ? (
                  <div className="classes-grid">
                    {selectedStudent.currentClasses.map((cls) => (
                      <div key={cls.id} className="class-card active-card">
                        <div className="class-card-header">
                          <span className="class-code">{cls.classCode}</span>
                          <span className="status-badge active">Đang học</span>
                        </div>
                        <h4 className="class-title">{cls.className}</h4>
                        <div className="class-details">
                          <p>
                            <strong>Giảng viên:</strong> {cls.teacherName || 'Chưa phân công'}
                          </p>
                          <p>
                            <strong>Lịch học:</strong> {cls.schedule || 'Chưa xếp lịch'}
                          </p>
                          <p>
                            <strong>Phòng học:</strong> {cls.room || 'Phòng trực tuyến'}
                          </p>
                          <p>
                            <strong>Thời gian:</strong> {cls.startDate} → {cls.endDate || 'Hiện tại'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-sub">Hiện tại học viên không tham gia lớp học nào.</p>
                )}
              </div>

              {/* LỊCH SỬ CÁC LỚP ĐÃ HỌC */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <h3>
                    📜 Lịch sử các lớp đã học ({selectedStudent.classHistory?.length || 0})
                  </h3>
                </div>
                {selectedStudent.classHistory && selectedStudent.classHistory.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="table mini-table">
                      <thead>
                        <tr>
                          <th>Mã lớp</th>
                          <th>Tên khóa học</th>
                          <th>Giảng viên</th>
                          <th>Thời gian học</th>
                          <th>Điểm tổng kết</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.classHistory.map((h) => (
                          <tr key={h.id}>
                            <td className="font-semibold">{h.classCode}</td>
                            <td>{h.className}</td>
                            <td>{h.teacherName || '—'}</td>
                            <td>
                              {h.startDate} → {h.endDate}
                            </td>
                            <td>
                              {h.finalGrade !== null && h.finalGrade !== undefined ? (
                                <span className="grade-badge">{h.finalGrade} / 10</span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>{renderStatusBadge(h.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-sub">Chưa có lịch sử lớp học cũ nào.</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowProfileModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
