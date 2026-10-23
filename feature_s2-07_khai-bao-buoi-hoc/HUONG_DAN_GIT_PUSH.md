# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 2 (SPRINT 2)
## 👤 Thành viên: Nguyễn Hải Anh
> **Quy ước đặt tên nhánh:** `feature/s2-07-khai-bao-buoi-hoc`  
> **Chức năng:** Khai báo các buổi học và nội dung trong môn  
> **User Story:** Là Quản lý đào tạo, tôi muốn khai báo các buổi học trong một môn, để giảng viên biết buổi nào dạy chủ đề gì mà không cần hỏi lại.  
> **Điểm Story Point:** 5 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s2-07-khai-bao-buoi-hoc
git checkout -b feature/s2-07-khai-bao-buoi-hoc

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s2-07): Khai báo các buổi học và nội dung trong môn"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s2-07-khai-bao-buoi-hoc
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s2-07-khai-bao-buoi-hoc`
4. Điền tiêu đề PR:
   `[Tuần 2] s2-07: Khai báo các buổi học và nội dung trong môn - Nguyễn Hải Anh`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Mỗi buổi có số thứ tự, chủ đề, mục tiêu
- • Số buổi khai báo không vượt quá số buổi của môn học
- • Nhân bản được danh sách buổi từ một môn khác

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/academic.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/ClassesPage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
