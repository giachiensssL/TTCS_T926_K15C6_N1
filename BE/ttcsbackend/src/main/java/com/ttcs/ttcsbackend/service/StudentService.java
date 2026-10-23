package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.dto.StudentEnrollmentDto;
import com.ttcs.ttcsbackend.dto.AttendanceRosterStudentDto;
import com.ttcs.ttcsbackend.dto.StudentOperationHistoryDto;
import com.ttcs.ttcsbackend.dto.StudentOperationRequest;
import com.ttcs.ttcsbackend.dto.StudentProfileResponse;
import com.ttcs.ttcsbackend.dto.StudentUpdateRequest;
import com.ttcs.ttcsbackend.entity.Student;
import com.ttcs.ttcsbackend.entity.StudentClassEnrollment;
import com.ttcs.ttcsbackend.entity.StudentOperation;
import com.ttcs.ttcsbackend.entity.StudentOperationType;
import com.ttcs.ttcsbackend.repository.StudentClassEnrollmentRepository;
import com.ttcs.ttcsbackend.repository.StudentOperationRepository;
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
    private final StudentOperationRepository operationRepository;

    public StudentService(
            StudentRepository studentRepository,
            StudentClassEnrollmentRepository enrollmentRepository,
            StudentOperationRepository operationRepository) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.operationRepository = operationRepository;
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
    @Transactional
    public Page<StudentProfileResponse> searchStudents(String keyword, String status, String entryLevel, int page, int size) {
        synchronizeEffectiveStatuses();
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Student> studentPage = studentRepository.searchStudents(keyword, status, entryLevel, pageable);
        return studentPage.map(this::toProfileResponse);
    }

    /**
     * Xem hồ sơ chi tiết theo ID hoặc mã học viên
     */
    @Transactional
    public Optional<StudentProfileResponse> getStudentProfile(Long id) {
        synchronizeEffectiveStatuses();
        return studentRepository.findById(id).map(this::toProfileResponse);
    }

    @Transactional
    public Optional<StudentProfileResponse> getStudentProfileByCode(String studentCode) {
        synchronizeEffectiveStatuses();
        return studentRepository.findByStudentCode(studentCode).map(this::toProfileResponse);
    }

    @Transactional
    public StudentProfileResponse recordOperation(Long studentId, StudentOperationRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học viên với ID: " + studentId));
        String reason = request.reason() == null ? "" : request.reason().trim();
        if (reason.isEmpty()) {
            throw new IllegalArgumentException("Lý do thao tác là bắt buộc.");
        }
        if (request.effectiveDate() == null || request.type() == null) {
            throw new IllegalArgumentException("Loại thao tác và ngày hiệu lực là bắt buộc.");
        }
        if (!"DANG_HOC".equalsIgnoreCase(student.getStatus())) {
            throw new IllegalStateException("Chỉ học viên đang học mới có thể thực hiện thao tác.");
        }
        List<StudentOperation> previousOperations =
                operationRepository.findByStudentIdOrderByEffectiveDateDescRecordedAtDesc(studentId);
        if (previousOperations.stream().anyMatch(operation ->
                operation.getType() == StudentOperationType.BAO_LUU
                        || operation.getType() == StudentOperationType.THOI_HOC)) {
            throw new IllegalStateException("Học viên đã có thao tác bảo lưu hoặc thôi học được ghi nhận.");
        }

        StudentClassEnrollment source = null;
        StudentClassEnrollment target = null;
        if (request.type() == StudentOperationType.CHUYEN_LOP) {
            source = resolveTransferSource(studentId, request.sourceEnrollmentId());
            if (operationRepository.existsBySourceEnrollmentIdAndType(
                    source.getId(), StudentOperationType.CHUYEN_LOP)) {
                throw new IllegalStateException("Lớp này đã được ghi nhận chuyển lớp.");
            }
            target = createTransferTarget(student, source, request);
            target = enrollmentRepository.save(target);
        } else if (request.sourceEnrollmentId() != null) {
            throw new IllegalArgumentException("Chỉ thao tác chuyển lớp mới nhận lớp nguồn.");
        }

        StudentOperation operation = new StudentOperation(
                student,
                request.type(),
                reason,
                request.effectiveDate(),
                source,
                target,
                java.time.Instant.now());
        operationRepository.save(operation);

        if (!request.effectiveDate().isAfter(LocalDate.now())) {
            synchronizeEffectiveStatuses();
        }
        return toProfileResponse(student);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRosterStudentDto> getAttendanceRoster(LocalDate date, String classCode) {
        LocalDate effectiveDate = date == null ? LocalDate.now() : date;
        List<StudentClassEnrollment> enrollments =
                enrollmentRepository.findAttendanceRosterByDateAndClassCode(effectiveDate, classCode);
        if (enrollments.isEmpty()) {
            return List.of();
        }

        List<Long> studentIds = enrollments.stream()
                .map(enrollment -> enrollment.getStudent().getId())
                .distinct()
                .toList();
        List<StudentOperation> operations =
                operationRepository.findByStudentIdInAndEffectiveDateLessThanEqualOrderByEffectiveDateAscRecordedAtAsc(
                        studentIds, effectiveDate);

        return enrollments.stream()
                .filter(enrollment -> "DANG_HOC".equalsIgnoreCase(enrollment.getStudent().getStatus()))
                .filter(enrollment -> isAttendanceEligible(enrollment, operations))
                .map(enrollment -> new AttendanceRosterStudentDto(
                        enrollment.getStudent().getId(),
                        enrollment.getStudent().getStudentCode(),
                        enrollment.getStudent().getFullName(),
                        enrollment.getId(),
                        enrollment.getClassCode(),
                        enrollment.getClassName()))
                .toList();
    }

    private StudentClassEnrollment resolveTransferSource(Long studentId, Long sourceEnrollmentId) {
        if (sourceEnrollmentId == null) {
            throw new IllegalArgumentException("Cần chọn lớp hiện tại để chuyển.");
        }
        return enrollmentRepository.findByStudentIdAndStatus(studentId, "DANG_HOC").stream()
                .filter(enrollment -> enrollment.getId().equals(sourceEnrollmentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Lớp nguồn không thuộc học viên hoặc không còn hoạt động."));
    }

    private StudentClassEnrollment createTransferTarget(
            Student student,
            StudentClassEnrollment source,
            StudentOperationRequest request) {
        String code = request.targetClassCode() == null ? "" : request.targetClassCode().trim();
        String name = request.targetClassName() == null ? "" : request.targetClassName().trim();
        if (code.isEmpty() || name.isEmpty()) {
            throw new IllegalArgumentException("Mã lớp và tên lớp mới là bắt buộc khi chuyển lớp.");
        }
        if (code.equalsIgnoreCase(source.getClassCode())) {
            throw new IllegalArgumentException("Lớp chuyển đến phải khác lớp hiện tại.");
        }
        if (source.getStartDate() != null && source.getStartDate().isAfter(request.effectiveDate())) {
            throw new IllegalArgumentException("Ngày hiệu lực chuyển lớp không được trước ngày bắt đầu lớp nguồn.");
        }
        if (source.getEndDate() != null && source.getEndDate().isBefore(request.effectiveDate())) {
            throw new IllegalArgumentException("Ngày hiệu lực chuyển lớp không được sau ngày kết thúc lớp nguồn.");
        }
        if (request.targetEndDate() != null && request.targetEndDate().isBefore(request.effectiveDate())) {
            throw new IllegalArgumentException("Ngày kết thúc lớp mới không được trước ngày hiệu lực chuyển lớp.");
        }

        return new StudentClassEnrollment(
                student,
                code,
                name,
                trimToNull(request.targetTeacherName()),
                trimToNull(request.targetSchedule()),
                trimToNull(request.targetRoom()),
                request.effectiveDate(),
                request.targetEndDate() == null ? source.getEndDate() : request.targetEndDate(),
                "DANG_HOC",
                null);
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private boolean isAttendanceEligible(
            StudentClassEnrollment enrollment,
            List<StudentOperation> operations) {
        for (StudentOperation operation : operations) {
            if (!operation.getStudent().getId().equals(enrollment.getStudent().getId())) {
                continue;
            }
            if (operation.getType() == StudentOperationType.BAO_LUU
                    || operation.getType() == StudentOperationType.THOI_HOC) {
                return false;
            }
            if (operation.getType() == StudentOperationType.CHUYEN_LOP
                    && operation.getSourceEnrollment() != null
                    && operation.getSourceEnrollment().getId().equals(enrollment.getId())) {
                return false;
            }
        }
        return true;
    }

    private void synchronizeEffectiveStatuses() {
        List<StudentOperation> terminalOperations =
                operationRepository.findByEffectiveDateLessThanEqualAndTypeInOrderByEffectiveDateAscRecordedAtAsc(
                        LocalDate.now(), List.of(StudentOperationType.BAO_LUU, StudentOperationType.THOI_HOC));
        for (StudentOperation operation : terminalOperations) {
            Student student = operation.getStudent();
            student.setStatus(operation.getType() == StudentOperationType.BAO_LUU ? "BAO_LUU" : "DA_NGHI");
            studentRepository.save(student);
        }
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
        List<StudentOperation> operationHistory =
                operationRepository.findByStudentIdOrderByEffectiveDateDescRecordedAtDesc(student.getId());
        res.setStatus(currentStudentStatus(student, operationHistory));

        List<StudentClassEnrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());

        List<StudentEnrollmentDto> currentList = enrollments.stream()
                .filter(e -> isCurrentEnrollment(e, operationHistory, LocalDate.now()))
                .map(this::toEnrollmentDto)
                .collect(Collectors.toList());

        List<StudentEnrollmentDto> historyList = enrollments.stream()
                .filter(e -> !isCurrentEnrollment(e, operationHistory, LocalDate.now()))
                .map(enrollment -> toEnrollmentDtoWithEffectiveStatus(enrollment, operationHistory))
                .collect(Collectors.toList());

        res.setCurrentClasses(currentList);
        res.setClassHistory(historyList);
        res.setOperationHistory(operationHistory.stream().map(this::toOperationHistoryDto).toList());
        return res;
    }

    private String currentStudentStatus(Student student, List<StudentOperation> operations) {
        return operations.stream()
                .filter(operation -> !operation.getEffectiveDate().isAfter(LocalDate.now()))
                .filter(operation -> operation.getType() == StudentOperationType.BAO_LUU
                        || operation.getType() == StudentOperationType.THOI_HOC)
                .max(java.util.Comparator.comparing(StudentOperation::getEffectiveDate)
                        .thenComparing(StudentOperation::getRecordedAt))
                .map(operation -> operation.getType() == StudentOperationType.BAO_LUU ? "BAO_LUU" : "DA_NGHI")
                .orElse(student.getStatus());
    }

    private boolean isCurrentEnrollment(
            StudentClassEnrollment enrollment,
            List<StudentOperation> operations,
            LocalDate date) {
        if (!"DANG_HOC".equalsIgnoreCase(enrollment.getStatus())
                || enrollment.getStartDate() == null
                || enrollment.getStartDate().isAfter(date)
                || (enrollment.getEndDate() != null && enrollment.getEndDate().isBefore(date))) {
            return false;
        }
        return isAttendanceEligible(enrollment, operations.stream()
                .filter(operation -> !operation.getEffectiveDate().isAfter(date))
                .toList());
    }

    private StudentEnrollmentDto toEnrollmentDtoWithEffectiveStatus(
            StudentClassEnrollment enrollment,
            List<StudentOperation> operations) {
        String status = enrollment.getStatus();
        StudentOperation relatedOperation = operations.stream()
                .filter(operation -> !operation.getEffectiveDate().isAfter(LocalDate.now()))
                .filter(operation -> operation.getSourceEnrollment() != null
                        && operation.getSourceEnrollment().getId().equals(enrollment.getId()))
                .max(java.util.Comparator.comparing(StudentOperation::getEffectiveDate))
                .orElse(null);
        if (relatedOperation != null && relatedOperation.getType() == StudentOperationType.CHUYEN_LOP) {
            status = "CHUYEN_LOP";
        } else if (currentStudentStatus(enrollment.getStudent(), operations).equals("BAO_LUU")
                && "DANG_HOC".equals(status)) {
            status = "BAO_LUU";
        } else if (currentStudentStatus(enrollment.getStudent(), operations).equals("DA_NGHI")
                && "DANG_HOC".equals(status)) {
            status = "DA_NGHI";
        }
        return new StudentEnrollmentDto(
                enrollment.getId(), enrollment.getClassCode(), enrollment.getClassName(),
                enrollment.getTeacherName(), enrollment.getSchedule(), enrollment.getRoom(),
                enrollment.getStartDate(), enrollment.getEndDate(), status, enrollment.getFinalGrade());
    }

    private StudentOperationHistoryDto toOperationHistoryDto(StudentOperation operation) {
        StudentClassEnrollment source = operation.getSourceEnrollment();
        StudentClassEnrollment target = operation.getTargetEnrollment();
        return new StudentOperationHistoryDto(
                operation.getId(),
                operation.getType(),
                operation.getReason(),
                operation.getEffectiveDate(),
                operation.getRecordedAt(),
                source == null ? null : source.getId(),
                source == null ? null : source.getClassCode(),
                target == null ? null : target.getId(),
                target == null ? null : target.getClassCode(),
                target == null ? null : target.getClassName());
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
