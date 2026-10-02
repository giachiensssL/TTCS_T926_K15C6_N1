import axios, { AxiosError } from 'axios'
import { apiClient, resetCsrfToken } from './apiClient'

export interface LoginResponse {
  role: string
}

export interface LoginLockedError {
  code: 'AUTH_ACCOUNT_LOCKED'
  message: string
  lockedUntil: string // ISO 8601
}

export interface LoginInvalidError {
  code: 'AUTH_INVALID_CREDENTIALS' | 'AUTH_ACCOUNT_DISABLED' | 'AUTH_ROLE_REQUIRED'
  message: string
}

export type LoginApiError = LoginLockedError | LoginInvalidError

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', { email, password })
  resetCsrfToken()
  return res.data
}

export async function getCurrentUserApi(): Promise<LoginResponse> {
  const res = await apiClient.get<LoginResponse>('/auth/me')
  return res.data
}

export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export function extractApiError(err: unknown): LoginApiError | null {
  if (err instanceof AxiosError && err.response?.data) {
    return err.response.data as LoginApiError
  }
  return null
}
