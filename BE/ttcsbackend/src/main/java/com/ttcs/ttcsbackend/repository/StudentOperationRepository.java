package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.StudentOperation;
import com.ttcs.ttcsbackend.entity.StudentOperationType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface StudentOperationRepository extends JpaRepository<StudentOperation, Long> {

    List<StudentOperation> findByStudentIdOrderByEffectiveDateDescRecordedAtDesc(Long studentId);

    boolean existsBySourceEnrollmentIdAndType(Long sourceEnrollmentId, StudentOperationType type);

    @EntityGraph(attributePaths = "student")
    List<StudentOperation> findByEffectiveDateLessThanEqualAndTypeInOrderByEffectiveDateAscRecordedAtAsc(
            LocalDate date,
            Collection<StudentOperationType> types);

    List<StudentOperation> findByStudentIdInAndEffectiveDateLessThanEqualOrderByEffectiveDateAscRecordedAtAsc(
            Collection<Long> studentIds,
            LocalDate date);
}
