const express = require('express');
const store = require('../data/store');
const { ROLES } = require('../data/roles');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

// =========================================================================
// S2-08: BIỂU MẪU CÔNG KHAI ĐĂNG KÝ TƯ VẤN (PUBLIC CONSULTATION - KHÔNG CẦN LOGIN)
// - Biểu mẫu không yêu cầu đăng nhập, có chống spam
// - Gửi thành công tạo một lead ở trạng thái Mới
// - Hiển thị lời cảm ơn và cam kết thời gian liên hệ lại
// =========================================================================
router.get('/public/programs', (req, res) => {
  const activePrograms = store.programs
    .filter(p => p.status === 'ACTIVE')
    .map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      durationMonths: p.durationMonths,
      standardTuition: p.standardTuition,
    }));
  res.json({ data: activePrograms });
});

router.post('/public/consultation', (req, res) => {
  const {
    fullName,
    phone,
    email,
    programName,
    note,
    websiteTrap,
    captchaAnswer,
    expectedCaptcha,
  } = req.body;

  try {
    const result = store.createPublicConsultation({
      fullName,
      phone,
      email,
      programName,
      note,
      websiteTrap,
      captchaAnswer,
      expectedCaptcha,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      code: 'CONSULTATION_SUBMIT_FAILED',
      message: err.message,
    });
  }
});

// Middleware xác thực token cho toàn bộ các API nghiệp vụ nội bộ phía dưới
router.use(authenticateToken);

// =========================================================================
// S2-04 & S2-06: QUẢN LÝ CHƯƠNG TRÌNH ĐÀO TẠO & LỘ TRÌNH MÔN HỌC
// =========================================================================
router.get('/programs', (req, res) => {
  const enriched = store.programs.map(p => ({
    ...p,
    courseCount: Array.isArray(p.courses) ? p.courses.length : 0,
    classCount: store.classes.filter(c => c.programId === p.id).length,
  }));
  res.json({ data: enriched });
});

router.post('/programs', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { code, name, description, durationMonths, totalHours, standardTuition, status } = req.body;
    const item = store.createProgram({ code, name, description, durationMonths, totalHours, standardTuition, status });
    res.status(201).json({ message: 'Tạo chương trình đào tạo thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/programs/:id', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { name, description, durationMonths, totalHours, standardTuition, status } = req.body;
    const item = store.updateProgram(req.params.id, { name, description, durationMonths, totalHours, standardTuition, status });
    res.json({ message: 'Cập nhật chương trình đào tạo thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/programs/:id/status', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { status } = req.body;
    const item = store.toggleProgramStatus(req.params.id, status);
    res.json({ message: `Đã cập nhật trạng thái chương trình thành "${item.status}"!`, data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/programs/:id', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const result = store.deleteProgram(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S2-06: Gắn môn học vào chương trình, sắp thứ tự & môn tiên quyết
router.get('/programs/:id/courses', (req, res) => {
  try {
    const courses = store.getProgramCourses(req.params.id);
    res.json({ data: courses });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/programs/:id/courses', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { courseId, prerequisiteCourseId } = req.body;
  if (!courseId) {
    return res.status(400).json({ message: 'Vui lòng chọn môn học cần gắn vào chương trình.' });
  }

  try {
    const list = store.addCourseToProgram(req.params.id, { courseId, prerequisiteCourseId });
    res.json({ message: 'Đã gắn môn học vào chương trình thành công!', data: list });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/programs/:id/courses/:courseId', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const list = store.removeCourseFromProgram(req.params.id, req.params.courseId);
    res.json({ message: 'Đã gỡ môn học khỏi chương trình thành công!', data: list });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/programs/:id/courses/reorder', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { courseIdsOrder } = req.body;
  if (!Array.isArray(courseIdsOrder)) {
    return res.status(400).json({ message: 'Danh sách thứ tự môn học không hợp lệ.' });
  }

  try {
    const list = store.reorderProgramCourses(req.params.id, courseIdsOrder);
    res.json({ message: 'Đã cập nhật thứ tự môn học trong chương trình thành công!', data: list });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/programs/:id/courses/:courseId/prerequisite', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { prerequisiteCourseId } = req.body;
  try {
    const list = store.updateCoursePrerequisite(req.params.id, req.params.courseId, prerequisiteCourseId);
    res.json({ message: 'Đã cập nhật môn tiên quyết thành công!', data: list });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// S2-05 & S2-07: QUẢN LÝ MÔN HỌC & ĐỀ CƯƠNG BUỔI HỌC (SYLLABUS)
// =========================================================================
router.get('/courses', (req, res) => {
  const enriched = store.courses.map(crs => {
    // Tìm các chương trình đang sử dụng môn học này
    const usedInPrograms = store.programs
      .filter(p => Array.isArray(p.courses) && p.courses.some(pc => pc.courseId === crs.id))
      .map(p => ({ id: p.id, code: p.code, name: p.name }));

    return {
      ...crs,
      sessionCountDeclared: Array.isArray(crs.sessions) ? crs.sessions.length : 0,
      usedInPrograms,
      classCount: store.classes.filter(c => c.courseId === crs.id).length,
    };
  });
  res.json({ data: enriched });
});

router.post('/courses', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { code, name, sessionCount, credits, learningOutcomes, tuitionPerCredit } = req.body;
    const item = store.createCourse({ code, name, sessionCount, credits, learningOutcomes, tuitionPerCredit });
    res.status(201).json({ message: 'Tạo môn học thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/courses/:id', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { name, sessionCount, credits, learningOutcomes, tuitionPerCredit, status } = req.body;
    const item = store.updateCourse(req.params.id, { name, sessionCount, credits, learningOutcomes, tuitionPerCredit, status });
    res.json({ message: 'Cập nhật môn học thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/courses/:id', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const result = store.deleteCourse(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S2-07: Khai báo các buổi học trong môn học (Syllabus)
router.get('/courses/:id/sessions', (req, res) => {
  try {
    const crs = store.courses.find(c => c.id === req.params.id);
    if (!crs) return res.status(404).json({ message: 'Không tìm thấy môn học.' });

    const sessions = store.getCourseSessions(req.params.id);
    res.json({
      course: {
        id: crs.id,
        code: crs.code,
        name: crs.name,
        sessionCount: crs.sessionCount,
      },
      data: sessions,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/courses/:id/sessions', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { topic, objective } = req.body;
  try {
    const session = store.addCourseSession(req.params.id, { topic, objective });
    res.status(201).json({ message: 'Đã thêm buổi học mới thành công!', data: session });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/courses/:id/sessions/:sessionId', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { topic, objective } = req.body;
  try {
    const session = store.updateCourseSession(req.params.id, req.params.sessionId, { topic, objective });
    res.json({ message: 'Cập nhật buổi học thành công!', data: session });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/courses/:id/sessions/:sessionId', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const result = store.deleteCourseSession(req.params.id, req.params.sessionId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S2-07: Nhân bản danh sách buổi học từ một môn khác
router.post('/courses/:id/sessions/clone', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { sourceCourseId } = req.body;
  if (!sourceCourseId) {
    return res.status(400).json({ message: 'Vui lòng chọn môn học nguồn để nhân bản.' });
  }

  try {
    const result = store.cloneCourseSessions(req.params.id, sourceCourseId);
    res.json({
      message: `Đã nhân bản thành công ${result.clonedCount} buổi học sang môn hiện tại!`,
      ...result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// DANH MỤC LỚP HỌC (CLASSES)
// =========================================================================
// =========================================================================
// S3-05, S3-06, S3-07, S3-08: QUẢN LÝ LỚP HỌC, VÒNG ĐỜI, GHI DANH & PHÂN CÔNG GIẢNG VIÊN
// =========================================================================
// S3-07: Xem danh sách lớp kèm bộ lọc và chỉ số nhanh (sĩ số hiện tại / tối đa, tiến độ buổi học)
router.get('/classes', (req, res) => {
  const { status, programId, teacherId, fromDate, toDate } = req.query;
  const list = store.getClasses({ status, programId, teacherId, fromDate, toDate, user: req.user });
  const enriched = list.map(c => {
    const prog = store.programs.find(p => p.id === c.programId);
    const crs = store.courses.find(cr => cr.id === c.courseId);
    const teacher = store.users.find(u => u.id === c.teacherId);
    const assistant = store.users.find(u => u.id === c.assistantId);
    const roomObj = store.rooms?.find(r => r.id === c.roomId);

    return {
      ...c,
      programName: prog ? prog.name : (c.programName || ''),
      courseName: crs ? crs.name : (c.courseName || ''),
      teacherName: teacher ? teacher.fullName : (c.teacherName || 'Chưa phân công'),
      assistantName: assistant ? assistant.fullName : (c.assistantName || 'Không có'),
      roomName: roomObj ? roomObj.name : (c.room || 'Chưa phân phòng'),
    };
  });

  res.json({ data: enriched });
});

// S3-05: Mở lớp học mới từ một chương trình đào tạo hoặc lớp học tự do
router.post('/classes', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { code, name, programId, courseId, teacherId, assistantId, room, maxStudents, maxCapacity, startDate, endDate, mode, roomId } = req.body;
    if (programId) {
      const result = store.createClassFromProgram({
        code,
        name,
        programId,
        startDate,
        endDate,
        maxCapacity: maxCapacity || maxStudents,
        mode,
        roomId,
        actorId: req.user.id,
        actorName: req.user.fullName,
      });
      res.status(201).json({
        message: 'Mở lớp học từ chương trình đào tạo thành công!',
        data: result.classItem,
        capacityWarning: result.capacityWarning,
      });
    } else {
      const item = store.createClass({ code, name, programId, courseId, teacherId, assistantId, room, maxStudents: maxCapacity || maxStudents, startDate, endDate });
      res.status(201).json({ message: 'Tạo lớp học thành công!', data: item });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S3-05: Chuyển đổi vòng đời lớp học: Chuẩn bị -> Đang học -> Kết thúc -> Huỷ
router.put('/classes/:id/lifecycle', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { status } = req.body;
    const item = store.updateClassLifecycle(req.params.id, {
      status,
      actorId: req.user.id,
      actorName: req.user.fullName,
    });
    res.json({ message: `Cập nhật vòng đời lớp học thành "${status}" thành công!`, data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S3-06: Ghi danh học viên vào lớp (đơn lẻ hoặc hàng loạt)
router.post('/classes/:id/enroll', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { studentIds } = req.body;
    const result = store.enrollStudentsToClass(req.params.id, {
      studentIds,
      actorId: req.user.id,
      actorName: req.user.fullName,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S3-06: Rút học viên khỏi lớp
router.delete('/classes/:id/enroll/:studentId', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const result = store.removeStudentFromClass(req.params.id, req.params.studentId, req.user.id, req.user.fullName);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S3-08: Danh sách giảng viên và trợ giảng để phân công
router.get('/instructors', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN, ROLES.TEACHER), (req, res) => {
  const result = store.getInstructors();
  res.json({ data: result });
});

// S3-08: Phân công giảng viên chính và trợ giảng cho môn học trong lớp
router.put('/classes/:id/courses/:courseId/instructors', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { teacherId, assistantIds } = req.body;
    const result = store.assignCourseInstructors(req.params.id, req.params.courseId, {
      teacherId,
      assistantIds,
      actorId: req.user.id,
      actorName: req.user.fullName,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/classes/:id', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    store.deleteClass(req.params.id);
    res.json({ message: 'Xóa lớp học thành công!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// S3-04: QUẢN LÝ HỒ SƠ HỌC VIÊN (STUDENT PROFILES)
// =========================================================================
router.get('/students', (req, res) => {
  const { search, classId, entryLevel } = req.query;
  const list = store.getStudents({ search, classId, entryLevel });
  res.json({ data: list, total: list.length });
});

router.get('/students/:id', (req, res) => {
  try {
    const student = store.getStudentById(req.params.id);
    res.json({ data: student });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

router.put('/students/:id', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const item = store.updateStudent(req.params.id, req.body);
    res.json({ message: 'Cập nhật hồ sơ học viên thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// S3-09: QUẢN LÝ PHÒNG HỌC & LIÊN KẾT PHÒNG TRỰC TUYẾN
// =========================================================================
router.get('/rooms', (req, res) => {
  const list = store.getRooms();
  res.json({ data: list, total: list.length });
});

router.post('/rooms', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const item = store.createRoom(req.body);
    res.status(201).json({ message: 'Tạo phòng học thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/rooms/:id', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const item = store.updateRoom(req.params.id, req.body);
    res.json({ message: 'Cập nhật thông tin phòng học thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/rooms/:id', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const result = store.deleteRoom(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// DANH SÁCH TƯ VẤN VIÊN (ĐỂ PHÂN CÔNG LEAD S2-10)
// =========================================================================
router.get('/consultants', requireRoles(ROLES.CONSULTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const consultants = store.users
    .filter(u => u.roles.includes(ROLES.CONSULTANT) || u.roles.includes(ROLES.TRAINING_MANAGER))
    .map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles,
    }));
  res.json({ data: consultants });
});

// =========================================================================
// S2-09, S2-10, S2-11: CỔNG TUYỂN SINH & QUẢN LÝ KHÁCH HÀNG TIỀM NĂNG (LEADS CRM)
// =========================================================================
// Lấy danh sách leads với bộ lọc và phân quyền (S2-10 & S2-11)
router.get('/admissions', requireRoles(ROLES.CONSULTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { search, status, source, consultantId, fromDate, toDate } = req.query;

  const leads = store.getLeads({
    user: req.user,
    search,
    status,
    source,
    consultantId,
    fromDate,
    toDate,
  });

  res.json({
    data: leads,
    total: leads.length,
    isConsultantOnly: req.user.roles.includes(ROLES.CONSULTANT) && !req.user.roles.includes(ROLES.ADMIN) && !req.user.roles.includes(ROLES.TRAINING_MANAGER),
  });
});

// S2-09: Tạo Lead nội bộ (Có cảnh báo trùng SĐT)
router.post('/admissions', requireRoles(ROLES.CONSULTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { fullName, phone, email, source, programName, note, consultantId } = req.body;

  try {
    const result = store.createLead({
      fullName,
      phone,
      email,
      source,
      programName,
      note,
      consultantId: consultantId || (req.user.roles.includes(ROLES.CONSULTANT) ? req.user.id : null),
      actorId: req.user.id,
      actorName: req.user.fullName,
    });

    res.status(201).json({
      message: 'Tạo khách hàng tiềm năng thành công!',
      data: result.lead,
      duplicateWarning: result.duplicateWarning,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật Lead (S2-09)
router.put('/admissions/:id', requireRoles(ROLES.CONSULTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { fullName, phone, email, source, programName, note, status } = req.body;

  try {
    const result = store.updateLead(
      req.params.id,
      { fullName, phone, email, source, programName, note, status },
      req.user.id,
      req.user.fullName
    );

    res.json({
      message: 'Cập nhật thông tin khách hàng thành công!',
      data: result.lead,
      duplicateWarning: result.duplicateWarning,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S2-09: Xoá Lead - RÀNG BUỘC: Chỉ Quản lý đào tạo (TRAINING_MANAGER) & ADMIN được xoá
router.delete('/admissions/:id', (req, res) => {
  try {
    const result = store.deleteLead(req.params.id, req.user.roles);
    res.json(result);
  } catch (err) {
    res.status(403).json({
      code: 'AUTH_FORBIDDEN',
      message: err.message,
    });
  }
});

// S2-10: Phân công một hoặc nhiều lead cùng lúc cho tư vấn viên
router.post('/admissions/bulk-assign', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { leadIds, consultantId, note } = req.body;

  try {
    const result = store.bulkAssignLeads({
      leadIds,
      consultantId,
      note,
      actorId: req.user.id,
      actorName: req.user.fullName,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S2-10: Lấy lịch sử chuyển giao của một lead
router.get('/admissions/:id/history', requireRoles(ROLES.CONSULTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const lead = store.admissions.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ message: 'Không tìm thấy khách hàng tiềm năng.' });

  res.json({
    leadId: lead.id,
    fullName: lead.fullName,
    history: lead.assignmentHistory || [],
  });
});

// Duyệt trúng tuyển sinh viên
router.post('/admissions/:id/admit', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const result = store.admitCandidate({
      admissionId: req.params.id,
      actorId: req.user.id,
    });
    res.json({
      message: `Đã công nhận trúng tuyển và tạo tài khoản sinh viên chính thức (${result.candidate.email})!`,
      ...result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// S3-01: THEO DÕI LEAD TRÊN BẢNG PHỄU THEO TRẠNG THÁI (KANBAN)
// - 6 trạng thái chuẩn: NEW -> CONTACTED -> CONSULTING -> TRIAL_SCHEDULED -> CLOSED_WON -> CLOSED_LOST
// - Chuyển sang CLOSED_LOST bắt buộc chọn lý do (lossReason)
// - Ghi nhật ký chuyển trạng thái statusHistory
// =========================================================================
router.put('/admissions/:id/status-funnel', requireRoles(ROLES.CONSULTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { status, lossReason, note } = req.body;
  try {
    const lead = store.updateLeadFunnelStatus(req.params.id, {
      status,
      lossReason,
      note,
      actorId: req.user.id,
      actorName: req.user.fullName,
    });
    res.json({ message: 'Cập nhật trạng thái phễu tư vấn thành công!', data: lead });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// S3-02: GHI NHẬT KÝ CHĂM SÓC & ĐẶT LỊCH NHẮC GỌI LẠI
// - Mỗi lần tương tác ghi loại (CALL, MESSAGE, MEETING), nội dung, thời điểm
// - Đặt ngày nhắc gọi lại remindAt
// =========================================================================
router.post('/admissions/:id/care-logs', requireRoles(ROLES.CONSULTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { type, content, remindAt } = req.body;
  try {
    const result = store.addLeadCareLog(req.params.id, {
      type,
      content,
      remindAt,
      actorId: req.user.id,
      actorName: req.user.fullName,
    });
    res.status(201).json({ message: 'Ghi nhật ký chăm sóc thành công!', ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// S3-03: CHUYỂN LEAD ĐÃ CHỐT THÀNH HỒ SƠ HỌC VIÊN
// - Chuyển sang hồ sơ học viên, tự động sinh mã HV2026-XXX
// - Tạo tài khoản đăng nhập (role STUDENT) và gửi thông tin
// - Lead chuyển sang ENROLLED và khoá sửa (isLocked = true)
// =========================================================================
router.post('/admissions/:id/convert-to-student', requireRoles(ROLES.CONSULTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { entryLevel, note } = req.body;
  try {
    const result = store.convertLeadToStudent(req.params.id, {
      entryLevel,
      note,
      actorId: req.user.id,
      actorName: req.user.fullName,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// HỌC PHÍ, SỔ ĐIỂM, ĐĂNG KÝ HỌC PHẦN, MỘT CỬA (PRESERVED)
// =========================================================================
router.get('/tuitions', (req, res) => {
  const currentUserId = req.user.id;
  const isStudent = req.user.roles.includes(ROLES.STUDENT);

  let list = store.tuitions;
  if (isStudent && !req.user.roles.includes(ROLES.ADMIN) && !req.user.roles.includes(ROLES.ACCOUNTANT)) {
    list = list.filter(t => t.studentId === currentUserId);
  }

  res.json({ data: list, total: list.length });
});

router.post('/tuitions', requireRoles(ROLES.ACCOUNTANT, ROLES.ADMIN), (req, res) => {
  try {
    const { studentId, courseId, classId, title, amount, dueDate } = req.body;
    const item = store.createTuitionRecord({ studentId, courseId, classId, title, amount, dueDate });
    res.status(201).json({ message: 'Tạo khoản học phí mới thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const handlePayTuition = (req, res) => {
  try {
    const tuitionId = req.params.id || req.body.tuitionId;
    if (!tuitionId) {
      return res.status(400).json({ message: 'Thiếu mã khoản thu học phí.' });
    }
    const { amount, method, note } = req.body;
    const result = store.payTuition({
      tuitionId,
      amount,
      method,
      note,
      cashierId: req.user.id,
    });
    res.json({ message: 'Ghi nhận thu tiền thành công!', ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

router.post('/tuitions/:id/pay', requireRoles(ROLES.ACCOUNTANT, ROLES.ADMIN), handlePayTuition);
router.post('/tuitions/pay', requireRoles(ROLES.ACCOUNTANT, ROLES.ADMIN), handlePayTuition);
router.put('/tuitions/:id/pay', requireRoles(ROLES.ACCOUNTANT, ROLES.ADMIN), handlePayTuition);
router.put('/tuitions/pay', requireRoles(ROLES.ACCOUNTANT, ROLES.ADMIN), handlePayTuition);

router.get('/registrations/offerings', (req, res) => {
  res.json({ data: store.getOpenCourseOfferings() });
});

router.post('/registrations/offerings', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { courseCode, courseName, credits, teacherName, schedule, room, capacity } = req.body;
    const item = store.createCourseOffering({ courseCode, courseName, credits, teacherName, schedule, room, capacity });
    res.status(201).json({ message: 'Mở học phần đăng ký mới thành công!', data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/registrations/my', (req, res) => {
  const studentId = req.user.id;
  const myRegs = store.getStudentRegistrations(studentId);
  res.json({ data: myRegs });
});

router.post('/registrations/register', (req, res) => {
  const { offeringId } = req.body;
  if (!offeringId) {
    return res.status(400).json({ message: 'Vui lòng chọn học phần để đăng ký.' });
  }

  try {
    const result = store.registerCourse({
      studentId: req.user.id,
      offeringId,
    });
    res.json({ message: 'Đăng ký học phần thành công!', ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/registrations/:id', (req, res) => {
  try {
    const result = store.cancelRegistration({
      studentId: req.user.id,
      registrationId: req.params.id,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/requests', (req, res) => {
  const isStudent = req.user.roles.includes(ROLES.STUDENT) && !req.user.roles.includes(ROLES.ADMIN) && !req.user.roles.includes(ROLES.TRAINING_MANAGER);
  const filterId = isStudent ? req.user.id : null;
  const list = store.getStudentRequests(filterId);
  res.json({ data: list });
});

router.post('/requests', (req, res) => {
  const { type, reason, urgency } = req.body;
  if (!type || !reason) {
    return res.status(400).json({ message: 'Vui lòng chọn loại giấy tờ và nêu rõ lý do.' });
  }

  try {
    const reqItem = store.createStudentRequest({
      studentId: req.user.id,
      type,
      reason,
      urgency,
    });
    res.status(201).json({ message: 'Đã gửi yêu cầu một cửa thành công! Ban Đào tạo sẽ xử lý trong 24 giờ.', data: reqItem });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/requests/:id/review', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { status, reviewerNote } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Vui lòng chọn trạng thái phê duyệt (APPROVED hoặc REJECTED).' });
  }

  try {
    const updated = store.reviewStudentRequest({
      requestId: req.params.id,
      status,
      reviewerNote,
      reviewerId: req.user.id,
    });
    res.json({ message: 'Đã phê duyệt yêu cầu thành công!', data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// QUẢN LÝ ĐIỂM SỐ & BẢNG ĐIỂM (GRADEBOOK & TRANSCRIPT)
// =========================================================================
router.get('/grades/class/:classId', requireRoles(ROLES.TEACHER, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const grades = store.getClassGradebook(req.params.classId);
  res.json({ data: grades });
});

router.get('/grades/transcript', (req, res) => {
  const transcript = store.getStudentTranscript(req.user.id);
  res.json({ data: transcript });
});

router.get('/grades/transcript/:studentId', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN, ROLES.TEACHER), (req, res) => {
  const transcript = store.getStudentTranscript(req.params.studentId);
  res.json({ data: transcript });
});

router.post('/grades/update', requireRoles(ROLES.TEACHER, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  try {
    const { classId, studentId, attendance, midterm, finalExam } = req.body;
    const updated = store.updateGradeRecord({
      classId,
      studentId,
      attendance: Number(attendance),
      midterm: Number(midterm),
      finalExam: Number(finalExam),
      teacherId: req.user.id,
    });
    res.json({ message: 'Cập nhật điểm thành công!', data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// QUẢN TRỊ DỮ LIỆU: LÀM SẠCH / NẠP DỮ LIỆU MẪU (DATA SEED / CLEAR)
// =========================================================================
router.post('/system/clear-sample-data', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  store.clearAllSampleData();
  res.json({ message: 'Toàn bộ dữ liệu mẫu đã được làm sạch! Danh sách các bảng hiện đang trống để người dùng nhập mới.' });
});

router.post('/system/seed-sample-data', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  store.seedSampleData();
  res.json({ message: 'Đã nạp lại dữ liệu mẫu thử nghiệm thành công!' });
});

module.exports = router;

