# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 3 (SPRINT 3)
## 👤 Thành viên: Nguyễn Hải Anh
> **Quy ước đặt tên nhánh:** `feature/s3-06-ghi-danh-hoc-vien`  
> **Chức năng:** Ghi danh học viên vào lớp đơn lẻ hoặc hàng loạt  
> **User Story:** Là Quản lý đào tạo, tôi muốn ghi danh học viên vào lớp, đơn lẻ hoặc hàng loạt, để xếp cả nhóm học viên vừa nhập học vào lớp trong một thao tác.  
> **Điểm Story Point:** 5 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s3-06-ghi-danh-hoc-vien
git checkout -b feature/s3-06-ghi-danh-hoc-vien

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s3-06): Ghi danh học viên vào lớp đơn lẻ hoặc hàng loạt"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s3-06-ghi-danh-hoc-vien
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s3-06-ghi-danh-hoc-vien`
4. Điền tiêu đề PR:
   `[Tuần 3] s3-06: Ghi danh học viên vào lớp đơn lẻ hoặc hàng loạt - Nguyễn Hải Anh`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Chọn nhiều học viên để ghi danh cùng lúc
- • Chặn ghi danh khi lớp đã đủ sĩ số hoặc học viên đã ở trong lớp
- • Ghi nhận ngày ghi danh và người thực hiện

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/academic.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/ClassesPage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
