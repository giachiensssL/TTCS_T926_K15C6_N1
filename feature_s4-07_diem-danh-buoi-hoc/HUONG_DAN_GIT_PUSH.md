# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 4 (SPRINT 4)
## 👤 Thành viên: Dương Quý Dương
> **Quy ước đặt tên nhánh:** `feature/s4-07-diem-danh-buoi-hoc`  
> **Chức năng:** Điểm danh học viên theo danh sách buổi học  
> **User Story:** Là Giảng viên, tôi muốn điểm danh học viên cho một buổi học, để hoàn tất điểm danh trong một phút đầu giờ thay vì mất mười phút gọi tên.  
> **Điểm Story Point:** 8 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s4-07-diem-danh-buoi-hoc
git checkout -b feature/s4-07-diem-danh-buoi-hoc

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s4-07): Điểm danh học viên theo danh sách buổi học"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s4-07-diem-danh-buoi-hoc
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s4-07-diem-danh-buoi-hoc`
4. Điền tiêu đề PR:
   `[Tuần 4] s4-07: Điểm danh học viên theo danh sách buổi học - Dương Quý Dương`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Bốn trạng thái: Có mặt, Đi muộn, Vắng có phép, Vắng không phép
- • Có nút đánh dấu tất cả có mặt rồi chỉnh vài trường hợp ngoại lệ
- • Mặc định chỉ điểm danh được buổi của ngày hôm nay; sửa buổi quá khứ cần quyền Quản lý đào tạo
- • Sửa điểm danh đã lưu được ghi vào nhật ký
- • Dùng được thuận tiện trên màn hình 360px

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/schedules.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/SchedulePage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
