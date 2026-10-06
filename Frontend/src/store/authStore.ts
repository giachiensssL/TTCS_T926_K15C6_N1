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
  roles: UserRole[]
  activeRole: UserRole
  avatar?: string
}

interface AuthState {
  accessToken: string | null

  // Giữ role để tương thích code login/dashboard cũ
  role: UserRole | null

  // S1-09: user có thể có nhiều role
  user: UserProfile | null

  isInitializing: boolean

  // Hỗ trợ cả kiểu cũ setAuth(token, role)
  // và kiểu mới setAuth(token, user)
  setAuth: (
    token: string,
    userOrRole: UserProfile | UserRole
  ) => void

  setActiveRole: (role: UserRole) => void
  clearAuth: () => void
  setInitializing: (value: boolean) => void
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

export const roleColors: Record<
  UserRole,
  { bg: string; text: string; border: string }
> = {
  ADMIN: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  TRAINING_MANAGER: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  TEACHER: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  ASSISTANT: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  CONSULTANT: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  ACCOUNTANT: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  STUDENT: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  GUEST: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
}

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

function readStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem('tms_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const storedUser = readStoredUser()

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('tms_token') || null,

  role:
    storedUser?.activeRole ??
    (localStorage.getItem('tms_role') as UserRole | null),

  user: storedUser,

  isInitializing: true,

  setAuth: (accessToken, userOrRole) => {
    localStorage.setItem('tms_token', accessToken)

    // Tương thích login cũ: setAuth(token, role)
    if (typeof userOrRole === 'string') {
      const activeRole = userOrRole

      localStorage.setItem('tms_role', activeRole)

      set((state) => {
        let user = state.user

        if (user) {
          user = {
            ...user,
            activeRole,
            roles: user.roles.includes(activeRole)
              ? user.roles
              : [...user.roles, activeRole],
          }

          localStorage.setItem('tms_user', JSON.stringify(user))
        }

        return {
          accessToken,
          role: activeRole,
          user,
          isInitializing: false,
        }
      })

      return
    }

    // Kiểu mới: setAuth(token, user)
    const user = userOrRole

    localStorage.setItem('tms_user', JSON.stringify(user))
    localStorage.setItem('tms_role', user.activeRole)

    set({
      accessToken,
      role: user.activeRole,
      user,
      isInitializing: false,
    })
  },

  setActiveRole: (activeRole) => {
    localStorage.setItem('tms_role', activeRole)

    set((state) => {
      if (!state.user) {
        return {
          role: activeRole,
        }
      }

      const updatedUser = {
        ...state.user,
        activeRole,
      }

      localStorage.setItem(
        'tms_user',
        JSON.stringify(updatedUser)
      )

      return {
        role: activeRole,
        user: updatedUser,
      }
    })
  },

  clearAuth: () => {
    localStorage.removeItem('tms_token')
    localStorage.removeItem('tms_role')
    localStorage.removeItem('tms_user')

    set({
      accessToken: null,
      role: null,
      user: null,
      isInitializing: false,
    })
  },

  setInitializing: (isInitializing) =>
    set({ isInitializing }),
}))