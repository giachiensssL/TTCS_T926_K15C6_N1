package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.CareLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareLogRepository extends JpaRepository<CareLog, Long> {
    List<CareLog> findByLeadIdOrderByInteractionTimeDesc(Long leadId);
    long countByLeadId(Long leadId);
}
