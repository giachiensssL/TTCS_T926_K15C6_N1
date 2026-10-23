export type StudentEnrollment = {
  id: number
  classCode: string
  className: string
  teacherName: string
  schedule: string
  room: string
  startDate: string
  endDate: string
  status: 'DANG_HOC' | 'HOAN_THANH' | 'BAO_LUU' | 'HUY'
  finalGrade?: number | null
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
  status: string
}
