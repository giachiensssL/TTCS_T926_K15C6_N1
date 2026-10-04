// S2-11 - API và kiểu dữ liệu cho chức năng tìm kiếm/lọc Lead

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Converted"
  | "Lost";

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: LeadStatus;
  assignedTo: string;
  createdAt: string;
}

export interface LeadFilter {
  keyword?: string;
  status?: string;
  source?: string;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
}

// Dữ liệu tạm để Frontend có thể phát triển
// trước khi API Backend hoàn thiện
const mockLeads: Lead[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    phone: "0987654321",
    email: "an@example.com",
    source: "Facebook",
    status: "New",
    assignedTo: "Trần Thùy Dương",
    createdAt: "2026-10-01",
  },
  {
    id: 2,
    name: "Trần Minh Anh",
    phone: "0912345678",
    email: "minhanh@example.com",
    source: "Website",
    status: "Contacted",
    assignedTo: "Nguyễn Hải Anh",
    createdAt: "2026-10-02",
  },
  {
    id: 3,
    name: "Lê Thu Hà",
    phone: "0968123456",
    email: "thuha@example.com",
    source: "Zalo",
    status: "Interested",
    assignedTo: "Trần Thùy Dương",
    createdAt: "2026-10-03",
  },
];

export async function getLeads(filters: LeadFilter = {}): Promise<Lead[]> {
  const keyword = filters.keyword?.trim().toLowerCase();

  return mockLeads.filter((lead) => {
    // Tìm nhanh theo tên hoặc số điện thoại
    const matchKeyword =
      !keyword ||
      lead.name.toLowerCase().includes(keyword) ||
      lead.phone.includes(keyword);

    // Lọc trạng thái
    const matchStatus =
      !filters.status || lead.status === filters.status;

    // Lọc nguồn
    const matchSource =
      !filters.source || lead.source === filters.source;

    // Lọc người phụ trách
    const matchAssignedTo =
      !filters.assignedTo ||
      lead.assignedTo === filters.assignedTo;

    // Lọc khoảng thời gian
    const matchFromDate =
      !filters.fromDate ||
      lead.createdAt >= filters.fromDate;

    const matchToDate =
      !filters.toDate ||
      lead.createdAt <= filters.toDate;

    return (
      matchKeyword &&
      matchStatus &&
      matchSource &&
      matchAssignedTo &&
      matchFromDate &&
      matchToDate
    );
  });
}