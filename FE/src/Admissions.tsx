import { useEffect, useState } from 'react'
import './Admissions.css'

const API_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/leads`

const leadStatuses = [
  'NEW',
  'CONTACTING',
  'QUALIFIED',
  'CLOSED_WON',
  'CLOSED_LOST',
  'ENROLLED',
] as const

type LeadStatus = (typeof leadStatuses)[number]

type Lead = {
  id: number
  fullName: string
  email: string
  phone: string | null
  courseInterest: string | null
  source: string | null
  notes: string | null
  status: LeadStatus
  createdAt: string
  studentCode: string | null
}

type LeadForm = {
  fullName: string
  email: string
  phone: string
  courseInterest: string
  source: string
  notes: string
  status: LeadStatus
}

type LeadPage = {
  content: Lead[]
  totalPages: number
  totalElements: number
}

type Enrollment = {
  studentCode: string
  username: string
  email: string
  message: string
}

const emptyForm: LeadForm = {
  fullName: '',
  email: '',
  phone: '',
  courseInterest: '',
  source: 'Landing Page',
  notes: '',
  status: 'NEW',
}

const statusLabels: Record<LeadStatus, string> = {
  NEW: 'Lead mới',
  CONTACTING: 'Đang chăm sóc',
  QUALIFIED: 'Tiềm năng',
  CLOSED_WON: 'Đã chốt',
  CLOSED_LOST: 'Không tiếp tục',
  ENROLLED: 'Đã nhập học',
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as
      | { detail?: string; message?: string; title?: string }
      | null
    throw new Error(
      payload?.detail ?? payload?.message ?? payload?.title ?? 'Yêu cầu không thành công.',
    )
  }
  return response.json() as Promise<T>
}

function Admissions() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [form, setForm] = useState<LeadForm>(emptyForm)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      search,
      page: String(page),
    })
    if (status) params.set('status', status)

    fetch(`${API_URL}?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Không thể tải danh sách lead.')
        return response.json() as Promise<LeadPage>
      })
      .then((data) => {
        setError('')
        setLeads(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Không thể tải danh sách lead.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [page, search, status])

  const openCreateForm = () => {
    setEditingLead(null)
    setForm(emptyForm)
    setNotice('')
    setShowForm(true)
  }

  const openEditForm = (lead: Lead) => {
    setEditingLead(lead)
    setForm({
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone ?? '',
      courseInterest: lead.courseInterest ?? '',
      source: lead.source ?? '',
      notes: lead.notes ?? '',
      status: lead.status,
    })
    setNotice('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingLead(null)
  }

  const updateForm = (field: keyof LeadForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const saveLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await request<Lead>(
        editingLead ? `${API_URL}/${editingLead.id}` : API_URL,
        {
          method: editingLead ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      )
      closeForm()
      setNotice(editingLead ? 'Đã cập nhật thông tin lead.' : 'Đã thêm lead mới.')
      if (page !== 0) setPage(0)
      else await refreshLeads()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể lưu lead.')
    } finally {
      setSaving(false)
    }
  }

  const refreshLeads = async () => {
    const params = new URLSearchParams({
      search,
      page: String(page),
    })
    if (status) params.set('status', status)
    try {
      const data = await request<LeadPage>(`${API_URL}?${params.toString()}`)
      setLeads(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải danh sách lead.')
    }
  }

  const enrollLead = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Chuyển ${lead.fullName} thành học viên? Hệ thống sẽ tạo tài khoản và gửi email kích hoạt.`,
    )
    if (!confirmed) return

    setSaving(true)
    setError('')
    setNotice('')
    try {
      const result = await request<Enrollment>(`${API_URL}/${lead.id}/enroll`, {
        method: 'POST',
      })
      setNotice(
        `${result.message} Mã học viên: ${result.studentCode} · Tài khoản: ${result.username} · Email: ${result.email}`,
      )
      await refreshLeads()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể chuyển lead thành học viên.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="admissions">
      <header className="admissions-header">
        <div>
          <span className="eyebrow">TUYỂN SINH & GHI DANH</span>
          <h1>Phiếu chăm sóc học viên</h1>
          <p>Theo dõi lead từ lúc tiếp nhận đến khi nhập học chính thức.</p>
        </div>
        <button className="admissions-primary" onClick={openCreateForm}>
          + Thêm lead
        </button>
      </header>

      <section className="admissions-summary" aria-label="Tổng quan lead">
        <div className="summary-icon">◎</div>
        <div>
          <strong>{totalElements}</strong>
          <span>Lead trong danh sách</span>
        </div>
        <p>Thông tin từ tư vấn được lưu tập trung, không cần nhập lại khi ghi danh.</p>
      </section>

      {error && <div className="admissions-alert error">{error}</div>}
      {notice && <div className="admissions-alert success">{notice}</div>}

      <section className="lead-panel">
        <div className="lead-panel-heading">
          <div>
            <h2>Danh sách lead</h2>
            <p>Tìm kiếm, cập nhật trạng thái và chuyển lead đã chốt thành học viên.</p>
          </div>
        </div>

        <div className="lead-filters">
          <label className="lead-search">
            <span>Tìm kiếm</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(0)
                setLoading(true)
              }}
              placeholder="Tên, email hoặc số điện thoại"
            />
          </label>
          <label>
            <span>Trạng thái</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(0)
                setLoading(true)
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {leadStatuses.map((item) => (
                <option key={item} value={item}>{statusLabels[item]}</option>
              ))}
            </select>
          </label>
          <button
            className="lead-reset"
            onClick={() => {
              setSearch('')
              setStatus('')
              setPage(0)
              setLoading(true)
            }}
          >
            Đặt lại
          </button>
        </div>

        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Khóa học quan tâm</th>
                <th>Nguồn</th>
                <th>Trạng thái</th>
                <th>Mã học viên</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="lead-empty">Đang tải dữ liệu...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="lead-empty">Chưa có lead phù hợp.</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong className="lead-name">{lead.fullName}</strong>
                    <span className="lead-contact">{lead.email}</span>
                    {lead.phone && <span className="lead-contact">{lead.phone}</span>}
                  </td>
                  <td>{lead.courseInterest || '—'}</td>
                  <td>{lead.source || '—'}</td>
                  <td>
                    <span className={`lead-status status-${lead.status.toLowerCase()}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                  <td>{lead.studentCode || '—'}</td>
                  <td>
                    <div className="lead-actions">
                      {lead.status !== 'ENROLLED' && (
                        <button className="lead-edit" onClick={() => openEditForm(lead)}>
                          Cập nhật
                        </button>
                      )}
                      {lead.status === 'CLOSED_WON' && (
                        <button
                          className="lead-enroll"
                          disabled={saving}
                          onClick={() => void enrollLead(lead)}
                        >
                          Nhập học
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lead-pagination">
          <span>{totalElements} lead</span>
          <div>
            <button disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
              ← Trước
            </button>
            <span>Trang {page + 1} / {Math.max(totalPages, 1)}</span>
            <button
              disabled={totalPages === 0 || page >= totalPages - 1}
              onClick={() => setPage((current) => current + 1)}
            >
              Sau →
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="admissions-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm()
        }}>
          <section className="admissions-modal" role="dialog" aria-modal="true" aria-labelledby="lead-form-title">
            <header>
              <div>
                <h2 id="lead-form-title">{editingLead ? 'Cập nhật lead' : 'Tiếp nhận lead mới'}</h2>
                <p>Thông tin được dùng để tạo hồ sơ học viên khi lead chốt nhập học.</p>
              </div>
              <button type="button" className="modal-close" aria-label="Đóng" onClick={closeForm}>×</button>
            </header>
            <form onSubmit={(event) => void saveLead(event)}>
              <div className="lead-form-grid">
                <label>
                  Họ và tên *
                  <input required maxLength={120} value={form.fullName} onChange={(event) => updateForm('fullName', event.target.value)} />
                </label>
                <label>
                  Email *
                  <input required type="email" maxLength={254} value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
                </label>
                <label>
                  Số điện thoại
                  <input type="tel" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
                </label>
                <label>
                  Khóa học quan tâm
                  <input value={form.courseInterest} onChange={(event) => updateForm('courseInterest', event.target.value)} />
                </label>
                <label>
                  Nguồn lead
                  <input value={form.source} onChange={(event) => updateForm('source', event.target.value)} />
                </label>
                <label>
                  Trạng thái
                  <select
                    value={form.status}
                    onChange={(event) => updateForm('status', event.target.value)}
                    disabled={editingLead?.status === 'ENROLLED'}
                  >
                    {leadStatuses.filter((item) => item !== 'ENROLLED').map((item) => (
                      <option key={item} value={item}>{statusLabels[item]}</option>
                    ))}
                  </select>
                </label>
                <label className="lead-notes">
                  Ghi chú tư vấn
                  <textarea rows={3} value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} />
                </label>
              </div>
              <footer>
                <button type="button" className="lead-reset" onClick={closeForm}>Hủy</button>
                <button type="submit" className="admissions-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : editingLead ? 'Lưu thay đổi' : 'Lưu lead'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default Admissions
