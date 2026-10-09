
package com.ttcs.knj48.repository;

import com.ttcs.knj48.entity.LessonSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonSessionRepository
        extends JpaRepository<LessonSession, Long> {

    List<LessonSession> findBySubjectIdOrderBySessionNumberAsc(
            Long subjectId
    );

    boolean existsBySubjectIdAndSessionNumber(
            Long subjectId,
            Integer sessionNumber
    );

    long countBySubjectId(Long subjectId);

    boolean existsBySubjectIdAndSessionNumberAndIdNot(
            Long subjectId,
            Integer sessionNumber,
            Long id
    );
}
