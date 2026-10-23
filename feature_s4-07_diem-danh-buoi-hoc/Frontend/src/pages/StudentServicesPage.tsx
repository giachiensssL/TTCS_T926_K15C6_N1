import React, { useState, useEffect } from 'react'
import {
  getStudentRequestsApi,
  createStudentRequestApi,
  reviewStudentRequestApi,
  StudentRequestItem
} from '../api/academicApi'
import { useAuthStore } from '../store/authStore'
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  ShieldCheck,
  Printer,
  X,
  AlertCircle,
  HelpCircle,
  FileCheck2
} from 'lucide-react'

export default function StudentServicesPage() {
  const { user } = useAuthStore()
  const isManagerOrAdmin = user?.roles.some(r => ['TRAINING_MANAGER', 'ADMIN'].includes(r))

  const [requests, setRequests] = useState<StudentRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRequestToPrint, setSelectedRequestToPrint] = useState<StudentRequestItem | null>(null)

  // Form state
  const [formType, setFormType] = useState('GIẤY XÁC NHẬN SINH VIÊN')
  const [formReason, setFormReason] = useState('')
  const [formUrgency, setFormUrgency] = useState('Bình thường')
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await getStudentRequestsApi()
      setRequests(res.data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn từ:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formReason.trim()) return
    setSubmitting(true)
    try {
      const res = await createStudentRequestApi({
        type: formType,
        reason: formReason.trim(),
        urgency: formUrgency,
      })
      setNotification({ type: 'success', message: res.message || 'Đã gửi yêu cầu thành công!' })
      setIsCreateModalOpen(false)
      setFormReason('')
      await fetchRequests()
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Không thể gửi đơn.' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleReview = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const reviewerNote = prompt(
      status === 'APPROVED' ? 'Nhập ghi chú phê duyệt (tùy chọn):' : 'Nhập lý do từ chối đơn:'
    )
    if (status === 'REJECTED' && !reviewerNote) {
      alert('Vui lòng cung cấp lý do từ chối để sinh viên được biết.')
      return
    }

    try {
      await reviewStudentRequestApi(requestId, { status, reviewerNote: reviewerNote || '' })
      setNotification({
        type: 'success',
        message: status === 'APPROVED' ? 'Đã phê duyệt yêu cầu!' : 'Đã từ chối yêu cầu.',
      })
      await fetchRequests()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xử lý đơn.')
    } finally {
      setTimeout(() => setNotification(null), 4000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Tiêu Chuẩn Trường Đại Học */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/20 text-indigo-200">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>BỘ PHẬN TIẾP NHẬN & PHỤC VỤ MỘT CỬA SINH VIÊN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dịch Vụ Một Cửa & Đơn Từ Điện Tử
          </h1>
          <p className="mt-2 text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Hệ thống giải quyết thủ tục hành chính trực tuyến cho sinh viên: Cấp giấy xác nhận sinh viên, Bảng điểm tạm thời, Đơn hoãn thi, Cấp lại thẻ thông minh. Mọi văn bản phê duyệt đều có mã định danh xác thực điện tử chuẩn trường học.
          </p>

          <div className="mt-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Tạo Yêu Cầu Một Cửa Mới</span>
            </button>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
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
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Danh Sách Đơn Từ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              {isManagerOrAdmin ? 'TỔNG HỢP YÊU CẦU CẦN XỬ LÝ TOÀN TRƯỜNG' : 'LỊCH SỬ ĐƠN TỪ CỦA TÔI'}
            </h2>
            <p className="text-[11px] text-gray-500">Thời gian xử lý chuẩn: Tối đa 24 giờ kể từ khi nộp hồ sơ.</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            Tổng cộng: {requests.length} yêu cầu
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">Chưa có yêu cầu nào trong danh sách.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100/60 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Loại văn bản</th>
                  <th className="py-3 px-4">Người làm đơn</th>
                  <th className="py-3 px-4">Lý do & Mục đích</th>
                  <th className="py-3 px-4 text-center">Độ khẩn</th>
                  <th className="py-3 px-4">Ngày gửi</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{req.id.toUpperCase()}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{req.type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{req.studentName}</p>
                      <p className="text-[10px] font-mono text-gray-400">{req.studentCode}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-gray-600 truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          req.urgency === 'Khẩn cấp'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(req.requestedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {req.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã duyệt
                        </span>
                      ) : req.status === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Từ chối
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Chờ xử lý
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {req.status === 'APPROVED' && (
                          <button
                            onClick={() => setSelectedRequestToPrint(req)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>In giấy</span>
                          </button>
                        )}

                        {isManagerOrAdmin && req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleReview(req.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nộp Đơn Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Gửi Yêu Cầu Một Cửa Mới</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Loại giấy tờ / Đơn từ:</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="GIẤY XÁC NHẬN SINH VIÊN">Giấy xác nhận sinh viên (Vay vốn / Hoãn NVQS / Thực tập)</option>
                  <option value="CẤP BẢNG ĐIỂM TẠM THỜI">Cấp bảng điểm tạm thời (Kèm mộc điện tử)</option>
                  <option value="HOÃN THI / HỌC BÙ">Đơn xin hoãn thi / Học bù</option>
                  <option value="CẤP LẠI THẺ SINH VIÊN">Đơn xin cấp lại thẻ sinh viên thông minh</option>
                  <option value="BẢO LƯU KẾT QUẢ">Đơn xin tạm dừng & bảo lưu kết quả học tập</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mức độ khẩn cấp:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormUrgency('Bình thường')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      formUrgency === 'Bình thường'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Bình thường (24h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormUrgency('Khẩn cấp')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      formUrgency === 'Khẩn cấp'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Khẩn cấp (Trong ngày)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Lý do & Mục đích cụ thể:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Xin giấy xác nhận để làm thủ tục vay vốn tại Ngân hàng Chính sách xã hội quận Cầu Giấy..."
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-md"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem & In Giấy Xác Nhận Điện Tử Chuẩn Trường Đại Học */}
      {selectedRequestToPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
            {/* Header Mộc Quốc Gia & Trường Học */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-600">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                <h2 className="text-sm sm:text-base font-black uppercase text-indigo-950">
                  TRƯỜNG ĐẠI HỌC CÔNG NGHỆ & ĐÀO TẠO TMS
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Mã tra cứu: <strong className="font-mono text-indigo-700">{selectedRequestToPrint.verificationCode}</strong></p>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-[11px] uppercase font-bold text-gray-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-[10px] font-bold text-gray-700">Độc lập - Tự do - Hạnh phúc</p>
                <p className="text-[10px] text-gray-400 mt-1 italic">Hà Nội, ngày 02 tháng 10 năm 2026</p>
              </div>
            </div>

            <div className="text-center py-2">
              <h1 className="text-xl font-black uppercase text-gray-900 tracking-tight">
                {selectedRequestToPrint.type}
              </h1>
              <p className="text-xs text-gray-500 italic mt-0.5">Hiệu lực: Văn bản điện tử có giá trị pháp lý toàn quốc</p>
            </div>

            <div className="space-y-3 text-xs text-gray-800 leading-relaxed bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
              <p>Trường Đại học Công nghệ & Đào tạo TMS xác nhận:</p>
              <div className="grid grid-cols-2 gap-2 pl-4">
                <div>Anh/Chị: <strong className="text-gray-950 font-bold">{selectedRequestToPrint.studentName}</strong></div>
                <div>Mã số sinh viên: <strong className="font-mono text-indigo-700">{selectedRequestToPrint.studentCode}</strong></div>
                <div>Hệ đào tạo: <strong>Chính quy</strong></div>
                <div>Khóa học: <strong>K15 (2026 - 2030)</strong></div>
                <div>Khoa / Chuyên ngành: <strong>Công nghệ Thông tin & Phần mềm</strong></div>
                <div>Tình trạng: <strong className="text-emerald-700">Đang theo học bình thường</strong></div>
              </div>
              <p className="pt-2">Lý do cấp xác nhận: <em>"{selectedRequestToPrint.reason}"</em></p>
              <p className="text-[11px] text-gray-500 italic">
                * Giấy này được cấp theo yêu cầu của sinh viên để bổ sung thủ tục hành chính.
              </p>
            </div>

            {/* Dấu mộc & Chữ ký số */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs">
              <div>
                <p className="font-bold text-gray-700">NGƯỜI ĐỐI SOÁT HỒ SƠ</p>
                <div className="h-16 flex items-center justify-center font-cursive text-indigo-900 text-lg">
                  Thu Trang
                </div>
                <p className="font-bold text-gray-800">Cán bộ Một cửa Đào tạo</p>
              </div>

              <div className="relative">
                <p className="font-bold text-gray-700 uppercase">TL. HIỆU TRƯỞNG<br />TRƯỞNG PHÒNG ĐÀO TẠO</p>
                <div className="h-16 flex items-center justify-center relative">
                  <div className="w-20 h-20 rounded-full border-2 border-red-500/80 flex items-center justify-center text-red-600 text-[9px] font-black uppercase text-center rotate-[-12deg] p-1 shadow-xs pointer-events-none">
                    ★ ĐẠI HỌC TMS ★<br />ĐÃ KÝ SỐ XÁC NHẬN
                  </div>
                </div>
                <p className="font-bold text-gray-900">TS. Trần Thị Đào Tạo</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedRequestToPrint(null)}
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
