# Hệ Thống Quản Lý Đào Tạo (Training Management System - TMS)

> **Training Management System (TMS)** là hệ thống quản lý đào tạo nội bộ trên nền tảng Web, được xây dựng nhằm số hóa và chuẩn hóa toàn bộ quy trình vận hành đào tạo tại trung tâm.

---

## 📑 Mục lục

- [1. Tổng quan](#1-tổng-quan)
- [2. Bối cảnh và vấn đề cần giải quyết](#2-bối-cảnh-và-vấn-đề-cần-giải-quyết)
- [3. Mục tiêu dự án](#3-mục-tiêu-dự-án)
- [4. Phạm vi chức năng](#4-phạm-vi-chức-năng)
  - [4.1. Phạm vi thực hiện](#41-phạm-vi-thực-hiện-in-scope)
  - [4.2. Giới hạn hệ thống](#42-giới-hạn-hệ-thống-out-of-scope)
- [5. Kiến trúc kỹ thuật và công nghệ](#5-kiến-trúc-kỹ-thuật-và-công-nghệ)
- [6. Quy trình phát triển](#6-quy-trình-phát-triển)

---

## 1. Tổng quan

Hệ thống Quản lý Đào tạo (**Training Management System - TMS**) là giải pháp phần mềm quản trị nội bộ trên nền tảng Web, được xây dựng nhằm **số hóa và đồng nhất toàn diện chu trình vận hành đào tạo** tại trung tâm.

Hệ thống kết nối và phục vụ **8 nhóm người dùng nghiệp vụ**:

| STT | Nhóm người dùng |
|---:|---|
| 1 | Khách truy cập |
| 2 | Học viên |
| 3 | Giảng viên |
| 4 | Trợ giảng |
| 5 | Tư vấn tuyển sinh |
| 6 | Kế toán |
| 7 | Quản lý đào tạo |
| 8 | Quản trị hệ thống |

TMS cung cấp một **nguồn dữ liệu tập trung duy nhất (Single Source of Truth)**, thay thế cho quy trình quản lý thủ công và dữ liệu phân tán giữa nhiều công cụ.

---

## 2. Bối cảnh và vấn đề cần giải quyết

Trước khi triển khai dự án, trung tâm vận hành dựa trên nhiều công cụ rời rạc:

- **Google Sheets:** quản lý danh sách học viên và điểm số.
- **Google Calendar:** xếp lịch học.
- **Zalo / GitHub:** giao nhận và quản lý bài tập.
- **Sổ sách kế toán:** theo dõi công nợ và thanh toán học phí.

Mô hình vận hành này dẫn đến các vấn đề chính:

### 2.1. Thiếu tính tức thời

Ban quản lý không thể nhanh chóng nắm bắt tình trạng chuyên cần hoặc tỷ lệ nợ bài tập của từng lớp theo thời gian thực.

### 2.2. Phát hiện trễ học viên có nguy cơ bỏ học

Các dấu hiệu cảnh báo như:

- Vắng học liên tiếp.
- Chậm nộp bài tập.
- Chậm đóng học phí.

được lưu trữ rải rác ở nhiều bộ phận, khiến việc phát hiện và hỗ trợ học viên có nguy cơ bỏ học bị chậm trễ.

### 2.3. Sai lệch số liệu công nợ

Bộ phận tuyển sinh và kế toán không sử dụng chung một nguồn dữ liệu thống nhất về các đợt thanh toán học phí.

### 2.4. Khó khăn trong lưu trữ và đánh giá

- Dữ liệu của các khóa học cũ khó tra cứu khi cần cấp lại bảng điểm.
- Khảo sát chất lượng giảng dạy chưa gắn định danh trực tiếp với từng giảng viên và môn học cụ thể.

---

## 3. Mục tiêu dự án

### 3.1. Chuẩn hóa vòng đời học viên

Theo dõi xuyên suốt dữ liệu từ khi tiếp nhận thông tin tư vấn (**Lead**) → nhập học → xếp lớp → điểm danh → làm bài tập → xét tốt nghiệp.

### 3.2. Tối ưu hóa thao tác vận hành

| Chỉ tiêu | Mục tiêu |
|---|---:|
| Thời gian điểm danh một buổi học | ≤ 60 giây |
| Thời gian chấm một bài tập | ≤ 3 phút |

### 3.3. Tự động hóa cảnh báo rủi ro

Hệ thống chủ động phát hiện và gắn cờ cảnh báo đối với các trường hợp:

- Học viên vắng học vượt ngưỡng.
- Học viên nợ bài tập quá hạn.

### 3.4. Minh bạch hóa tài chính

Đồng bộ bảng theo dõi công nợ học phí theo lớp, đảm bảo số liệu khớp **100%** với sổ kế toán thực tế.

### 3.5. Khảo sát chất lượng thực chất

Tự động hóa quy trình khảo sát cuối khóa, hướng tới:

- Tỷ lệ phản hồi **≥ 70%**.
- Chuẩn hóa kết quả khảo sát theo từng giảng viên đứng lớp.

---

# 4. Phạm vi chức năng

## 4.1. Phạm vi thực hiện (In-Scope)

### 🔐 4.1.1. Tài khoản và phân quyền — RBAC

- Xác thực bằng **JWT**.
- Quản trị người dùng.
- Phân quyền truy cập nghiêm ngặt tại tầng Server theo **8 vai trò**.
- Ghi nhật ký các thao tác liên quan đến dữ liệu nhạy cảm (**Audit Log**).

### 📚 4.1.2. Danh mục đào tạo

Quản lý mô hình phân cấp:

**Chương trình đào tạo → Môn học → Buổi học**

### 🎓 4.1.3. Tuyển sinh và ghi danh

- Tiếp nhận Lead tư vấn từ Landing Page.
- Quản lý phễu chăm sóc khách hàng.
- Chuyển đổi Lead thành hồ sơ học viên chính thức.

### 🏫 4.1.4. Lớp học và thời khóa biểu

- Tự động sinh lịch học theo mẫu lặp.
- Phát hiện trùng lịch phòng.
- Phát hiện trùng lịch giảng viên.
- Xử lý bảo lưu.
- Xử lý chuyển lớp.

### ✅ 4.1.5. Điểm danh và chuyên cần

- Giao diện điểm danh theo hướng **Mobile-first**, hỗ trợ từ **360px**.
- Tiếp nhận đơn xin nghỉ phép.
- Thống kê tỷ lệ chuyên cần.

### 📝 4.1.6. Bài tập và chấm điểm

- Giao bài tập.
- Cho phép nộp bài đa phiên bản.
- Chấm điểm theo **rubric** chi tiết.
- Hỗ trợ yêu cầu học viên làm lại bài.

### 🎯 4.1.7. Kết quả học tập và tốt nghiệp

- Thiết lập trọng số các thành phần điểm.
- Tự động tính điểm tổng kết môn học.
- Xuất bảng điểm.
- Xét điều kiện hoàn thành khóa học.

### 💰 4.1.8. Học phí và công nợ

- Quản lý biểu phí.
- Lập kế hoạch đóng học phí theo từng đợt.
- Ghi nhận thanh toán.
- Xuất biên lai.
- Báo cáo công nợ.

### 📊 4.1.9. Học liệu, khảo sát và báo cáo

- Quản trị tài liệu theo từng buổi học.
- Gửi thông báo trong hệ thống (**In-app Notification**).
- Gửi email nhắc lịch.
- Khảo sát đánh giá giảng viên.
- Dashboard tổng quan.

---

## 4.2. Giới hạn hệ thống (Out-of-Scope)

Các chức năng sau **không nằm trong phạm vi triển khai**:

| Hạng mục | Giới hạn |
|---|---|
| Ứng dụng di động Native | Hệ thống tập trung tối ưu trên Web Responsive |
| Cổng thanh toán trực tuyến | Chỉ ghi nhận khoản nộp thủ công qua kế toán |
| LMS phức tạp | Không phát video trực tuyến, không chấm code tự động |
| Chat thời gian thực | Không triển khai chat trực tiếp real-time |
| SSO doanh nghiệp | Không tích hợp LDAP |
| Hóa đơn điện tử VAT | Không xuất hóa đơn điện tử VAT |

---

# 5. Kiến trúc kỹ thuật và công nghệ

## 5.1. Frontend

| Thành phần | Công nghệ |
|---|---|
| Framework | **React** |
| Ngôn ngữ | **TypeScript** |
| UI / Styling | **Tailwind CSS** |
| Responsive | Hỗ trợ đa thiết bị, tối ưu từ **360px** |

## 5.2. Backend

Hệ thống sử dụng kiến trúc phân lớp và cung cấp **RESTful APIs**.

Các lựa chọn công nghệ backend:

- **Spring Boot (Java)**; hoặc
- **NestJS (TypeScript)**.

## 5.3. Cơ sở dữ liệu

**PostgreSQL** được sử dụng nhằm đảm bảo:

- Tính toàn vẹn dữ liệu.
- Giao dịch **ACID**.
- Ràng buộc khóa ngoại chặt chẽ.

## 5.4. Bảo mật và quản lý phiên

| Thành phần | Giải pháp |
|---|---|
| Xác thực | **JSON Web Tokens (JWT)** |
| Phiên làm việc | Access Token + Refresh Token |
| Mật khẩu | Mã hóa bằng **bcrypt** |
| Phân quyền | **Role-Based Access Control (RBAC)** |
| Kiểm soát truy cập | Server Endpoint |
| Theo dõi thao tác | Audit Log |

## 5.5. Lưu trữ và dịch vụ bên ngoài

- **Object Storage (S3-compatible):** lưu trữ bài tập và slide bài giảng.
- **SMTP:** gửi email thông qua hàng đợi bất đồng bộ.

---

# 6. Quy trình phát triển

Dự án áp dụng mô hình **Agile/Scrum** với các thông số:

| Thành phần | Quy mô |
|---|---:|
| Thời gian thực hiện | **8 tuần** |
| Số Sprint | **8 Sprints** |
| User Stories | **75** |
| Story Points | **350** |
| Quản lý dự án | **Jira** |
| Quản lý mã nguồn | **Git Flow** |

Quy trình phát triển tập trung vào việc chia nhỏ yêu cầu thành các User Story, triển khai theo từng Sprint và kiểm soát mã nguồn theo Git Flow.

---

## 📌 Tóm tắt hệ thống

TMS hướng tới việc xây dựng một nền tảng quản lý đào tạo tập trung, kết nối toàn bộ quy trình từ **tuyển sinh → ghi danh → quản lý lớp → điểm danh → bài tập → kết quả học tập → học phí → khảo sát → tốt nghiệp**.

Mục tiêu cốt lõi là thay thế dữ liệu phân tán bằng một hệ thống tập trung, tăng khả năng kiểm soát vận hành, hỗ trợ cảnh báo sớm và nâng cao tính minh bạch trong quản lý đào tạo.
