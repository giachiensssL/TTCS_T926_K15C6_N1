package com.ttcs.ttcsbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "training_classes")
public class TrainingClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "instructor_account_id", nullable = false)
    private Account instructor;

    protected TrainingClass() {
    }

    public TrainingClass(String name, Account instructor) {
        this.name = name;
        this.instructor = instructor;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Account getInstructor() {
        return instructor;
    }
}
