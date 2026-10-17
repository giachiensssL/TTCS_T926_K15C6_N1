package com.ttcs.ttcsbackend.controller;

import com.ttcs.ttcsbackend.dto.EnrollmentDtos.*;
import com.ttcs.ttcsbackend.repository.EnrollmentActorRepository;
import com.ttcs.ttcsbackend.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EnrollmentController {
    private final EnrollmentService service;
    private final EnrollmentActorRepository actors;

    public EnrollmentController(EnrollmentService service, EnrollmentActorRepository actors) {
        this.service = service;
        this.actors = actors;
    }

    // The actor ID must come from the authenticated username, never from a client-supplied header.
    private Long actorId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cần đăng nhập.");
        }
        return actors.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Không có tài khoản tương ứng với người đăng nhập."))
                .getId();
    }

    @PostMapping("/enrollments")
    public ResponseEntity<EnrollmentView> single(@RequestBody SingleRequest request,
                                                  Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.enrollOne(
                request.classId(), request.studentId(), actorId(authentication)));
    }

    @PostMapping("/enrollments/bulk")
    public ResponseEntity<List<EnrollmentView>> bulk(@RequestBody BulkRequest request,
                                                      Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.enrollMany(
                request.classId(), request.studentIds(), actorId(authentication)));
    }

    @GetMapping("/enrollments/students")
    public List<StudentOption> students() { return service.students(); }

    @GetMapping("/classes/{id}/enrollments")
    public List<EnrollmentView> list(@PathVariable Long id) { return service.list(id); }

    @GetMapping("/classes/{id}/capacity")
    public CapacityView capacity(@PathVariable Long id) { return service.capacity(id); }

    @PutMapping("/classes/{id}/capacity")
    public CapacityView setCapacity(@PathVariable Long id, @RequestBody CapacityRequest request,
                                    Authentication authentication) {
        return service.setCapacity(id, request.maxStudents(), actorId(authentication));
    }
}
