package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    @Query("SELECT l FROM Lead l WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(l.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.courseInterest) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR l.status = :status) AND " +
           "(:source IS NULL OR :source = '' OR l.source = :source)")
    Page<Lead> searchLeads(
            @Param("search") String search,
            @Param("status") String status,
            @Param("source") String source,
            Pageable pageable);

    // Tìm lead quá hạn gọi lại (callbackDate < now và status không phải là CLOSED_WON hoặc LOST)
    @Query("SELECT l FROM Lead l WHERE l.callbackDate IS NOT NULL AND l.callbackDate < :now " +
           "AND l.status NOT IN ('CLOSED_WON', 'LOST') " +
           "ORDER BY l.callbackDate ASC")
    List<Lead> findOverdueLeads(@Param("now") LocalDateTime now);

    // Đếm số lead quá hạn gọi lại
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.callbackDate IS NOT NULL AND l.callbackDate < :now " +
           "AND l.status NOT IN ('CLOSED_WON', 'LOST')")
    long countOverdueLeads(@Param("now") LocalDateTime now);

    // Đếm số lead cần gọi trong hôm nay
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.callbackDate IS NOT NULL " +
           "AND l.callbackDate >= :startOfDay AND l.callbackDate <= :endOfDay " +
           "AND l.status NOT IN ('CLOSED_WON', 'LOST')")
    long countTodayCallbackLeads(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    // Đếm số lead có lịch gọi trong tương lai (sau ngày hôm nay)
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.callbackDate IS NOT NULL AND l.callbackDate > :endOfDay " +
           "AND l.status NOT IN ('CLOSED_WON', 'LOST')")
    long countUpcomingCallbackLeads(@Param("endOfDay") LocalDateTime endOfDay);
}
