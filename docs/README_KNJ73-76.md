# KNJ-73 đến KNJ-76 – Student enrollment (bản tích hợp thử)

## Cảnh báo tích hợp
Các tệp này viết cho code Spring Boot + React của PR #10 `feature/training-program-management`, **không phải** nhánh `dev` hiện tại. Đừng dán thẳng toàn bộ thư mục vào `dev`. Sau khi PR #10 được merge, hãy đặt từng file vào dự án của nhánh Sprint 3 và kiểm thử.

## Phần việc
- KNJ-73: `EnrollmentController`, `EnrollmentService`, repository và DTO. POST đơn lẻ/hàng loạt; GET danh sách.
- KNJ-74: Unique constraint `(class_id, student_id)`, giới hạn sĩ số ở `EnrollmentLimit`, khóa pessimistic row lớp + transaction, rollback khi bulk thất bại.
- KNJ-75: `EnrollmentManager.tsx` + CSS, chọn nhiều học viên, lọc, thiết lập sĩ số, xem đã ghi danh.
- KNJ-76: `EnrollmentServiceTest` (các tình huống ghi danh đơn, trùng, đủ chỗ, bulk, nhật ký).

## API
- POST `/api/enrollments`, body `{ "classId": 1, "studentId": 2 }`
- POST `/api/enrollments/bulk`, body `{ "classId": 1, "studentIds": [2,3] }`
- GET `/api/classes/1/enrollments`
- GET `/api/classes/1/capacity`
- PUT `/api/classes/1/capacity`, body `{ "maxStudents": 30 }`
- GET `/api/enrollments/students`

**Demo:** POST/PUT yêu cầu header `X-Actor-Id` chứa ID của Account role `ADMIN` / `TRAINING_MANAGER` / `MANAGER` / `QUAN_LY_DAO_TAO`. Header này **không an toàn** vì client tự nhập; thay bằng principal xác thực và thiết lập phân quyền Spring Security trước khi deploy. Đừng coi nó là biện pháp bảo mật thật.

## Phụ thuộc dữ liệu
- Chỉ ghi danh Account có role `STUDENT` hoặc `HOC_VIEN` và status không INACTIVE. Nhóm cần xác nhận bộ role chuẩn, bởi code PR #10 demo đang dùng ADMIN / USER.
- Bảng `class_enrollment_limits` quản lý sức chứa riêng để tránh thay đổi `TrainingClass` của nhóm khi PR #10 chưa merge. Sau khi có mô hình chính thức, cân nhắc chuyển vào `TrainingClass.maxStudents`.
- Chưa có luồng tạo Account học viên. Học viên cần được tạo trong hệ thống trước khi thử ghi danh.
- Không hỗ trợ tự động xóa Enrollment khi xóa lớp; nhóm cần chốt chính sách xóa lớp và quan hệ FK (thường nên chặn xóa lớp còn người học).

## Cài đặt sau khi PR #10 đã được merge
1. Trên máy mình `git fetch origin`, `git switch feature/KNJ-71-enrollment`, `git merge origin/dev` sau khi có PR #10.
2. Chép nội dung `BE/ttcsbackend/` trong gói này vào `BE/ttcsbackend/` của dự án và tương tự với `FE/src/components/`.
3. Trong `FE/src/App.tsx` import `EnrollmentManager` rồi thêm tab/route hiển thị `<EnrollmentManager />`. Không ghi đè App.tsx của nhóm.
4. Test Backend: `cd BE/ttcsbackend; .\mvnw.cmd test`.
5. Test FE: `cd FE; npm install; npm run build`.
6. Kiểm tra API bằng account học viên và quản lý demo hợp lệ; xác nhận số chỗ tối đa được đặt trước.
7. Commit riêng từng KNJ, push `feature/KNJ-71-enrollment`, PR vào `dev` khi build/test thực sự pass.

**Trạng thái:** Bộ mã nguồn chuẩn bị để tích hợp, chưa được chạy kiểm thử với repository hoàn chỉnh vì PR #10 vẫn chưa merge. Các thay đổi chưa được đẩy lên GitHub bởi kết nối hiện tại không có quyền Git write.
