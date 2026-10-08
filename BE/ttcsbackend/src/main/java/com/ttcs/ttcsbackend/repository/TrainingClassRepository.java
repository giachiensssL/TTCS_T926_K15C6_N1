package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.TrainingClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingClassRepository extends JpaRepository<TrainingClass, Long> {

    List<TrainingClass> findByProgramId(Long programId);

    long countByProgramIdAndStatusIgnoreCase(Long programId, String status);

    long countByProgramId(Long programId);

    Optional<TrainingClass> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}
