package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.TrainingClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainingClassRepository extends JpaRepository<TrainingClass, Long> {
    List<TrainingClass> findByInstructorIdOrderByName(Long instructorId);
}
