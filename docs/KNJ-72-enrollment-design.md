## KNJ-72 - Thiết kế dữ liệu ghi danh học viên

### Bảng enrollments
- id: Khóa chính
- class_id: Khóa ngoại tới training_classes
- student_id: Khóa ngoại tới học viên (xác định bảng sau khi thống nhất Backend)
- enrolled_at: Ngày giờ ghi danh
- enrolled_by: Người thực hiện ghi danh

### Bảng training_classes
- max_students: Sĩ số tối đa của lớp (cần bổ sung nếu chưa có)

### Ràng buộc
1. UNIQUE(class_id, student_id): Không ghi danh trùng học viên trong cùng lớp.
2. Không ghi danh khi sĩ số hiện tại đạt max_students.
3. Kiểm tra học viên và lớp tồn tại.
4. Ghi nhận thời gian và tài khoản thực hiện.
5. Khi ghi danh hàng loạt, kiểm tra sĩ số và trùng lặp trong transaction để tránh vượt sĩ số khi nhiều người thao tác đồng thời.

### Ghi chú
Chưa chốt student_id tham chiếu Account hay Student cho đến khi thống nhất mô hình dữ liệu của nhóm.