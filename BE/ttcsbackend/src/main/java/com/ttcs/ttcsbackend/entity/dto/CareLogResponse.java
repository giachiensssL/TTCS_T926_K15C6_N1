package com.ttcs.ttcsbackend.dto;

import java.time.LocalDateTime;

public class CareLogResponse {

    private Long id;
    private Long leadId;
    private String leadName;
    private String type; // CALL, MESSAGE, MEETING
    private String content;
    private LocalDateTime interactionTime;
    private String counselorName;
    private LocalDateTime createdAt;

    public CareLogResponse() {
    }

    public CareLogResponse(Long id, Long leadId, String leadName, String type, String content, LocalDateTime interactionTime, String counselorName, LocalDateTime createdAt) {
        this.id = id;
        this.leadId = leadId;
        this.leadName = leadName;
        this.type = type;
        this.content = content;
        this.interactionTime = interactionTime;
        this.counselorName = counselorName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLeadId() {
        return leadId;
    }

    public void setLeadId(Long leadId) {
        this.leadId = leadId;
    }

    public String getLeadName() {
        return leadName;
    }

    public void setLeadName(String leadName) {
        this.leadName = leadName;
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
