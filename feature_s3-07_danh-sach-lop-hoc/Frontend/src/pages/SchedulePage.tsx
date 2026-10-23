import React, { useState, useEffect, useCallback } from 'react'
import {
  getSchedulesApi,
  generateScheduleApi,
  markAttendanceApi,
  ScheduleItem,
  ClassItem,
} from '../api/academicApi'
import { extractApiError } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { getUsersApi } from '../api/usersApi'
import {
  Calendar as CalendarIcon,
  Sparkles,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter
} from 'lucide-react'

const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const SHIFTS = [
  'Ca sáng (08:00 - 11:30)',
  'Ca chiều (13:30 - 17:00)',
  'Ca tối (18:00 - 21:30)',
]

export default function SchedulePage() {
  const { user } = useAuthStore()
  const isTeacherOrManager = user?.roles.some((r) =>
    ['ADMIN', 'TRAINING_MANAGER', 'TEACHER', 'ASSISTANT'].includes(r)
  )

  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modal tự động sinh lịch học
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [genClassId, setGenClassId] = useState('')
  const [genStartDate, setGenStartDate] = useState('2026-10-05')
  const [genDays, setGenDays] = useState<string[]>(['Thứ 2', 'Thứ 4', 'Thứ 6'])
  const [genShift, setGenShift] = useState(SHIFTS[0])
  const [genRoom, setGenRoom] = useState('Phòng Lab A2-301')
  const [genSessions, setGenSessions] = useState(15)
  const [genWarnings, setGenWarnings] = useState<string[]>([])
  const [genSubmitting, setGenSubmitting] = useState(false)

  // Modal điểm danh (S4-07)
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false)
  const [activeSession, setActiveSession] = useState<ScheduleItem | null>(null)
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({})
  const [savingAttendance, setSavingAttendance] = useState(false)

  // Danh sách sinh viên thực tế trong hệ thống
  const [students, setStudents] = useState<Array<{ id: string; name: string; email: string }>>([])

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await getUsersApi({ limit: 100 })
        const mapped = res.data.map((u) => ({ id: u.id, name: u.fullName, email: u.email }))
        setStudents(mapped)
      } catch (err) {
        console.error(err)
      }
    }
    loadStudents()
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSchedulesApi({ classId: selectedClassId || undefined })
      setSchedules(res.data)
      setClasses(res.classes)
      if (res.classes.length > 0 && !genClassId) {
        setGenClassId(res.classes[0].id)
      }
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setLoading(false)
    }
  }, [selectedClassId, genClassId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Xử lý sinh lịch tự động (S4-01 -> S4-04)
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenSubmitting(true)
    setGenWarnings([])
    try {
      const res = await generateScheduleApi({
        classId: genClassId,
        startDate: genStartDate,
        daysOfWeek: genDays,
        shift: genShift,
        room: genRoom,
        totalSessions: genSessions,
      })
      setFeedback({ type: 'success', message: res.message })
      if (res.conflictWarnings && res.conflictWarnings.length > 0) {
        setGenWarnings(res.conflictWarnings)
      } else {
        setGeneratorOpen(false)
      }
      loadData()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setGenSubmitting(false)
    }
  }

  // Mở modal điểm danh
  const openAttendance = (session: ScheduleItem) => {
    setActiveSession(session)
    const initial: Record<string, string> = {}
    const studentList = students.length > 0 ? students : (user ? [{ id: user.id, name: user.fullName, email: user.email }] : [])
    studentList.forEach((st) => {
      initial[st.id] = session.attendanceRecords?.[st.id] || 'PRESENT'
    })
    setAttendanceData(initial)
    setAttendanceModalOpen(true)
  }

  // Lưu điểm danh (S4-07)
  const handleSaveAttendance = async () => {
    if (!activeSession) return
    setSavingAttendance(true)
    try {
      await markAttendanceApi(activeSession.id, attendanceData)
      setFeedback({ type: 'success', message: `Đã lưu kết quả điểm danh cho buổi ${activeSession.sessionNumber}!` })
      setAttendanceModalOpen(false)
      loadData()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setSavingAttendance(false)
    }
  }

  // Đánh dấu tất cả có mặt
  const markAllPresent = () => {
    const updated: Record<string, string> = {}
    const studentList = students.length > 0 ? students : (user ? [{ id: user.id, name: user.fullName, email: user.email }] : [])
    studentList.forEach((st) => {
      updated[st.id] = 'PRESENT'
    })
    setAttendanceData(updated)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Học kỳ I · Năm học 2026 - 2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Thời Khóa Biểu & Lịch Học Trực Quan
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Hệ thống tự động xếp lịch, kiểm tra trùng phòng/giảng viên và hỗ trợ điểm danh &lt; 60 giây (Sprint 4)
          </p>
        </div>

        {isTeacherOrManager && (
          <button
            onClick={() => {
              setGenWarnings([])
              setGeneratorOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Tự Động Sinh Thời Khóa Biểu</span>
          </button>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and View Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">Lọc theo lớp học:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Tổng cộng: <strong className="text-gray-900">{schedules.length}</strong> buổi học trong lịch
        </div>
      </div>

      {/* Timetable Grid View (Chuẩn trường học) */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Lịch Học Chi Tiết Các Buổi</span>
          </h3>
          <span className="text-[11px] text-gray-400">Bấm vào buổi học để xem chi tiết hoặc điểm danh</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
            Đang tải dữ liệu thời khóa biểu...
          </div>
        ) : schedules.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Chưa có lịch học nào cho lớp được chọn. Hãy bấm "Tự Động Sinh Thời Khóa Biểu" để tạo lịch!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {schedules.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-indigo-50/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Date & Session */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-900 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-indigo-500">{item.dayOfWeek}</span>
                    <span className="text-base font-black leading-none mt-0.5">
                      {item.date.split('-')[2]}
                    </span>
                    <span className="text-[9px] text-indigo-400">Thg {item.date.split('-')[1]}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-md">
                        Buổi {item.sessionNumber}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">{item.className}</span>
                      {item.hasConflict && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Trùng lịch
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-800">{item.topic}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                      <span className="flex items-center gap-1 text-indigo-600 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {item.shift}
                      </span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {item.room}
                      </span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {item.teacherName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Attendance Status & Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {item.attendanceMarked ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã điểm danh
                      </span>
                      {item.attendanceStats && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          Có mặt: {item.attendanceStats.present} · Muộn: {item.attendanceStats.late} · Vắng: {item.attendanceStats.unexcused}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
                      Chưa điểm danh
                    </span>
                  )}

                  {isTeacherOrManager && (
                    <button
                      onClick={() => openAttendance(item)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>{item.attendanceMarked ? 'Sửa điểm danh' : 'Điểm danh'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Tự Động Sinh Thời Khóa Biểu (S4-01 & S4-02) */}
      {generatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-indigo-50/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Công Cụ Sinh Lịch Học Tự Động (S4-01)
                </h3>
              </div>
              <button
                onClick={() => setGeneratorOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-4 text-xs">
              {genWarnings.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-xs text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    Cảnh báo trùng lịch phát hiện được (S4-02):
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    {genWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Chọn lớp học <span className="text-red-500">*</span>
                </label>
                <select
                  value={genClassId}
                  onChange={(e) => setGenClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={genStartDate}
                    onChange={(e) => setGenStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Số buổi đào tạo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={genSessions}
                    onChange={(e) => setGenSessions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1.5">
                  Lặp lại vào các thứ trong tuần <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const checked = genDays.includes(day)
                    return (
                      <label
                        key={day}
                        className={`flex items-center justify-center p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          checked ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) setGenDays([...genDays, day])
                            else setGenDays(genDays.filter((d) => d !== day))
                          }}
                          className="sr-only"
                        />
                        <span>{day}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Khung ca học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={genShift}
                    onChange={(e) => setGenShift(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {SHIFTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Phòng học vật lý <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={genRoom}
                    onChange={(e) => setGenRoom(e.target.value)}
                    placeholder="Ví dụ: Phòng Lab A2-301"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGeneratorOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={genSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {genSubmitting ? 'Đang tính toán...' : 'Sinh lịch ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Điểm Danh Buổi Học (S4-07) */}
      {attendanceModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Điểm danh Buổi {activeSession.sessionNumber} · {activeSession.className}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {activeSession.date} · {activeSession.shift} · {activeSession.room}
                </p>
              </div>
              <button
                onClick={() => setAttendanceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">
                  Danh sách học viên ({students.length > 0 ? students.length : (user ? 1 : 0)})
                </span>
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px] transition-colors"
                >
                  ✓ Đánh dấu tất cả có mặt
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(students.length > 0 ? students : (user ? [{ id: user.id, name: user.fullName, email: user.email }] : [])).map((st) => {
                  const currentStatus = attendanceData[st.id] || 'PRESENT'
                  return (
                    <div
                      key={st.id}
                      className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{st.name}</p>
                        <p className="text-[10px] text-gray-400">{st.email}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        {[
                          { val: 'PRESENT', label: 'Có mặt', color: 'bg-emerald-600 text-white' },
                          { val: 'LATE', label: 'Muộn', color: 'bg-amber-500 text-white' },
                          { val: 'EXCUSED', label: 'Có phép', color: 'bg-purple-600 text-white' },
                          { val: 'UNEXCUSED', label: 'Vắng', color: 'bg-rose-600 text-white' },
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            type="button"
                            onClick={() => setAttendanceData({ ...attendanceData, [st.id]: btn.val })}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              currentStatus === btn.val
                                ? btn.color
                                : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAttendanceModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {savingAttendance ? 'Đang lưu...' : 'Lưu kết quả điểm danh'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
