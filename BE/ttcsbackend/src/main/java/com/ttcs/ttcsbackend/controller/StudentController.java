package com.ttcs.ttcsbackend.controller;

import com.ttcs.ttcsbackend.dto.StudentProfileResponse;
import com.ttcs.ttcsbackend.dto.StudentUpdateRequest;
import com.ttcs.ttcsbackend.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * Tìm kiếm theo mã học viên, tên, số điện thoại (+ lọc trạng thái, trình độ đầu vào)
     */
    @GetMapping
    public ResponseEntity<Page<StudentProfileResponse>> searchStudents(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String entryLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<StudentProfileResponse> result = studentService.searchStudents(keyword, status, entryLevel, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * Xem chi tiết trang hồ sơ (thông tin cá nhân, trình độ, ghi chú, lớp đang học, lịch sử lớp học)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentProfile(@PathVariable Long id) {
        return studentService.getStudentProfile(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Xem hồ sơ theo mã học viên
     */
    @GetMapping("/code/{studentCode}")
    public ResponseEntity<?> getStudentProfileByCode(@PathVariable String studentCode) {
        return studentService.getStudentProfileByCode(studentCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Sửa thông tin cá nhân, trình độ đầu vào, ghi chú
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudentProfile(
            @PathVariable Long id,
            @RequestBody StudentUpdateRequest request) {
        try {
            StudentProfileResponse updated = studentService.updateStudentProfile(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi cập nhật hồ sơ: " + e.getMessage()));
        }
    }
}
