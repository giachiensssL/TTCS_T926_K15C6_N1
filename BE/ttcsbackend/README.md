# TMS Spring Boot backend

## Cấu hình database

Ứng dụng cần PostgreSQL và các biến môi trường cấu hình Spring Boot:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Khi khởi động, backend tự thêm các cột và bảng phục vụ khóa tài khoản, lịch sử thay đổi trạng thái và lớp học. Tài khoản ADMIN hiện có vẫn được giữ nguyên.

## Tạo quản trị viên ban đầu

Nếu database chưa có tài khoản quản trị, cấu hình đủ các biến sau trước khi chạy backend:

- `TMS_BOOTSTRAP_ADMIN_USERNAME`
- `TMS_BOOTSTRAP_ADMIN_EMAIL`
- `TMS_BOOTSTRAP_ADMIN_PASSWORD` (tối thiểu 12 ký tự)

Tài khoản chỉ được tạo nếu username chưa tồn tại. Không đặt mật khẩu quản trị trực tiếp trong mã nguồn.
