import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send HttpOnly cookies
})

export interface LoginResponse {
  accessToken: string
  role: string
}

export interface LoginLockedError {
  code: 'AUTH_ACCOUNT_LOCKED'
  message: string
  lockedUntil: string // ISO 8601
}

export interface LoginInvalidError {
  code: 'AUTH_INVALID_CREDENTIALS' | 'AUTH_ACCOUNT_DISABLED'
  message: string
}

export type LoginApiError = LoginLockedError | LoginInvalidError

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', { email, password })
  return res.data
}

export function extractApiError(err: unknown): LoginApiError | null {
  if (err instanceof AxiosError && err.response?.data) {
    return err.response.data as LoginApiError
  }
  return null
}
