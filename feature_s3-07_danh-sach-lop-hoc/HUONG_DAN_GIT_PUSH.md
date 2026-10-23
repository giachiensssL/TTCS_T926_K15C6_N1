# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 3 (SPRINT 3)
## 👤 Thành viên: Linh Việt Anh
> **Quy ước đặt tên nhánh:** `feature/s3-07-danh-sach-lop-hoc`  
> **Chức năng:** Xem danh sách lớp kèm bộ lọc & chỉ số tiến độ  
> **User Story:** Là Quản lý đào tạo, tôi muốn xem danh sách lớp kèm bộ lọc và chỉ số nhanh, để nắm được tình hình toàn bộ các lớp đang chạy trong một màn hình.  
> **Điểm Story Point:** 3 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s3-07-danh-sach-lop-hoc
git checkout -b feature/s3-07-danh-sach-lop-hoc

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s3-07): Xem danh sách lớp kèm bộ lọc & chỉ số tiến độ"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s3-07-danh-sach-lop-hoc
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s3-07-danh-sach-lop-hoc`
4. Điền tiêu đề PR:
   `[Tuần 3] s3-07: Xem danh sách lớp kèm bộ lọc & chỉ số tiến độ - Linh Việt Anh`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Lọc theo trạng thái, chương trình, giảng viên, khoảng thời gian
- • Mỗi dòng hiển thị sĩ số hiện tại trên sĩ số tối đa và tiến độ buổi học

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/academic.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/ClassesPage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
