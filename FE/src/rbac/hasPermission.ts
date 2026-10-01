import {
  ROLE_PERMISSIONS,
  type Permission,
  type UserRole,
} from "./permissions";

export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission
): boolean {
  // Không có vai trò -> mặc định từ chối
  if (!role) {
    return false;
  }

  // Lấy danh sách quyền của vai trò hiện tại
  const permissions = ROLE_PERMISSIONS[role];

  // Không có cấu hình quyền -> từ chối
  if (!permissions) {
    return false;
  }

  // Admin có "*" -> được phép tất cả chức năng
  if (permissions.includes("*" as never)) {
    return true;
  }

  // Kiểm tra quyền cụ thể
  return permissions.includes(permission as never);
}