package com.ttcs.ttcsbackend.dto;

import com.ttcs.ttcsbackend.entity.StudentOperationType;

import java.time.Instant;
import java.time.LocalDate;

public record StudentOperationHistoryDto(
        Long id,
        StudentOperationType type,
        String reason,
        LocalDate effectiveDate,
        Instant recordedAt,
        Long sourceEnrollmentId,
        String sourceClassCode,
        Long targetEnrollmentId,
        String targetClassCode,
        String targetClassName) {
}
