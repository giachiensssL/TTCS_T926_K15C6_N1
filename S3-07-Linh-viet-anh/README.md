# S3-07 — Quản lý đào tạo: Danh sách lớp và bộ lọc

Gói này cung cấp module tham khảo để tích hợp vào dự án nhóm ASP.NET Core 8 + EF Core + SQL Server, frontend HTML/CSS/JavaScript.

## Chức năng
- Danh sách lớp đào tạo.
- Bộ lọc theo trạng thái, chương trình, giảng viên và khoảng thời gian.
- Chỉ số nhanh tính từ dữ liệu trả về: tổng lớp, lớp đang chạy, tổng học viên, lớp sắp kết thúc.
- Sĩ số `hiện tại/tối đa` và tiến độ `buổi đã học/tổng buổi`.
- Giao diện responsive, tải/lỗi/danh sách rỗng.
- API `GET /api/training/classes`.

## Cấu trúc
- `Backend/Models/TrainingClass.cs`
- `Backend/Controllers/TrainingClassesController.cs`
- `Backend/DTOs/TrainingClassDto.cs`
- `Backend/Data/ApplicationDbContext.addition.cs.txt` — đoạn cần hợp nhất vào DbContext hiện có
- `Backend/Migrations/AddTrainingClassesTable.cs.template` — mẫu migration; phải tạo migration bằng EF trên dự án thật
- `Frontend/s3-07.html`
- `Frontend/css/s3-07.css`
- `Frontend/js/s3-07.js`
- `INTEGRATION.md` — hướng dẫn tích hợp

## Quan trọng
Đây là bộ file module, chưa thể coi là đã tích hợp với database/repository của bạn cho đến khi đặt đúng namespace, thêm DbSet, tạo migration, cập nhật cấu hình CORS/ủy quyền và chạy build trên dự án thực tế. Không thay thế toàn bộ `Program.cs` hoặc `ApplicationDbContext.cs` bằng file mẫu.
