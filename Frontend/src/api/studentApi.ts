import { StudentProfile, StudentUpdateForm } from '../types/student'

const API_BASE_URL = 'http://localhost:8080/api/students'

// Fallback mock data nếu Backend chưa chạy
const MOCK_STUDENTS: StudentProfile[] = [
  {
    id: 1,
    studentCode: 'HV2026001',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    phone: '0987654321',
    gender: 'Nam',
    dateOfBirth: '2003-05-15',
    address: 'Số 12 Chùa Bộc, Đống Đa, Hà Nội',
    entryLevel: 'Tiền trung cấp (B1)',
    note: 'Học viên chăm chỉ, mục tiêu đạt IELTS 6.5 để du học.',
    status: 'DANG_HOC',
    currentClasses: [
      {
        id: 101,
        classCode: 'IELTS-B2-01',
        className: 'Lớp Luyện thi IELTS Mục tiêu 6.5',
        teacherName: 'ThS. Hoàng Hải Đăng',
        schedule: 'T2 - T4 - T6 (18:00 - 20:00)',
        room: 'Phòng Lab 301',
        startDate: '2026-09-01',
        endDate: '2026-12-01',
        status: 'DANG_HOC',
        finalGrade: null,
      },
    ],
    classHistory: [
      {
        id: 102,
        classCode: 'ENG-B1-02',
        className: 'Tiếng Anh Giao tiếp & Ngữ pháp Trung cấp',
        teacherName: 'Cô Trần Thùy Dung',
        schedule: 'T3 - T5 - T7 (19:30 - 21:00)',
        room: 'Phòng 102',
        startDate: '2026-06-01',
        endDate: '2026-08-30',
        status: 'HOAN_THANH',
        finalGrade: 8.5,
      },
    ],
  },
  {
    id: 2,
    studentCode: 'HV2026002',
    fullName: 'Trần Thị Mai Phương',
    email: 'phuong.tran@gmail.com',
    phone: '0912345678',
    gender: 'Nữ',
    dateOfBirth: '2004-08-20',
    address: 'Số 88 Cầu Giấy, Cầu Giấy, Hà Nội',
    entryLevel: 'Cơ bản',
    note: 'Cần củng cố phản xạ nghe nói và từ vựng chuyên ngành.',
    status: 'DANG_HOC',
    currentClasses: [
      {
        id: 201,
        classCode: 'REACT-K15',
        className: 'Khóa học Lập trình Web Fullstack React & Node.js',
        teacherName: 'ThS. Nguyễn Đăng Dương',
        schedule: 'T3 - T5 - T7 (18:30 - 20:30)',
        room: 'Phòng Máy 204',
        startDate: '2026-09-15',
        endDate: '2026-12-15',
        status: 'DANG_HOC',
        finalGrade: null,
      },
    ],
    classHistory: [
      {
        id: 202,
        classCode: 'HTML-CSS-K14',
        className: 'Nền tảng Thiết kế Giao diện Web HTML5/CSS3/JavaScript',
        teacherName: 'ThS. Lê Quang Huy',
        schedule: 'T2 - T4 - T6 (19:00 - 21:00)',
        room: 'Phòng Máy 101',
        startDate: '2026-06-15',
        endDate: '2026-08-25',
        status: 'HOAN_THANH',
        finalGrade: 9.0,
      },
    ],
  },
  {
    id: 3,
    studentCode: 'HV2026003',
    fullName: 'Lê Hoàng Long',
    email: 'long.le@gmail.com',
    phone: '0978112233',
    gender: 'Nam',
    dateOfBirth: '2002-11-28',
    address: 'Tổ 5, Phường Quyết Thắng, TP. Thái Nguyên',
    entryLevel: 'Mất gốc',
    note: 'Học lại từ đầu, cần trợ giảng hỗ trợ kèm riêng bài tập.',
    status: 'DANG_HOC',
    currentClasses: [
      {
        id: 301,
        classCode: 'JAVA-BE-K10',
        className: 'Lập trình Backend chuyên sâu Spring Boot & Microservices',
        teacherName: 'TS. Giang A Chiến',
        schedule: 'T7 - CN (08:30 - 11:30)',
        room: 'Phòng Lab 502',
        startDate: '2026-10-01',
        endDate: '2027-01-15',
        status: 'DANG_HOC',
        finalGrade: null,
      },
    ],
    classHistory: [
      {
        id: 302,
        classCode: 'JAVA-CORE-K09',
        className: 'Lập trình Hướng đối tượng Java Core',
        teacherName: 'TS. Giang A Chiến',
        schedule: 'T2 - T4 - T6 (18:00 - 20:00)',
        room: 'Phòng Lab 501',
        startDate: '2026-07-01',
        endDate: '2026-09-20',
        status: 'HOAN_THANH',
        finalGrade: 7.8,
      },
      {
        id: 303,
        classCode: 'C-BASIC-K08',
        className: 'Kỹ thuật Lập trình C/C++ Nhập môn',
        teacherName: 'ThS. Nguyễn Hải Anh',
        schedule: 'T3 - T5 (14:00 - 17:00)',
        room: 'Phòng Lab 403',
        startDate: '2026-03-01',
        endDate: '2026-05-30',
        status: 'HOAN_THANH',
        finalGrade: 8.2,
      },
    ],
  },
]

// Lưu trữ local fallback
let localStudents = [...MOCK_STUDENTS]

export async function fetchStudents(
  keyword = '',
  status = '',
  entryLevel = '',
  page = 0,
  size = 10
): Promise<{ content: StudentProfile[]; totalElements: number; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      keyword,
      status,
      entryLevel,
      page: String(page),
      size: String(size),
    })

    const res = await fetch(`${API_BASE_URL}?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      return {
        content: data.content,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      }
    }
  } catch (err) {
    console.warn('Backend API chưa sẵn sàng, sử dụng dữ liệu cục bộ:', err)
  }

  // Fallback lọc dữ liệu cục bộ
  const q = keyword.trim().toLowerCase()
  const filtered = localStudents.filter((s) => {
    const matchKeyword =
      !q ||
      s.studentCode.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.email.toLowerCase().includes(q)

    const matchStatus = !status || s.status === status
    const matchLevel = !entryLevel || s.entryLevel === entryLevel

    return matchKeyword && matchStatus && matchLevel
  })

  return {
    content: filtered.slice(page * size, (page + 1) * size),
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size) || 1,
  }
}

export async function fetchStudentById(id: number): Promise<StudentProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`)
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('Backend API chưa sẵn sàng, sử dụng dữ liệu cục bộ:', err)
  }

  const found = localStudents.find((s) => s.id === id)
  if (!found) {
    throw new Error('Không tìm thấy học viên với ID ' + id)
  }
  return found
}

export async function updateStudentProfileApi(
  id: number,
  data: StudentUpdateForm
): Promise<StudentProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('Backend API chưa sẵn sàng, cập nhật dữ liệu cục bộ:', err)
  }

  // Fallback cập nhật cục bộ
  const idx = localStudents.findIndex((s) => s.id === id)
  if (idx === -1) {
    throw new Error('Không tìm thấy học viên với ID ' + id)
  }

  const updated: StudentProfile = {
    ...localStudents[idx],
    ...data,
  }
  localStudents[idx] = updated
  return updated
}
