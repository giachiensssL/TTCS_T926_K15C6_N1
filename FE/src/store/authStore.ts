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
  accessToken: string | null
  role: UserRole | null
  setAuth: (token: string, role: UserRole) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  setAuth: (accessToken, role) => set({ accessToken, role }),
  clearAuth: () => set({ accessToken: null, role: null }),
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
