const express = require('express');
const { ROLES } = require('../data/roles');
const store = require('../data/store');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// S1-05 Minh hoạ: Quản lý học phí (Chỉ Kế toán & Admin được phép)
// Giảng viên tuyệt đối không thể sửa học phí
router.put('/tuition/update', requireRoles(ROLES.ACCOUNTANT, ROLES.ADMIN), (req, res) => {
  res.json({
    success: true,
    message: 'Cập nhật thông tin học phí thành công.',
  });
});

// S1-05 Minh hoạ: Quản lý điểm (Chỉ Giảng viên, Quản lý đào tạo & Admin được phép)
// Kế toán tuyệt đối không thể sửa điểm
router.put('/grades/update', requireRoles(ROLES.TEACHER, ROLES.TRAINING_MANAGER, ROLES.ADMIN), (req, res) => {
  res.json({
    success: true,
    message: 'Cập nhật bảng điểm học viên thành công.',
  });
});

// S1-11: Nhật ký thao tác nhạy cảm (Audit Logs)
router.get('/audit-logs', requireRoles(ROLES.ADMIN), (req, res) => {
  res.json({
    data: store.auditLogs,
    total: store.auditLogs.length,
  });
});

module.exports = router;
