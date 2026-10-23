package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.StudentClassEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface StudentClassEnrollmentRepository extends JpaRepository<StudentClassEnrollment, Long> {

    List<StudentClassEnrollment> findByStudentId(Long studentId);

    List<StudentClassEnrollment> findByStudentIdAndStatus(Long studentId, String status);

    @Query("""
            SELECT e FROM StudentClassEnrollment e
            JOIN FETCH e.student
            WHERE e.status = 'DANG_HOC'
              AND e.startDate <= :date
              AND (e.endDate IS NULL OR e.endDate >= :date)
              AND (:classCode IS NULL OR :classCode = '' OR e.classCode = :classCode)
            ORDER BY e.classCode, e.student.fullName
            """)
    List<StudentClassEnrollment> findAttendanceRosterByDateAndClassCode(
            @Param("date") LocalDate date,
            @Param("classCode") String classCode);
}
