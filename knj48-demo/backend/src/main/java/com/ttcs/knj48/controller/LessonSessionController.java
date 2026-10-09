
package com.ttcs.knj48.controller;

import com.ttcs.knj48.service.LessonSessionService;
import com.ttcs.knj48.service.LessonSessionService.SessionResponse;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LessonSessionController {

    private final LessonSessionService service;

    public LessonSessionController(
            LessonSessionService service) {
        this.service = service;
    }

    // Du lieu nhan tu Frontend
    public record SessionRequest(
            Integer sessionNumber,
            String topic,
            String objectives
    ) {}

    // Lay danh sach buoi hoc theo mon
    @GetMapping("/subjects/{subjectId}/sessions")
    public List<SessionResponse> getSessions(
            @PathVariable Long subjectId) {

        return service.getSessions(subjectId);
    }

    // Them buoi hoc
    @PostMapping("/subjects/{subjectId}/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse createSession(
            @PathVariable Long subjectId,
            @RequestBody SessionRequest request) {

        return service.createSession(
                subjectId,
                request.sessionNumber(),
                request.topic(),
                request.objectives()
        );
    }

    // Sua buoi hoc
    @PutMapping("/sessions/{id}")
    public SessionResponse updateSession(
            @PathVariable Long id,
            @RequestBody SessionRequest request) {

        return service.updateSession(
                id,
                request.sessionNumber(),
                request.topic(),
                request.objectives()
        );
    }

    // Xoa buoi hoc
    @DeleteMapping("/sessions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSession(
            @PathVariable Long id) {

        service.deleteSession(id);
    }
    
    // KNJ-66: Nhan ban danh sach buoi hoc tu mon khac
    @PostMapping("/subjects/{targetSubjectId}/sessions/copy")
    @ResponseStatus(HttpStatus.CREATED)
    public List<SessionResponse> copySessions(
            @PathVariable Long targetSubjectId,
            @RequestBody CopySessionsRequest request) {

        return service.copySessions(
                request.sourceSubjectId(),
                targetSubjectId
        );
    }

    // Du lieu nhan tu Frontend khi nhan ban
    public record CopySessionsRequest(
            Long sourceSubjectId
    ) {}

}

