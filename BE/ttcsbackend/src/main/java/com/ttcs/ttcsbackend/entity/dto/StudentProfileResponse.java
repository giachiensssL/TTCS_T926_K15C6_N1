package com.ttcs.ttcsbackend.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.ttcs.ttcsbackend.dto.StudentOperationHistoryDto;

public class StudentProfileResponse {
    private Long id;
    private String studentCode;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private String entryLevel;
    private String note;
    private String status;

    // Danh sách lớp đang học
    private List<StudentEnrollmentDto> currentClasses = new ArrayList<>();

    // Lịch sử các lớp đã học (hoàn thành / bảo lưu / hủy)
    private List<StudentEnrollmentDto> classHistory = new ArrayList<>();
    private List<StudentOperationHistoryDto> operationHistory = new ArrayList<>();

    public StudentProfileResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentCode() {
        return studentCode;
    }

    public void setStudentCode(String studentCode) {
        this.studentCode = studentCode;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEntryLevel() {
        return entryLevel;
    }

    public void setEntryLevel(String entryLevel) {
        this.entryLevel = entryLevel;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<StudentEnrollmentDto> getCurrentClasses() {
        return currentClasses;
    }

    public void setCurrentClasses(List<StudentEnrollmentDto> currentClasses) {
        this.currentClasses = currentClasses;
    }

    public List<StudentEnrollmentDto> getClassHistory() {
        return classHistory;
    }

    public void setClassHistory(List<StudentEnrollmentDto> classHistory) {
        this.classHistory = classHistory;
    }

    public List<StudentOperationHistoryDto> getOperationHistory() {
        return operationHistory;
    }

    public void setOperationHistory(List<StudentOperationHistoryDto> operationHistory) {
        this.operationHistory = operationHistory;
    }
}
