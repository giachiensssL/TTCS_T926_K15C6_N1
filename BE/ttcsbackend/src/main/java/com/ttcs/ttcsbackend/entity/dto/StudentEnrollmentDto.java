package com.ttcs.ttcsbackend.dto;

import java.time.LocalDate;

public class StudentEnrollmentDto {
    private Long id;
    private String classCode;
    private String className;
    private String teacherName;
    private String schedule;
    private String room;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status; // DANG_HOC, HOAN_THANH, BAO_LUU, HUY
    private Double finalGrade;

    public StudentEnrollmentDto() {
    }

    public StudentEnrollmentDto(Long id, String classCode, String className, String teacherName, String schedule, String room, LocalDate startDate, LocalDate endDate, String status, Double finalGrade) {
        this.id = id;
        this.classCode = classCode;
        this.className = className;
        this.teacherName = teacherName;
        this.schedule = schedule;
        this.room = room;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.finalGrade = finalGrade;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClassCode() {
        return classCode;
    }

    public void setClassCode(String classCode) {
        this.classCode = classCode;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getFinalGrade() {
        return finalGrade;
    }

    public void setFinalGrade(Double finalGrade) {
        this.finalGrade = finalGrade;
    }
}
