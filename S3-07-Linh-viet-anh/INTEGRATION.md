# Hướng dẫn tích hợp S3-07

## 1. Sao lưu
Sao lưu dự án trước khi thay đổi. Không chép đè `Program.cs`, `ApplicationDbContext.cs`, hoặc file có sẵn.

## 2. Chép file
Chép các file `.cs` trong `Backend/Models`, `Backend/DTOs`, `Backend/Controllers` vào thư mục tương ứng trong dự án đích. Chép `s3-07.html` vào thư mục `Frontend`, và CSS/JS vào các thư mục tương ứng. Nếu frontend của repo nằm trong thư mục con khác, điều chỉnh đường dẫn cho phù hợp.

## 3. Hợp nhất DbContext
Mở `ApplicationDbContext.cs` hiện có và thêm:
```csharp
public DbSet<TrainingClass> TrainingClasses { get; set; } = null!;
```
Đặt trong class `ApplicationDbContext`, thêm `using Backend.Models;` nếu namespace của model giữ nguyên là `Backend.Models`. Nếu dự án dùng namespace khác, sửa namespace/usings trong các file mới.

## 4. Kiểm tra Program.cs
Dự án cần có:
```csharp
builder.Services.AddControllers();
app.MapControllers();
```
Giữ nguyên middleware, xác thực, CORS và cấu hình đang có. Không thêm đăng ký DbContext trùng nếu đã tồn tại.

## 5. Tạo migration bằng EF Core
Mở terminal tại thư mục chứa `.csproj` backend:
```powershell
dotnet build
dotnet ef migrations add AddTrainingClassesTable
dotnet ef database update
```
Chỉ chạy `database update` khi đã kiểm tra connection string trỏ đúng database phát triển. Không chạy migration lên database thật khi chưa được phép. Mẫu migration đi kèm chỉ để tham khảo; ưu tiên migration do EF Core tạo từ model thực tế.

## 6. Chạy backend
```powershell
dotnet run
```
Xác định URL/port thật của backend. Trong `Frontend/js/s3-07.js`, đặt `API_BASE_URL` trùng port đó. Mặc định đang dùng `http://localhost:5290` theo môi trường dự án trước đó.

## 7. Mở frontend
Mở `Frontend/s3-07.html` bằng Live Server hoặc máy chủ frontend hiện có. Nếu gọi API bị CORS, thêm origin của Live Server vào cấu hình CORS hiện tại; không tắt CORS toàn cục.

## 8. Dữ liệu và chỉ số
Các chỉ số trên trang được tính từ danh sách API đang tải về. Khi có phân trang ở backend, nên tạo endpoint thống kê riêng để tính trên toàn bộ dữ liệu thay vì chỉ trang hiện tại.

## 9. Phân quyền
Yêu cầu nghiệp vụ chỉ dành cho Quản lý đào tạo. Trước khi đưa vào môi trường dùng chung, gắn `[Authorize(Roles = "TrainingManager")]` hoặc role thực tế của dự án vào controller và cấu hình frontend theo cơ chế xác thực đang dùng. Không tự ý đoán tên role nếu hệ thống có quy ước khác.

## 10. Kiểm thử tối thiểu
- API trả `200 OK` khi bảng đã được tạo.
- Thử lọc theo từng trường và kết hợp nhiều bộ lọc.
- Kiểm tra sĩ số và tiến độ buổi học.
- Kiểm tra ngày bắt đầu/kết thúc.
- Kiểm tra trạng thái tải, lỗi API, không có dữ liệu.
- Build backend thành công trước khi commit.
