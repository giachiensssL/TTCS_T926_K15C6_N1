package com.ttcs.ttcsbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_class_enrollments")
public class StudentClassEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String classCode; // Mã lớp, vd: REACT-K15, SPRING-K10

    @Column(nullable = false)
    private String className; // Tên lớp, vd: Khóa học React & TypeScript chuyên sâu

    private String teacherName; // Tên giảng viên

    private String schedule; // Lịch học, vd: T2-T4-T6 (18:00 - 20:00)

    private String room; // Phòng học, vd: Lab 202

    private LocalDate startDate;

    private LocalDate endDate;

    // Trạng thái lớp đối với học viên: DANG_HOC (Đang học), HOAN_THANH (Hoàn thành / Đã học), BAO_LUU (Bảo lưu), HUY (Hủy)
    @Column(nullable = false)
    private String status = "DANG_HOC";

    private Double finalGrade; // Điểm tổng kết

    public StudentClassEnrollment() {
    }

    public StudentClassEnrollment(Student student, String classCode, String className, String teacherName, String schedule, String room, LocalDate startDate, LocalDate endDate, String status, Double finalGrade) {
        this.student = student;
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

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
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
