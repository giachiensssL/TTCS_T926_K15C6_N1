package com.ttcs.ttcsbackend.dto;

import java.time.LocalDateTime;

public class CallbackScheduleRequest {

    private LocalDateTime callbackDate;
    private String notes;

    public CallbackScheduleRequest() {
    }

    public LocalDateTime getCallbackDate() {
        return callbackDate;
    }

    public void setCallbackDate(LocalDateTime callbackDate) {
        this.callbackDate = callbackDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
