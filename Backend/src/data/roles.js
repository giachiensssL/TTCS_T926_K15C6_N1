// 8 Vai trò nghiệp vụ theo yêu cầu hệ thống TMS
const ROLES = {
  ADMIN: 'ADMIN',                       // Quản trị hệ thống
  TRAINING_MANAGER: 'TRAINING_MANAGER', // Quản lý đào tạo
  TEACHER: 'TEACHER',                   // Giảng viên
  ASSISTANT: 'ASSISTANT',               // Trợ giảng
  CONSULTANT: 'CONSULTANT',             // Tư vấn tuyển sinh
  ACCOUNTANT: 'ACCOUNTANT',             // Kế toán
  STUDENT: 'STUDENT',                   // Học viên
  GUEST: 'GUEST',                       // Khách truy cập
};

const ROLE_DETAILS = {
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    name: 'Quản trị hệ thống',
    description: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản, phân quyền và kiểm soát bảo mật.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    permissions: [
      'users:view', 'users:create', 'users:edit', 'users:lock', 'users:assign_role',
      'system:config', 'audit:view', 'roles:manage'
    ],
  },
  [ROLES.TRAINING_MANAGER]: {
    id: ROLES.TRAINING_MANAGER,
    name: 'Quản lý đào tạo',
    description: 'Quản lý chương trình học, môn học, mở lớp, xếp thời khóa biểu và theo dõi tiến độ đào tạo.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    permissions: [
      'programs:manage', 'courses:manage', 'classes:manage', 'schedules:manage',
      'attendance:override', 'grades:view_all', 'reports:training'
    ],
  },
  [ROLES.TEACHER]: {
    id: ROLES.TEACHER,
    name: 'Giảng viên',
    description: 'Giảng dạy, điểm danh lớp học, giao bài tập, chấm điểm và tải tài liệu học tập.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    permissions: [
      'classes:view_assigned', 'attendance:mark', 'assignments:manage', 'grades:grade', 'materials:upload'
    ],
  },
  [ROLES.ASSISTANT]: {
    id: ROLES.ASSISTANT,
    name: 'Trợ giảng',
    description: 'Hỗ trợ lớp học, theo dõi học viên, hỗ trợ điểm danh và giải đáp thắc mắc.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    permissions: [
      'classes:view_assigned', 'attendance:mark', 'students:support'
    ],
  },
  [ROLES.CONSULTANT]: {
    id: ROLES.CONSULTANT,
    name: 'Tư vấn tuyển sinh',
    description: 'Tiếp nhận Lead, tư vấn khóa học, quản lý phễu khách hàng và làm thủ tục nhập học.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    permissions: [
      'leads:manage', 'admissions:create'
    ],
  },
  [ROLES.ACCOUNTANT]: {
    id: ROLES.ACCOUNTANT,
    name: 'Kế toán',
    description: 'Quản lý biểu phí, thu học phí, xuất biên lai, theo dõi công nợ và báo cáo tài chính.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    permissions: [
      'tuition:manage', 'receipts:manage', 'debts:view', 'reports:finance'
    ],
  },
  [ROLES.STUDENT]: {
    id: ROLES.STUDENT,
    name: 'Học viên',
    description: 'Theo dõi thời khóa biểu cá nhân, nộp bài tập, xem kết quả học tập và trạng thái học phí.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    permissions: [
      'student:view_schedule', 'student:submit_assignment', 'student:view_grades', 'student:view_tuition'
    ],
  },
  [ROLES.GUEST]: {
    id: ROLES.GUEST,
    name: 'Khách truy cập',
    description: 'Xem thông tin các chương trình đào tạo công khai và gửi thông tin tư vấn.',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
    permissions: [
      'guest:view_public'
    ],
  },
};

module.exports = {
  ROLES,
  ROLE_DETAILS,
};
