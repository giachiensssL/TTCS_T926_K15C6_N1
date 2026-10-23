# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 4 (SPRINT 4)
## 👤 Thành viên: Bùi Nguyễn Tuấn Anh
> **Quy ước đặt tên nhánh:** `feature/s4-05-lich-hoc-ca-nhan`  
> **Chức năng:** Học viên xem lịch học cá nhân trên máy tính & mobile  
> **User Story:** Là Học viên, tôi muốn xem lịch học của riêng mình, để biết hôm nay học phòng nào mà không phải hỏi lại lớp trưởng.  
> **Điểm Story Point:** 3 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s4-05-lich-hoc-ca-nhan
git checkout -b feature/s4-05-lich-hoc-ca-nhan

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s4-05): Học viên xem lịch học cá nhân trên máy tính & mobile"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s4-05-lich-hoc-ca-nhan
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s4-05-lich-hoc-ca-nhan`
4. Điền tiêu đề PR:
   `[Tuần 4] s4-05: Học viên xem lịch học cá nhân trên máy tính & mobile - Bùi Nguyễn Tuấn Anh`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Mặc định hiển thị buổi kế tiếp và các buổi trong tuần
- • Chỉ thấy buổi của lớp mình tham gia

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/schedules.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/SchedulePage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
