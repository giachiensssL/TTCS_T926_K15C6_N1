package com.ttcs.ttcsbackend.controller;

import com.ttcs.ttcsbackend.dto.TrainingClassRequest;
import com.ttcs.ttcsbackend.dto.TrainingClassResponse;
import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.entity.TrainingClass;
import com.ttcs.ttcsbackend.repository.AccountRepository;
import com.ttcs.ttcsbackend.repository.TrainingClassRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class TrainingClassController {

    private final TrainingClassRepository trainingClassRepository;
    private final AccountRepository accountRepository;

    public TrainingClassController(
            TrainingClassRepository trainingClassRepository,
            AccountRepository accountRepository) {
        this.trainingClassRepository = trainingClassRepository;
        this.accountRepository = accountRepository;
    }

    @GetMapping
    public List<TrainingClassResponse> getClasses() {
        return trainingClassRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> createClass(@Valid @RequestBody TrainingClassRequest request) {
        Account instructor = accountRepository.findById(request.instructorAccountId()).orElse(null);
        if (instructor == null || !"ACTIVE".equalsIgnoreCase(instructor.getStatus())) {
            return ResponseEntity.badRequest().body("Giảng viên không tồn tại hoặc đã bị khóa.");
        }

        TrainingClass trainingClass = trainingClassRepository.save(
                new TrainingClass(request.name().trim(), instructor));
        TrainingClassResponse response = toResponse(trainingClass);
        return ResponseEntity.created(URI.create("/api/classes/" + response.id())).body(response);
    }

    private TrainingClassResponse toResponse(TrainingClass trainingClass) {
        return new TrainingClassResponse(
                trainingClass.getId(),
                trainingClass.getName(),
                trainingClass.getInstructor().getId());
    }
}
