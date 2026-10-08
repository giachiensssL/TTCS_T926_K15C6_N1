package com.ttcs.ttcsbackend.controller;

import com.ttcs.ttcsbackend.dto.TrainingClassRequest;
import com.ttcs.ttcsbackend.dto.TrainingClassResponse;
import com.ttcs.ttcsbackend.dto.TrainingProgramRequest;
import com.ttcs.ttcsbackend.dto.TrainingProgramResponse;
import com.ttcs.ttcsbackend.service.TrainingProgramService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training-programs")
@CrossOrigin(origins = "*")
public class TrainingProgramController {

    private final TrainingProgramService trainingProgramService;

    public TrainingProgramController(TrainingProgramService trainingProgramService) {
        this.trainingProgramService = trainingProgramService;
    }

    // Danh sách phân trang + tìm kiếm
    @GetMapping
    public ResponseEntity<Page<TrainingProgramResponse>> searchPrograms(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TrainingProgramResponse> result = trainingProgramService.searchPrograms(keyword, status, page, size);
        return ResponseEntity.ok(result);
    }

    // Lấy chi tiết theo ID
    @GetMapping("/{id}")
    public ResponseEntity<TrainingProgramResponse> getProgramById(@PathVariable Long id) {
        TrainingProgramResponse response = trainingProgramService.getProgramById(id);
        return ResponseEntity.ok(response);
    }

    // Khai báo / Tạo mới chương trình đào tạo
    @PostMapping
    public ResponseEntity<TrainingProgramResponse> createProgram(@RequestBody TrainingProgramRequest request) {
        TrainingProgramResponse response = trainingProgramService.createProgram(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Cập nhật thông tin chương trình đào tạo
    @PutMapping("/{id}")
    public ResponseEntity<TrainingProgramResponse> updateProgram(
            @PathVariable Long id,
            @RequestBody TrainingProgramRequest request) {
        TrainingProgramResponse response = trainingProgramService.updateProgram(id, request);
        return ResponseEntity.ok(response);
    }

    // Cập nhật trạng thái chương trình (ACTIVE: Đang áp dụng, INACTIVE: Ngừng áp dụng)
    @PatchMapping("/{id}/status")
    public ResponseEntity<TrainingProgramResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        TrainingProgramResponse response = trainingProgramService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // Xoá chương trình đào tạo
    // Ràng buộc nghiệp vụ: Chương trình đang có lớp chạy không được xoá, chỉ được ngừng áp dụng
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProgram(@PathVariable Long id) {
        trainingProgramService.deleteProgram(id);
        return ResponseEntity.ok(Map.of("message", "Xóa chương trình đào tạo thành công."));
    }

    // Lấy danh sách lớp học của chương trình
    @GetMapping("/{id}/classes")
    public ResponseEntity<List<TrainingClassResponse>> getClasses(@PathVariable Long id) {
        List<TrainingClassResponse> classes = trainingProgramService.getClassesByProgramId(id);
        return ResponseEntity.ok(classes);
    }

    // Tạo lớp học mới gắn với chương trình
    @PostMapping("/{id}/classes")
    public ResponseEntity<TrainingClassResponse> addClass(
            @PathVariable Long id,
            @RequestBody TrainingClassRequest request) {
        TrainingClassResponse response = trainingProgramService.addClassToProgram(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Cập nhật trạng thái lớp học (RUNNING, COMPLETED, CANCELLED)
    @PatchMapping("/{id}/classes/{classId}/status")
    public ResponseEntity<TrainingClassResponse> updateClassStatus(
            @PathVariable Long id,
            @PathVariable Long classId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        TrainingClassResponse response = trainingProgramService.updateClassStatus(classId, status);
        return ResponseEntity.ok(response);
    }

    // Xoá lớp học
    @DeleteMapping("/{id}/classes/{classId}")
    public ResponseEntity<Map<String, String>> deleteClass(
            @PathVariable Long id,
            @PathVariable Long classId) {
        trainingProgramService.deleteClass(classId);
        return ResponseEntity.ok(Map.of("message", "Xóa lớp học thành công."));
    }
}
