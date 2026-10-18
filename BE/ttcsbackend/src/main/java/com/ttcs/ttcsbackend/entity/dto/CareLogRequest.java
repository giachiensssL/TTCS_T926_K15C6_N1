package com.ttcs.ttcsbackend.dto;

import java.time.LocalDateTime;

public class CareLogRequest {

    private String type; // CALL, MESSAGE, MEETING
    private String content; // Nội dung tương tác
    private LocalDateTime interactionTime; // Thời điểm tương tác
    private String counselorName; // Tên người tư vấn
    private LocalDateTime nextCallbackDate; // Đặt ngày nhắc gọi lại tiếp theo (tùy chọn)
    private String newStatus; // Cập nhật trạng thái lead (tùy chọn)

    public CareLogRequest() {
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

    public LocalDateTime getNextCallbackDate() {
        return nextCallbackDate;
    }

    public void setNextCallbackDate(LocalDateTime nextCallbackDate) {
        this.nextCallbackDate = nextCallbackDate;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }
}
