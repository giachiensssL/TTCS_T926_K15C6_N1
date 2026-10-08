package com.ttcs.ttcsbackend.dto;

import java.time.LocalDateTime;

public class TrainingClassResponse {

    private Long id;
    private String code;
    private String name;
    private String status;
    private Long programId;
    private String programCode;
    private String programName;
    private LocalDateTime createdAt;

    public TrainingClassResponse() {
    }

    public TrainingClassResponse(Long id, String code, String name, String status, Long programId, String programCode, String programName, LocalDateTime createdAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.status = status;
        this.programId = programId;
        this.programCode = programCode;
        this.programName = programName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getProgramId() {
        return programId;
    }

    public void setProgramId(Long programId) {
        this.programId = programId;
    }

    public String getProgramCode() {
        return programCode;
    }

    public void setProgramCode(String programCode) {
        this.programCode = programCode;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
