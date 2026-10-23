const express = require('express');
const store = require('../data/store');
const { ROLES } = require('../data/roles');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Lấy danh sách thời khóa biểu (S4-04 & S4-05)
router.get('/', (req, res) => {
  const { classId, teacherId, date } = req.query;

  let list = store.schedules;
  if (classId) {
    list = list.filter(s => s.classId === classId);
  }
  if (teacherId) {
    list = list.filter(s => s.teacherId === teacherId);
  }
  if (date) {
    list = list.filter(s => s.date === date);
  }

  // Sắp xếp theo ngày tăng dần
  list = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  res.json({
    data: list,
    total: list.length,
    classes: store.classes,
  });
});

// Thêm buổi học đơn lẻ
router.post('/', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { classId, date, dayOfWeek, shift, room, teacherId, topic } = req.body;
  if (!classId || !date || !shift || !room) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin: Lớp học, Ngày học, Ca học và Phòng học.' });
  }

  try {
    const session = store.createScheduleItem({ classId, date, dayOfWeek, shift, room, teacherId, topic });
    res.json({ message: 'Tạo buổi học thành công!', session });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S4-01 & S4-02: Tự động sinh lịch học theo mẫu lặp & Cảnh báo trùng lịch
router.post('/generate', requireRoles(ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { classId, startDate, daysOfWeek, shift, room, totalSessions } = req.body;

  if (!classId || !startDate || !daysOfWeek || !shift || !room) {
    return res.status(400).json({
      message: 'Vui lòng điền đầy đủ các thông tin: Lớp học, Ngày bắt đầu, Các thứ trong tuần, Ca học và Phòng học.',
    });
  }

  try {
    const result = store.generateSchedule({
      classId,
      startDate,
      daysOfWeek,
      shift,
      room,
      totalSessions: Number(totalSessions) || 15,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S4-02: Kiểm tra xung đột lịch đơn lẻ
router.post('/check-conflict', (req, res) => {
  const { date, shift, room, teacherId } = req.body;
  const conflict = store.checkScheduleConflict({ date, shift, room, teacherId });
  res.json(conflict);
});

// S4-07: Điểm danh học viên theo buổi học
router.post('/:id/attendance', requireRoles(ROLES.TEACHER, ROLES.ASSISTANT, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  const { attendanceRecords } = req.body;
  if (!attendanceRecords) {
    return res.status(400).json({ message: 'Dữ liệu điểm danh không hợp lệ.' });
  }

  try {
    const updatedSession = store.markAttendance(req.params.id, attendanceRecords);
    res.json({
      message: 'Điểm danh buổi học thành công!',
      session: updatedSession,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
