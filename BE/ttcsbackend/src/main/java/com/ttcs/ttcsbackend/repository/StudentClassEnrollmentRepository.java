package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.StudentClassEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentClassEnrollmentRepository extends JpaRepository<StudentClassEnrollment, Long> {

    List<StudentClassEnrollment> findByStudentId(Long studentId);

    List<StudentClassEnrollment> findByStudentIdAndStatus(Long studentId, String status);
}
