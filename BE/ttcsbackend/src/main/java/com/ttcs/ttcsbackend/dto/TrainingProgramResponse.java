package com.ttcs.ttcsbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TrainingProgramResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer totalDuration;
    private BigDecimal standardTuition;
    private String status;
    private long runningClassesCount;
    private long totalClassesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TrainingProgramResponse() {
    }

    public TrainingProgramResponse(Long id, String code, String name, String description,
                                   Integer totalDuration, BigDecimal standardTuition, String status,
                                   long runningClassesCount, long totalClassesCount,
                                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.totalDuration = totalDuration;
        this.standardTuition = standardTuition;
        this.status = status;
        this.runningClassesCount = runningClassesCount;
        this.totalClassesCount = totalClassesCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(Integer totalDuration) {
        this.totalDuration = totalDuration;
    }

    public BigDecimal getStandardTuition() {
        return standardTuition;
    }

    public void setStandardTuition(BigDecimal standardTuition) {
        this.standardTuition = standardTuition;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getRunningClassesCount() {
        return runningClassesCount;
    }

    public void setRunningClassesCount(long runningClassesCount) {
        this.runningClassesCount = runningClassesCount;
    }

    public long getTotalClassesCount() {
        return totalClassesCount;
    }

    public void setTotalClassesCount(long totalClassesCount) {
        this.totalClassesCount = totalClassesCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
