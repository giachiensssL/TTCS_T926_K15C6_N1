import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { loginApi, extractApiError } from '../api/authApi'
import { useAuthStore, roleToPath } from '../store/authStore'
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Building2,
  Sparkles,
  BookOpen,
  Award,
  Users,
  ChevronRight,
  Info,
  X,
  Phone,
  HelpCircle,
  FileText,
  Check
} from 'lucide-react'

// Danh sách các hình ảnh khuôn viên trường đại học thực tế từ Supabase
const CAMPUS_SCENES = [
  {
    id: 'campus-1',
    name: 'Khuôn viên Toàn cảnh',
    tag: 'Không Gian Học Thuật Xanh',
    badge: 'Khuôn Viên Chính',
    image: 'https://fkuthmuchnvkydolraor.supabase.co/storage/v1/object/public/web-album/khuon-vien-truong/5a6b739b-3195-40c8-8973-9c2a1111df60.jpg',
    headline: 'Môi Trường Đào Tạo Đại Học Chuẩn Quốc Gia',
    quote: 'Nơi kết nối tri thức, phát triển năng lực sáng tạo và kiến tạo các thế hệ kỹ sư công nghệ tiên phong hàng đầu.',
  },
  {
    id: 'campus-2',
    name: 'Giảng đường Hiện đại',
    tag: 'Hạ Tầng Giảng Dạy Thông Minh',
    badge: 'Đổi Mới Sáng Tạo',
    image: 'https://fkuthmuchnvkydolraor.supabase.co/storage/v1/object/public/web-album/khuon-vien-truong/af296537-3702-4665-867e-b02b6773b9db.jpg',
    headline: 'Không Gian Tri Thức & Học Liệu Tiên Tiến',
    quote: 'Hệ thống giảng đường thông minh, kết nối học liệu số mở và nghiên cứu ứng dụng thực tiễn đạt chuẩn quốc tế.',
  },
  {
    id: 'campus-3',
    name: 'Trung tâm Nghiên cứu & Trải nghiệm',
    tag: 'Thực Hành & Hợp Tác Doanh Nghiệp',
    badge: 'Phát Triển Toàn Diện',
    image: 'https://fkuthmuchnvkydolraor.supabase.co/storage/v1/object/public/web-album/khuon-vien-truong/c18ab0f0-3b1c-43af-a1f4-1b5c05a04ff2.jpg',
    headline: 'Khơi Nguồn Sáng Tạo & Khát Vọng Tương Lai',
    quote: 'Môi trường rèn luyện thực chiến, gắn kết chặt chẽ giữa đào tạo đại học và nhu cầu nhân lực chất lượng cao.',
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(0)

  // Hiệu ứng giao diện cao cấp
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [capsLockActive, setCapsLockActive] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null)
  const [ripple, setRipple] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { accessToken, user, setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Tự động xoay ảnh nền toàn màn hình sau mỗi 6 giây
  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % CAMPUS_SCENES.length)
    }, 6000)

    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current)
    }
  }, [])

  // S1-01 AC-05: Nếu đã đăng nhập, chuyển hướng ngay về trang chủ theo vai trò
  useEffect(() => {
    if (accessToken && user) {
      const targetRole = user.activeRole || user.roles[0] || 'GUEST'
      navigate(roleToPath[targetRole] || '/dashboard', { replace: true })
    }
  }, [accessToken, user, navigate])

  // Đếm ngược khoá tạm thời (S1-01 AC-03)
  const startLockCountdown = (lockedUntilIso: string) => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    const targetMs = new Date(lockedUntilIso).getTime()

    const tick = () => {
      const remainingMs = targetMs - Date.now()
      if (remainingMs <= 0) {
        setIsLocked(false)
        setCountdownSeconds(0)
        setGlobalError('')
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
      } else {
        setCountdownSeconds(Math.ceil(remainingMs / 1000))
        setIsLocked(true)
      }
    }
    tick()
    countdownTimerRef.current = setInterval(tick, 1000)
  }

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [])

  // Client validation trước khi gọi API
  const validateForm = () => {
    const errs: { email?: string; password?: string } = {}
    const trimmed = email.trim()
    if (!trimmed) {
      errs.email = 'Vui lòng nhập tài khoản, mã sinh viên hoặc email.'
    }

    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu.'
    } else if (password.length < 5) {
      errs.password = 'Mật khẩu phải có ít nhất 5 ký tự.'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Bắt sự kiện phím Caps Lock
  const handleKeyActivity = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'))
    }
  }

  // Tạo hiệu ứng sóng lan toả (Ripple)
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    })
    setTimeout(() => setRipple((prev) => ({ ...prev, active: false })), 600)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError('')
    setIsShaking(false)

    if (!validateForm()) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      return
    }

    setLoading(true)
    try {
      const res = await loginApi(email.trim(), password)
      setAuth(res.accessToken, res.user)

      setIsSuccess(true)
      setTimeout(() => {
        const redirectPath = searchParams.get('redirect')
        const target = redirectPath && redirectPath.startsWith('/') ? redirectPath : roleToPath[res.role] || '/dashboard'
        navigate(target, { replace: true })
      }, 400)
    } catch (err) {
      const apiErr = extractApiError(err)

      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)

      if (apiErr.code === 'AUTH_ACCOUNT_LOCKED' && apiErr.lockedUntil) {
        setGlobalError(apiErr.message)
        startLockCountdown(apiErr.lockedUntil)
      } else {
        setGlobalError(apiErr.message || 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.')
      }
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const currentScene = CAMPUS_SCENES[currentSceneIndex]

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-slate-800 antialiased selection:bg-blue-700 selection:text-white">

      {/* ========================================================================= */}
      {/* ẢNH NỀN TOÀN MÀN HÌNH ĐỘNG 100% (FULLSCREEN IMMERSIVE CAMPUS BACKGROUND)     */}
      {/* Phủ kín toàn bộ 100% màn hình, không bị viền đen, tự động chuyển cảnh       */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {CAMPUS_SCENES.map((scene, idx) => (
          <div
            key={scene.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSceneIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Ảnh nền phủ kín 100% toàn màn hình */}
            <img
              src={scene.image}
              alt={scene.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Lớp phủ điện ảnh trong suốt, dịu mắt, giúp chữ sắc nét và nổi bật */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-900/40" />
      </div>

      {/* ========================================================================= */}
      {/* THANH TIÊU ĐỀ BỘ GIÁO DỤC VÀ ĐÀO TẠO & CỔNG QUỐC GIA (TRONG SUỐT THANH LỊCH)  */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/15 text-white text-xs py-2.5 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-amber-300"></span>
              <span className="font-bold tracking-wide uppercase text-slate-100">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </span>
            </div>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline font-semibold text-amber-300">
              BỘ GIÁO DỤC VÀ ĐÀO TẠO
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-200">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Tổng đài: <strong>1900 6868</strong></span>
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hệ thống trực tuyến 24/7</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PHẦN THÂN TRUNG TÂM: MÀU SẮC THUẦN MẮT, HÀI HÒA VỚI GIAO DIỆN CHÍNH        */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto my-auto p-4 sm:p-6 lg:p-8 gap-8 items-center justify-center">

        {/* CỘT TRÁI: GIỚI THIỆU KHUÔN VIÊN & TỰ ĐỘNG CHUYỂN CẢNH (55%) */}
        <div className="w-full lg:w-7/12 flex flex-col justify-between py-4 lg:py-6 space-y-6">
          {/* Logo Trường & Tên Cổng Đào Tạo */}
          <div className="flex items-center gap-3.5 group cursor-default">
            <div className="relative flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 text-white shadow-xl shadow-black/40 ring-2 ring-amber-400/40 transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="w-7 h-7 text-amber-300 drop-shadow-md" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-wider uppercase text-white drop-shadow-md">
                TRƯỜNG ĐẠI HỌC ĐÀO TẠO TMS
              </span>
              <p className="text-xs sm:text-sm text-blue-100 font-medium drop-shadow-sm">
                Cổng Thông Tin Đào Tạo & Quản Lý Giáo Dục Đại Học
              </p>
            </div>
          </div>

          {/* Tiêu đề & Thông điệp tự động cập nhật theo ảnh nền */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-amber-300 shadow-sm animate-float">
              <Award className="w-4 h-4 text-amber-300" />
              <span>{currentScene.badge} · {currentScene.tag}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg transition-all duration-700">
              {currentScene.headline}
            </h1>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-lg text-white">
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal italic transition-all duration-700">
                "{currentScene.quote}"
              </p>
            </div>

            {/* Thanh vạch chỉ số chuyển ảnh tự động nhỏ gọn, tinh tế */}
            <div className="flex items-center gap-2 pt-1">
              {CAMPUS_SCENES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSceneIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    idx === currentSceneIndex
                      ? 'w-8 bg-amber-400 shadow-xs'
                      : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Chuyển đến ảnh ${idx + 1}`}
                  title={`Chuyển đến ảnh ${idx + 1}`}
                />
              ))}
              <span className="text-[11px] text-slate-300 font-semibold ml-2 select-none">
                0{currentSceneIndex + 1} / 0{CAMPUS_SCENES.length}
              </span>
            </div>
          </div>

          {/* Ba chỉ số thành tựu trường đại học */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-md text-white">
              <div className="flex items-center gap-1.5 text-blue-300 mb-0.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Quy mô</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white">35.000+</p>
              <p className="text-[10px] text-slate-300">Sinh viên & Học viên</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-md text-white">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-0.5">
                <Award className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Việc làm</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white">98.8%</p>
              <p className="text-[10px] text-slate-300">Tốt nghiệp có việc làm</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-md text-white">
              <div className="flex items-center gap-1.5 text-amber-300 mb-0.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Kiểm định</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white">MOET</p>
              <p className="text-[10px] text-slate-300">Chuẩn chất lượng QG</p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG ĐĂNG NHẬP TRẮNG NGỌC CAO CẤP (45%) */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center items-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl shadow-slate-950/30 p-6 sm:p-8 space-y-5">

            {/* Header Form Đăng Nhập */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-900 text-white shadow-md shadow-blue-950/20 ring-4 ring-blue-100 mb-1">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                ĐĂNG NHẬP HỆ THỐNG
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Cổng thông tin đào tạo một cửa (SSO) dành cho Giảng viên, Sinh viên & Cán bộ
              </p>
            </div>

            {/* Thông báo lỗi khi đăng nhập thất bại */}
            {globalError && (
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs animate-in fade-in ${
                  isLocked
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="space-y-1">
                  <p className="font-bold">{globalError}</p>
                  {isLocked && countdownSeconds > 0 && (
                    <p className="text-[11px] font-semibold text-amber-800">
                      Thời gian mở khoá sau: <span className="font-mono font-bold text-amber-950">{formatTimer(countdownSeconds)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form nhập liệu */}
            <form onSubmit={handleSubmit} className={`space-y-4 ${isShaking ? 'animate-shake' : ''}`}>
              {/* Trường Tài khoản / Mã SV / Email */}
              <div>
                <label
                  htmlFor="email"
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                    focusedInput === 'email' ? 'text-blue-800' : 'text-slate-700'
                  }`}
                >
                  Tài khoản / Mã SV / Email <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                    fieldErrors.email
                      ? 'border-rose-400 ring-3 ring-rose-500/15 bg-rose-50/20'
                      : focusedInput === 'email'
                      ? 'border-blue-700 ring-3 ring-blue-600/15 bg-white shadow-xs'
                      : 'border-slate-300 bg-slate-50/80 hover:border-slate-400 hover:bg-white'
                  }`}
                >
                  <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User
                      className={`w-4 h-4 transition-colors ${
                        focusedInput === 'email' ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <input
                    id="email"
                    type="text"
                    autoComplete="username"
                    disabled={loading || isLocked}
                    value={email}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined })
                    }}
                    placeholder="đăng nhập bằng tài khoản, mã sinh viên hoặc email"
                    className="w-full pl-3 pr-10 py-3 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-hidden disabled:opacity-50"
                    required
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Xoá nội dung đã nhập"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Trường Mật Khẩu */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className={`block text-xs font-bold uppercase tracking-wider transition-colors ${
                      focusedInput === 'password' ? 'text-blue-800' : 'text-slate-700'
                    }`}
                  >
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div
                  className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                    fieldErrors.password
                      ? 'border-rose-400 ring-3 ring-rose-500/15 bg-rose-50/20'
                      : focusedInput === 'password'
                      ? 'border-blue-700 ring-3 ring-blue-600/15 bg-white shadow-xs'
                      : 'border-slate-300 bg-slate-50/80 hover:border-slate-400 hover:bg-white'
                  }`}
                >
                  <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock
                      className={`w-4 h-4 transition-colors ${
                        focusedInput === 'password' ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={loading || isLocked}
                    value={password}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    onKeyDown={handleKeyActivity}
                    onKeyUp={handleKeyActivity}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined })
                    }}
                    placeholder="Mật khẩu"
                    className="w-full pl-3 pr-10 py-3 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-hidden disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label="Ẩn hiện mật khẩu"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-blue-700" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Cảnh báo bật phím Caps Lock */}
                {capsLockActive && (
                  <p className="mt-1.5 text-[11px] text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 p-2 rounded-lg border border-amber-300 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Chú ý: Bạn đang bật phím Caps Lock!</span>
                  </p>
                )}

                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Thông tin tài khoản quản trị ghi nhớ trong database */}


              {/* Ghi nhớ tài khoản */}
              <div className="flex items-center justify-between text-xs py-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-700 border-slate-300 focus:ring-blue-600 cursor-pointer"
                  />
                  <span>Ghi nhớ phiên đăng nhập</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Bảo mật SSL 256-bit</span>
              </div>

              {/* Nút Đăng Nhập Xanh Navy Chuẩn Đại Học: Không Màu Tím */}
              <button
                type="submit"
                disabled={loading || isLocked || isSuccess}
                onClick={handleButtonClick}
                className="relative overflow-hidden w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 hover:from-blue-800 hover:via-blue-700 hover:to-slate-800 shadow-md shadow-blue-900/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
              >
                {/* Lớp tia sáng quét qua nút (Shimmer Sheen) */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 animate-shimmer pointer-events-none" />

                {/* Sóng lan toả khi bấm (Ripple) */}
                {ripple.active && (
                  <span
                    className="absolute bg-white/25 rounded-full animate-ping pointer-events-none"
                    style={{
                      left: ripple.x - 20,
                      top: ripple.y - 20,
                      width: 40,
                      height: 40,
                    }}
                  />
                )}

                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xác thực thông tin...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>Đăng nhập thành công!</span>
                  </>
                ) : (
                  <>
                    <span>Đăng Nhập Hệ Thống</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {/* Dịch vụ tra cứu trực tuyến & Tuyển sinh dành cho khách */}
              <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-1.5 text-center">
                <Link
                  to="/consultation"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-950 hover:underline transition-colors py-1 group"
                >
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  <span>Thí sinh & Phụ huynh: Đăng ký tư vấn tuyển sinh trực tuyến</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </form>

            {/* Tiêu chuẩn tuân thủ & An toàn thông tin */}
            <div className="pt-2.5 border-t border-slate-100 text-center text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hệ thống tuân thủ Quy chuẩn Quản lý Đào tạo Bộ GD&ĐT</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Bảo vệ dữ liệu cá nhân Nghị định 13/2023/NĐ-CP · Hỗ trợ: <a href="mailto:support@daotao.edu.vn" className="text-blue-700 hover:underline">support@daotao.edu.vn</a>
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* CHÂN TRANG CỔNG ĐÀO TẠO ĐẠI HỌC (FOOTER THANH LỊCH)                       */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full bg-slate-900/80 backdrop-blur-md border-t border-white/15 text-xs text-slate-300 py-3 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© 2026 Cổng Quản Lý Đào Tạo Đại Học (TMS University Portal). Bản quyền thuộc Nhà trường & Bộ GD&ĐT.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/consultation" className="text-slate-200 hover:text-amber-300 transition-colors">Cổng Tuyển Sinh</Link>
            <span className="text-slate-500">·</span>
            <span className="hover:text-white transition-colors">Quy chế tín chỉ</span>
            <span className="text-slate-500">·</span>
            <span className="hover:text-white transition-colors">Hỗ trợ kỹ thuật 24/7</span>
          </div>
        </div>
      </footer>
    </div>
  )
}