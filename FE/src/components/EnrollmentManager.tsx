import { useEffect, useState } from 'react'
import './EnrollmentManager.css'

type Student = { id: number; name: string; email: string }
type Entry = { id: number; studentId: number; studentName: string; enrolledAt: string; enrolledBy: number }
type Capacity = { classId: number; maxStudents: number | null; enrolledCount: number }
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

/** Test integration using HTTP Basic. Never store passwords in localStorage. */
export function EnrollmentManager() {
  const [classId, setClassId] = useState('')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [max, setMax] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [enrolled, setEnrolled] = useState<Entry[]>([])
  const [capacity, setCapacity] = useState<Capacity | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function basicAuth() {
    const bytes = new TextEncoder().encode(`${username}:${password}`)
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return `Basic ${btoa(binary)}`
  }

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!username || !password) throw new Error('Hãy nhập tên đăng nhập và mật khẩu demo.')
    const headers = new Headers(init.headers)
    headers.set('Authorization', basicAuth())
    const response = await fetch(API + path, { ...init, headers })
    if (!response.ok) {
      if (response.status === 401) throw new Error('HTTP 401: Sai tài khoản/mật khẩu hoặc chưa cấu hình Backend.')
      if (response.status === 403) throw new Error('HTTP 403: Tài khoản không có quyền ghi danh.')
      const raw = await response.text()
      let detail = raw
      try {
        const parsed = JSON.parse(raw)
        detail = parsed.detail || parsed.message || parsed.error || raw
      } catch { /* keep raw server message */ }
      throw new Error(`HTTP ${response.status}: ${detail}`)
    }
    return response.json() as Promise<T>
  }

  async function refresh(id = classId) {
    if (!/^[1-9]\d*$/.test(id)) { setMessage('Nhập mã lớp hợp lệ.'); return }
    try {
      setBusy(true)
      setMessage('')
      const [s, e, c] = await Promise.all([
        request<Student[]>('/enrollments/students'),
        request<Entry[]>(`/classes/${id}/enrollments`),
        request<Capacity>(`/classes/${id}/capacity`)
      ])
      setStudents(s)
      setEnrolled(e)
      setCapacity(c)
      setMax(c.maxStudents?.toString() ?? '')
      setSelected([])
    } catch (error) { setMessage(String(error)) }
    finally { setBusy(false) }
  }

  useEffect(() => {
    setSelected([])
    setEnrolled([])
    setCapacity(null)
    setStudents([])
  }, [classId, username, password])

  async function submit() {
    if (!selected.length || !classId) { setMessage('Chọn lớp và ít nhất một học viên.'); return }
    const count = selected.length
    try {
      setBusy(true)
      setMessage('')
      await request('/enrollments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: Number(classId), studentIds: selected })
      })
      await refresh()
      setMessage(`Đã ghi danh ${count} học viên thành công.`)
    } catch (error) { setMessage(String(error)) }
    finally { setBusy(false) }
  }

  async function saveCapacity() {
    if (!/^[1-9]\d*$/.test(classId) || !/^[1-9]\d*$/.test(max)) {
      setMessage('Mã lớp và sĩ số phải là số nguyên dương.')
      return
    }
    try {
      setBusy(true)
      setMessage('')
      await request(`/classes/${classId}/capacity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxStudents: Number(max) })
      })
      await refresh()
      setMessage('Đã cập nhật sĩ số.')
    } catch (error) { setMessage(String(error)) }
    finally { setBusy(false) }
  }

  const enrolledIds = new Set(enrolled.map(e => e.studentId))
  const eligible = students.filter(s => !enrolledIds.has(s.id) &&
    `${s.name} ${s.email} ${s.id}`.toLowerCase().includes(query.toLowerCase()))

  return <section className="enrollment-manager">
    <h2>Ghi danh học viên vào lớp</h2>
    <div className="enrollment-controls">
      <label>Mã lớp
        <input type="number" min="1" value={classId} onChange={e => setClassId(e.target.value)} />
      </label>
      <label>Tài khoản quản lý (demo)
        <input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} />
      </label>
      <label>Mật khẩu demo
        <input type="password" autoComplete="current-password" value={password}
          onChange={e => setPassword(e.target.value)} />
      </label>
      <button disabled={busy} onClick={() => refresh()}>Tải dữ liệu lớp</button>
      <label>Sĩ số tối đa
        <input type="number" min="1" value={max} onChange={e => setMax(e.target.value)} />
      </label>
      <button disabled={busy} onClick={saveCapacity}>Lưu sĩ số</button>
    </div>
    {message && <p role="status">{message}</p>}
    {capacity && <p>Sĩ số: <strong>{capacity.enrolledCount} / {capacity.maxStudents ?? 'Chưa đặt'}</strong></p>}
    <div className="enrollment-panels">
      <div>
        <h3>Chọn học viên ({selected.length})</h3>
        <input aria-label="Tìm học viên" placeholder="Tìm theo tên, email hoặc ID"
          value={query} onChange={e => setQuery(e.target.value)} />
        <button disabled={busy || !eligible.length} onClick={() => setSelected(eligible.map(x => x.id))}>
          Chọn tất cả kết quả
        </button>
        <button disabled={busy} onClick={() => setSelected([])}>Bỏ chọn</button>
        <ul>{eligible.map(s => <li key={s.id}><label>
          <input type="checkbox" checked={selected.includes(s.id)}
            onChange={() => setSelected(curr => curr.includes(s.id) ? curr.filter(x => x !== s.id) : [...curr, s.id])} />
          {' '}{s.name} (#{s.id}) — {s.email}
        </label></li>)}</ul>
        <button disabled={busy || !capacity?.maxStudents || selected.length === 0 ||
          (capacity.enrolledCount + selected.length > capacity.maxStudents)} onClick={submit}>
          Ghi danh {selected.length} học viên
        </button>
      </div>
      <div>
        <h3>Đã ghi danh ({enrolled.length})</h3>
        <ul>{enrolled.map(e => <li key={e.id}>{e.studentName} (#{e.studentId}) —
          {' '}{new Date(e.enrolledAt).toLocaleString('vi-VN')}</li>)}</ul>
      </div>
    </div>
    <small>Chế độ thử nghiệm: HTTP Basic trên localhost. Tích hợp xác thực thật của nhóm và HTTPS trước khi triển khai.</small>
  </section>
}
