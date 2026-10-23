# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 2 (SPRINT 2)
## 👤 Thành viên: Dương Quý Dương
> **Quy ước đặt tên nhánh:** `feature/s2-02-cap-nhat-ho-so`  
> **Chức năng:** Xem & cập nhật hồ sơ cá nhân người dùng  
> **User Story:** Là người dùng của hệ thống, tôi muốn xem và cập nhật hồ sơ cá nhân, để thông tin liên lạc của tôi luôn đúng để trung tâm gọi được khi cần.  
> **Điểm Story Point:** 3 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s2-02-cap-nhat-ho-so
git checkout -b feature/s2-02-cap-nhat-ho-so

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s2-02): Xem & cập nhật hồ sơ cá nhân người dùng"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s2-02-cap-nhat-ho-so
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s2-02-cap-nhat-ho-so`
4. Điền tiêu đề PR:
   `[Tuần 2] s2-02: Xem & cập nhật hồ sơ cá nhân người dùng - Dương Quý Dương`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Sửa được họ tên, số điện thoại, ngày sinh, địa chỉ
- • Không tự đổi được email và vai trò
- • Kiểm tra định dạng số điện thoại Việt Nam

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/users.routes.js`

**Phía Frontend Client:**
- `Frontend/src/components/UserProfileModal.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
