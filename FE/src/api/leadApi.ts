import type { CareLog, CareLogFormData, CallbackFilterType, Lead, LeadFormData, LeadStats } from '../types/lead'

const API_BASE = 'http://localhost:8080/api'

export async function fetchLeads(params: {
  search?: string
  status?: string
  source?: string
  callbackFilter?: CallbackFilterType
  page?: number
  size?: number
}): Promise<{ content: Lead[]; totalPages: number; totalElements: number }> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)
  if (params.source) query.set('source', params.source)
  if (params.callbackFilter && params.callbackFilter !== 'ALL') query.set('callbackFilter', params.callbackFilter)
  query.set('page', String(params.page ?? 0))
  query.set('size', String(params.size ?? 10))

  const response = await fetch(`${API_BASE}/leads?${query.toString()}`)
  if (!response.ok) {
    throw new Error('Không thể tải danh sách Lead từ máy chủ.')
  }
  return response.json()
}

export async function fetchLeadStats(): Promise<LeadStats> {
  const response = await fetch(`${API_BASE}/leads/stats`)
  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu thống kê.')
  }
  return response.json()
}

export async function createLead(data: LeadFormData): Promise<Lead> {
  const response = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Không thể tạo mới Lead.')
  }
  return response.json()
}

export async function updateLead(id: number, data: LeadFormData): Promise<Lead> {
  const response = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Không thể cập nhật thông tin Lead.')
  }
  return response.json()
}

export async function scheduleLeadCallback(id: number, callbackDate: string | null, notes?: string): Promise<Lead> {
  const response = await fetch(`${API_BASE}/leads/${id}/callback`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callbackDate, notes }),
  })
  if (!response.ok) {
    throw new Error('Không thể cập nhật lịch nhắc gọi lại.')
  }
  return response.json()
}

export async function deleteLead(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Không thể xóa Lead.')
  }
}

export async function fetchCareLogs(leadId: number): Promise<CareLog[]> {
  const response = await fetch(`${API_BASE}/leads/${leadId}/care-logs`)
  if (!response.ok) {
    throw new Error('Không thể tải nhật ký chăm sóc.')
  }
  return response.json()
}

export async function addCareLog(leadId: number, data: CareLogFormData): Promise<CareLog> {
  const response = await fetch(`${API_BASE}/leads/${leadId}/care-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Không thể ghi nhật ký chăm sóc.')
  }
  return response.json()
}

export async function deleteCareLog(careLogId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/care-logs/${careLogId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Không thể xóa nhật ký chăm sóc.')
  }
}
