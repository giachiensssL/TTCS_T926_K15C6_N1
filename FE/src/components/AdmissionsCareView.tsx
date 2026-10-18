import { useEffect, useState } from 'react'
import '../AdmissionsCare.css'
import {
  addCareLog,
  createLead,
  deleteCareLog,
  deleteLead,
  fetchCareLogs,
  fetchLeads,
  fetchLeadStats,
  scheduleLeadCallback,
  updateLead,
} from '../api/leadApi'
import type {
  CallbackFilterType,
  CareLog,
  CareLogFormData,
  Lead,
  LeadFormData,
  LeadStats,
  LeadStatus,
} from '../types/lead'

const defaultCareLogForm: CareLogFormData = {
  type: 'CALL',
  content: '',
  interactionTime: new Date().toISOString().slice(0, 16),
  counselorName: 'Tư vấn tuyển sinh',
  nextCallbackDate: '',
  newStatus: '',
}

const defaultLeadForm: LeadFormData = {
  fullName: '',
  phone: '',
  email: '',
  courseInterest: '',
  source: 'Facebook',
  status: 'NEW',
  assignedTo: 'Tư vấn tuyển sinh',
  notes: '',
  callbackDate: '',
}

export default function AdmissionsCareView() {
  // State
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [callbackFilter, setCallbackFilter] = useState<CallbackFilterType>('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modals state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showCareModal, setShowCareModal] = useState(false)
  const [careForm, setCareForm] = useState<CareLogFormData>(defaultCareLogForm)

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyLogs, setHistoryLogs] = useState<CareLog[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [quickCallbackDate, setQuickCallbackDate] = useState('')
  const [quickCallbackNotes, setQuickCallbackNotes] = useState('')

  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadForm, setLeadForm] = useState<LeadFormData>(defaultLeadForm)
  const [editingLeadId, setEditingLeadId] = useState<number | null>(null)

  // Load leads and stats
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [leadsRes, statsRes] = await Promise.all([
        fetchLeads({
          search,
          status: statusFilter,
          source: sourceFilter,
          callbackFilter,
          page,
          size: 10,
        }),
        fetchLeadStats(),
      ])

      setLeads(leadsRes.content)
      setTotalPages(leadsRes.totalPages)
      setTotalElements(leadsRes.totalElements)
      setStats(statsRes)
    } catch (err) {
      console.error(err)
      setError('Không thể kết nối đến máy chủ. Hãy đảm bảo Spring Boot Backend đang chạy ở cổng 8080.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, search, statusFilter, sourceFilter, callbackFilter])

  // Helpers for formatting
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  // Preset helpers for Quick Dates
  const setQuickDate = (daysToAdd: number, hours = 9, minutes = 0) => {
    const d = new Date()
    d.setDate(d.getDate() + daysToAdd)
    d.setHours(hours, minutes, 0, 0)
    // format to YYYY-MM-DDTHH:mm
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hh}:${mm}`
  }

  // Open Care Log Modal
  const openCareModal = (lead: Lead) => {
    setSelectedLead(lead)
    setCareForm({
      type: 'CALL',
      content: '',
      interactionTime: new Date().toISOString().slice(0, 16),
      counselorName: lead.assignedTo || 'Tư vấn tuyển sinh',
      nextCallbackDate: '',
      newStatus: lead.status,
    })
    setShowCareModal(true)
  }

  // Submit Care Log
  const handleSaveCareLog = async () => {
    if (!selectedLead) return
    if (!careForm.content.trim()) {
      alert('Vui lòng nhập nội dung tương tác (tư vấn, phản hồi của khách, lời hứa hẹn...).')
      return
    }

    try {
      await addCareLog(selectedLead.id, {
        ...careForm,
        nextCallbackDate: careForm.nextCallbackDate ? careForm.nextCallbackDate : null,
      })
      setShowCareModal(false)
      await loadData()
      alert('Đã lưu nhật ký chăm sóc và cập nhật lịch hẹn gọi lại thành công!')
    } catch (err) {
      console.error(err)
      alert('Không thể lưu nhật ký chăm sóc.')
    }
  }

  // Open History Modal
  const openHistoryModal = async (lead: Lead) => {
    setSelectedLead(lead)
    setShowHistoryModal(true)
    setLoadingHistory(true)
    try {
      const logs = await fetchCareLogs(lead.id)
      setHistoryLogs(logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Delete single care log in history
  const handleDeleteCareLog = async (logId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi nhật ký chăm sóc này?')) return
    try {
      await deleteCareLog(logId)
      if (selectedLead) {
        const logs = await fetchCareLogs(selectedLead.id)
        setHistoryLogs(logs)
      }
      await loadData()
    } catch (err) {
      console.error(err)
      alert('Không thể xóa nhật ký.')
    }
  }

  // Quick Schedule Modal
  const openQuickScheduleModal = (lead: Lead) => {
    setSelectedLead(lead)
    setQuickCallbackDate(lead.callbackDate ? lead.callbackDate.slice(0, 16) : setQuickDate(7, 9, 0))
    setQuickCallbackNotes('')
    setShowScheduleModal(true)
  }

  const handleSaveQuickSchedule = async () => {
    if (!selectedLead) return
    try {
      await scheduleLeadCallback(selectedLead.id, quickCallbackDate ? quickCallbackDate : null, quickCallbackNotes)
      setShowScheduleModal(false)
      await loadData()
      alert('Đã cập nhật lịch nhắc gọi lại thành công!')
    } catch (err) {
      console.error(err)
      alert('Không thể cập nhật lịch gọi lại.')
    }
  }

  // Lead Create/Edit Modal
  const openCreateLeadModal = () => {
    setEditingLeadId(null)
    setLeadForm(defaultLeadForm)
    setShowLeadModal(true)
  }

  const openEditLeadModal = (lead: Lead) => {
    setEditingLeadId(lead.id)
    setLeadForm({
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      courseInterest: lead.courseInterest,
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo,
      notes: lead.notes || '',
      callbackDate: lead.callbackDate ? lead.callbackDate.slice(0, 16) : '',
    })
    setShowLeadModal(true)
  }

  const handleSaveLead = async () => {
    if (!leadForm.fullName.trim() || !leadForm.phone.trim()) {
      alert('Vui lòng nhập Họ tên và Số điện thoại của Lead.')
      return
    }

    try {
      const payload: LeadFormData = {
        ...leadForm,
        callbackDate: leadForm.callbackDate ? leadForm.callbackDate : null,
      }

      if (editingLeadId === null) {
        await createLead(payload)
      } else {
        await updateLead(editingLeadId, payload)
      }

      setShowLeadModal(false)
      await loadData()
      alert(editingLeadId === null ? 'Tiếp nhận Lead mới thành công!' : 'Đã cập nhật thông tin Lead!')
    } catch (err) {
      console.error(err)
      alert('Không thể lưu thông tin Lead.')
    }
  }

  const handleDeleteLead = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng Lead này khỏi danh sách?')) return
    try {
      await deleteLead(id)
      await loadData()
    } catch (err) {
      console.error(err)
      alert('Không thể xóa Lead.')
    }
  }

  return (
    <div className="admissions-care-root">
      {/* View Header */}
      <div className="care-header">
        <div className="care-header-title">
          <h1>🎓 Tư vấn Tuyển sinh & Ghi nhận Chăm sóc</h1>
          <p>Ghi nhật ký tương tác (Gọi, Nhắn, Gặp), đặt lịch gọi lại tuần sau và theo dõi Lead quá hạn</p>
        </div>
        <button className="header-action-btn" onClick={openCreateLeadModal}>
          <span>+ Tiếp nhận Lead mới</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="stats-grid">
        <div
          className="stat-card"
          onClick={() => {
            setCallbackFilter('ALL')
            setPage(0)
          }}
        >
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalLeads ?? 0}</span>
            <span className="stat-label">Tổng số Lead</span>
          </div>
        </div>

        {/* PROMINENT OVERDUE KPI CARD */}
        <div
          className="stat-card overdue-card"
          onClick={() => {
            setCallbackFilter('OVERDUE')
            setPage(0)
          }}
          title="Bấm để lọc ngay các Lead quá hạn gọi lại"
        >
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.overdueCount ?? 0}</span>
            <span className="stat-label">⚠️ QUÁ HẠN GỌI LẠI</span>
          </div>
        </div>

        <div
          className="stat-card today-card"
          onClick={() => {
            setCallbackFilter('TODAY')
            setPage(0)
          }}
        >
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.todayCount ?? 0}</span>
            <span className="stat-label">Cần gọi hôm nay</span>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => {
            setCallbackFilter('UPCOMING')
            setPage(0)
          }}
        >
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.upcomingCount ?? 0}</span>
            <span className="stat-label">Lịch hẹn sắp tới</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalInteractions ?? 0}</span>
            <span className="stat-label">Lượt tương tác đã ghi</span>
          </div>
        </div>
      </div>

      {/* URGENT OVERDUE ALERT BANNER (IF ANY OVERDUE LEADS EXIST) */}
      {stats && stats.overdueCount > 0 && (
        <div className="overdue-alert-banner">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div className="banner-text">
              <strong>Cảnh báo: Đang có {stats.overdueCount} Lead quá hạn gọi lại!</strong>
              <span>
                Bạn có lời hứa gọi lại cho khách hàng đã bị quá hạn. Hãy kiểm tra các mục được đánh dấu màu đỏ và liên hệ lại ngay!
              </span>
            </div>
          </div>
          <button
            className="banner-btn"
            onClick={() => {
              setCallbackFilter('OVERDUE')
              setPage(0)
            }}
          >
            Xem danh sách quá hạn →
          </button>
        </div>
      )}

      {error && <div className="admissions-alert error" style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

      {/* Filter Box */}
      <div className="filter-box">
        {/* Quick Filter Tabs */}
        <div className="quick-filter-tabs">
          <button
            className={`filter-tab ${callbackFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => {
              setCallbackFilter('ALL')
              setPage(0)
            }}
          >
            Tất cả ({stats?.totalLeads ?? 0})
          </button>
          <button
            className={`filter-tab overdue-tab ${callbackFilter === 'OVERDUE' ? 'active' : ''}`}
            onClick={() => {
              setCallbackFilter('OVERDUE')
              setPage(0)
            }}
          >
            ⚠️ Quá hạn gọi lại ({stats?.overdueCount ?? 0})
          </button>
          <button
            className={`filter-tab ${callbackFilter === 'TODAY' ? 'active' : ''}`}
            onClick={() => {
              setCallbackFilter('TODAY')
              setPage(0)
            }}
          >
            📅 Cần gọi hôm nay ({stats?.todayCount ?? 0})
          </button>
          <button
            className={`filter-tab ${callbackFilter === 'UPCOMING' ? 'active' : ''}`}
            onClick={() => {
              setCallbackFilter('UPCOMING')
              setPage(0)
            }}
          >
            ⏳ Sắp tới ({stats?.upcomingCount ?? 0})
          </button>
          <button
            className={`filter-tab ${callbackFilter === 'NO_SCHEDULE' ? 'active' : ''}`}
            onClick={() => {
              setCallbackFilter('NO_SCHEDULE')
              setPage(0)
            }}
          >
            Chưa đặt lịch
          </button>
        </div>

        {/* Search & Select Controls */}
        <div className="filter-controls-row">
          <div className="search-input-wrap">
            <input
              type="text"
              placeholder="🔍 Tìm theo Họ tên, Số điện thoại, Email, Khóa học..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />
          </div>

          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(0)
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NEW">Mới tiếp nhận</option>
            <option value="CONTACTED">Đã liên hệ</option>
            <option value="INTERESTED">Quan tâm cao</option>
            <option value="CLOSED_WON">Đã chốt nhập học</option>
            <option value="LOST">Hủy tư vấn</option>
          </select>

          <select
            className="select-filter"
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value)
              setPage(0)
            }}
          >
            <option value="">Tất cả nguồn</option>
            <option value="Facebook">Facebook</option>
            <option value="Website">Website</option>
            <option value="Zalo">Zalo</option>
            <option value="Hotline">Hotline</option>
            <option value="Giới thiệu">Giới thiệu</option>
          </select>

          <button
            className="reset-filter-btn"
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setSourceFilter('')
              setCallbackFilter('ALL')
              setPage(0)
            }}
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="leads-table-card">
        <div className="table-responsive">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Khóa học quan tâm</th>
                <th>Trạng thái</th>
                <th>Lịch nhắc gọi lại</th>
                <th>Tương tác gần nhất</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Đang tải danh sách Lead...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Không tìm thấy Lead nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isOverdue = lead.overdue

                  return (
                    <tr key={lead.id} className={isOverdue ? 'row-overdue' : ''}>
                      {/* Customer Info */}
                      <td>
                        <div className="lead-primary-info">
                          <span className="lead-name">
                            {isOverdue && <span style={{ color: '#ef4444', marginRight: '4px' }}>⚠️</span>}
                            {lead.fullName}
                          </span>
                          <a href={`tel:${lead.phone}`} className="lead-phone">
                            📞 {lead.phone}
                          </a>
                          {lead.email && <span className="lead-email">✉️ {lead.email}</span>}
                        </div>
                      </td>

                      {/* Course & Source */}
                      <td>
                        <span className="course-badge">{lead.courseInterest || 'Chưa chọn'}</span>
                        <span className="source-tag">Nguồn: {lead.source || 'Khác'}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-pill status-${lead.status.toLowerCase()}`}>
                          {lead.status === 'NEW' && 'Mới'}
                          {lead.status === 'CONTACTED' && 'Đã liên hệ'}
                          {lead.status === 'INTERESTED' && 'Quan tâm'}
                          {lead.status === 'CLOSED_WON' && 'Đã chốt'}
                          {lead.status === 'LOST' && 'Hủy tư vấn'}
                        </span>
                      </td>

                      {/* CALLBACK SCHEDULE WITH PROMINENT OVERDUE HIGHLIGHT */}
                      <td>
                        <div className="callback-cell">
                          {isOverdue ? (
                            <>
                              <span className="callback-badge badge-overdue">
                                <span>⚠️ QUÁ HẠN:</span>
                                <strong>{formatDateTime(lead.callbackDate)}</strong>
                              </span>
                              <span className="overdue-text">
                                🔥 {lead.overdueDuration || 'Đã quá hạn gọi lại'}
                              </span>
                            </>
                          ) : lead.callbackStatus === 'TODAY' ? (
                            <span className="callback-badge badge-today">
                              <span>📅 Hôm nay:</span>
                              <strong>{formatDateTime(lead.callbackDate)}</strong>
                            </span>
                          ) : lead.callbackStatus === 'UPCOMING' ? (
                            <span className="callback-badge badge-upcoming">
                              <span>⏳ {lead.overdueDuration}</span>
                            </span>
                          ) : (
                            <span className="callback-badge badge-none">
                              <span>Chưa hẹn gọi lại</span>
                            </span>
                          )}

                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: isOverdue ? '#dc2626' : '#2563eb',
                              fontSize: '12px',
                              cursor: 'pointer',
                              padding: '2px 0',
                              textAlign: 'left',
                              textDecoration: 'underline',
                              fontWeight: isOverdue ? 600 : 400,
                            }}
                            onClick={() => openQuickScheduleModal(lead)}
                          >
                            {lead.callbackDate ? 'Đổi lịch hẹn' : '+ Đặt lịch hẹn gọi lại'}
                          </button>
                        </div>
                      </td>

                      {/* Last Interaction Log */}
                      <td>
                        {lead.lastCareLog ? (
                          <div className="last-interaction-summary">
                            <span
                              className={`interaction-type-tag type-${lead.lastCareLog.type.toLowerCase()}`}
                            >
                              {lead.lastCareLog.type === 'CALL' && '📞 Cuộc gọi'}
                              {lead.lastCareLog.type === 'MESSAGE' && '💬 Tin nhắn'}
                              {lead.lastCareLog.type === 'MEETING' && '👥 Gặp mặt'}
                            </span>
                            <span className="interaction-content-snippet" title={lead.lastCareLog.content}>
                              {lead.lastCareLog.content}
                            </span>
                            <span className="interaction-time-sub">
                              {formatDateTime(lead.lastCareLog.interactionTime)} • ({lead.careLogCount} lần chăm sóc)
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa có nhật ký</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="row-actions-wrap">
                          <button
                            className={`btn-record-care ${isOverdue ? 'btn-overdue-urgent' : ''}`}
                            onClick={() => openCareModal(lead)}
                            title="Ghi nhật ký cuộc gọi/nhắn/gặp và hẹn gọi lại"
                          >
                            <span>📝</span>
                            <span>{isOverdue ? 'Gọi lại ngay' : 'Ghi chăm sóc'}</span>
                          </button>

                          <button
                            className="btn-history-view"
                            onClick={() => openHistoryModal(lead)}
                            title="Xem lịch sử chăm sóc chi tiết"
                          >
                            🕒 Lịch sử ({lead.careLogCount})
                          </button>

                          <button
                            className="btn-more-options"
                            onClick={() => openEditLeadModal(lead)}
                            title="Chỉnh sửa Lead"
                          >
                            ✏️
                          </button>

                          <button
                            className="btn-more-options"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Xóa Lead"
                          >
                            🗑️
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

        {/* Pagination */}
        <div className="pagination-row">
          <span>
            Hiển thị {leads.length} / {totalElements} Lead
          </span>
          <div className="pagination-btns">
            <button
              className="pagination-btn"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ← Trước
            </button>
            <span style={{ padding: '6px 10px', fontSize: '13px' }}>
              Trang {page + 1} / {Math.max(totalPages, 1)}
            </span>
            <button
              className="pagination-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL 1: GHI NHẬT KÝ CHĂM SÓC & ĐẶT LỊCH NHẮC GỌI LẠI
         ========================================================= */}
      {showCareModal && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowCareModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Ghi Nhật Ký Chăm Sóc & Đặt Lịch Gọi Lại</h2>
              <button className="modal-close-btn" onClick={() => setShowCareModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Customer info card */}
              <div className="lead-quick-info">
                <div>
                  <div className="lead-quick-name">{selectedLead.fullName}</div>
                  <div className="lead-quick-meta">
                    📞 {selectedLead.phone} {selectedLead.email ? `• ✉️ ${selectedLead.email}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedLead.courseInterest}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Nguồn: {selectedLead.source}</div>
                </div>
              </div>

              {/* Overdue alert if applicable */}
              {selectedLead.overdue && (
                <div className="modal-overdue-alert">
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <div>
                    <strong>Khách hàng này đang bị quá hạn gọi lại!</strong>
                    <div>Hẹn trước đó: {formatDateTime(selectedLead.callbackDate)} ({selectedLead.overdueDuration})</div>
                  </div>
                </div>
              )}

              {/* 1. Chọn loại tương tác: Gọi, Nhắn, Gặp */}
              <div className="form-group">
                <label>1. Loại tương tác *</label>
                <div className="interaction-type-selector">
                  <button
                    type="button"
                    className={`type-select-btn type-call ${careForm.type === 'CALL' ? 'active' : ''}`}
                    onClick={() => setCareForm({ ...careForm, type: 'CALL' })}
                  >
                    <span className="type-select-icon">📞</span>
                    <span>Cuộc gọi điện</span>
                  </button>

                  <button
                    type="button"
                    className={`type-select-btn type-message ${careForm.type === 'MESSAGE' ? 'active' : ''}`}
                    onClick={() => setCareForm({ ...careForm, type: 'MESSAGE' })}
                  >
                    <span className="type-select-icon">💬</span>
                    <span>Nhắn tin (Zalo/SMS)</span>
                  </button>

                  <button
                    type="button"
                    className={`type-select-btn type-meeting ${careForm.type === 'MEETING' ? 'active' : ''}`}
                    onClick={() => setCareForm({ ...careForm, type: 'MEETING' })}
                  >
                    <span className="type-select-icon">👥</span>
                    <span>Gặp trực tiếp</span>
                  </button>
                </div>
              </div>

              {/* 2. Thời điểm tương tác */}
              <div className="form-group">
                <label>2. Thời điểm tương tác *</label>
                <input
                  type="datetime-local"
                  value={careForm.interactionTime}
                  onChange={(e) => setCareForm({ ...careForm, interactionTime: e.target.value })}
                />
              </div>

              {/* 3. Nội dung tương tác */}
              <div className="form-group">
                <label>3. Nội dung cuộc trao đổi & tư vấn *</label>
                <textarea
                  rows={4}
                  placeholder="Ghi chi tiết: Khách hàng hỏi thông tin gì, băn khoăn về học phí/lịch học ra sao, khách hẹn tuần sau gọi lại vào lúc nào..."
                  value={careForm.content}
                  onChange={(e) => setCareForm({ ...careForm, content: e.target.value })}
                />
              </div>

              {/* 4. Đặt ngày nhắc gọi lại */}
              <div className="form-group">
                <label>
                  4. Đặt ngày nhắc gọi lại (Để không quên lời hứa gọi lại cho khách!)
                </label>
                <input
                  type="datetime-local"
                  value={careForm.nextCallbackDate || ''}
                  onChange={(e) => setCareForm({ ...careForm, nextCallbackDate: e.target.value })}
                />

                {/* Quick select buttons */}
                <div className="quick-date-row">
                  <span style={{ fontSize: '12px', color: '#64748b', alignSelf: 'center' }}>Chọn nhanh:</span>
                  <button
                    type="button"
                    className="quick-date-btn"
                    onClick={() => setCareForm({ ...careForm, nextCallbackDate: setQuickDate(1, 9, 0) })}
                  >
                    +1 Ngày mai (9h)
                  </button>
                  <button
                    type="button"
                    className="quick-date-btn"
                    onClick={() => setCareForm({ ...careForm, nextCallbackDate: setQuickDate(3, 14, 0) })}
                  >
                    +3 ngày nữa (14h)
                  </button>
                  <button
                    type="button"
                    className="quick-date-btn next-week-btn"
                    onClick={() => setCareForm({ ...careForm, nextCallbackDate: setQuickDate(7, 9, 0) })}
                  >
                    📅 Tuần sau (+7 ngày lúc 9h)
                  </button>
                  {careForm.nextCallbackDate && (
                    <button
                      type="button"
                      className="quick-date-btn"
                      style={{ color: '#ef4444' }}
                      onClick={() => setCareForm({ ...careForm, nextCallbackDate: '' })}
                    >
                      Xóa lịch hẹn
                    </button>
                  )}
                </div>
              </div>

              {/* 5. Cập nhật trạng thái lead */}
              <div className="form-group">
                <label>5. Cập nhật trạng thái Lead (tùy chọn)</label>
                <select
                  value={careForm.newStatus}
                  onChange={(e) => setCareForm({ ...careForm, newStatus: e.target.value as LeadStatus })}
                >
                  <option value="">Giữ nguyên trạng thái hiện tại</option>
                  <option value="NEW">Mới</option>
                  <option value="CONTACTED">Đã liên hệ</option>
                  <option value="INTERESTED">Quan tâm cao</option>
                  <option value="CLOSED_WON">Đã chốt nhập học</option>
                  <option value="LOST">Hủy tư vấn</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCareModal(false)}>
                Hủy
              </button>
              <button className="btn-save-care" onClick={handleSaveCareLog}>
                💾 Lưu Nhật Ký & Đặt Lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: XEM LỊCH SỬ CHĂM SÓC (CARE TIMELINE)
         ========================================================= */}
      {showHistoryModal && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🕒 Lịch Sử Tương Tác & Chăm Sóc</h2>
              <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Customer summary */}
              <div className="lead-quick-info">
                <div>
                  <div className="lead-quick-name">{selectedLead.fullName}</div>
                  <div className="lead-quick-meta">📞 {selectedLead.phone}</div>
                </div>
                <div>
                  {selectedLead.callbackDate ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Lịch hẹn gọi lại:</span>
                      <div
                        style={{
                          fontWeight: 700,
                          color: selectedLead.overdue ? '#dc2626' : '#2563eb',
                        }}
                      >
                        {formatDateTime(selectedLead.callbackDate)}
                        {selectedLead.overdue && ' (QUÁ HẠN)'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Chưa có lịch hẹn gọi lại</span>
                  )}
                </div>
              </div>

              {selectedLead.overdue && (
                <div className="modal-overdue-alert">
                  <span>⚠️</span>
                  <div>
                    <strong>Cảnh báo: Khách hàng này đang quá hạn gọi lại!</strong>
                    <div>Hãy liên hệ lại với khách hàng ngay để giữ uy tín tư vấn tuyển sinh.</div>
                  </div>
                </div>
              )}

              {/* Timeline list */}
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải lịch sử...</div>
              ) : historyLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Chưa có lần tương tác nào được ghi nhận cho khách hàng này.
                </div>
              ) : (
                <div className="care-timeline">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="timeline-entry">
                      <div className={`timeline-node node-${log.type.toLowerCase()}`} />
                      <div className="timeline-header">
                        <span className={`interaction-type-tag type-${log.type.toLowerCase()}`}>
                          {log.type === 'CALL' && '📞 Cuộc gọi'}
                          {log.type === 'MESSAGE' && '💬 Tin nhắn'}
                          {log.type === 'MEETING' && '👥 Gặp trực tiếp'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="timeline-meta">{formatDateTime(log.interactionTime)}</span>
                          <button
                            className="timeline-delete-btn"
                            onClick={() => handleDeleteCareLog(log.id)}
                            title="Xóa bản ghi này"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="timeline-content">{log.content}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Tư vấn viên: {log.counselorName || 'Tư vấn tuyển sinh'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-save-care"
                onClick={() => {
                  setShowHistoryModal(false)
                  openCareModal(selectedLead)
                }}
              >
                + Ghi thêm tương tác mới
              </button>
              <button className="btn-cancel" onClick={() => setShowHistoryModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ĐẶT LỊCH NHẮC GỌI LẠI NHANH
         ========================================================= */}
      {showScheduleModal && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Đặt Lịch Nhắc Gọi Lại Khách Hàng</h2>
              <button className="modal-close-btn" onClick={() => setShowScheduleModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="lead-quick-info">
                <div>
                  <div className="lead-quick-name">{selectedLead.fullName}</div>
                  <div className="lead-quick-meta">📞 {selectedLead.phone}</div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  Lịch hiện tại: <strong>{formatDateTime(selectedLead.callbackDate)}</strong>
                </div>
              </div>

              <div className="form-group">
                <label>Ngày và giờ nhắc gọi lại *</label>
                <input
                  type="datetime-local"
                  value={quickCallbackDate}
                  onChange={(e) => setQuickCallbackDate(e.target.value)}
                />

                <div className="quick-date-row">
                  <span style={{ fontSize: '12px', color: '#64748b', alignSelf: 'center' }}>Chọn nhanh:</span>
                  <button
                    type="button"
                    className="quick-date-btn"
                    onClick={() => setQuickCallbackDate(setQuickDate(1, 9, 0))}
                  >
                    Ngày mai (9h)
                  </button>
                  <button
                    type="button"
                    className="quick-date-btn"
                    onClick={() => setQuickCallbackDate(setQuickDate(3, 14, 0))}
                  >
                    3 ngày tới (14h)
                  </button>
                  <button
                    type="button"
                    className="quick-date-btn next-week-btn"
                    onClick={() => setQuickCallbackDate(setQuickDate(7, 9, 0))}
                  >
                    📅 Tuần sau (+7 ngày)
                  </button>
                  {quickCallbackDate && (
                    <button
                      type="button"
                      className="quick-date-btn"
                      style={{ color: '#ef4444' }}
                      onClick={() => setQuickCallbackDate('')}
                    >
                      Hủy lịch hẹn
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú lý do hẹn gọi lại</label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Khách đang đi công tác, hứa tuần sau về sẽ đăng ký lớp Java..."
                  value={quickCallbackNotes}
                  onChange={(e) => setQuickCallbackNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowScheduleModal(false)}>
                Hủy
              </button>
              <button className="btn-save-care" onClick={handleSaveQuickSchedule}>
                💾 Cập nhật Lịch Hẹn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: TIẾP NHẬN / SỬA THÔNG TIN LEAD
         ========================================================= */}
      {showLeadModal && (
        <div className="modal-overlay" onClick={() => setShowLeadModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLeadId === null ? '+ Tiếp Nhận Lead Mới' : '✏️ Chỉnh Sửa Thông Tin Lead'}</h2>
              <button className="modal-close-btn" onClick={() => setShowLeadModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Họ và tên khách hàng *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={leadForm.fullName}
                  onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    placeholder="0987654321"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Khóa học quan tâm</label>
                  <input
                    type="text"
                    placeholder="Java Spring Boot, ReactJS, Fullstack..."
                    value={leadForm.courseInterest}
                    onChange={(e) => setLeadForm({ ...leadForm, courseInterest: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Nguồn Lead</label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Website">Website</option>
                    <option value="Zalo">Zalo</option>
                    <option value="Hotline">Hotline</option>
                    <option value="Giới thiệu">Giới thiệu</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Trạng thái ban đầu</label>
                  <select
                    value={leadForm.status}
                    onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as LeadStatus })}
                  >
                    <option value="NEW">Mới</option>
                    <option value="CONTACTED">Đã liên hệ</option>
                    <option value="INTERESTED">Quan tâm cao</option>
                    <option value="CLOSED_WON">Đã chốt</option>
                    <option value="LOST">Hủy tư vấn</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tư vấn viên phụ trách</label>
                  <input
                    type="text"
                    value={leadForm.assignedTo}
                    onChange={(e) => setLeadForm({ ...leadForm, assignedTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Lịch nhắc gọi lại ban đầu (nếu có)</label>
                <input
                  type="datetime-local"
                  value={leadForm.callbackDate || ''}
                  onChange={(e) => setLeadForm({ ...leadForm, callbackDate: e.target.value })}
                />
                <div className="quick-date-row">
                  <button
                    type="button"
                    className="quick-date-btn next-week-btn"
                    onClick={() => setLeadForm({ ...leadForm, callbackDate: setQuickDate(7, 9, 0) })}
                  >
                    Hẹn gọi lại tuần sau (+7 ngày)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú tư vấn</label>
                <textarea
                  rows={3}
                  placeholder="Thông tin thêm về nhu cầu học viên..."
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowLeadModal(false)}>
                Hủy
              </button>
              <button className="btn-save-care" onClick={handleSaveLead}>
                💾 {editingLeadId === null ? 'Lưu Lead Mới' : 'Cập Nhật Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
