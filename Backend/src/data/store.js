const bcrypt = require('bcryptjs');
const { ROLES } = require('./roles');

// Helper sinh ID
function generateId(prefix = 'id') {
  return `${prefix}_` + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Băm mật khẩu mặc định
// Băm mật khẩu mặc định cho Admin (admin123)
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);
const TEACHER_PASSWORD_HASH = bcrypt.hashSync('Teacher@123456', 10);
const ACCOUNTANT_PASSWORD_HASH = bcrypt.hashSync('Accountant@123456', 10);

class DataStore {
  constructor() {
    // 1. Duy nhất tài khoản Quản trị viên (admin / admin123)
    this.users = [
      {
        id: 'usr_admin_001',
        fullName: 'Quản trị viên Hệ thống',
        username: 'admin',
        email: 'admin@tms.edu.vn',
        passwordHash: ADMIN_PASSWORD_HASH,
        phone: '0912345678',
        roles: [ROLES.ADMIN, ROLES.TRAINING_MANAGER, ROLES.TEACHER, ROLES.ACCOUNTANT, ROLES.CONSULTANT, ROLES.STUDENT],
        status: 'ACTIVE',
        lockReason: null,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date().toISOString(),
      },
    ];

    // Tài khoản chỉ phục vụ kiểm thử RBAC tự động. Không xuất hiện khi chạy bình thường.
    if (process.env.TMS_SEED_TEST_USERS === 'true') {
      this.users.push(
        {
          id: 'usr_teacher_001',
          fullName: 'Giảng viên kiểm thử',
          username: 'teacher',
          email: 'teacher@tms.edu.vn',
          passwordHash: TEACHER_PASSWORD_HASH,
          phone: '',
          roles: [ROLES.TEACHER],
          status: 'ACTIVE',
          lockReason: null,
          avatar: '',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr_accountant_001',
          fullName: 'Kế toán kiểm thử',
          username: 'accountant',
          email: 'accountant@tms.edu.vn',
          passwordHash: ACCOUNTANT_PASSWORD_HASH,
          phone: '',
          roles: [ROLES.ACCOUNTANT],
          status: 'ACTIVE',
          lockReason: null,
          avatar: '',
          createdAt: new Date().toISOString(),
        },
      );
    }

    // Toàn bộ danh mục để trống để Quản trị viên & Người dùng tự thêm dữ liệu thực tế
    this.programs = [];
    this.courses = [];
    this.classes = [];
    this.schedules = [];
    this.assignments = [];
    this.submissions = [];
    this.tuitions = [];
    this.grades = [];
    this.openCourseOfferings = [];
    this.courseRegistrations = [];
    this.studentRequests = [];
    this.admissions = [];

    // State theo dõi hệ thống
    this.failedAttempts = new Map();
    this.resetTokens = new Map();
    this.activeSessions = new Map();
    this.userSessions = new Map();
    this.auditLogs = [];
  }

  // Phương thức tìm kiếm người dùng: hỗ trợ cả username "admin" và email "admin@tms.edu.vn"
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

  createUser({ fullName, email, phone, roles, password, avatar }) {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new Error('Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.');
    }

    const newUser = {
      id: generateId('usr'),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      phone: phone ? phone.trim() : '',
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
    if (phone !== undefined) user.phone = phone.trim();
    if (Array.isArray(roles) && roles.length > 0) user.roles = roles;
    return user;
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
  // TÍNH NĂNG MỚI: TỰ ĐỘNG SINH LỊCH HỌC & KIỂM TRA XUNG ĐỘT (S4-01 -> S4-08)
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
        if (s.teacherId === teacherId) {
          return {
            conflict: true,
            type: 'TEACHER_CONFLICT',
            message: `Trùng giảng viên: Thầy/Cô ${s.teacherName} đã có lịch dạy lớp "${s.className}" vào ${s.shift} ngày ${date}!`,
            conflictWith: s,
          };
        }
      }
    }
    return { conflict: false };
  }

  generateSchedule({ classId, startDate, daysOfWeek, shift, room, totalSessions = 15 }) {
    const cls = this.classes.find(c => c.id === classId);
    if (!cls) throw new Error('Không tìm thấy lớp học.');

    const teacher = this.findUserById(cls.teacherId);
    const teacherName = teacher ? teacher.fullName : 'Chưa phân công';

    // Xoá lịch cũ của lớp nếu sinh lại
    this.schedules = this.schedules.filter(s => s.classId !== classId);

    const generated = [];
    const conflictWarnings = [];

    // Map thứ sang JS Day (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)
    const dayMap = {
      'Thứ 2': 1,
      'Thứ 3': 2,
      'Thứ 4': 3,
      'Thứ 5': 4,
      'Thứ 6': 5,
      'Thứ 7': 6,
      'Chủ nhật': 0,
    };

    const targetDays = daysOfWeek.map(d => dayMap[d]).filter(d => d !== undefined);
    if (targetDays.length === 0) throw new Error('Vui lòng chọn ít nhất một thứ trong tuần.');

    let currentDate = new Date(startDate);
    let sessionCount = 0;

    // Giả lập danh mục ngày nghỉ lễ
    const holidays = ['2026-01-01', '2026-04-30', '2026-05-01', '2026-09-02'];

    while (sessionCount < totalSessions) {
      const dayOfWeekNum = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];

      if (targetDays.includes(dayOfWeekNum) && !holidays.includes(dateStr)) {
        sessionCount++;
        const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeekNum) || 'Thứ 2';

        // Kiểm tra xung đột
        const conflictCheck = this.checkScheduleConflict({
          date: dateStr,
          shift,
          room,
          teacherId: cls.teacherId,
        });

        if (conflictCheck.conflict) {
          conflictWarnings.push(`Buổi ${sessionCount} (${dateStr}): ${conflictCheck.message}`);
        }

        const newSession = {
          id: generateId('sch'),
          classId: cls.id,
          className: cls.code,
          courseCode: 'CS101',
          sessionNumber: sessionCount,
          date: dateStr,
          dayOfWeek: dayName,
          shift,
          room,
          teacherId: cls.teacherId,
          teacherName,
          topic: `Bài học ${sessionCount}: Chuyên đề thực hành môn học`,
          status: 'SCHEDULED',
          attendanceMarked: false,
          hasConflict: conflictCheck.conflict,
        };

        generated.push(newSession);
        this.schedules.push(newSession);
      }

      // Tăng thêm 1 ngày
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      message: `Đã sinh thành công ${generated.length} buổi học cho lớp ${cls.code}.`,
      generatedSessions: generated,
      conflictWarnings,
    };
  }

  // Điểm danh buổi học (S4-07)
  markAttendance(scheduleId, attendanceRecords) {
    const session = this.schedules.find(s => s.id === scheduleId);
    if (!session) throw new Error('Không tìm thấy buổi học.');

    session.attendanceMarked = true;
    session.attendanceRecords = attendanceRecords; // studentId -> status (PRESENT, LATE, EXCUSED, UNEXCUSED)

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
  // TÍNH NĂNG MỚI: BÀI TẬP, NỘP BÀI & CHẤM ĐIỂM (S5-05 -> S6-04)
  // =========================================================================
  createAssignment({ classId, title, description, deadline, maxScore = 10, rubric = [], teacherId }) {
    const cls = this.classes.find(c => c.id === classId);
    const teacher = this.findUserById(teacherId);

    const assignment = {
      id: generateId('asm'),
      classId,
      className: cls ? cls.code : 'Lớp học',
      courseCode: cls ? cls.code.split('-')[0] : 'CRS',
      title: title.trim(),
      description: description.trim(),
      deadline,
      maxScore: Number(maxScore) || 10,
      assignedBy: teacherId,
      assignedByName: teacher ? teacher.fullName : 'Giảng viên',
      rubric,
      createdAt: new Date().toISOString(),
    };

    this.assignments.unshift(assignment);
    return assignment;
  }

  submitAssignment({ assignmentId, studentId, repoUrl, note }) {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error('Không tìm thấy bài tập.');

    const student = this.findUserById(studentId);
    if (!student) throw new Error('Không tìm thấy học viên.');

    // Tìm xem đã nộp bản nào chưa
    const existing = this.submissions.filter(s => s.assignmentId === assignmentId && s.studentId === studentId);
    const newVersion = existing.length + 1;

    const submission = {
      id: generateId('sub'),
      assignmentId,
      studentId,
      studentName: student.fullName,
      studentEmail: student.email,
      version: newVersion,
      repoUrl: repoUrl ? repoUrl.trim() : '',
      note: note ? note.trim() : '',
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED', // SUBMITTED | GRADED | RESUBMIT_REQUESTED
      score: null,
      feedback: null,
    };

    this.submissions.unshift(submission);
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

  // =========================================================================
  // TÍNH NĂNG MỚI: HỌC PHÍ & BIÊN LAI (S7-01 -> S7-07)
  // =========================================================================
  payTuition({ tuitionId, amount, method, note, cashierId }) {
    const tui = this.tuitions.find(t => t.id === tuitionId);
    if (!tui) throw new Error('Không tìm thấy khoản học phí.');

    const payAmount = Number(amount);
    if (payAmount <= 0) throw new Error('Số tiền thanh toán phải lớn hơn 0.');
    if (payAmount > tui.debtAmount) throw new Error(`Số tiền đóng (${payAmount.toLocaleString('vi-VN')} đ) vượt quá số nợ còn lại (${tui.debtAmount.toLocaleString('vi-VN')} đ).`);

    tui.paidAmount += payAmount;
    tui.debtAmount -= payAmount;
    tui.status = tui.debtAmount === 0 ? 'PAID' : 'PARTIAL';

    const cashier = this.findUserById(cashierId);
    const receipt = {
      receiptNumber: `BL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: payAmount,
      paidAt: new Date().toISOString(),
      method: method || 'Chuyển khoản VNPAY / Ngân hàng',
      cashier: cashier ? cashier.fullName : 'Kế toán trung tâm',
      note: note || '',
    };

    if (!tui.receipts) tui.receipts = [];
    tui.receipts.unshift(receipt);

    return { tuition: tui, receipt };
  }

  // =========================================================================
  // PHÂN HỆ SỔ ĐIỂM & BẢNG ĐIỂM TÍCH LŨY (GRADEBOOK & TRANSCRIPT)
  // =========================================================================
  calculateGradeDetails(attendance = 10, midterm = 8, finalExam = 8) {
    const att = Math.min(10, Math.max(0, Number(attendance) || 0));
    const mid = Math.min(10, Math.max(0, Number(midterm) || 0));
    const fin = Math.min(10, Math.max(0, Number(finalExam) || 0));
    // 10% Chuyên cần + 30% Giữa kỳ + 60% Cuối kỳ
    const finalAverage = Math.round((att * 0.1 + mid * 0.3 + fin * 0.6) * 10) / 10;

    let letterGrade = 'F';
    let gpa4 = 0.0;
    let status = 'PASSED';

    if (finalAverage >= 9.0) {
      letterGrade = 'A+';
      gpa4 = 4.0;
    } else if (finalAverage >= 8.5) {
      letterGrade = 'A';
      gpa4 = 3.8;
    } else if (finalAverage >= 8.0) {
      letterGrade = 'B+';
      gpa4 = 3.5;
    } else if (finalAverage >= 7.0) {
      letterGrade = 'B';
      gpa4 = 3.0;
    } else if (finalAverage >= 6.5) {
      letterGrade = 'C+';
      gpa4 = 2.5;
    } else if (finalAverage >= 5.5) {
      letterGrade = 'C';
      gpa4 = 2.0;
    } else if (finalAverage >= 5.0) {
      letterGrade = 'D+';
      gpa4 = 1.5;
    } else if (finalAverage >= 4.0) {
      letterGrade = 'D';
      gpa4 = 1.0;
    } else {
      letterGrade = 'F';
      gpa4 = 0.0;
      status = 'FAILED';
    }

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
  // PHÂN HỆ ĐĂNG KÝ HỌC PHẦN TÍN CHỈ (COURSE REGISTRATION)
  // =========================================================================
  getOpenCourseOfferings() {
    return this.openCourseOfferings;
  }

  getStudentRegistrations(studentId) {
    const myRegs = this.courseRegistrations.filter(r => r.studentId === studentId);
    return myRegs.map(r => {
      const offering = this.openCourseOfferings.find(o => o.id === r.offeringId);
      return {
        ...r,
        offering,
      };
    });
  }

  registerCourse({ studentId, offeringId }) {
    const offering = this.openCourseOfferings.find(o => o.id === offeringId);
    if (!offering) throw new Error('Không tìm thấy học phần mở.');

    const alreadyRegistered = this.courseRegistrations.some(
      r => r.studentId === studentId && r.offeringId === offeringId
    );
    if (alreadyRegistered) {
      throw new Error('Bạn đã đăng ký học phần này rồi.');
    }

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

  // =========================================================================
  // PHÂN HỆ DỊCH VỤ MỘT CỬA SINH VIÊN (STUDENT REQUESTS)
  // =========================================================================
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

    req.status = status; // APPROVED | REJECTED
    req.reviewerNote = reviewerNote || '';
    req.reviewedAt = new Date().toISOString();
    if (status === 'APPROVED') {
      req.verificationCode = `TMS-VERIFY-${Math.floor(10000 + Math.random() * 90000)}-VN`;
    }
    return req;
  }

  // =========================================================================
  // PHÂN HỆ CỔNG TUYỂN SINH & CRM (ADMISSIONS)
  // =========================================================================
  getAdmissions() {
    return this.admissions;
  }

  createAdmissionLead({ fullName, phone, email, programName, score, note }) {
    const lead = {
      id: generateId('adm'),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      programName,
      score: Number(score) || 0,
      status: 'NEW',
      note: note || '',
      consultantName: 'Chưa phân công',
      createdAt: new Date().toISOString(),
    };
    this.admissions.unshift(lead);
    return lead;
  }

  updateAdmissionStatus({ admissionId, status, note, consultantName }) {
    const item = this.admissions.find(a => a.id === admissionId);
    if (!item) throw new Error('Không tìm thấy hồ sơ tuyển sinh.');

    if (status) item.status = status;
    if (note) item.note = note;
    if (consultantName) item.consultantName = consultantName;
    return item;
  }

  admitCandidate({ admissionId, actorId }) {
    const item = this.admissions.find(a => a.id === admissionId);
    if (!item) throw new Error('Không tìm thấy hồ sơ tuyển sinh.');

    item.status = 'ADMITTED';

    // Tạo tài khoản sinh viên chính thức
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

  // =========================================================================
  // TẠO MỚI CHƯƠNG TRÌNH, MÔN HỌC, LỚP HỌC, HỌC PHÍ, LỊCH HỌC
  // =========================================================================
  createProgram({ code, name, description, durationMonths = 12 }) {
    if (!code || !name) throw new Error('Vui lòng điền mã và tên chương trình đào tạo.');
    const existing = this.programs.find(p => p.code.toLowerCase() === code.trim().toLowerCase());
    if (existing) throw new Error(`Mã chương trình "${code}" đã tồn tại.`);

    const program = {
      id: generateId('prog'),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description ? description.trim() : '',
      durationMonths: Number(durationMonths) || 12,
      createdAt: new Date().toISOString(),
    };
    this.programs.unshift(program);
    return program;
  }

  deleteProgram(id) {
    const idx = this.programs.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Không tìm thấy chương trình đào tạo.');
    this.programs.splice(idx, 1);
    return { success: true };
  }

  createCourse({ code, name, credits = 3, programId = '', tuitionPerCredit = 500000 }) {
    if (!code || !name) throw new Error('Vui lòng điền mã môn và tên môn học.');
    const existing = this.courses.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
    if (existing) throw new Error(`Mã môn học "${code}" đã tồn tại.`);

    const course = {
      id: generateId('crs'),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      credits: Number(credits) || 3,
      programId: programId || (this.programs[0] ? this.programs[0].id : ''),
      tuitionPerCredit: Number(tuitionPerCredit) || 500000,
      createdAt: new Date().toISOString(),
    };
    this.courses.unshift(course);
    return course;
  }

  deleteCourse(id) {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Không tìm thấy môn học.');
    this.courses.splice(idx, 1);
    return { success: true };
  }

  createClass({ code, name, programId, courseId, teacherId, assistantId, room, maxStudents = 40, startDate, endDate }) {
    if (!code || !name) throw new Error('Vui lòng điền mã lớp và tên lớp học.');
    const existing = this.classes.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
    if (existing) throw new Error(`Mã lớp học "${code}" đã tồn tại.`);

    const cls = {
      id: generateId('cls'),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      programId: programId || '',
      courseId: courseId || '',
      teacherId: teacherId || '',
      assistantId: assistantId || '',
      room: room ? room.trim() : 'Phòng học 101',
      maxStudents: Number(maxStudents) || 40,
      currentStudents: 0,
      status: 'ACTIVE',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      createdAt: new Date().toISOString(),
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
      status: 'UNPAID', // UNPAID | PARTIAL | PAID
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
