# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 1 (SPRINT 1)
## 👤 Thành viên: Dương Quý Dương
> **Quy ước đặt tên nhánh:** `feature/s1-08-quan-ly-tai-khoan`  
> **Chức năng:** CRUD & tìm kiếm phân trang tài khoản người dùng  
> **User Story:** Là Quản trị hệ thống, tôi muốn tạo, sửa và tìm kiếm tài khoản người dùng, để cấp quyền truy cập cho nhân sự mới trong ngày đầu họ đi làm.  
> **Điểm Story Point:** 8 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s1-08-quan-ly-tai-khoan
git checkout -b feature/s1-08-quan-ly-tai-khoan

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s1-08): CRUD & tìm kiếm phân trang tài khoản người dùng"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s1-08-quan-ly-tai-khoan
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s1-08-quan-ly-tai-khoan`
4. Điền tiêu đề PR:
   `[Tuần 1] s1-08: CRUD & tìm kiếm phân trang tài khoản người dùng - Dương Quý Dương`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Tạo tài khoản gửi email kích hoạt kèm mật khẩu tạm
- • Email trùng bị từ chối kèm thông báo cụ thể
- • Tìm theo tên, email, số điện thoại; lọc theo vai trò và trạng thái
- • Danh sách phân trang, mặc định 20 dòng

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/users.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/UsersManagementPage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
