
# KNJ-63 - Thiet ke du lieu buoi hoc

## 1. Muc tieu
Quan ly danh sach buoi hoc cua tung mon hoc.

## 2. Bang lesson_sessions

| Cot | Kieu du lieu | Rang buoc |
|---|---|---|
| id | BIGINT | PRIMARY KEY |
| subject_id | BIGINT | NOT NULL, FOREIGN KEY |
| session_number | INT | NOT NULL, > 0 |
| topic | VARCHAR(255) | NOT NULL |
| objectives | TEXT | NOT NULL |
| created_at | DATETIME | Ngay tao |
| updated_at | DATETIME | Ngay cap nhat |

## 3. Quan he du lieu
- Mot mon hoc co nhieu buoi hoc.
- Moi buoi hoc thuoc mot mon hoc.
- subject_id tham chieu den bang mon hoc.
- UNIQUE(subject_id, session_number).

## 4. Quy tac nghiep vu
- Khong duoc tao vuot so buoi cua mon hoc.
- Khong duoc trung so thu tu buoi trong cung mon.
- Cho phep nhan ban danh sach buoi hoc tu mon khac.
- Kiem tra gioi han va trung lap trong transaction.

## 5. Phu thuoc can xac nhan
- Ten Entity mon hoc: chua xac nhan.
- Ten bang mon hoc: chua xac nhan.
- Truong tong so buoi: chua xac nhan.
- Quy tac ghi de khi nhan ban: chua xac nhan.

## 6. Trang thai
Ban thiet ke du kien - cho thong nhat voi KNJ-46.
