require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connectDB, getDatabaseStatus } = require('./config/db');
const { syncStoreWithMongo } = require('./config/dbSync');
const store = require('./data/store');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const rolesRoutes = require('./routes/roles.routes');
const modulesRoutes = require('./routes/modules.routes');
const schedulesRoutes = require('./routes/schedules.routes');
const assignmentsRoutes = require('./routes/assignments.routes');
const academicRoutes = require('./routes/academic.routes');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'TMS University Portal Backend API',
    version: '2.0.0',
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Trạng thái kết nối cơ sở dữ liệu (MongoDB / In-Memory Store)
app.get('/api/database/status', (req, res) => {
  res.json({
    success: true,
    ...getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Đăng ký các routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/academic/schedules', schedulesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/academic/assignments', assignmentsRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api', modulesRoutes);

// Xử lý 404 cho API (S1-07)
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'Đường dẫn API không tồn tại trong hệ thống TMS.',
    path: req.originalUrl,
  });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Đã xảy ra lỗi trên hệ thống máy chủ. Vui lòng thử lại sau.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`====================================================`);
    console.log(`🎓 Cổng Đào Tạo TMS (University Portal) đang chạy tại: http://localhost:${PORT}`);
    console.log(`📡 Đầy đủ modules: Lịch học, Bài tập, Nộp bài, Điểm danh, Học phí`);
    console.log(`====================================================`);

    // Kết nối cơ sở dữ liệu MongoDB nếu có cấu hình
    try {
      await connectDB();
      await syncStoreWithMongo(store);
    } catch (e) {
      console.warn('Lưu ý database:', e.message);
    }
  });
}

module.exports = app;