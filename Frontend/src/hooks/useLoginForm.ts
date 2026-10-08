import { useState, useRef, useCallback } from 'react'
import { loginApi, extractApiError } from '../api/authApi'
import { useAuthStore, roleToPath } from '../store/authStore'
import type { UserRole } from '../store/authStore'
import { useNavigate, useSearchParams } from 'react-router-dom'

export interface FieldErrors {
  email?: string
  password?: string
}

function validateFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email.trim()) {
    errors.email = 'Vui long nhap email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email khong hop le.'
  }
  if (!password) {
    errors.password = 'Vui long nhap mat khau.'
  } else if (password.length < 8) {
    errors.password = 'Mat khau phai co it nhat 8 ky tu.'
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
        setAuth(data.accessToken, role)
        const redirectParam = searchParams.get('redirect')
        const dest = redirectParam && redirectParam.startsWith('/') ? redirectParam : roleToPath[role]
        navigate(dest, { replace: true })
      } catch (err) {
        const apiErr = extractApiError(err)
        if (apiErr?.code === 'AUTH_ACCOUNT_LOCKED') {
          setGlobalError('Tai khoan tam thoi bi khoa. Vui long thu lai sau.')
          setIsLocked(true)
          startCountdown((apiErr as { lockedUntil: string }).lockedUntil)
        } else {
          setGlobalError('Email hoac mat khau khong dung.')
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