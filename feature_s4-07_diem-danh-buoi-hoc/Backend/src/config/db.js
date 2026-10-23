const mongoose = require('mongoose');

// Cấu hình kết nối MongoDB (Hỗ trợ MongoDB Atlas Free Tier & Local MongoDB)
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('ℹ️  Chưa phát hiện biến môi trường MONGODB_URI.');
    console.log('📦 Hệ thống đang chạy ở chế độ Hybrid In-Memory Store (Đầy đủ dữ liệu mẫu chuẩn Bộ GD&ĐT).');
    console.log('💡 Để kết nối MongoDB Atlas miễn phí (Free Tier 512MB):');
    console.log('   1. Đăng ký cụm miễn phí tại https://www.mongodb.com/cloud/atlas');
    console.log('   2. Thêm chuỗi MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/tms_portal vào file Backend/.env');
    return null;
  }

  try {
    console.log('🍃 Đang kết nối đến cơ sở dữ liệu MongoDB Atlas...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ Kết nối MongoDB thành công: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (err) {
    console.error(`⚠️  Không thể kết nối đến MongoDB (${err.message}).`);
    console.log('🔄 Tự động chuyển sang chế độ dữ liệu In-Memory an toàn để đảm bảo hệ thống không bị gián đoạn.');
    return null;
  }
}

function getDatabaseStatus() {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING',
  };

  return {
    isMongoConnected: state === 1,
    status: states[state] || 'UNKNOWN',
    host: state === 1 ? mongoose.connection.host : null,
    dbName: state === 1 ? mongoose.connection.name : null,
    engine: state === 1 ? 'MongoDB (Cloud/Local)' : 'In-Memory Store (High-speed SQLite/JSON compatible)',
  };
}

module.exports = {
  connectDB,
  getDatabaseStatus,
};