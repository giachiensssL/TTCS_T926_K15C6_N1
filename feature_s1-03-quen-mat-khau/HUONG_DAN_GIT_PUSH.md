# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 1 (SPRINT 1)
## 👤 Thành viên: Linh Việt Anh
> **Quy ước đặt tên nhánh:** `feature/s1-03-quen-mat-khau`  
> **Chức năng:** Quên & đặt lại mật khẩu qua email token  
> **User Story:** Là người dùng của hệ thống, tôi muốn đặt lại mật khẩu khi quên thông qua email, để tự lấy lại được quyền truy cập mà không phải nhờ quản trị viên.  
> **Điểm Story Point:** 5 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s1-03-quen-mat-khau
git checkout -b feature/s1-03-quen-mat-khau

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s1-03): Quên & đặt lại mật khẩu qua email token"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s1-03-quen-mat-khau
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s1-03-quen-mat-khau`
4. Điền tiêu đề PR:
   `[Tuần 1] s1-03: Quên & đặt lại mật khẩu qua email token - Linh Việt Anh`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Nhập email nhận được liên kết đặt lại có hiệu lực 30 phút
- • Liên kết chỉ dùng được một lần
- • Email không tồn tại vẫn hiển thị cùng một thông báo, không dò được ai có tài khoản

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/auth.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/ForgotPasswordPage.tsx`
- `Frontend/src/pages/ResetPasswordPage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
