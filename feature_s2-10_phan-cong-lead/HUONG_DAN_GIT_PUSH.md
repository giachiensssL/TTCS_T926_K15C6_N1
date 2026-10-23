# 🌿 HƯỚNG DẪN PUSH CODE LÊN GIT — TUẦN 2 (SPRINT 2)
## 👤 Thành viên: Bùi Nguyễn Tuấn Anh
> **Quy ước đặt tên nhánh:** `feature/s2-10-phan-cong-lead`  
> **Chức năng:** Phân công lead cho chuyên viên tư vấn  
> **User Story:** Là Quản lý đào tạo, tôi muốn phân công lead cho tư vấn viên, để mỗi khách hàng tiềm năng đều có một người chịu trách nhiệm gọi lại.  
> **Điểm Story Point:** 3 points | **Độ ưu tiên:** Must

---

### 1. 💻 CÁC LỆNH GIT THỰC HIỆN ĐỂ UP CODE LÊN NHÁNH CỦA BẠN

Mở Terminal tại thư mục gốc của dự án này và chạy tuần tự các lệnh sau:

```bash
# BƯỚC 1: Chuyển về nhánh develop (nhà phát triển) và cập nhật code mới nhất
git checkout develop
git pull origin develop

# BƯỚC 2: Tạo nhánh tính năng đúng quy ước chuẩn: feature/s2-10-phan-cong-lead
git checkout -b feature/s2-10-phan-cong-lead

# BƯỚC 3: Thêm các file code thay đổi vào Git
git add .

# BƯỚC 4: Commit với thông điệp chuẩn Conventional Commits
git commit -m "feat(s2-10): Phân công lead cho chuyên viên tư vấn"

# BƯỚC 5: Đẩy nhánh tính năng lên GitHub / GitLab
git push -u origin feature/s2-10-phan-cong-lead
```

---

### 2. 🔀 TẠO PULL REQUEST (PR) TRÊN GIAO DIỆN WEB
1. Mở trang kho lưu trữ Git của nhóm trên trình duyệt.
2. Nhấn nút **Compare & pull request** (hoặc Tạo yêu cầu kéo).
3. Thiết lập:
   - **Base (nhánh đích):** `develop`
   - **Compare (nhánh nguồn):** `feature/s2-10-phan-cong-lead`
4. Điền tiêu đề PR:
   `[Tuần 2] s2-10: Phân công lead cho chuyên viên tư vấn - Bùi Nguyễn Tuấn Anh`
5. Gửi đường dẫn PR vào nhóm chat để thành viên khác review và merge.

---

### 3. 🎯 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
- • Phân công một hoặc nhiều lead cùng lúc
- • Tư vấn viên chỉ nhìn thấy lead được giao cho mình
- • Có ghi lịch sử chuyển giao

---

### 4. 📂 CÁC FILE MÃ NGUỒN TRỌNG TÂM CỦA TÍNH NĂNG NÀY
**Phía Backend Server:**
- `Backend/src/routes/academic.routes.js`

**Phía Frontend Client:**
- `Frontend/src/pages/AdmissionsPage.tsx`

---
*Tài liệu tự động sinh chuẩn hóa quy trình Git dự án TMS.*
