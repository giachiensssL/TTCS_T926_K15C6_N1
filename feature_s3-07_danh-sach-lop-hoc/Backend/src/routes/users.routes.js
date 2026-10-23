const express = require('express');
const store = require('../data/store');
const { ROLES } = require('../data/roles');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Tất cả các route quản lý người dùng yêu cầu đăng nhập
router.use(authenticateToken);

// S1-08: Danh sách người dùng, tìm kiếm & phân trang (Mặc định 20 dòng)
router.get('/', requireRoles(ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  const { search = '', role = '', status = '', page = 1, limit = 20 } = req.query;

  let filtered = store.users;

  // Tìm theo tên, email, số điện thoại
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  }

  // Lọc theo vai trò
  if (role.trim()) {
    filtered = filtered.filter(u => u.roles.includes(role.trim()));
  }

  // Lọc theo trạng thái (ACTIVE / LOCKED)
  if (status.trim()) {
    filtered = filtered.filter(u => u.status === status.trim());
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || 20);
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (pageNum - 1) * pageSize;
  const data = filtered.slice(startIndex, startIndex + pageSize).map(u => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    roles: u.roles,
    status: u.status,
    lockReason: u.lockReason,
    avatar: u.avatar,
    createdAt: u.createdAt,
  }));

  res.json({
    data,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages,
  });
});

// =========================================================================
// S2-01: TẢI TỆP MẪU EXCEL / CSV CHO NHẬP NGƯỜI DÙNG HÀNG LOẠT
// =========================================================================
router.get('/template', requireRoles(ROLES.ADMIN), (req, res) => {
  // UTF-8 BOM (\uFEFF) giúp Microsoft Excel hiển thị tiếng Việt có dấu chuẩn 100%
  const csvHeader = '\uFEFFHọ và tên,Email,Số điện thoại,Vai trò,Ngày sinh,Địa chỉ\n';
  const sampleRows = [
    'Nguyễn Văn An,an.nguyen@tms.edu.vn,0987123456,STUDENT,2004-01-15,Hà Nội\n',
    'Trần Thị Bích,bich.tran@tms.edu.vn,0912987654,STUDENT,2004-05-20,Đà Nẵng\n',
    'Lê Hoàng Cường,cuong.le@tms.edu.vn,0934567890,TEACHER,1992-09-10,TP Hồ Chí Minh\n',
  ].join('');

  const csvContent = csvHeader + sampleRows;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mau_nhap_nguoi_dung_tms.csv"');
  res.status(200).send(csvContent);
});

// =========================================================================
// S2-01: XEM TRƯỚC VÀ BÁO LỖI THEO TỪNG DÒNG TRƯỚC KHI NHẬP
// =========================================================================
router.post('/import-preview', requireRoles(ROLES.ADMIN), (req, res) => {
  const { rows } = req.body;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: 'Không có dữ liệu dòng nào để xem trước.' });
  }

  const existingBatchEmails = new Set();
  const evaluatedRows = rows.map((row, idx) =>
    store.validateImportUserRow(row, idx + 1, existingBatchEmails)
  );

  const validCount = evaluatedRows.filter(r => r.isValid).length;
  const invalidCount = evaluatedRows.length - validCount;

  res.json({
    totalRows: evaluatedRows.length,
    validCount,
    invalidCount,
    rows: evaluatedRows,
  });
});

// =========================================================================
// S2-01: THỰC HIỆN NHẬP DANH SÁCH - BỎ QUA DÒNG LỖI, NHẬP DÒNG HỢP LỆ
// =========================================================================
router.post('/import-execute', requireRoles(ROLES.ADMIN), (req, res) => {
  const { rows } = req.body;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: 'Vui lòng cung cấp danh sách dữ liệu cần nhập.' });
  }

  try {
    const result = store.batchImportUsers(rows, req.user.id);
    res.json({
      message: `Đã nhập thành công ${result.successCount} người dùng. Bỏ qua ${result.skippedCount} dòng lỗi.`,
      ...result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lấy chi tiết một người dùng
router.get('/:id', requireRoles(ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  const user = store.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  }

  // Lấy danh sách lớp học nếu là giảng viên / quản lý
  const assignedClasses = store.classes.filter(c => c.teacherId === user.id || c.managerId === user.id);

  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      status: user.status,
      lockReason: user.lockReason,
      avatar: user.avatar,
      createdAt: user.createdAt,
      assignedClasses,
    },
  });
});

// S1-08: Tạo tài khoản người dùng mới (Gửi email kèm mật khẩu tạm)
router.post('/', requireRoles(ROLES.ADMIN), (req, res) => {
  const { fullName, email, phone, roles } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập họ và tên.' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập email.' });
  }

  // Sinh mật khẩu tạm thời ngẫu nhiên: ví dụ Tms@982143
  const tempPassword = `Tms@${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    const newUser = store.createUser({
      fullName,
      email,
      phone,
      roles: Array.isArray(roles) && roles.length > 0 ? roles : [ROLES.STUDENT],
      password: tempPassword,
    });

    store.logAudit({
      actorId: req.user.id,
      action: 'USER_CREATED',
      targetId: newUser.id,
      details: `Tạo tài khoản ${newUser.email} với vai trò [${newUser.roles.join(', ')}]`,
    });

    // Giả lập gửi email kích hoạt tài khoản
    console.log(`[EMAIL DISPATCH] Gửi email kích hoạt tài khoản tới: ${newUser.email}, Mật khẩu tạm: ${tempPassword}`);

    res.status(201).json({
      message: 'Tạo tài khoản thành công. Email kích hoạt và mật khẩu tạm đã được gửi.',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        roles: newUser.roles,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
      tempPassword, // Trả về để admin có thể sao chép nhanh
      activationEmailSent: true,
    });
  } catch (err) {
    return res.status(400).json({
      code: 'USER_CREATION_FAILED',
      message: err.message,
    });
  }
});

// S1-08: Sửa thông tin tài khoản
router.put('/:id', requireRoles(ROLES.ADMIN), (req, res) => {
  const { fullName, phone, roles } = req.body;

  try {
    const updated = store.updateUser(req.params.id, { fullName, phone, roles });

    store.logAudit({
      actorId: req.user.id,
      action: 'USER_UPDATED',
      targetId: updated.id,
      details: `Cập nhật thông tin tài khoản ${updated.email}`,
    });

    res.json({
      message: 'Cập nhật thông tin thành công.',
      user: updated,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S1-09: Gán vai trò cho người dùng
router.post('/:id/roles', requireRoles(ROLES.ADMIN), (req, res) => {
  const { roleName } = req.body;

  if (!roleName) {
    return res.status(400).json({ message: 'Vui lòng chọn vai trò cần gán.' });
  }

  if (!Object.values(ROLES).includes(roleName)) {
    return res.status(400).json({ message: 'Vai trò không hợp lệ trong hệ thống.' });
  }

  try {
    const updated = store.assignRole(req.params.id, roleName, req.user.id);
    res.json({
      message: `Đã gán vai trò ${roleName} cho ${updated.fullName}.`,
      roles: updated.roles,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S1-09: Thu hồi vai trò khỏi người dùng (Không cho phép tự thu hồi ADMIN của chính mình)
router.delete('/:id/roles/:roleName', requireRoles(ROLES.ADMIN), (req, res) => {
  const { id, roleName } = req.params;

  try {
    const updated = store.revokeRole(id, roleName, req.user.id);
    res.json({
      message: `Đã thu hồi vai trò ${roleName} khỏi ${updated.fullName}.`,
      roles: updated.roles,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S1-10: Khoá tài khoản (Bắt buộc lý do, thu hồi phiên ngay lập tức, cảnh báo lớp phụ trách)
router.put('/:id/lock', requireRoles(ROLES.ADMIN), (req, res) => {
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      code: 'LOCK_REASON_REQUIRED',
      message: 'Bắt buộc nhập lý do khoá tài khoản.',
    });
  }

  try {
    const { user, teachingClasses } = store.lockUser(req.params.id, reason.trim(), req.user.id);

    let warningMessage = null;
    if (teachingClasses.length > 0) {
      warningMessage = `Cảnh báo: Nhân sự này đang phụ trách ${teachingClasses.length} lớp học (${teachingClasses.map(c => c.name).join(', ')}). Vui lòng tiến hành phân công người bàn giao công việc!`;
    }

    res.json({
      message: `Đã khoá tài khoản ${user.email} thành công. Toàn bộ phiên làm việc của người này đã bị thu hồi.`,
      warningMessage,
      teachingClasses,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        lockReason: user.lockReason,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// S1-10: Mở khoá tài khoản
router.put('/:id/unlock', requireRoles(ROLES.ADMIN), (req, res) => {
  try {
    const user = store.unlockUser(req.params.id, req.user.id);
    res.json({
      message: `Đã mở khoá tài khoản ${user.email} thành công.`,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
