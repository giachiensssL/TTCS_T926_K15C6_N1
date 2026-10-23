const mongoose = require('mongoose');

// Schema Môn học / Học phần
const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true, default: 3 },
  department: { type: String, default: 'Công nghệ thông tin' },
  description: { type: String, default: '' },
});

// Schema Lớp học
const ClassSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  teacherId: { type: String },
  teacherName: { type: String },
  semester: { type: String, default: 'Học kỳ 1 - 2026' },
  maxStudents: { type: Number, default: 40 },
  currentStudents: { type: Number, default: 0 },
  room: { type: String, default: 'Phòng A101' },
  scheduleText: { type: String, default: 'Thứ 2, 4 (Ca 1)' },
});

module.exports = {
  Course: mongoose.models.Course || mongoose.model('Course', CourseSchema),
  Class: mongoose.models.Class || mongoose.model('Class', ClassSchema),
};