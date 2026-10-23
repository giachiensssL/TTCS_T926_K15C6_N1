package com.ttcs.ttcsbackend.dto;

import com.ttcs.ttcsbackend.entity.StudentOperationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record StudentOperationRequest(
        @NotNull StudentOperationType type,
        @NotBlank @Size(max = 1000) String reason,
        @NotNull LocalDate effectiveDate,
        Long sourceEnrollmentId,
        @Size(max = 100) String targetClassCode,
        @Size(max = 200) String targetClassName,
        @Size(max = 200) String targetTeacherName,
        @Size(max = 200) String targetSchedule,
        @Size(max = 200) String targetRoom,
        LocalDate targetEndDate) {
}
