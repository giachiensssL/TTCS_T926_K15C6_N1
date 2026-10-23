export type StudentEnrollment = {
  id: number
  classCode: string
  className: string
  teacherName: string
  schedule: string
  room: string
  startDate: string
  endDate: string
  status: 'DANG_HOC' | 'HOAN_THANH' | 'BAO_LUU' | 'HUY' | 'CHUYEN_LOP' | 'DA_NGHI'
  finalGrade?: number | null
}

export type StudentOperationType = 'BAO_LUU' | 'CHUYEN_LOP' | 'THOI_HOC'

export type StudentOperationHistory = {
  id: number
  type: StudentOperationType
  reason: string
  effectiveDate: string
  recordedAt: string
  sourceEnrollmentId?: number | null
  sourceClassCode?: string | null
  targetEnrollmentId?: number | null
  targetClassCode?: string | null
  targetClassName?: string | null
}

export type StudentOperationRequest = {
  type: StudentOperationType
  reason: string
  effectiveDate: string
  sourceEnrollmentId?: number
  targetClassCode?: string
  targetClassName?: string
  targetTeacherName?: string
  targetSchedule?: string
  targetRoom?: string
  targetEndDate?: string
}

export type StudentProfile = {
  id: number
  studentCode: string
  fullName: string
  email: string
  phone: string
  gender: string
  dateOfBirth?: string | null
  address?: string
  entryLevel: string // Trình độ đầu vào
  note: string       // Ghi chú
  status: string     // DANG_HOC, BAO_LUU, DA_TOT_NGHIEP, DA_NGHI
  currentClasses: StudentEnrollment[]
  classHistory: StudentEnrollment[]
  operationHistory: StudentOperationHistory[]
}

export type StudentUpdateForm = {
  fullName: string
  email: string
  phone: string
  gender: string
  dateOfBirth?: string | null
  address: string
  entryLevel: string
  note: string
}
