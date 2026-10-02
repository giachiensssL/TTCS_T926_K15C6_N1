import { apiClient } from './apiClient'

export interface StaffAccount {
  id: string
  email: string
  roles: string[]
  isLocked: boolean
  lockReason: string | null
  lockedAt: string | null
  classesToHandover: string[]
}

export interface AccountStatus {
  userId: string
  isLocked: boolean
  reason: string | null
  lockedAt: string | null
  classesToHandover: string[]
}

export async function getStaffAccountsApi(): Promise<StaffAccount[]> {
  const response = await apiClient.get<StaffAccount[]>('/users')
  return response.data
}

export async function lockStaffAccountApi(
  userId: string,
  reason: string,
): Promise<AccountStatus> {
  const response = await apiClient.patch<AccountStatus>(`/users/${userId}/lock`, { reason })
  return response.data
}

export async function unlockStaffAccountApi(userId: string): Promise<AccountStatus> {
  const response = await apiClient.patch<AccountStatus>(`/users/${userId}/unlock`)
  return response.data
}

export async function createTrainingClassApi(
  name: string,
  instructorUserId: string,
): Promise<void> {
  await apiClient.post('/users/classes', { name, instructorUserId })
}
