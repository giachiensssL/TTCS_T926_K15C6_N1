# Rule – Frontend: Tài khoản, Phân quyền & Hồ sơ

> Phạm vi tài liệu này: **Giao diện (Frontend – React/TypeScript/Tailwind CSS)**.
> Quy tắc nghiệp vụ phía Server xem tại `BE/Rule.md`.

---

## US-01 · Đăng nhập bằng Email & Mật khẩu

### User Story
> Là **người dùng của hệ thống**, tôi muốn **đăng nhập bằng email và mật khẩu**, để **truy cập được phần việc của mình mà không ai khác xem trộm được dữ liệu lớp học**.

---

### Giao diện trang Đăng nhập (`/login`)

| Phần tử | Mô tả |
|---|---|
| Logo + Tên hệ thống | Hiển thị ở đầu trang |
| Trường **Email** | `type="email"`, placeholder `"Email của bạn"`, `required` |
| Trường **Mật khẩu** | `type="password"`, placeholder `"Mật khẩu"`, `required`, có nút toggle hiện/ẩn mật khẩu |
| Nút **Đăng nhập** | Loại `submit`, màu primary, hiển thị spinner khi đang gọi API |
| Liên kết **Quên mật khẩu?** | Điều hướng sang luồng US-02 |
| Vùng thông báo lỗi | Hiển thị inline phía trên nút, màu đỏ, `role="alert"` |

---

### Acceptance Criteria

#### AC-01 · Đăng nhập thành công → chuyển hướng theo vai trò

**Given** người dùng nhập đúng email và mật khẩu  
**When** nhấn nút **Đăng nhập**  
**Then**:
- Spinner hiển thị trong khi chờ phản hồi API.
- API trả về `200 OK` kèm `{ accessToken, refreshToken, role }`.
- `accessToken` lưu vào **memory** (React context / Zustand store); `refreshToken` lưu vào **`HttpOnly` cookie** (do Server set).
- Điều hướng tức thì sang trang chủ tương ứng với `role`:

| `role` | Đường dẫn chuyển hướng |
|---|---|
| `ADMIN` | `/admin/dashboard` |
| `TRAINING_MANAGER` | `/manager/dashboard` |
| `TEACHER` | `/teacher/dashboard` |
| `ASSISTANT` | `/assistant/dashboard` |
| `CONSULTANT` | `/consultant/dashboard` |
| `ACCOUNTANT` | `/accountant/dashboard` |
| `STUDENT` | `/student/dashboard` |
| `GUEST` | `/` (trang công khai) |

- Nếu URL có query param `?redirect=<path>` hợp lệ (cùng origin), ưu tiên chuyển hướng về `<path>` trước.
- Không lưu mật khẩu dưới bất kỳ hình thức nào ở phía Client.

---

#### AC-02 · Sai thông tin → hiển thị lỗi chung, không tiết lộ email tồn tại

**Given** người dùng nhập email hoặc mật khẩu sai  
**When** nhấn **Đăng nhập**  
**Then**:
- API trả về `401 Unauthorized`.
- Giao diện hiển thị đúng nội dung: **"Email hoặc mật khẩu không đúng."**
- **Không** hiển thị gợi ý như "Email chưa đăng ký" hoặc "Mật khẩu sai" (bảo vệ user enumeration).
- Trường mật khẩu tự xóa nội dung; trường email giữ nguyên để người dùng sửa.
- Spinner dừng; nút **Đăng nhập** trở lại trạng thái bình thường.
- Không redirect.

---

#### AC-03 · Khoá tài khoản tạm thời sau 5 lần sai liên tiếp

**Given** tài khoản đã sai mật khẩu **5 lần liên tiếp** (trong vòng 15 phút)  
**When** lần sai thứ 5 xảy ra  
**Then**:
- API trả về `429 Too Many Requests` với body `{ lockedUntil: "<ISO 8601 timestamp>" }`.
- Giao diện hiển thị: **"Tài khoản tạm thời bị khoá. Vui lòng thử lại sau <N> phút."** (N = số phút còn lại, làm tròn lên).
- Trường nhập và nút **Đăng nhập** bị `disabled` trong suốt thời gian khoá.
- Hiển thị **đồng hồ đếm ngược** (mm:ss) theo thời gian thực đến khi hết khoá.
- Khi đồng hồ về 0:00, tự động kích hoạt lại form mà không cần reload trang.
- **Không** reset bộ đếm nếu người dùng tải lại trang trong thời gian khoá (đồng hồ tính từ `lockedUntil` trả về).

---

#### AC-04 · Validation phía Client trước khi gọi API

| Điều kiện | Thông báo |
|---|---|
| Bỏ trống email | "Vui lòng nhập email." |
| Email sai định dạng | "Email không hợp lệ." |
| Bỏ trống mật khẩu | "Vui lòng nhập mật khẩu." |
| Mật khẩu < 8 ký tự | "Mật khẩu phải có ít nhất 8 ký tự." |

- Lỗi validation hiển thị ngay bên dưới từng trường, không cần gọi API.
- Nếu có nhiều lỗi, hiển thị song song (không chặn từng cái một).

---

#### AC-05 · Người dùng đã đăng nhập truy cập `/login`

**Given** người dùng đang có phiên hợp lệ (accessToken còn hiệu lực)  
**When** điều hướng đến `/login`  
**Then** tự động redirect ngay về trang chủ tương ứng với vai trò, **không** hiển thị trang đăng nhập.

---

#### AC-06 · Trải nghiệm trên thiết bị di động (Mobile-first ≥ 360px)

- Form đăng nhập căn giữa màn hình, chiều rộng tối đa `400px` trên màn hình lớn, `100%` trên di động.
- Bàn phím ảo trên iOS/Android không che khuất nút **Đăng nhập**.
- Các trường hỗ trợ `autocomplete="email"` và `autocomplete="current-password"` để tương thích trình quản lý mật khẩu.

---

#### AC-07 · Accessibility (a11y)

- Toàn bộ form có thể thao tác hoàn toàn bằng **bàn phím** (Tab, Shift+Tab, Enter).
- Thông báo lỗi được gắn `aria-describedby` vào trường tương ứng.
- Vùng lỗi toàn cục có `role="alert"` và `aria-live="assertive"`.
- Contrast ratio của text và nền ≥ 4.5:1 (WCAG AA).

---

### Luồng xử lý phía Client

```
Người dùng nhập → Validate Client
    ├─ Lỗi → Hiển thị lỗi inline, KHÔNG gọi API
    └─ OK  → Hiển thị spinner, gọi POST /api/auth/login
                ├─ 200 OK  → Lưu token → Redirect theo role
                ├─ 401     → Hiển thị "Email hoặc mật khẩu không đúng."
                ├─ 423 / 429 → Hiển thị đếm ngược khoá tài khoản
                └─ 5xx / Network Error → Hiển thị "Lỗi hệ thống, vui lòng thử lại sau."
```

---

### Ghi chú kỹ thuật (FE)

| Hạng mục | Quyết định |
|---|---|
| Lưu trữ token | `accessToken` → React Context/Zustand (in-memory); `refreshToken` → `HttpOnly` cookie (Server set) |
| Tự động làm mới token | Axios interceptor bắt `401`, gọi `POST /api/auth/refresh`, retry request gốc |
| Route Guard | `<PrivateRoute>` kiểm tra token trước khi render; `<RoleRoute>` kiểm tra `role` có trong danh sách cho phép |
| Thời gian khoá | Lấy từ `lockedUntil` trong response, **không** hardcode phía Client |
| Ngôn ngữ lỗi | Luôn dùng thông báo tiếng Việt thân thiện, không lộ stack trace |
