// S1-05 - Phân quyền theo vai trò

// Các vai trò trong hệ thống
export type UserRole =
  | "Admin"
  | "TrainingManager"
  | "Teacher"
  | "TeachingAssistant"
  | "Admission"
  | "Accountant"
  | "Student"
  | "Guest";

// Các quyền trong hệ thống
export type Permission =
  | "dashboard.view"
  | "grade.view"
  | "grade.edit"
  | "tuition.view"
  | "tuition.edit"
  | "attendance.view"
  | "attendance.edit"
  | "assignment.view"
  | "assignment.manage"
  | "class.view"
  | "class.manage"
  | "lead.view"
  | "lead.manage"
  | "user.view"
  | "user.manage"
  | "role.manage"
  | "audit.view";

// Danh sách quyền của từng vai trò
export const ROLE_PERMISSIONS: Record<
  UserRole,
  Permission[] | ["*"]
> = {
  // Quản trị viên: có toàn quyền
  Admin: ["*"],

  // Quản lý đào tạo
  TrainingManager: [
    "dashboard.view",
    "grade.view",
    "attendance.view",
    "assignment.view",
    "class.view",
    "class.manage",
  ],

  // Giảng viên: được sửa điểm, không được sửa học phí
  Teacher: [
    "dashboard.view",
    "grade.view",
    "grade.edit",
    "attendance.view",
    "attendance.edit",
    "assignment.view",
    "assignment.manage",
    "class.view",
  ],

  // Trợ giảng: được xem điểm nhưng không sửa điểm
  TeachingAssistant: [
    "dashboard.view",
    "grade.view",
    "attendance.view",
    "attendance.edit",
    "assignment.view",
    "class.view",
  ],

  // Tư vấn tuyển sinh
  Admission: [
    "dashboard.view",
    "lead.view",
    "lead.manage",
  ],

  // Kế toán: được sửa học phí nhưng không sửa điểm
  Accountant: [
    "dashboard.view",
    "tuition.view",
    "tuition.edit",
  ],

  // Học viên: chỉ được xem các thông tin cần thiết
  Student: [
    "dashboard.view",
    "grade.view",
    "tuition.view",
    "attendance.view",
    "assignment.view",
    "class.view",
  ],

  // Khách: không có quyền
  Guest: [],
};