package com.ttcs.ttcsbackend;

import com.ttcs.ttcsbackend.dto.StudentProfileResponse;
import com.ttcs.ttcsbackend.dto.StudentUpdateRequest;
import com.ttcs.ttcsbackend.entity.Student;
import com.ttcs.ttcsbackend.entity.StudentClassEnrollment;
import com.ttcs.ttcsbackend.repository.StudentClassEnrollmentRepository;
import com.ttcs.ttcsbackend.repository.StudentRepository;
import com.ttcs.ttcsbackend.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class StudentServiceTest {

    private StudentRepository studentRepository;
    private StudentClassEnrollmentRepository enrollmentRepository;
    private StudentService studentService;

    @BeforeEach
    void setUp() {
        studentRepository = Mockito.mock(StudentRepository.class);
        enrollmentRepository = Mockito.mock(StudentClassEnrollmentRepository.class);
        studentService = new StudentService(studentRepository, enrollmentRepository);
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
}
