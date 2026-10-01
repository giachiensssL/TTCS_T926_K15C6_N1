import type { ReactNode } from "react";
import type { Permission, UserRole } from "../rbac/permissions";
import { hasPermission } from "../rbac/hasPermission";

// Các dữ liệu PermissionGuard nhận vào
interface PermissionGuardProps {
  role: UserRole | null | undefined;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * S1-05 - Phân quyền theo vai trò
 *
 * Component kiểm tra quyền trước khi hiển thị chức năng.
 *
 * Có quyền      -> hiển thị chức năng
 * Không có quyền -> ẩn chức năng hoặc hiển thị fallback
 */
export default function PermissionGuard({
  role,
  permission,
  children,
  fallback = null
}: PermissionGuardProps) {

  // Kiểm tra role hiện tại có permission yêu cầu hay không
  const allowed = hasPermission(role, permission);

  // Không có quyền
  if (!allowed) {
    return <>{fallback}</>;
  }

  // Có quyền
  return <>{children}</>;
}