
package com.ttcs.knj48.service;

import com.ttcs.knj48.entity.LessonSession;
import com.ttcs.knj48.entity.Subject;
import com.ttcs.knj48.repository.LessonSessionRepository;
import com.ttcs.knj48.repository.SubjectRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LessonSessionService {

    private final LessonSessionRepository sessionRepository;
    private final SubjectRepository subjectRepository;

    public LessonSessionService(
            LessonSessionRepository sessionRepository,
            SubjectRepository subjectRepository) {
        this.sessionRepository = sessionRepository;
        this.subjectRepository = subjectRepository;
    }

    // Du lieu tra ve cho Frontend
    public record SessionResponse(
            Long id,
            Long subjectId,
            Integer sessionNumber,
            String topic,
            String objectives) {
    }

    // Chuyen Entity thanh du lieu tra ve
    private SessionResponse toResponse(LessonSession session) {
        return new SessionResponse(
                session.getId(),
                session.getSubject().getId(),
                session.getSessionNumber(),
                session.getTopic(),
                session.getObjectives()
        );
    }

    // Lay danh sach buoi hoc theo mon
    @Transactional(readOnly = true)
    public List<SessionResponse> getSessions(Long subjectId) {

        if (!subjectRepository.existsById(subjectId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Mon hoc khong ton tai"
            );
        }

        return sessionRepository
                .findBySubjectIdOrderBySessionNumberAsc(subjectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Them buoi hoc moi
    @Transactional
    public SessionResponse createSession(
            Long subjectId,
            Integer sessionNumber,
            String topic,
            String objectives) {

        Subject subject = subjectRepository
                .findById(subjectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mon hoc khong ton tai"
                ));

        if (sessionNumber == null || sessionNumber < 1 ||
                topic == null || topic.isBlank() ||
                objectives == null || objectives.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thong tin buoi hoc khong hop le"
            );
        }

        if (sessionRepository.existsBySubjectIdAndSessionNumber(
                subjectId, sessionNumber)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "So thu tu buoi hoc da ton tai"
            );
        }

        LessonSession session = new LessonSession();
        session.setSubject(subject);
        session.setSessionNumber(sessionNumber);
        session.setTopic(topic.trim());
        session.setObjectives(objectives.trim());

        return toResponse(sessionRepository.save(session));
    }
    
    // Sua thong tin buoi hoc
    @Transactional
    public SessionResponse updateSession(
            Long id,
            Integer sessionNumber,
            String topic,
            String objectives) {

        LessonSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Buoi hoc khong ton tai"
                ));

        if (sessionNumber == null || sessionNumber < 1 ||
                topic == null || topic.isBlank() ||
                objectives == null || objectives.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thong tin khong hop le"
            );
        }

        Long subjectId = session.getSubject().getId();

        if (sessionRepository
                .existsBySubjectIdAndSessionNumberAndIdNot(
                        subjectId, sessionNumber, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "So thu tu buoi hoc da ton tai"
            );
        }

        session.setSessionNumber(sessionNumber);
        session.setTopic(topic.trim());
        session.setObjectives(objectives.trim());

        return toResponse(sessionRepository.save(session));
    }

    // Xoa buoi hoc
    @Transactional
    public void deleteSession(Long id) {
        LessonSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Buoi hoc khong ton tai"
                ));

        sessionRepository.delete(session);
    }

}
