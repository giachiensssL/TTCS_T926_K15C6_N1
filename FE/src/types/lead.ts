export type InteractionType = 'CALL' | 'MESSAGE' | 'MEETING'

export type LeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CLOSED_WON' | 'LOST'

export type CallbackFilterType = 'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'NO_SCHEDULE'

export interface CareLog {
  id: number
  leadId: number
  leadName?: string
  type: InteractionType
  content: string
  interactionTime: string
  counselorName: string
  createdAt: string
}

export interface Lead {
  id: number
  fullName: string
  phone: string
  email: string
  courseInterest: string
  source: string
  status: LeadStatus
  assignedTo: string
  notes?: string
  callbackDate: string | null
  createdAt: string
  updatedAt: string
  overdue: boolean
  callbackStatus: 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'NO_SCHEDULE'
  overdueDuration: string
  careLogCount: number
  lastCareLog?: CareLog | null
}

export interface LeadStats {
  totalLeads: number
  overdueCount: number
  todayCount: number
  upcomingCount: number
  totalInteractions: number
}

export interface LeadFormData {
  fullName: string
  phone: string
  email: string
  courseInterest: string
  source: string
  status: LeadStatus
  assignedTo: string
  notes?: string
  callbackDate?: string | null
}

export interface CareLogFormData {
  type: InteractionType
  content: string
  interactionTime: string
  counselorName: string
  nextCallbackDate?: string | null
  newStatus?: LeadStatus | ''
}
