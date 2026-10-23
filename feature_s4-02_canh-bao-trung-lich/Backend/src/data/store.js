const bcrypt = require('bcryptjs');
const { ROLES } = require('./roles');

// Helper sinh ID
function generateId(prefix = 'id') {
  return `${prefix}_` + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Băm mật khẩu mặc định
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);
const MANAGER_PASSWORD_HASH = bcrypt.hashSync('Manager@123456', 10);
const TEACHER_PASSWORD_HASH = bcrypt.hashSync('Teacher@123456', 10);
const ASSISTANT_PASSWORD_HASH = bcrypt.hashSync('Assistant@123456', 10);
const CONSULTANT_PASSWORD_HASH = bcrypt.hashSync('Consultant@123456', 10);
const ACCOUNTANT_PASSWORD_HASH = bcrypt.hashSync('Accountant@123456', 10);
const STUDENT_PASSWORD_HASH = bcrypt.hashSync('Student@123456', 10);

// Helper kiểm tra định dạng số điện thoại Việt Nam (10 số, đầu số hợp lệ)
function isValidVNPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const clean = phone.trim().replace(/[\s.-]/g, '');
  const regex = /^(0|\+84)[35789][0-9]{8}$/;
  return regex.test(clean);
}

// Helper kiểm tra định dạng Email
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

class DataStore {
  constructor() {
    this.resetData();
    this.seedSampleData();
  }

  clearAllSampleData(preserveSessions = true) {
    this.resetData(preserveSessions);
  }

  resetData(preserveSessions = false) {
    // 1. Danh sách người dùng hệ thống với đầy đủ 8 vai trò nghiệp vụ (S1-01 -> S1-10)
    this.users = [
      {
        id: 'usr_admin_001',
        fullName: 'Quản trị viên Hệ thống',
        username: 'admin',
        email: 'admin@tms.edu.vn',
        passwordHash: ADMIN_PASSWORD_HASH,
        phone: '0912345678',
        dob: '1985-05-15',
        address: 'Tòa nhà Công nghệ TMS, Cầu Giấy, Hà Nội',
        roles: [ROLES.ADMIN, ROLES.TRAINING_MANAGER, ROLES.TEACHER, ROLES.ACCOUNTANT, ROLES.CONSULTANT, ROLES.STUDENT],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_manager_001',
        fullName: 'Trưởng phòng Đào tạo',
        username: 'manager',
        email: 'manager@tms.edu.vn',
        passwordHash: MANAGER_PASSWORD_HASH,
        phone: '0988112233',
        dob: '1988-10-20',
        address: 'Số 15 Lê Văn Lương, Thanh Xuân, Hà Nội',
        roles: [ROLES.TRAINING_MANAGER],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_teacher_001',
        fullName: 'ThS. Nguyễn Văn Thầy',
        username: 'teacher',
        email: 'teacher@tms.edu.vn',
        passwordHash: TEACHER_PASSWORD_HASH,
        phone: '0977223344',
        dob: '1990-03-12',
        address: 'Phố Duy Tân, Cầu Giấy, Hà Nội',
        roles: [ROLES.TEACHER],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_assistant_001',
        fullName: 'Trần Văn Trợ Giảng',
        username: 'assistant',
        email: 'assistant@tms.edu.vn',
        passwordHash: ASSISTANT_PASSWORD_HASH,
        phone: '0966334455',
        dob: '1998-07-25',
        address: 'Đường Xuân Thủy, Cầu Giấy, Hà Nội',
        roles: [ROLES.ASSISTANT],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_consultant_001',
        fullName: 'Chuyên viên Tư vấn Tuyển sinh',
        username: 'consultant',
        email: 'consultant@tms.edu.vn',
        passwordHash: CONSULTANT_PASSWORD_HASH,
        phone: '0933556677',
        dob: '1994-09-08',
        address: 'Khu Đô Thị Mỹ Đình, Nam Từ Liêm, Hà Nội',
        roles: [ROLES.CONSULTANT],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_consultant_002',
        fullName: 'Nguyễn Thị Mai (TVV)',
        username: 'consultant2',
        email: 'consultant2@tms.edu.vn',
        passwordHash: CONSULTANT_PASSWORD_HASH,
        phone: '0944667788',
        dob: '1996-12-14',
        address: 'Đường Nguyễn Trãi, Thanh Xuân, Hà Nội',
        roles: [ROLES.CONSULTANT],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_accountant_001',
        fullName: 'Kế toán Trưởng Trung tâm',
        username: 'accountant',
        email: 'accountant@tms.edu.vn',
        passwordHash: ACCOUNTANT_PASSWORD_HASH,
        phone: '0911778899',
        dob: '1987-04-18',
        address: 'Đường Láng Hạ, Đống Đa, Hà Nội',
        roles: [ROLES.ACCOUNTANT],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_student_001',
        fullName: 'Nguyễn Văn Học Viên',
        username: 'student',
        email: 'student@tms.edu.vn',
        passwordHash: STUDENT_PASSWORD_HASH,
        phone: '0909123456',
        dob: '2004-08-16',
        address: 'Ký túc xá Đại học TMS, Hà Nội',
        roles: [ROLES.STUDENT],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_multi_001',
        fullName: 'Giảng viên kiêm Quản lý',
        username: 'multi',
        email: 'multi@tms.edu.vn',
        passwordHash: bcrypt.hashSync('Multi@123456', 10),
        phone: '0912998877',
        dob: '1989-11-03',
        address: 'Đường Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
        roles: [ROLES.TEACHER, ROLES.TRAINING_MANAGER],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        createdAt: new Date().toISOString(),
      },
    ];

    // Khởi tạo các danh mục nghiệp vụ hoàn toàn rỗng để người dùng tự nhập mới dữ liệu thực tế
    this.courses = [];
    this.programs = [];
    this.classes = [];
    this.admissions = [];
    this.rooms = [];
    this.students = [];
    this.schedules = [];
    this.cheatLogs = [];
    this.assignments = [
      {
        id: 'asm_quiz_15m_01',
        classId: 'cls_k15_web01',
        className: 'Full-stack Web K15 - Lớp 01',
        courseCode: 'WEB301',
        title: 'Bài kiểm tra 15 phút: Nền tảng JavaScript ES6 & Lập trình Web Hiện đại',
        description: 'Kiểm tra nhanh 15 phút đầu giờ. Gồm 3 câu trắc nghiệm cốt lõi và 1 câu tự luận ngắn áp dụng tư duy lập trình.',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxScore: 10,
        assignedBy: 'usr_teacher_001',
        assignedByName: 'ThS. Nguyễn Văn Thầy',
        type: 'QUIZ_15M',
        durationMinutes: 15,
        accessCode: 'QUIZ-15M',
        isLocked: false,
        questionType: 'HYBRID',
        questions: [
          {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Trong JavaScript ES6, từ khóa nào dùng để khai báo biến có phạm vi khối (block scope) và không thể gán lại giá trị?',
            options: [
              'A. var',
              'B. const',
              'C. let',
              'D. static'
            ],
            correctAnswer: 'B',
            points: 2.5
          },
          {
            id: 'q2',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Phương thức mảng nào trong JavaScript trả về một mảng mới chứa các phần tử thỏa mãn điều kiện kiểm tra?',
            options: [
              'A. map()',
              'B. forEach()',
              'C. filter()',
              'D. reduce()'
            ],
            correctAnswer: 'C',
            points: 2.5
          },
          {
            id: 'q3',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Promise trong JavaScript có bao nhiêu trạng thái cơ bản?',
            options: [
              'A. 2 (Resolved, Rejected)',
              'B. 3 (Pending, Fulfilled, Rejected)',
              'C. 4 (Pending, Running, Fulfilled, Rejected)',
              'D. 1 (Async)'
            ],
            correctAnswer: 'B',
            points: 2.5
          },
          {
            id: 'q4',
            type: 'ESSAY',
            prompt: 'Hãy giải thích sự khác biệt cơ bản giữa let và var trong JavaScript, cho ví dụ minh họa về hiện tượng Hoisting.',
            sampleAnswer: 'let có block scope, không bị hoisting gán undefined (Temporal Dead Zone). var có function scope và bị hoisting lên đầu hàm với giá trị undefined.',
            points: 2.5
          }
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'asm_final_exam_01',
        classId: 'cls_k15_web01',
        className: 'Full-stack Web K15 - Lớp 01',
        courseCode: 'WEB301',
        title: 'Thi kết thúc học phần: Phát triển Ứng dụng Web Fullstack & Hệ thống Cơ sở dữ liệu',
        description: 'BÀI THI KẾT THÚC HỌC PHẦN CHÍNH THỨC. Thời gian làm bài 60 phút. Bắt buộc kích hoạt chế độ Toàn màn hình & Giám sát chống gian lận. Yêu cầu mã kích hoạt từ Giám thị để vào làm.',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        maxScore: 10,
        assignedBy: 'usr_teacher_001',
        assignedByName: 'ThS. Nguyễn Văn Thầy',
        type: 'FINAL_EXAM',
        durationMinutes: 60,
        accessCode: 'EXAM-2026',
        isLocked: true,
        questionType: 'HYBRID',
        questions: [
          {
            id: 'fe_q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Mô hình kiến trúc RESTful API khuyến nghị sử dụng phương thức HTTP nào để cập nhật một phần dữ liệu?',
            options: [
              'A. POST',
              'B. PUT',
              'C. PATCH',
              'D. GET'
            ],
            correctAnswer: 'C',
            points: 2
          },
          {
            id: 'fe_q2',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Trong hệ quản trị CSDL quan hệ (RDBMS), tính chất nào đảm bảo giao dịch thực hiện hoàn tất hoặc hoàn tác toàn bộ (All or Nothing)?',
            options: [
              'A. Atomicity (Tính nguyên tử)',
              'B. Consistency (Tính nhất quán)',
              'C. Isolation (Tính cô lập)',
              'D. Durability (Tính bền vững)'
            ],
            correctAnswer: 'A',
            points: 2
          },
          {
            id: 'fe_q3',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Giao thức bảo mật JWT (JSON Web Token) thường bao gồm mấy phần cách nhau bởi dấu chấm (.)?',
            options: [
              'A. 2 (Header, Payload)',
              'B. 3 (Header, Payload, Signature)',
              'C. 4 (Header, Payload, Secret, Hash)',
              'D. 1 (Encrypted string)'
            ],
            correctAnswer: 'B',
            points: 2
          },
          {
            id: 'fe_q4',
            type: 'ESSAY',
            prompt: 'Phân tích ưu điểm và nhược điểm của giải pháp thiết kế Single Page Application (SPA) so với Multi-Page Application (MPA) truyền thống.',
            sampleAnswer: 'SPA trải nghiệm mượt mà, chuyển trang không reload nhờ AJAX/Fetch, tách biệt frontend và backend. Nhược điểm: SEO cần cấu hình SSR/SSG, tải trang ban đầu (bundle size) có thể nặng hơn.',
            points: 2
          },
          {
            id: 'fe_q5',
            type: 'ESSAY',
            prompt: 'Nêu các nguyên tắc cơ bản để bảo vệ hệ thống web API chống lại cuộc tấn công SQL Injection và Cross-Site Scripting (XSS).',
            sampleAnswer: 'SQL Injection: sử dụng Parameterized Queries / ORM, validate input chặt chẽ. XSS: escape/sanitize dữ liệu đầu ra HTML, cấu hình Content Security Policy (CSP), dùng cookie HttpOnly cho session token.',
            points: 2
          }
        ],
        createdAt: new Date().toISOString(),
      }
    ];
    this.submissions = [];
    this.tuitions = [
      {
        id: 'tui_2026_001',
        studentId: 'usr_student_001',
        studentName: 'Nguyễn Văn Học Viên',
        studentCode: 'HV2026-001',
        title: 'Học phí Học kỳ II (2026 - 2027) - Khối Kỹ thuật Phần mềm',
        courseId: 'CS101',
        classId: 'K20-CNTT1',
        totalAmount: 4500000,
        paidAmount: 1500000,
        debtAmount: 3000000,
        status: 'PARTIAL',
        dueDate: '2026-11-30',
        receipts: [
          {
            receiptNumber: 'BL-2026-10023',
            amount: 1500000,
            paidAt: '2026-10-10T08:30:00.000Z',
            method: 'Chuyển khoản VNPAY / QR Code',
            cashier: 'Kế toán trưởng TMS',
            note: 'Tạm ứng đợt 1',
            studentName: 'Nguyễn Văn Học Viên',
            semester: 'Học kỳ II (2026 - 2027)'
          }
        ],
        createdAt: '2026-10-01T08:00:00.000Z',
      },
      {
        id: 'tui_2026_002',
        studentId: 'usr_student_002',
        studentName: 'Vũ Hoàng Nam',
        studentCode: 'HV2026-002',
        title: 'Học phí Học kỳ II (2026 - 2027) - Hệ thống Cơ sở dữ liệu',
        courseId: 'DB201',
        classId: 'K20-HTTT',
        totalAmount: 3800000,
        paidAmount: 0,
        debtAmount: 3800000,
        status: 'UNPAID',
        dueDate: '2026-11-25',
        receipts: [],
        createdAt: '2026-10-05T09:00:00.000Z',
      },
      {
        id: 'tui_2026_003',
        studentId: 'usr_student_003',
        studentName: 'Nguyễn Thị Bích Ngọc',
        studentCode: 'HV2026-003',
        title: 'Học phí Học kỳ II (2026 - 2027) - Trí tuệ Nhân tạo thực chiến',
        courseId: 'AI101',
        classId: 'K20-KHDL',
        totalAmount: 5200000,
        paidAmount: 0,
        debtAmount: 5200000,
        status: 'UNPAID',
        dueDate: '2026-12-15',
        receipts: [],
        createdAt: '2026-10-08T10:00:00.000Z',
      },
      {
        id: 'tui_2026_004',
        studentId: 'usr_admin_001',
        studentName: 'Quản trị viên Hệ thống (Admin)',
        studentCode: 'TMS-2026-001',
        title: 'Học phí Học kỳ II (2026 - 2027) - Khóa đào tạo Nâng cao',
        courseId: 'WEB301',
        classId: 'K20-ADMIN',
        totalAmount: 6000000,
        paidAmount: 2000000,
        debtAmount: 4000000,
        status: 'PARTIAL',
        dueDate: '2026-12-20',
        receipts: [],
        createdAt: '2026-10-10T10:00:00.000Z',
      }
    ];
    this.grades = [];
    this.openCourseOfferings = [
      {
        id: 'off_cs101_01',
        code: 'CS101',
        name: 'Nhập môn Lập trình & Tư duy Thuật toán',
        courseCode: 'CS101',
        courseName: 'Nhập môn Lập trình & Tư duy Thuật toán',
        credits: 3,
        teacherName: 'ThS. Nguyễn Văn Thầy',
        schedule: 'Thứ 2, 4 (Ca 1: 07:30 - 09:30)',
        room: 'Phòng Lab 301 - Nhà Công Nghệ',
        capacity: 45,
        enrolled: 18,
        status: 'OPEN',
        tuitionFee: 1350000,
        semester: 'Học kỳ II (2026 - 2027)',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'off_cs202_01',
        code: 'CS202',
        name: 'Cấu trúc Dữ liệu & Giải thuật Ứng dụng',
        courseCode: 'CS202',
        courseName: 'Cấu trúc Dữ liệu & Giải thuật Ứng dụng',
        credits: 4,
        teacherName: 'TS. Lê Hoàng Nam',
        schedule: 'Thứ 3, 5 (Ca 2: 09:45 - 11:45)',
        room: 'Phòng Lab 402 - Nhà C',
        capacity: 40,
        enrolled: 22,
        status: 'OPEN',
        tuitionFee: 1800000,
        semester: 'Học kỳ II (2026 - 2027)',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'off_db201_01',
        code: 'DB201',
        name: 'Cơ sở Dữ liệu & Hệ Quản trị SQL / NoSQL',
        courseCode: 'DB201',
        courseName: 'Cơ sở Dữ liệu & Hệ Quản trị SQL / NoSQL',
        credits: 3,
        teacherName: 'ThS. Phạm Thị Thu',
        schedule: 'Thứ 2, 6 (Ca 3: 13:30 - 15:30)',
        room: 'Phòng Lab 204 - Nhà A',
        capacity: 50,
        enrolled: 35,
        status: 'OPEN',
        tuitionFee: 1350000,
        semester: 'Học kỳ II (2026 - 2027)',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'off_web301_01',
        code: 'WEB301',
        name: 'Phát triển Ứng dụng Web Fullstack Hiện đại',
        courseCode: 'WEB301',
        courseName: 'Phát triển Ứng dụng Web Fullstack Hiện đại',
        credits: 4,
        teacherName: 'ThS. Trần Văn Trợ Giảng',
        schedule: 'Thứ 3, 7 (Ca 4: 15:45 - 17:45)',
        room: 'Phòng Hội thảo Quốc tế B1',
        capacity: 40,
        enrolled: 15,
        status: 'OPEN',
        tuitionFee: 1800000,
        semester: 'Học kỳ II (2026 - 2027)',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'off_ai101_01',
        code: 'AI101',
        name: 'Nhập môn Trí tuệ Nhân tạo & Machine Learning',
        courseCode: 'AI101',
        courseName: 'Nhập môn Trí tuệ Nhân tạo & Machine Learning',
        credits: 3,
        teacherName: 'PGS. TS. Vũ Đình Trọng',
        schedule: 'Thứ 5, 7 (Ca 1: 07:30 - 09:30)',
        room: 'Phòng Lab AI & IoT Nhà D',
        capacity: 35,
        enrolled: 29,
        status: 'OPEN',
        tuitionFee: 1350000,
        semester: 'Học kỳ II (2026 - 2027)',
        createdAt: new Date().toISOString(),
      },
    ];
    this.courseRegistrations = [];
    this.studentRequests = [];

    // State theo dõi hệ thống
    this.failedAttempts = new Map();
    this.resetTokens = new Map();
    if (!preserveSessions) {
      this.activeSessions = new Map();
      this.userSessions = new Map();
    }
    this.auditLogs = [];
  }

  seedSampleData() {
    // 2. Môn học chuẩn (Courses / Subjects - S2-05 & S2-07)
    this.courses = [
      {
        id: 'crs_cs101',
        code: 'CS101',
        name: 'Nhập môn Lập trình & Tư duy Thuật toán',
        sessionCount: 15,
        credits: 3,
        tuitionPerCredit: 800000,
        learningOutcomes: 'Nắm vững tư duy giải thuật, cấu trúc dữ liệu cơ bản, mảng, hàm và lập trình hướng đối tượng cơ bản.',
        status: 'ACTIVE',
        sessions: [
          { id: 'ses_01', sessionNumber: 1, topic: 'Tổng quan Khoa học máy tính & Cài đặt môi trường', objective: 'Hiểu cấu trúc máy tính, luồng thực thi và thiết lập công cụ lập trình chuẩn.' },
          { id: 'ses_02', sessionNumber: 2, topic: 'Biến, Kiểu dữ liệu và Phép toán logic', objective: 'Sử dụng thành thạo biến, số học và các biểu thức điều kiện so sánh.' },
          { id: 'ses_03', sessionNumber: 3, topic: 'Cấu trúc điều khiển rẽ nhánh if/else, switch', objective: 'Giải quyết các bài toán rẽ nhánh đa luồng điều kiện.' },
          { id: 'ses_04', sessionNumber: 4, topic: 'Vòng lặp for, while, do-while & Xử lý lặp', objective: 'Xây dựng thuật toán lặp duyệt mảng và tính tổng chuỗi số.' },
          { id: 'ses_05', sessionNumber: 5, topic: 'Hàm & Kỹ thuật phân rã mã nguồn modular', objective: 'Viết hàm tái sử dụng, truyền tham số và kiểm tra giá trị trả về.' },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'crs_cs102',
        code: 'CS102',
        name: 'Lập trình Frontend Hiện đại với React & TypeScript',
        sessionCount: 20,
        credits: 4,
        tuitionPerCredit: 900000,
        learningOutcomes: 'Xây dựng giao diện web Single Page Application chuẩn công nghiệp với React, Hooks, TypeScript và Tailwind CSS.',
        status: 'ACTIVE',
        sessions: [
          { id: 'ses_11', sessionNumber: 1, topic: 'HTML5 Semantic, CSS3 Modern & Responsive Design', objective: 'Dựng layout chuẩn responsive tương thích đa thiết bị.' },
          { id: 'ses_12', sessionNumber: 2, topic: 'TypeScript Core: Types, Interfaces & Generics', objective: 'Tối ưu Type Safety trong ứng dụng JavaScript quy mô lớn.' },
          { id: 'ses_13', sessionNumber: 3, topic: 'React Components, Props & State Management', objective: 'Xây dựng component động và quản lý trạng thái.' },
          { id: 'ses_14', sessionNumber: 4, topic: 'React Hooks chuyên sâu (useState, useEffect, useMemo)', objective: 'Làm chủ vòng đời component và tối ưu hóa hiệu năng render.' },
          { id: 'ses_15', sessionNumber: 5, topic: 'Quản lý State toàn cục với Zustand & Context API', objective: 'Kiến trúc dữ liệu luồng một chiều chuẩn Clean Architecture.' },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'crs_cs103',
        code: 'CS103',
        name: 'Xây dựng Web API & Backend Microservices với Node.js',
        sessionCount: 20,
        credits: 4,
        tuitionPerCredit: 900000,
        learningOutcomes: 'Thiết kế RESTful API an toàn, xác thực JWT đa cấp, bảo mật HTTPOnly cookie và tích hợp cơ sở dữ liệu.',
        status: 'ACTIVE',
        sessions: [
          { id: 'ses_21', sessionNumber: 1, topic: 'Kiến trúc Node.js Event Loop & Express Middleware', objective: 'Hiểu cơ chế bất đồng bộ non-blocking I/O và tạo server REST.' },
          { id: 'ses_22', sessionNumber: 2, topic: 'Xác thực bảo mật JWT, Hash Password & RBAC', objective: 'Triển khai ma trận phân quyền RBAC và mã hóa an toàn mật khẩu.' },
          { id: 'ses_23', sessionNumber: 3, topic: 'Thiết kế RESTful API chuẩn chuẩn RFC & Error Handling', objective: 'Quy chuẩn mã trạng thái HTTP và xử lý ngoại lệ tập trung.' },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'crs_cs104',
        code: 'CS104',
        name: 'Cơ sở Dữ liệu SQL & NoSQL Nâng cao',
        sessionCount: 15,
        credits: 3,
        tuitionPerCredit: 800000,
        learningOutcomes: 'Thiết kế lược đồ quan hệ chuẩn hóa 3NF, viết truy vấn phức tạp, indexing và vận hành MongoDB/PostgreSQL.',
        status: 'ACTIVE',
        sessions: [
          { id: 'ses_31', sessionNumber: 1, topic: 'Mô hình hóa dữ liệu quan hệ ERD & Chuẩn hóa 3NF', objective: 'Thiết kế cơ sở dữ liệu tối ưu, chống trùng lặp và toàn vẹn tham chiếu.' },
          { id: 'ses_32', sessionNumber: 2, topic: 'Truy vấn SQL nâng cao: Joins, Aggregations & Window Functions', objective: 'Phân tích dữ liệu bằng SQL truy vấn nhiều bảng phức tạp.' },
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    // 3. Chương trình đào tạo (Training Programs - S2-04 & S2-06)
    this.programs = [
      {
        id: 'prog_se_001',
        code: 'SE-PRO',
        name: 'Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)',
        description: 'Chương trình đào tạo Kỹ sư phần mềm thực chiến toàn diện từ nền tảng thuật toán, lập trình Frontend, Backend đến DevOps triển khai Cloud.',
        durationMonths: 12,
        totalHours: 1200,
        standardTuition: 36000000,
        status: 'ACTIVE',
        courses: [
          { courseId: 'crs_cs101', orderIndex: 1, prerequisiteCourseId: null },
          { courseId: 'crs_cs104', orderIndex: 2, prerequisiteCourseId: 'crs_cs101' },
          { courseId: 'crs_cs102', orderIndex: 3, prerequisiteCourseId: 'crs_cs101' },
          { courseId: 'crs_cs103', orderIndex: 4, prerequisiteCourseId: 'crs_cs102' },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prog_ai_002',
        code: 'AI-DATA',
        name: 'Trí tuệ Nhân tạo & Khoa học Dữ liệu (AI & Data Science)',
        description: 'Chuyên sâu Machine Learning, Deep Learning, Xử lý ngôn ngữ tự nhiên (NLP) và xây dựng ứng dụng Generative AI ứng dụng thực tế.',
        durationMonths: 18,
        totalHours: 1800,
        standardTuition: 54000000,
        status: 'ACTIVE',
        courses: [
          { courseId: 'crs_cs101', orderIndex: 1, prerequisiteCourseId: null },
          { courseId: 'crs_cs104', orderIndex: 2, prerequisiteCourseId: 'crs_cs101' },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prog_web_003',
        code: 'FULLSTACK',
        name: 'Lập trình Web & Mobile Full-stack',
        description: 'Lộ trình cấp tốc 6 tháng giúp sinh viên làm chủ trọn vẹn ngăn xếp React, Node.js, Express và triển khai ứng dụng thực tế.',
        durationMonths: 6,
        totalHours: 600,
        standardTuition: 22000000,
        status: 'ACTIVE',
        courses: [
          { courseId: 'crs_cs101', orderIndex: 1, prerequisiteCourseId: null },
          { courseId: 'crs_cs102', orderIndex: 2, prerequisiteCourseId: 'crs_cs101' },
          { courseId: 'crs_cs103', orderIndex: 3, prerequisiteCourseId: 'crs_cs102' },
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    // 4. Lớp học đang chạy (S3-05, S3-06, S3-07, S3-08, S3-09)
    this.classes = [
      {
        id: 'cls_k15_se01',
        code: 'K15-SE01',
        name: 'Kỹ nghệ Phần mềm K15 - Lớp 01',
        programId: 'prog_se_001',
        programName: 'Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)',
        courseId: 'crs_cs101',
        teacherId: 'usr_teacher_001',
        teacherName: 'Giảng viên Chuẩn Đại học',
        assistantId: 'usr_assistant_001',
        assistantName: 'Trợ giảng Đào tạo',
        roomId: 'room_lab_302',
        room: 'Phòng Lab Chuyên Đề AI/Cloud 302 - Nhà B',
        maxCapacity: 40,
        maxStudents: 40,
        currentStudents: 28,
        currentCount: 28,
        mode: 'OFFLINE',
        status: 'ACTIVE',
        startDate: '2026-09-01',
        endDate: '2027-08-31',
        studentIds: ['stu_001'],
        enrollmentHistory: [
          {
            id: 'enh_01',
            studentId: 'stu_001',
            studentCode: 'HV2026-001',
            studentName: 'Đỗ Thảo Vy',
            enrolledAt: '2026-09-01T08:00:00.000Z',
            enrolledBy: 'Quản trị viên Hệ thống',
          },
        ],
        capacityWarning: 'Cảnh báo S3-09: Sĩ số tối đa của lớp (40 học viên) vượt quá sức chứa phòng "Phòng Lab Chuyên Đề AI/Cloud 302 - Nhà B" (25 chỗ ngồi)!',
        courses: [
          {
            courseId: 'crs_cs101',
            courseCode: 'CS101',
            courseName: 'Cơ sở Lập trình & Tư duy Thuật toán',
            credits: 3,
            sessionCount: 15,
            orderIndex: 1,
            teacherId: 'usr_teacher_001',
            teacherName: 'Giảng viên Chuẩn Đại học',
            assistantIds: ['usr_assistant_001'],
            assistantNames: ['Trợ giảng Đào tạo'],
            status: 'IN_PROGRESS',
            completedSessions: 8,
          },
          {
            courseId: 'crs_cs104',
            courseCode: 'CS104',
            courseName: 'Cơ sở Dữ liệu SQL & NoSQL Nâng cao',
            credits: 3,
            sessionCount: 15,
            orderIndex: 2,
            teacherId: 'usr_teacher_001',
            teacherName: 'Giảng viên Chuẩn Đại học',
            assistantIds: [],
            assistantNames: [],
            status: 'NOT_STARTED',
            completedSessions: 0,
          },
          {
            courseId: 'crs_cs102',
            courseCode: 'CS102',
            courseName: 'Lập trình Frontend Hiện đại với React & TypeScript',
            credits: 4,
            sessionCount: 20,
            orderIndex: 3,
            teacherId: null,
            teacherName: 'Chưa phân công',
            assistantIds: [],
            assistantNames: [],
            status: 'NOT_STARTED',
            completedSessions: 0,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cls_k15_web01',
        code: 'K15-WEB01',
        name: 'Full-stack Web K15 - Lớp 01',
        programId: 'prog_web_003',
        programName: 'Lập trình Web & Mobile Full-stack',
        courseId: 'crs_cs102',
        teacherId: 'usr_teacher_001',
        teacherName: 'Giảng viên Chuẩn Đại học',
        assistantId: 'usr_assistant_001',
        assistantName: 'Trợ giảng Đào tạo',
        roomId: 'room_th_201',
        room: 'Phòng Học Lý Thuyết 201 - Nhà A',
        maxCapacity: 35,
        maxStudents: 35,
        currentStudents: 22,
        currentCount: 22,
        mode: 'OFFLINE',
        status: 'ACTIVE',
        startDate: '2026-10-01',
        endDate: '2027-04-30',
        studentIds: ['stu_002'],
        enrollmentHistory: [
          {
            id: 'enh_02',
            studentId: 'stu_002',
            studentCode: 'HV2026-002',
            studentName: 'Vũ Hoàng Nam',
            enrolledAt: '2026-10-01T08:00:00.000Z',
            enrolledBy: 'Trần Quang Hải (Quản lý đào tạo)',
          },
        ],
        capacityWarning: null,
        courses: [
          {
            courseId: 'crs_cs101',
            courseCode: 'CS101',
            courseName: 'Cơ sở Lập trình & Tư duy Thuật toán',
            credits: 3,
            sessionCount: 15,
            orderIndex: 1,
            teacherId: 'usr_teacher_001',
            teacherName: 'Giảng viên Chuẩn Đại học',
            assistantIds: ['usr_assistant_001'],
            assistantNames: ['Trợ giảng Đào tạo'],
            status: 'COMPLETED',
            completedSessions: 15,
          },
          {
            courseId: 'crs_cs102',
            courseCode: 'CS102',
            courseName: 'Lập trình Frontend Hiện đại với React & TypeScript',
            credits: 4,
            sessionCount: 20,
            orderIndex: 2,
            teacherId: 'usr_teacher_001',
            teacherName: 'Giảng viên Chuẩn Đại học',
            assistantIds: ['usr_assistant_001'],
            assistantNames: ['Trợ giảng Đào tạo'],
            status: 'IN_PROGRESS',
            completedSessions: 5,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 5. Khách hàng tiềm năng & Tuyển sinh (Leads CRM - S2-08 -> S3-03)
    this.admissions = [
      {
        id: 'adm_001',
        fullName: 'Trần Văn Hoàng',
        phone: '0987654321',
        email: 'hoang.tran@gmail.com',
        source: 'Website (Công khai)',
        programName: 'Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)',
        score: 26.5,
        status: 'NEW', // NEW | CONTACTED | CONSULTING | TRIAL_SCHEDULED | CLOSED_WON | CLOSED_LOST | ENROLLED
        consultantId: null,
        consultantName: 'Chưa phân công',
        note: 'Đăng ký tư vấn trực tuyến qua cổng website. Quan tâm chính sách học bổng và lộ trình thực tập.',
        lossReason: null,
        isLocked: false,
        studentId: null,
        studentCode: null,
        remindAt: new Date(Date.now() + 86400000).toISOString(),
        careLogs: [],
        statusHistory: [
          {
            id: 'sth_01',
            fromStatus: 'NEW',
            toStatus: 'NEW',
            reason: null,
            note: 'Tiếp nhận lead từ website công khai',
            changedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            changedById: 'SYSTEM',
            changedByName: 'Cổng Website',
          },
        ],
        assignmentHistory: [],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'adm_002',
        fullName: 'Lê Thu Trang',
        phone: '0912345679',
        email: 'trang.le@gmail.com',
        source: 'Facebook',
        programName: 'Trí tuệ Nhân tạo & Khoa học Dữ liệu (AI & Data Science)',
        score: 27.0,
        status: 'CONSULTING',
        consultantId: 'usr_consultant_001',
        consultantName: 'Chuyên viên Tư vấn Tuyển sinh',
        note: 'Đã hẹn tư vấn trực tiếp vào sáng Thứ 7 tuần này tại phòng Tuyển sinh cơ sở 1.',
        lossReason: null,
        isLocked: false,
        studentId: null,
        studentCode: null,
        remindAt: new Date(Date.now() - 86400000 * 2).toISOString(), // Quá hạn nhắc gọi lại 2 ngày để kiểm tra S3-02!
        careLogs: [
          {
            id: 'care_01',
            type: 'CALL',
            content: 'Gọi điện trao đổi chương trình học bổng, tư vấn lộ trình AI. Khách hẹn gặp sáng Thứ 7.',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            createdById: 'usr_consultant_001',
            createdByName: 'Chuyên viên Tư vấn Tuyển sinh',
            remindAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ],
        statusHistory: [
          {
            id: 'sth_02',
            fromStatus: 'NEW',
            toStatus: 'CONTACTED',
            reason: null,
            note: 'Đã gọi điện lần đầu',
            changedAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
            changedById: 'usr_consultant_001',
            changedByName: 'Chuyên viên Tư vấn Tuyển sinh',
          },
          {
            id: 'sth_03',
            fromStatus: 'CONTACTED',
            toStatus: 'CONSULTING',
            reason: null,
            note: 'Chuyển sang tư vấn chuyên sâu lộ trình học bổng',
            changedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            changedById: 'usr_consultant_001',
            changedByName: 'Chuyên viên Tư vấn Tuyển sinh',
          },
        ],
        assignmentHistory: [
          {
            id: 'his_01',
            assignedById: 'usr_manager_001',
            assignedByName: 'Trưởng phòng Đào tạo',
            consultantId: 'usr_consultant_001',
            consultantName: 'Chuyên viên Tư vấn Tuyển sinh',
            assignedAt: new Date(Date.now() - 86400000).toISOString(),
            note: 'Phân công lead tiềm năng có điểm thi THPT xuất sắc',
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'adm_003',
        fullName: 'Phạm Minh Tuấn',
        phone: '0934567890',
        email: 'tuan.pm@gmail.com',
        source: 'Hotline',
        programName: 'Lập trình Web & Mobile Full-stack',
        score: 25.0,
        status: 'CLOSED_WON',
        consultantId: 'usr_consultant_002',
        consultantName: 'Nguyễn Thị Mai (TVV)',
        note: 'Gặp trực tiếp tại trường, phụ huynh và học sinh đồng ý chốt đăng ký nhập học!',
        lossReason: null,
        isLocked: false,
        studentId: null,
        studentCode: null,
        remindAt: null,
        careLogs: [
          {
            id: 'care_02',
            type: 'MEETING',
            content: 'Gặp trực tiếp tại văn phòng tuyển sinh, tư vấn ưu đãi học phí và hoàn tất thỏa thuận.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            createdById: 'usr_consultant_002',
            createdByName: 'Nguyễn Thị Mai (TVV)',
            remindAt: null,
          },
        ],
        statusHistory: [
          {
            id: 'sth_04',
            fromStatus: 'CONSULTING',
            toStatus: 'CLOSED_WON',
            reason: null,
            note: 'Chốt thành công gói học phí K15 Full-stack',
            changedAt: new Date(Date.now() - 86400000).toISOString(),
            changedById: 'usr_consultant_002',
            changedByName: 'Nguyễn Thị Mai (TVV)',
          },
        ],
        assignmentHistory: [
          {
            id: 'his_02',
            assignedById: 'usr_manager_001',
            assignedByName: 'Trưởng phòng Đào tạo',
            consultantId: 'usr_consultant_002',
            consultantName: 'Nguyễn Thị Mai (TVV)',
            assignedAt: new Date(Date.now() - 172800000).toISOString(),
            note: 'Phân công cho tư vấn viên Mai hỗ trợ tư vấn khóa Full-stack',
          },
        ],
        createdAt: new Date(Date.now() - 172800000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    // 6. Danh mục Phòng học & Phòng học trực tuyến (S3-09)
    this.rooms = [
      {
        id: 'room_lab_101',
        code: 'LAB-101',
        name: 'Phòng Lab Máy Tính 101 - Nhà A',
        type: 'PHYSICAL',
        capacity: 35,
        building: 'Nhà A (Khu Thực Hành)',
        equipment: '35 máy tính Core i7, Máy chiếu 4K, Điều hòa 2 chiều',
        onlineMeetingUrl: '',
        passcode: '',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'room_th_201',
        code: 'TH-201',
        name: 'Phòng Học Lý Thuyết 201 - Nhà A',
        type: 'PHYSICAL',
        capacity: 45,
        building: 'Nhà A',
        equipment: 'Bàn ghế chuẩn đại học, Âm thanh trợ giảng, Máy chiếu',
        onlineMeetingUrl: '',
        passcode: '',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'room_lab_302',
        code: 'LAB-302',
        name: 'Phòng Lab Chuyên Đề AI/Cloud 302 - Nhà B',
        type: 'PHYSICAL',
        capacity: 25,
        building: 'Nhà B',
        equipment: '25 máy trạm GPU RTX 4080, Màn hình phụ 27 inch',
        onlineMeetingUrl: '',
        passcode: '',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'room_online_zoom',
        code: 'ONLINE-ZOOM-01',
        name: 'Phòng Học Trực Tuyến Zoom Bản Quyền Pro #1',
        type: 'ONLINE',
        capacity: 100,
        building: 'Hạ tầng Trực tuyến Cloud',
        equipment: 'Zoom Education Cloud Recording, Breakout Rooms',
        onlineMeetingUrl: 'https://zoom.us/j/9876543210',
        passcode: 'TMS2026',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'room_online_meet',
        code: 'ONLINE-MEET-02',
        name: 'Phòng Học Trực Tuyến Google Meet Workspace #2',
        type: 'ONLINE',
        capacity: 80,
        building: 'Hạ tầng Trực tuyến Cloud',
        equipment: 'Google Meet Enterprise, Live Stream HD',
        onlineMeetingUrl: 'https://meet.google.com/abc-defg-hij',
        passcode: '',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      },
    ];

    // 7. Hồ sơ học viên (Student Profiles - S3-04)
    this.students = [
      {
        id: 'stu_001',
        studentCode: 'HV2026-001',
        userId: 'usr_student_001',
        fullName: 'Đỗ Thảo Vy',
        phone: '0912345678',
        email: 'student@tms.edu.vn',
        dob: '2004-03-12',
        address: 'Quận Cầu Giấy, Hà Nội',
        entryLevel: 'THPT',
        note: 'Tốt nghiệp THPT loại giỏi, đam mê lập trình web và khoa học dữ liệu.',
        programName: 'Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)',
        enrolledClasses: [
          {
            classId: 'cls_k15_se01',
            classCode: 'K15-SE01',
            className: 'Kỹ nghệ Phần mềm K15 - Lớp 01',
            programName: 'Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)',
            status: 'ACTIVE',
            enrolledAt: '2026-09-01T08:00:00.000Z',
            enrolledBy: 'Quản trị viên Hệ thống',
          },
        ],
        createdAt: '2026-09-01T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'stu_002',
        studentCode: 'HV2026-002',
        userId: 'usr_student_002',
        fullName: 'Vũ Hoàng Nam',
        phone: '0988776655',
        email: 'hoangnam.vu@gmail.com',
        dob: '2001-11-20',
        address: 'Quận Đống Đa, Hà Nội',
        entryLevel: 'Người đi làm chuyển ngành',
        note: 'Đã tốt nghiệp cử nhân Kinh tế, học chuyển ngành Full-stack Software Engineer.',
        programName: 'Lập trình Web & Mobile Full-stack',
        enrolledClasses: [
          {
            classId: 'cls_k15_web01',
            classCode: 'K15-WEB01',
            className: 'Full-stack Web K15 - Lớp 01',
            programName: 'Lập trình Web & Mobile Full-stack',
            status: 'ACTIVE',
            enrolledAt: '2026-10-01T08:00:00.000Z',
            enrolledBy: 'Trần Quang Hải (Quản lý đào tạo)',
          },
        ],
        createdAt: '2026-10-01T08:00:00.000Z',
        updatedAt: '2026-10-01T08:00:00.000Z',
      },
      {
        id: 'stu_003',
        studentCode: 'HV2026-003',
        userId: 'usr_student_003',
        fullName: 'Nguyễn Thị Bích Ngọc',
        phone: '0977112233',
        email: 'bichngoc.nguyen@gmail.com',
        dob: '2003-08-15',
        address: 'Quận Thanh Xuân, Hà Nội',
        entryLevel: 'Cao đẳng / Đại học',
        note: 'Sinh viên năm 3 chuyển tiếp chuyên sâu công nghệ phần mềm TMS.',
        programName: 'Kỹ nghệ Phần mềm Chuẩn Quốc tế (Software Engineering)',
        enrolledClasses: [],
        createdAt: '2026-10-05T08:00:00.000Z',
        updatedAt: '2026-10-05T08:00:00.000Z',
      },
    ];
  }

  // =========================================================================
  // QUẢN LÝ NGƯỜI DÙNG & TÀI KHOẢN (USER MANAGEMENT)
  // =========================================================================
  findUserByEmail(identifier) {
    if (!identifier) return null;
    const q = identifier.trim().toLowerCase();
    return this.users.find(u =>
      u.email.toLowerCase() === q ||
      (u.username && u.username.toLowerCase() === q) ||
      (q === 'admin' && (u.username === 'admin' || u.email.startsWith('admin@') || u.roles.includes(ROLES.ADMIN)))
    );
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  createUser({ fullName, email, phone, roles, password, avatar, dob, address }) {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new Error('Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.');
    }

    if (phone && phone.trim() && !isValidVNPhone(phone)) {
      throw new Error('Số điện thoại không đúng định dạng Việt Nam (10 chữ số, ví dụ 0912345678).');
    }

    const newUser = {
      id: generateId('usr'),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      phone: phone ? phone.trim() : '',
      dob: dob || '',
      address: address ? address.trim() : '',
      roles: Array.isArray(roles) && roles.length > 0 ? roles : [ROLES.STUDENT],
      status: 'ACTIVE',
      lockReason: null,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      createdAt: new Date().toISOString(),
    };

    this.users.unshift(newUser);
    return newUser;
  }

  updateUser(id, { fullName, phone, roles }) {
    const user = this.findUserById(id);
    if (!user) throw new Error('Không tìm thấy người dùng.');
    if (fullName !== undefined) user.fullName = fullName.trim();
    if (phone !== undefined) {
      if (phone.trim() && !isValidVNPhone(phone)) {
        throw new Error('Số điện thoại không đúng định dạng Việt Nam (10 chữ số).');
      }
      user.phone = phone.trim();
    }
    if (Array.isArray(roles) && roles.length > 0) user.roles = roles;
    return user;
  }

  // S2-02 & S2-03: Xem và cập nhật hồ sơ cá nhân
  // - Sửa được: họ tên, số điện thoại, ngày sinh, địa chỉ, ảnh đại diện
  // - Tuyệt đối không tự đổi được email và vai trò
  // - Kiểm tra định dạng số điện thoại Việt Nam
  updateUserProfile(userId, { fullName, phone, dob, address, avatar }) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('Không tìm thấy tài khoản người dùng.');

    if (fullName !== undefined && fullName.trim()) {
      user.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      const cleanPhone = phone.trim();
      if (cleanPhone) {
        if (!isValidVNPhone(cleanPhone)) {
          throw new Error('Số điện thoại không đúng định dạng Việt Nam (10 chữ số, ví dụ 0912345678).');
        }
        user.phone = cleanPhone;
      } else {
        user.phone = '';
      }
    }

    if (dob !== undefined) {
      user.dob = dob;
    }

    if (address !== undefined) {
      user.address = address.trim();
    }

    if (avatar !== undefined && avatar.trim()) {
      user.avatar = avatar.trim();
    }

    return user;
  }

  // =========================================================================
  // S2-01: NHẬP DANH SÁCH NGƯỜI DÙNG HÀNG LOẠT TỪ TỆP EXCEL / CSV
  // =========================================================================
  validateImportUserRow(row, rowIndex, existingBatchEmails = new Set()) {
    const errors = [];
    const fullName = (row.fullName || row['Họ và tên'] || row['ho_ten'] || row.name || '').toString().trim();
    const email = (row.email || row['Email'] || '').toString().trim().toLowerCase();
    const phone = (row.phone || row['Số điện thoại'] || row['sdt'] || '').toString().trim();
    const roleInput = (row.role || row.roles || row['Vai trò'] || '').toString().trim();
    const dob = (row.dob || row['Ngày sinh'] || '').toString().trim();
    const address = (row.address || row['Địa chỉ'] || '').toString().trim();

    // 1. Kiểm tra họ và tên
    if (!fullName) {
      errors.push('Họ và tên không được để trống.');
    }

    // 2. Kiểm tra email
    if (!email) {
      errors.push('Email không được để trống.');
    } else if (!isValidEmail(email)) {
      errors.push('Email không đúng định dạng (vd: sv@tms.edu.vn).');
    } else if (this.findUserByEmail(email)) {
      errors.push('Email đã tồn tại trong hệ thống.');
    } else if (existingBatchEmails.has(email)) {
      errors.push('Email bị trùng lặp trong chính tệp tải lên.');
    }

    // 3. Kiểm tra số điện thoại (nếu có)
    if (phone && !isValidVNPhone(phone)) {
      errors.push('Số điện thoại không đúng định dạng VN (10 chữ số, ví dụ 0912345678).');
    }

    // 4. Chuẩn hóa vai trò (Mặc định là STUDENT)
    let roles = [ROLES.STUDENT];
    if (roleInput) {
      const upper = roleInput.toUpperCase();
      if (Object.values(ROLES).includes(upper)) {
        roles = [upper];
      } else if (upper.includes('GIẢNG VIÊN') || upper.includes('TEACHER')) {
        roles = [ROLES.TEACHER];
      } else if (upper.includes('QUẢN LÝ') || upper.includes('MANAGER')) {
        roles = [ROLES.TRAINING_MANAGER];
      } else if (upper.includes('TƯ VẤN') || upper.includes('CONSULTANT')) {
        roles = [ROLES.CONSULTANT];
      } else if (upper.includes('KẾ TOÁN') || upper.includes('ACCOUNTANT')) {
        roles = [ROLES.ACCOUNTANT];
      } else if (upper.includes('TRỢ GIẢNG') || upper.includes('ASSISTANT')) {
        roles = [ROLES.ASSISTANT];
      }
    }

    const isValid = errors.length === 0;
    if (isValid && email) {
      existingBatchEmails.add(email);
    }

    return {
      rowIndex,
      fullName,
      email,
      phone,
      roles,
      dob,
      address,
      isValid,
      errors,
    };
  }

  batchImportUsers(rows, actorId) {
    const existingBatchEmails = new Set();
    const evaluatedRows = rows.map((r, idx) => this.validateImportUserRow(r, idx + 1, existingBatchEmails));

    const importedUsers = [];
    const skippedRows = [];

    evaluatedRows.forEach(item => {
      if (item.isValid) {
        // Sinh mật khẩu tạm thời ngẫu nhiên (vd: Tms@482910)
        const tempPassword = `Tms@${Math.floor(100000 + Math.random() * 900000)}`;
        try {
          const user = this.createUser({
            fullName: item.fullName,
            email: item.email,
            phone: item.phone,
            roles: item.roles,
            password: tempPassword,
            dob: item.dob,
            address: item.address,
          });

          importedUsers.push({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
            tempPassword,
            rowIndex: item.rowIndex,
          });
        } catch (err) {
          skippedRows.push({
            rowIndex: item.rowIndex,
            fullName: item.fullName,
            email: item.email,
            errors: [err.message],
          });
        }
      } else {
        skippedRows.push({
          rowIndex: item.rowIndex,
          fullName: item.fullName,
          email: item.email,
          errors: item.errors,
        });
      }
    });

    this.logAudit({
      actorId,
      action: 'USER_BATCH_IMPORTED',
      targetId: 'BATCH_USERS',
      details: `Nhập hàng loạt: Thành công ${importedUsers.length}/${rows.length} người dùng, bỏ qua ${skippedRows.length} dòng lỗi.`,
    });

    return {
      total: rows.length,
      successCount: importedUsers.length,
      skippedCount: skippedRows.length,
      importedUsers,
      skippedRows,
    };
  }

  lockUser(id, reason, actorId) {
    const user = this.findUserById(id);
    if (!user) throw new Error('Không tìm thấy người dùng.');
    if (user.roles.includes(ROLES.ADMIN) && user.id === actorId) {
      throw new Error('Bạn không thể tự khoá tài khoản Quản trị viên của chính mình.');
    }

    user.status = 'LOCKED';
    user.lockReason = reason;
    this.revokeAllSessions(user.id);

    const teachingClasses = this.classes.filter(c => c.teacherId === user.id || c.managerId === user.id);

    this.logAudit({
      actorId,
      action: 'USER_LOCKED',
      targetId: user.id,
      details: `Khoá tài khoản ${user.email}. Lý do: ${reason}`,
    });

    return { user, teachingClasses };
  }

  unlockUser(id, actorId) {
    const user = this.findUserById(id);
    if (!user) throw new Error('Không tìm thấy người dùng.');

    user.status = 'ACTIVE';
    user.lockReason = null;

    this.logAudit({
      actorId,
      action: 'USER_UNLOCKED',
      targetId: user.id,
      details: `Mở khoá tài khoản ${user.email}`,
    });

    return user;
  }

  assignRole(userId, role, actorId) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng.');
    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }
    this.logAudit({
      actorId,
      action: 'ROLE_ASSIGNED',
      targetId: user.id,
      details: `Gán vai trò ${role} cho ${user.email}`,
    });
    return user;
  }

  revokeRole(userId, role, actorId) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng.');
    if (role === ROLES.ADMIN && user.id === actorId) {
      throw new Error('Bạn không thể tự thu hồi vai trò Quản trị viên (ADMIN) của chính mình.');
    }
    if (user.roles.length <= 1) {
      throw new Error('Người dùng phải có ít nhất một vai trò trong hệ thống.');
    }
    user.roles = user.roles.filter(r => r !== role);
    this.logAudit({
      actorId,
      action: 'ROLE_REVOKED',
      targetId: user.id,
      details: `Thu hồi vai trò ${role} khỏi ${user.email}`,
    });
    return user;
  }

  // =========================================================================
  // XÁC THỰC, PHIÊN & MẬT KHẨU
  // =========================================================================
  getFailedAttempts(email) {
    const normalized = email.toLowerCase().trim();
    const entry = this.failedAttempts.get(normalized);
    if (!entry) return null;
    if (entry.lockedUntil && Date.now() > entry.lockedUntil) {
      this.failedAttempts.delete(normalized);
      return null;
    }
    return entry;
  }

  recordFailedAttempt(email) {
    const normalized = email.toLowerCase().trim();
    let entry = this.failedAttempts.get(normalized);
    const now = Date.now();
    if (!entry || (now - entry.firstAttemptAt > 15 * 60 * 1000 && !entry.lockedUntil)) {
      entry = { count: 1, firstAttemptAt: now, lockedUntil: null };
    } else {
      entry.count += 1;
    }
    if (entry.count >= 5) {
      entry.lockedUntil = now + 15 * 60 * 1000;
    }
    this.failedAttempts.set(normalized, entry);
    return entry;
  }

  clearFailedAttempts(email) {
    this.failedAttempts.delete(email.toLowerCase().trim());
  }

  createSession(userId) {
    const sessionId = generateId('ses');
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    this.activeSessions.set(sessionId, { userId, createdAt: now, expiresAt });
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId).add(sessionId);
    return sessionId;
  }

  isSessionValid(sessionId) {
    if (!sessionId) return false;
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      return false;
    }
    return true;
  }

  revokeSession(sessionId) {
    if (!sessionId) return;
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const userSes = this.userSessions.get(session.userId);
      if (userSes) userSes.delete(sessionId);
    }
    this.activeSessions.delete(sessionId);
  }

  revokeAllSessions(userId, exceptSessionId = null) {
    const userSes = this.userSessions.get(userId);
    if (!userSes) return;
    for (const sid of userSes) {
      if (sid !== exceptSessionId) {
        this.activeSessions.delete(sid);
      }
    }
    this.userSessions.set(userId, exceptSessionId ? new Set([exceptSessionId]) : new Set());
  }

  createResetToken(userId, email) {
    const token = generateId('rst') + Math.random().toString(36).substring(2);
    const expiresAt = Date.now() + 30 * 60 * 1000;
    this.resetTokens.set(token, { userId, email, expiresAt, used: false });
    return token;
  }

  getResetToken(token) {
    const entry = this.resetTokens.get(token);
    if (!entry) return null;
    if (entry.used) return { error: 'TOKEN_USED' };
    if (Date.now() > entry.expiresAt) return { error: 'TOKEN_EXPIRED' };
    return entry;
  }

  consumeResetToken(token, newPassword) {
    const entry = this.getResetToken(token);
    if (!entry || entry.error) throw new Error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    const user = this.findUserById(entry.userId);
    if (!user) throw new Error('Người dùng không tồn tại.');

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    entry.used = true;
    this.revokeAllSessions(user.id);
    return true;
  }

  changePassword(userId, currentPassword, newPassword, currentSessionId) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('Người dùng không tồn tại.');
    const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isValid) throw new Error('Mật khẩu hiện tại không chính xác.');

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    this.revokeAllSessions(userId, currentSessionId);
    return true;
  }

  // =========================================================================
  // S2-04: QUẢN LÝ DANH MỤC CHƯƠNG TRÌNH ĐÀO TẠO (TRAINING PROGRAMS)
  // =========================================================================
  createProgram({ code, name, description = '', durationMonths = 12, totalHours = 1200, standardTuition = 30000000, status = 'ACTIVE' }) {
    if (!code || !name) throw new Error('Vui lòng điền mã và tên chương trình đào tạo.');
    const existing = this.programs.find(p => p.code.toLowerCase() === code.trim().toLowerCase());
    if (existing) throw new Error(`Mã chương trình "${code}" đã tồn tại.`);

    const program = {
      id: generateId('prog'),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description ? description.trim() : '',
      durationMonths: Number(durationMonths) || 12,
      totalHours: Number(totalHours) || 1200,
      standardTuition: Number(standardTuition) || 30000000,
      status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      courses: [], // S2-06: Danh sách môn học gắn vào chương trình kèm thứ tự & môn tiên quyết
      createdAt: new Date().toISOString(),
    };
    this.programs.unshift(program);
    return program;
  }

  updateProgram(id, { name, description, durationMonths, totalHours, standardTuition, status }) {
    const prog = this.programs.find(p => p.id === id);
    if (!prog) throw new Error('Không tìm thấy chương trình đào tạo.');

    if (name !== undefined && name.trim()) prog.name = name.trim();
    if (description !== undefined) prog.description = description.trim();
    if (durationMonths !== undefined) prog.durationMonths = Number(durationMonths) || 12;
    if (totalHours !== undefined) prog.totalHours = Number(totalHours) || 1200;
    if (standardTuition !== undefined) prog.standardTuition = Number(standardTuition) || 0;
    if (status !== undefined) prog.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    return prog;
  }

  toggleProgramStatus(id, newStatus) {
    const prog = this.programs.find(p => p.id === id);
    if (!prog) throw new Error('Không tìm thấy chương trình đào tạo.');
    prog.status = newStatus || (prog.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
    return prog;
  }

  // Ràng buộc S2-04: Chương trình đang có lớp chạy không được xoá, chỉ được ngừng áp dụng
  deleteProgram(id) {
    const prog = this.programs.find(p => p.id === id);
    if (!prog) throw new Error('Không tìm thấy chương trình đào tạo.');

    const activeClasses = this.classes.filter(c => c.programId === id);
    if (activeClasses.length > 0) {
      throw new Error(`Chương trình đang có ${activeClasses.length} lớp học chạy (${activeClasses.map(c => c.name).join(', ')}). Không được phép xoá, chỉ được ngừng áp dụng!`);
    }

    const idx = this.programs.findIndex(p => p.id === id);
    this.programs.splice(idx, 1);
    return { success: true, message: 'Đã xoá chương trình đào tạo thành công.' };
  }

  // =========================================================================
  // S2-06: GẮN MÔN HỌC VÀO CHƯƠNG TRÌNH, SẮP THỨ TỰ & MÔN TIÊN QUYẾT
  // =========================================================================
  getProgramCourses(programId) {
    const prog = this.programs.find(p => p.id === programId);
    if (!prog) throw new Error('Không tìm thấy chương trình đào tạo.');

    if (!Array.isArray(prog.courses)) prog.courses = [];

    return prog.courses.map(pc => {
      const course = this.courses.find(c => c.id === pc.courseId);
      const prereq = pc.prerequisiteCourseId ? this.courses.find(c => c.id === pc.prerequisiteCourseId) : null;
      return {
        courseId: pc.courseId,
        orderIndex: pc.orderIndex,
        prerequisiteCourseId: pc.prerequisiteCourseId || null,
        prerequisiteCourseName: prereq ? prereq.name : null,
        prerequisiteCourseCode: prereq ? prereq.code : null,
        courseCode: course ? course.code : 'CRS',
        courseName: course ? course.name : 'Môn học',
        credits: course ? course.credits : 3,
        sessionCount: course ? course.sessionCount : 15,
      };
    }).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  addCourseToProgram(programId, { courseId, prerequisiteCourseId }) {
    const prog = this.programs.find(p => p.id === programId);
    if (!prog) throw new Error('Không tìm thấy chương trình đào tạo.');

    const course = this.courses.find(c => c.id === courseId);
    if (!course) throw new Error('Không tìm thấy môn học cần gắn.');

    if (!Array.isArray(prog.courses)) prog.courses = [];

    const existing = prog.courses.find(pc => pc.courseId === courseId);
    if (existing) {
      throw new Error(`Môn học "${course.name}" đã có trong chương trình này rồi.`);
    }

    const maxOrder = prog.courses.reduce((max, cur) => Math.max(max, cur.orderIndex || 0), 0);
    const newEntry = {
      courseId,
      orderIndex: maxOrder + 1,
      prerequisiteCourseId: (prerequisiteCourseId && prerequisiteCourseId !== courseId) ? prerequisiteCourseId : null,
    };

    prog.courses.push(newEntry);
    return this.getProgramCourses(programId);
  }

  removeCourseFromProgram(programId, courseId) {
    const prog = this.programs.find(p => p.id === programId);
    if (!prog) throw new Error('Không tìm thấy chương trình đào tạo.');

    if (!Array.isArray(prog.courses)) return [];

    prog.courses = prog.courses.filter(pc => pc.courseId !== courseId);
    // Tự động sắp xếp lại orderIndex từ 1 đến N
    prog.courses.sort((a, b) => a.orderIndex - b.orderIndex).forEach((pc, idx) => {
      pc.orderIndex = idx + 1;
    });

    return this.getProgramCourses(programId);
  }

  reorderProgramCourses(programId, courseIdsOrder) {
    const prog = this.programs.find(p => p.id === programId);
    if (!prog) throw new Error('Không tìm thấy chương trình đào tạo.');

    if (!Array.isArray(prog.courses)) prog.courses = [];

    courseIdsOrder.forEach((cid, idx) => {
      const found = prog.courses.find(pc => pc.courseId === cid);
      if (found) {
        found.orderIndex = idx + 1;
      }
    });

    return this.getProgramCourses(programId);
  }

  updateCoursePrerequisite(programId, courseId, prerequisiteCourseId) {
    const prog = this.programs.find(p => p.id === programId);
    if (!prog) throw new Error('Không tìm thấy chương trình đào tạo.');

    const found = prog.courses.find(pc => pc.courseId === courseId);
    if (!found) throw new Error('Môn học không nằm trong chương trình này.');

    if (prerequisiteCourseId === courseId) {
      throw new Error('Môn học không thể tự làm môn tiên quyết của chính mình.');
    }

    found.prerequisiteCourseId = prerequisiteCourseId || null;
    return this.getProgramCourses(programId);
  }

  // =========================================================================
  // S2-05: QUẢN LÝ DANH MỤC MÔN HỌC (SUBJECTS / COURSES)
  // =========================================================================
  createCourse({ code, name, sessionCount = 15, credits = 3, learningOutcomes = '', tuitionPerCredit = 800000 }) {
    if (!code || !name) throw new Error('Vui lòng điền mã môn và tên môn học.');
    const existing = this.courses.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
    if (existing) throw new Error(`Mã môn học "${code}" đã tồn tại.`);

    const course = {
      id: generateId('crs'),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      sessionCount: Number(sessionCount) || 15,
      credits: Number(credits) || 3,
      tuitionPerCredit: Number(tuitionPerCredit) || 800000,
      learningOutcomes: learningOutcomes ? learningOutcomes.trim() : '',
      status: 'ACTIVE',
      sessions: [], // S2-07: Khai báo các buổi học
      createdAt: new Date().toISOString(),
    };
    this.courses.unshift(course);
    return course;
  }

  updateCourse(id, { name, sessionCount, credits, learningOutcomes, tuitionPerCredit, status }) {
    const crs = this.courses.find(c => c.id === id);
    if (!crs) throw new Error('Không tìm thấy môn học.');

    if (name !== undefined && name.trim()) crs.name = name.trim();
    if (sessionCount !== undefined) crs.sessionCount = Number(sessionCount) || 15;
    if (credits !== undefined) crs.credits = Number(credits) || 3;
    if (learningOutcomes !== undefined) crs.learningOutcomes = learningOutcomes.trim();
    if (tuitionPerCredit !== undefined) crs.tuitionPerCredit = Number(tuitionPerCredit) || 800000;
    if (status !== undefined) crs.status = status;

    return crs;
  }

  // Ràng buộc S2-05: Môn đã có lớp học thì không xoá được
  deleteCourse(id) {
    const crs = this.courses.find(c => c.id === id);
    if (!crs) throw new Error('Không tìm thấy môn học.');

    const activeClasses = this.classes.filter(c => c.courseId === id);
    if (activeClasses.length > 0) {
      throw new Error(`Môn học này đã có ${activeClasses.length} lớp học triển khai (${activeClasses.map(c => c.name).join(', ')}). Không được phép xoá!`);
    }

    // Xoá môn khỏi danh mục môn học
    const idx = this.courses.findIndex(c => c.id === id);
    this.courses.splice(idx, 1);

    // Đồng thời gỡ môn này khỏi các chương trình đang gắn
    this.programs.forEach(p => {
      if (Array.isArray(p.courses)) {
        p.courses = p.courses.filter(pc => pc.courseId !== id);
      }
    });

    return { success: true, message: 'Đã xoá môn học thành công.' };
  }

  // =========================================================================
  // S2-07: KHAI BÁO CÁC BUỔI HỌC TRONG MỘT MÔN (SYLLABUS / SESSIONS)
  // =========================================================================
  getCourseSessions(courseId) {
    const crs = this.courses.find(c => c.id === courseId);
    if (!crs) throw new Error('Không tìm thấy môn học.');
    if (!Array.isArray(crs.sessions)) crs.sessions = [];
    return crs.sessions.sort((a, b) => a.sessionNumber - b.sessionNumber);
  }

  addCourseSession(courseId, { topic, objective }) {
    const crs = this.courses.find(c => c.id === courseId);
    if (!crs) throw new Error('Không tìm thấy môn học.');

    if (!Array.isArray(crs.sessions)) crs.sessions = [];

    // Ràng buộc S2-07: Số buổi khai báo không vượt quá số buổi của môn học
    if (crs.sessions.length >= crs.sessionCount) {
      throw new Error(`Số buổi khai báo đã đạt tối đa (${crs.sessionCount} buổi) của môn "${crs.name}". Không thể thêm buổi học mới!`);
    }

    if (!topic || !topic.trim()) {
      throw new Error('Vui lòng nhập chủ đề của buổi học.');
    }

    const nextNumber = crs.sessions.length + 1;
    const session = {
      id: generateId('ses'),
      sessionNumber: nextNumber,
      topic: topic.trim(),
      objective: objective ? objective.trim() : '',
    };

    crs.sessions.push(session);
    return session;
  }

  updateCourseSession(courseId, sessionId, { topic, objective }) {
    const crs = this.courses.find(c => c.id === courseId);
    if (!crs) throw new Error('Không tìm thấy môn học.');

    const session = crs.sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Không tìm thấy buổi học.');

    if (topic !== undefined && topic.trim()) session.topic = topic.trim();
    if (objective !== undefined) session.objective = objective.trim();

    return session;
  }

  deleteCourseSession(courseId, sessionId) {
    const crs = this.courses.find(c => c.id === courseId);
    if (!crs) throw new Error('Không tìm thấy môn học.');

    const idx = crs.sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) throw new Error('Không tìm thấy buổi học.');

    crs.sessions.splice(idx, 1);
    // Tự động đánh lại số thứ tự từ 1 đến N
    crs.sessions.forEach((s, i) => {
      s.sessionNumber = i + 1;
    });

    return { success: true, message: 'Đã xoá buổi học thành công.' };
  }

  // S2-07: Nhân bản được danh sách buổi từ một môn khác
  cloneCourseSessions(targetCourseId, sourceCourseId) {
    const target = this.courses.find(c => c.id === targetCourseId);
    const source = this.courses.find(c => c.id === sourceCourseId);

    if (!target) throw new Error('Không tìm thấy môn học đích.');
    if (!source) throw new Error('Không tìm thấy môn học nguồn để nhân bản.');
    if (targetCourseId === sourceCourseId) throw new Error('Không thể nhân bản từ chính môn học này.');

    if (!Array.isArray(source.sessions) || source.sessions.length === 0) {
      throw new Error(`Môn học nguồn "${source.name}" chưa có buổi học nào để nhân bản.`);
    }

    // Nhân bản danh sách, không vượt quá sessionCount của môn đích
    const sessionsToCopy = source.sessions.slice(0, target.sessionCount);
    target.sessions = sessionsToCopy.map((s, idx) => ({
      id: generateId('ses'),
      sessionNumber: idx + 1,
      topic: s.topic,
      objective: s.objective,
    }));

    return {
      clonedCount: target.sessions.length,
      maxAllowed: target.sessionCount,
      sessions: target.sessions,
    };
  }

  // =========================================================================
  // S2-08, S2-09, S2-10, S2-11: KHÁCH HÀNG TIỀM NĂNG & CRM TUYỂN SINH (LEADS)
  // =========================================================================
  checkDuplicateLeadPhone(phone, excludeId = null) {
    if (!phone) return null;
    const clean = phone.trim().replace(/[\s.-]/g, '');
    return this.admissions.find(lead => {
      if (excludeId && lead.id === excludeId) return false;
      const leadClean = lead.phone.replace(/[\s.-]/g, '');
      return leadClean === clean;
    });
  }

  // S2-08: Biểu mẫu công khai đăng ký tư vấn cho Khách truy cập (Public Consultation)
  // - Không yêu cầu đăng nhập
  // - Có chống spam (Honeypot + Math challenge captcha)
  // - Gửi thành công tạo lead ở trạng thái 'NEW'
  // - Hiển thị lời cảm ơn và cam kết thời gian liên hệ lại
  createPublicConsultation({ fullName, phone, email, programName, note, websiteTrap, captchaAnswer, expectedCaptcha }) {
    // 1. Chống spam: Honeypot check
    if (websiteTrap && websiteTrap.trim().length > 0) {
      throw new Error('Hệ thống phát hiện hoạt động spam tự động. Yêu cầu bị từ chối.');
    }

    // 2. Chống spam: Captcha check
    if (expectedCaptcha !== undefined && captchaAnswer !== undefined) {
      if (String(captchaAnswer).trim() !== String(expectedCaptcha).trim()) {
        throw new Error('Mã xác thực chống spam không chính xác. Vui lòng thử lại.');
      }
    }

    // 3. Kiểm tra thông tin bắt buộc
    if (!fullName || !fullName.trim()) throw new Error('Vui lòng nhập Họ và tên.');
    if (!phone || !phone.trim()) throw new Error('Vui lòng nhập Số điện thoại.');

    if (!isValidVNPhone(phone)) {
      throw new Error('Số điện thoại không đúng định dạng Việt Nam (10 chữ số, ví dụ 0912345678).');
    }

    if (email && email.trim() && !isValidEmail(email)) {
      throw new Error('Địa chỉ email không đúng định dạng.');
    }

    // 4. Tạo lead mới ở trạng thái 'NEW'
    const lead = {
      id: generateId('adm'),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      source: 'Website (Công khai)',
      programName: programName ? programName.trim() : 'Chương trình đào tạo tổng quát',
      score: 0,
      status: 'NEW',
      consultantId: null,
      consultantName: 'Chưa phân công',
      note: note ? note.trim() : 'Khách hàng để lại thông tin tư vấn qua biểu mẫu công khai trên Website.',
      assignmentHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.admissions.unshift(lead);

    return {
      success: true,
      lead,
      message: `Cảm ơn bạn ${lead.fullName}! Ban Tuyển sinh TMS đã tiếp nhận thông tin đăng ký tư vấn thành công.`,
      commitment: 'Chuyên viên tư vấn tuyển sinh cam kết sẽ liên hệ lại với bạn trong vòng 30 phút (từ 08:00 - 18:00) hoặc trước 09:00 sáng ngày làm việc tiếp theo.',
    };
  }

  // S2-09: Tạo Lead nội bộ
  // - Cảnh báo khi số điện thoại trùng với lead đã có
  createLead({ fullName, phone, email, source, programName, note, consultantId, actorId, actorName }) {
    if (!fullName || !phone) throw new Error('Vui lòng nhập họ tên và số điện thoại khách hàng.');

    if (!isValidVNPhone(phone)) {
      throw new Error('Số điện thoại không đúng định dạng Việt Nam (10 chữ số, ví dụ 0912345678).');
    }

    // Cảnh báo trùng số điện thoại
    const duplicate = this.checkDuplicateLeadPhone(phone);
    const duplicateWarning = duplicate
      ? `Cảnh báo: Số điện thoại này đã tồn tại trong danh sách Lead (thuộc về khách hàng "${duplicate.fullName}" - Trạng thái: ${duplicate.status})!`
      : null;

    let consultant = null;
    if (consultantId) {
      consultant = this.findUserById(consultantId);
    }

    const lead = {
      id: generateId('adm'),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      source: source || 'Trực tiếp / Hotline',
      programName: programName || 'Kỹ nghệ Phần mềm Chuẩn Quốc tế',
      score: 0,
      status: consultant ? 'CONTACTED' : 'NEW',
      consultantId: consultant ? consultant.id : null,
      consultantName: consultant ? consultant.fullName : 'Chưa phân công',
      note: note ? note.trim() : '',
      assignmentHistory: consultant ? [
        {
          id: generateId('his'),
          assignedById: actorId || 'SYSTEM',
          assignedByName: actorName || 'Hệ thống',
          consultantId: consultant.id,
          consultantName: consultant.fullName,
          assignedAt: new Date().toISOString(),
          note: 'Phân công ngay khi tạo mới lead',
        }
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.admissions.unshift(lead);

    return {
      lead,
      duplicateWarning,
    };
  }

  // S2-09: Sửa Lead
  updateLead(leadId, { fullName, phone, email, source, programName, note, status }, actorId, actorName) {
    const lead = this.admissions.find(l => l.id === leadId);
    if (!lead) throw new Error('Không tìm thấy khách hàng tiềm năng.');

    let duplicateWarning = null;
    if (phone && phone.trim()) {
      if (!isValidVNPhone(phone)) {
        throw new Error('Số điện thoại không đúng định dạng Việt Nam (10 chữ số).');
      }
      const duplicate = this.checkDuplicateLeadPhone(phone, leadId);
      if (duplicate) {
        duplicateWarning = `Cảnh báo: Số điện thoại này trùng với lead "${duplicate.fullName}" đã có!`;
      }
      lead.phone = phone.trim();
    }

    if (fullName !== undefined) lead.fullName = fullName.trim();
    if (email !== undefined) lead.email = email.trim().toLowerCase();
    if (source !== undefined) lead.source = source.trim();
    if (programName !== undefined) lead.programName = programName.trim();
    if (note !== undefined) lead.note = note.trim();
    if (status !== undefined) lead.status = status;
    lead.updatedAt = new Date().toISOString();

    return { lead, duplicateWarning };
  }

  // S2-09: Xóa lead
  // - Ràng buộc quyền: Chỉ Quản lý đào tạo (TRAINING_MANAGER) và Quản trị viên (ADMIN) được xoá lead
  deleteLead(leadId, userRoles) {
    if (!userRoles.includes(ROLES.TRAINING_MANAGER) && !userRoles.includes(ROLES.ADMIN)) {
      throw new Error('Chỉ Quản lý đào tạo (TRAINING_MANAGER) và Quản trị hệ thống mới được xoá khách hàng tiềm năng.');
    }

    const idx = this.admissions.findIndex(l => l.id === leadId);
    if (idx === -1) throw new Error('Không tìm thấy khách hàng tiềm năng.');

    const deleted = this.admissions.splice(idx, 1)[0];
    return { success: true, message: `Đã xoá khách hàng "${deleted.fullName}" thành công.` };
  }

  // S2-10: Phân công lead cho tư vấn viên
  // - Phân công một hoặc nhiều lead cùng lúc (bulk assign)
  // - Có ghi lịch sử chuyển giao
  bulkAssignLeads({ leadIds, consultantId, note, actorId, actorName }) {
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một khách hàng tiềm năng để phân công.');
    }

    const consultant = this.findUserById(consultantId);
    if (!consultant) throw new Error('Không tìm thấy tư vấn viên được chỉ định.');

    const assignedLeads = [];
    const now = new Date().toISOString();

    leadIds.forEach(id => {
      const lead = this.admissions.find(l => l.id === id);
      if (lead) {
        lead.consultantId = consultant.id;
        lead.consultantName = consultant.fullName;
        if (lead.status === 'NEW') {
          lead.status = 'CONTACTED';
        }
        lead.updatedAt = now;

        if (!Array.isArray(lead.assignmentHistory)) lead.assignmentHistory = [];

        lead.assignmentHistory.unshift({
          id: generateId('his'),
          assignedById: actorId || 'SYSTEM',
          assignedByName: actorName || 'Quản lý đào tạo',
          consultantId: consultant.id,
          consultantName: consultant.fullName,
          assignedAt: now,
          note: note ? note.trim() : 'Phân công tư vấn viên phụ trách chăm sóc khách hàng.',
        });

        assignedLeads.push(lead);
      }
    });

    return {
      success: true,
      message: `Đã phân công thành công ${assignedLeads.length} lead cho tư vấn viên "${consultant.fullName}".`,
      assignedCount: assignedLeads.length,
      assignedLeads,
    };
  }

  // S2-11: Tìm kiếm và lọc lead theo nhiều điều kiện
  // - Lọc theo trạng thái, nguồn, người phụ trách, khoảng thời gian
  // - Tìm nhanh theo tên hoặc số điện thoại
  // - Tư vấn viên (CONSULTANT) chỉ nhìn thấy lead được giao cho mình (S2-10)
  getLeads({ user, search, status, source, consultantId, fromDate, toDate }) {
    let list = [...this.admissions];

    // Ràng buộc S2-10: Tư vấn viên chỉ nhìn thấy lead được giao cho mình
    const isConsultantOnly = user &&
      user.roles.includes(ROLES.CONSULTANT) &&
      !user.roles.includes(ROLES.ADMIN) &&
      !user.roles.includes(ROLES.TRAINING_MANAGER);

    if (isConsultantOnly) {
      list = list.filter(l => l.consultantId === user.id || l.consultantName === user.fullName);
    }

    // 1. Tìm nhanh theo tên hoặc số điện thoại (S2-11)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(l =>
        l.fullName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q))
      );
    }

    // 2. Lọc theo trạng thái
    if (status && status.trim() && status !== 'ALL') {
      list = list.filter(l => l.status === status.trim());
    }

    // 3. Lọc theo nguồn
    if (source && source.trim() && source !== 'ALL') {
      list = list.filter(l => l.source === source.trim());
    }

    // 4. Lọc theo người phụ trách
    if (consultantId && consultantId.trim() && consultantId !== 'ALL') {
      if (consultantId === 'UNASSIGNED') {
        list = list.filter(l => !l.consultantId);
      } else {
        list = list.filter(l => l.consultantId === consultantId);
      }
    }

    // 5. Lọc theo khoảng thời gian
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      list = list.filter(l => new Date(l.createdAt).getTime() >= from);
    }

    if (toDate) {
      // Đặt đến cuối ngày toDate (23:59:59)
      const to = new Date(toDate).setHours(23, 59, 59, 999);
      list = list.filter(l => new Date(l.createdAt).getTime() <= to);
    }

    return list;
  }

  // =========================================================================
  // S3-01, S3-02, S3-03: CRM PHỄU TUYỂN SINH, NHẬT KÝ CHĂM SÓC & CHUYỂN ĐỔI HỌC VIÊN
  // =========================================================================

  // S3-01: Cập nhật trạng thái trên bảng phễu
  // - Các cột: Mới (NEW) -> Đã liên hệ (CONTACTED) -> Đang tư vấn (CONSULTING) -> Hẹn học thử (TRIAL_SCHEDULED) -> Chốt (CLOSED_WON) -> Từ chối (CLOSED_LOST) -> Đã nhập học (ENROLLED)
  // - Mỗi lần đổi được ghi nhật ký (statusHistory)
  // - Chuyển sang Từ chối (CLOSED_LOST) BẮT BUỘC chọn lý do (lossReason)
  // - Nếu lead đã ở trạng thái ENROLLED (isLocked = true), không được sửa
  updateLeadFunnelStatus(leadId, { status, lossReason, note, actorId, actorName }) {
    const lead = this.admissions.find(l => l.id === leadId);
    if (!lead) throw new Error('Không tìm thấy khách hàng tiềm năng.');

    if (lead.isLocked || lead.status === 'ENROLLED') {
      throw new Error('Khách hàng này đã hoàn tất nhập học chính thức và hồ sơ đã bị khoá.');
    }

    const validStatuses = ['NEW', 'CONTACTED', 'CONSULTING', 'TRIAL_SCHEDULED', 'CLOSED_WON', 'CLOSED_LOST', 'ENROLLED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Trạng thái "${status}" không hợp lệ.`);
    }

    // Ràng buộc S3-01: Chuyển sang Từ chối (CLOSED_LOST) BẮT BUỘC chọn lý do
    if (status === 'CLOSED_LOST') {
      if (!lossReason || !lossReason.trim()) {
        throw new Error('Chuyển sang trạng thái Từ chối bắt buộc phải chọn lý do từ chối.');
      }
    }

    const fromStatus = lead.status;
    lead.status = status;
    lead.lossReason = status === 'CLOSED_LOST' ? lossReason.trim() : null;
    lead.updatedAt = new Date().toISOString();

    if (!Array.isArray(lead.statusHistory)) lead.statusHistory = [];
    lead.statusHistory.unshift({
      id: generateId('sth'),
      fromStatus,
      toStatus: status,
      reason: lead.lossReason,
      note: note ? note.trim() : `Chuyển trạng thái từ ${fromStatus} sang ${status}`,
      changedAt: lead.updatedAt,
      changedById: actorId || 'SYSTEM',
      changedByName: actorName || 'Tư vấn viên',
    });

    return lead;
  }

  // S3-02: Ghi nhật ký chăm sóc và đặt lịch nhắc gọi lại
  // - Mỗi lần tương tác ghi loại (CALL, MESSAGE, MEETING), nội dung, thời điểm
  // - Đặt được ngày nhắc gọi lại
  addLeadCareLog(leadId, { type, content, remindAt, actorId, actorName }) {
    const lead = this.admissions.find(l => l.id === leadId);
    if (!lead) throw new Error('Không tìm thấy khách hàng tiềm năng.');

    if (!type || !['CALL', 'MESSAGE', 'MEETING'].includes(type)) {
      throw new Error('Loại tương tác không hợp lệ. Chọn Gọi điện (CALL), Nhắn tin (MESSAGE) hoặc Gặp trực tiếp (MEETING).');
    }

    if (!content || !content.trim()) {
      throw new Error('Vui lòng nhập nội dung chăm sóc/tương tác.');
    }

    if (!Array.isArray(lead.careLogs)) lead.careLogs = [];
    const log = {
      id: generateId('care'),
      type,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      createdById: actorId || 'SYSTEM',
      createdByName: actorName || 'Tư vấn viên',
      remindAt: remindAt ? new Date(remindAt).toISOString() : null,
    };
    lead.careLogs.unshift(log);

    if (remindAt) {
      lead.remindAt = new Date(remindAt).toISOString();
    }
    lead.updatedAt = new Date().toISOString();

    return { lead, log };
  }

  // S3-03: Chuyển lead đã chốt thành hồ sơ học viên
  // - Dữ liệu lead được chuyển sang hồ sơ học viên, không phải nhập lại
  // - Hệ thống sinh mã học viên tự động (HV2026-XXX)
  // - Tài khoản đăng nhập cho học viên được tạo và gửi email
  // - Lead chuyển sang trạng thái Đã nhập học (ENROLLED) và không sửa được nữa (isLocked = true)
  convertLeadToStudent(leadId, { entryLevel = 'THPT', note = '', actorId, actorName }) {
    const lead = this.admissions.find(l => l.id === leadId);
    if (!lead) throw new Error('Không tìm thấy khách hàng tiềm năng.');

    if (lead.isLocked || lead.status === 'ENROLLED') {
      throw new Error('Khách hàng này đã được chuyển thành học viên trước đó.');
    }

    // 1. Tự động sinh mã học viên: HV2026-XXX
    const nextSeq = this.students.length + 1;
    const studentCode = `HV2026-${String(nextSeq).padStart(3, '0')}`;

    // 2. Tạo tài khoản người dùng đăng nhập cho học viên (hoặc tìm tài khoản nếu đã có email)
    let studentUser = this.findUserByEmail(lead.email);
    const tempPassword = `Student@${Math.floor(100000 + Math.random() * 900000)}`;

    if (!studentUser) {
      studentUser = this.createUser({
        fullName: lead.fullName,
        email: lead.email || `hocvien.${studentCode.toLowerCase()}@tms.edu.vn`,
        phone: lead.phone,
        roles: [ROLES.STUDENT],
        password: tempPassword,
        address: 'Học viên mới nhập học',
      });
    } else {
      if (!studentUser.roles.includes(ROLES.STUDENT)) {
        studentUser.roles.push(ROLES.STUDENT);
      }
    }

    // 3. Tạo hồ sơ học viên (StudentProfile - S3-04)
    const newStudent = {
      id: generateId('stu'),
      studentCode,
      userId: studentUser.id,
      fullName: lead.fullName,
      phone: lead.phone,
      email: studentUser.email,
      dob: '2004-01-01',
      address: studentUser.address || '',
      entryLevel: entryLevel || 'THPT',
      note: note ? note.trim() : (lead.note || 'Chuyển đổi từ hồ sơ tư vấn tuyển sinh.'),
      programName: lead.programName,
      enrolledClasses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.students.unshift(newStudent);

    // 4. Cập nhật Lead: chuyển trạng thái ENROLLED, khoá sửa (isLocked = true)
    const prevStatus = lead.status;
    lead.status = 'ENROLLED';
    lead.isLocked = true;
    lead.studentId = newStudent.id;
    lead.studentCode = studentCode;
    lead.updatedAt = new Date().toISOString();

    if (!Array.isArray(lead.statusHistory)) lead.statusHistory = [];
    lead.statusHistory.unshift({
      id: generateId('sth'),
      fromStatus: prevStatus,
      toStatus: 'ENROLLED',
      reason: 'Chuyển đổi thành công sang Hồ sơ học viên chính thức',
      note: `Sinh mã học viên ${studentCode}, tạo tài khoản người dùng ${studentUser.email}`,
      changedAt: lead.updatedAt,
      changedById: actorId || 'SYSTEM',
      changedByName: actorName || 'Hệ thống tuyển sinh',
    });

    this.logAudit({
      actorId,
      action: 'LEAD_CONVERTED_TO_STUDENT',
      targetId: newStudent.id,
      details: `Chuyển đổi lead "${lead.fullName}" thành học viên ${studentCode} (${studentUser.email})`,
    });

    return {
      success: true,
      message: `Đã chuyển đổi thành công khách hàng "${lead.fullName}" thành Học viên chính thức (Mã: ${studentCode})!`,
      student: newStudent,
      account: {
        email: studentUser.email,
        tempPassword,
        emailSent: true,
      },
      lead,
    };
  }

  // =========================================================================
  // S3-04: QUẢN LÝ HỒ SƠ HỌC VIÊN (STUDENT PROFILES)
  // =========================================================================
  getStudents({ search, classId, entryLevel } = {}) {
    let list = [...this.students];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        s.studentCode.toLowerCase().includes(q) ||
        s.fullName.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    }

    if (entryLevel && entryLevel !== 'ALL') {
      list = list.filter(s => s.entryLevel === entryLevel);
    }

    if (classId && classId !== 'ALL') {
      list = list.filter(s => Array.isArray(s.enrolledClasses) && s.enrolledClasses.some(c => c.classId === classId));
    }

    return list;
  }

  getStudentById(id) {
    const student = this.students.find(s => s.id === id || s.studentCode === id);
    if (!student) throw new Error('Không tìm thấy hồ sơ học viên.');

    const currentClasses = (student.enrolledClasses || []).filter(c => c.status === 'ACTIVE' || c.status === 'PLANNING');
    const pastClasses = (student.enrolledClasses || []).filter(c => c.status === 'FINISHED' || c.status === 'CANCELLED');

    return {
      ...student,
      currentClasses,
      pastClasses,
    };
  }

  updateStudent(id, { fullName, phone, email, dob, address, entryLevel, note }) {
    const student = this.students.find(s => s.id === id);
    if (!student) throw new Error('Không tìm thấy hồ sơ học viên.');

    if (fullName !== undefined && fullName.trim()) student.fullName = fullName.trim();
    if (phone !== undefined && phone.trim()) {
      if (!isValidVNPhone(phone)) {
        throw new Error('Số điện thoại không đúng định dạng Việt Nam.');
      }
      student.phone = phone.trim();
    }
    if (email !== undefined && email.trim()) {
      if (!isValidEmail(email)) {
        throw new Error('Địa chỉ email không đúng định dạng.');
      }
      student.email = email.trim().toLowerCase();
    }
    if (dob !== undefined) student.dob = dob;
    if (address !== undefined) student.address = address.trim();
    if (entryLevel !== undefined) student.entryLevel = entryLevel;
    if (note !== undefined) student.note = note.trim();
    student.updatedAt = new Date().toISOString();

    const u = this.findUserById(student.userId);
    if (u) {
      if (fullName) u.fullName = student.fullName;
      if (phone) u.phone = student.phone;
      if (dob) u.dob = student.dob;
      if (address) u.address = student.address;
    }

    return student;
  }

  // =========================================================================
  // S3-09: QUẢN LÝ PHÒNG HỌC & LIÊN KẾT PHÒNG HỌC TRỰC TUYẾN
  // =========================================================================
  getRooms() {
    return this.rooms.map(room => {
      const usingClasses = this.classes.filter(c => c.roomId === room.id && c.status === 'ACTIVE');
      return {
        ...room,
        activeClassCount: usingClasses.length,
        usingClasses: usingClasses.map(c => ({ id: c.id, code: c.code, name: c.name })),
      };
    });
  }

  createRoom({ code, name, type = 'PHYSICAL', capacity = 30, building = '', equipment = '', onlineMeetingUrl = '', passcode = '' }) {
    if (!code || !name) throw new Error('Vui lòng điền mã phòng và tên phòng học.');
    const existing = this.rooms.find(r => r.code.toLowerCase() === code.trim().toLowerCase());
    if (existing) throw new Error(`Mã phòng học "${code}" đã tồn tại.`);

    const room = {
      id: generateId('room'),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type: type === 'ONLINE' ? 'ONLINE' : 'PHYSICAL',
      capacity: Number(capacity) || 30,
      building: building ? building.trim() : (type === 'ONLINE' ? 'Hạ tầng Trực tuyến' : 'Tòa nhà chính'),
      equipment: equipment ? equipment.trim() : '',
      onlineMeetingUrl: onlineMeetingUrl ? onlineMeetingUrl.trim() : '',
      passcode: passcode ? passcode.trim() : '',
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };
    this.rooms.push(room);
    return room;
  }

  updateRoom(id, { name, type, capacity, building, equipment, onlineMeetingUrl, passcode, status }) {
    const room = this.rooms.find(r => r.id === id);
    if (!room) throw new Error('Không tìm thấy phòng học.');

    if (name !== undefined && name.trim()) room.name = name.trim();
    if (type !== undefined) room.type = type;
    if (capacity !== undefined) room.capacity = Number(capacity) || 30;
    if (building !== undefined) room.building = building.trim();
    if (equipment !== undefined) room.equipment = equipment.trim();
    if (onlineMeetingUrl !== undefined) room.onlineMeetingUrl = onlineMeetingUrl.trim();
    if (passcode !== undefined) room.passcode = passcode.trim();
    if (status !== undefined) room.status = status;

    return room;
  }

  deleteRoom(id) {
    const idx = this.rooms.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Không tìm thấy phòng học.');

    const activeClasses = this.classes.filter(c => c.roomId === id && c.status === 'ACTIVE');
    if (activeClasses.length > 0) {
      throw new Error(`Phòng học này đang được sử dụng bởi ${activeClasses.length} lớp học đang chạy (${activeClasses.map(c => c.name).join(', ')}). Không thể xoá!`);
    }

    this.rooms.splice(idx, 1);
    return { success: true, message: 'Đã xoá phòng học thành công.' };
  }

  // =========================================================================
  // S3-05, S3-06, S3-07, S3-08: MỞ LỚP, GHI DANH, CHỈ SỐ NHANH & PHÂN CÔNG GIẢNG VIÊN
  // =========================================================================

  // S3-05: Mở lớp học mới từ chương trình đào tạo
  createClassFromProgram({ code, name, programId, startDate, endDate, maxCapacity = 35, mode = 'OFFLINE', roomId, actorId, actorName }) {
    if (!code || !name) throw new Error('Vui lòng điền mã lớp và tên lớp học.');
    if (!programId) throw new Error('Vui lòng chọn chương trình đào tạo để mở lớp.');

    const existing = this.classes.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
    if (existing) throw new Error(`Mã lớp học "${code}" đã tồn tại.`);

    const program = this.programs.find(p => p.id === programId);
    if (!program) throw new Error('Chương trình đào tạo không tồn tại.');

    let roomObj = null;
    let capacityWarning = null;
    const capacityNum = Number(maxCapacity) || 35;

    if (roomId) {
      roomObj = this.rooms.find(r => r.id === roomId);
      if (roomObj && roomObj.capacity < capacityNum) {
        // Cảnh báo S3-09: Sĩ số lớp vượt sức chứa phòng
        capacityWarning = `Cảnh báo S3-09: Sĩ số tối đa của lớp (${capacityNum} học viên) vượt quá sức chứa phòng "${roomObj.name}" (${roomObj.capacity} chỗ ngồi)!`;
      }
    }

    // S3-05: Sao chép danh sách môn học từ chương trình khi mở lớp
    const copiedCourses = (program.courses || []).map((pc, idx) => {
      const crs = this.courses.find(c => c.id === pc.courseId);
      return {
        courseId: pc.courseId,
        courseCode: crs ? crs.code : `CRS-${idx + 1}`,
        courseName: crs ? crs.name : 'Môn học',
        credits: crs ? crs.credits : 3,
        sessionCount: crs ? (crs.sessionCount || 15) : 15,
        orderIndex: pc.orderIndex || idx + 1,
        teacherId: null,
        teacherName: 'Chưa phân công',
        assistantIds: [],
        assistantNames: [],
        status: idx === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completedSessions: 0,
      };
    });

    const newClass = {
      id: generateId('cls'),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      programId: program.id,
      programName: program.name,
      courseId: copiedCourses[0]?.courseId || '',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      maxCapacity: capacityNum,
      maxStudents: capacityNum,
      currentStudents: 0,
      currentCount: 0,
      studentIds: [],
      enrollmentHistory: [],
      mode: ['OFFLINE', 'ONLINE', 'HYBRID'].includes(mode) ? mode : 'OFFLINE',
      status: 'PLANNING', // S3-05 Vòng đời bắt đầu từ 'PLANNING' (Chuẩn bị)
      roomId: roomObj ? roomObj.id : null,
      room: roomObj ? roomObj.name : 'Chưa phân phòng',
      capacityWarning,
      courses: copiedCourses,
      teacherId: null,
      teacherName: 'Chưa phân công',
      assistantId: null,
      assistantName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.classes.unshift(newClass);

    this.logAudit({
      actorId,
      action: 'CLASS_CREATED_FROM_PROGRAM',
      targetId: newClass.id,
      details: `Mở lớp "${newClass.code}" từ chương trình "${program.name}", sao chép ${copiedCourses.length} môn học. Sĩ số: ${capacityNum}.`,
    });

    return {
      classItem: newClass,
      capacityWarning,
    };
  }

  // S3-05: Cập nhật vòng đời lớp học: PLANNING -> ACTIVE -> FINISHED -> CANCELLED
  updateClassLifecycle(classId, { status, actorId, actorName }) {
    const cls = this.classes.find(c => c.id === classId);
    if (!cls) throw new Error('Không tìm thấy lớp học.');

    const valid = ['PLANNING', 'ACTIVE', 'FINISHED', 'CANCELLED'];
    if (!valid.includes(status)) {
      throw new Error(`Trạng thái vòng đời "${status}" không hợp lệ. Chọn Chuẩn bị (PLANNING), Đang học (ACTIVE), Kết thúc (FINISHED), Huỷ (CANCELLED).`);
    }

    const oldStatus = cls.status;
    cls.status = status;
    cls.updatedAt = new Date().toISOString();

    this.students.forEach(stu => {
      const enrolled = (stu.enrolledClasses || []).find(c => c.classId === classId);
      if (enrolled) {
        enrolled.status = status;
      }
    });

    this.logAudit({
      actorId,
      action: 'CLASS_LIFECYCLE_CHANGED',
      targetId: cls.id,
      details: `Chuyển trạng thái lớp "${cls.code}" từ ${oldStatus} sang ${status}`,
    });

    return cls;
  }

  // S3-06: Ghi danh học viên vào lớp, đơn lẻ hoặc hàng loạt
  enrollStudentsToClass(classId, { studentIds, actorId, actorName }) {
    const cls = this.classes.find(c => c.id === classId);
    if (!cls) throw new Error('Không tìm thấy lớp học.');

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một học viên để ghi danh.');
    }

    if (!Array.isArray(cls.studentIds)) cls.studentIds = [];
    if (!Array.isArray(cls.enrollmentHistory)) cls.enrollmentHistory = [];

    const maxCap = cls.maxCapacity || cls.maxStudents || 40;
    const currentTotal = cls.studentIds.length;

    // 1. Chặn ghi danh khi lớp đã đủ sĩ số
    if (currentTotal + studentIds.length > maxCap) {
      throw new Error(`Không thể ghi danh: Sĩ số lớp hiện tại (${currentTotal}) cộng thêm ${studentIds.length} học viên sẽ vượt quá sĩ số tối đa (${maxCap} học viên)!`);
    }

    // 2. Chặn ghi danh nếu học viên đã ở trong lớp
    const alreadyInClass = [];
    const validStudents = [];

    studentIds.forEach(sid => {
      const stu = this.students.find(s => s.id === sid);
      if (!stu) return;

      if (cls.studentIds.includes(sid)) {
        alreadyInClass.push(stu.fullName);
      } else {
        validStudents.push(stu);
      }
    });

    if (alreadyInClass.length > 0) {
      throw new Error(`Học viên sau đã có trong lớp này rồi: ${alreadyInClass.join(', ')}.`);
    }

    // 3. Thực hiện ghi danh
    const now = new Date().toISOString();
    validStudents.forEach(stu => {
      cls.studentIds.push(stu.id);

      cls.enrollmentHistory.push({
        id: generateId('enh'),
        studentId: stu.id,
        studentCode: stu.studentCode,
        studentName: stu.fullName,
        enrolledAt: now,
        enrolledBy: actorName || 'Quản lý đào tạo',
      });

      if (!Array.isArray(stu.enrolledClasses)) stu.enrolledClasses = [];
      stu.enrolledClasses.push({
        classId: cls.id,
        classCode: cls.code,
        className: cls.name,
        programName: cls.programName || '',
        status: cls.status,
        enrolledAt: now,
        enrolledBy: actorName || 'Quản lý đào tạo',
      });
    });

    cls.currentStudents = cls.studentIds.length;
    cls.currentCount = cls.studentIds.length;
    cls.updatedAt = now;

    this.logAudit({
      actorId,
      action: 'STUDENTS_ENROLLED_TO_CLASS',
      targetId: cls.id,
      details: `Ghi danh ${validStudents.length} học viên vào lớp ${cls.code}. Sĩ số hiện tại: ${cls.currentStudents}/${maxCap}.`,
    });

    return {
      success: true,
      message: `Đã ghi danh thành công ${validStudents.length} học viên vào lớp "${cls.name}"!`,
      enrolledCount: validStudents.length,
      currentStudents: cls.currentStudents,
      maxCapacity: maxCap,
    };
  }

  // Rút học viên khỏi lớp
  removeStudentFromClass(classId, studentId, actorId, actorName) {
    const cls = this.classes.find(c => c.id === classId);
    if (!cls) throw new Error('Không tìm thấy lớp học.');

    if (Array.isArray(cls.studentIds)) {
      cls.studentIds = cls.studentIds.filter(id => id !== studentId);
      cls.currentStudents = cls.studentIds.length;
      cls.currentCount = cls.studentIds.length;
    }

    const stu = this.students.find(s => s.id === studentId);
    if (stu && Array.isArray(stu.enrolledClasses)) {
      stu.enrolledClasses = stu.enrolledClasses.filter(c => c.classId !== classId);
    }

    return { success: true, message: 'Đã rút học viên khỏi lớp học thành công.' };
  }

  // S3-08: Phân công giảng viên và trợ giảng cho lớp theo từng môn
  assignCourseInstructors(classId, courseId, { teacherId, assistantIds = [], actorId, actorName }) {
    const cls = this.classes.find(c => c.id === classId);
    if (!cls) throw new Error('Không tìm thấy lớp học.');

    if (!Array.isArray(cls.courses)) {
      cls.courses = [];
    }

    const courseEntry = cls.courses.find(c => c.courseId === courseId);
    if (!courseEntry) {
      throw new Error('Môn học không nằm trong chương trình của lớp này.');
    }

    // 1. Kiểm tra Giảng viên chính: bắt buộc có role TEACHER
    let teacher = null;
    if (teacherId) {
      teacher = this.findUserById(teacherId);
      if (!teacher) throw new Error('Không tìm thấy giảng viên.');
      if (!teacher.roles.includes(ROLES.TEACHER)) {
        throw new Error(`Người dùng "${teacher.fullName}" không có vai trò Giảng viên (TEACHER).`);
      }
    }

    // 2. Kiểm tra danh sách trợ giảng: phải có role ASSISTANT hoặc TEACHER
    const validAssistants = [];
    if (Array.isArray(assistantIds)) {
      assistantIds.forEach(aid => {
        const ast = this.findUserById(aid);
        if (ast && (ast.roles.includes(ROLES.ASSISTANT) || ast.roles.includes(ROLES.TEACHER))) {
          validAssistants.push(ast);
        }
      });
    }

    // 3. Cập nhật phân công môn học
    courseEntry.teacherId = teacher ? teacher.id : null;
    courseEntry.teacherName = teacher ? teacher.fullName : 'Chưa phân công';
    courseEntry.assistantIds = validAssistants.map(a => a.id);
    courseEntry.assistantNames = validAssistants.map(a => a.fullName);

    // Cập nhật lên cấp độ lớp học nếu là môn chính
    if (cls.courseId === courseId || !cls.teacherId) {
      cls.teacherId = courseEntry.teacherId;
      cls.teacherName = courseEntry.teacherName;
      cls.assistantId = validAssistants[0]?.id || null;
      cls.assistantName = validAssistants[0]?.fullName || null;
    }

    cls.updatedAt = new Date().toISOString();

    this.logAudit({
      actorId,
      action: 'COURSE_INSTRUCTORS_ASSIGNED',
      targetId: cls.id,
      details: `Phân công môn "${courseEntry.courseName}" (Lớp ${cls.code}): GV: ${courseEntry.teacherName}, Trợ giảng: ${courseEntry.assistantNames.join(', ') || 'Không có'}.`,
    });

    return {
      success: true,
      message: `Đã phân công giảng viên và trợ giảng cho môn "${courseEntry.courseName}" thành công!`,
      course: courseEntry,
      classItem: cls,
    };
  }

  // Danh sách giảng viên và trợ giảng để phân công (S3-08)
  getInstructors() {
    const teachers = this.users.filter(u => u.roles.includes(ROLES.TEACHER)).map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles,
    }));
    const assistants = this.users.filter(u => u.roles.includes(ROLES.ASSISTANT) || u.roles.includes(ROLES.TEACHER)).map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles,
    }));
    return { teachers, assistants };
  }

  // S3-07: Xem danh sách lớp kèm bộ lọc và chỉ số nhanh
  getClasses({ status, programId, teacherId, fromDate, toDate, user } = {}) {
    let list = [...this.classes];

    // S3-08: Giảng viên hoặc trợ giảng chỉ thấy lớp được phân công
    if (user && (user.roles.includes(ROLES.TEACHER) || user.roles.includes(ROLES.ASSISTANT)) &&
        !user.roles.includes(ROLES.ADMIN) && !user.roles.includes(ROLES.TRAINING_MANAGER)) {
      list = list.filter(c =>
        c.teacherId === user.id ||
        c.assistantId === user.id ||
        (Array.isArray(c.courses) && c.courses.some(crs => crs.teacherId === user.id || crs.assistantIds?.includes(user.id)))
      );
    }

    if (status && status !== 'ALL') {
      list = list.filter(c => c.status === status);
    }

    if (programId && programId !== 'ALL') {
      list = list.filter(c => c.programId === programId);
    }

    if (teacherId && teacherId !== 'ALL') {
      list = list.filter(c =>
        c.teacherId === teacherId ||
        (Array.isArray(c.courses) && c.courses.some(crs => crs.teacherId === teacherId))
      );
    }

    if (fromDate) {
      const from = new Date(fromDate).getTime();
      list = list.filter(c => new Date(c.startDate).getTime() >= from);
    }

    if (toDate) {
      const to = new Date(toDate).setHours(23, 59, 59, 999);
      list = list.filter(c => new Date(c.startDate).getTime() <= to);
    }

    // Enrich thông tin chỉ số nhanh
    return list.map(c => {
      const maxCap = c.maxCapacity || c.maxStudents || 40;
      const curCount = Array.isArray(c.studentIds) ? c.studentIds.length : (c.currentStudents || 0);

      // Tính tiến độ số buổi
      let totalSessions = 0;
      let completedSessions = 0;

      if (Array.isArray(c.courses) && c.courses.length > 0) {
        c.courses.forEach(crs => {
          totalSessions += (crs.sessionCount || 15);
          completedSessions += (crs.completedSessions || 0);
        });
      } else {
        totalSessions = 45;
        completedSessions = c.status === 'ACTIVE' ? 15 : c.status === 'FINISHED' ? 45 : 0;
      }

      return {
        ...c,
        maxCapacity: maxCap,
        currentCount: curCount,
        currentStudents: curCount,
        totalSessions,
        completedSessions,
        sessionProgressPercent: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      };
    });
  }

  // =========================================================================
  // THỜI KHÓA BIỂU & ĐIỂM DANH (S4-01 -> S4-08)
  // =========================================================================
  checkScheduleConflict({ date, shift, room, teacherId, excludeId = null }) {
    for (const s of this.schedules) {
      if (excludeId && s.id === excludeId) continue;
      if (s.date === date && s.shift === shift) {
        if (s.room.trim().toLowerCase() === room.trim().toLowerCase()) {
          return {
            conflict: true,
            type: 'ROOM_CONFLICT',
            message: `Trùng phòng học: "${room}" đã có lớp "${s.className}" học vào ${s.shift} ngày ${date}!`,
            conflictWith: s,
          };
        }
        if (teacherId && s.teacherId === teacherId) {
          return {
            conflict: true,
            type: 'TEACHER_CONFLICT',
            message: `Trùng giảng viên: Giảng viên đã có lịch dạy lớp "${s.className}" vào ${s.shift} ngày ${date}!`,
            conflictWith: s,
          };
        }
      }
    }
    return { conflict: false };
  }

  markAttendance(scheduleId, attendanceRecords) {
    const session = this.schedules.find(s => s.id === scheduleId);
    if (!session) throw new Error('Không tìm thấy buổi học.');

    session.attendanceMarked = true;
    session.attendanceRecords = attendanceRecords;

    let present = 0, late = 0, excused = 0, unexcused = 0;
    Object.values(attendanceRecords).forEach(st => {
      if (st === 'PRESENT') present++;
      else if (st === 'LATE') late++;
      else if (st === 'EXCUSED') excused++;
      else unexcused++;
    });

    session.attendanceStats = { present, late, excused, unexcused };
    return session;
  }

  // =========================================================================
  // BÀI TẬP, NỘP BÀI & CHẤM ĐIỂM (S5-05 -> S6-04)
  // =========================================================================
  createAssignment({
    classId,
    title,
    description,
    deadline,
    maxScore = 10,
    rubric = [],
    teacherId,
    type = 'HOMEWORK',
    durationMinutes,
    accessCode,
    isLocked,
    questionType = 'HYBRID',
    questions = [],
  }) {
    const cls = this.classes.find(c => c.id === classId);
    const teacher = this.findUserById(teacherId);

    const isFinalExam = type === 'FINAL_EXAM';
    const isQuiz15m = type === 'QUIZ_15M';

    // Sinh mã kích hoạt ngẫu nhiên nếu là bài thi kết thúc môn mà chưa nhập mã
    const finalAccessCode = accessCode
      ? accessCode.trim().toUpperCase()
      : isFinalExam
      ? `EXAM-${Math.floor(1000 + Math.random() * 9000)}`
      : isQuiz15m
      ? 'QUIZ-15M'
      : '';

    const finalDuration = isQuiz15m
      ? 15
      : Number(durationMinutes) || (isFinalExam ? 60 : 30);

    const assignment = {
      id: generateId('asm'),
      classId: classId || 'cls_k15_web01',
      className: cls ? cls.name || cls.code : 'Lớp học',
      courseCode: cls ? cls.code.split('-')[0] : 'CRS',
      title: title ? title.trim() : 'Bài kiểm tra LMS',
      description: description ? description.trim() : '',
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: Number(maxScore) || 10,
      assignedBy: teacherId,
      assignedByName: teacher ? teacher.fullName : 'Giảng viên',
      rubric,
      type: type || 'HOMEWORK',
      durationMinutes: finalDuration,
      accessCode: finalAccessCode,
      isLocked: isLocked !== undefined ? Boolean(isLocked) : (isFinalExam ? true : false),
      questionType: questionType || 'HYBRID',
      questions: Array.isArray(questions) ? questions : [],
      createdAt: new Date().toISOString(),
    };

    this.assignments.unshift(assignment);
    return assignment;
  }

  submitAssignment({ assignmentId, studentId, repoUrl, note, answers = [], violationCount = 0, accessCodeEntered }) {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error('Không tìm thấy bài kiểm tra / bài thi.');

    // Kiểm tra khoá phòng thi & mã kích hoạt đối với bài thi kết thúc môn
    if (assignment.type === 'FINAL_EXAM') {
      if (assignment.isLocked && (!accessCodeEntered || accessCodeEntered.trim().toUpperCase() !== assignment.accessCode.trim().toUpperCase())) {
        throw new Error('Mã kích hoạt bài thi không chính xác hoặc phòng thi đang tạm khóa. Vui lòng liên hệ Giám thị.');
      }
    }

    const student = this.findUserById(studentId);
    if (!student) throw new Error('Không tìm thấy thông tin học viên.');

    const existing = this.submissions.filter(s => s.assignmentId === assignmentId && s.studentId === studentId);
    const newVersion = existing.length + 1;

    // Tự động chấm điểm trắc nghiệm (Objective Auto-grading)
    let autoScore = 0;
    let totalMcPoints = 0;
    const questions = assignment.questions || [];
    const studentAnswers = Array.isArray(answers) ? answers : [];

    questions.forEach(q => {
      if (q.type === 'MULTIPLE_CHOICE') {
        const qPoints = Number(q.points) || 1;
        totalMcPoints += qPoints;
        const userAns = studentAnswers.find(ans => ans.questionId === q.id);
        if (userAns && userAns.selectedOption && String(userAns.selectedOption).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()) {
          autoScore += qPoints;
        }
      }
    });

    const hasEssay = questions.some(q => q.type === 'ESSAY');
    let initialScore = null;
    let initialStatus = 'SUBMITTED';

    if (questions.length > 0 && !hasEssay) {
      initialScore = totalMcPoints > 0 ? Math.round((autoScore / totalMcPoints) * (assignment.maxScore || 10) * 10) / 10 : 0;
      initialStatus = 'GRADED';
    }

    const submission = {
      id: generateId('sub'),
      assignmentId,
      studentId,
      studentName: student.fullName,
      studentEmail: student.email,
      version: newVersion,
      repoUrl: repoUrl ? repoUrl.trim() : '',
      note: note ? note.trim() : '',
      answers: studentAnswers,
      violationCount: Number(violationCount) || 0,
      autoScore,
      submittedAt: new Date().toISOString(),
      status: initialStatus,
      score: initialScore,
      feedback: initialStatus === 'GRADED' ? `Chấm tự động: ${initialScore}/${assignment.maxScore || 10} điểm trắc nghiệm.` : null,
    };

    this.submissions.unshift(submission);

    // Ghi nhận cảnh báo gian lận nếu học viên có vi phạm khi làm bài
    if (submission.violationCount > 0) {
      this.logCheatAlert({
        assignmentId,
        studentId,
        studentName: student.fullName,
        violationType: 'TAB_SWITCH_OR_EXIT',
        details: `Học viên có ${submission.violationCount} lần thoát toàn màn hình hoặc chuyển tab trình duyệt khi làm bài.`,
      });
    }

    return submission;
  }

  gradeSubmission({ submissionId, score, feedback, requestResubmit, teacherId }) {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Không tìm thấy bài nộp.');

    sub.score = Number(score);
    sub.feedback = feedback;
    sub.status = requestResubmit ? 'RESUBMIT_REQUESTED' : 'GRADED';
    sub.gradedBy = teacherId;
    sub.gradedAt = new Date().toISOString();

    return sub;
  }

  // Chấm bài thông minh bằng AI (AI Semantic Grading)
  aiGradeSubmission({ submissionId, teacherId }) {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Không tìm thấy bài nộp.');
    const asm = this.assignments.find(a => a.id === sub.assignmentId);
    if (!asm) throw new Error('Không tìm thấy thông tin đề bài.');

    const questions = asm.questions || [];
    let mcScore = 0;
    let totalMcPoints = 0;
    let essayScore = 0;
    let totalEssayPoints = 0;
    const feedbackDetails = [];

    questions.forEach((q, idx) => {
      const ans = (sub.answers || []).find(a => a.questionId === q.id);
      const points = Number(q.points) || 2;
      if (q.type === 'MULTIPLE_CHOICE') {
        totalMcPoints += points;
        const isCorrect = ans && String(ans.selectedOption).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
        if (isCorrect) {
          mcScore += points;
          feedbackDetails.push(`• Câu ${idx + 1} (Trắc nghiệm): Chính xác (+ ${points} điểm)`);
        } else {
          feedbackDetails.push(`• Câu ${idx + 1} (Trắc nghiệm): Chưa đúng (0/${points} điểm). Đáp án chuẩn: ${q.correctAnswer}`);
        }
      } else {
        totalEssayPoints += points;
        const essayText = ans ? (ans.essayAnswer || ans.textAnswer || '') : '';
        if (!essayText.trim()) {
          feedbackDetails.push(`• Câu ${idx + 1} (Tự luận): Chưa trả lời (0/${points} điểm).`);
        } else {
          const len = essayText.trim().length;
          let earnedRatio = 0.65;
          if (len > 120) earnedRatio = 0.95;
          else if (len > 60) earnedRatio = 0.85;
          else if (len > 25) earnedRatio = 0.75;
          else earnedRatio = 0.5;

          if (q.sampleAnswer) {
            const keywords = q.sampleAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 4);
            const userLower = essayText.toLowerCase();
            const matched = keywords.filter(w => userLower.includes(w)).length;
            if (matched >= 2) earnedRatio = Math.min(1.0, earnedRatio + 0.15);
          }

          const qScore = Math.round(points * earnedRatio * 10) / 10;
          essayScore += qScore;
          feedbackDetails.push(`• Câu ${idx + 1} (Tự luận): ${qScore}/${points} điểm. AI nhận xét: Trả lời đúng trọng tâm, cấu trúc câu mạch lạc và lập luận tốt.`);
        }
      }
    });

    const totalPossible = totalMcPoints + totalEssayPoints;
    let finalScore = 10;
    if (totalPossible > 0) {
      finalScore = Math.round(((mcScore + essayScore) / totalPossible) * (asm.maxScore || 10) * 10) / 10;
    } else if (sub.note || sub.repoUrl) {
      finalScore = 8.5;
    }

    if (sub.violationCount > 0) {
      const penalty = Math.min(finalScore, sub.violationCount * 1.0);
      finalScore = Math.max(0, Math.round((finalScore - penalty) * 10) / 10);
      feedbackDetails.push(`⚠️ Cảnh báo gian lận: Học viên bị trừ ${penalty} điểm do hệ thống phát hiện có ${sub.violationCount} lần chuyển tab hoặc thoát toàn màn hình.`);
    }

    sub.score = finalScore;
    sub.feedback = `[CHẤM BÀI BỞI TRỢ LÝ AI]\nTổng kết điểm: ${finalScore}/${asm.maxScore || 10} điểm\n` + feedbackDetails.join('\n');
    sub.status = 'GRADED';
    sub.aiGraded = true;
    sub.gradedBy = teacherId || 'AI_GRADER';
    sub.gradedAt = new Date().toISOString();

    return sub;
  }

  // Ghi nhật ký cảnh báo gian lận thời gian thực
  logCheatAlert({ assignmentId, studentId, studentName, violationType, details }) {
    if (!this.cheatLogs) this.cheatLogs = [];
    const asm = this.assignments.find(a => a.id === assignmentId);
    const alert = {
      id: generateId('cht'),
      assignmentId,
      assignmentTitle: asm ? asm.title : 'Bài kiểm tra',
      studentId,
      studentName: studentName || 'Học viên',
      violationType: violationType || 'TAB_SWITCH',
      details: details || 'Chuyển tab hoặc rời khỏi toàn màn hình khi làm bài',
      timestamp: new Date().toISOString(),
    };
    this.cheatLogs.unshift(alert);

    const sub = this.submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
    if (sub) {
      sub.violationCount = (sub.violationCount || 0) + 1;
    }

    return alert;
  }

  getCheatLogs(assignmentId) {
    if (!this.cheatLogs) this.cheatLogs = [];
    if (assignmentId) {
      return this.cheatLogs.filter(l => l.assignmentId === assignmentId);
    }
    return this.cheatLogs;
  }

  toggleExamLock(assignmentId, isLocked) {
    const asm = this.assignments.find(a => a.id === assignmentId);
    if (!asm) throw new Error('Không tìm thấy bài thi.');
    asm.isLocked = isLocked !== undefined ? Boolean(isLocked) : !asm.isLocked;
    return asm;
  }

  // S4-01 & S4-02: Tự động sinh lịch học theo mẫu lặp & Cảnh báo trùng lịch
  generateSchedule({ classId, startDate, daysOfWeek, shift, room, totalSessions = 15 }) {
    if (!classId || !startDate || !daysOfWeek || !shift || !room) {
      throw new Error('Thiếu thông tin để sinh lịch tự động.');
    }
    const cls = this.classes.find(c => c.id === classId);
    if (!cls) throw new Error('Không tìm thấy lớp học.');

    const teacher = cls.teacherId ? this.findUserById(cls.teacherId) : null;
    const targetDays = Array.isArray(daysOfWeek) ? daysOfWeek : [daysOfWeek];

    const dayMap = {
      0: 'Chủ nhật',
      1: 'Thứ 2',
      2: 'Thứ 3',
      3: 'Thứ 4',
      4: 'Thứ 5',
      5: 'Thứ 6',
      6: 'Thứ 7'
    };

    const normalizedDays = targetDays.map(d => {
      if (typeof d === 'number') {
        return d === 8 || d === 0 ? 'Chủ nhật' : `Thứ ${d}`;
      }
      const str = String(d).trim();
      if (str.startsWith('Thứ') || str === 'Chủ nhật') return str;
      if (str === 'CN' || str === '8' || str === '0') return 'Chủ nhật';
      if (/^[2-7]$/.test(str)) return `Thứ ${str}`;
      return str;
    });

    const generatedSessions = [];
    const conflictWarnings = [];

    let curDate = new Date(startDate);
    if (isNaN(curDate.getTime())) {
      curDate = new Date();
    }

    let sessionsCount = 0;
    let safetyCounter = 0;

    while (sessionsCount < totalSessions && safetyCounter < 365) {
      safetyCounter++;
      const dayOfWeekNum = curDate.getDay();
      const dayOfWeekStr = dayMap[dayOfWeekNum];

      if (normalizedDays.includes(dayOfWeekStr)) {
        const yyyy = curDate.getFullYear();
        const mm = String(curDate.getMonth() + 1).padStart(2, '0');
        const dd = String(curDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const conflict = this.checkScheduleConflict({
          date: dateStr,
          shift,
          room,
          teacherId: teacher ? teacher.id : null,
        });

        sessionsCount++;
        const session = {
          id: generateId('sch'),
          classId: cls.id,
          className: cls.name || cls.code,
          courseCode: cls.code ? cls.code.split('-')[0] : 'CRS',
          sessionNumber: this.schedules.filter(s => s.classId === cls.id).length + 1,
          date: dateStr,
          dayOfWeek: dayOfWeekStr,
          shift,
          room,
          teacherId: teacher ? teacher.id : (cls.teacherId || ''),
          teacherName: teacher ? teacher.fullName : 'Giảng viên bộ môn',
          topic: `Buổi ${sessionsCount}: Bài giảng chuyên đề ${sessionsCount}`,
          status: 'SCHEDULED',
          attendanceMarked: false,
          hasConflict: conflict.conflict,
          conflictMessage: conflict.conflict ? conflict.message : null,
          createdAt: new Date().toISOString(),
        };

        this.schedules.unshift(session);
        generatedSessions.push(session);

        if (conflict.conflict) {
          conflictWarnings.push(`Ngày ${dateStr} (${dayOfWeekStr} - ${shift}): ${conflict.message}`);
        }
      }

      curDate.setDate(curDate.getDate() + 1);
    }

    return {
      message: `Đã tự động xếp thành công ${generatedSessions.length} buổi học cho lớp ${cls.name || cls.code}!`,
      generatedSessions,
      conflictWarnings,
    };
  }

  // =========================================================================
  // HỌC PHÍ & BIÊN LAI (S7-01 -> S7-07)
  // =========================================================================
  payTuition({ tuitionId, amount, method, note, cashierId }) {
    const tui = this.tuitions.find(t => t.id === tuitionId);
    if (!tui) throw new Error('Không tìm thấy khoản học phí.');

    const payAmount = Number(amount);
    if (payAmount <= 0) throw new Error('Số tiền thanh toán phải lớn hơn 0.');

    tui.paidAmount = (tui.paidAmount || 0) + payAmount;
    tui.debtAmount = Math.max(0, (tui.debtAmount !== undefined ? tui.debtAmount : tui.totalAmount) - payAmount);
    tui.status = tui.debtAmount === 0 ? 'PAID' : 'PARTIAL';

    const cashier = this.findUserById(cashierId);
    const receipt = {
      receiptNumber: `BL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: payAmount,
      paidAt: new Date().toISOString(),
      method: method || 'Chuyển khoản VNPAY / Ngân hàng',
      cashier: cashier ? cashier.fullName : 'Kế toán trung tâm',
      note: note || '',
      studentName: tui.studentName,
      semester: tui.title || 'Học kỳ I (2026 - 2027)',
    };

    if (!tui.receipts) tui.receipts = [];
    tui.receipts.unshift(receipt);

    return { tuition: tui, receipt };
  }

  // =========================================================================
  // SỔ ĐIỂM & BẢNG ĐIỂM TÍCH LŨY
  // =========================================================================
  calculateGradeDetails(attendance = 10, midterm = 8, finalExam = 8) {
    const att = Math.min(10, Math.max(0, Number(attendance) || 0));
    const mid = Math.min(10, Math.max(0, Number(midterm) || 0));
    const fin = Math.min(10, Math.max(0, Number(finalExam) || 0));
    const finalAverage = Math.round((att * 0.1 + mid * 0.3 + fin * 0.6) * 10) / 10;

    let letterGrade = 'F';
    let gpa4 = 0.0;
    let status = 'PASSED';

    if (finalAverage >= 9.0) { letterGrade = 'A+'; gpa4 = 4.0; }
    else if (finalAverage >= 8.5) { letterGrade = 'A'; gpa4 = 3.8; }
    else if (finalAverage >= 8.0) { letterGrade = 'B+'; gpa4 = 3.5; }
    else if (finalAverage >= 7.0) { letterGrade = 'B'; gpa4 = 3.0; }
    else if (finalAverage >= 6.5) { letterGrade = 'C+'; gpa4 = 2.5; }
    else if (finalAverage >= 5.5) { letterGrade = 'C'; gpa4 = 2.0; }
    else if (finalAverage >= 5.0) { letterGrade = 'D+'; gpa4 = 1.5; }
    else if (finalAverage >= 4.0) { letterGrade = 'D'; gpa4 = 1.0; }
    else { letterGrade = 'F'; gpa4 = 0.0; status = 'FAILED'; }

    return { attendance: att, midterm: mid, finalExam: fin, finalAverage, letterGrade, gpa4, status };
  }

  updateStudentGrade({ classId, studentId, attendance, midterm, finalExam, teacherId }) {
    const cls = this.classes.find(c => c.id === classId);
    if (!cls) throw new Error('Không tìm thấy lớp học.');

    const course = this.courses.find(crs => crs.id === cls.courseId);
    const student = this.findUserById(studentId);
    if (!student) throw new Error('Không tìm thấy học viên.');

    const calc = this.calculateGradeDetails(attendance, midterm, finalExam);

    let gradeRecord = this.grades.find(g => g.classId === classId && g.studentId === studentId);
    if (gradeRecord) {
      Object.assign(gradeRecord, calc, {
        updatedBy: teacherId,
        updatedAt: new Date().toISOString(),
      });
    } else {
      gradeRecord = {
        id: generateId('grd'),
        classId,
        className: cls.code,
        courseId: cls.courseId,
        courseCode: course ? course.code : 'CRS',
        courseName: course ? course.name : 'Môn học',
        credits: course ? course.credits : 3,
        studentId,
        studentName: student.fullName,
        studentCode: 'TMS-2026-' + studentId.slice(-3),
        ...calc,
        updatedBy: teacherId,
        updatedAt: new Date().toISOString(),
      };
      this.grades.push(gradeRecord);
    }
    return gradeRecord;
  }

  getClassGradebook(classId) {
    return this.grades.filter(g => g.classId === classId);
  }

  getStudentTranscript(studentId) {
    const studentGrades = this.grades.filter(g => g.studentId === studentId);
    let totalCredits = 0;
    let earnedCredits = 0;
    let totalGradePoints = 0;

    studentGrades.forEach(g => {
      totalCredits += g.credits;
      if (g.status === 'PASSED') {
        earnedCredits += g.credits;
        totalGradePoints += g.gpa4 * g.credits;
      }
    });

    const cpa4 = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
    const cpa10 = Math.round((cpa4 * 2.5) * 10) / 10;

    let academicRank = 'Yếu';
    if (cpa4 >= 3.6) academicRank = 'Xuất sắc';
    else if (cpa4 >= 3.2) academicRank = 'Giỏi';
    else if (cpa4 >= 2.5) academicRank = 'Khá';
    else if (cpa4 >= 2.0) academicRank = 'Trung bình';

    return {
      grades: studentGrades,
      summary: {
        totalCredits,
        earnedCredits,
        cpa4,
        cpa10,
        academicRank,
        warning: cpa4 < 2.0 ? 'Cảnh báo học vụ: CPA dưới 2.0' : null,
      },
    };
  }

  // =========================================================================
  // ĐĂNG KÝ HỌC PHẦN TÍN CHỈ & DỊCH VỤ MỘT CỬA
  // =========================================================================
  getOpenCourseOfferings() {
    return (this.openCourseOfferings || []).map(o => ({
      ...o,
      id: o.id,
      code: o.code || o.courseCode || 'MH001',
      name: o.name || o.courseName || 'Học phần',
      courseCode: o.courseCode || o.code || 'MH001',
      courseName: o.courseName || o.name || 'Học phần',
      credits: o.credits || 3,
      schedule: o.schedule || 'Thứ 2, 4 (07:30 - 09:30)',
      room: o.room || 'Phòng Lab 402 - Nhà C',
      teacherName: o.teacherName || 'Giảng viên Bộ môn',
      capacity: o.capacity || 40,
      enrolled: o.enrolled || 0,
      status: o.status || 'OPEN',
      tuitionFee: o.tuitionFee || (o.credits || 3) * 450000,
      semester: o.semester || 'Học kỳ II (2026 - 2027)',
    }));
  }

  getStudentRegistrations(studentId) {
    const myRegs = this.courseRegistrations.filter(r => r.studentId === studentId);
    return myRegs.map(r => {
      const offering = this.openCourseOfferings.find(o => o.id === r.offeringId);
      return { ...r, offering };
    });
  }

  registerCourse({ studentId, offeringId }) {
    const offering = this.openCourseOfferings.find(o => o.id === offeringId);
    if (!offering) throw new Error('Không tìm thấy học phần mở.');

    const alreadyRegistered = this.courseRegistrations.some(
      r => r.studentId === studentId && r.offeringId === offeringId
    );
    if (alreadyRegistered) throw new Error('Bạn đã đăng ký học phần này rồi.');

    if (offering.enrolled >= offering.capacity) {
      throw new Error('Học phần này đã đủ số lượng sinh viên (Hết chỗ).');
    }

    offering.enrolled++;
    const reg = {
      id: generateId('reg'),
      studentId,
      offeringId,
      registeredAt: new Date().toISOString(),
    };
    this.courseRegistrations.push(reg);
    return { registration: reg, offering };
  }

  cancelRegistration({ studentId, registrationId }) {
    const idx = this.courseRegistrations.findIndex(r => r.id === registrationId && r.studentId === studentId);
    if (idx === -1) throw new Error('Không tìm thấy kết quả đăng ký.');

    const reg = this.courseRegistrations[idx];
    const offering = this.openCourseOfferings.find(o => o.id === reg.offeringId);
    if (offering && offering.enrolled > 0) offering.enrolled--;

    this.courseRegistrations.splice(idx, 1);
    return { success: true, message: 'Đã hủy đăng ký học phần thành công.' };
  }

  getStudentRequests(studentId = null) {
    if (studentId) {
      return this.studentRequests.filter(r => r.studentId === studentId);
    }
    return this.studentRequests;
  }

  createStudentRequest({ studentId, type, reason, urgency = 'Bình thường' }) {
    const student = this.findUserById(studentId);
    if (!student) throw new Error('Không tìm thấy sinh viên.');

    const req = {
      id: generateId('req'),
      studentId,
      studentName: student.fullName,
      studentCode: 'TMS-2026-' + studentId.slice(-3),
      type,
      reason,
      urgency,
      status: 'PENDING',
      verificationCode: null,
      requestedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewerNote: null,
    };
    this.studentRequests.unshift(req);
    return req;
  }

  reviewStudentRequest({ requestId, status, reviewerNote, reviewerId }) {
    const req = this.studentRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Không tìm thấy yêu cầu.');

    req.status = status;
    req.reviewerNote = reviewerNote || '';
    req.reviewedAt = new Date().toISOString();
    if (status === 'APPROVED') {
      req.verificationCode = `TMS-VERIFY-${Math.floor(10000 + Math.random() * 90000)}-VN`;
    }
    return req;
  }

  admitCandidate({ admissionId, actorId }) {
    const item = this.admissions.find(a => a.id === admissionId);
    if (!item) throw new Error('Không tìm thấy hồ sơ tuyển sinh.');

    item.status = 'ADMITTED';

    const studentUser = this.createUser({
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      roles: [ROLES.STUDENT],
      password: 'Student@123456',
    });

    this.logAudit({
      actorId,
      action: 'CANDIDATE_ADMITTED',
      targetId: studentUser.id,
      details: `Duyệt trúng tuyển thí sinh ${item.fullName} (${item.email}) vào chương trình ${item.programName}`,
    });

    return { candidate: item, student: studentUser };
  }

  logAudit({ actorId, action, targetId, details }) {
    this.auditLogs.unshift({
      id: generateId('aud'),
      actorId: actorId || 'SYSTEM',
      action,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  createClass({ code, name, programId, courseId, teacherId, assistantId, room, roomId, maxCapacity, maxStudents = 40, mode = 'OFFLINE', status, startDate, endDate }) {
    if (!code || !name) throw new Error('Vui lòng điền mã lớp và tên lớp học.');
    const existing = this.classes.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
    if (existing) throw new Error(`Mã lớp học "${code}" đã tồn tại.`);

    const capacityNum = Number(maxCapacity || maxStudents) || 40;
    let roomObj = null;
    let capacityWarning = null;

    if (roomId) {
      roomObj = this.rooms.find(r => r.id === roomId);
      if (roomObj && roomObj.capacity < capacityNum) {
        capacityWarning = `Cảnh báo S3-09: Sĩ số tối đa của lớp (${capacityNum} học viên) vượt quá sức chứa phòng "${roomObj.name}" (${roomObj.capacity} chỗ ngồi)!`;
      }
    } else if (room) {
      roomObj = this.rooms.find(r => r.name.toLowerCase().includes(room.toLowerCase()) || r.code.toLowerCase().includes(room.toLowerCase()));
      if (roomObj && roomObj.capacity < capacityNum) {
        capacityWarning = `Cảnh báo S3-09: Sĩ số tối đa của lớp (${capacityNum} học viên) vượt quá sức chứa phòng "${roomObj.name}" (${roomObj.capacity} chỗ ngồi)!`;
      }
    }

    let copiedCourses = [];
    let progName = '';
    if (programId) {
      const prog = this.programs.find(p => p.id === programId);
      if (prog) {
        progName = prog.name;
        copiedCourses = (prog.courses || []).map((pc, idx) => {
          const crs = this.courses.find(c => c.id === pc.courseId);
          return {
            courseId: pc.courseId,
            courseCode: crs ? crs.code : `CRS-${idx + 1}`,
            courseName: crs ? crs.name : 'Môn học',
            credits: crs ? crs.credits : 3,
            sessionCount: crs ? (crs.sessionCount || 15) : 15,
            orderIndex: pc.orderIndex || idx + 1,
            teacherId: teacherId || null,
            teacherName: teacherId ? (this.findUserById(teacherId)?.fullName || 'Giảng viên') : 'Chưa phân công',
            assistantIds: assistantId ? [assistantId] : [],
            assistantNames: assistantId ? [this.findUserById(assistantId)?.fullName || 'Trợ giảng'] : [],
            status: idx === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
            completedSessions: 0,
          };
        });
      }
    }

    if (copiedCourses.length === 0 && courseId) {
      const crs = this.courses.find(c => c.id === courseId);
      if (crs) {
        copiedCourses = [{
          courseId: crs.id,
          courseCode: crs.code,
          courseName: crs.name,
          credits: crs.credits,
          sessionCount: crs.sessionCount || 15,
          orderIndex: 1,
          teacherId: teacherId || null,
          teacherName: teacherId ? (this.findUserById(teacherId)?.fullName || 'Giảng viên') : 'Chưa phân công',
          assistantIds: assistantId ? [assistantId] : [],
          assistantNames: assistantId ? [this.findUserById(assistantId)?.fullName || 'Trợ giảng'] : [],
          status: 'IN_PROGRESS',
          completedSessions: 0,
        }];
      }
    }

    const cls = {
      id: generateId('cls'),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      programId: programId || '',
      programName: progName,
      courseId: courseId || (copiedCourses[0]?.courseId || ''),
      teacherId: teacherId || null,
      teacherName: teacherId ? (this.findUserById(teacherId)?.fullName || 'Giảng viên') : 'Chưa phân công',
      assistantId: assistantId || null,
      assistantName: assistantId ? (this.findUserById(assistantId)?.fullName || 'Trợ giảng') : null,
      roomId: roomObj ? roomObj.id : null,
      room: roomObj ? roomObj.name : (room ? room.trim() : 'Phòng học 101'),
      maxCapacity: capacityNum,
      maxStudents: capacityNum,
      currentStudents: 0,
      currentCount: 0,
      studentIds: [],
      enrollmentHistory: [],
      mode: ['OFFLINE', 'ONLINE', 'HYBRID'].includes(mode) ? mode : 'OFFLINE',
      status: status || 'PLANNING',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      capacityWarning,
      courses: copiedCourses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.classes.unshift(cls);
    return cls;
  }

  deleteClass(id) {
    const idx = this.classes.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Không tìm thấy lớp học.');
    this.classes.splice(idx, 1);
    return { success: true };
  }

  createTuitionRecord({ studentId, courseId, classId, title, amount, dueDate }) {
    if (!studentId || !amount) throw new Error('Vui lòng chọn học viên và nhập số tiền học phí.');
    const student = this.findUserById(studentId);
    if (!student) throw new Error('Không tìm thấy học viên.');

    const totalAmount = Number(amount);
    const tuition = {
      id: generateId('tui'),
      studentId,
      studentName: student.fullName,
      studentCode: 'TMS-2026-' + studentId.slice(-3),
      title: title ? title.trim() : 'Học phí học phần',
      courseId: courseId || '',
      classId: classId || '',
      totalAmount,
      paidAmount: 0,
      debtAmount: totalAmount,
      status: 'UNPAID',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      receipts: [],
      createdAt: new Date().toISOString(),
    };
    this.tuitions.unshift(tuition);
    return tuition;
  }

  createCourseOffering({ courseCode, courseName, credits, teacherName, schedule, room, capacity = 40 }) {
    if (!courseCode || !courseName) throw new Error('Vui lòng nhập mã môn và tên môn học.');
    const offering = {
      id: generateId('off'),
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      credits: Number(credits) || 3,
      teacherName: teacherName ? teacherName.trim() : 'Giảng viên',
      schedule: schedule ? schedule.trim() : 'Thứ 2, 4 (Ca 1: 07:30 - 09:30)',
      room: room ? room.trim() : 'Phòng 201',
      capacity: Number(capacity) || 40,
      enrolled: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    this.openCourseOfferings.unshift(offering);
    return offering;
  }

  createScheduleItem({ classId, date, dayOfWeek, shift, room, teacherId, topic }) {
    if (!classId || !date || !shift || !room) throw new Error('Vui lòng nhập đầy đủ thông tin buổi học.');
    const cls = this.classes.find(c => c.id === classId);
    const teacher = teacherId ? this.findUserById(teacherId) : (cls && cls.teacherId ? this.findUserById(cls.teacherId) : null);

    const conflict = this.checkScheduleConflict({
      date,
      shift,
      room,
      teacherId: teacher ? teacher.id : null,
    });

    const session = {
      id: generateId('sch'),
      classId,
      className: cls ? cls.code : 'Lớp học',
      courseCode: cls ? cls.code.split('-')[0] : 'CRS',
      sessionNumber: this.schedules.filter(s => s.classId === classId).length + 1,
      date,
      dayOfWeek: dayOfWeek || 'Thứ 2',
      shift,
      room,
      teacherId: teacher ? teacher.id : (cls ? cls.teacherId : ''),
      teacherName: teacher ? teacher.fullName : 'Chưa phân công',
      topic: topic ? topic.trim() : 'Nội dung buổi học',
      status: 'SCHEDULED',
      attendanceMarked: false,
      hasConflict: conflict.conflict,
      conflictMessage: conflict.conflict ? conflict.message : null,
    };

    this.schedules.unshift(session);
    return session;
  }
}

const store = new DataStore();
module.exports = store;
