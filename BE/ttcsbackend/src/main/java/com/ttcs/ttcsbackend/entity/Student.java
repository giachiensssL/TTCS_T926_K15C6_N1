package com.ttcs.ttcsbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String studentCode; // Mã học viên, vd: HV001, HV002

    @Column(nullable = false)
    private String fullName;

    private String email;

    @Column(nullable = false)
    private String phone;

    private String gender; // Nam, Nữ, Khác

    private LocalDate dateOfBirth;

    private String address;

    // Trình độ đầu vào (vd: Mất gốc, Cơ bản, Tiền trung cấp, IELTS 4.0, v.v.)
    private String entryLevel;

    // Ghi chú về học viên (mục tiêu học tập, định hướng, lưu ý của tư vấn viên / giảng viên)
    @Column(length = 1000)
    private String note;

    // Trạng thái: DANG_HOC (Đang học), BAO_LUU (Bảo lưu), DA_TOT_NGHIEP (Đã tốt nghiệp), DA_NGHI (Đã nghỉ)
    private String status = "DANG_HOC";

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<StudentClassEnrollment> enrollments = new ArrayList<>();

    public Student() {
    }

    public Student(String studentCode, String fullName, String email, String phone, String gender, LocalDate dateOfBirth, String address, String entryLevel, String note, String status) {
        this.studentCode = studentCode;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.address = address;
        this.entryLevel = entryLevel;
        this.note = note;
        this.status = status;
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

    public List<StudentClassEnrollment> getEnrollments() {
        return enrollments;
    }

    public void setEnrollments(List<StudentClassEnrollment> enrollments) {
        this.enrollments = enrollments;
    }
}
