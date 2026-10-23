import React, { useState, useEffect, useCallback } from 'react'
import { getTuitionsApi, payTuitionApi, createTuitionRecordApi, TuitionItem } from '../api/academicApi'
import { getUsersApi, UserItem } from '../api/usersApi'
import { extractApiError } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import {
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  X,
  CreditCard,
  User,
  ShieldCheck,
  Plus
} from 'lucide-react'

export default function TuitionPage() {
  const { user } = useAuthStore()
  const isAccountant = user?.roles.some((r) => ['ACCOUNTANT', 'ADMIN'].includes(r))

  const [tuitions, setTuitions] = useState<TuitionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modal tạo khoản thu mới
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [students, setStudents] = useState<UserItem[]>([])
  const [createForm, setCreateForm] = useState({
    studentId: '',
    title: 'Học phí Học kỳ 1 - 2026/2027',
    amount: 5000000,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })
  const [creating, setCreating] = useState(false)

  // Modal đóng học phí
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedTuition, setSelectedTuition] = useState<TuitionItem | null>(null)
  const [payAmount, setPayAmount] = useState<number>(0)
  const [payMethod, setPayMethod] = useState('Chuyển khoản VNPAY / QR Code')
  const [paying, setPaying] = useState(false)

  // Modal xem biên lai
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [activeReceipt, setActiveReceipt] = useState<{
    receiptNumber: string
    amount: number
    paidAt: string
    method: string
    cashier: string
    studentName: string
    semester: string
  } | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getTuitionsApi()
      setTuitions(res.data)
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await getUsersApi({ limit: 100 })
        setStudents(res.data)
      } catch (e) {
        console.error(e)
      }
    }
    loadStudents()
  }, [])

  // Xử lý tạo khoản thu học phí mới
  const handleCreateTuition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.studentId || !createForm.amount) {
      setFeedback({ type: 'error', message: 'Vui lòng chọn học viên và nhập mức học phí.' })
      return
    }
    setCreating(true)
    try {
      const res = await createTuitionRecordApi({
        studentId: createForm.studentId,
        title: createForm.title,
        amount: createForm.amount,
        dueDate: createForm.dueDate,
      })
      setFeedback({ type: 'success', message: res.message || 'Tạo khoản thu học phí thành công!' })
      setCreateModalOpen(false)
      loadData()
    } catch (err: any) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message || 'Không thể tạo khoản thu.' })
    } finally {
      setCreating(false)
    }
  }

  // Xử lý nộp tiền
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTuition) return
    setPaying(true)
    try {
      const res = await payTuitionApi({
        tuitionId: selectedTuition.id,
        amount: payAmount,
        method: payMethod,
      })
      setFeedback({ type: 'success', message: res.message })
      setPayModalOpen(false)
      loadData()

      // Tự động mở biên lai vừa xuất
      setActiveReceipt({
        ...res.receipt,
        studentName: selectedTuition.studentName,
        semester: selectedTuition.semester,
      })
      setReceiptModalOpen(true)
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Phân hệ Tài chính & Quản lý Học phí (Sprint 7)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Học Phí & Biên Lai Điện Tử
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi công nợ, kế hoạch thanh toán theo kỳ và xuất biên lai chuẩn kế toán
          </p>
        </div>

        {isAccountant && (
          <button
            onClick={() => {
              if (students.length > 0 && !createForm.studentId) {
                setCreateForm(prev => ({ ...prev, studentId: students[0].id }))
              }
              setCreateModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Khoản Thu Mới</span>
          </button>
        )}
      </div>

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

      {/* Tuition Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-3xl text-center text-gray-400 text-xs">
            Đang tải dữ liệu học phí...
          </div>
        ) : tuitions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Chưa có khoản thu học phí nào</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Hiện tại danh mục học phí đang trống. Kế toán hoặc Quản trị viên có thể tạo khoản thu học phí mới cho học viên.
              </p>
            </div>
            {isAccountant && (
              <button
                onClick={() => {
                  if (students.length > 0 && !createForm.studentId) {
                    setCreateForm(prev => ({ ...prev, studentId: students[0].id }))
                  }
                  setCreateModalOpen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Khoản Thu Đầu Tiên</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tuitions.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">{t.semester}</span>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        t.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : t.status === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {t.status === 'PAID' ? '✓ Đã hoàn tất' : t.status === 'PARTIAL' ? 'Thanh toán một phần' : 'Chưa nộp'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{t.studentName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{t.programName}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Phải thu</p>
                      <p className="font-bold text-gray-900 mt-1">{t.totalAmount.toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 uppercase font-semibold">Đã đóng</p>
                      <p className="font-bold text-emerald-600 mt-1">{t.paidAmount.toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-rose-600 uppercase font-semibold">Còn nợ</p>
                      <p className="font-bold text-rose-600 mt-1">{t.debtAmount.toLocaleString('vi-VN')} ₫</p>
                    </div>
                  </div>

                  {t.receipts && t.receipts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lịch sử biên lai:</p>
                      {t.receipts.map((rc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="font-mono font-bold text-gray-800">{rc.receiptNumber}</span>
                            <span className="text-[10px] text-gray-400">({new Date(rc.paidAt).toLocaleDateString('vi-VN')})</span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveReceipt({
                                ...rc,
                                studentName: t.studentName,
                                semester: t.semester,
                              })
                              setReceiptModalOpen(true)
                            }}
                            className="text-xs text-indigo-600 font-bold hover:underline"
                          >
                            Xem biên lai
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Hạn nộp: {t.dueDate}
                  </span>

                  {isAccountant && t.debtAmount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedTuition(t)
                        setPayAmount(t.debtAmount)
                        setPayModalOpen(true)
                      }}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Thu tiền & In biên lai</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Thu Tiền Học Phí (S7-03) */}
      {payModalOpen && selectedTuition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">Ghi Nhận Thu Học Phí (S7-03)</h3>
              <button onClick={() => setPayModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePay} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <p className="font-bold text-gray-900">{selectedTuition.studentName}</p>
                <p className="text-gray-500">{selectedTuition.semester}</p>
                <p className="text-rose-600 font-bold">Số tiền còn nợ: {selectedTuition.debtAmount.toLocaleString('vi-VN')} ₫</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Số tiền thu (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0" step="any"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-base"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Phương thức thanh toán</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Chuyển khoản VNPAY / QR Code">Chuyển khoản VNPAY / QR Code</option>
                  <option value="Tiền mặt tại quầy kế toán">Tiền mặt tại quầy kế toán</option>
                  <option value="Chuyển khoản ngân hàng trực tiếp">Chuyển khoản ngân hàng trực tiếp</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {paying ? 'Đang xuất biên lai...' : 'Xác nhận thu tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Biên Lai Điện Tử Chuẩn Trường Học (S7-03) */}
      {receiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="p-6 space-y-6">
              {/* Header biên lai */}
              <div className="text-center pb-4 border-b border-dashed border-gray-300">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  TRUNG TÂM ĐÀO TẠO CÔNG NGHỆ THÔNG TIN TMS
                </h4>
                <h2 className="text-xl font-black text-gray-900 mt-1 uppercase">
                  BIÊN LAI THU HỌC PHÍ ĐIỆN TỬ
                </h2>
                <p className="font-mono text-xs font-bold text-indigo-600 mt-1">
                  Mã số: {activeReceipt.receiptNumber}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Ngày thu: {new Date(activeReceipt.paidAt).toLocaleString('vi-VN')}
                </p>
              </div>

              {/* Thông tin biên lai */}
              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Họ và tên người nộp:</span>
                  <span className="font-bold text-gray-900">{activeReceipt.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Nội dung thu:</span>
                  <span className="font-semibold text-gray-900">{activeReceipt.semester}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-medium">{activeReceipt.method}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Người lập biên lai:</span>
                  <span className="font-medium">{activeReceipt.cashier}</span>
                </div>
                <div className="flex justify-between py-2 bg-indigo-50/60 px-3 rounded-xl text-sm font-bold text-indigo-900">
                  <span>SỐ TIỀN ĐÃ THU:</span>
                  <span className="text-base text-indigo-600">
                    {activeReceipt.amount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Dấu xác nhận điện tử */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Biên lai số đã ký điện tử hợp lệ</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In biên lai</span>
                  </button>
                  <button
                    onClick={() => setReceiptModalOpen(false)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Tạo Khoản Thu Học Phí Mới */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-600" />
                <span>Tạo Khoản Thu Học Phí Mới</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTuition} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Học viên nộp học phí *</label>
                {students.length > 0 ? (
                  <select
                    required
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Chọn học viên --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.email}) - {st.roles.join(', ')}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Mã định danh học viên (ví dụ: usr_admin_001)"
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nội dung khoản thu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Học phí Học kỳ 1 - 2026/2027"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mức học phí (VNĐ) *</label>
                  <input
                    type="number"
                    step="any" min="0"
                    required
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hạn thanh toán</label>
                  <input
                    type="date"
                    required
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Tạo Khoản Thu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
