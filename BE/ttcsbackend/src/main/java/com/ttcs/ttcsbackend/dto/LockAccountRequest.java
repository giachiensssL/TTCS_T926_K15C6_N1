package com.ttcs.ttcsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LockAccountRequest(
        @NotBlank(message = "Lý do khóa tài khoản là bắt buộc")
        @Size(max = 1000, message = "Lý do khóa không được vượt quá 1000 ký tự")
        String reason) {
}
