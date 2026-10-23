import { api } from './client'

export interface ScheduleItem {
  id: string
  classId: string
  className: string
  courseCode: string
  sessionNumber: number
  date: string
  dayOfWeek: string
  shift: string
  room: string
  teacherId: string
  teacherName: string
  topic: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  attendanceMarked: boolean
  attendanceStats?: {
    present: number
    late: number
    excused: number
    unexcused: number
  }
  attendanceRecords?: Record<string, string>
  hasConflict?: boolean
}

export interface ClassCourseInstructorItem {
  courseId: string
  courseCode: string
  courseName: string
  credits: number
  sessionCount: number
  orderIndex: number
  teacherId?: string | null
  teacherName?: string
  assistantIds?: string[]
  assistantNames?: string[]
  status?: string
  completedSessions?: number
}

export interface ClassItem {
  id: string
  code: string
  name: string
  programId: string
  programName?: string
  courseId?: string
  courseName?: string
  teacherId?: string | null
  teacherName?: string
  assistantId?: string | null
  assistantName?: string
  room?: string
  roomId?: string | null
  roomName?: string
  maxCapacity: number
  currentCount: number
  currentStudents?: number
  studentIds?: string[]
  mode?: 'OFFLINE' | 'ONLINE' | 'HYBRID'
  status: 'PLANNING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED' | string
  startDate: string
  endDate?: string
  capacityWarning?: string | null
  courses?: ClassCourseInstructorItem[]
  totalSessions?: number
  completedSessions?: number
  sessionProgressPercent?: number
  enrollmentHistory?: Array<{
    id: string
    studentId: string
    studentCode: string
    studentName: string
    enrolledAt: string
    enrolledBy: string
  }>
}

export interface ProgramItem {
  id: string
  code: string
  name: string
  durationMonths?: number
  duration?: string
  totalHours?: number
  standardTuition: number
  status: 'ACTIVE' | 'INACTIVE' | string
  description: string
  courseCount?: number
  classCount?: number
  courses?: Array<{ courseId: string; orderIndex: number; prerequisiteCourseId?: string | null }>
}

export interface ProgramCourseItem {
  courseId: string
  orderIndex: number
  prerequisiteCourseId?: string | null
  prerequisiteCourseName?: string | null
  prerequisiteCourseCode?: string | null
  courseCode: string
  courseName: string
  credits: number
  sessionCount: number
}

export interface CourseSessionItem {
  id: string
  sessionNumber: number
  topic: string
  objective: string
}

export interface CourseItem {
  id: string
  code: string
  name: string
  credits: number
  sessionCount?: number
  totalSessions?: number
  learningOutcomes?: string
  description?: string
  tuitionPerCredit?: number
  status?: string
  sessionCountDeclared?: number
  usedInPrograms?: Array<{ id: string; code: string; name: string }>
  classCount?: number
  sessions?: CourseSessionItem[]
}

﻿export interface QuestionItem {
  id: string
  type: 'MULTIPLE_CHOICE' | 'ESSAY'
  prompt: string
  options?: string[]
  correctAnswer?: string
  sampleAnswer?: string
  points?: number
}

export interface AssignmentItem {
  id: string
  classId: string
  className: string
  courseCode: string
  title: string
  description: string
  deadline: string
  maxScore: number
  assignedBy: string
  assignedByName: string
  rubric?: Array<{ criteria: string; points: number }>
  type?: 'QUIZ_15M' | 'FINAL_EXAM' | 'HOMEWORK'
  durationMinutes?: number
  accessCode?: string
  isLocked?: boolean
  questionType?: 'MULTIPLE_CHOICE' | 'ESSAY' | 'HYBRID'
  questions?: QuestionItem[]
  createdAt: string
  submissionsCount?: number
  gradedCount?: number
  mySubmission?: SubmissionItem | null
}

export interface SubmissionItem {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  studentEmail: string
  version: number
  repoUrl?: string
  note?: string
  answers?: Array<{
    questionId: string
    selectedOption?: string
    essayAnswer?: string
  }>
  violationCount?: number
  autoScore?: number
  submittedAt: string
  status: 'SUBMITTED' | 'GRADED' | 'RESUBMIT_REQUESTED'
  score?: number | null
  feedback?: string | null
  aiGraded?: boolean
}

export interface CheatAlertItem {
  id: string
  assignmentId: string
  assignmentTitle: string
  studentId: string
  studentName: string
  violationType: string
  details: string
  timestamp: string
}

export interface TuitionItem {
  id: string
  studentId: string
  studentName: string
  programName: string
  semester: string
  totalAmount: number
  paidAmount: number
  debtAmount: number
  status: 'PAID' | 'PARTIAL' | 'UNPAID'
  dueDate: string
  receipts?: Array<{
    receiptNumber: string
    amount: number
    paidAt: string
    method: string
    cashier: string
    note?: string
  }>
}

// 1. API Thời khóa biểu (S4-01 -> S4-08)
export async function getSchedulesApi(params: { classId?: string; teacherId?: string; date?: string } = {}) {
  const res = await api.get<{ data: ScheduleItem[]; total: number; classes: ClassItem[] }>('/schedules', { params })
  return res.data
}

export async function generateScheduleApi(data: {
  classId: string
  startDate: string
  daysOfWeek: string[]
  shift: string
  room: string
  totalSessions: number
}) {
  const res = await api.post<{ message: string; generatedSessions: ScheduleItem[]; conflictWarnings: string[] }>(
    '/schedules/generate',
    data
  )
  return res.data
}

export async function markAttendanceApi(scheduleId: string, attendanceRecords: Record<string, string>) {
  const res = await api.post<{ message: string; session: ScheduleItem }>(
    `/schedules/${scheduleId}/attendance`,
    { attendanceRecords }
  )
  return res.data
}

// 2. API Bài tập & Nộp bài & Chấm điểm (S5-05 -> S6-04)
export async function getAssignmentsApi() {
  const res = await api.get<{ data: AssignmentItem[]; total: number }>('/assignments')
  return res.data
}

export async function createAssignmentApi(data: {
  classId: string
  title: string
  description: string
  deadline: string
  maxScore: number
  rubric?: Array<{ criteria: string; points: number }>
  type?: 'QUIZ_15M' | 'FINAL_EXAM' | 'HOMEWORK'
  durationMinutes?: number
  accessCode?: string
  isLocked?: boolean
  questionType?: 'MULTIPLE_CHOICE' | 'ESSAY' | 'HYBRID'
  questions?: QuestionItem[]
}) {
  const res = await api.post<{ message: string; assignment: AssignmentItem }>('/assignments', data)
  return res.data
}

export async function getSubmissionsApi(assignmentId: string) {
  const res = await api.get<{ data: SubmissionItem[]; total: number }>(`/assignments/${assignmentId}/submissions`)
  return res.data
}

export async function submitAssignmentApi(
  assignmentId: string,
  data: {
    repoUrl?: string
    note?: string
    answers?: Array<{ questionId: string; selectedOption?: string; essayAnswer?: string }>
    violationCount?: number
    accessCodeEntered?: string
  }
) {
  const res = await api.post<{ message: string; submission: SubmissionItem }>(`/assignments/${assignmentId}/submit`, data)
  return res.data
}

export async function verifyExamAccessCodeApi(assignmentId: string, accessCode: string) {
  const res = await api.post<{ valid: boolean; message: string }>(`/assignments/${assignmentId}/verify-access-code`, { accessCode })
  return res.data
}

export async function toggleExamLockApi(assignmentId: string, isLocked?: boolean) {
  const res = await api.post<{ message: string; isLocked: boolean }>(`/assignments/${assignmentId}/toggle-lock`, { isLocked })
  return res.data
}

export async function reportCheatAlertApi(assignmentId: string, data: { violationType: string; details: string }) {
  const res = await api.post<{ message: string; alert: CheatAlertItem }>(`/assignments/${assignmentId}/cheat-alert`, data)
  return res.data
}

export async function getCheatAlertsApi(assignmentId?: string) {
  const url = assignmentId ? `/assignments/${assignmentId}/cheat-alerts` : '/assignments/proctoring/cheat-alerts-all'
  const res = await api.get<{ data: CheatAlertItem[]; total: number }>(url)
  return res.data
}

export async function aiGradeSubmissionApi(submissionId: string) {
  const res = await api.post<{ message: string; submission: SubmissionItem }>(`/assignments/submissions/${submissionId}/ai-grade`)
  return res.data
}

export async function aiGenerateExamApi(data: {
  subject: string
  type: string
  mcCount: number
  essayCount: number
  difficulty?: string
}) {
  const res = await api.post<{
    message: string
    title: string
    description: string
    durationMinutes: number
    questions: QuestionItem[]
  }>('/assignments/ai-generate', data)
  return res.data
}

export async function parseWordExamApi(textContent: string) {
  const res = await api.post<{ message: string; questions: QuestionItem[] }>('/assignments/parse-word', { textContent })
  return res.data
}

export async function gradeSubmissionApi(data: {
  submissionId: string
  score: number
  feedback?: string
  requestResubmit?: boolean
}) {
  const res = await api.post<{ message: string; submission: SubmissionItem }>('/assignments/grade', data)
  return res.data
}

// 3. API Đào tạo & Lớp học & Học phí (Sprint 2, 3, 7)
export async function getAcademicDataApi() {
  const [classesRes, programsRes, coursesRes] = await Promise.all([
    api.get<{ data: ClassItem[] }>('/academic/classes'),
    api.get<{ data: ProgramItem[] }>('/academic/programs'),
    api.get<{ data: CourseItem[] }>('/academic/courses'),
  ])
  return {
    classes: classesRes.data.data,
    programs: programsRes.data.data,
    courses: coursesRes.data.data,
  }
}

export async function createProgramApi(data: {
  code: string
  name: string
  description?: string
  durationMonths?: number
  totalHours?: number
  standardTuition?: number
  status?: string
}) {
  const res = await api.post<{ message: string; data: ProgramItem }>('/academic/programs', data)
  return res.data
}

export async function updateProgramApi(
  id: string,
  data: {
    name?: string
    description?: string
    durationMonths?: number
    totalHours?: number
    standardTuition?: number
    status?: string
  }
) {
  const res = await api.put<{ message: string; data: ProgramItem }>(`/academic/programs/${id}`, data)
  return res.data
}

export async function toggleProgramStatusApi(id: string, status?: string) {
  const res = await api.patch<{ message: string; data: ProgramItem }>(`/academic/programs/${id}/status`, { status })
  return res.data
}

export async function deleteProgramApi(id: string) {
  const res = await api.delete<{ message: string }>(`/academic/programs/${id}`)
  return res.data
}

// S2-06: Gắn môn học vào chương trình, sắp thứ tự & môn tiên quyết
export async function getProgramCoursesApi(programId: string) {
  const res = await api.get<{ data: ProgramCourseItem[] }>(`/academic/programs/${programId}/courses`)
  return res.data
}

export async function addCourseToProgramApi(programId: string, data: { courseId: string; prerequisiteCourseId?: string | null }) {
  const res = await api.post<{ message: string; data: ProgramCourseItem[] }>(`/academic/programs/${programId}/courses`, data)
  return res.data
}

export async function removeCourseFromProgramApi(programId: string, courseId: string) {
  const res = await api.delete<{ message: string; data: ProgramCourseItem[] }>(`/academic/programs/${programId}/courses/${courseId}`)
  return res.data
}

export async function reorderProgramCoursesApi(programId: string, courseIdsOrder: string[]) {
  const res = await api.put<{ message: string; data: ProgramCourseItem[] }>(`/academic/programs/${programId}/courses/reorder`, {
    courseIdsOrder,
  })
  return res.data
}

export async function updateCoursePrerequisiteApi(programId: string, courseId: string, prerequisiteCourseId?: string | null) {
  const res = await api.put<{ message: string; data: ProgramCourseItem[] }>(
    `/academic/programs/${programId}/courses/${courseId}/prerequisite`,
    { prerequisiteCourseId }
  )
  return res.data
}

export async function createCourseApi(data: {
  code: string
  name: string
  sessionCount?: number
  credits?: number
  learningOutcomes?: string
  tuitionPerCredit?: number
}) {
  const res = await api.post<{ message: string; data: CourseItem }>('/academic/courses', data)
  return res.data
}

export async function updateCourseApi(
  id: string,
  data: {
    name?: string
    sessionCount?: number
    credits?: number
    learningOutcomes?: string
    tuitionPerCredit?: number
    status?: string
  }
) {
  const res = await api.put<{ message: string; data: CourseItem }>(`/academic/courses/${id}`, data)
  return res.data
}

export async function deleteCourseApi(id: string) {
  const res = await api.delete<{ message: string }>(`/academic/courses/${id}`)
  return res.data
}

// S2-07: Khai báo buổi học trong môn & nhân bản
export async function getCourseSessionsApi(courseId: string) {
  const res = await api.get<{ course: { id: string; code: string; name: string; sessionCount: number }; data: CourseSessionItem[] }>(
    `/academic/courses/${courseId}/sessions`
  )
  return res.data
}

export async function addCourseSessionApi(courseId: string, data: { topic: string; objective?: string }) {
  const res = await api.post<{ message: string; data: CourseSessionItem }>(`/academic/courses/${courseId}/sessions`, data)
  return res.data
}

export async function updateCourseSessionApi(courseId: string, sessionId: string, data: { topic?: string; objective?: string }) {
  const res = await api.put<{ message: string; data: CourseSessionItem }>(`/academic/courses/${courseId}/sessions/${sessionId}`, data)
  return res.data
}

export async function deleteCourseSessionApi(courseId: string, sessionId: string) {
  const res = await api.delete<{ success: boolean; message: string }>(`/academic/courses/${courseId}/sessions/${sessionId}`)
  return res.data
}

export async function cloneCourseSessionsApi(targetCourseId: string, sourceCourseId: string) {
  const res = await api.post<{ message: string; clonedCount: number; maxAllowed: number; sessions: CourseSessionItem[] }>(
    `/academic/courses/${targetCourseId}/sessions/clone`,
    { sourceCourseId }
  )
  return res.data
}

export async function createClassApi(data: {
  code: string
  name: string
  programId?: string
  courseId?: string
  teacherId?: string
  assistantId?: string
  room?: string
  maxStudents?: number
  startDate?: string
  endDate?: string
}) {
  const res = await api.post<{ message: string; data: ClassItem }>('/academic/classes', data)
  return res.data
}

export async function deleteClassApi(id: string) {
  const res = await api.delete<{ message: string }>(`/academic/classes/${id}`)
  return res.data
}

export async function createTuitionRecordApi(data: {
  studentId: string
  courseId?: string
  classId?: string
  title?: string
  amount: number
  dueDate?: string
}) {
  const res = await api.post<{ message: string; data: TuitionItem }>('/academic/tuitions', data)
  return res.data
}

export async function createCourseOfferingApi(data: {
  courseCode: string
  courseName: string
  credits?: number
  teacherName?: string
  schedule?: string
  room?: string
  capacity?: number
}) {
  const res = await api.post<{ message: string; data: CourseOfferingItem }>('/academic/registrations/offerings', data)
  return res.data
}

export async function createScheduleItemApi(data: {
  classId: string
  date: string
  dayOfWeek?: string
  shift: string
  room: string
  teacherId?: string
  topic?: string
}) {
  const res = await api.post<{ message: string; session: ScheduleItem }>('/schedules', data)
  return res.data
}

export async function getTuitionsApi() {
  const res = await api.get<{ data: TuitionItem[]; total: number }>('/academic/tuitions')
  return res.data
}

export async function payTuitionApi(data: {
  tuitionId: string
  amount: number
  method?: string
  note?: string
}) {
  const url = data.tuitionId ? `/academic/tuitions/${data.tuitionId}/pay` : '/academic/tuitions/pay'
  const res = await api.post<{ message: string; tuition: TuitionItem; receipt: any }>(url, data)
  return res.data
}

// 4. API Sổ điểm & Bảng điểm tích lũy (Gradebook & Transcript)
export interface GradeItem {
  id: string
  classId: string
  className: string
  courseId: string
  courseCode: string
  courseName: string
  credits: number
  studentId: string
  studentName: string
  studentCode: string
  attendance: number
  midterm: number
  finalExam: number
  finalAverage: number
  letterGrade: string
  gpa4: number
  status: 'PASSED' | 'FAILED'
  updatedBy: string
  updatedAt: string
}

export interface TranscriptData {
  grades: GradeItem[]
  summary: {
    totalCredits: number
    earnedCredits: number
    cpa4: number
    cpa10: number
    academicRank: string
    warning: string | null
  }
}

export async function getClassGradebookApi(classId: string) {
  const res = await api.get<{ data: GradeItem[]; total: number }>(`/academic/grades/class/${classId}`)
  return res.data
}

export async function updateGradeApi(data: {
  classId: string
  studentId: string
  attendance: number
  midterm: number
  finalExam: number
}) {
  const res = await api.post<{ message: string; data: GradeItem }>('/academic/grades/update', data)
  return res.data
}

export async function getStudentTranscriptApi(studentId?: string) {
  const url = studentId ? `/academic/grades/transcript/${studentId}` : '/academic/grades/transcript'
  const res = await api.get<{ data: TranscriptData }>(url)
  return res.data
}

// 5. API Đăng ký học phần tín chỉ (Course Registration)
export interface CourseOfferingItem {
  id: string
  code?: string
  name?: string
  courseCode?: string
  courseName?: string
  credits: number
  schedule: string
  room: string
  teacherName: string
  capacity: number
  enrolled: number
  semester?: string
  tuitionFee?: number
}

export interface RegistrationItem {
  id: string
  studentId: string
  offeringId: string
  registeredAt: string
  offering?: CourseOfferingItem
}

export async function getCourseOfferingsApi() {
  const res = await api.get<{ data: CourseOfferingItem[] }>('/academic/registrations/offerings')
  return res.data
}

export async function getMyRegistrationsApi() {
  const res = await api.get<{ data: RegistrationItem[] }>('/academic/registrations/my')
  return res.data
}

export async function registerCourseApi(offeringId: string) {
  const res = await api.post<{ message: string; registration: RegistrationItem; offering: CourseOfferingItem }>(
    '/academic/registrations/register',
    { offeringId }
  )
  return res.data
}

export async function cancelRegistrationApi(registrationId: string) {
  const res = await api.delete<{ success: boolean; message: string }>(`/academic/registrations/${registrationId}`)
  return res.data
}

// 6. API Dịch vụ Một Cửa Sinh Viên (Student Requests)
export interface StudentRequestItem {
  id: string
  studentId: string
  studentName: string
  studentCode: string
  type: string
  reason: string
  urgency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  verificationCode?: string | null
  requestedAt: string
  reviewedAt?: string | null
  reviewerNote?: string | null
}

export async function getStudentRequestsApi() {
  const res = await api.get<{ data: StudentRequestItem[] }>('/academic/requests')
  return res.data
}

export async function createStudentRequestApi(data: { type: string; reason: string; urgency: string }) {
  const res = await api.post<{ message: string; data: StudentRequestItem }>('/academic/requests', data)
  return res.data
}

export async function reviewStudentRequestApi(requestId: string, data: { status: string; reviewerNote?: string }) {
  const res = await api.post<{ message: string; data: StudentRequestItem }>(`/academic/requests/${requestId}/review`, data)
  return res.data
}

// 7. API Tuyển sinh & Tiếp nhận Leads (Admissions CRM - S2-08 -> S2-11)
export interface AssignmentHistoryItem {
  id: string
  assignedById: string
  assignedByName: string
  consultantId: string
  consultantName: string
  assignedAt: string
  note: string
}

export interface CareLogItem {
  id: string
  type: 'CALL' | 'MESSAGE' | 'MEETING'
  content: string
  createdAt: string
  createdById?: string
  createdByName: string
  remindAt?: string | null
}

export interface StatusHistoryItem {
  id: string
  fromStatus: string
  toStatus: string
  reason?: string | null
  note?: string
  changedAt: string
  changedById?: string
  changedByName: string
}

export interface AdmissionLeadItem {
  id: string
  fullName: string
  phone: string
  email: string
  source?: string
  programName: string
  score: number
  status: 'NEW' | 'CONTACTED' | 'CONSULTING' | 'TRIAL_SCHEDULED' | 'CLOSED_WON' | 'CLOSED_LOST' | 'ENROLLED' | 'CANCELLED' | 'ADMITTED' | string
  lossReason?: string | null
  remindAt?: string | null
  isLocked?: boolean
  studentId?: string | null
  studentCode?: string | null
  consultantId?: string | null
  consultantName: string
  note: string
  assignmentHistory?: AssignmentHistoryItem[]
  careLogs?: CareLogItem[]
  statusHistory?: StatusHistoryItem[]
  createdAt: string
  updatedAt?: string
}

export interface ConsultantUserItem {
  id: string
  fullName: string
  email: string
  phone?: string
  roles: string[]
}

// S2-08: Biểu mẫu công khai đăng ký tư vấn cho Khách truy cập
export async function getPublicProgramsApi() {
  const res = await api.get<{ data: Array<{ id: string; code: string; name: string; durationMonths?: number; standardTuition?: number }> }>(
    '/academic/public/programs'
  )
  return res.data
}

export async function submitPublicConsultationApi(data: {
  fullName: string
  phone: string
  email?: string
  programName?: string
  note?: string
  websiteTrap?: string
  captchaAnswer?: string
  expectedCaptcha?: string
}) {
  const res = await api.post<{
    success: boolean
    lead: AdmissionLeadItem
    message: string
    commitment: string
  }>('/academic/public/consultation', data)
  return res.data
}

// S2-10: Lấy danh sách tư vấn viên
export async function getConsultantsApi() {
  const res = await api.get<{ data: ConsultantUserItem[] }>('/academic/consultants')
  return res.data
}

// S2-11: Lấy danh sách Leads kèm bộ lọc
export async function getAdmissionsApi(params: {
  search?: string
  status?: string
  source?: string
  consultantId?: string
  fromDate?: string
  toDate?: string
} = {}) {
  const res = await api.get<{ data: AdmissionLeadItem[]; total: number; isConsultantOnly?: boolean }>('/academic/admissions', { params })
  return res.data
}

// S2-09: Tạo Lead nội bộ (Có kiểm tra trùng SĐT)
export async function createLeadApi(data: {
  fullName: string
  phone: string
  email?: string
  source?: string
  programName?: string
  note?: string
  consultantId?: string | null
}) {
  const res = await api.post<{ message: string; data: AdmissionLeadItem; duplicateWarning?: string | null }>(
    '/academic/admissions',
    data
  )
  return res.data
}

// S2-09: Sửa Lead nội bộ (Có cảnh báo trùng SĐT)
export async function updateLeadApi(
  id: string,
  data: {
    fullName?: string
    phone?: string
    email?: string
    source?: string
    programName?: string
    note?: string
    status?: string
  }
) {
  const res = await api.put<{ message: string; data: AdmissionLeadItem; duplicateWarning?: string | null }>(
    `/academic/admissions/${id}`,
    data
  )
  return res.data
}

// S2-09: Xoá Lead (Chỉ Quản lý đào tạo & Admin được phép)
export async function deleteLeadApi(id: string) {
  const res = await api.delete<{ success: boolean; message: string }>(`/academic/admissions/${id}`)
  return res.data
}

// S2-10: Phân công lead cho tư vấn viên
export async function bulkAssignLeadsApi(data: {
  leadIds: string[]
  consultantId: string
  note?: string
}) {
  const res = await api.post<{
    success: boolean
    message: string
    assignedCount: number
    assignedLeads: AdmissionLeadItem[]
  }>('/academic/admissions/bulk-assign', data)
  return res.data
}

// S2-10: Lịch sử chuyển giao lead
export async function getLeadHistoryApi(id: string) {
  const res = await api.get<{ leadId: string; fullName: string; history: AssignmentHistoryItem[] }>(
    `/academic/admissions/${id}/history`
  )
  return res.data
}

export async function registerAdmissionLeadApi(data: {
  fullName: string
  phone: string
  email: string
  programName: string
  score?: number
  note?: string
}) {
  const res = await api.post<{ message: string; data: AdmissionLeadItem }>('/academic/admissions/register', data)
  return res.data
}

export async function updateAdmissionStatusApi(admissionId: string, data: { status?: string; note?: string; consultantName?: string }) {
  const res = await api.post<{ message: string; data: AdmissionLeadItem }>(`/academic/admissions/${admissionId}/status`, data)
  return res.data
}

export async function admitCandidateApi(admissionId: string) {
  const res = await api.post<{ message: string; candidate: AdmissionLeadItem; student: any }>(`/academic/admissions/${admissionId}/admit`)
  return res.data
}

// =========================================================================
// S3-01: BẢNG PHỄU THEO DÕI TRẠNG THÁI LEAD (KANBAN)
// =========================================================================
export async function updateLeadFunnelStatusApi(id: string, data: { status: string; lossReason?: string; note?: string }) {
  const res = await api.put<{ message: string; data: AdmissionLeadItem }>(`/academic/admissions/${id}/status-funnel`, data)
  return res.data
}

// =========================================================================
// S3-02: NHẬT KÝ CHĂM SÓC & ĐẶT LỊCH NHẮC GỌI LẠI
// =========================================================================
export async function addLeadCareLogApi(id: string, data: { type: 'CALL' | 'MESSAGE' | 'MEETING'; content: string; remindAt?: string }) {
  const res = await api.post<{ message: string; lead: AdmissionLeadItem; log: CareLogItem }>(`/academic/admissions/${id}/care-logs`, data)
  return res.data
}

// =========================================================================
// S3-03: CHUYỂN LEAD ĐÃ CHỐT THÀNH HỒ SƠ HỌC VIÊN
// =========================================================================
export async function convertLeadToStudentApi(id: string, data: { entryLevel?: string; note?: string }) {
  const res = await api.post<{
    success: boolean
    message: string
    student: StudentProfileItem
    account: { email: string; tempPassword?: string; emailSent: boolean }
    lead: AdmissionLeadItem
  }>(`/academic/admissions/${id}/convert-to-student`, data)
  return res.data
}

// =========================================================================
// S3-04: QUẢN LÝ HỒ SƠ HỌC VIÊN (STUDENT PROFILES)
// =========================================================================
export interface StudentProfileItem {
  id: string
  studentCode: string
  userId: string
  fullName: string
  phone: string
  email: string
  dob?: string
  address?: string
  entryLevel: string
  note?: string
  programName?: string
  enrolledClasses?: Array<{
    classId: string
    classCode: string
    className: string
    programName: string
    status: string
    enrolledAt: string
    enrolledBy: string
  }>
  currentClasses?: Array<{
    classId: string
    classCode: string
    className: string
    programName: string
    status: string
  }>
  pastClasses?: Array<{
    classId: string
    classCode: string
    className: string
    programName: string
    status: string
  }>
  createdAt: string
  updatedAt?: string
}

export async function getStudentsApi(params: { search?: string; classId?: string; entryLevel?: string } = {}) {
  const res = await api.get<{ data: StudentProfileItem[]; total: number }>('/academic/students', { params })
  return res.data
}

export async function getStudentByIdApi(id: string) {
  const res = await api.get<{ data: StudentProfileItem }>(`/academic/students/${id}`)
  return res.data
}

export async function updateStudentApi(id: string, data: Partial<StudentProfileItem>) {
  const res = await api.put<{ message: string; data: StudentProfileItem }>(`/academic/students/${id}`, data)
  return res.data
}

// =========================================================================
// S3-09: QUẢN LÝ PHÒNG HỌC & LIÊN KẾT PHÒNG HỌC TRỰC TUYẾN
// =========================================================================
export interface RoomItem {
  id: string
  code: string
  name: string
  type: 'PHYSICAL' | 'ONLINE'
  capacity: number
  building?: string
  equipment?: string
  onlineMeetingUrl?: string
  passcode?: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | string
  activeClassCount?: number
  usingClasses?: Array<{ id: string; code: string; name: string }>
  createdAt?: string
}

export async function getRoomsApi() {
  const res = await api.get<{ data: RoomItem[]; total: number }>('/academic/rooms')
  return res.data
}

export async function createRoomApi(data: Partial<RoomItem>) {
  const res = await api.post<{ message: string; data: RoomItem }>('/academic/rooms', data)
  return res.data
}

export async function updateRoomApi(id: string, data: Partial<RoomItem>) {
  const res = await api.put<{ message: string; data: RoomItem }>(`/academic/rooms/${id}`, data)
  return res.data
}

export async function deleteRoomApi(id: string) {
  const res = await api.delete<{ success: boolean; message: string }>(`/academic/rooms/${id}`)
  return res.data
}

// =========================================================================
// S3-05, S3-06, S3-07, S3-08: MỞ LỚP, VÒNG ĐỜI, GHI DANH & PHÂN CÔNG GIẢNG VIÊN
// =========================================================================
export async function getClassesApi(params: {
  status?: string
  programId?: string
  teacherId?: string
  fromDate?: string
  toDate?: string
} = {}) {
  const res = await api.get<{ data: ClassItem[] }>('/academic/classes', { params })
  return res.data
}

export async function createClassFromProgramApi(data: {
  code: string
  name: string
  programId: string
  startDate?: string
  endDate?: string
  maxCapacity: number
  mode: 'OFFLINE' | 'ONLINE' | 'HYBRID'
  roomId?: string
}) {
  const res = await api.post<{ message: string; data: ClassItem; capacityWarning?: string | null }>('/academic/classes', data)
  return res.data
}

export async function updateClassLifecycleApi(classId: string, status: string) {
  const res = await api.put<{ message: string; data: ClassItem }>(`/academic/classes/${classId}/lifecycle`, { status })
  return res.data
}

export async function enrollStudentsToClassApi(classId: string, studentIds: string[]) {
  const res = await api.post<{
    success: boolean
    message: string
    enrolledCount: number
    currentStudents: number
    maxCapacity: number
  }>(`/academic/classes/${classId}/enroll`, { studentIds })
  return res.data
}

export async function removeStudentFromClassApi(classId: string, studentId: string) {
  const res = await api.delete<{ success: boolean; message: string }>(`/academic/classes/${classId}/enroll/${studentId}`)
  return res.data
}

export interface InstructorListResponse {
  teachers: Array<{ id: string; fullName: string; email: string; phone?: string; roles: string[] }>
  assistants: Array<{ id: string; fullName: string; email: string; phone?: string; roles: string[] }>
}

export async function getInstructorsApi() {
  const res = await api.get<{ data: InstructorListResponse }>('/academic/instructors')
  return res.data
}

export async function assignCourseInstructorsApi(
  classId: string,
  courseId: string,
  data: { teacherId?: string | null; assistantIds?: string[] }
) {
  const res = await api.put<{
    success: boolean
    message: string
    course: ClassCourseInstructorItem
    classItem: ClassItem
  }>(`/academic/classes/${classId}/courses/${courseId}/instructors`, data)
  return res.data
}
