interface AccessDeniedProps {
  message?: string;
}

export default function AccessDenied({
  message = "Bạn không có quyền sử dụng chức năng này."
}: AccessDeniedProps) {
  return (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px"
      }}
    >
      <h2>Không có quyền truy cập</h2>

      <p>{message}</p>

      <p>
        Vui lòng liên hệ quản trị viên nếu bạn cho rằng
        tài khoản của mình cần được cấp quyền.
      </p>
    </div>
  );
}