# Rule – Backend: Tài khoản, Phân quyền & Hồ sơ

> Phạm vi tài liệu này: **Server (Spring Boot Java hoặc NestJS TypeScript)**.
> Quy tắc giao diện xem tại `FE/Rule.md`.

---

## US-01 · Đăng nhập bằng Email & Mật khẩu

### User Story
> Là **người dùng của hệ thống**, tôi muốn **đăng nhập bằng email và mật khẩu**, để **truy cập được phần việc của mình mà không ai khác xem trộm được dữ liệu lớp học**.

---

### Endpoint

```
POST /api/auth/login
Content-Type: application/json
```

**Request body**

```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
```

---

### Acceptance Criteria

#### AC-01 · Đăng nhập thành công

**Given** email tồn tại và mật khẩu khớp với hash bcrypt trong CSDL  
**When** nhận request `POST /api/auth/login`  
**Then**:
- Trả về `200 OK`:

```json
{
  "accessToken":  "<JWT, hết hạn 15 phút>",
  "role": "TEACHER"
}
```

- `refreshToken` được set qua **`HttpOnly; Secure; SameSite=Strict` cookie**, TTL = 7 ngày.
- Không bao giờ trả mật khẩu (kể cả dạng hash) trong response.
- Ghi **Audit Log**: `event=LOGIN_SUCCESS, userId, ip, userAgent, timestamp`.

---

#### AC-02 · Sai email hoặc mật khẩu → lỗi chung

**Given** email không tồn tại **hoặc** mật khẩu sai  
**When** nhận request  
**Then**:
- Thực hiện **so sánh mật khẩu giả** (dummy bcrypt compare) khi email không tồn tại để đồng đều thời gian phản hồi, chống **Timing Attack**.
- Trả về `401 Unauthorized`:

```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Email hoặc mật khẩu không đúng."
}
```

- **Không** phân biệt "email sai" hay "mật khẩu sai" trong response.
- Tăng bộ đếm sai (`failedAttempts`) cho account (nếu email tồn tại).
- Ghi Audit Log: `event=LOGIN_FAIL, email (hash SHA-256), ip, timestamp`.

---

#### AC-03 · Khoá tạm thời sau 5 lần sai liên tiếp

**Given** `failedAttempts >= 5` trong vòng **cửa sổ 15 phút** kể từ lần sai đầu tiên  
**When** nhận request đăng nhập tiếp theo  
**Then**:
- Trả về `429 Too Many Requests`:

```json
{
  "code":         "AUTH_ACCOUNT_LOCKED",
  "message":      "Tài khoản tạm thời bị khoá.",
  "lockedUntil":  "2026-10-01T16:42:00Z"
}
```

- `lockedUntil` = thời điểm lần sai thứ 5 + 15 phút (ISO 8601 UTC).
- Trong thời gian khoá: **mọi** request đăng nhập đều bị từ chối kể cả mật khẩu đúng.
- Sau khi hết thời gian khoá: `failedAttempts` tự động reset về 0 (không cần thao tác thủ công).
- Ghi Audit Log: `event=LOGIN_BLOCKED, userId, ip, lockedUntil, timestamp`.

**Lưu trữ bộ đếm**

| Phương án | Ghi chú |
|---|---|
| **Redis** (khuyến nghị) | TTL = 15 phút, key = `auth:fail:<userId>` |
| PostgreSQL | Cột `failed_attempts INT`, `lock_until TIMESTAMPTZ` trong bảng `users` |

---

#### AC-04 · Validation phía Server

| Trường | Quy tắc |
|---|---|
| `email` | Bắt buộc, định dạng email hợp lệ (RFC 5322), độ dài ≤ 254 ký tự |
| `password` | Bắt buộc, độ dài 8–128 ký tự, không validate độ phức tạp khi đăng nhập |

- Nếu vi phạm: trả `400 Bad Request` với danh sách lỗi field cụ thể.
- Validation xảy ra **trước** khi tra cứu CSDL.

---

#### AC-05 · Tài khoản bị vô hiệu hoá bởi Admin

**Given** Admin đã đặt trạng thái tài khoản = `DISABLED`  
**When** tài khoản đó gửi request đăng nhập (kể cả mật khẩu đúng)  
**Then**:
- Trả về `403 Forbidden`:

```json
{
  "code":    "AUTH_ACCOUNT_DISABLED",
  "message": "Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên."
}
```

- **Không** tăng bộ đếm sai.

---

#### AC-06 · Bảo mật token JWT

| Thuộc tính | Giá trị |
|---|---|
| Thuật toán ký | `RS256` (asymmetric) |
| Payload `accessToken` | `sub` (userId), `role`, `iat`, `exp` (15 phút) |
| Payload `refreshToken` | `sub`, `jti` (UUID – cho phép revoke), `exp` (7 ngày) |
| `refreshToken` lưu | Bảng `refresh_tokens(jti, userId, expiresAt, revokedAt)` |
| Xoay khoá | Private key không được expose ra ngoài Server |

---

#### AC-07 · API Refresh Token

```
POST /api/auth/refresh
Cookie: refreshToken=<value>
```

- Xác minh chữ ký và `jti` còn hợp lệ trong CSDL.
- Phát hành `accessToken` mới (15 phút).
- **Rotation**: phát hành `refreshToken` mới, vô hiệu `jti` cũ ngay lập tức.
- Nếu `jti` đã bị revoke (Refresh Token Reuse Attack): revoke **toàn bộ** refresh token của user đó, trả `401`.

---

#### AC-08 · Đăng xuất

```
POST /api/auth/logout
Authorization: Bearer <accessToken>
Cookie: refreshToken=<value>
```

- Revoke `jti` của `refreshToken` trong CSDL.
- Xoá cookie phía Client (set cookie với `Max-Age=0`).
- Trả `204 No Content`.
- Ghi Audit Log: `event=LOGOUT, userId, ip, timestamp`.

---

### Sơ đồ xử lý phía Server

```
POST /api/auth/login
    │
    ├─ Validate request body (400 nếu sai)
    │
    ├─ Tìm user theo email
    │     └─ Không tìm thấy → dummy bcrypt → 401 AUTH_INVALID_CREDENTIALS
    │
    ├─ Kiểm tra trạng thái tài khoản
    │     └─ DISABLED → 403 AUTH_ACCOUNT_DISABLED
    │
    ├─ Kiểm tra khoá tạm thời (failedAttempts & lockUntil)
    │     └─ Đang bị khoá → 429 AUTH_ACCOUNT_LOCKED
    │
    ├─ So sánh bcrypt(password, hash)
    │     └─ Sai → tăng failedAttempts → (nếu ≥ 5 → set lockUntil) → 401
    │
    ├─ Đăng nhập thành công → reset failedAttempts
    │
    ├─ Ký accessToken (RS256, 15 phút)
    ├─ Ký refreshToken (RS256, 7 ngày), lưu jti vào DB
    ├─ Set HttpOnly cookie chứa refreshToken
    ├─ Ghi Audit Log LOGIN_SUCCESS
    └─ 200 OK { accessToken, role }
```

---

### Ràng buộc CSDL (PostgreSQL)

```sql
-- Bảng users (trích)
ALTER TABLE users ADD COLUMN IF NOT EXISTS
    failed_attempts   INT              NOT NULL DEFAULT 0,
    lock_until        TIMESTAMPTZ      NULL;

-- Bảng refresh_tokens
CREATE TABLE refresh_tokens (
    jti         UUID        PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Bảng audit_logs
CREATE TABLE audit_logs (
    id          BIGSERIAL   PRIMARY KEY,
    event       VARCHAR(64) NOT NULL,
    user_id     BIGINT      REFERENCES users(id) ON DELETE SET NULL,
    email_hash  VARCHAR(64),             -- SHA-256 của email, dùng khi user chưa tìm thấy
    ip_address  INET        NOT NULL,
    user_agent  TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event  ON audit_logs(event);
CREATE INDEX idx_audit_logs_time   ON audit_logs(created_at DESC);
```

---

### Ghi chú bảo mật tổng hợp

| Hạng mục | Yêu cầu |
|---|---|
| Mã hoá mật khẩu | bcrypt, cost factor ≥ 12 |
| HTTPS | Bắt buộc trên môi trường staging & production |
| Rate limiting tổng thể | Tối đa 20 request/phút/IP đến `/api/auth/login` (tầng Nginx/API Gateway) |
| Header bảo mật | `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` |
| CORS | Chỉ cho phép origin của Frontend TMS |
| Log | Không ghi mật khẩu, không ghi `accessToken` vào log file |
