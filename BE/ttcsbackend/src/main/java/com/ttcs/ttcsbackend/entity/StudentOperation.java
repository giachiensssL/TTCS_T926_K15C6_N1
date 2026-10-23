package com.ttcs.ttcsbackend.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "student_operations")
public class StudentOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private StudentOperationType type;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_enrollment_id")
    private StudentClassEnrollment sourceEnrollment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_enrollment_id")
    private StudentClassEnrollment targetEnrollment;

    @Column(nullable = false)
    private Instant recordedAt;

    protected StudentOperation() {
    }

    public StudentOperation(
            Student student,
            StudentOperationType type,
            String reason,
            LocalDate effectiveDate,
            StudentClassEnrollment sourceEnrollment,
            StudentClassEnrollment targetEnrollment,
            Instant recordedAt) {
        this.student = student;
        this.type = type;
        this.reason = reason;
        this.effectiveDate = effectiveDate;
        this.sourceEnrollment = sourceEnrollment;
        this.targetEnrollment = targetEnrollment;
        this.recordedAt = recordedAt;
    }

    public Long getId() {
        return id;
    }

    public Student getStudent() {
        return student;
    }

    public StudentOperationType getType() {
        return type;
    }

    public String getReason() {
        return reason;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public StudentClassEnrollment getSourceEnrollment() {
        return sourceEnrollment;
    }

    public StudentClassEnrollment getTargetEnrollment() {
        return targetEnrollment;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }
}
