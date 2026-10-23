import React, { useState, useEffect } from 'react'
import {
  getAdmissionsApi,
  createLeadApi,
  updateLeadApi,
  deleteLeadApi,
  bulkAssignLeadsApi,
  getLeadHistoryApi,
  getConsultantsApi,
  updateLeadFunnelStatusApi,
  addLeadCareLogApi,
  convertLeadToStudentApi,
  AdmissionLeadItem,
  ConsultantUserItem,
  AssignmentHistoryItem,
  CareLogItem,
  StatusHistoryItem,
  getAcademicDataApi,
  ProgramItem,
} from '../api/academicApi'
import { useAuthStore } from '../store/authStore'
import {
  UserPlus,
  Phone,
  Mail,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  Filter,
  Plus,
  Trash2,
  Edit,
  History,
  UserCheck,
  RotateCcw,
  AlertTriangle,
  Users,
  LayoutGrid,
  Table as TableIcon,
  Shield,
  Tag,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Lock,
  ArrowRight,
  CalendarClock,
  Check,
} from 'lucide-react'

export default function AdmissionsPage() {
  const { user } = useAuthStore()
  const canDeleteLead = user?.roles.some((r) => ['TRAINING_MANAGER', 'ADMIN'].includes(r))
  const canAssignLead = user?.roles.some((r) => ['TRAINING_MANAGER', 'ADMIN'].includes(r))
  const isConsultantOnly =
    user?.roles.includes('CONSULTANT') && !user?.roles.some((r) => ['TRAINING_MANAGER', 'ADMIN'].includes(r))

  const [leads, setLeads] = useState<AdmissionLeadItem[]>([])
  const [programs, setPrograms] = useState<ProgramItem[]>([])
  const [consultants, setConsultants] = useState<ConsultantUserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
  } | null>(null)

  // View mode: Kanban vs Table
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN')

  // S2-11: Multi-criteria Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [consultantFilter, setConsultantFilter] = useState('ALL')
  const [fromDateFilter, setFromDateFilter] = useState('')
  const [toDateFilter, setToDateFilter] = useState('')

  // S2-10: Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignConsultantId, setAssignConsultantId] = useState('')
  const [assignNote, setAssignNote] = useState('')
  const [assigning, setAssigning] = useState(false)

  // S2-10: Assignment History Modal
  const [historyLead, setHistoryLead] = useState<AdmissionLeadItem | null>(null)
  const [historyLogs, setHistoryLogs] = useState<AssignmentHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // S2-09: Create / Edit Lead Modal
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<AdmissionLeadItem | null>(null)
  const [leadForm, setLeadForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    source: 'WEBSITE',
    programName: '',
    note: '',
    status: 'NEW',
    consultantId: '',
  })
  const [submittingLead, setSubmittingLead] = useState(false)
  const [duplicateLeadWarning, setDuplicateLeadWarning] = useState<string | null>(null)

  // S3-01: Loss Reason Modal (Bắt buộc chọn lý do khi chuyển sang Từ chối)
  const [lossModalLead, setLossModalLead] = useState<AdmissionLeadItem | null>(null)
  const [selectedLossReason, setSelectedLossReason] = useState('Học phí vượt quá ngân sách')
  const [customLossReason, setCustomLossReason] = useState('')
  const [lossNote, setLossNote] = useState('')
  const [submittingLoss, setSubmittingLoss] = useState(false)

  // S3-02: Care Logs & Callback Reminders Modal
  const [careModalLead, setCareModalLead] = useState<AdmissionLeadItem | null>(null)
  const [careType, setCareType] = useState<'CALL' | 'MESSAGE' | 'MEETING'>('CALL')
  const [careContent, setCareContent] = useState('')
  const [careRemindAt, setCareRemindAt] = useState('')
  const [submittingCareLog, setSubmittingCareLog] = useState(false)

  // S3-03: Convert Lead to Student Modal
  const [convertModalLead, setConvertModalLead] = useState<AdmissionLeadItem | null>(null)
  const [convertEntryLevel, setConvertEntryLevel] = useState('THPT')
  const [convertNote, setConvertNote] = useState('')
  const [submittingConvert, setSubmittingConvert] = useState(false)
  const [accountCreatedModalData, setAccountCreatedModalData] = useState<{
    studentCode: string
    fullName: string
    email: string
    tempPassword?: string
  } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [leadsRes, academicRes, consultantsRes] = await Promise.all([
        getAdmissionsApi({
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
          consultantId: consultantFilter !== 'ALL' ? consultantFilter : undefined,
          fromDate: fromDateFilter || undefined,
          toDate: toDateFilter || undefined,
        }),
        getAcademicDataApi(),
        getConsultantsApi().catch(() => ({ data: [] })),
      ])

      setLeads(leadsRes.data || [])
      setPrograms(academicRes.programs || [])
      setConsultants(consultantsRes.data || [])

      if (academicRes.programs.length > 0 && !leadForm.programName) {
        setLeadForm((prev) => ({ ...prev, programName: academicRes.programs[0].name }))
      }
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu tuyển sinh:', err)
      notify('error', err.response?.data?.message || 'Không thể tải dữ liệu tuyển sinh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [searchQuery, statusFilter, sourceFilter, consultantFilter, fromDateFilter, toDateFilter])

  const notify = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 6000)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setSourceFilter('ALL')
    setConsultantFilter('ALL')
    setFromDateFilter('')
    setToDateFilter('')
  }

  // ==========================================
  // S3-01: BẢNG PHỄU THEO TRẠNG THÁI (KANBAN)
  // Các cột: Mới -> Đã liên hệ -> Đang tư vấn -> Hẹn học thử -> Chốt -> Từ chối (+ Đã nhập học)
  // ==========================================
  const funnelColumns = [
    { id: 'NEW', title: 'Mới Tiếp Nhận', color: 'border-blue-500 bg-blue-50/50 text-blue-900', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'CONTACTED', title: 'Đã Liên Hệ', color: 'border-amber-500 bg-amber-50/50 text-amber-900', badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'CONSULTING', title: 'Đang Tư Vấn', color: 'border-purple-500 bg-purple-50/50 text-purple-900', badgeColor: 'bg-purple-100 text-purple-800' },
    { id: 'TRIAL_SCHEDULED', title: 'Hẹn Học Thử', color: 'border-cyan-500 bg-cyan-50/50 text-cyan-900', badgeColor: 'bg-cyan-100 text-cyan-800' },
    { id: 'CLOSED_WON', title: 'Chốt Đăng Ký', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'CLOSED_LOST', title: 'Từ Chối', color: 'border-rose-500 bg-rose-50/50 text-rose-900', badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'ENROLLED', title: 'Đã Nhập Học (Khoá)', color: 'border-indigo-500 bg-indigo-50/50 text-indigo-900', badgeColor: 'bg-indigo-100 text-indigo-800' },
  ]

  const handleStageChange = async (lead: AdmissionLeadItem, newStatus: string) => {
    if (lead.isLocked || lead.status === 'ENROLLED') {
      notify('warning', 'Hồ sơ này đã hoàn tất nhập học chính thức và đã bị khoá.')
      return
    }

    if (newStatus === 'CLOSED_LOST') {
      // Mở modal chọn lý do từ chối (BẮT BUỘC theo S3-01)
      setLossModalLead(lead)
      setSelectedLossReason('Học phí vượt quá ngân sách')
      setCustomLossReason('')
      setLossNote('')
      return
    }

    try {
      await updateLeadFunnelStatusApi(lead.id, {
        status: newStatus,
        note: `Chuyển trạng thái sang "${newStatus}"`,
      })
      notify('success', `Đã chuyển lead "${lead.fullName}" sang trạng thái "${newStatus}"!`)
      await fetchData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi cập nhật trạng thái phễu.')
    }
  }

  const handleSubmitLossReason = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lossModalLead) return

    const finalReason = selectedLossReason === 'OTHER' ? customLossReason.trim() : selectedLossReason
    if (!finalReason) {
      notify('error', 'Chuyển sang Từ chối bắt buộc phải chọn hoặc nhập lý do từ chối!')
      return
    }

    setSubmittingLoss(true)
    try {
      await updateLeadFunnelStatusApi(lossModalLead.id, {
        status: 'CLOSED_LOST',
        lossReason: finalReason,
        note: lossNote ? lossNote.trim() : `Khách từ chối: ${finalReason}`,
      })
      notify('success', `Đã chuyển lead "${lossModalLead.fullName}" sang Từ chối với lý do "${finalReason}".`)
      setLossModalLead(null)
      await fetchData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi cập nhật trạng thái từ chối.')
    } finally {
      setSubmittingLoss(false)
    }
  }

  // ==========================================
  // S3-02: Ghi nhật ký chăm sóc & Nhắc gọi lại
  // ==========================================
  const handleOpenCareModal = (lead: AdmissionLeadItem) => {
    setCareModalLead(lead)
    setCareType('CALL')
    setCareContent('')
    setCareRemindAt(lead.remindAt ? new Date(lead.remindAt).toISOString().slice(0, 16) : '')
  }

  const handleSubmitCareLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!careModalLead) return
    if (!careContent.trim()) {
      notify('error', 'Vui lòng nhập nội dung chăm sóc/tương tác.')
      return
    }

    setSubmittingCareLog(true)
    try {
      const res = await addLeadCareLogApi(careModalLead.id, {
        type: careType,
        content: careContent.trim(),
        remindAt: careRemindAt ? new Date(careRemindAt).toISOString() : undefined,
      })
      notify('success', 'Đã ghi nhận nhật ký chăm sóc thành công!')
      setCareModalLead(res.lead)
      setCareContent('')
      await fetchData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi ghi nhật ký chăm sóc.')
    } finally {
      setSubmittingCareLog(false)
    }
  }

  const isOverdueReminder = (lead: AdmissionLeadItem): boolean => {
    if (!lead.remindAt) return false
    if (lead.status === 'ENROLLED' || lead.status === 'CLOSED_LOST') return false
    return new Date(lead.remindAt).getTime() < Date.now()
  }

  // ==========================================
  // S3-03: Chuyển Lead đã chốt thành Học viên
  // ==========================================
  const handleOpenConvertModal = (lead: AdmissionLeadItem) => {
    setConvertModalLead(lead)
    setConvertEntryLevel('THPT')
    setConvertNote('')
  }

  const handleSubmitConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!convertModalLead) return

    setSubmittingConvert(true)
    try {
      const res = await convertLeadToStudentApi(convertModalLead.id, {
        entryLevel: convertEntryLevel,
        note: convertNote.trim(),
      })
      notify('success', res.message || 'Chuyển đổi thành học viên thành công!')
      setConvertModalLead(null)
      setAccountCreatedModalData({
        studentCode: res.student.studentCode,
        fullName: res.student.fullName,
        email: res.account.email,
        tempPassword: res.account.tempPassword,
      })
      await fetchData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi chuyển đổi học viên.')
    } finally {
      setSubmittingConvert(false)
    }
  }

  // ==========================================
  // S2-09: Thêm / Sửa / Xoá Lead
  // ==========================================
  const handleOpenCreateLead = () => {
    setEditingLead(null)
    setDuplicateLeadWarning(null)
    setLeadForm({
      fullName: '',
      phone: '',
      email: '',
      source: 'DIRECT',
      programName: programs[0]?.name || '',
      note: '',
      status: 'NEW',
      consultantId: isConsultantOnly ? user?.id || '' : '',
    })
    setIsLeadModalOpen(true)
  }

  const handleOpenEditLead = (lead: AdmissionLeadItem) => {
    if (lead.isLocked) {
      notify('warning', 'Hồ sơ này đã chuyển đổi thành học viên chính thức và bị khoá chỉnh sửa.')
      return
    }
    setEditingLead(lead)
    setDuplicateLeadWarning(null)
    setLeadForm({
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email || '',
      source: lead.source || 'DIRECT',
      programName: lead.programName,
      note: lead.note || '',
      status: lead.status,
      consultantId: lead.consultantId || '',
    })
    setIsLeadModalOpen(true)
  }

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingLead(true)
    try {
      if (editingLead) {
        const res = await updateLeadApi(editingLead.id, leadForm)
        notify('success', res.message || 'Cập nhật lead thành công!')
        if (res.duplicateWarning) {
          notify('warning', res.duplicateWarning)
        }
      } else {
        const res = await createLeadApi(leadForm)
        notify('success', res.message || 'Tạo khách hàng tiềm năng thành công!')
        if (res.duplicateWarning) {
          notify('warning', res.duplicateWarning)
        }
      }
      setIsLeadModalOpen(false)
      await fetchData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi lưu thông tin khách hàng.')
    } finally {
      setSubmittingLead(false)
    }
  }

  const handleDeleteLead = async (lead: AdmissionLeadItem) => {
    if (!canDeleteLead) {
      notify('error', 'Chỉ Quản lý đào tạo hoặc Quản trị viên mới có quyền xoá hồ sơ lead!')
      return
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xoá khách hàng "${lead.fullName}" khỏi hệ thống?`)) return

    try {
      const res = await deleteLeadApi(lead.id)
      notify('success', res.message || 'Đã xoá khách hàng tiềm năng!')
      await fetchData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi xoá khách hàng.')
    }
  }

  // ==========================================
  // S2-10: Bulk Assign & History
  // ==========================================
  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(leads.map((l) => l.id))
    }
  }

  const handleSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignConsultantId) {
      notify('error', 'Vui lòng chọn tư vấn viên để phân công!')
      return
    }

    setAssigning(true)
    try {
      const res = await bulkAssignLeadsApi({
        leadIds: selectedLeadIds,
        consultantId: assignConsultantId,
        note: assignNote || 'Phân công chăm sóc lead',
      })
      notify('success', res.message || `Đã phân công thành công ${res.assignedCount} khách hàng!`)
      setIsAssignModalOpen(false)
      setSelectedLeadIds([])
      setAssignNote('')
      await fetchData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi phân công tư vấn viên.')
    } finally {
      setAssigning(false)
    }
  }

  const handleViewHistory = async (lead: AdmissionLeadItem) => {
    setHistoryLead(lead)
    setHistoryLoading(true)
    try {
      const res = await getLeadHistoryApi(lead.id)
      setHistoryLogs(res.history || [])
    } catch (err: any) {
      notify('error', 'Lỗi khi tải lịch sử chuyển giao.')
    } finally {
      setHistoryLoading(false)
    }
  }

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'WEBSITE':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[10px]">Website Form</span>
      case 'FACEBOOK':
        return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[10px]">Facebook Ads</span>
      case 'GOOGLE':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-[10px]">Google Search</span>
      case 'REFERRAL':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-md text-[10px]">Giới thiệu</span>
      case 'DIRECT':
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-md text-[10px]">Tại văn phòng</span>
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-bold rounded-md text-[10px]">{source || 'Khác'}</span>
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner Tuyển Sinh Sprint 3 */}
      <div className="bg-gradient-to-r from-indigo-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/20 text-indigo-200">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>QUẢN LÝ TUYỂN SINH & PHỄU CHĂM SÓC KHÁCH HÀNG (S3-01 → S3-03)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Bảng Phễu Tuyển Sinh & Chuyển Đổi Học Viên
          </h1>
          <p className="mt-2 text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Theo dõi khách hàng tiềm năng qua 6 giai đoạn phễu, đặt lịch nhắc gọi lại với cảnh báo quá hạn nổi bật, bắt buộc chọn lý do khi từ chối và tự động chuyển đổi sang hồ sơ học viên chính thức.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <button
              onClick={handleOpenCreateLead}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Khách Hàng Tiềm Năng</span>
            </button>

            {canAssignLead && (
              <button
                disabled={selectedLeadIds.length === 0}
                onClick={() => setIsAssignModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Phân Công Hàng Loạt ({selectedLeadIds.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thông Báo Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : notification.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* S2-11: BỘ LỌC ĐA TIÊU CHÍ */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm nhanh theo Họ tên hoặc Số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Switch View Mode: Table vs Kanban */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setViewMode('KANBAN')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'KANBAN' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Bảng Phễu (S3-01)</span>
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Dạng Bảng (S2-11)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NEW">Mới tiếp nhận</option>
              <option value="CONTACTED">Đã liên hệ</option>
              <option value="CONSULTING">Đang tư vấn</option>
              <option value="TRIAL_SCHEDULED">Hẹn học thử</option>
              <option value="CLOSED_WON">Chốt đăng ký</option>
              <option value="CLOSED_LOST">Từ chối</option>
              <option value="ENROLLED">Đã nhập học</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Nguồn tiếp nhận</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden font-medium"
            >
              <option value="ALL">Tất cả nguồn</option>
              <option value="DIRECT">Trực tiếp</option>
              <option value="WEBSITE">Website Form (S2-08)</option>
              <option value="FACEBOOK">Facebook Ads</option>
              <option value="GOOGLE">Google Ads</option>
              <option value="REFERRAL">Giới thiệu</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Người phụ trách</label>
            <select
              value={consultantFilter}
              onChange={(e) => setConsultantFilter(e.target.value)}
              disabled={isConsultantOnly}
              className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden font-medium disabled:bg-gray-100"
            >
              <option value="ALL">{isConsultantOnly ? 'Lead được giao cho bạn' : 'Tất cả tư vấn viên'}</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={fromDateFilter}
              onChange={(e) => setFromDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Đến ngày</label>
              <input
                type="date"
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden"
              />
            </div>
            <button
              onClick={resetFilters}
              title="Đặt lại bộ lọc"
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* S3-01: VIEW 1 - BẢNG PHỄU (KANBAN BOARD CRM) */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
          {funnelColumns.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.id)
            return (
              <div
                key={col.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-xs flex flex-col h-[760px] overflow-hidden"
              >
                {/* Header cột phễu kèm đếm số lượng S3-01 */}
                <div className={`p-3.5 border-b border-gray-100 flex items-center justify-between ${col.color}`}>
                  <h3 className="font-bold text-xs uppercase tracking-wide truncate">{col.title}</h3>
                  <span className="w-5 h-5 rounded-full bg-white font-black text-[11px] flex items-center justify-center shadow-2xs shrink-0">
                    {colLeads.length}
                  </span>
                </div>

                {/* Danh sách thẻ lead trong cột */}
                <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 bg-slate-50/50">
                  {colLeads.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-[11px] text-gray-400 italic">
                      Trống
                    </div>
                  ) : (
                    colLeads.map((lead) => {
                      const overdue = isOverdueReminder(lead)
                      return (
                        <div
                          key={lead.id}
                          className={`bg-white p-3.5 rounded-2xl border transition-all space-y-2 relative group shadow-2xs hover:shadow-md ${
                            lead.isLocked
                              ? 'border-indigo-200 bg-indigo-50/20'
                              : overdue
                              ? 'border-red-400 ring-2 ring-red-100'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          {/* Header thẻ: Tên & Nguồn */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <div className="flex items-center gap-1">
                                {lead.isLocked && <Lock className="w-3 h-3 text-indigo-600 shrink-0" />}
                                <h4 className="font-bold text-xs text-gray-900 leading-tight">{lead.fullName}</h4>
                              </div>
                              <p className="text-[10px] font-semibold text-indigo-700 truncate">{lead.programName}</p>
                            </div>
                            {getSourceBadge(lead.source)}
                          </div>

                          {/* Thông tin liên lạc */}
                          <div className="space-y-1 text-[11px] text-gray-500">
                            <div className="flex items-center gap-1.5 font-mono">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{lead.phone}</span>
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                              <span>Phụ trách:</span>
                              <span className="font-semibold text-gray-700 truncate max-w-[100px]">
                                {lead.consultantName || 'Chưa giao'}
                              </span>
                            </div>
                          </div>

                          {/* S3-02: Cảnh báo quá hạn gọi lại nổi bật */}
                          {overdue && (
                            <div className="p-1.5 bg-red-100 border border-red-300 rounded-xl text-[10px] font-bold text-red-800 flex items-center gap-1.5 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span className="truncate">
                                ⚠️ Quá hạn gọi! ({new Date(lead.remindAt!).toLocaleDateString('vi-VN')})
                              </span>
                            </div>
                          )}

                          {/* Lịch hẹn gọi lại trong tương lai */}
                          {!overdue && lead.remindAt && lead.status !== 'ENROLLED' && (
                            <div className="p-1 bg-amber-50 rounded-lg text-[10px] text-amber-800 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">
                                Hẹn: {new Date(lead.remindAt).toLocaleDateString('vi-VN')} {new Date(lead.remindAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}

                          {/* Hiển thị lý do từ chối nếu ở cột CLOSED_LOST */}
                          {lead.status === 'CLOSED_LOST' && lead.lossReason && (
                            <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800">
                              <span className="font-bold">Lý do từ chối:</span> {lead.lossReason}
                            </div>
                          )}

                          {/* Hiển thị mã học viên nếu đã ENROLLED */}
                          {lead.status === 'ENROLLED' && lead.studentCode && (
                            <div className="p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-[10px] text-indigo-900 font-bold flex items-center justify-between">
                              <span>Mã HV: {lead.studentCode}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                          )}

                          {/* S3-01 & S3-03: Điều khiển luồng trạng thái */}
                          {!lead.isLocked && lead.status !== 'ENROLLED' && (
                            <div className="pt-1.5 border-t border-gray-100 space-y-1">
                              {/* Nút hành động chính tuỳ theo từng cột */}
                              {lead.status === 'NEW' && (
                                <button
                                  onClick={() => handleStageChange(lead, 'CONTACTED')}
                                  className="w-full py-1 text-center bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Đã liên hệ →
                                </button>
                              )}

                              {lead.status === 'CONTACTED' && (
                                <button
                                  onClick={() => handleStageChange(lead, 'CONSULTING')}
                                  className="w-full py-1 text-center bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Đang tư vấn →
                                </button>
                              )}

                              {lead.status === 'CONSULTING' && (
                                <button
                                  onClick={() => handleStageChange(lead, 'TRIAL_SCHEDULED')}
                                  className="w-full py-1 text-center bg-cyan-50 hover:bg-cyan-100 text-cyan-900 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Hẹn học thử →
                                </button>
                              )}

                              {lead.status === 'TRIAL_SCHEDULED' && (
                                <button
                                  onClick={() => handleStageChange(lead, 'CLOSED_WON')}
                                  className="w-full py-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Chốt đăng ký ★
                                </button>
                              )}

                              {lead.status === 'CLOSED_WON' && (
                                <button
                                  onClick={() => handleOpenConvertModal(lead)}
                                  className="w-full py-1.5 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>Chuyển Thành Học Viên (S3-03)</span>
                                </button>
                              )}

                              {/* Dropdown chuyển cột nhanh */}
                              <div className="flex items-center gap-1 pt-0.5">
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleStageChange(lead, e.target.value)}
                                  className="w-full text-[10px] py-1 px-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-hidden"
                                >
                                  <option value="" disabled>Chuyển giai đoạn...</option>
                                  <option value="NEW">Mới</option>
                                  <option value="CONTACTED">Đã liên hệ</option>
                                  <option value="CONSULTING">Đang tư vấn</option>
                                  <option value="TRIAL_SCHEDULED">Hẹn học thử</option>
                                  <option value="CLOSED_WON">Chốt</option>
                                  <option value="CLOSED_LOST">Từ chối (bắt buộc lý do)</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Footer thẻ: Nút Nhật ký chăm sóc & Lịch sử */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400 border-t border-gray-100">
                            <button
                              onClick={() => handleOpenCareModal(lead)}
                              className="hover:text-indigo-600 flex items-center gap-1 font-medium cursor-pointer"
                              title="Ghi nhật ký tương tác & đặt lịch nhắc gọi lại"
                            >
                              <PhoneCall className="w-3 h-3 text-indigo-500" />
                              <span>Chăm sóc ({lead.careLogs?.length || 0})</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleViewHistory(lead)}
                                className="hover:text-indigo-600 cursor-pointer"
                                title="Xem lịch sử chuyển giao"
                              >
                                <History className="w-3 h-3" />
                              </button>
                              {!lead.isLocked && (
                                <button
                                  onClick={() => handleOpenEditLead(lead)}
                                  className="hover:text-amber-600 cursor-pointer"
                                  title="Sửa thông tin"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              )}
                              {canDeleteLead && !lead.isLocked && (
                                <button
                                  onClick={() => handleDeleteLead(lead)}
                                  className="hover:text-red-600 cursor-pointer"
                                  title="Xoá"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // VIEW 2: DẠNG BẢNG DANH SÁCH (TABLE CRM)
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  {canAssignLead && (
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                        onChange={toggleSelectAll}
                        className="rounded-sm border-gray-300 text-indigo-600 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Chương trình quan tâm</th>
                  <th className="p-4">Nguồn</th>
                  <th className="p-4">Trạng thái (Phễu)</th>
                  <th className="p-4">Nhắc hẹn gọi lại</th>
                  <th className="p-4">Tư vấn viên</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400 italic">
                      Không tìm thấy khách hàng tiềm năng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const overdue = isOverdueReminder(lead)
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                        {canAssignLead && (
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={() => toggleSelectLead(lead.id)}
                              className="rounded-sm border-gray-300 text-indigo-600 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-bold text-gray-900">
                            {lead.isLocked && <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            <span>{lead.fullName}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2 mt-0.5">
                            <span>{lead.phone}</span>
                            {lead.email && <span className="text-gray-400">• {lead.email}</span>}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-indigo-900 max-w-[200px] truncate">
                          {lead.programName}
                        </td>
                        <td className="p-4">{getSourceBadge(lead.source)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={lead.status}
                              disabled={lead.isLocked}
                              onChange={(e) => handleStageChange(lead, e.target.value)}
                              className="text-[11px] font-bold px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 focus:outline-hidden disabled:opacity-75 cursor-pointer"
                            >
                              <option value="NEW">Mới tiếp nhận</option>
                              <option value="CONTACTED">Đã liên hệ</option>
                              <option value="CONSULTING">Đang tư vấn</option>
                              <option value="TRIAL_SCHEDULED">Hẹn học thử</option>
                              <option value="CLOSED_WON">Chốt đăng ký</option>
                              <option value="CLOSED_LOST">Từ chối</option>
                              <option value="ENROLLED">Đã nhập học</option>
                            </select>
                          </div>
                          {lead.status === 'CLOSED_LOST' && lead.lossReason && (
                            <p className="text-[10px] text-rose-600 mt-1 italic">Lý do: {lead.lossReason}</p>
                          )}
                        </td>
                        <td className="p-4">
                          {overdue ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-md text-[10px] flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              Quá hạn ({new Date(lead.remindAt!).toLocaleDateString('vi-VN')})
                            </span>
                          ) : lead.remindAt ? (
                            <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              {new Date(lead.remindAt).toLocaleDateString('vi-VN')} {new Date(lead.remindAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Chưa đặt lịch</span>
                          )}
                        </td>
                        <td className="p-4 font-medium text-gray-700">
                          {lead.consultantName || <span className="text-gray-400 italic">Chưa phân công</span>}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.status === 'CLOSED_WON' && !lead.isLocked && (
                              <button
                                onClick={() => handleOpenConvertModal(lead)}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Chuyển sang Học viên chính thức"
                              >
                                <GraduationCap className="w-3 h-3" />
                                <span>Chuyển HV</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenCareModal(lead)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                              title="Nhật ký chăm sóc & Nhắc gọi lại"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleViewHistory(lead)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                              title="Lịch sử phân công"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {!lead.isLocked && (
                              <button
                                onClick={() => handleOpenEditLead(lead)}
                                className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {canDeleteLead && !lead.isLocked && (
                              <button
                                onClick={() => handleDeleteLead(lead)}
                                className="p-1.5 text-gray-500 hover:text-rose-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                                title="Xoá hồ sơ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-01: BẮT BUỘC CHỌN LÝ DO KHI TỪ CHỐI (CLOSED_LOST)
      ======================================================== */}
      {lossModalLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Xác Nhận Chuyển Sang "Từ Chối" (S3-01)</span>
              </h3>
              <button onClick={() => setLossModalLead(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Theo quy trình tuyển sinh, khi chuyển khách hàng <strong>{lossModalLead.fullName}</strong> sang trạng thái{' '}
              <span className="font-bold text-rose-700">Từ chối</span>, bạn <strong>bắt buộc phải ghi nhận lý do</strong> để phân tích tỷ lệ rớt phễu.
            </p>

            <form onSubmit={handleSubmitLossReason} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Lý do từ chối (Bắt buộc) *</label>
                <select
                  value={selectedLossReason}
                  onChange={(e) => setSelectedLossReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                >
                  <option value="Học phí vượt quá ngân sách">Học phí vượt quá ngân sách</option>
                  <option value="Không phù hợp thời gian / Lịch học">Không phù hợp thời gian / Lịch học</option>
                  <option value="Đã chọn trung tâm / Trường khác">Đã chọn trung tâm / Trường khác</option>
                  <option value="Chỉ tham khảo, chưa có nhu cầu học ngay">Chỉ tham khảo, chưa có nhu cầu học ngay</option>
                  <option value="Không liên lạc được / Thuê bao nhiều lần">Không liên lạc được / Thuê bao nhiều lần</option>
                  <option value="OTHER">Lý do khác (Nhập chi tiết bên dưới)</option>
                </select>
              </div>

              {selectedLossReason === 'OTHER' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nhập lý do cụ thể *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nêu rõ lý do khách hàng từ chối..."
                    value={customLossReason}
                    onChange={(e) => setCustomLossReason(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú bổ sung</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về phản hồi của khách hàng..."
                  value={lossNote}
                  onChange={(e) => setLossNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setLossModalLead(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submittingLoss}
                  className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingLoss ? 'Đang lưu...' : 'Xác Nhận Từ Chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-02: NHẬT KÝ CHĂM SÓC & ĐẶT LỊCH NHẮC GỌI LẠI
      ======================================================== */}
      {careModalLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold">
                  <PhoneCall className="w-3 h-3" />
                  <span>S3-02: Nhật ký chăm sóc & Nhắc gọi lại</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  Chăm Sóc: {careModalLead.fullName} ({careModalLead.phone})
                </h3>
              </div>
              <button onClick={() => setCareModalLead(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form ghi nhận tương tác mới */}
            <form onSubmit={handleSubmitCareLog} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 text-xs">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Ghi Nhận Cuộc Tương Tác Mới</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Loại tương tác *</label>
                  <select
                    value={careType}
                    onChange={(e: any) => setCareType(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="CALL">📞 Gọi điện thoại</option>
                    <option value="MESSAGE">💬 Nhắn tin SMS / Zalo</option>
                    <option value="MEETING">👥 Gặp trực tiếp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Đặt ngày nhắc gọi lại</label>
                  <input
                    type="datetime-local"
                    value={careRemindAt}
                    onChange={(e) => setCareRemindAt(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nội dung trao đổi *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Khách quan tâm khoá học, thắc mắc về học phí và lịch học cuối tuần..."
                  value={careContent}
                  onChange={(e) => setCareContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingCareLog}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingCareLog ? 'Đang lưu...' : 'Lưu Tương Tác'}
                </button>
              </div>
            </form>

            {/* Danh sách lịch sử các lần tương tác */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Lịch Sử Chăm Sóc ({careModalLead.careLogs?.length || 0})
              </h4>

              {(!careModalLead.careLogs || careModalLead.careLogs.length === 0) ? (
                <div className="p-6 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 italic">
                  Chưa có lần tương tác nào được ghi nhận cho khách hàng này.
                </div>
              ) : (
                <div className="space-y-2">
                  {careModalLead.careLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-white rounded-2xl border border-gray-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-700 flex items-center gap-1">
                          {log.type === 'CALL' && '📞 Gọi điện'}
                          {log.type === 'MESSAGE' && '💬 Nhắn tin'}
                          {log.type === 'MEETING' && '👥 Gặp trực tiếp'}
                        </span>
                        <span className="text-gray-400">
                          {new Date(log.createdAt).toLocaleString('vi-VN')} ({log.createdByName})
                        </span>
                      </div>
                      <p className="text-gray-800 text-xs">{log.content}</p>
                      {log.remindAt && (
                        <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 pt-1 border-t border-gray-100">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Hẹn nhắc gọi lại: {new Date(log.remindAt).toLocaleString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCareModalLead(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-03: CHUYỂN LEAD ĐÃ CHỐT THÀNH HỒ SƠ HỌC VIÊN
      ======================================================== */}
      {convertModalLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Chuyển Thành Hồ Sơ Học Viên (S3-03)</span>
              </h3>
              <button onClick={() => setConvertModalLead(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-1">
              <div className="font-bold">Khách hàng: {convertModalLead.fullName}</div>
              <div>Số điện thoại: <span className="font-mono">{convertModalLead.phone}</span></div>
              <div>Chương trình: <strong>{convertModalLead.programName}</strong></div>
              <p className="text-[11px] text-indigo-700 pt-1 border-t border-indigo-100 italic">
                Hệ thống sẽ tự động tạo mã học viên (HV2026-XXX), sinh tài khoản đăng nhập và chuyển lead sang trạng thái "Đã nhập học" (khoá chỉnh sửa).
              </p>
            </div>

            <form onSubmit={handleSubmitConvert} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Trình độ đầu vào (S3-04) *</label>
                <select
                  value={convertEntryLevel}
                  onChange={(e) => setConvertEntryLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                >
                  <option value="THPT">Tốt nghiệp THPT</option>
                  <option value="Cao đẳng">Tốt nghiệp Cao đẳng</option>
                  <option value="Đại học">Tốt nghiệp Đại học chuyên ngành</option>
                  <option value="Người đi làm chuyển ngành">Người đi làm chuyển đổi nghề nghiệp</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú hồ sơ</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về học viên khi bắt đầu vào học..."
                  value={convertNote}
                  onChange={(e) => setConvertNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setConvertModalLead(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submittingConvert}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingConvert ? 'Đang chuyển đổi...' : 'Xác Nhận Chuyển Học Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PHẢN HỒI TÀI KHOẢN HỌC VIÊN ĐƯỢC TẠO S3-03 */}
      {accountCreatedModalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900">Tạo Hồ Sơ Học Viên Thành Công!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Đã chuyển đổi thành công khách hàng <strong className="text-gray-900">{accountCreatedModalData.fullName}</strong>.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Mã học viên:</span>
                <span className="font-mono font-bold text-indigo-700">{accountCreatedModalData.studentCode}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Email đăng nhập:</span>
                <span className="font-mono font-semibold text-gray-900">{accountCreatedModalData.email}</span>
              </div>
              {accountCreatedModalData.tempPassword && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Mật khẩu ban đầu:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {accountCreatedModalData.tempPassword}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 italic">
              Email thông tin tài khoản và hướng dẫn nhập học đã được tự động gửi đến học viên.
            </p>

            <button
              onClick={() => setAccountCreatedModalData(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        </div>
      )}

      {/* MODAL S2-09: THÊM / SỬA LEAD */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>{editingLead ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Tiềm Năng Mới'}</span>
              </h3>
              <button onClick={() => setIsLeadModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateLeadWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Cảnh báo:</span> {duplicateLeadWarning}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveLead} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={leadForm.fullName}
                    onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912345678"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nguồn tiếp nhận</label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DIRECT">Trực tiếp tại trường</option>
                    <option value="WEBSITE">Website công khai</option>
                    <option value="FACEBOOK">Facebook Ads</option>
                    <option value="GOOGLE">Google Ads</option>
                    <option value="REFERRAL">Người quen giới thiệu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Chương trình quan tâm *</label>
                <select
                  value={leadForm.programName}
                  onChange={(e) => setLeadForm({ ...leadForm, programName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Trạng thái phễu</label>
                  <select
                    value={leadForm.status}
                    onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="NEW">Mới tiếp nhận</option>
                    <option value="CONTACTED">Đã liên hệ</option>
                    <option value="CONSULTING">Đang tư vấn</option>
                    <option value="TRIAL_SCHEDULED">Hẹn học thử</option>
                    <option value="CLOSED_WON">Chốt đăng ký</option>
                    <option value="CLOSED_LOST">Từ chối</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tư vấn viên</label>
                  <select
                    value={leadForm.consultantId}
                    onChange={(e) => setLeadForm({ ...leadForm, consultantId: e.target.value })}
                    disabled={isConsultantOnly}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">-- Chưa phân công --</option>
                    {consultants.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về nhu cầu, thắc mắc..."
                  value={leadForm.note}
                  onChange={(e) => setLeadForm({ ...leadForm, note: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingLead}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingLead ? 'Đang lưu...' : editingLead ? 'Cập Nhật' : 'Lưu Khách Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL S2-10: PHÂN CÔNG HÀNG LOẠT */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span>Phân Công Tư Vấn Viên (S2-10)</span>
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Bạn đang phân công <strong className="text-indigo-600">{selectedLeadIds.length}</strong> khách hàng tiềm năng cho tư vấn viên.
            </p>

            <form onSubmit={handleSubmitAssign} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Chọn tư vấn viên tiếp nhận *</label>
                <select
                  value={assignConsultantId}
                  onChange={(e) => setAssignConsultantId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="">-- Chọn tư vấn viên --</option>
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ghi chú chuyển giao</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú đợt giao..."
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={assigning || !assignConsultantId}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {assigning ? 'Đang xử lý...' : 'Xác Nhận Phân Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL S2-10: LỊCH SỬ CHUYỂN GIAO */}
      {historyLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Lịch Sử Phân Công: {historyLead.fullName}
                </h3>
                <p className="text-xs text-gray-500">Số điện thoại: {historyLead.phone}</p>
              </div>
              <button onClick={() => setHistoryLead(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {historyLoading ? (
                <div className="p-8 text-center text-xs text-gray-400">Đang tải lịch sử...</div>
              ) : historyLogs.length === 0 ? (
                <div className="p-8 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 italic">
                  Chưa có lịch sử chuyển giao nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>{new Date(log.assignedAt).toLocaleString('vi-VN')}</span>
                        <span className="font-semibold text-indigo-600">Bởi: {log.assignedByName}</span>
                      </div>
                      <div className="font-bold text-gray-900">
                        Bàn giao cho: <span className="text-indigo-700">{log.consultantName}</span>
                      </div>
                      {log.note && <p className="text-[11px] text-gray-600 italic">"{log.note}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setHistoryLead(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
