const mongoose = require('mongoose');
const User = require('../models/User');
const { Course, Class } = require('../models/Academic');

async function syncStoreWithMongo(store) {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0 && store.users && store.users.length > 0) {
      console.log('🔄 Đang đồng bộ dữ liệu mẫu sang cơ sở dữ liệu MongoDB Atlas...');
      for (const u of store.users) {
        await User.findOneAndUpdate(
          { id: u.id },
          {
            id: u.id,
            fullName: u.fullName,
            username: u.username,
            email: u.email,
            passwordHash: u.passwordHash,
            phone: u.phone || '',
            dob: u.dob || '',
            address: u.address || '',
            roles: u.roles || ['STUDENT'],
            activeRole: u.roles && u.roles[0] ? u.roles[0] : 'STUDENT',
            status: u.status || 'ACTIVE',
            avatar: u.avatar || '',
          },
          { upsert: true, returnDocument: 'after' }
        );
      }
      console.log(`✅ Đã đồng bộ thành công ${store.users.length} tài khoản người dùng sang MongoDB!`);
    } else {
      // Nạp dữ liệu tài khoản từ MongoDB Atlas về in-memory store để đảm bảo tên tiếng Việt chuẩn nhất
      const mongoUsers = await User.find({});
      if (mongoUsers && mongoUsers.length > 0) {
        mongoUsers.forEach((mUser) => {
          const idx = store.users.findIndex((u) => u.id === mUser.id || u.email.toLowerCase() === mUser.email.toLowerCase());
          if (idx !== -1) {
            store.users[idx].fullName = mUser.fullName;
            store.users[idx].phone = mUser.phone || store.users[idx].phone;
            store.users[idx].dob = mUser.dob || store.users[idx].dob;
            store.users[idx].address = mUser.address || store.users[idx].address;
            store.users[idx].roles = mUser.roles || store.users[idx].roles;
            store.users[idx].status = mUser.status || store.users[idx].status;
          } else {
            store.users.push(mUser.toObject());
          }
        });
      }
      console.log(`🍃 MongoDB Atlas đang hoạt động với ${userCount} tài khoản người dùng chuẩn.`);
    }
  } catch (err) {
    console.error('⚠️ Lỗi khi đồng bộ dữ liệu với MongoDB:', err.message);
  }
}

module.exports = { syncStoreWithMongo };