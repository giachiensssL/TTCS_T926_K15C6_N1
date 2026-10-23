import { create } from 'zustand'

export type UserRole =
  | 'ADMIN'
  | 'TRAINING_MANAGER'
  | 'TEACHER'
  | 'ASSISTANT'
  | 'CONSULTANT'
  | 'ACCOUNTANT'
  | 'STUDENT'
  | 'GUEST'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone?: string
  dob?: string
  address?: string
  roles: UserRole[]
  activeRole: UserRole
  avatar?: string
}

interface AuthState {
  accessToken: string | null
  user: UserProfile | null
  isInitializing: boolean
  setAuth: (token: string, user: UserProfile) => void
  setActiveRole: (role: UserRole) => void
  updateUser: (partial: Partial<UserProfile>) => void
  clearAuth: () => void
  setInitializing: (val: boolean) => void
}

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Quản trị hệ thống',
  TRAINING_MANAGER: 'Quản lý đào tạo',
  TEACHER: 'Giảng viên',
  ASSISTANT: 'Trợ giảng',
  CONSULTANT: 'Tư vấn tuyển sinh',
  ACCOUNTANT: 'Kế toán',
  STUDENT: 'Học viên',
  GUEST: 'Khách',
}

export const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  TRAINING_MANAGER: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  TEACHER: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  ASSISTANT: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  CONSULTANT: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ACCOUNTANT: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  STUDENT: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  GUEST: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
}

export const roleToPath: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  TRAINING_MANAGER: '/manager/dashboard',
  TEACHER: '/teacher/dashboard',
  ASSISTANT: '/assistant/dashboard',
  CONSULTANT: '/consultant/dashboard',
  ACCOUNTANT: '/accountant/dashboard',
  STUDENT: '/student/dashboard',
  GUEST: '/guest/dashboard',
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('tms_token') || null,
  user: localStorage.getItem('tms_user') ? JSON.parse(localStorage.getItem('tms_user')!) : null,
  isInitializing: true,
  setAuth: (accessToken, user) => {
    localStorage.setItem('tms_token', accessToken)
    localStorage.setItem('tms_user', JSON.stringify(user))
    set({ accessToken, user, isInitializing: false })
  },
  setActiveRole: (activeRole) => {
    set((state) => {
      if (!state.user) return state
      const updatedUser = { ...state.user, activeRole }
      localStorage.setItem('tms_user', JSON.stringify(updatedUser))
      return { user: updatedUser }
    })
  },
  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state
      const updatedUser = { ...state.user, ...partial }
      localStorage.setItem('tms_user', JSON.stringify(updatedUser))
      return { user: updatedUser }
    })
  },
  clearAuth: () => {
    localStorage.removeItem('tms_token')
    localStorage.removeItem('tms_user')
    set({ accessToken: null, user: null, isInitializing: false })
  },
  setInitializing: (isInitializing) => set({ isInitializing }),
}))
