package com.ttcs.ttcsbackend.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name="enrollments",uniqueConstraints=@UniqueConstraint(name="uq_enrollment_class_student",columnNames={"class_id","student_id"}))
public class Enrollment {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="class_id",nullable=false) private TrainingClass trainingClass;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id",nullable=false) private Account student;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="enrolled_by",nullable=false) private Account enrolledBy;
 @Column(name="enrolled_at",nullable=false,updatable=false) private LocalDateTime enrolledAt;
 @PrePersist public void beforeInsert(){if(enrolledAt==null)enrolledAt=LocalDateTime.now();}
 public Long getId(){return id;}
 public TrainingClass getTrainingClass(){return trainingClass;}
 public void setTrainingClass(TrainingClass c){trainingClass=c;}
 public Account getStudent(){return student;}
 public void setStudent(Account s){student=s;}
 public Account getEnrolledBy(){return enrolledBy;}
 public void setEnrolledBy(Account a){enrolledBy=a;}
 public LocalDateTime getEnrolledAt(){return enrolledAt;}
}
