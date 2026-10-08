package com.ttcs.ttcsbackend.dto;

import java.math.BigDecimal;

public class TrainingProgramRequest {

    private String code;
    private String name;
    private String description;
    private Integer totalDuration;
    private BigDecimal standardTuition;
    private String status;

    public TrainingProgramRequest() {
    }

    public TrainingProgramRequest(String code, String name, String description, Integer totalDuration, BigDecimal standardTuition, String status) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.totalDuration = totalDuration;
        this.standardTuition = standardTuition;
        this.status = status;
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
}
