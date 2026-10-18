package com.ttcs.ttcsbackend.controller;

import com.ttcs.ttcsbackend.dto.*;
import com.ttcs.ttcsbackend.service.CareLogService;
import com.ttcs.ttcsbackend.service.LeadService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;
    private final CareLogService careLogService;

    public LeadController(LeadService leadService, CareLogService careLogService) {
        this.leadService = leadService;
        this.careLogService = careLogService;
    }

    // Lấy danh sách lead (hỗ trợ tìm kiếm, lọc theo trạng thái, lọc quá hạn, phân trang)
    @GetMapping
    public ResponseEntity<Page<LeadResponse>> searchLeads(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String source,
            @RequestParam(defaultValue = "ALL") String callbackFilter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LeadResponse> leads = leadService.searchLeads(search, status, source, callbackFilter, page, size);
        return ResponseEntity.ok(leads);
    }

    // Thống kê Lead, số lượng lead quá hạn gọi lại, hôm nay cần gọi, sắp tới
    @GetMapping("/stats")
    public ResponseEntity<LeadStatsResponse> getStats() {
        return ResponseEntity.ok(leadService.getStats());
    }

    // Lấy chi tiết 1 lead theo ID
    @GetMapping("/{id}")
    public ResponseEntity<LeadResponse> getLeadById(@PathVariable Long id) {
        return leadService.getLeadById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Tạo lead mới (có thể kèm ngày hẹn gọi lại)
    @PostMapping
    public ResponseEntity<LeadResponse> createLead(@RequestBody LeadRequest request) {
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        LeadResponse created = leadService.createLead(request);
        return ResponseEntity.ok(created);
    }

    // Cập nhật thông tin lead
    @PutMapping("/{id}")
    public ResponseEntity<LeadResponse> updateLead(
            @PathVariable Long id,
            @RequestBody LeadRequest request) {
        LeadResponse updated = leadService.updateLead(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // Đặt / cập nhật ngày nhắc gọi lại cho lead
    @PatchMapping("/{id}/callback")
    public ResponseEntity<LeadResponse> scheduleCallback(
            @PathVariable Long id,
            @RequestBody CallbackScheduleRequest request) {
        LeadResponse updated = leadService.scheduleCallback(id, request.getCallbackDate(), request.getNotes());
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // Xóa lead
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        if (!leadService.deleteLead(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    // Lấy danh sách nhật ký chăm sóc của một lead
    @GetMapping("/{id}/care-logs")
    public ResponseEntity<List<CareLogResponse>> getCareLogs(@PathVariable Long id) {
        return ResponseEntity.ok(careLogService.getCareLogsByLead(id));
    }

    // Ghi nhật ký chăm sóc mới cho lead (ghi loại: gọi/nhắn/gặp, nội dung, thời điểm, và đặt ngày gọi lại)
    @PostMapping("/{id}/care-logs")
    public ResponseEntity<CareLogResponse> addCareLog(
            @PathVariable Long id,
            @RequestBody CareLogRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        CareLogResponse response = careLogService.addCareLog(id, request);
        return ResponseEntity.ok(response);
    }
}
