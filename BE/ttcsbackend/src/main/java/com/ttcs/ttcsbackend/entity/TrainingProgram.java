package com.ttcs.ttcsbackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "training_programs")
public class TrainingProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "total_duration")
    private Integer totalDuration; // Thời lượng tính theo giờ

    @Column(name = "standard_tuition", precision = 15, scale = 2)
    private BigDecimal standardTuition; // Học phí chuẩn (VNĐ)

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE: Đang áp dụng, INACTIVE: Ngừng áp dụng

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TrainingClass> classes = new ArrayList<>();

    public TrainingProgram() {
    }

    public TrainingProgram(String code, String name, String description, Integer totalDuration, BigDecimal standardTuition, String status) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.totalDuration = totalDuration;
        this.standardTuition = standardTuition;
        this.status = status != null ? status : "ACTIVE";
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(Integer totalDuration) {
        this.totalDuration = totalDuration;
    }

    public BigDecimal getStandardTuition() {
        return standardTuition;
    }

    public void setStandardTuition(BigDecimal standardTuition) {
        this.standardTuition = standardTuition;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public List<TrainingClass> getClasses() {
        return classes;
    }

    public void setClasses(List<TrainingClass> classes) {
        this.classes = classes;
    }
}
