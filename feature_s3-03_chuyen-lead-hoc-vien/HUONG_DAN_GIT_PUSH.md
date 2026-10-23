# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 3 (SPRINT 3)
## 👤 Thành viên: Dương Quý Dương
> **Quy ước đặt tên nhánh:** `feature/s3-03-chuyen-lead-hoc-vien`  
> **Chức năng:** Chuyển lead chốt thành hồ sơ học viên chính thức  
> **User Story:** Là Tư vấn tuyển sinh, tôi muốn chuyển một lead đã chốt thành hồ sơ học viên, để không phải nhập lại thông tin khách đã cung cấp ba lần trước đó.  
> **Điểm Story Point:** 5 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s3-03-chuyen-lead-hoc-vien
git checkout -b feature/s3-03-chuyen-lead-hoc-vien

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s3-03): Chuyển lead chốt thành hồ sơ học viên chính thức"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s3-03-chuyen-lead-hoc-vien
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s3-03-chuyen-lead-hoc-vien`
4. Điền tiêu đề PR:
   `[Tuần 3] s3-03: Chuyển lead chốt thành hồ sơ học viên chính thức - Dương Quý Dương`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Dữ liệu lead được chuyển sang hồ sơ học viên, không phải nhập lại
- • Hệ thống sinh mã học viên tự động
- • Tài khoản đăng nhập cho học viên được tạo và gửi email
- • Lead chuyển sang trạng thái Đã nhập học và không sửa được nữa

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/academic.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/AdmissionsPage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
