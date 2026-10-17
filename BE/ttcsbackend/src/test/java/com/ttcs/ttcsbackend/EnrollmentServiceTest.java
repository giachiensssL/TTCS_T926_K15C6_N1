package com.ttcs.ttcsbackend;
import com.ttcs.ttcsbackend.entity.*;
import com.ttcs.ttcsbackend.repository.*;
import com.ttcs.ttcsbackend.service.EnrollmentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest @Transactional
class EnrollmentServiceTest {
 @Autowired EnrollmentService service;
 @Autowired EnrollmentRepository entries;
 @Autowired EnrollmentLimitRepository limits;
 @Autowired AccountRepository accounts;
 @Autowired TrainingClassRepository classes;
 @Autowired TrainingProgramRepository programs;
 Long classId,adminId,student1,student2,student3;
 @BeforeEach void init(){
  Account admin=new Account();admin.setUsername("enroll-admin");admin.setRole("ADMIN");admin.setStatus("ACTIVE");adminId=accounts.save(admin).getId();
  student1=newStudent("student-a");student2=newStudent("student-b");student3=newStudent("student-c");
  TrainingProgram program=new TrainingProgram();program.setCode("TEST-ENROLL-"+System.nanoTime());program.setName("Test enrollment program");
  program=programs.save(program);
  TrainingClass clazz=new TrainingClass("TEST-CLASS-"+System.nanoTime(),"Test enrollment class","RUNNING",program);
  classId=classes.save(clazz).getId();
  service.setCapacity(classId,2,adminId);
 }
 private Long newStudent(String name){Account s=new Account();s.setUsername(name+System.nanoTime());s.setRole("STUDENT");s.setStatus("ACTIVE");return accounts.save(s).getId();}
 @Test void enrollSingleAndDuplicate(){
  assertEquals(student1,service.enrollOne(classId,student1,adminId).studentId());
  assertThrows(ResponseStatusException.class,()->service.enrollOne(classId,student1,adminId));
 }
 @Test void capacityIsEnforced(){
  service.enrollMany(classId,List.of(student1,student2),adminId);
  assertThrows(ResponseStatusException.class,()->service.enrollOne(classId,student3,adminId));
  assertEquals(2,service.capacity(classId).enrolledCount());
 }
 @Test void bulkRejectsDuplicatesBeforeInsert(){
  assertThrows(ResponseStatusException.class,()->service.enrollMany(classId,List.of(student1,student1),adminId));
  assertEquals(0,service.capacity(classId).enrolledCount());
 }
 @Test void bulkRecordsActor(){
  var rows=service.enrollMany(classId,List.of(student1,student2),adminId);
  assertEquals(2,rows.size());assertTrue(rows.stream().allMatch(x->x.enrolledBy().equals(adminId)&&x.enrolledAt()!=null));
 }
 @Test void capacityCannotFallBelowOccupancy(){
  service.enrollOne(classId,student1,adminId);
  assertThrows(ResponseStatusException.class,()->service.setCapacity(classId,0,adminId));
 }
}
