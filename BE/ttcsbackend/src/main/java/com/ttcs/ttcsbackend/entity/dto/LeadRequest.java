package com.ttcs.ttcsbackend.dto;

import java.time.LocalDateTime;

public class LeadRequest {

    private String fullName;
    private String phone;
    private String email;
    private String courseInterest;
    private String source;
    private String status;
    private String assignedTo;
    private String notes;
    private LocalDateTime callbackDate;

    public LeadRequest() {
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
}
