import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  getClassGradebookApi,
  updateGradeApi,
  getStudentTranscriptApi,
  GradeItem,
  TranscriptData,
  ClassItem,
  getAcademicDataApi
} from '../api/academicApi'
import {
  Award,
  GraduationCap,
  Save,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  X
} from 'lucide-react'

export default function GradebookPage() {
  const { user } = useAuthStore()
  const isTeacherOrAdmin = user?.roles.some(r => ['TEACHER', 'TRAINING_MANAGER', 'ADMIN'].includes(r))
  const isStudent = user?.roles.includes('STUDENT')

  const [activeTab, setActiveTab] = useState<'transcript' | 'gradebook'>(
    isStudent && !isTeacherOrAdmin ? 'transcript' : 'gradebook'
  )

  // Sổ điểm lớp học phần
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [gradebook, setGradebook] = useState<GradeItem[]>([])
  const [loadingGradebook, setLoadingGradebook] = useState(false)
  const [editGrades, setEditGrades] = useState<Record<string, { attendance: number; midterm: number; finalExam: number }>>({})
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  // Bảng điểm cá nhân (Transcript)
  const [transcript, setTranscript] = useState<TranscriptData | null>(null)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Tải danh sách lớp
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await getAcademicDataApi()
        setClasses(res.classes)
        if (res.classes.length > 0) {
          setSelectedClassId(res.classes[0].id)
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách lớp:', err)
      }
    }
    loadClasses()
  }, [])

  // Tải sổ điểm khi đổi lớp
  useEffect(() => {
    if (!selectedClassId) return
    async function loadGradebook() {
      setLoadingGradebook(true)
      try {
        const res = await getClassGradebookApi(selectedClassId)
        setGradebook(res.data)
        // Khởi tạo state edit
        const map: Record<string, { attendance: number; midterm: number; finalExam: number }> = {}
        res.data.forEach(item => {
          map[item.studentId] = {
            attendance: item.attendance,
            midterm: item.midterm,
            finalExam: item.finalExam,
          }
        })
        setEditGrades(map)
      } catch (err) {
        console.error('Lỗi khi tải sổ điểm lớp:', err)
      } finally {
        setLoadingGradebook(false)
      }
    }
    loadGradebook()
  }, [selectedClassId])

  // Tải bảng điểm cá nhân
  useEffect(() => {
    async function loadTranscript() {
      setLoadingTranscript(true)
      try {
        const res = await getStudentTranscriptApi()
        setTranscript(res.data)
      } catch (err) {
        console.error('Lỗi khi tải bảng điểm cá nhân:', err)
      } finally {
        setLoadingTranscript(false)
      }
    }
    loadTranscript()
  }, [])

  const handleScoreChange = (studentId: string, field: 'attendance' | 'midterm' | 'finalExam', value: number) => {
    const val = Math.min(10, Math.max(0, value))
    setEditGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { attendance: 10, midterm: 8, finalExam: 8 }),
        [field]: val,
      },
    }))
  }

  const handleSaveGrade = async (studentId: string) => {
    const data = editGrades[studentId]
    if (!data) return
    setSavingStudentId(studentId)
    try {
      const res = await updateGradeApi({
        classId: selectedClassId,
        studentId,
        attendance: data.attendance,
        midterm: data.midterm,
        finalExam: data.finalExam,
      })
      // Cập nhật lại trong danh sách
      setGradebook(prev => prev.map(g => (g.studentId === studentId ? res.data : g)))
      setSaveSuccessMsg(`Đã lưu điểm cho sinh viên ${res.data.studentName} (${res.data.finalAverage} điểm - Loại ${res.data.letterGrade})`)
      setTimeout(() => setSaveSuccessMsg(null), 4000)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể lưu điểm.')
    } finally {
      setSavingStudentId(null)
    }
  }

  const selectedClass = classes.find(c => c.id === selectedClassId)

  return (
    <div className="space-y-6">
      {/* Top Banner Tiêu Chuẩn Trường Đại Học */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/20 text-indigo-200">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>PHÒNG QUẢN LÝ ĐÀO TẠO & KHẢO THÍ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sổ Điểm & Bảng Điểm Tích Lũy Đại Học
          </h1>
          <p className="mt-2 text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Hệ thống quản lý điểm học phần theo học chế tín chỉ: Đánh giá quá trình (Chuyên cần 10%, Giữa kỳ 30%, Thi kết thúc môn 60%), tự động quy đổi thang điểm chữ (A, B, C, D, F) và tính CPA thang 4.0.
          </p>

          {/* Tab Selector */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-white/20 pb-1">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'transcript'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Bảng Điểm Cá Nhân (Sinh viên)</span>
            </button>

            {isTeacherOrAdmin && (
              <button
                onClick={() => setActiveTab('gradebook')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'gradebook'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Sổ Điểm Lớp Học Phần (Giảng viên)</span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: BẢNG ĐIỂM CÁ NHÂN (TRANSCRIPT)
         ========================================================================= */}
      {activeTab === 'transcript' && (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-gray-900">Bảng Tổng Hợp Kết Quả Học Tập Tích Lũy</h2>
              <p className="text-xs text-gray-500 mt-0.5">Sinh viên: <strong>{user?.fullName}</strong> · Mã SV: <strong className="font-mono text-indigo-700">TMS-2026-081</strong></p>
            </div>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>In Bảng Điểm Điện Tử Chuẩn Trường</span>
            </button>
          </div>

          {/* Stat Cards CPA / GPA */}
          {transcript && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tín chỉ tích lũy</span>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {transcript.summary.earnedCredits} <span className="text-xs font-normal text-gray-400">/ {transcript.summary.totalCredits} TC</span>
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">Đạt 100% học phần</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Điểm CPA (Thang 4.0)</span>
                <p className="text-2xl font-black text-indigo-600 mt-1">
                  {transcript.summary.cpa4.toFixed(2)}
                </p>
                <p className="text-[10px] text-indigo-600 font-semibold mt-1">Hệ số 4.0 chuẩn Quốc tế</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Điểm CPA (Thang 10)</span>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {transcript.summary.cpa10.toFixed(1)}
                </p>
                <p className="text-[10px] text-blue-600 font-semibold mt-1">Hệ số 10 chuẩn Bộ GD&ĐT</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Xếp loại học lực</span>
                <p className="text-xl font-black text-amber-600 mt-1 flex items-center gap-1">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{transcript.summary.academicRank}</span>
                </p>
                <p className="text-[10px] text-amber-600 font-semibold mt-1">Đủ điều kiện nhận học bổng</p>
              </div>
            </div>
          )}

          {/* Table Bảng điểm */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                HỌC KỲ I · NĂM HỌC 2026 - 2027
              </span>
              <span className="text-xs text-gray-500 font-medium">3 môn học · 8 tín chỉ</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-bold">
                    <th className="py-3 px-4">STT</th>
                    <th className="py-3 px-4">Mã môn</th>
                    <th className="py-3 px-4">Tên môn học</th>
                    <th className="py-3 px-4 text-center">Số TC</th>
                    <th className="py-3 px-4 text-center">Chuyên cần (10%)</th>
                    <th className="py-3 px-4 text-center">Giữa kỳ (30%)</th>
                    <th className="py-3 px-4 text-center">Cuối kỳ (60%)</th>
                    <th className="py-3 px-4 text-center font-bold text-indigo-900">Tổng kết (Hệ 10)</th>
                    <th className="py-3 px-4 text-center">Điểm chữ</th>
                    <th className="py-3 px-4 text-center">Thang 4</th>
                    <th className="py-3 px-4 text-center">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transcript?.grades.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3.5 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">{item.courseCode}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{item.courseName}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{item.credits}</td>
                      <td className="py-3.5 px-4 text-center text-gray-700">{item.attendance.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center text-gray-700">{item.midterm.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center text-gray-700">{item.finalExam.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center font-black text-indigo-700 text-sm">
                        {item.finalAverage.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-gray-900">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {item.letterGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-800">{item.gpa4.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Đạt
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SỔ ĐIỂM LỚP HỌC PHẦN (GRADEBOOK - TEACHER / ADMIN)
         ========================================================================= */}
      {activeTab === 'gradebook' && isTeacherOrAdmin && (
        <div className="space-y-6">
          {/* Class Selector Bar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="classSelect" className="text-xs font-bold text-gray-700 whitespace-nowrap">
                Chọn Lớp Học Phần:
              </label>
              <select
                id="classSelect"
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Phòng: <strong>{selectedClass?.room}</strong></span>
              <span>·</span>
              <span>Sĩ số: <strong>{selectedClass?.currentCount} học viên</strong></span>
            </div>
          </div>

          {/* Gradebook Table with Inline Editing */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  BẢNG ĐIỂM QUÁ TRÌNH LỚP {selectedClass?.code}
                </h3>
                <p className="text-[11px] text-gray-500">Nhập điểm trực tiếp theo thang 10. Hệ thống tự động tính điểm tổng kết.</p>
              </div>
              <span className="text-[11px] bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                Công thức: 10% CC + 30% GK + 60% CK
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-bold">
                    <th className="py-3 px-4">STT</th>
                    <th className="py-3 px-4">Mã Sinh Viên</th>
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-4 text-center">Chuyên Cần (10%)</th>
                    <th className="py-3 px-4 text-center">Giữa Kỳ (30%)</th>
                    <th className="py-3 px-4 text-center">Cuối Kỳ (60%)</th>
                    <th className="py-3 px-4 text-center font-bold text-indigo-900">Điểm TK</th>
                    <th className="py-3 px-4 text-center">Điểm chữ</th>
                    <th className="py-3 px-4 text-center">Thang 4</th>
                    <th className="py-3 px-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gradebook.map((g, idx) => {
                    const edit = editGrades[g.studentId] || {
                      attendance: g.attendance,
                      midterm: g.midterm,
                      finalExam: g.finalExam,
                    }
                    const currentAvg = Math.round((edit.attendance * 0.1 + edit.midterm * 0.3 + edit.finalExam * 0.6) * 10) / 10
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-gray-400">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{g.studentCode}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">{g.studentName}</td>

                        {/* Điểm Chuyên cần */}
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="any"
                            value={edit.attendance}
                            onChange={e => handleScoreChange(g.studentId, 'attendance', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1.5 text-center font-bold bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Điểm Giữa kỳ */}
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="any"
                            value={edit.midterm}
                            onChange={e => handleScoreChange(g.studentId, 'midterm', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1.5 text-center font-bold bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Điểm Cuối kỳ */}
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="any"
                            value={edit.finalExam}
                            onChange={e => handleScoreChange(g.studentId, 'finalExam', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1.5 text-center font-bold bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Tổng kết tính realtime */}
                        <td className="py-3.5 px-4 text-center font-black text-indigo-700 text-sm">
                          {currentAvg.toFixed(1)}
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                          {currentAvg >= 9.0 ? 'A+' : currentAvg >= 8.5 ? 'A' : currentAvg >= 8.0 ? 'B+' : currentAvg >= 7.0 ? 'B' : currentAvg >= 5.5 ? 'C' : currentAvg >= 4.0 ? 'D' : 'F'}
                        </td>

                        <td className="py-3.5 px-4 text-center font-semibold text-gray-600">
                          {currentAvg >= 8.5 ? '3.8 - 4.0' : currentAvg >= 7.0 ? '3.0 - 3.5' : currentAvg >= 5.5 ? '2.0 - 2.5' : '1.0'}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleSaveGrade(g.studentId)}
                            disabled={savingStudentId === g.studentId}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingStudentId === g.studentId ? 'Đang lưu...' : 'Lưu điểm'}</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal In Bảng Điểm Chuẩn Trường Đại Học */}
      {isPrintModalOpen && transcript && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
            {/* Header Mộc Quốc Gia & Trường Học */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-600">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                <h2 className="text-sm sm:text-base font-black uppercase text-indigo-950">
                  TRƯỜNG ĐẠI HỌC CÔNG NGHỆ & ĐÀO TẠO TMS
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Số: {Math.floor(1000 + Math.random() * 9000)}/QĐ-ĐHTMS · Hà Nội</p>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-[11px] uppercase font-bold text-gray-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-[10px] font-bold text-gray-700">Độc lập - Tự do - Hạnh phúc</p>
                <p className="text-[10px] text-gray-400 mt-1 italic">Hà Nội, ngày 02 tháng 10 năm 2026</p>
              </div>
            </div>

            <div className="text-center py-2">
              <h1 className="text-xl font-black uppercase text-gray-900 tracking-tight">
                BẢNG ĐIỂM KẾT QUẢ HỌC TẬP TÍCH LŨY
              </h1>
              <p className="text-xs text-gray-500 italic mt-0.5">Hệ đào tạo: Chính quy tập trung · Trình độ: Đại học</p>
            </div>

            {/* Thông tin sinh viên */}
            <div className="grid grid-cols-2 gap-y-2 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200 font-medium">
              <div>Họ và tên: <strong className="text-gray-900">{user?.fullName}</strong></div>
              <div>Mã số sinh viên: <strong className="font-mono text-indigo-700">TMS-2026-081</strong></div>
              <div>Ngày sinh: <strong>15/08/2004</strong></div>
              <div>Ngành học: <strong>Kỹ nghệ Phần mềm & Web Fullstack</strong></div>
              <div>Khóa học: <strong>K15 (2026 - 2030)</strong></div>
              <div>Tình trạng: <strong className="text-emerald-700">Đang theo học</strong></div>
            </div>

            {/* Bảng điểm in */}
            <table className="w-full text-left border-collapse text-xs border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 font-bold text-gray-800">
                  <th className="py-2 px-3 border-r border-gray-300 text-center">STT</th>
                  <th className="py-2 px-3 border-r border-gray-300">Mã môn</th>
                  <th className="py-2 px-3 border-r border-gray-300">Tên môn học</th>
                  <th className="py-2 px-3 border-r border-gray-300 text-center">Số TC</th>
                  <th className="py-2 px-3 border-r border-gray-300 text-center">Thang 10</th>
                  <th className="py-2 px-3 border-r border-gray-300 text-center">Điểm chữ</th>
                  <th className="py-2 px-3 text-center">Thang 4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transcript.grades.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3 border-r border-gray-200 text-center">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-gray-200 font-mono font-bold">{item.courseCode}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{item.courseName}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center">{item.credits}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-bold">{item.finalAverage.toFixed(1)}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-bold text-amber-700">{item.letterGrade}</td>
                    <td className="py-2 px-3 text-center font-bold">{item.gpa4.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tóm tắt */}
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs flex justify-between items-center font-bold">
              <span>Tổng số tín chỉ tích lũy: {transcript.summary.earnedCredits} TC</span>
              <span>CPA (Thang 4): {transcript.summary.cpa4.toFixed(2)}</span>
              <span>Xếp loại: {transcript.summary.academicRank}</span>
            </div>

            {/* Chữ ký & Dấu đỏ */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs">
              <div>
                <p className="font-bold text-gray-700">NGƯỜI LẬP BẢNG</p>
                <p className="text-[10px] text-gray-400 mt-1">(Ký và ghi rõ họ tên)</p>
                <div className="h-16 flex items-center justify-center font-cursive text-indigo-800 text-lg">
                  Lê Hoàng
                </div>
                <p className="font-bold text-gray-800">Lê Hoàng Giảng Viên</p>
              </div>

              <div className="relative">
                <p className="font-bold text-gray-700 uppercase">TRƯỞNG PHÒNG ĐÀO TẠO</p>
                <p className="text-[10px] text-gray-400 mt-1">(Ký số & Đóng dấu)</p>
                <div className="h-16 flex items-center justify-center relative">
                  <div className="w-20 h-20 rounded-full border-2 border-red-500/80 flex items-center justify-center text-red-600 text-[9px] font-black uppercase text-center rotate-[-12deg] p-1 shadow-xs pointer-events-none">
                    ★ ĐẠI HỌC TMS ★<br />ĐÃ KÝ SỐ
                  </div>
                </div>
                <p className="font-bold text-gray-900">TS. Trần Thị Đào Tạo</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>In Bản In Trình Duyệt (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
