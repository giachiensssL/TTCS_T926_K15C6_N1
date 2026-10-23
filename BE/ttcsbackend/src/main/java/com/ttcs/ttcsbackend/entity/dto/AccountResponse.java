package com.ttcs.ttcsbackend.dto;

import java.time.Instant;
import java.util.List;

public class AccountResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String status;
    private String lockReason;
    private Instant lockedAt;
    private List<String> classesToHandover;

    public AccountResponse() {
    }

    public AccountResponse(
            Long id,
            String username,
            String email,
            String fullName,
            String role,
            String status,
            String lockReason,
            Instant lockedAt,
            List<String> classesToHandover) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.status = status;
        this.lockReason = lockReason;
        this.lockedAt = lockedAt;
        this.classesToHandover = classesToHandover;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public String getLockReason() {
        return lockReason;
    }

    public Instant getLockedAt() {
        return lockedAt;
    }

    public List<String> getClassesToHandover() {
        return classesToHandover;
    }
}