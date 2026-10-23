package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentCode(String studentCode);

    boolean existsByStudentCode(String studentCode);

    /**
     * Tìm kiếm theo mã học viên, tên, số điện thoại
     */
    @Query("SELECT s FROM Student s WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           " LOWER(s.studentCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR s.status = :status) AND " +
           "(:entryLevel IS NULL OR :entryLevel = '' OR s.entryLevel = :entryLevel)")
    Page<Student> searchStudents(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("entryLevel") String entryLevel,
            Pageable pageable);
}
