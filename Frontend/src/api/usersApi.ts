import { api } from './authApi'
import type { UserRole } from '../store/authStore'

export interface UserItem {
  id: string
  fullName: string
  email: string
  phone?: string
  roles: UserRole[]
  status: 'ACTIVE' | 'LOCKED'
  lockReason?: string | null
  avatar?: string
  createdAt: string
  assignedClasses?: Array<{ id: string; code: string; name: string }>
}

export interface GetUsersParams {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}

export interface GetUsersResponse {
  data: UserItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface RoleDetail {
  id: UserRole
  name: string
  description: string
  badgeColor: string
  permissions: string[]
}

export interface AuditLogItem {
  id: string
  actorId: string
  action: string
  targetId: string
  details: string
  timestamp: string
}

export async function getUsersApi(params: GetUsersParams = {}): Promise<GetUsersResponse> {
  const res = await api.get<GetUsersResponse>('/users', { params })
  return res.data
}

export async function getUserByIdApi(id: string): Promise<{ user: UserItem }> {
  const res = await api.get<{ user: UserItem }>(`/users/${id}`)
  return res.data
}

export async function createUserApi(data: {
  fullName: string
  email: string
  phone?: string
  roles: UserRole[]
}): Promise<{ message: string; user: UserItem; tempPassword?: string }> {
  const res = await api.post('/users', data)
  return res.data
}

export async function updateUserApi(
  id: string,
  data: { fullName?: string; phone?: string; roles?: UserRole[] }
): Promise<{ message: string; user: UserItem }> {
  const res = await api.put(`/users/${id}`, data)
  return res.data
}
export async function updateAvatarApi(data: {
  avatar: string
  mimeType: 'image/jpeg' | 'image/png'
  size: number
}) {
  const res = await api.patch('/profile/avatar', data)
  return res.data
}

export async function assignRoleApi(id: string, roleName: UserRole): Promise<{ message: string; roles: UserRole[] }> {
  const res = await api.post(`/users/${id}/roles`, { roleName })
  return res.data
}

export async function revokeRoleApi(id: string, roleName: UserRole): Promise<{ message: string; roles: UserRole[] }> {
  const res = await api.delete(`/users/${id}/roles/${roleName}`)
  return res.data
}

export async function lockUserApi(
  id: string,
  reason: string
): Promise<{ message: string; warningMessage?: string; user: Partial<UserItem> }> {
  const res = await api.put(`/users/${id}/lock`, { reason })
  return res.data
}

export async function unlockUserApi(id: string): Promise<{ message: string; user: Partial<UserItem> }> {
  const res = await api.put(`/users/${id}/unlock`)
  return res.data
}

export async function getRolesApi(): Promise<{ roles: RoleDetail[]; roleKeys: Record<string, string> }> {
  const res = await api.get('/roles')
  return res.data
}

export async function getAuditLogsApi(): Promise<{ data: AuditLogItem[]; total: number }> {
  const res = await api.get('/audit-logs')
  return res.data
}

// Kiểm thử RBAC (S1-05)
export async function testUpdateTuitionApi(): Promise<{ success: boolean; message: string }> {
  const res = await api.put('/tuition/update', { amount: 1000000 })
  return res.data
}

export async function testUpdateGradesApi(): Promise<{ success: boolean; message: string }> {
  const res = await api.put('/grades/update', { score: 10 })
  return res.data
}
