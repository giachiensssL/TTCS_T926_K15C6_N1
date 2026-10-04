import { useEffect, useState } from "react";
import {
  getLeads,
  type Lead,
  type LeadFilter,
} from "../api/leadApi";

export default function LeadPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const [filters, setFilters] = useState<LeadFilter>({
    keyword: "",
    status: "",
    source: "",
    assignedTo: "",
    fromDate: "",
    toDate: "",
  });

  const loadLeads = async () => {
    const data = await getLeads(filters);
    setLeads(data);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    loadLeads();
  };

  const handleReset = async () => {
    const emptyFilters: LeadFilter = {
      keyword: "",
      status: "",
      source: "",
      assignedTo: "",
      fromDate: "",
      toDate: "",
    };

    setFilters(emptyFilters);

    const data = await getLeads(emptyFilters);
    setLeads(data);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Quản lý Lead</h1>

      <p>Tìm kiếm và lọc Lead theo nhiều điều kiện</p>

      <hr />

      {/* TÌM KIẾM */}
      <div>
        <h3>Tìm kiếm nhanh</h3>

        <input
          type="text"
          name="keyword"
          value={filters.keyword}
          onChange={handleChange}
          placeholder="Nhập tên hoặc số điện thoại"
        />

        <button onClick={handleSearch}>
          Tìm kiếm
        </button>
      </div>

      <br />

      {/* BỘ LỌC */}
      <div>
        <h3>Bộ lọc</h3>

        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="New">Mới</option>
          <option value="Contacted">Đã liên hệ</option>
          <option value="Interested">Quan tâm</option>
          <option value="Converted">Đã chuyển đổi</option>
          <option value="Lost">Không thành công</option>
        </select>

        <select
          name="source"
          value={filters.source}
          onChange={handleChange}
        >
          <option value="">Tất cả nguồn</option>
          <option value="Facebook">Facebook</option>
          <option value="Website">Website</option>
          <option value="Zalo">Zalo</option>
        </select>

        <select
          name="assignedTo"
          value={filters.assignedTo}
          onChange={handleChange}
        >
          <option value="">Tất cả người phụ trách</option>
          <option value="Trần Thùy Dương">
            Trần Thùy Dương
          </option>
          <option value="Nguyễn Hải Anh">
            Nguyễn Hải Anh
          </option>
        </select>

        <br />
        <br />

        <label>Từ ngày: </label>

        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleChange}
        />

        <label> Đến ngày: </label>

        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleChange}
        />

        <br />
        <br />

        <button onClick={handleSearch}>
          Áp dụng bộ lọc
        </button>

        <button
          onClick={handleReset}
          style={{ marginLeft: "10px" }}
        >
          Xóa bộ lọc
        </button>
      </div>

      <hr />

      {/* KẾT QUẢ */}
      <h3>Kết quả ({leads.length})</h3>

      <table
        border={1}
        cellPadding={10}
        style={{
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Số điện thoại</th>
            <th>Nguồn</th>
            <th>Trạng thái</th>
            <th>Người phụ trách</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>

        <tbody>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.id}</td>
                <td>{lead.name}</td>
                <td>{lead.phone}</td>
                <td>{lead.source}</td>
                <td>{lead.status}</td>
                <td>{lead.assignedTo}</td>
                <td>{lead.createdAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Không tìm thấy Lead phù hợp
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}