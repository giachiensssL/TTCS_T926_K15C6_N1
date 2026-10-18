package com.ttcs.ttcsbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "care_logs")
public class CareLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    @JsonIgnore
    private Lead lead;

    @Column(nullable = false)
    private String type; // CALL, MESSAGE, MEETING (Gọi, Nhắn, Gặp)

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // Nội dung tương tác

    @Column(nullable = false)
    private LocalDateTime interactionTime; // Thời điểm tương tác

    private String counselorName; // Tư vấn viên thực hiện

    private LocalDateTime createdAt;

    public CareLog() {
    }

    public CareLog(Lead lead, String type, String content, LocalDateTime interactionTime, String counselorName) {
        this.lead = lead;
        this.type = type;
        this.content = content;
        this.interactionTime = interactionTime;
        this.counselorName = counselorName;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (interactionTime == null) {
            interactionTime = LocalDateTime.now();
        }
        if (counselorName == null || counselorName.trim().isEmpty()) {
            counselorName = "Tư vấn tuyển sinh";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Lead getLead() {
        return lead;
    }

    public void setLead(Lead lead) {
        this.lead = lead;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getInteractionTime() {
        return interactionTime;
    }

    public void setInteractionTime(LocalDateTime interactionTime) {
        this.interactionTime = interactionTime;
    }

    public String getCounselorName() {
        return counselorName;
    }

    public void setCounselorName(String counselorName) {
        this.counselorName = counselorName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
