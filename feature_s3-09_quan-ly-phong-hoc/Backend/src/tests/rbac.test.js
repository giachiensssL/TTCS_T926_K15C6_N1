const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

describe('Kiểm thử tự động Sprint 1 - Xác thực và Phân quyền RBAC (S1-01 -> S1-10)', () => {
  let server;
  let baseUrl;
  let adminToken = '';
  let teacherToken = '';
  let accountantToken = '';

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // 1. Đăng nhập lấy token cho 3 vai trò: Admin, Giảng viên, Kế toán
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@tms.edu.vn', password: 'Admin@123456' }),
    });
    const adminData = await adminRes.json();
    adminToken = adminData.accessToken;

    const teacherRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@tms.edu.vn', password: 'Teacher@123456' }),
    });
    const teacherData = await teacherRes.json();
    teacherToken = teacherData.accessToken;

    const accRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'accountant@tms.edu.vn', password: 'Accountant@123456' }),
    });
    const accData = await accRes.json();
    accountantToken = accData.accessToken;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('S1-01: Sai mật khẩu hiển thị thông báo chung và không tiết lộ email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@tms.edu.vn', password: 'WrongPassword999!' }),
    });
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.message, 'Email hoặc mật khẩu không đúng.');
  });

  test('S1-05: Giảng viên (TEACHER) KHÔNG THỂ sửa học phí -> Trả về 403 bằng tiếng Việt', async () => {
    const res = await fetch(`${baseUrl}/api/tuition/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify({ amount: 5000000 }),
    });
    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.code, 'AUTH_FORBIDDEN');
    assert.equal(data.message, 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ Quản trị viên.');
  });

  test('S1-05: Kế toán (ACCOUNTANT) KHÔNG THỂ sửa bảng điểm -> Trả về 403 bằng tiếng Việt', async () => {
    const res = await fetch(`${baseUrl}/api/grades/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accountantToken}`,
      },
      body: JSON.stringify({ studentId: 'usr_student_001', score: 10 }),
    });
    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.code, 'AUTH_FORBIDDEN');
    assert.equal(data.message, 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ Quản trị viên.');
  });

  test('S1-05: Kế toán (ACCOUNTANT) ĐƯỢC PHÉP cập nhật học phí -> 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/tuition/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accountantToken}`,
      },
      body: JSON.stringify({ amount: 5000000 }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
  });

  test('S1-05: Giảng viên (TEACHER) ĐƯỢC PHÉP cập nhật bảng điểm -> 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/grades/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify({ studentId: 'usr_student_001', score: 9.5 }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
  });

  test('S1-05: Quản trị hệ thống (ADMIN) có quyền trên các module quản trị người dùng', async () => {
    const res = await fetch(`${baseUrl}/api/users?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(data.data));
  });

  test('S1-09: Quản trị viên KHÔNG THỂ tự thu hồi vai trò ADMIN của chính mình', async () => {
    const res = await fetch(`${baseUrl}/api/users/usr_admin_001/roles/ADMIN`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.message, 'Bạn không thể tự thu hồi vai trò Quản trị viên (ADMIN) của chính mình.');
  });

  test('S1-10: Khoá tài khoản bắt buộc phải có lý do', async () => {
    const res = await fetch(`${baseUrl}/api/users/usr_teacher_001/lock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: '' }),
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.code, 'LOCK_REASON_REQUIRED');
    assert.equal(data.message, 'Bắt buộc nhập lý do khoá tài khoản.');
  });
});
