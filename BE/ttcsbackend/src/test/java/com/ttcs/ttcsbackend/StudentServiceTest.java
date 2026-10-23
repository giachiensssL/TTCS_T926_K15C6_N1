package com.ttcs.ttcsbackend;

import com.ttcs.ttcsbackend.dto.StudentProfileResponse;
import com.ttcs.ttcsbackend.dto.StudentOperationRequest;
import com.ttcs.ttcsbackend.dto.StudentUpdateRequest;
import com.ttcs.ttcsbackend.entity.Student;
import com.ttcs.ttcsbackend.entity.StudentClassEnrollment;
import com.ttcs.ttcsbackend.entity.StudentOperation;
import com.ttcs.ttcsbackend.entity.StudentOperationType;
import com.ttcs.ttcsbackend.repository.StudentClassEnrollmentRepository;
import com.ttcs.ttcsbackend.repository.StudentOperationRepository;
import com.ttcs.ttcsbackend.repository.StudentRepository;
import com.ttcs.ttcsbackend.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class StudentServiceTest {

    private StudentRepository studentRepository;
    private StudentClassEnrollmentRepository enrollmentRepository;
    private StudentOperationRepository operationRepository;
    private StudentService studentService;

    @BeforeEach
    void setUp() {
        studentRepository = Mockito.mock(StudentRepository.class);
        enrollmentRepository = Mockito.mock(StudentClassEnrollmentRepository.class);
        operationRepository = Mockito.mock(StudentOperationRepository.class);
        when(operationRepository
                .findByEffectiveDateLessThanEqualAndTypeInOrderByEffectiveDateAscRecordedAtAsc(
                        any(LocalDate.class), anyCollection()))
                .thenReturn(List.of());
        when(operationRepository.findByStudentIdOrderByEffectiveDateDescRecordedAtDesc(anyLong()))
                .thenReturn(List.of());
        studentService = new StudentService(studentRepository, enrollmentRepository, operationRepository);
    }

    @Test
    void testSearchStudents_ByCodeNamePhone() {
        Student s = new Student(
                "HV001",
                "Nguyễn Văn A",
                "a@gmail.com",
                "0987654321",
                "Nam",
                LocalDate.of(2002, 1, 1),
                "Hà Nội",
                "Cơ bản",
                "Ghi chú kiểm thử",
                "DANG_HOC"
        );
        s.setId(1L);

        when(studentRepository.searchStudents(eq("0987"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(s)));

        when(enrollmentRepository.findByStudentId(1L)).thenReturn(List.of());

        Page<StudentProfileResponse> result = studentService.searchStudents("0987", "", "", 0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("HV001", result.getContent().get(0).getStudentCode());
        assertEquals("Nguyễn Văn A", result.getContent().get(0).getFullName());
        assertEquals("0987654321", result.getContent().get(0).getPhone());
    }

    @Test
    void testGetStudentProfile_CurrentClassesAndHistory() {
        Student s = new Student(
                "HV002",
                "Trần Thị B",
                "b@gmail.com",
                "0912345678",
                "Nữ",
                LocalDate.of(2003, 3, 3),
                "Đà Nẵng",
                "IELTS 5.0",
                "Ghi chú",
                "DANG_HOC"
        );
        s.setId(2L);

        StudentClassEnrollment currentClass = new StudentClassEnrollment(
                s, "REACT-01", "Lớp React", "Thầy C", "T2-4", "P101",
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 12, 1), "DANG_HOC", null
        );

        StudentClassEnrollment historyClass = new StudentClassEnrollment(
                s, "JS-01", "Lớp JS Cơ bản", "Cô D", "T3-5", "P102",
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 8, 1), "HOAN_THANH", 9.0
        );

        when(studentRepository.findById(2L)).thenReturn(Optional.of(s));
        when(enrollmentRepository.findByStudentId(2L)).thenReturn(List.of(currentClass, historyClass));

        Optional<StudentProfileResponse> profileOpt = studentService.getStudentProfile(2L);

        assertTrue(profileOpt.isPresent());
        StudentProfileResponse profile = profileOpt.get();

        // Kiểm tra thông tin cá nhân, trình độ, ghi chú
        assertEquals("HV002", profile.getStudentCode());
        assertEquals("IELTS 5.0", profile.getEntryLevel());
        assertEquals("Ghi chú", profile.getNote());

        // Kiểm tra lớp đang học
        assertEquals(1, profile.getCurrentClasses().size());
        assertEquals("REACT-01", profile.getCurrentClasses().get(0).getClassCode());

        // Kiểm tra lịch sử lớp đã học
        assertEquals(1, profile.getClassHistory().size());
        assertEquals("JS-01", profile.getClassHistory().get(0).getClassCode());
        assertEquals("HOAN_THANH", profile.getClassHistory().get(0).getStatus());
    }

    @Test
    void testUpdateStudentProfile_PersonalLevelNote() {
        Student s = new Student(
                "HV003",
                "Lê Văn C",
                "c@gmail.com",
                "0909090909",
                "Nam",
                LocalDate.of(2000, 10, 10),
                "Hải Phòng",
                "Mất gốc",
                "Ghi chú cũ",
                "DANG_HOC"
        );
        s.setId(3L);

        when(studentRepository.findById(3L)).thenReturn(Optional.of(s));
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArgument(0));
        when(enrollmentRepository.findByStudentId(3L)).thenReturn(List.of());

        StudentUpdateRequest req = new StudentUpdateRequest();
        req.setFullName("Lê Văn C (Đã cập nhật)");
        req.setPhone("0988776655");
        req.setEntryLevel("Trung cấp (B2)");
        req.setNote("Đã thi đậu B1, mục tiêu lên B2 và học thêm chuyên ngành.");
        req.setAddress("Hà Nội");

        StudentProfileResponse updated = studentService.updateStudentProfile(3L, req);

        assertEquals("Lê Văn C (Đã cập nhật)", updated.getFullName());
        assertEquals("0988776655", updated.getPhone());
        assertEquals("Trung cấp (B2)", updated.getEntryLevel());
        assertEquals("Đã thi đậu B1, mục tiêu lên B2 và học thêm chuyên ngành.", updated.getNote());
        assertEquals("Hà Nội", updated.getAddress());
    }

    @Test
    void reservationRemovesStudentFromRosterOnAndAfterEffectiveDate() {
        Student student = student(4L);
        StudentClassEnrollment enrollment = enrollment(student, 40L, "JAVA-01", null);
        LocalDate effectiveDate = LocalDate.now().plusDays(2);
        StudentOperation reservation = new StudentOperation(
                student, StudentOperationType.BAO_LUU, "Bảo lưu theo đề nghị",
                effectiveDate, null, null, Instant.now());
        when(enrollmentRepository.findAttendanceRosterByDateAndClassCode(any(), eq("JAVA-01")))
                .thenReturn(List.of(enrollment));
        when(operationRepository
                .findByStudentIdInAndEffectiveDateLessThanEqualOrderByEffectiveDateAscRecordedAtAsc(
                        anyCollection(), eq(effectiveDate.minusDays(1))))
                .thenReturn(List.of());
        when(operationRepository
                .findByStudentIdInAndEffectiveDateLessThanEqualOrderByEffectiveDateAscRecordedAtAsc(
                        anyCollection(), eq(effectiveDate)))
                .thenReturn(List.of(reservation));

        assertEquals(1, studentService.getAttendanceRoster(effectiveDate.minusDays(1), "JAVA-01").size());
        assertTrue(studentService.getAttendanceRoster(effectiveDate, "JAVA-01").isEmpty());
    }

    @Test
    void transferKeepsOldEnrollmentAndItsGradeAndMovesRosterAtEffectiveDate() {
        Student student = student(5L);
        StudentClassEnrollment source = enrollment(student, 50L, "OLD-01", 8.5);
        LocalDate effectiveDate = LocalDate.now().plusDays(2);
        when(studentRepository.findById(5L)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudentIdAndStatus(5L, "DANG_HOC"))
                .thenReturn(List.of(source));
        when(enrollmentRepository.save(any(StudentClassEnrollment.class)))
                .thenAnswer(invocation -> {
                    StudentClassEnrollment saved = invocation.getArgument(0);
                    saved.setId(51L);
                    return saved;
                });
        when(enrollmentRepository.findByStudentId(5L)).thenReturn(List.of(source));
        when(enrollmentRepository.findAttendanceRosterByDateAndClassCode(
                effectiveDate.minusDays(1), "OLD-01")).thenReturn(List.of(source));
        when(enrollmentRepository.findAttendanceRosterByDateAndClassCode(
                effectiveDate, "OLD-01")).thenReturn(List.of(source));
        when(operationRepository
                .findByStudentIdInAndEffectiveDateLessThanEqualOrderByEffectiveDateAscRecordedAtAsc(
                        anyCollection(), eq(effectiveDate.minusDays(1))))
                .thenReturn(List.of());
        StudentOperation transfer = new StudentOperation(
                student, StudentOperationType.CHUYEN_LOP, "Đổi lịch học",
                effectiveDate, source,
                new StudentClassEnrollment(student, "NEW-01", "Lớp mới", null, null, null,
                        effectiveDate, null, "DANG_HOC", null),
                Instant.now());
        when(operationRepository.existsBySourceEnrollmentIdAndType(
                50L, StudentOperationType.CHUYEN_LOP)).thenReturn(false);
        when(operationRepository
                .findByStudentIdInAndEffectiveDateLessThanEqualOrderByEffectiveDateAscRecordedAtAsc(
                        anyCollection(), eq(effectiveDate)))
                .thenReturn(List.of(transfer));
        when(operationRepository.findByStudentIdOrderByEffectiveDateDescRecordedAtDesc(5L))
                .thenReturn(List.of(transfer));

        StudentProfileResponse result = studentService.recordOperation(5L, new StudentOperationRequest(
                StudentOperationType.CHUYEN_LOP,
                "  Đổi lịch học  ",
                effectiveDate,
                50L,
                "NEW-01",
                "Lớp mới",
                "Giảng viên mới",
                "T2-T4",
                "P202",
                null));

        assertEquals(8.5, source.getFinalGrade());
        assertEquals("OLD-01", source.getClassCode());
        assertEquals(1, result.getCurrentClasses().size());
        assertEquals("OLD-01", result.getCurrentClasses().get(0).getClassCode());
        assertEquals("NEW-01", result.getOperationHistory().get(0).targetClassCode());
        org.mockito.ArgumentCaptor<StudentClassEnrollment> targetCaptor =
                org.mockito.ArgumentCaptor.forClass(StudentClassEnrollment.class);
        verify(enrollmentRepository).save(targetCaptor.capture());
        StudentClassEnrollment newEnrollment = targetCaptor.getValue();
        assertEquals("NEW-01", newEnrollment.getClassCode());
        assertEquals(effectiveDate, newEnrollment.getStartDate());
        assertNull(newEnrollment.getFinalGrade());
        verify(enrollmentRepository, never()).save(source);

        assertEquals(1, studentService.getAttendanceRoster(effectiveDate.minusDays(1), "OLD-01").size());
        assertTrue(studentService.getAttendanceRoster(effectiveDate, "OLD-01").isEmpty());
        when(enrollmentRepository.findAttendanceRosterByDateAndClassCode(effectiveDate, "NEW-01"))
                .thenReturn(List.of(newEnrollment));
        assertEquals("NEW-01", studentService.getAttendanceRoster(effectiveDate, "NEW-01").get(0).classCode());
    }

    @Test
    void terminalOperationIsStoredWithReasonAndEffectiveDate() {
        Student student = student(6L);
        when(studentRepository.findById(6L)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudentId(6L)).thenReturn(List.of());
        when(operationRepository.findByStudentIdOrderByEffectiveDateDescRecordedAtDesc(6L))
                .thenAnswer(invocation -> List.of());

        LocalDate effectiveDate = LocalDate.now().plusDays(1);
        studentService.recordOperation(6L, new StudentOperationRequest(
                StudentOperationType.THOI_HOC,
                "Xin nghỉ học",
                effectiveDate,
                null,
                null,
                null,
                null,
                null,
                null,
                null));

        verify(operationRepository).save(argThat(operation ->
                operation.getType() == StudentOperationType.THOI_HOC
                        && "Xin nghỉ học".equals(operation.getReason())
                        && effectiveDate.equals(operation.getEffectiveDate())));
        assertEquals("DANG_HOC", student.getStatus());
    }

    private static Student student(Long id) {
        Student student = new Student("HV" + id, "Học viên " + id, null, "0900000000",
                null, null, null, null, null, "DANG_HOC");
        student.setId(id);
        return student;
    }

    private static StudentClassEnrollment enrollment(
            Student student, Long id, String code, Double grade) {
        StudentClassEnrollment enrollment = new StudentClassEnrollment(
                student, code, "Lớp " + code, null, null, null,
                LocalDate.now().minusDays(2), null, "DANG_HOC", grade);
        enrollment.setId(id);
        return enrollment;
    }
}
