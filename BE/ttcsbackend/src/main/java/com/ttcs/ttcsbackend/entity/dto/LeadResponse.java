package com.ttcs.ttcsbackend.dto;

import java.time.LocalDateTime;

public class LeadResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String courseInterest;
    private String source;
    private String status;
    private String assignedTo;
    private String notes;
    private LocalDateTime callbackDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Highlight & callback fields
    private boolean overdue;
    private String callbackStatus; // OVERDUE, TODAY, UPCOMING, NO_SCHEDULE
    private String overdueDuration; // e.g., "Quá hạn 2 ngày", "Quá hạn hôm nay"
    private int careLogCount;
    private CareLogResponse lastCareLog;

    public LeadResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCourseInterest() {
        return courseInterest;
    }

    public void setCourseInterest(String courseInterest) {
        this.courseInterest = courseInterest;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCallbackDate() {
        return callbackDate;
    }

    public void setCallbackDate(LocalDateTime callbackDate) {
        this.callbackDate = callbackDate;
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

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public String getCallbackStatus() {
        return callbackStatus;
    }

    public void setCallbackStatus(String callbackStatus) {
        this.callbackStatus = callbackStatus;
    }

    public String getOverdueDuration() {
        return overdueDuration;
    }

    public void setOverdueDuration(String overdueDuration) {
        this.overdueDuration = overdueDuration;
    }

    public int getCareLogCount() {
        return careLogCount;
    }

    public void setCareLogCount(int careLogCount) {
        this.careLogCount = careLogCount;
    }

    public CareLogResponse getLastCareLog() {
        return lastCareLog;
    }

    public void setLastCareLog(CareLogResponse lastCareLog) {
        this.lastCareLog = lastCareLog;
    }
}
