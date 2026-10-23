# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 3 (SPRINT 3)
## 👤 Thành viên: Bùi Nguyễn Tuấn Anh
> **Quy ước đặt tên nhánh:** `feature/s3-09-quan-ly-phong-hoc`  
> **Chức năng:** Quản lý phòng học & cơ sở đào tạo  
> **User Story:** Là Quản lý đào tạo, tôi muốn quản lý phòng học và liên kết phòng học trực tuyến, để không xếp lớp 30 người vào phòng chứa 20 chỗ.  
> **Điểm Story Point:** 3 points | **Độ ưu tiên:** Should

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s3-09-quan-ly-phong-hoc
git checkout -b feature/s3-09-quan-ly-phong-hoc

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s3-09): Quản lý phòng học & cơ sở đào tạo"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s3-09-quan-ly-phong-hoc
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s3-09-quan-ly-phong-hoc`
4. Điền tiêu đề PR:
   `[Tuần 3] s3-09: Quản lý phòng học & cơ sở đào tạo - Bùi Nguyễn Tuấn Anh`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Khai báo phòng vật lý với sức chứa, hoặc liên kết phòng trực tuyến
- • Cảnh báo khi sĩ số lớp vượt sức chứa phòng

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/academic.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/ClassesPage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
