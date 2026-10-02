import { useState, useRef, useCallback } from 'react'
import { loginApi, extractApiError } from '../api/authApi'
import { useAuthStore, roleToPath, UserRole } from '../store/authStore'
import { useNavigate, useSearchParams } from 'react-router-dom'

export interface FieldErrors {
  email?: string
  password?: string
}

export interface FormState {
  email: string
  password: string
  showPassword: boolean
  fieldErrors: FieldErrors
  globalError: string
  isLoading: boolean
  isLocked: boolean
  lockSecondsLeft: number
}

function validateFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email.trim()) {
    errors.email = 'Vui lòng nhập email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email không hợp lệ.'
  }
  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu.'
  } else if (password.length < 8) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.'
  } else if (password.length > 128) {
    errors.password = 'Mật khẩu không được vượt quá 128 ký tự.'
  }
  return errors
}

export function useLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const startCountdown = useCallback((lockedUntil: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    const endTime = new Date(lockedUntil).getTime()

    const tick = () => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000)
      if (remaining <= 0) {
        setIsLocked(false)
        setLockSecondsLeft(0)
        setGlobalError('')
        if (countdownRef.current) clearInterval(countdownRef.current)
      } else {
        setLockSecondsLeft(remaining)
      }
    }

    tick()
    countdownRef.current = setInterval(tick, 1000)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setGlobalError('')

      const errors = validateFields(email, password)
      setFieldErrors(errors)
      if (Object.keys(errors).length > 0) return

      setIsLoading(true)
      try {
        const data = await loginApi(email, password)
        const role = data.role as UserRole
        setAuth(role)
        const redirectParam = searchParams.get('redirect')
        const dest = redirectParam && redirectParam.startsWith('/') ? redirectParam : roleToPath[role]
        navigate(dest, { replace: true })
      } catch (err) {
        const apiErr = extractApiError(err)
        if (apiErr?.code === 'AUTH_ACCOUNT_LOCKED') {
          const mins = Math.max(1, Math.ceil((new Date(apiErr.lockedUntil).getTime() - Date.now()) / 60_000))
          setGlobalError(`Tài khoản tạm thời bị khoá. Vui lòng thử lại sau ${mins} phút.`)
          setIsLocked(true)
          startCountdown(apiErr.lockedUntil)
        } else if (apiErr?.code === 'AUTH_ACCOUNT_DISABLED') {
          setGlobalError(apiErr.message)
        } else if (apiErr?.code === 'AUTH_ROLE_REQUIRED') {
          setGlobalError(apiErr.message)
        } else {
          setGlobalError('Email hoặc mật khẩu không đúng.')
        }
        setPassword('')
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, lockSecondsLeft, searchParams, setAuth, navigate, startCountdown],
  )

  return {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    fieldErrors,
    globalError,
    isLoading,
    isLocked,
    lockSecondsLeft,
    handleSubmit,
  }
}
