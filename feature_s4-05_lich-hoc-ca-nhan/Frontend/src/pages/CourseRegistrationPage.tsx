import React, { useState, useEffect } from 'react'
import {
  getCourseOfferingsApi,
  getMyRegistrationsApi,
  registerCourseApi,
  cancelRegistrationApi,
  createCourseOfferingApi,
  CourseOfferingItem,
  RegistrationItem
} from '../api/academicApi'
import { useAuthStore } from '../store/authStore'
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  User,
  PlusCircle,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Search,
  Sparkles,
  Info,
  Plus,
  X
} from 'lucide-react'

export default function CourseRegistrationPage() {
  const { user } = useAuthStore()
  const isManagerOrAdmin = user?.roles.some(r => ['ADMIN', 'TRAINING_MANAGER'].includes(r))

  const [offerings, setOfferings] = useState<CourseOfferingItem[]>([])
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Modal mở học phần mới
  const [createOfferingModalOpen, setCreateOfferingModalOpen] = useState(false)
  const [offeringForm, setOfferingForm] = useState({
    courseCode: '',
    courseName: '',
    credits: 3,
    teacherName: 'Giảng viên Bộ môn',
    schedule: 'Thứ 2, 4 (Ca 1: 07:30 - 09:30)',
    room: 'Phòng Lab 402 - Nhà C',
    capacity: 40,
  })
  const [creatingOffering, setCreatingOffering] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [offRes, regRes] = await Promise.all([
        getCourseOfferingsApi(),
        getMyRegistrationsApi(),
      ])
      setOfferings(offRes.data)
      setRegistrations(regRes.data)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu đăng ký:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRegister = async (offeringId: string) => {
    setActionLoadingId(offeringId)
    try {
      const res = await registerCourseApi(offeringId)
      setNotification({ type: 'success', message: res.message || 'Đăng ký học phần thành công!' })
      await fetchData()
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Không thể đăng ký học phần này.' })
    } finally {
      setActionLoadingId(null)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleCancel = async (registrationId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký học phần này không?')) return
    setActionLoadingId(registrationId)
    try {
      const res = await cancelRegistrationApi(registrationId)
      setNotification({ type: 'success', message: res.message || 'Đã hủy học phần.' })
      await fetchData()
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Không thể hủy học phần.' })
    } finally {
      setActionLoadingId(null)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offeringForm.courseCode || !offeringForm.courseName) {
      setNotification({ type: 'error', message: 'Vui lòng nhập mã môn và tên môn học.' })
      return
    }
    setCreatingOffering(true)
    try {
      const res = await createCourseOfferingApi(offeringForm)
      setNotification({ type: 'success', message: res.message || 'Mở học phần đăng ký mới thành công!' })
      setCreateOfferingModalOpen(false)
      setOfferingForm({
        courseCode: '',
        courseName: '',
        credits: 3,
        teacherName: 'Giảng viên Bộ môn',
        schedule: 'Thứ 2, 4 (Ca 1: 07:30 - 09:30)',
        room: 'Phòng Lab 402 - Nhà C',
        capacity: 40,
      })
      await fetchData()
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi mở học phần mới.' })
    } finally {
      setCreatingOffering(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const registeredOfferingIds = new Set(registrations.map(r => r.offeringId))

  const totalRegisteredCredits = (registrations || []).reduce((sum, r) => sum + (r.offering?.credits || 0), 0)
  const totalEstimatedTuition = (registrations || []).reduce((sum, r) => sum + (r.offering?.tuitionFee || (r.offering?.credits || 0) * 450000), 0)

  const filteredOfferings = (offerings || []).filter(o => {
    const name = (o?.name || o?.courseName || '').toLowerCase()
    const code = (o?.code || o?.courseCode || '').toLowerCase()
    const teacher = (o?.teacherName || '').toLowerCase()
    const q = (searchQuery || '').toLowerCase()
    return name.includes(q) || code.includes(q) || teacher.includes(q)
  })

  return (
    <div className="space-y-6">
      {/* Top Banner Tiêu Chuẩn Trường Đại Học */}
      <div className="bg-gradient-to-r from-teal-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/20 text-teal-200">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>CỔNG ĐĂNG KÝ HỌC PHẦN TRỰC TUYẾN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Đăng Ký Học Phần Tín Chỉ · Học Kỳ II (2026 - 2027)
          </h1>
          <p className="mt-2 text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Sinh viên thực hiện lựa chọn các môn học theo lộ trình đào tạo. Quy định số tín chỉ đăng ký: <strong>Tối thiểu 12 tín chỉ, tối đa 24 tín chỉ</strong>. Hệ thống tự động kiểm tra trùng lịch học và số chỗ còn lại.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-teal-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Hạn đăng ký: <strong>23:59 · 25/10/2026</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Trạng thái cổng: <strong>Đang mở (ONLINE)</strong>
            </span>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Số học phần đã đăng ký</span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {registrations.length} <span className="text-xs font-normal text-gray-400">môn học</span>
          </p>
          <p className="text-[10px] text-gray-500 font-medium mt-1">Học kỳ II năm học 2026 - 2027</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tổng số tín chỉ</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">
            {totalRegisteredCredits} <span className="text-xs font-normal text-gray-400">/ 24 TC tối đa</span>
          </p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${totalRegisteredCredits >= 12 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, (totalRegisteredCredits / 24) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            {totalRegisteredCredits >= 12 ? '✓ Đã đạt số tín chỉ tối thiểu' : 'Cần thêm tín chỉ (Tối thiểu 12)'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Học phí tạm tính</span>
          <p className="text-2xl font-black text-teal-700 mt-1">
            {totalEstimatedTuition.toLocaleString('vi-VN')} <span className="text-xs font-normal text-gray-400">₫</span>
          </p>
          <p className="text-[10px] text-gray-500 font-medium mt-1">Sẽ tự động kết chuyển vào sổ học phí</p>
        </div>
      </div>

      {/* Danh Sách Học Phần Đã Đăng Ký */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              CÁC HỌC PHẦN ĐÃ ĐĂNG KÝ THÀNH CÔNG ({registrations.length})
            </h2>
          </div>
          {registrations.length > 0 && (
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu Đăng Ký Học Phần</span>
            </button>
          )}
        </div>

        {registrations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            Bạn chưa đăng ký học phần nào trong học kỳ này. Vui lòng chọn môn ở danh sách bên dưới.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100/60 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="py-3 px-4">Mã môn</th>
                  <th className="py-3 px-4">Tên học phần</th>
                  <th className="py-3 px-4 text-center">Tín chỉ</th>
                  <th className="py-3 px-4">Thời gian học</th>
                  <th className="py-3 px-4">Phòng học</th>
                  <th className="py-3 px-4">Giảng viên</th>
                  <th className="py-3 px-4 text-right">Học phí</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.map(r => (
                  <tr key={r.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{r.offering?.code || r.offering?.courseCode}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{r.offering?.name || r.offering?.courseName}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800">{r.offering?.credits} TC</td>
                    <td className="py-3 px-4 text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-500" />
                      <span>{r.offering?.schedule}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{r.offering?.room}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{r.offering?.teacherName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">
                      {r.offering?.tuitionFee?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={actionLoadingId === r.id}
                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        title="Hủy môn này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hủy môn</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Danh Sách Các Lớp Học Phần Mở Đăng Ký */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              DANH SÁCH HỌC PHẦN MỞ ĐĂNG KÝ (KỲ II · 2026 - 2027)
            </h2>
            <p className="text-[11px] text-gray-500">Chọn môn học phù hợp với khung chương trình đào tạo của bạn.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã môn, tên môn..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            {isManagerOrAdmin && (
              <button
                onClick={() => setCreateOfferingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mở Học Phần</span>
              </button>
            )}
          </div>
        </div>

        {filteredOfferings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">Chưa có học phần nào được mở</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Danh sách học phần tín chỉ kỳ này đang trống. Quản lý đào tạo hoặc Quản trị viên có thể mở các học phần mới để sinh viên đăng ký.
            </p>
            {isManagerOrAdmin && (
              <button
                onClick={() => setCreateOfferingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Mở Học Phần Đầu Tiên</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOfferings.map(item => {
              const isRegistered = registeredOfferingIds.has(item.id)
              const isFull = item.enrolled >= item.capacity

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 font-mono font-bold text-xs text-indigo-700 border border-indigo-200">
                        {item.code || item.courseCode}
                      </span>
                      <h3 className="font-bold text-sm text-gray-900">{item.name || item.courseName}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-[10px] text-gray-600">
                        {item.credits} Tín chỉ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{item.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{item.room}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        <span>GV: {item.teacherName}</span>
                      </div>
                    </div>

                    {/* Sĩ số & Học phí */}
                    <div className="flex items-center gap-4 text-xs pt-1 text-gray-500">
                      <div>
                        Sĩ số: <strong className={isFull ? 'text-red-600' : 'text-gray-900'}>{item.enrolled}</strong> / {item.capacity} chỗ
                      </div>
                      <div>
                        Học phí: <strong className="text-gray-900 font-mono">{item.tuitionFee?.toLocaleString('vi-VN')} ₫</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isRegistered ? (
                      <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Đã Đăng Ký
                      </span>
                    ) : isFull ? (
                      <span className="px-3.5 py-2 rounded-xl bg-gray-100 text-gray-400 font-bold text-xs">
                        Hết Chỗ
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(item.id)}
                        disabled={actionLoadingId === item.id}
                        className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>{actionLoadingId === item.id ? 'Đang đăng ký...' : 'Đăng Ký Học'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal In Phiếu Đăng Ký Học Phần Chuẩn Trường Học */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
            {/* Header Mộc Quốc Gia & Trường Học */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-600">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                <h2 className="text-sm sm:text-base font-black uppercase text-indigo-950">
                  TRƯỜNG ĐẠI HỌC CÔNG NGHỆ & ĐÀO TẠO TMS
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Phòng Quản Lý Đào Tạo & Công Tác Sinh Viên</p>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-[11px] uppercase font-bold text-gray-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-[10px] font-bold text-gray-700">Độc lập - Tự do - Hạnh phúc</p>
                <p className="text-[10px] text-gray-400 mt-1 italic">Hà Nội, ngày 02 tháng 10 năm 2026</p>
              </div>
            </div>

            <div className="text-center py-2">
              <h1 className="text-xl font-black uppercase text-gray-900 tracking-tight">
                PHIẾU ĐĂNG KÝ HỌC PHẦN TÍN CHỈ
              </h1>
              <p className="text-xs text-gray-500 italic mt-0.5">Học kỳ II · Năm học 2026 - 2027</p>
            </div>

            {/* Thông tin sinh viên */}
            <div className="grid grid-cols-2 gap-y-2 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200 font-medium">
              <div>Họ và tên sinh viên: <strong className="text-gray-900">{user?.fullName}</strong></div>
              <div>Mã số sinh viên: <strong className="font-mono text-indigo-700">TMS-2026-081</strong></div>
              <div>Chương trình: <strong>Kỹ nghệ Phần mềm & Web Fullstack</strong></div>
              <div>Ngày in phiếu: <strong>02/10/2026</strong></div>
            </div>

            {/* Bảng danh sách học phần in */}
            <table className="w-full text-left border-collapse text-xs border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 font-bold text-gray-800">
                  <th className="py-2 px-3 border-r border-gray-300 text-center">STT</th>
                  <th className="py-2 px-3 border-r border-gray-300">Mã môn</th>
                  <th className="py-2 px-3 border-r border-gray-300">Tên học phần</th>
                  <th className="py-2 px-3 border-r border-gray-300 text-center">Số TC</th>
                  <th className="py-2 px-3 border-r border-gray-300">Thời gian & Phòng học</th>
                  <th className="py-2 px-3 text-right">Mức học phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="py-2 px-3 border-r border-gray-200 text-center">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-gray-200 font-mono font-bold">{r.offering?.code || r.offering?.courseCode}</td>
                    <td className="py-2 px-3 border-r border-gray-200 font-medium">{r.offering?.name || r.offering?.courseName}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-bold">{r.offering?.credits}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-gray-700">{r.offering?.schedule} ({r.offering?.room})</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{r.offering?.tuitionFee?.toLocaleString('vi-VN')} ₫</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tổng kết */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex justify-between items-center font-bold">
              <span>Tổng số tín chỉ đăng ký: {totalRegisteredCredits} TC</span>
              <span>Tổng học phí tạm tính: {totalEstimatedTuition.toLocaleString('vi-VN')} ₫</span>
            </div>

            {/* Chữ ký hai bên */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs">
              <div>
                <p className="font-bold text-gray-700">SINH VIÊN ĐĂNG KÝ</p>
                <p className="text-[10px] text-gray-400 mt-1">(Ký và ghi rõ họ tên)</p>
                <div className="h-16 flex items-center justify-center font-cursive text-indigo-900 text-lg">
                  {user?.fullName}
                </div>
                <p className="font-bold text-gray-800">{user?.fullName}</p>
              </div>

              <div className="relative">
                <p className="font-bold text-gray-700 uppercase">XÁC NHẬN PHÒNG ĐÀO TẠO</p>
                <p className="text-[10px] text-gray-400 mt-1">(Ký số & Đóng dấu)</p>
                <div className="h-16 flex items-center justify-center relative">
                  <div className="w-20 h-20 rounded-full border-2 border-red-500/80 flex items-center justify-center text-red-600 text-[9px] font-black uppercase text-center rotate-[-12deg] p-1 shadow-xs pointer-events-none">
                    ★ ĐẠI HỌC TMS ★<br />ĐÃ XÁC NHẬN
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
                <span>In Phiếu (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mở Học Phần Đăng Ký Mới (Dành cho Quản lý đào tạo & Admin) */}
      {createOfferingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Mở Học Phần Đăng Ký Mới</span>
              </h3>
              <button onClick={() => setCreateOfferingModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffering} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mã môn học *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: CS101, IT202"
                    value={offeringForm.courseCode}
                    onChange={(e) => setOfferingForm({ ...offeringForm, courseCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Số tín chỉ *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={offeringForm.credits}
                    onChange={(e) => setOfferingForm({ ...offeringForm, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên học phần môn học *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cấu trúc Dữ liệu & Giải thuật"
                  value={offeringForm.courseName}
                  onChange={(e) => setOfferingForm({ ...offeringForm, courseName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Giảng viên giảng dạy</label>
                <input
                  type="text"
                  placeholder="Ví dụ: TS. Nguyễn Văn Giảng Viên"
                  value={offeringForm.teacherName}
                  onChange={(e) => setOfferingForm({ ...offeringForm, teacherName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Thời khóa biểu</label>
                  <input
                    type="text"
                    placeholder="Thứ 2, 4 (Ca 1: 07:30 - 09:30)"
                    value={offeringForm.schedule}
                    onChange={(e) => setOfferingForm({ ...offeringForm, schedule: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phòng học</label>
                  <input
                    type="text"
                    placeholder="Phòng 301 - Nhà B"
                    value={offeringForm.room}
                    onChange={(e) => setOfferingForm({ ...offeringForm, room: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sĩ số giới hạn (Chỗ ngồi)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={offeringForm.capacity}
                  onChange={(e) => setOfferingForm({ ...offeringForm, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOfferingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingOffering}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
                >
                  {creatingOffering ? 'Đang mở...' : 'Mở Học Phần'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
