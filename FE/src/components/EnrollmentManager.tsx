import { useEffect, useState } from 'react'
import './EnrollmentManager.css'

type Student = { id: number; name: string; email: string }
type Entry = { id: number; studentId: number; studentName: string; enrolledAt: string; enrolledBy: number }
type Capacity = { classId: number; maxStudents: number | null; enrolledCount: number }
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

/** Independent component: import and render <EnrollmentManager /> inside the team's App. */
export function EnrollmentManager() {
  const [classId,setClassId] = useState('')
  const [actorId,setActorId] = useState('')
  const [max,setMax] = useState('')
  const [students,setStudents] = useState<Student[]>([])
  const [enrolled,setEnrolled] = useState<Entry[]>([])
  const [capacity,setCapacity] = useState<Capacity|null>(null)
  const [selected,setSelected] = useState<number[]>([])
  const [query,setQuery] = useState('')
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)

  async function request<T>(path:string, init?:RequestInit):Promise<T> {
    const response=await fetch(API+path,init)
    if(!response.ok) {
      const body=await response.text()
      throw new Error(body || `HTTP ${response.status}`)
    }
    return response.json()
  }
  async function refresh(id=classId) {
    if(!id || !Number.isInteger(Number(id)) || Number(id)<1) {setMessage('Nhập mã lớp hợp lệ');return}
    try {
      setBusy(true);setMessage('')
      const [s,e,c]=await Promise.all([
        request<Student[]>('/enrollments/students'),
        request<Entry[]>(`/classes/${id}/enrollments`),
        request<Capacity>(`/classes/${id}/capacity`)
      ])
      setStudents(s);setEnrolled(e);setCapacity(c);setMax(c.maxStudents?.toString()||'');setSelected([])
    } catch (error) { setMessage(String(error)) } finally { setBusy(false) }
  }
  // Deliberately no API calls until an explicit class is selected.
  useEffect(()=>{ setSelected([]);setEnrolled([]);setCapacity(null) },[classId])
  async function submit() {
    if(selected.length===0 || !classId || !actorId) {setMessage('Chọn lớp, người thực hiện và học viên');return}
    try {
      setBusy(true);setMessage('')
      await request('/enrollments/bulk',{
        method:'POST',headers:{'Content-Type':'application/json','X-Actor-Id':actorId},
        body:JSON.stringify({classId:Number(classId),studentIds:selected})
      })
      await refresh();setMessage(`Đã ghi danh ${selected.length} học viên thành công`)
    } catch(error) {setMessage(String(error))} finally {setBusy(false)}
  }
  async function saveCapacity() {
    if(!actorId || !classId || Number(max)<1) {setMessage('Nhập lớp, mã người thực hiện và sĩ số hợp lệ');return}
    try {
      setBusy(true);setMessage('')
      await request(`/classes/${classId}/capacity`,{
        method:'PUT',headers:{'Content-Type':'application/json','X-Actor-Id':actorId},
        body:JSON.stringify({maxStudents:Number(max)})
      });await refresh();setMessage('Đã cập nhật sĩ số')
    } catch(error) {setMessage(String(error))} finally {setBusy(false)}
  }
  const enrolledIds=new Set(enrolled.map(e=>e.studentId))
  const eligible=students.filter(s=>!enrolledIds.has(s.id) && `${s.name} ${s.email} ${s.id}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="enrollment-manager">
    <h2>Ghi danh học viên vào lớp</h2>
    <div className="enrollment-controls">
      <label>Mã lớp<input value={classId} type="number" min="1" onChange={e=>setClassId(e.target.value)}/></label>
      <label>Mã người thực hiện (demo)<input value={actorId} type="number" min="1" onChange={e=>setActorId(e.target.value)}/></label>
      <button disabled={busy} onClick={()=>refresh()}>Tải dữ liệu lớp</button>
      <label>Sĩ số tối đa<input value={max} type="number" min="1" onChange={e=>setMax(e.target.value)}/></label>
      <button disabled={busy} onClick={saveCapacity}>Lưu sĩ số</button>
    </div>
    {message && <p role="status">{message}</p>}
    {capacity && <p>Sĩ số: <strong>{capacity.enrolledCount} / {capacity.maxStudents ?? 'Chưa đặt'}</strong></p>}
    <div className="enrollment-panels">
      <div>
        <h3>Chọn học viên ({selected.length})</h3>
        <input aria-label="Tìm học viên" placeholder="Tìm theo tên, email hoặc ID" value={query} onChange={e=>setQuery(e.target.value)}/>
        <button disabled={busy || eligible.length===0} onClick={()=>setSelected(eligible.map(x=>x.id))}>Chọn tất cả kết quả</button>
        <button disabled={busy} onClick={()=>setSelected([])}>Bỏ chọn</button>
        <ul>{eligible.map(s=><li key={s.id}><label><input type="checkbox" checked={selected.includes(s.id)} onChange={()=>setSelected(cur=>cur.includes(s.id)?cur.filter(x=>x!==s.id):[...cur,s.id])}/> {s.name} (#{s.id}) — {s.email}</label></li>)}</ul>
        <button disabled={busy || !capacity?.maxStudents || selected.length===0} onClick={submit}>Ghi danh {selected.length} học viên</button>
      </div>
      <div><h3>Đã ghi danh ({enrolled.length})</h3>
        <ul>{enrolled.map(e=><li key={e.id}>{e.studentName} (#{e.studentId}) — {new Date(e.enrolledAt).toLocaleString('vi-VN')}</li>)}</ul>
      </div>
    </div>
    <small>Chế độ demo: X-Actor-Id phải được thay bằng danh tính đăng nhập trước khi triển khai thật.</small>
  </section>
}
