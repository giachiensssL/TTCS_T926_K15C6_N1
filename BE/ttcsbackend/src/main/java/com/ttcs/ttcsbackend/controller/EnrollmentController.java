package com.ttcs.ttcsbackend.controller;
import com.ttcs.ttcsbackend.dto.EnrollmentDtos.*;
import com.ttcs.ttcsbackend.service.EnrollmentService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api")
public class EnrollmentController {
 private final EnrollmentService service;
 public EnrollmentController(EnrollmentService s){service=s;}
 // DEMO ONLY: caller-supplied X-Actor-Id is NOT authentication. Use SecurityContext for production.
 @PostMapping("/enrollments") public ResponseEntity<EnrollmentView> single(@RequestBody SingleRequest r,@RequestHeader("X-Actor-Id") Long actor){
  return ResponseEntity.status(HttpStatus.CREATED).body(service.enrollOne(r.classId(),r.studentId(),actor));
 }
 @PostMapping("/enrollments/bulk") public ResponseEntity<List<EnrollmentView>> bulk(@RequestBody BulkRequest r,@RequestHeader("X-Actor-Id") Long actor){
  return ResponseEntity.status(HttpStatus.CREATED).body(service.enrollMany(r.classId(),r.studentIds(),actor));
 }
 @GetMapping("/enrollments/students") public List<StudentOption> students(){return service.students();}
 @GetMapping("/classes/{id}/enrollments") public List<EnrollmentView> list(@PathVariable Long id){return service.list(id);}
 @GetMapping("/classes/{id}/capacity") public CapacityView capacity(@PathVariable Long id){return service.capacity(id);}
 @PutMapping("/classes/{id}/capacity") public CapacityView setCapacity(@PathVariable Long id,@RequestBody CapacityRequest r,@RequestHeader("X-Actor-Id") Long actor){
  return service.setCapacity(id,r.maxStudents(),actor);
 }
}
