import { AxiosError } from 'axios'
import { api } from './client'
import type { UserProfile, UserRole } from '../store/authStore'

export interface LoginResponse {
  message: string
  accessToken: string
  role: UserRole
  user: UserProfile
}

export interface ApiErrorResponse {
  code?: string
  message: string
  lockedUntil?: string
  requiredRoles?: string[]
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', { email, password })
  return res.data
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout')
}

export async function refreshApi(): Promise<{ accessToken: string; user: UserProfile }> {
  const res = await api.post('/auth/refresh')
  return res.data
}

export async function getMeApi(): Promise<{ user: UserProfile }> {
  const res = await api.get('/auth/me')
  return res.data
}

export async function switchRoleApi(role: UserRole): Promise<{ accessToken: string; activeRole: UserRole }> {
  const res = await api.post('/auth/switch-role', { role })
  return res.data
}

export async function forgotPasswordApi(email: string): Promise<{ message: string; demoResetUrl?: string; demoToken?: string }> {
  const res = await api.post('/auth/forgot-password', { email })
  return res.data
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await api.post('/auth/reset-password', { token, newPassword })
  return res.data
}

export async function changePasswordApi(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await api.post('/auth/change-password', { currentPassword, newPassword })
  return res.data
}

export async function getProfileApi(): Promise<{ user: UserProfile }> {
  const res = await api.get('/auth/profile')
  return res.data
}

export async function updateProfileApi(data: {
  fullName?: string
  phone?: string
  dob?: string
  address?: string
}): Promise<{ message: string; user: UserProfile }> {
  const res = await api.put('/auth/profile', data)
  return res.data
}

export async function updateAvatarApi(avatar: string): Promise<{ message: string; avatar: string }> {
  const res = await api.post('/auth/avatar', { avatar })
  return res.data
}

export function extractApiError(err: unknown): ApiErrorResponse {
  if (err instanceof AxiosError) {
    if (err.response?.data && typeof err.response.data === 'object') {
      const data = err.response.data as any
      return {
        code: data.code,
        message: data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        lockedUntil: data.lockedUntil,
        requiredRoles: data.requiredRoles,
      }
    }
    if (err.response?.status === 502 || err.response?.status === 504) {
      return { message: 'Không thể kết nối đến máy chủ backend (502 Bad Gateway). Vui lòng đảm bảo backend đang hoạt động.' }
    }
    if (err.response?.status === 404) {
      return { message: 'Đường dẫn API không tìm thấy (404 Not Found).' }
    }
  }
  return { message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc backend.' }
}
