const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

describe('Kiểm thử tự động Sprint 3 - Toàn bộ chức năng S3-01 -> S3-09', () => {
  let server;
  let baseUrl;
  let adminToken = '';
  let managerToken = '';
  let consultantToken = '';
  let teacherToken = '';
  let testLeadId = '';
  let testProgramId = '';
  let testCourseId = '';
  let testClassId = '';
  let testRoomId = '';
  let createdStudentCode = '';
  let createdStudentId = '';
  let teacherUserId = '';
  let assistantUserId = '';

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

    // Đăng nhập lấy token các vai trò
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

    const teacherRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@tms.edu.vn', password: 'Teacher@123456' }),
    });
    teacherToken = (await teacherRes.json()).accessToken;

    // Chuẩn bị môn học và chương trình mẫu cho Sprint 3
    const progRes = await fetch(`${baseUrl}/api/academic/programs`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const progs = (await progRes.json()).data;
    if (progs.length > 0) {
      testProgramId = progs[0].id;
    }

    const crsRes = await fetch(`${baseUrl}/api/academic/courses`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const crss = (await crsRes.json()).data;
    if (crss.length > 0) {
      testCourseId = crss[0].id;
    }
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // =========================================================================
  // S3-01: BẢNG PHỄU THEO TRẠNG THÁI (KANBAN) VÀ RÀNG BUỘC TỪ CHỐI
  // =========================================================================
  test('S3-01: Tạo lead mới để kiểm thử chu trình bảng phễu', async () => {
    const res = await fetch(`${baseUrl}/api/academic/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        fullName: 'Nguyễn Văn Phễu',
        phone: '0912345678',
        email: 'nguyenvanpheu@example.com',
        source: 'FACEBOOK',
        programName: 'Lập trình Fullstack Web Developer',
        note: 'Quan tâm khoá tối',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.data.id);
    testLeadId = data.data.id;
  });

  test('S3-01: Cập nhật trạng thái phễu sang CONTACTED, ghi nhận lịch sử statusHistory', async () => {
    const res = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/status-funnel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        status: 'CONTACTED',
        note: 'Đã gọi điện lần đầu',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.status, 'CONTACTED');
    assert.ok(data.data.statusHistory.length >= 1);
  });

  test('S3-01: Chuyển sang Từ chối (CLOSED_LOST) BẮT BUỘC có lý do từ chối - thiếu lý do phải báo lỗi 400', async () => {
    const res = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/status-funnel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        status: 'CLOSED_LOST',
        lossReason: '', // Không cung cấp lý do
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /bắt buộc phải chọn lý do/i);
  });

  test('S3-01: Chuyển sang CLOSED_LOST thành công khi cung cấp lý do từ chối hợp lệ', async () => {
    const res = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/status-funnel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        status: 'CLOSED_LOST',
        lossReason: 'Học phí vượt quá ngân sách',
        note: 'Khách hàng hẹn xem xét khoá sau',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.status, 'CLOSED_LOST');
    assert.equal(data.data.lossReason, 'Học phí vượt quá ngân sách');
    assert.ok(data.data.statusHistory.some(h => h.toStatus === 'CLOSED_LOST' && h.reason === 'Học phí vượt quá ngân sách'));
  });

  test('S3-01: Khách đổi ý quay lại tư vấn -> chuyển sang CLOSED_WON (Chốt)', async () => {
    const res = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/status-funnel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        status: 'CLOSED_WON',
        note: 'Khách hàng đã đồng ý đăng ký học',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.status, 'CLOSED_WON');
  });

  // =========================================================================
  // S3-02: NHẬT KÝ CHĂM SÓC & ĐẶT LỊCH NHẮC GỌI LẠI
  // =========================================================================
  test('S3-02: Báo lỗi nếu loại tương tác không hợp lệ (không phải CALL/MESSAGE/MEETING)', async () => {
    const res = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/care-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        type: 'INVALID_TYPE',
        content: 'Thử gửi tin nhắn',
      }),
    });

    assert.equal(res.status, 400);
  });

  test('S3-02: Ghi nhật ký tương tác thành công và đặt ngày nhắc gọi lại', async () => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/care-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        type: 'CALL',
        content: 'Đã tư vấn lộ trình học kỳ 1 và giải thích chính sách học bổng',
        remindAt: nextWeek,
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.log.id);
    assert.equal(data.log.type, 'CALL');
    assert.ok(data.lead.remindAt);
    assert.ok(data.lead.careLogs.length >= 1);
  });

  // =========================================================================
  // S3-03: CHUYỂN LEAD ĐÃ CHỐT THÀNH HỒ SƠ HỌC VIÊN
  // =========================================================================
  test('S3-03: Chuyển lead sang hồ sơ học viên: sinh mã HV2026-XXX, tạo tài khoản và khoá lead', async () => {
    const res = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/convert-to-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        entryLevel: 'Đại học chuyên ngành CNTT',
        note: 'Chuyển thẳng từ khách chốt',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.student.studentCode.startsWith('HV2026-'));
    assert.equal(data.lead.status, 'ENROLLED');
    assert.equal(data.lead.isLocked, true);
    assert.ok(data.account.email);

    createdStudentCode = data.student.studentCode;
    createdStudentId = data.student.id;
  });

  test('S3-03: Chặn sửa trạng thái phễu hoặc chuyển đổi lại khi lead đã bị khoá', async () => {
    // 1. Thử đổi trạng thái phễu
    const res1 = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/status-funnel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({
        status: 'NEW',
      }),
    });
    assert.equal(res1.status, 400);

    // 2. Thử convert lại lần nữa
    const res2 = await fetch(`${baseUrl}/api/academic/admissions/${testLeadId}/convert-to-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consultantToken}`,
      },
      body: JSON.stringify({}),
    });
    assert.equal(res2.status, 400);
  });

  // =========================================================================
  // S3-04: QUẢN LÝ HỒ SƠ HỌC VIÊN
  // =========================================================================
  test('S3-04: Tìm kiếm và lọc hồ sơ học viên theo mã học viên', async () => {
    const res = await fetch(`${baseUrl}/api/academic/students?search=${createdStudentCode}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.length >= 1);
    assert.equal(data.data[0].studentCode, createdStudentCode);
  });

  test('S3-04: Xem chi tiết hồ sơ học viên bao gồm lớp đang học và lịch sử', async () => {
    const res = await fetch(`${baseUrl}/api/academic/students/${createdStudentId}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.id, createdStudentId);
    assert.ok(Array.isArray(data.data.currentClasses));
    assert.ok(Array.isArray(data.data.pastClasses));
  });

  test('S3-04: Cập nhật thông tin hồ sơ học viên với kiểm tra số điện thoại Việt Nam', async () => {
    // Thử số điện thoại sai định dạng
    const failRes = await fetch(`${baseUrl}/api/academic/students/${createdStudentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        phone: '12345678', // Không hợp lệ
      }),
    });
    assert.equal(failRes.status, 400);

    // Cập nhật hợp lệ
    const okRes = await fetch(`${baseUrl}/api/academic/students/${createdStudentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        fullName: 'Nguyễn Văn Phễu (Đã sửa)',
        phone: '0988776655',
        address: '456 Đường ABC, Quận Cầu Giấy, Hà Nội',
        entryLevel: 'Người đi làm chuyển ngành',
      }),
    });

    assert.equal(okRes.status, 200);
    const data = await okRes.json();
    assert.equal(data.data.fullName, 'Nguyễn Văn Phễu (Đã sửa)');
    assert.equal(data.data.phone, '0988776655');
  });

  // =========================================================================
  // S3-09: QUẢN LÝ PHÒNG HỌC & LIÊN KẾT PHÒNG HỌC TRỰC TUYẾN
  // =========================================================================
  test('S3-09: Tạo phòng học vật lý mới', async () => {
    const res = await fetch(`${baseUrl}/api/academic/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        code: 'ROOM-TEST-S3',
        name: 'Phòng Lab Chuyên đề S3',
        type: 'PHYSICAL',
        capacity: 25, // Sức chứa 25
        building: 'Toà Nhà A',
        equipment: 'Máy chiếu, 30 PC cấu hình cao',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.data.id);
    assert.equal(data.data.capacity, 25);
    testRoomId = data.data.id;
  });

  test('S3-09: Lấy danh sách phòng học thành công', async () => {
    const res = await fetch(`${baseUrl}/api/academic/rooms`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.some(r => r.id === testRoomId));
  });

  // =========================================================================
  // S3-05: MỞ LỚP HỌC MỚI TỪ CHƯƠNG TRÌNH ĐÀO TẠO & CẢNH BÁO SỨC CHỨA PHÒNG
  // =========================================================================
  test('S3-05: Mở lớp học mới thành công, sao chép môn học và cảnh báo khi sĩ số vượt sức chứa phòng', async () => {
    const res = await fetch(`${baseUrl}/api/academic/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        code: 'CLS-S3-TEST',
        name: 'Lớp Lập Trình Chuyên Sâu K15',
        programId: testProgramId,
        startDate: '2026-11-01',
        endDate: '2027-05-01',
        maxCapacity: 35, // Sĩ số 35 > sức chứa phòng 25
        mode: 'HYBRID',
        roomId: testRoomId,
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.data.id);
    assert.equal(data.data.status, 'PLANNING'); // Vòng đời ban đầu: PLANNING (Chuẩn bị)
    assert.ok(data.data.courses.length >= 1); // Danh sách môn được sao chép
    assert.ok(data.capacityWarning); // Cảnh báo S3-09 sĩ số 35 > 25
    testClassId = data.data.id;
  });

  test('S3-05: Không được mở lớp trùng mã lớp đã có', async () => {
    const res = await fetch(`${baseUrl}/api/academic/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        code: 'CLS-S3-TEST', // Trùng
        name: 'Lớp Trùng Mã',
        programId: testProgramId,
      }),
    });

    assert.equal(res.status, 400);
  });

  test('S3-05: Cập nhật vòng đời lớp học: Chuẩn bị -> Đang học', async () => {
    const res = await fetch(`${baseUrl}/api/academic/classes/${testClassId}/lifecycle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        status: 'ACTIVE',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.status, 'ACTIVE');
  });

  // =========================================================================
  // S3-06: GHI DANH HỌC VIÊN VÀO LỚP HỌC
  // =========================================================================
  test('S3-06: Ghi danh thành công học viên mới tạo vào lớp', async () => {
    const res = await fetch(`${baseUrl}/api/academic/classes/${testClassId}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        studentIds: [createdStudentId],
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.success);
    assert.equal(data.enrolledCount, 1);
    assert.equal(data.currentStudents, 1);
  });

  test('S3-06: Chặn ghi danh nếu học viên đã ở trong lớp đó', async () => {
    const res = await fetch(`${baseUrl}/api/academic/classes/${testClassId}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        studentIds: [createdStudentId],
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /đã có trong lớp/i);
  });

  // =========================================================================
  // S3-07: DANH SÁCH LỚP KÈM BỘ LỌC VÀ CHỈ SỐ NHANH
  // =========================================================================
  test('S3-07: Lấy danh sách lớp và kiểm tra các chỉ số nhanh (sĩ số, tiến độ buổi học)', async () => {
    const res = await fetch(`${baseUrl}/api/academic/classes?status=ACTIVE`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    const myClass = data.data.find(c => c.id === testClassId);
    assert.ok(myClass);
    assert.equal(myClass.currentCount, 1);
    assert.equal(myClass.maxCapacity, 35);
    assert.ok(myClass.totalSessions > 0);
    assert.ok(myClass.sessionProgressPercent !== undefined);
  });

  // =========================================================================
  // S3-08: PHÂN CÔNG GIẢNG VIÊN VÀ TRỢ GIẢNG CHO LỚP THEO TỪNG MÔN
  // =========================================================================
  test('S3-08: Lấy danh sách giảng viên và trợ giảng có sẵn trong hệ thống', async () => {
    const res = await fetch(`${baseUrl}/api/academic/instructors`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.teachers.length > 0);
    const targetTeacher = data.data.teachers.find(t => t.email === 'teacher@tms.edu.vn');
    teacherUserId = targetTeacher ? targetTeacher.id : data.data.teachers[0].id;
    if (data.data.assistants.length > 0) {
      assistantUserId = data.data.assistants[0].id;
    }
  });

  test('S3-08: Chặn phân công người không có vai trò TEACHER làm giảng viên chính', async () => {
    // Dùng ID của Quản lý đào tạo (không có role TEACHER)
    const usersRes = await fetch(`${baseUrl}/api/academic/consultants`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const users = (await usersRes.json()).data;
    const nonTeacher = users.find(u => !u.roles.includes('TEACHER'));
    const nonTeacherId = nonTeacher ? nonTeacher.id : users[0].id;

    // Lấy courseId đầu tiên của lớp
    const classRes = await fetch(`${baseUrl}/api/academic/classes`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const cls = (await classRes.json()).data.find(c => c.id === testClassId);
    const firstCourse = cls.courses[0];

    const res = await fetch(`${baseUrl}/api/academic/classes/${testClassId}/courses/${firstCourse.courseId}/instructors`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        teacherId: nonTeacherId,
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /vai trò Giảng viên/i);
  });

  test('S3-08: Phân công giảng viên chính và trợ giảng thành công cho môn học trong lớp', async () => {
    const classRes = await fetch(`${baseUrl}/api/academic/classes`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const cls = (await classRes.json()).data.find(c => c.id === testClassId);
    const firstCourse = cls.courses[0];

    const res = await fetch(`${baseUrl}/api/academic/classes/${testClassId}/courses/${firstCourse.courseId}/instructors`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        teacherId: teacherUserId,
        assistantIds: assistantUserId ? [assistantUserId] : [],
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.success);
    assert.equal(data.course.teacherId, teacherUserId);
    if (assistantUserId) {
      assert.ok(data.course.assistantIds.includes(assistantUserId));
    }
  });

  test('S3-08: Giảng viên chỉ thấy lớp học mà mình được phân công', async () => {
    const res = await fetch(`${baseUrl}/api/academic/classes`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.some(c => c.id === testClassId));
  });
});
