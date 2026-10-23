import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getPublicProgramsApi,
  submitPublicConsultationApi,
} from '../api/academicApi'
import { extractApiError } from '../api/authApi'
import {
  Building2,
  GraduationCap,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Headphones,
  Award,
  ChevronRight,
  Home
} from 'lucide-react'

export default function PublicConsultationPage() {
  const navigate = useNavigate()

  // Form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [programName, setProgramName] = useState('')
  const [note, setNote] = useState('')
  const [programs, setPrograms] = useState<Array<{ id: string; code: string; name: string }>>([])

  // Chống spam: Honeypot & Math Captcha
  const [websiteTrap, setWebsiteTrap] = useState('')
  const [captchaNum1, setCaptchaNum1] = useState(5)
  const [captchaNum2, setCaptchaNum2] = useState(7)
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  // Trạng thái xử lý
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<{
    leadName: string
    program: string
    commitment: string
    message: string
  } | null>(null)

  // Khởi tạo Math Captcha ngẫu nhiên
  const refreshCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2 // 2 - 9
    const n2 = Math.floor(Math.random() * 8) + 2 // 2 - 9
    setCaptchaNum1(n1)
    setCaptchaNum2(n2)
    setCaptchaAnswer('')
  }

  useEffect(() => {
    refreshCaptcha()
    // Tải danh mục chương trình đào tạo mở
    getPublicProgramsApi()
      .then((res) => {
        setPrograms(res.data)
        if (res.data.length > 0) {
          setProgramName(res.data[0].name)
        } else {
          setProgramName('Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)')
        }
      })
      .catch(() => {
        setProgramName('Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)')
      })
  }, [])

  // S2-02 & S2-08: Kiểm tra định dạng số điện thoại Việt Nam
  const validatePhoneVN = (val: string) => {
    if (!val.trim()) {
      setPhoneError('Vui lòng nhập số điện thoại.')
      return false
    }
    const clean = val.trim().replace(/[\s.-]/g, '')
    const regex = /^(0|\+84)[35789][0-9]{8}$/
    if (!regex.test(clean)) {
      setPhoneError('Số điện thoại không đúng định dạng Việt Nam (10 chữ số, ví dụ 0912345678).')
      return false
    }
    setPhoneError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.')
      return
    }

    if (!validatePhoneVN(phone)) {
      return
    }

    // Kiểm tra Math captcha
    const expected = captchaNum1 + captchaNum2
    if (parseInt(captchaAnswer, 10) !== expected) {
      setErrorMsg(`Mã xác thực chống spam chưa đúng (${captchaNum1} + ${captchaNum2} = ?). Vui lòng thử lại!`)
      refreshCaptcha()
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await submitPublicConsultationApi({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        programName: programName || 'Kỹ nghệ Phần mềm Chuẩn Quốc tế',
        note: note.trim() || undefined,
        websiteTrap: websiteTrap.trim() || undefined,
        captchaAnswer: captchaAnswer.trim(),
        expectedCaptcha: String(expected),
      })

      setSuccessResult({
        leadName: fullName.trim(),
        program: programName,
        commitment: res.commitment,
        message: res.message,
      })
    } catch (err: any) {
      setErrorMsg(extractApiError(err).message)
      refreshCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 text-gray-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 flex items-center justify-between shadow-2xs">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h1 className="font-black text-gray-900 text-sm tracking-tight leading-none uppercase">
              Đại Học Đào Tạo TMS
            </h1>
            <span className="text-[10px] font-bold text-indigo-600 tracking-wider">
              CỔNG ĐĂNG KÝ TƯ VẤN TUYỂN SINH TRỰC TUYẾN
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs"
          >
            <span>Đăng nhập hệ thống</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {successResult ? (
          /* S2-08: Màn hình cảm ơn trang trọng và cam kết thời gian liên hệ */
          <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wide">
              Đăng ký thành công
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-4 mb-3 tracking-tight">
              Cảm ơn bạn, {successResult.leadName}!
            </h2>

            <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed mb-6">
              Ban Tuyển sinh TMS đã tiếp nhận hồ sơ đăng ký tư vấn chương trình{' '}
              <strong className="text-indigo-700 font-bold">{successResult.program}</strong> của bạn.
            </p>

            {/* Khung cam kết thời gian liên hệ S2-08 */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50/60 border border-indigo-100 text-left mb-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  Cam kết dịch vụ hỗ trợ
                </p>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {successResult.commitment}
                </p>
                <p className="text-[11px] text-gray-500 pt-1">
                  Đội ngũ chuyên viên tư vấn sẽ chuẩn bị lộ trình môn học, biểu phí học bổng và gọi lại trực tiếp qua số điện thoại{' '}
                  <span className="font-bold text-gray-800">{phone}</span>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSuccessResult(null)
                  setFullName('')
                  setPhone('')
                  setEmail('')
                  setNote('')
                  refreshCaptcha()
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Gửi thêm thông tin khác
              </button>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 transition-colors shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <span>Đến trang đăng nhập TMS</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Biểu mẫu đăng ký S2-08 */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Cột trái: Giới thiệu & Điểm nổi bật */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/70 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Tuyển sinh Khóa K15 · Kỳ Học Mới 2026 - 2027</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  Nhận tư vấn lộ trình học tập & Học bổng đào tạo
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Để lại thông tin của bạn bên dưới. Chuyên viên tư vấn tuyển sinh TMS sẽ liên hệ lại trong vòng{' '}
                  <strong className="text-indigo-700">30 phút</strong> để tư vấn chi tiết khung chương trình, học phí và bài test đầu vào.
                </p>
              </div>

              {/* Các điểm nổi bật */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Chuẩn Đại học Công nghệ Thực chiến</h4>
                    <p className="text-[11px] text-gray-500">Giảng dạy bởi các chuyên gia & thạc sĩ giàu kinh nghiệm</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Học bổng lên tới 100%</h4>
                    <p className="text-[11px] text-gray-500">Dành cho thí sinh có thành tích xét tuyển xuất sắc</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Cam kết phản hồi trong 30 phút</h4>
                    <p className="text-[11px] text-gray-500">Tư vấn tận tâm, hoàn toàn miễn phí 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Form đăng ký công khai (S2-08) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Biểu mẫu đăng ký tư vấn trực tuyến</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Vui lòng điền chính xác số điện thoại để chuyên viên gọi lại tư vấn
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot chống spam bot (Ẩn khỏi người dùng) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="website_trap"
                      value={websiteTrap}
                      onChange={(e) => setWebsiteTrap(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Họ và tên */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nguyễn Văn An"
                          required
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-hidden transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Số điện thoại (S2-08 & S2-02) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value)
                            validatePhoneVN(e.target.value)
                          }}
                          placeholder="0912345678"
                          required
                          className={`w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border rounded-xl text-xs font-medium focus:bg-white focus:ring-2 outline-hidden transition-all shadow-2xs ${
                            phoneError
                              ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                              : 'border-gray-200 focus:ring-indigo-600 focus:border-transparent'
                          }`}
                        />
                      </div>
                      {phoneError && <p className="text-[11px] text-red-600 mt-1 font-medium">{phoneError}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="an.nguyen@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-hidden transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Chương trình quan tâm */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Chương trình đào tạo quan tâm
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <select
                          value={programName}
                          onChange={(e) => setProgramName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-hidden transition-all shadow-2xs cursor-pointer"
                        >
                          {programs.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                          {programs.length === 0 && (
                            <option value="Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)">
                              Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Nhu cầu tư vấn / Ghi chú */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nhu cầu / Câu hỏi bạn muốn được giải đáp
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Em muốn tìm hiểu chính sách học phí trả góp, thời gian học ca tối hoặc cơ hội việc làm sau tốt nghiệp..."
                      rows={2}
                      className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-hidden transition-all shadow-2xs"
                    />
                  </div>

                  {/* S2-08: Math Challenge Captcha chống spam */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-xs font-bold text-gray-800">
                        Xác thực chống spam: <span className="text-indigo-700 font-mono text-sm">{captchaNum1} + {captchaNum2} = ?</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="Kết quả"
                        required
                        className="w-24 px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-indigo-600 outline-hidden shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                        title="Đổi câu hỏi khác"
                      >
                        Đổi câu
                      </button>
                    </div>
                  </div>

                  {/* Nút gửi form */}
                  <button
                    type="submit"
                    disabled={loading || Boolean(phoneError)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-700 to-indigo-900 text-white font-bold text-xs hover:from-indigo-800 hover:to-indigo-950 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>Đang tiếp nhận thông tin...</span>
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        <span>Đăng ký nhận cuộc gọi tư vấn ngay (Miễn phí)</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-gray-500 pt-1">
                    * Thông tin của bạn được bảo mật an toàn theo chính sách Đại học TMS.
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white/60 py-6 px-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ & QUẢN LÝ ĐÀO TẠO TMS</span>
          <span>·</span>
          <span>Hotline tuyển sinh: 1900 6868</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <Link to="/login" className="hover:text-indigo-600 font-semibold">
            Cổng sinh viên / cán bộ
          </Link>
          <span>·</span>
          <span>Email: tuyensinh@tms.edu.vn</span>
        </div>
      </footer>
    </div>
  )
}
