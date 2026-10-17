package com.ttcs.ttcsbackend.repository;
import com.ttcs.ttcsbackend.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EnrollmentRepository extends JpaRepository<Enrollment,Long> {
 boolean existsByTrainingClass_IdAndStudent_Id(Long classId,Long studentId);
 long countByTrainingClass_Id(Long classId);
 List<Enrollment> findByTrainingClass_IdOrderByEnrolledAtAsc(Long classId);
}
