
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

    // Kiem tra thong tin buoi hoc hop le
    private void validateSession(
            Integer sessionNumber,
            String topic,
            String objectives) {

        if (sessionNumber == null || sessionNumber < 1 ||
                topic == null || topic.isBlank() ||
                objectives == null || objectives.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thong tin buoi hoc khong hop le"
            );
        }

        if (topic.length() > 255) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chu de khong duoc vuot qua 255 ky tu"
            );
        }
    }

    // KNJ-64: Lay danh sach buoi hoc theo mon
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

    // KNJ-64 + KNJ-65: Them buoi hoc moi
    @Transactional
    public SessionResponse createSession(
            Long subjectId,
            Integer sessionNumber,
            String topic,
            String objectives) {

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mon hoc khong ton tai"
                ));

        // Kiem tra du lieu dau vao
        validateSession(sessionNumber, topic, objectives);

        // KNJ-65: Khong cho vuot tong so buoi
        if (sessionNumber > subject.getTotalSessions()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "So thu tu buoi hoc vuot gioi han cua mon hoc"
            );
        }

        // Khong cho phep trung so thu tu
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

    // KNJ-64 + KNJ-65: Sua thong tin buoi hoc
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

        // Kiem tra du lieu dau vao
        validateSession(sessionNumber, topic, objectives);

        Long subjectId = session.getSubject().getId();

        // KNJ-65: Kiem tra gioi han khi sua
        if (sessionNumber > session.getSubject().getTotalSessions()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "So thu tu buoi hoc vuot gioi han cua mon hoc"
            );
        }

        // Kiem tra trung so thu tu, bo qua buoi dang sua
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

    // KNJ-64: Xoa buoi hoc
    @Transactional
    public void deleteSession(Long id) {

        LessonSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Buoi hoc khong ton tai"
                ));

        sessionRepository.delete(session);
    }
    
    // KNJ-66: Nhan ban danh sach buoi hoc tu mon khac
    @Transactional
    public List<SessionResponse> copySessions(
            Long sourceSubjectId,
            Long targetSubjectId) {

        // Khong cho phep sao chep vao chinh mon do
        if (sourceSubjectId.equals(targetSubjectId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Khong the nhan ban vao cung mot mon hoc"
            );
        }

        // Kiem tra mon nguon
        if (!subjectRepository.existsById(sourceSubjectId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Mon hoc nguon khong ton tai"
            );
        }

        // Kiem tra mon dich
        Subject target = subjectRepository.findById(targetSubjectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mon hoc dich khong ton tai"
                ));

        // Lay danh sach buoi hoc cua mon nguon
        List<LessonSession> sourceSessions = sessionRepository
                .findBySubjectIdOrderBySessionNumberAsc(sourceSubjectId);

        if (sourceSessions.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mon hoc nguon chua co buoi hoc"
            );
        }

        // Kiem tra gioi han va trung so thu tu
        for (LessonSession source : sourceSessions) {

            Integer number = source.getSessionNumber();

            if (number > target.getTotalSessions()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "So buoi vuot gioi han mon dich"
                );
            }

            if (sessionRepository
                    .existsBySubjectIdAndSessionNumber(
                            targetSubjectId, number)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Mon dich da co buoi so " + number
                );
            }
        }

        // Kiem tra tong so buoi sau nhan ban
        long existingCount =
                sessionRepository.countBySubjectId(targetSubjectId);

        if (existingCount + sourceSessions.size()
                > target.getTotalSessions()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tong so buoi vuot gioi han mon dich"
            );
        }

        // Tao cac buoi hoc moi
        List<LessonSession> copies = new java.util.ArrayList<>();

        for (LessonSession source : sourceSessions) {
            LessonSession copy = new LessonSession();

            copy.setSubject(target);
            copy.setSessionNumber(source.getSessionNumber());
            copy.setTopic(source.getTopic());
            copy.setObjectives(source.getObjectives());

            copies.add(copy);
        }

        // Luu danh sach vao database
        List<LessonSession> saved =
                sessionRepository.saveAll(copies);

        return saved.stream()
                .map(this::toResponse)
                .toList();
    }

}
