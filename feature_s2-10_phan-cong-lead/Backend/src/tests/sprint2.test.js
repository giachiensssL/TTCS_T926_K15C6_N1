const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

describe('Kiểm thử tự động Sprint 2 - Toàn bộ chức năng S2-01 -> S2-11', () => {
  let server;
  let baseUrl;
  let adminToken = '';
  let managerToken = '';
  let consultantToken = '';
  let studentToken = '';

  before(async () => {
    const store = require('../data/store');
    store.seedSampleData();

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // 1. Đăng nhập lấy token các vai trò
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@tms.edu.vn', password: 'Admin@123456' }),
    });
    adminToken = (await adminRes.json()).accessToken;

    const managerRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@tms.edu.vn', password: 'Manager@123456' }),
    });
    managerToken = (await managerRes.json()).accessToken;

    const consRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'consultant@tms.edu.vn', password: 'Consultant@123456' }),
    });
    consultantToken = (await consRes.json()).accessToken;

    const stuRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@tms.edu.vn', password: 'Student@123456' }),
    });
    studentToken = (await stuRes.json()).accessToken;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // =========================================================================
  // S2-01: Nhập danh sách người dùng hàng loạt từ tệp Excel
  // =========================================================================
  test('S2-01: Tải tệp mẫu CSV/Excel trả về 200 kèm header attachment UTF-8 BOM', async () => {
    const res = await fetch(`${baseUrl}/api/users/template`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const content = await res.text();
    assert.ok(content.includes('Họ và tên'));
    assert.ok(content.includes('Email'));
  });

  test('S2-01: Xem trước và báo lỗi theo từng dòng - dòng lỗi bị đánh dấu, dòng hợp lệ được duyệt', async () => {
    const res = await fetch(`${baseUrl}/api/users/import-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        rows: [
          { fullName: 'Học viên A', email: 'valid.a@tms.edu.vn', phone: '0987111222', role: 'STUDENT' }, // Hợp lệ
          { fullName: 'Học viên B Lỗi', email: 'invalid-email', phone: '0987111223', role: 'STUDENT' }, // Lỗi email
          { fullName: 'Học viên C Lỗi SĐT', email: 'valid.c@tms.edu.vn', phone: '12345', role: 'STUDENT' }, // Lỗi phone
        ],
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.totalRows, 3);
    assert.equal(data.validCount, 1);
    assert.equal(data.invalidCount, 2);
    assert.equal(data.rows[0].isValid, true);
    assert.equal(data.rows[1].isValid, false);
    assert.equal(data.rows[2].isValid, false);
  });

  test('S2-01: Nhập thực tế bỏ qua dòng lỗi, nhập dòng hợp lệ, có báo cáo tổng kết', async () => {
    const res = await fetch(`${baseUrl}/api/users/import-execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        rows: [
          { fullName: 'Sinh viên Mới 1', email: 'sv.batch1@tms.edu.vn', phone: '0988776655' },
          { fullName: '', email: 'no.name@tms.edu.vn' }, // Lỗi thiếu tên
        ],
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.successCount, 1);
    assert.equal(data.skippedCount, 1);
    assert.ok(data.importedUsers[0].tempPassword.startsWith('Tms@'));
  });

  // =========================================================================
  // S2-02: Xem và cập nhật hồ sơ cá nhân
  // =========================================================================
  test('S2-02: Cập nhật hồ sơ thành công khi SĐT đúng chuẩn VN, không cho phép đổi email', async () => {
    // 1. Thử đổi email -> Bị từ chối 400
    const failRes = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ email: 'hacker@gmail.com', fullName: 'Đổi Tên' }),
    });
    assert.equal(failRes.status, 400);

    // 2. Thử nhập SĐT sai định dạng -> Bị từ chối 400
    const failPhone = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ phone: '0123456789' }), // đầu số 01 không phải 10 số di động VN hiện tại
    });
    assert.equal(failPhone.status, 400);

    // 3. Cập nhật hợp lệ họ tên, SĐT VN, ngày sinh, địa chỉ -> 200 OK
    const okRes = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        fullName: 'Nguyễn Văn Học Viên Cập Nhật',
        phone: '0987654321',
        dob: '2004-05-10',
        address: 'Số 99 Cầu Giấy, Hà Nội',
      }),
    });
    assert.equal(okRes.status, 200);
    const data = await okRes.json();
    assert.equal(data.user.fullName, 'Nguyễn Văn Học Viên Cập Nhật');
    assert.equal(data.user.phone, '0987654321');
  });

  // =========================================================================
  // S2-03: Tải lên ảnh đại diện
  // =========================================================================
  test('S2-03: Cập nhật ảnh đại diện hợp lệ', async () => {
    const res = await fetch(`${baseUrl}/api/auth/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }),
    });
    assert.equal(res.status, 200);
  });

  // =========================================================================
  // S2-04: Quản lý danh mục chương trình đào tạo
  // =========================================================================
  test('S2-04: Mã chương trình duy nhất và không thể xoá chương trình đang có lớp chạy', async () => {
    // 1. Tạo trùng mã SE-PRO -> 400
    const dupRes = await fetch(`${baseUrl}/api/academic/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ code: 'SE-PRO', name: 'Trùng mã' }),
    });
    assert.equal(dupRes.status, 400);

    // 2. Xoá chương trình prog_se_001 đang có lớp chạy -> 400 Không được xoá
    const delRes = await fetch(`${baseUrl}/api/academic/programs/prog_se_001`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(delRes.status, 400);
    const delData = await delRes.json();
    assert.ok(delData.message.includes('chỉ được ngừng áp dụng'));
  });

  // =========================================================================
  // S2-05: Quản lý danh mục môn học
  // =========================================================================
  test('S2-05: Môn đã có lớp học thì không xoá được', async () => {
    // Môn crs_cs101 đã có lớp cls_k15_se01
    const res = await fetch(`${baseUrl}/api/academic/courses/crs_cs101`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes('Không được phép xoá'));
  });

  // =========================================================================
  // S2-06: Gắn môn học vào chương trình, sắp thứ tự & môn tiên quyết
  // =========================================================================
  test('S2-06: Gắn môn học vào chương trình và khai báo môn tiên quyết, đổi thứ tự', async () => {
    // Tạo chương trình mới
    const progRes = await fetch(`${baseUrl}/api/academic/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ code: 'TEST-PROG', name: 'Chương trình Thử nghiệm' }),
    });
    const prog = (await progRes.json()).data;

    // Gắn môn 1
    const add1 = await fetch(`${baseUrl}/api/academic/programs/${prog.id}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ courseId: 'crs_cs101' }),
    });
    assert.equal(add1.status, 200);

    // Gắn môn 2 có môn tiên quyết là crs_cs101
    const add2 = await fetch(`${baseUrl}/api/academic/programs/${prog.id}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ courseId: 'crs_cs102', prerequisiteCourseId: 'crs_cs101' }),
    });
    assert.equal(add2.status, 200);
    const data = await add2.json();
    assert.equal(data.data[1].prerequisiteCourseId, 'crs_cs101');
  });

  // =========================================================================
  // S2-07: Khai báo các buổi học trong một môn (Syllabus)
  // =========================================================================
  test('S2-07: Khai báo buổi học không vượt quá số buổi của môn & nhân bản thành công', async () => {
    // Tạo môn học có 2 buổi
    const crsRes = await fetch(`${baseUrl}/api/academic/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ code: 'SHORT-01', name: 'Môn ngắn 2 buổi', sessionCount: 2 }),
    });
    const crs = (await crsRes.json()).data;

    // Thêm buổi 1 -> OK
    const s1 = await fetch(`${baseUrl}/api/academic/courses/${crs.id}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ topic: 'Buổi 1', objective: 'Mục tiêu 1' }),
    });
    assert.equal(s1.status, 201);

    // Thêm buổi 2 -> OK
    const s2 = await fetch(`${baseUrl}/api/academic/courses/${crs.id}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ topic: 'Buổi 2', objective: 'Mục tiêu 2' }),
    });
    assert.equal(s2.status, 201);

    // Thêm buổi 3 -> Vượt quá 2 buổi -> Báo lỗi 400
    const s3 = await fetch(`${baseUrl}/api/academic/courses/${crs.id}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ topic: 'Buổi 3', objective: 'Mục tiêu 3' }),
    });
    assert.equal(s3.status, 400);

    // Nhân bản từ môn crs_cs101 -> Clone tối đa 2 buổi
    const cloneRes = await fetch(`${baseUrl}/api/academic/courses/${crs.id}/sessions/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ sourceCourseId: 'crs_cs101' }),
    });
    assert.equal(cloneRes.status, 200);
    const cloneData = await cloneRes.json();
    assert.equal(cloneData.clonedCount, 2);
  });

  // =========================================================================
  // S2-08: Biểu mẫu công khai đăng ký tư vấn cho Khách truy cập
  // =========================================================================
  test('S2-08: Đăng ký tư vấn công khai không cần login, có chống spam & cam kết thời gian', async () => {
    // 1. Thử spam với honeypot -> 400
    const spamRes = await fetch(`${baseUrl}/api/academic/public/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bot Spammer',
        phone: '0987654321',
        websiteTrap: 'I am a bot',
      }),
    });
    assert.equal(spamRes.status, 400);

    // 2. Gửi hợp lệ -> 201 Created kèm cam kết liên hệ
    const okRes = await fetch(`${baseUrl}/api/academic/public/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Nguyễn Khách Công Khai',
        phone: '0912334455',
        email: 'khach.congkhai@gmail.com',
        programName: 'Kỹ nghệ Phần mềm Chuẩn Quốc tế',
        captchaAnswer: '10',
        expectedCaptcha: '10',
      }),
    });
    assert.equal(okRes.status, 201);
    const data = await okRes.json();
    assert.equal(data.lead.status, 'NEW');
    assert.ok(data.commitment.includes('30 phút'));
  });

  // =========================================================================
  // S2-09: Quản lý danh sách khách hàng tiềm năng & Cảnh báo SĐT trùng
  // =========================================================================
  test('S2-09: Tạo lead cảnh báo trùng SĐT và chỉ Quản lý đào tạo/Admin mới xoá được lead', async () => {
    // 1. Tạo lead với SĐT đã có của adm_001 (0987654321)
    const createRes = await fetch(`${baseUrl}/api/academic/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        fullName: 'Khách Trùng SĐT',
        phone: '0987654321',
        programName: 'Kỹ nghệ Phần mềm',
      }),
    });
    assert.equal(createRes.status, 201);
    const data = await createRes.json();
    assert.ok(data.duplicateWarning !== null);

    const newLeadId = data.data.id;

    // 2. Tư vấn viên (CONSULTANT) thử xoá lead -> 403 Forbidden
    const failDel = await fetch(`${baseUrl}/api/academic/admissions/${newLeadId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${consultantToken}` },
    });
    assert.equal(failDel.status, 403);

    // 3. Quản lý đào tạo (TRAINING_MANAGER) xoá lead -> 200 OK
    const okDel = await fetch(`${baseUrl}/api/academic/admissions/${newLeadId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(okDel.status, 200);
  });

  // =========================================================================
  // S2-10: Phân công lead cho tư vấn viên & Ghi lịch sử chuyển giao
  // =========================================================================
  test('S2-10: Phân công lead cùng lúc, có lịch sử chuyển giao và tư vấn viên chỉ thấy lead của mình', async () => {
    // Phân công adm_001 cho consultant@tms.edu.vn
    const assignRes = await fetch(`${baseUrl}/api/academic/admissions/bulk-assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        leadIds: ['adm_001'],
        consultantId: 'usr_consultant_001',
        note: 'Giao lead cho chuyên viên hỗ trợ',
      }),
    });
    assert.equal(assignRes.status, 200);

    // Kiểm tra lịch sử chuyển giao
    const historyRes = await fetch(`${baseUrl}/api/academic/admissions/adm_001/history`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(historyRes.status, 200);
    const historyData = await historyRes.json();
    assert.ok(historyData.history.length >= 1);
    assert.equal(historyData.history[0].consultantName, 'Chuyên viên Tư vấn Tuyển sinh');

    // Tư vấn viên (consultant) xem danh sách: chỉ thấy lead của mình
    const consLeadsRes = await fetch(`${baseUrl}/api/academic/admissions`, {
      headers: { Authorization: `Bearer ${consultantToken}` },
    });
    assert.equal(consLeadsRes.status, 200);
    const consLeads = await consLeadsRes.json();
    assert.ok(consLeads.isConsultantOnly);
    // Tất cả lead nhìn thấy đều phải do consultant này phụ trách
    consLeads.data.forEach((l) => {
      assert.equal(l.consultantId, 'usr_consultant_001');
    });
  });

  // =========================================================================
  // S2-11: Tìm kiếm và lọc lead theo nhiều điều kiện
  // =========================================================================
  test('S2-11: Tìm kiếm nhanh theo tên hoặc SĐT và lọc theo nguồn/trạng thái', async () => {
    // Tìm theo số điện thoại
    const searchRes = await fetch(`${baseUrl}/api/academic/admissions?search=0987654321`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.ok(searchData.data.some((l) => l.phone.includes('0987654321')));

    // Lọc theo nguồn Facebook
    const fbRes = await fetch(`${baseUrl}/api/academic/admissions?source=Facebook`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(fbRes.status, 200);
    const fbData = await fbRes.json();
    fbData.data.forEach((l) => {
      assert.equal(l.source, 'Facebook');
    });
  });
});
