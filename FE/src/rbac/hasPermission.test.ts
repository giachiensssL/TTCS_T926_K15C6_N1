import { describe, expect, it } from "vitest";
import { hasPermission } from "./hasPermission";

describe("S1-05 - Kiểm thử phân quyền theo vai trò", () => {

  it("Admin được phép sử dụng tất cả chức năng", () => {
    expect(hasPermission("Admin", "grade.edit")).toBe(true);
    expect(hasPermission("Admin", "tuition.edit")).toBe(true);
  });

  it("Giảng viên được sửa điểm", () => {
    expect(hasPermission("Teacher", "grade.edit")).toBe(true);
  });

  it("Kế toán không được sửa điểm", () => {
    expect(hasPermission("Accountant", "grade.edit")).toBe(false);
  });

  it("Kế toán được sửa học phí", () => {
    expect(hasPermission("Accountant", "tuition.edit")).toBe(true);
  });

  it("Vai trò không xác định phải bị từ chối", () => {
    expect(hasPermission(undefined, "grade.edit")).toBe(false);
  });

});