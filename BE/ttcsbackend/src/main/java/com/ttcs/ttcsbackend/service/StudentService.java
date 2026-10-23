package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.dto.StudentEnrollmentDto;
import com.ttcs.ttcsbackend.dto.StudentProfileResponse;
import com.ttcs.ttcsbackend.dto.StudentUpdateRequest;
import com.ttcs.ttcsbackend.entity.Student;
import com.ttcs.ttcsbackend.entity.StudentClassEnrollment;
import com.ttcs.ttcsbackend.repository.StudentClassEnrollmentRepository;
import com.ttcs.ttcsbackend.repository.StudentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentClassEnrollmentRepository enrollmentRepository;

    public StudentService(StudentRepository studentRepository, StudentClassEnrollmentRepository enrollmentRepository) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    /**
     * Khởi tạo dữ liệu mẫu nếu chưa có dữ liệu trong DB
     */
    @PostConstruct
    @Transactional
    public void initSampleData() {
        if (studentRepository.count() == 0) {
            // Học viên 1
            Student s1 = new Student(
                    "HV2026001",
                    "Nguyễn Văn An",
                    "an.nguyen@gmail.com",
                    "0987654321",
                    "Nam",
                    LocalDate.of(2003, 5, 15),
                    "Số 12 Chùa Bộc, Đống Đa, Hà Nội",
                    "Tiền trung cấp (B1)",
                    "Học viên chăm chỉ, mục tiêu đạt IELTS 6.5 để du học.",
                    "DANG_HOC"
            );
            studentRepository.save(s1);

            StudentClassEnrollment e1_1 = new StudentClassEnrollment(
                    s1,
                    "IELTS-B2-01",
                    "Lớp Luyện thi IELTS Mục tiêu 6.5",
                    "ThS. Hoàng Hải Đăng",
                    "T2 - T4 - T6 (18:00 - 20:00)",
                    "Phòng Lab 301",
                    LocalDate.of(2026, 9, 1),
                    LocalDate.of(2026, 12, 1),
                    "DANG_HOC",
                    null
            );
            StudentClassEnrollment e1_2 = new StudentClassEnrollment(
                    s1,
                    "ENG-B1-02",
                    "Tiếng Anh Giao tiếp & Ngữ pháp Trung cấp",
                    "Cô Trần Thùy Dung",
                    "T3 - T5 - T7 (19:30 - 21:00)",
                    "Phòng 102",
                    LocalDate.of(2026, 6, 1),
                    LocalDate.of(2026, 8, 30),
                    "HOAN_THANH",
                    8.5
            );
            enrollmentRepository.save(e1_1);
            enrollmentRepository.save(e1_2);

            // Học viên 2
            Student s2 = new Student(
                    "HV2026002",
                    "Trần Thị Mai Phương",
                    "phuong.tran@gmail.com",
                    "0912345678",
                    "Nữ",
                    LocalDate.of(2004, 8, 20),
                    "Số 88 Cầu Giấy, Cầu Giấy, Hà Nội",
                    "Cơ bản",
                    "Cần củng cố phản xạ nghe nói và từ vựng chuyên ngành.",
                    "DANG_HOC"
            );
            studentRepository.save(s2);

            StudentClassEnrollment e2_1 = new StudentClassEnrollment(
                    s2,
                    "REACT-K15",
                    "Khóa học Lập trình Web Fullstack React & Node.js",
                    "ThS. Nguyễn Đăng Dương",
                    "T3 - T5 - T7 (18:30 - 20:30)",
                    "Phòng Máy 204",
                    LocalDate.of(2026, 9, 15),
                    LocalDate.of(2026, 12, 15),
                    "DANG_HOC",
                    null
            );
            StudentClassEnrollment e2_2 = new StudentClassEnrollment(
                    s2,
                    "HTML-CSS-K14",
                    "Nền tảng Thiết kế Giao diện Web HTML5/CSS3/JavaScript",
                    "ThS. Lê Quang Huy",
                    "T2 - T4 - T6 (19:00 - 21:00)",
                    "Phòng Máy 101",
                    LocalDate.of(2026, 6, 15),
                    LocalDate.of(2026, 8, 25),
                    "HOAN_THANH",
                    9.0
            );
            enrollmentRepository.save(e2_1);
            enrollmentRepository.save(e2_2);

            // Học viên 3
            Student s3 = new Student(
                    "HV2026003",
                    "Lê Hoàng Long",
                    "long.le@gmail.com",
                    "0978112233",
                    "Nam",
                    LocalDate.of(2002, 11, 28),
                    "Tổ 5, Phường Quyết Thắng, TP. Thái Nguyên",
                    "Mất gốc",
                    "Học lại từ đầu, cần trợ giảng hỗ trợ kèm riêng bài tập.",
                    "DANG_HOC"
            );
            studentRepository.save(s3);

            StudentClassEnrollment e3_1 = new StudentClassEnrollment(
                    s3,
                    "JAVA-BE-K10",
                    "Lập trình Backend chuyên sâu Spring Boot & Microservices",
                    "TS. Giang A Chiến",
                    "T7 - CN (08:30 - 11:30)",
                    "Phòng Lab 502",
                    LocalDate.of(2026, 10, 1),
                    LocalDate.of(2027, 1, 15),
                    "DANG_HOC",
                    null
            );
            StudentClassEnrollment e3_2 = new StudentClassEnrollment(
                    s3,
                    "JAVA-CORE-K09",
                    "Lập trình Hướng đối tượng Java Core",
                    "TS. Giang A Chiến",
                    "T2 - T4 - T6 (18:00 - 20:00)",
                    "Phòng Lab 501",
                    LocalDate.of(2026, 7, 1),
                    LocalDate.of(2026, 9, 20),
                    "HOAN_THANH",
                    7.8
            );
            enrollmentRepository.save(e3_1);
            enrollmentRepository.save(e3_2);
        }
    }

    /**
     * Tìm kiếm theo mã học viên, tên, số điện thoại
     */
    @Transactional(readOnly = true)
    public Page<StudentProfileResponse> searchStudents(String keyword, String status, String entryLevel, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Student> studentPage = studentRepository.searchStudents(keyword, status, entryLevel, pageable);
        return studentPage.map(this::toProfileResponse);
    }

    /**
     * Xem hồ sơ chi tiết theo ID hoặc mã học viên
     */
    @Transactional(readOnly = true)
    public Optional<StudentProfileResponse> getStudentProfile(Long id) {
        return studentRepository.findById(id).map(this::toProfileResponse);
    }

    @Transactional(readOnly = true)
    public Optional<StudentProfileResponse> getStudentProfileByCode(String studentCode) {
        return studentRepository.findByStudentCode(studentCode).map(this::toProfileResponse);
    }

    /**
     * Sửa thông tin cá nhân, trình độ đầu vào, ghi chú
     */
    @Transactional
    public StudentProfileResponse updateStudentProfile(Long id, StudentUpdateRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học viên với ID: " + id));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            student.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null) {
            student.setEmail(request.getEmail().trim());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            student.setPhone(request.getPhone().trim());
        }
        if (request.getGender() != null) {
            student.setGender(request.getGender().trim());
        }
        if (request.getDateOfBirth() != null) {
            student.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress().trim());
        }
        // Cập nhật trình độ đầu vào
        if (request.getEntryLevel() != null) {
            student.setEntryLevel(request.getEntryLevel().trim());
        }
        // Cập nhật ghi chú
        if (request.getNote() != null) {
            student.setNote(request.getNote().trim());
        }
        // Cập nhật trạng thái
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            student.setStatus(request.getStatus().trim());
        }

        Student saved = studentRepository.save(student);
        return toProfileResponse(saved);
    }

    /**
     * Chuyển đổi Entity Student sang DTO StudentProfileResponse kèm lớp đang học và lịch sử các lớp
     */
    private StudentProfileResponse toProfileResponse(Student student) {
        StudentProfileResponse res = new StudentProfileResponse();
        res.setId(student.getId());
        res.setStudentCode(student.getStudentCode());
        res.setFullName(student.getFullName());
        res.setEmail(student.getEmail());
        res.setPhone(student.getPhone());
        res.setGender(student.getGender());
        res.setDateOfBirth(student.getDateOfBirth());
        res.setAddress(student.getAddress());
        res.setEntryLevel(student.getEntryLevel());
        res.setNote(student.getNote());
        res.setStatus(student.getStatus());

        List<StudentClassEnrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());

        List<StudentEnrollmentDto> currentList = enrollments.stream()
                .filter(e -> "DANG_HOC".equalsIgnoreCase(e.getStatus()))
                .map(this::toEnrollmentDto)
                .collect(Collectors.toList());

        List<StudentEnrollmentDto> historyList = enrollments.stream()
                .filter(e -> !"DANG_HOC".equalsIgnoreCase(e.getStatus()))
                .map(this::toEnrollmentDto)
                .collect(Collectors.toList());

        res.setCurrentClasses(currentList);
        res.setClassHistory(historyList);
        return res;
    }

    private StudentEnrollmentDto toEnrollmentDto(StudentClassEnrollment e) {
        return new StudentEnrollmentDto(
                e.getId(),
                e.getClassCode(),
                e.getClassName(),
                e.getTeacherName(),
                e.getSchedule(),
                e.getRoom(),
                e.getStartDate(),
                e.getEndDate(),
                e.getStatus(),
                e.getFinalGrade()
        );
    }
}
