
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import './App.css'

type LessonSession = {
  id: number
  subjectId: number
  sessionNumber: number
  topic: string
  objectives: string
}

type SessionForm = {
  sessionNumber: string
  topic: string
  objectives: string
}

type FormMode = 'create' | 'edit' | null

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

const emptyForm: SessionForm = {
  sessionNumber: '1',
  topic: '',
  objectives: '',
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    if (!error.response) {
      return 'Khong ket noi duoc Backend. Kiem tra Spring Boot cong 8080.'
    }

    if (status === 400) {
      return 'HTTP 400: Du lieu khong hop le hoac vuot gioi han so buoi.'
    }

    if (status === 404) {
      return 'HTTP 404: Mon hoc hoac buoi hoc khong ton tai.'
    }

    if (status === 409) {
      return 'HTTP 409: So thu tu buoi hoc bi trung.'
    }

    return `Loi Backend: HTTP ${status}`
  }

  return 'Da xay ra loi khong xac dinh.'
}

function App() {
  const [subjectInput, setSubjectInput] = useState('1')
  const [activeSubjectId, setActiveSubjectId] = useState(1)

  const [sessions, setSessions] = useState<LessonSession[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SessionForm>(emptyForm)

  const [sourceSubjectId, setSourceSubjectId] = useState('1')

  // GET: Lay danh sach buoi hoc
  const loadSessions = useCallback(async (subjectId: number) => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get<LessonSession[]>(
        `/subjects/${subjectId}/sessions`
      )

      setSessions(response.data)
    } catch (err) {
      setSessions([])
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSessions(activeSubjectId)
  }, [activeSubjectId, loadSessions])

  // Chon mon hoc can quan ly
  function handleSelectSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const id = Number(subjectInput)

    if (!Number.isSafeInteger(id) || id < 1) {
      setError('ID mon hoc phai la so nguyen duong.')
      return
    }

    setNotice('')
    setFormMode(null)

    if (id === activeSubjectId) {
      void loadSessions(id)
    } else {
      setActiveSubjectId(id)
    }
  }

  // Mo form them buoi hoc
  function openCreateForm() {
    const usedNumbers = new Set(
      sessions.map((session) => session.sessionNumber)
    )

    let nextNumber = 1
    while (usedNumbers.has(nextNumber)) {
      nextNumber++
    }

    setForm({
      ...emptyForm,
      sessionNumber: String(nextNumber),
    })

    setEditingId(null)
    setFormMode('create')
    setError('')
    setNotice('')
  }

  // Mo form sua buoi hoc
  function openEditForm(session: LessonSession) {
    setForm({
      sessionNumber: String(session.sessionNumber),
      topic: session.topic,
      objectives: session.objectives,
    })

    setEditingId(session.id)
    setFormMode('edit')
    setError('')
    setNotice('')
  }

  // POST hoac PUT
  async function handleSaveSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sessionNumber = Number(form.sessionNumber)
    const topic = form.topic.trim()
    const objectives = form.objectives.trim()

    if (
      !Number.isSafeInteger(sessionNumber) ||
      sessionNumber < 1 ||
      topic.length === 0 ||
      topic.length > 255 ||
      objectives.length === 0
    ) {
      setError('Vui long nhap so buoi, chu de va muc tieu hop le.')
      return
    }

    const payload = {
      sessionNumber,
      topic,
      objectives,
    }

    setBusy(true)
    setError('')

    try {
      if (formMode === 'edit' && editingId !== null) {
        await api.put(`/sessions/${editingId}`, payload)
        setNotice('Cap nhat buoi hoc thanh cong.')
      } else {
        await api.post(
          `/subjects/${activeSubjectId}/sessions`,
          payload
        )
        setNotice('Them buoi hoc thanh cong.')
      }

      setFormMode(null)
      await loadSessions(activeSubjectId)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  // DELETE: Xoa buoi hoc
  async function handleDelete(session: LessonSession) {
    const confirmed = window.confirm(
      `Ban co chac muon xoa buoi ${session.sessionNumber}: ${session.topic}?`
    )

    if (!confirmed) return

    setBusy(true)
    setError('')
    setNotice('')

    try {
      await api.delete(`/sessions/${session.id}`)
      setNotice(`Da xoa buoi hoc so ${session.sessionNumber}.`)
      await loadSessions(activeSubjectId)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  // KNJ-66: Nhan ban danh sach buoi hoc
  async function handleCopy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sourceId = Number(sourceSubjectId)

    if (!Number.isSafeInteger(sourceId) || sourceId < 1) {
      setError('ID mon nguon khong hop le.')
      return
    }

    if (sourceId === activeSubjectId) {
      setError('Khong the nhan ban vao chinh mon hoc do.')
      return
    }

    setBusy(true)
    setError('')
    setNotice('')

    try {
      const response = await api.post<LessonSession[]>(
        `/subjects/${activeSubjectId}/sessions/copy`,
        { sourceSubjectId: sourceId }
      )

      setNotice(
        `Da nhan ban ${response.data.length} buoi hoc thanh cong.`
      )

      await loadSessions(activeSubjectId)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">KNJ</div>
          <div>
            <strong>Training Management</strong>
            <span>He thong quan ly dao tao</span>
          </div>
        </div>
        <span className="demo-tag">KNJ-48 Demo</span>
      </header>

      <main className="page">
        <section className="page-header">
          <div>
            <p className="eyebrow">QUAN LY CHUONG TRINH DAO TAO</p>
            <h1>Quản lý buổi học</h1>
            <p className="subtitle">
              Xem, thêm, chỉnh sửa, xóa và nhân bản danh sách
              buổi học theo từng môn.
            </p>
          </div>
          <div className="subject-indicator">
            <span>Môn học đang quản lý</span>
            <strong>#{activeSubjectId}</strong>
          </div>
        </section>

        <div className="content-grid">
          <section className="panel main-panel">
            <div className="panel-heading">
              <div>
                <h2>Danh sách buổi học</h2>
                <p>Quản lý nội dung và mục tiêu từng buổi.</p>
              </div>

              <button
                className="btn btn-primary"
                onClick={openCreateForm}
                disabled={busy}
              >
                + Thêm buổi học
              </button>
            </div>

            <form className="subject-filter" onSubmit={handleSelectSubject}>
              <label htmlFor="subjectId">ID môn học</label>
              <input
                id="subjectId"
                type="number"
                min="1"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                required
              />
              <button className="btn btn-secondary" type="submit">
                Xem danh sách
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => void loadSessions(activeSubjectId)}
              >
                Làm mới
              </button>
            </form>

            <div className="statistics">
              <div className="stat-card">
                <span>Tổng buổi đã tạo</span>
                <strong>{sessions.length}</strong>
              </div>
              <div className="stat-card">
                <span>ID môn học</span>
                <strong>{activeSubjectId}</strong>
              </div>
              <div className="stat-card">
                <span>Trạng thái</span>
                <strong className="stat-text">
                  {loading ? 'Đang tải' : 'Sẵn sàng'}
                </strong>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            {notice && (
              <div className="alert alert-success" role="status">
                {notice}
              </div>
            )}

            <div className="table-wrapper">
              <table className="session-table">
                <thead>
                  <tr>
                    <th>Buổi</th>
                    <th>Chủ đề</th>
                    <th>Mục tiêu</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <span className="session-number">
                          {session.sessionNumber}
                        </span>
                      </td>
                      <td className="topic-cell">{session.topic}</td>
                      <td className="objective-cell">
                        {session.objectives}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn btn-small btn-secondary"
                            onClick={() => openEditForm(session)}
                            disabled={busy}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => void handleDelete(session)}
                            disabled={busy}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && sessions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>Chưa có buổi học</h3>
                  <p>
                    Hãy thêm buổi học mới hoặc nhân bản từ môn khác.
                  </p>
                </div>
              )}

              {loading && (
                <div className="empty-state">
                  Đang tải danh sách buổi học...
                </div>
              )}
            </div>
          </section>

          <aside className="sidebar">
            <section className="panel side-panel">
              <div className="side-icon">⇄</div>
              <h2>Nhân bản buổi học</h2>
              <p>
                Sao chép toàn bộ buổi học của môn nguồn sang
                môn đang quản lý.
              </p>

              <form onSubmit={handleCopy} className="copy-form">
                <label htmlFor="copySource">ID môn nguồn</label>
                <input
                  id="copySource"
                  type="number"
                  min="1"
                  value={sourceSubjectId}
                  onChange={(e) => setSourceSubjectId(e.target.value)}
                  required
                />

                <label>Môn đích</label>
                <div className="destination">
                  Môn học #{activeSubjectId}
                </div>

                <button
                  className="btn btn-primary btn-full"
                  type="submit"
                  disabled={busy || loading}
                >
                  {busy ? 'Đang xử lý...' : 'Nhân bản danh sách'}
                </button>
              </form>
            </section>

            <section className="panel help-panel">
              <h2>Quy tắc quản lý</h2>
              <p>Hệ thống tự động kiểm tra:</p>
              <ul>
                <li>Không trùng số thứ tự buổi học.</li>
                <li>Không vượt số buổi của môn.</li>
                <li>Không nhân bản vào chính môn nguồn.</li>
                <li>Không nhân bản một phần khi có lỗi.</li>
              </ul>
              <p className="help-note">
                Giới hạn số buổi được kiểm tra tại Backend.
              </p>
            </section>
          </aside>
        </div>
      </main>

      {formMode && (
        <div className="modal-overlay">
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>
                  {formMode === 'create'
                    ? 'Thêm buổi học'
                    : 'Chỉnh sửa buổi học'}
                </h2>
                <p>Môn học #{activeSubjectId}</p>
              </div>
              <button
                className="close-button"
                onClick={() => setFormMode(null)}
                type="button"
                disabled={busy}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <form onSubmit={(event) => void handleSaveSession(event)}>
              <div className="form-field">
                <label htmlFor="sessionNumber">Số thứ tự buổi học</label>
                <input
                  id="sessionNumber"
                  type="number"
                  min="1"
                  value={form.sessionNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sessionNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="topic">Chủ đề buổi học</label>
                <input
                  id="topic"
                  type="text"
                  maxLength={255}
                  placeholder="Ví dụ: Lập trình hướng đối tượng"
                  value={form.topic}
                  onChange={(e) =>
                    setForm({ ...form, topic: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="objectives">Mục tiêu buổi học</label>
                <textarea
                  id="objectives"
                  rows={4}
                  placeholder="Nhập mục tiêu và kiến thức cần đạt..."
                  value={form.objectives}
                  onChange={(e) =>
                    setForm({ ...form, objectives: e.target.value })
                  }
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFormMode(null)}
                  disabled={busy}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy}
                >
                  {busy ? 'Đang lưu...' : 'Lưu buổi học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
