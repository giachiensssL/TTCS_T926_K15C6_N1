package com.ttcs.ttcsbackend.entity;
import jakarta.persistence.*;
@Entity @Table(name="class_enrollment_limits")
public class EnrollmentLimit {
 @Id @Column(name="class_id") private Long classId;
 @OneToOne(fetch=FetchType.LAZY,optional=false) @MapsId @JoinColumn(name="class_id") private TrainingClass trainingClass;
 @Column(name="max_students",nullable=false) private Integer maxStudents;
 public Long getClassId(){return classId;}
 public TrainingClass getTrainingClass(){return trainingClass;}
 public void setTrainingClass(TrainingClass x){trainingClass=x;}
 public Integer getMaxStudents(){return maxStudents;}
 public void setMaxStudents(Integer x){maxStudents=x;}
}
