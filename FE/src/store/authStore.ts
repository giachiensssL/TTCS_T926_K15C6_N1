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

interface AuthState {
  role: UserRole | null
  isAuthenticated: boolean
  setAuth: (role: UserRole) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  isAuthenticated: false,
  setAuth: (role) => set({ role, isAuthenticated: true }),
  clearAuth: () => set({ role: null, isAuthenticated: false }),
}))

export const roleToPath: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  TRAINING_MANAGER: '/manager/dashboard',
  TEACHER: '/teacher/dashboard',
  ASSISTANT: '/assistant/dashboard',
  CONSULTANT: '/consultant/dashboard',
  ACCOUNTANT: '/accountant/dashboard',
  STUDENT: '/student/dashboard',
  GUEST: '/',
}
