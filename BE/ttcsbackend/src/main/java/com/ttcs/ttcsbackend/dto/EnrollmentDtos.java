package com.ttcs.ttcsbackend.dto;
import java.time.LocalDateTime;
import java.util.List;
public final class EnrollmentDtos {
 private EnrollmentDtos() {}
 public record SingleRequest(Long classId,Long studentId) {}
 public record BulkRequest(Long classId,List<Long> studentIds) {}
 public record CapacityRequest(Integer maxStudents) {}
 public record CapacityView(Long classId,Integer maxStudents,long enrolledCount) {}
 public record StudentOption(Long id,String name,String email) {}
 public record EnrollmentView(Long id,Long classId,Long studentId,String studentName,LocalDateTime enrolledAt,Long enrolledBy) {}
}
