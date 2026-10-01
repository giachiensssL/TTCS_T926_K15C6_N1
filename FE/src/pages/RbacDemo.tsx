import { useState } from "react";
import PermissionGuard from "../components/PermissionGuard";
import AccessDenied from "../components/AccessDenied";
import type { UserRole } from "../rbac/permissions";
import { hasPermission } from "../rbac/hasPermission";

export default function RbacDemo() {
  const [currentRole, setCurrentRole] =
    useState<UserRole>("Admin");

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >
      <h1>Demo phân quyền S1-05</h1>

      <p>
        Vai trò hiện tại: <strong>{currentRole}</strong>
      </p>

      <label>
        Chọn vai trò:{" "}
        <select
          value={currentRole}
          onChange={(e) =>
            setCurrentRole(e.target.value as UserRole)
          }
        >
          <option value="Admin">Quản trị viên</option>
          <option value="Teacher">Giảng viên</option>
          <option value="Accountant">Kế toán</option>
        </select>
      </label>

      <hr />

      <h2>Quản lý điểm</h2>

      <p>
        Quyền sửa điểm:{" "}
        {hasPermission(currentRole, "grade.edit")
          ? "Có quyền"
          : "Không có quyền"}
      </p>

      <PermissionGuard
        role={currentRole}
        permission="grade.edit"
        fallback={
          <AccessDenied message="Vai trò hiện tại không được phép sửa điểm." />
        }
      >
        <button onClick={() => alert("Được phép sửa điểm")}>
          Sửa điểm
        </button>
      </PermissionGuard>

      <hr />

      <h2>Quản lý học phí</h2>

      <p>
        Quyền sửa học phí:{" "}
        {hasPermission(currentRole, "tuition.edit")
          ? "Có quyền"
          : "Không có quyền"}
      </p>

      <PermissionGuard
        role={currentRole}
        permission="tuition.edit"
        fallback={
          <AccessDenied message="Vai trò hiện tại không được phép sửa học phí." />
        }
      >
        <button onClick={() => alert("Được phép sửa học phí")}>
          Sửa học phí
        </button>
      </PermissionGuard>
    </div>
  );
}