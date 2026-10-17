package com.ttcs.ttcsbackend.service;
import com.ttcs.ttcsbackend.dto.EnrollmentDtos.*;
import com.ttcs.ttcsbackend.entity.*;
import com.ttcs.ttcsbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@Service
public class EnrollmentService {
 private final EnrollmentRepository entries;
 private final EnrollmentLimitRepository limits;
 private final EnrollmentClassLockRepository classes;
 private final AccountRepository accounts;
 public EnrollmentService(EnrollmentRepository e,EnrollmentLimitRepository l,EnrollmentClassLockRepository c,AccountRepository a) {
  entries=e; limits=l; classes=c; accounts=a;
 }
 private ResponseStatusException fail(HttpStatus status,String text){return new ResponseStatusException(status,text);}
 private Account actor(Long id){
  if(id==null) throw fail(HttpStatus.BAD_REQUEST,"Thiếu người thực hiện");
  Account a=accounts.findById(id).orElseThrow(()->fail(HttpStatus.NOT_FOUND,"Không tìm thấy người thực hiện"));
  String role=Objects.toString(a.getRole(),"").toUpperCase(Locale.ROOT);
  if(!Set.of("ADMIN","TRAINING_MANAGER","MANAGER","QUAN_LY_DAO_TAO").contains(role) || "INACTIVE".equalsIgnoreCase(a.getStatus()))
   throw fail(HttpStatus.FORBIDDEN,"Tài khoản không có quyền ghi danh");
  return a;
 }
 private TrainingClass lockedClass(Long id){
  if(id==null) throw fail(HttpStatus.BAD_REQUEST,"Thiếu mã lớp");
  return classes.lockClass(id).orElseThrow(()->fail(HttpStatus.NOT_FOUND,"Không tìm thấy lớp"));
 }
 private Account student(Long id){
  if(id==null) throw fail(HttpStatus.BAD_REQUEST,"Mã học viên trống");
  Account a=accounts.findById(id).orElseThrow(()->fail(HttpStatus.NOT_FOUND,"Không tìm thấy học viên "+id));
  if(!Set.of("STUDENT","HOC_VIEN").contains(Objects.toString(a.getRole(),"").toUpperCase(Locale.ROOT)))
   throw fail(HttpStatus.BAD_REQUEST,"Tài khoản "+id+" không phải học viên");
  if("INACTIVE".equalsIgnoreCase(a.getStatus())) throw fail(HttpStatus.BAD_REQUEST,"Học viên bị khóa");
  return a;
 }
 @Transactional
 public CapacityView setCapacity(Long classId,Integer max,Long actorId){
  actor(actorId); TrainingClass clazz=lockedClass(classId);
  if(max==null || max<1) throw fail(HttpStatus.BAD_REQUEST,"Sĩ số phải lớn hơn 0");
  long occupied=entries.countByTrainingClass_Id(classId);
  if(max<occupied) throw fail(HttpStatus.CONFLICT,"Sĩ số không được thấp hơn số đã ghi danh");
  EnrollmentLimit l=limits.findById(classId).orElseGet(EnrollmentLimit::new);
  l.setTrainingClass(clazz);l.setMaxStudents(max);limits.save(l);
  return new CapacityView(classId,max,occupied);
 }
 @Transactional(readOnly=true)
 public CapacityView capacity(Long classId){
  if(classId==null || !classes.existsById(classId)) throw fail(HttpStatus.NOT_FOUND,"Không tìm thấy lớp");
  return new CapacityView(classId,limits.findById(classId).map(EnrollmentLimit::getMaxStudents).orElse(null),entries.countByTrainingClass_Id(classId));
 }
 @Transactional
 public EnrollmentView enrollOne(Long classId,Long studentId,Long actorId){
  if(studentId==null) throw fail(HttpStatus.BAD_REQUEST,"Thiếu mã học viên");
  return enrollMany(classId,List.of(studentId),actorId).get(0);
 }
 @Transactional
 public List<EnrollmentView> enrollMany(Long classId,List<Long> ids,Long actorId){
  Account admin=actor(actorId);
  TrainingClass clazz=lockedClass(classId); // khóa hàng lớp để bảo vệ sức chứa khi nhiều yêu cầu đồng thời
  if("COMPLETED".equalsIgnoreCase(clazz.getStatus()) || "CANCELLED".equalsIgnoreCase(clazz.getStatus()))
   throw fail(HttpStatus.BAD_REQUEST,"Lớp đã kết thúc hoặc hủy");
  if(ids==null || ids.isEmpty() || ids.size()>500) throw fail(HttpStatus.BAD_REQUEST,"Chọn từ 1 đến 500 học viên");
  if(new HashSet<>(ids).size()!=ids.size()) throw fail(HttpStatus.CONFLICT,"Danh sách bị trùng học viên");
  var cap=limits.findById(classId).orElseThrow(()->fail(HttpStatus.BAD_REQUEST,"Chưa khai báo sĩ số lớp"));
  if(entries.countByTrainingClass_Id(classId)+ids.size()>cap.getMaxStudents()) throw fail(HttpStatus.CONFLICT,"Lớp không đủ chỗ");
  List<Enrollment> rows=new ArrayList<>();
  for(Long id:ids){
   Account s=student(id);
   if(entries.existsByTrainingClass_IdAndStudent_Id(classId,id)) throw fail(HttpStatus.CONFLICT,"Học viên "+id+" đã có trong lớp");
   Enrollment e=new Enrollment();e.setTrainingClass(clazz);e.setStudent(s);e.setEnrolledBy(admin);rows.add(e);
  }
  // Nếu có lỗi, transaction rollback toàn bộ ghi danh hàng loạt.
  return entries.saveAllAndFlush(rows).stream().map(this::view).toList();
 }
 @Transactional(readOnly=true)
 public List<EnrollmentView> list(Long classId){
  if(classId==null || !classes.existsById(classId)) throw fail(HttpStatus.NOT_FOUND,"Không tìm thấy lớp");
  return entries.findByTrainingClass_IdOrderByEnrolledAtAsc(classId).stream().map(this::view).toList();
 }
 @Transactional(readOnly=true)
 public List<StudentOption> students(){
  return accounts.findAll().stream().filter(a->a.getRole()!=null && Set.of("STUDENT","HOC_VIEN").contains(a.getRole().toUpperCase(Locale.ROOT)))
   .filter(a->!"INACTIVE".equalsIgnoreCase(a.getStatus()))
   .map(a->new StudentOption(a.getId(),a.getFullName(),a.getEmail())).toList();
 }
 private EnrollmentView view(Enrollment e){
  return new EnrollmentView(e.getId(),e.getTrainingClass().getId(),e.getStudent().getId(),e.getStudent().getFullName(),e.getEnrolledAt(),e.getEnrolledBy().getId());
 }
}
