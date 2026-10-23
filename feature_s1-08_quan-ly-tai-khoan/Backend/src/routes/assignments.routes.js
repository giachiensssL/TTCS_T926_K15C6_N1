const express = require('express');
const store = require('../data/store');
const { ROLES } = require('../data/roles');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// S5-06 & S5-10: Lấy danh sách bài tập / bài thi LMS
router.get('/', (req, res) => {
  const currentUserId = req.user.id;
  const isStudent = req.user.roles.includes(ROLES.STUDENT);
  const isPrivileged = req.user.roles.some(r => [ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER].includes(r));

  const assignmentsWithSubmissions = store.assignments.map(asm => {
    const submissions = store.submissions.filter(s => s.assignmentId === asm.id);
    let mySubmission = null;
    if (isStudent) {
      mySubmission = submissions
        .filter(s => s.studentId === currentUserId)
        .sort((a, b) => b.version - a.version)[0] || null;
    }

    // Bảo mật: Học sinh không xem trước được mã kích hoạt của bài thi kết thúc môn
    const safeAccessCode = isPrivileged ? asm.accessCode : (asm.type === 'FINAL_EXAM' ? undefined : asm.accessCode);

    return {
      ...asm,
      accessCode: safeAccessCode,
      submissionsCount: submissions.length,
      gradedCount: submissions.filter(s => s.status === 'GRADED').length,
      mySubmission,
    };
  });

  res.json({
    data: assignmentsWithSubmissions,
    total: assignmentsWithSubmissions.length,
  });
});

// S5-05: Giảng viên / Quản lý / Admin tạo bài tập & bài thi mới (hỗ trợ 15p, thi kết thúc học phần, trắc nghiệm, tự luận)
router.post('/', requireRoles(ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  const {
    classId,
    title,
    description,
    deadline,
    maxScore,
    rubric,
    type,
    durationMinutes,
    accessCode,
    isLocked,
    questionType,
    questions
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập tiêu đề bài kiểm tra / bài thi.' });
  }

  try {
    const newAsm = store.createAssignment({
      classId: classId || 'cls_k15_web01',
      title,
      description,
      deadline,
      maxScore,
      rubric,
      type: type || 'HOMEWORK',
      durationMinutes,
      accessCode,
      isLocked,
      questionType: questionType || 'HYBRID',
      questions: Array.isArray(questions) ? questions : [],
      teacherId: req.user.id,
    });

    res.status(201).json({
      message: 'Tạo và công bố đề thi / bài tập LMS thành công!',
      assignment: newAsm,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xem danh sách bài nộp của một bài tập / bài thi
router.get('/:id/submissions', (req, res) => {
  const submissions = store.submissions.filter(s => s.assignmentId === req.params.id);
  res.json({
    data: submissions,
    total: submissions.length,
  });
});

// Học viên nộp bài thi / bài tập (hỗ trợ trắc nghiệm, tự luận, giám sát vi phạm gian lận)
router.post('/:id/submit', (req, res) => {
  const { repoUrl, note, answers, violationCount, accessCodeEntered } = req.body;

  try {
    const sub = store.submitAssignment({
      assignmentId: req.params.id,
      studentId: req.user.id,
      repoUrl,
      note,
      answers,
      violationCount,
      accessCodeEntered,
    });

    res.json({
      message: `Nộp bài thi thành công! Hệ thống đã ghi nhận bài làm (Phiên bản v${sub.version}).`,
      submission: sub,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xác thực mã kích hoạt (dành cho học sinh trước khi vào làm bài thi kết thúc môn)
router.post('/:id/verify-access-code', (req, res) => {
  const { accessCode } = req.body;
  const asm = store.assignments.find(a => a.id === req.params.id);
  if (!asm) {
    return res.status(404).json({ message: 'Không tìm thấy bài thi.' });
  }

  if (asm.type !== 'FINAL_EXAM' || !asm.isLocked) {
    return res.json({ valid: true, message: 'Phòng thi đang mở, bạn có thể bắt đầu làm bài!' });
  }

  if (!accessCode || !accessCode.trim()) {
    return res.status(400).json({ valid: false, message: 'Vui lòng nhập mã kích hoạt do Giám thị cung cấp.' });
  }

  const isMatch = accessCode.trim().toUpperCase() === String(asm.accessCode).trim().toUpperCase();
  if (isMatch) {
    return res.json({ valid: true, message: 'Mã kích hoạt chính xác! Phòng thi đã sẵn sàng.' });
  } else {
    return res.status(400).json({ valid: false, message: 'Mã kích hoạt không đúng. Vui lòng kiểm tra lại với Giám thị.' });
  }
});

// Bật/tắt khóa phòng thi (chỉ Teacher, Admin, Training Manager)
router.post('/:id/toggle-lock', requireRoles(ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  try {
    const updated = store.toggleExamLock(req.params.id, req.body.isLocked);
    res.json({
      message: updated.isLocked ? 'Đã khóa phòng thi thành công! Học sinh cần mã kích hoạt để vào.' : 'Đã mở phòng thi tự do!',
      isLocked: updated.isLocked,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Gửi cảnh báo gian lận thời gian thực (Anti-cheat real-time report từ trình duyệt của học sinh)
router.post('/:id/cheat-alert', (req, res) => {
  const { violationType, details } = req.body;
  try {
    const alert = store.logCheatAlert({
      assignmentId: req.params.id,
      studentId: req.user.id,
      studentName: req.user.fullName,
      violationType: violationType || 'TAB_SWITCH',
      details: details || 'Học viên chuyển tab hoặc thoát toàn màn hình khi đang làm bài',
    });

    console.warn(`[ANTI-CHEAT ALERT] Học viên ${req.user.fullName} (${req.user.id}) vi phạm: ${alert.details}`);

    res.json({
      message: 'Cảnh báo vi phạm đã được ghi lại và thông báo tới Giảng viên giám sát!',
      alert,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lấy danh sách cảnh báo gian lận của bài thi (Dành cho Giảng viên, Admin, Quản lý)
router.get('/:id/cheat-alerts', requireRoles(ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  const logs = store.getCheatLogs(req.params.id);
  res.json({
    data: logs,
    total: logs.length,
  });
});

// Lấy toàn bộ cảnh báo gian lận trên hệ thống
router.get('/proctoring/cheat-alerts-all', requireRoles(ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  const logs = store.getCheatLogs();
  res.json({
    data: logs,
    total: logs.length,
  });
});

// Chấm điểm thủ công (Giảng viên / Admin)
router.post('/grade', requireRoles(ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  const { submissionId, score, feedback, requestResubmit } = req.body;

  if (!submissionId) {
    return res.status(400).json({ message: 'Vui lòng chọn bài nộp cần chấm.' });
  }

  try {
    const graded = store.gradeSubmission({
      submissionId,
      score,
      feedback: feedback || '',
      requestResubmit: Boolean(requestResubmit),
      teacherId: req.user.id,
    });

    res.json({
      message: requestResubmit ? 'Đã gửi yêu cầu làm lại cho học viên.' : 'Đã công bố điểm và nhận xét thành công!',
      submission: graded,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Chấm bài thông minh bằng AI (AI Semantic Grading)
router.post('/submissions/:id/ai-grade', requireRoles(ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  try {
    const graded = store.aiGradeSubmission({
      submissionId: req.params.id,
      teacherId: req.user.id,
    });

    res.json({
      message: 'AI đã phân tích bài làm, tự động tính điểm và sinh nhận xét sư phạm chi tiết!',
      submission: graded,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// AI tự động sinh đề thi theo môn học, dạng bài, số lượng câu (AI Exam Generator)
router.post('/ai-generate', requireRoles(ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  const { subject, type, mcCount = 4, essayCount = 1, difficulty = 'MEDIUM' } = req.body;

  // Ngân hàng tri thức phong phú theo môn học
  const knowledgeBank = {
    web: {
      subjectName: 'Phát triển Web Fullstack (HTML/CSS/JS, React, Node.js)',
      mc: [
        {
          prompt: 'Trong giao thức HTTP/HTTPS, mã trạng thái nào sau đây đại diện cho yêu cầu thành công và tài nguyên mới được tạo?',
          options: ['A. 200 OK', 'B. 201 Created', 'C. 204 No Content', 'D. 301 Moved Permanently'],
          correctAnswer: 'B',
          points: 2,
        },
        {
          prompt: 'Thuật toán reconciliation trong React sử dụng cấu trúc dữ liệu nào để tối ưu hoá việc cập nhật giao diện?',
          options: ['A. Virtual DOM', 'B. Shadow DOM', 'C. Real DOM Tree', 'D. AST (Abstract Syntax Tree)'],
          correctAnswer: 'A',
          points: 2,
        },
        {
          prompt: 'Middleware trong Express.js nhận vào các tham số tiêu chuẩn nào?',
          options: ['A. (req, res)', 'B. (req, res, next)', 'C. (data, callback)', 'D. (event, context)'],
          correctAnswer: 'B',
          points: 2,
        },
        {
          prompt: 'Kỹ thuật nào giúp ngăn ngừa lỗ hổng Cross-Site Request Forgery (CSRF)?',
          options: ['A. Anti-CSRF Token & SameSite Cookie', 'B. eval() code execution', 'C. CORS Allow All (*)', 'D. Disable HTTPS'],
          correctAnswer: 'A',
          points: 2,
        },
        {
          prompt: 'Hook nào trong React được sử dụng để thực hiện các hiệu ứng phụ (side effects) như gọi API hoặc đăng ký sự kiện?',
          options: ['A. useState', 'B. useEffect', 'C. useMemo', 'D. useContext'],
          correctAnswer: 'B',
          points: 2,
        },
      ],
      essay: [
        {
          prompt: 'Trình bày cơ chế hoạt động của Event Loop trong Node.js và giải thích sự khác nhau giữa Call Stack, MacroTask Queue và MicroTask Queue.',
          sampleAnswer: 'Event Loop quản lý các tác vụ bất đồng bộ. Call stack xử lý code đồng bộ. Khi stack rỗng, MicroTask Queue (Promise.then, process.nextTick) được ưu tiên xử lý trước MacroTask Queue (setTimeout, setInterval, I/O).',
          points: 2,
        },
        {
          prompt: 'Phân tích các giải pháp tối ưu hóa hiệu năng (Web Performance) khi tải một ứng dụng web React có dung lượng lớn.',
          sampleAnswer: 'Áp dụng Code Splitting (React.lazy, Suspense), tối ưu bundle size, nén gzip/brotli, tối ưu hình ảnh WebP, caching HTTP, và sử dụng CDN.',
          points: 2,
        },
      ],
    },
    database: {
      subjectName: 'Cơ sở Dữ liệu & Hệ quản trị SQL / NoSQL',
      mc: [
        {
          prompt: 'Ràng buộc khóa chính (PRIMARY KEY) trong bảng cơ sở dữ liệu có tính chất nào sau đây?',
          options: ['A. Cho phép trùng lặp', 'B. Duy nhất (UNIQUE) và Không được chứa giá trị NULL', 'C. Chỉ cho phép kiểu dữ liệu số', 'D. Tự động xoá dữ liệu'],
          correctAnswer: 'B',
          points: 2,
        },
        {
          prompt: 'Trong MongoDB, lệnh nào được sử dụng để tìm kiếm các bản ghi thỏa mãn điều kiện?',
          options: ['A. db.collection.find(query)', 'B. SELECT * FROM collection', 'C. db.collection.search()', 'D. db.collection.query()'],
          correctAnswer: 'A',
          points: 2,
        },
        {
          prompt: 'Chỉ mục (Index) trong cơ sở dữ liệu có tác dụng chính là gì?',
          options: ['A. Tăng tốc độ truy vấn đọc dữ liệu', 'B. Giảm dung lượng ổ cứng', 'C. Tăng tốc độ lệnh INSERT', 'D. Khóa bảo mật dữ liệu'],
          correctAnswer: 'A',
          points: 2,
        },
        {
          prompt: 'Chuẩn hóa dữ liệu dạng 3NF (Third Normal Form) yêu cầu loại bỏ quan hệ phụ thuộc nào?',
          options: ['A. Phụ thuộc hàm đầy đủ', 'B. Phụ thuộc bắc cầu (Transitive dependency)', 'C. Phụ thuộc một phần', 'D. Phụ thuộc đa trị'],
          correctAnswer: 'B',
          points: 2,
        },
      ],
      essay: [
        {
          prompt: 'So sánh chi tiết ưu nhược điểm giữa mô hình CSDL Quan hệ (SQL/RDBMS) và CSDL Phi quan hệ (NoSQL/Document). Trong trường hợp nào nên ưu tiên chọn NoSQL?',
          sampleAnswer: 'RDBMS đảm bảo tính toàn vẹn ACID, cấu trúc bảng quan hệ chặt chẽ. NoSQL linh hoạt schema, khả năng scale ngang (horizontal scaling) tốt với khối lượng dữ liệu lớn và tốc độ ghi cao. Nên chọn NoSQL khi cấu trúc dữ liệu thay đổi linh hoạt hoặc ứng dụng Big Data/Real-time streaming.',
          points: 2,
        },
      ],
    },
    ai: {
      subjectName: 'Trí tuệ Nhân tạo & Machine Learning Thực chiến',
      mc: [
        {
          prompt: 'Học có giám sát (Supervised Learning) là phương pháp học máy dựa trên loại dữ liệu nào?',
          options: ['A. Dữ liệu đã được gán nhãn (Labeled data)', 'B. Dữ liệu không gán nhãn', 'C. Phần thưởng và hình phạt (Reward/Penalty)', 'D. Dữ liệu ngẫu nhiên'],
          correctAnswer: 'A',
          points: 2,
        },
        {
          prompt: 'Hàm kích hoạt (Activation Function) phổ biến nào trả về giá trị trong khoảng từ 0 đến 1, thường dùng trong phân loại nhị phân?',
          options: ['A. ReLU', 'B. Sigmoid', 'C. Softmax', 'D. Tanh'],
          correctAnswer: 'B',
          points: 2,
        },
        {
          prompt: 'Hiện tượng Overfitting (Quá khớp) trong mô hình máy học xảy ra khi nào?',
          options: ['A. Mô hình học quá tốt trên tập huấn luyện nhưng dự đoán kém trên tập kiểm thử', 'B. Mô hình không học được gì', 'C. Dữ liệu huấn luyện quá ít', 'D. Tốc độ học (learning rate) bằng 0'],
          correctAnswer: 'A',
          points: 2,
        },
      ],
      essay: [
        {
          prompt: 'Nêu các phương pháp kỹ thuật phổ biến để khắc phục hiện tượng Overfitting khi huấn luyện mô hình mạng nơ-ron sâu (Deep Neural Networks).',
          sampleAnswer: 'Sử dụng Regularization (L1, L2), kỹ thuật Dropout, Early Stopping khi loss validation tăng, Data Augmentation làm phong phú tập dữ liệu, và thu thập thêm dữ liệu huấn luyện thực tế.',
          points: 2,
        },
      ],
    },
  };

  const selectedBank = knowledgeBank[subject] || knowledgeBank.web;
  const numMc = Math.min(Number(mcCount) || 4, selectedBank.mc.length);
  const numEssay = Math.min(Number(essayCount) || 1, selectedBank.essay.length);

  const pickedMc = selectedBank.mc.slice(0, numMc).map((q, idx) => ({
    id: `ai_q_mc_${Date.now()}_${idx + 1}`,
    type: 'MULTIPLE_CHOICE',
    prompt: q.prompt,
    options: q.options,
    correctAnswer: q.correctAnswer,
    points: 2,
  }));

  const pickedEssay = selectedBank.essay.slice(0, numEssay).map((q, idx) => ({
    id: `ai_q_es_${Date.now()}_${idx + 1}`,
    type: 'ESSAY',
    prompt: q.prompt,
    sampleAnswer: q.sampleAnswer,
    points: 2,
  }));

  const questions = [...pickedMc, ...pickedEssay];
  const isFinal = type === 'FINAL_EXAM';
  const title = isFinal
    ? `Thi kết thúc học phần (Đề AI chuẩn hóa): ${selectedBank.subjectName}`
    : `Bài kiểm tra 15 phút (Đề AI): ${selectedBank.subjectName}`;

  res.json({
    message: `Trợ lý AI đã tự động tổng hợp bộ đề thi gồm ${questions.length} câu hỏi (${pickedMc.length} trắc nghiệm, ${pickedEssay.length} tự luận) chuẩn kiến thức!`,
    title,
    description: `Đề thi được tạo tự động bởi AI TMS cho học phần ${selectedBank.subjectName}. Chế độ: ${type === 'QUIZ_15M' ? '15 Phút' : 'Thi kết thúc học phần'}. Độ khó: ${difficulty}.`,
    durationMinutes: type === 'QUIZ_15M' ? 15 : 60,
    questions,
  });
});

// Phân tích văn bản / file Word thành danh sách câu hỏi đề thi (Word Parser)
router.post('/parse-word', requireRoles(ROLES.TEACHER, ROLES.ADMIN, ROLES.TRAINING_MANAGER), (req, res) => {
  const { textContent } = req.body;
  if (!textContent || !textContent.trim()) {
    return res.status(400).json({ message: 'Vui lòng cung cấp nội dung đề thi từ file Word hoặc văn bản.' });
  }

  try {
    const rawBlocks = textContent.split(/\n\s*(?:Câu\s+\d+|Question\s+\d+|Bài\s+\d+)[:.]/i);
    const parsedQuestions = [];

    rawBlocks.forEach((block, index) => {
      const cleanBlock = block.trim();
      if (!cleanBlock) return;

      const lines = cleanBlock.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const prompt = lines[0];
      const optionLines = lines.filter(l => /^[A-D][.:)]\s*/i.test(l));

      let correctAnswer = 'A';
      const ansLine = lines.find(l => /(?:Đáp án|Đ\/A|Answer|Key)[:.]\s*([A-D])/i.test(l));
      if (ansLine) {
        const m = ansLine.match(/(?:Đáp án|Đ\/A|Answer|Key)[:.]\s*([A-D])/i);
        if (m && m[1]) correctAnswer = m[1].toUpperCase();
      }

      if (optionLines.length >= 2) {
        parsedQuestions.push({
          id: `word_q_${Date.now()}_${index}`,
          type: 'MULTIPLE_CHOICE',
          prompt,
          options: optionLines.slice(0, 4),
          correctAnswer,
          points: 2,
        });
      } else {
        parsedQuestions.push({
          id: `word_q_${Date.now()}_${index}`,
          type: 'ESSAY',
          prompt,
          sampleAnswer: 'Dựa theo nội dung hướng dẫn chấm thi chuẩn của bộ môn.',
          points: 2,
        });
      }
    });

    if (parsedQuestions.length === 0) {
      // Fallback: nếu không tách được theo block, tạo 1 câu tự luận
      parsedQuestions.push({
        id: `word_q_${Date.now()}_1`,
        type: 'ESSAY',
        prompt: textContent.slice(0, 200),
        sampleAnswer: 'Dựa theo nội dung đề thi tải lên.',
        points: 10,
      });
    }

    res.json({
      message: `Phân tích thành công ${parsedQuestions.length} câu hỏi từ văn bản Word!`,
      questions: parsedQuestions,
    });
  } catch (err) {
    res.status(400).json({ message: 'Không thể phân tích định dạng văn bản: ' + err.message });
  }
});

module.exports = router;
