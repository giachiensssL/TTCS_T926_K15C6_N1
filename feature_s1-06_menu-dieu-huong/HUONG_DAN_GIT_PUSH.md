# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 1 (SPRINT 1)
## 👤 Thành viên: Bùi Nguyễn Tuấn Anh
> **Quy ước đặt tên nhánh:** `feature/s1-06-menu-dieu-huong`  
> **Chức năng:** Menu điều hướng phân quyền & responsive 360px  
> **User Story:** Là người dùng của hệ thống, tôi muốn thấy menu điều hướng đúng theo quyền của mình, để không bị rối bởi những chức năng mình không được dùng.  
> **Điểm Story Point:** 5 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s1-06-menu-dieu-huong
git checkout -b feature/s1-06-menu-dieu-huong

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s1-06): Menu điều hướng phân quyền & responsive 360px"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s1-06-menu-dieu-huong
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s1-06-menu-dieu-huong`
4. Điền tiêu đề PR:
   `[Tuần 1] s1-06: Menu điều hướng phân quyền & responsive 360px - Bùi Nguyễn Tuấn Anh`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Mục menu không thuộc quyền thì không hiển thị
- • Hiển thị tên và vai trò người đang đăng nhập
- • Dùng được thuận tiện trên màn hình 360px

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/roles.routes.js`

**Phía Frontend Client:**
- `Frontend/src/components/Layout.tsx`
- `Frontend/src/App.css`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
