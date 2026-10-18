package com.ttcs.ttcsbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String phone;

    private String email;

    private String courseInterest;

    private String source; // Facebook, Website, Zalo, Giới thiệu, Hotline

    private String status; // NEW, CONTACTED, INTERESTED, CLOSED_WON, LOST

    private String assignedTo; // Tư vấn tuyển sinh phụ trách

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime callbackDate; // Ngày giờ nhắc gọi lại

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("interactionTime DESC")
    private List<CareLog> careLogs = new ArrayList<>();

    public Lead() {
    }

    public Lead(String fullName, String phone, String email, String courseInterest, String source, String status, String assignedTo, String notes, LocalDateTime callbackDate) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.courseInterest = courseInterest;
        this.source = source;
        this.status = status;
        this.assignedTo = assignedTo;
        this.notes = notes;
        this.callbackDate = callbackDate;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (status == null || status.trim().isEmpty()) {
            status = "NEW";
        }
        if (assignedTo == null || assignedTo.trim().isEmpty()) {
            assignedTo = "Tư vấn tuyển sinh";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
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

    public List<CareLog> getCareLogs() {
        return careLogs;
    }

    public void setCareLogs(List<CareLog> careLogs) {
        this.careLogs = careLogs;
    }
}
