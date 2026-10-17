package com.ttcs.ttcsbackend.repository;
import com.ttcs.ttcsbackend.entity.TrainingClass;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface EnrollmentClassLockRepository extends JpaRepository<TrainingClass,Long> {
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select c from TrainingClass c where c.id=:id")
 Optional<TrainingClass> lockClass(@Param("id") Long classId);
}
