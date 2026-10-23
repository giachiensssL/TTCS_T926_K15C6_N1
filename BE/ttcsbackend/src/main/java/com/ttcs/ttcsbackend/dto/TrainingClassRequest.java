package com.ttcs.ttcsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TrainingClassRequest(
        @NotBlank @Size(max = 200) String name,
        @NotNull Long instructorAccountId) {
}
