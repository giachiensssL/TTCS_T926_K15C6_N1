package com.ttcs.ttcsbackend.dto;

public record AttendanceRosterStudentDto(
        Long studentId,
        String studentCode,
        String fullName,
        Long enrollmentId,
        String classCode,
        String className) {
}
