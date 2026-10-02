import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

let csrfToken: string | null = null

export function resetCsrfToken(): void {
  csrfToken = null
}

apiClient.interceptors.request.use(async (config) => {
  if (['get', 'head', 'options'].includes(config.method?.toLowerCase() ?? 'get')) {
    return config
  }

  if (!csrfToken) {
    const response = await apiClient.get<{ requestToken: string }>('/auth/csrf')
    csrfToken = response.data.requestToken
  }
  config.headers.set('X-CSRF-TOKEN', csrfToken)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !['/auth/login', '/auth/me'].includes(error.config?.url ?? '')
    ) {
      window.location.assign('/login')
    }

    return Promise.reject(error)
  },
)
