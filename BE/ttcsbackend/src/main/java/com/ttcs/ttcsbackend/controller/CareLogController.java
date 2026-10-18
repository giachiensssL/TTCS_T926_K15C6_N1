package com.ttcs.ttcsbackend.controller;

import com.ttcs.ttcsbackend.service.CareLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/care-logs")
public class CareLogController {

    private final CareLogService careLogService;

    public CareLogController(CareLogService careLogService) {
        this.careLogService = careLogService;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCareLog(@PathVariable Long id) {
        if (!careLogService.deleteCareLog(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
