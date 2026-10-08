package com.ttcs.ttcsbackend.dto;

public class TrainingClassRequest {

    private String code;
    private String name;
    private String status; // RUNNING, PENDING, COMPLETED, CANCELLED

    public TrainingClassRequest() {
    }

    public TrainingClassRequest(String code, String name, String status) {
        this.code = code;
        this.name = name;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
