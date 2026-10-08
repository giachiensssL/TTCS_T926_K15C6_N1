import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type UserRole =
  | 'ADMIN'
  | 'TRAINING_MANAGER'
  | 'ACCOUNTANT'
  | 'ADMISSION'
  | 'LECTURER'
  | 'TEACHING_ASSISTANT'
  | 'STUDENT'
  | 'GUEST';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserFormValues {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}

const roles: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Quản trị hệ thống' },
  { value: 'TRAINING_MANAGER', label: 'Quản lý đào tạo' },
  { value: 'ACCOUNTANT', label: 'Kế toán' },
  { value: 'ADMISSION', label: 'Tư vấn tuyển sinh' },
  { value: 'LECTURER', label: 'Giảng viên' },
  { value: 'TEACHING_ASSISTANT', label: 'Trợ giảng' },
  { value: 'STUDENT', label: 'Học viên' },
  { value: 'GUEST', label: 'Khách truy cập' },
];

const statuses: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'PENDING', label: 'Chờ kích hoạt' },
  { value: 'INACTIVE', label: 'Đã vô hiệu hóa' },
];

const emptyForm: UserFormValues = {
  fullName: '',
  email: '',
  phone: '',
  role: 'STUDENT',
  status: 'PENDING',
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message;
    throw new Error(message ?? `Yêu cầu thất bại (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function roleLabel(value: UserRole): string {
  return roles.find((role) => role.value === value)?.label ?? value;
}

function statusLabel(value: UserStatus): string {
  return statuses.find((status) => status.value === value)?.label ?? value;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

function formatToday(): string {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UserListResponse['pagination']>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormValues>(emptyForm);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setPageError('');
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
    });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (status) params.set('status', status);

    try {
      const result = await request<UserListResponse>(`/users?${params}`);
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Không thể tải danh sách tài khoản.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, role, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function openCreateModal() {
    setEditing(null);
    setForm(emptyForm);
    setModalError('');
    setModalOpen(true);
  }

  function openEditModal(user: User) {
    setEditing(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      status: user.status,
    });
    setModalError('');
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setModalError('');

    try {
      if (editing) {
        await request(`/users/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await request('/users', {
          method: 'POST',
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            phone: form.phone || undefined,
            role: form.role,
          }),
        });
      }
      setModalOpen(false);
      await loadUsers();
    } catch (error) {
      setModalError(
        error instanceof Error ? error.message : 'Không thể lưu tài khoản.',
      );
    } finally {
      setSaving(false);
    }
  }

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setRole('');
    setStatus('');
    setPage(1);
  }

  function exportCurrentPage() {
    const columns = ['Họ và tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Ngày tạo'];
    const rows = users.map((user) => [
      user.fullName,
      user.email,
      user.phone ?? '',
      roleLabel(user.role),
      statusLabel(user.status),
      formatDate(user.createdAt),
    ]);
    const csv = [columns, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const safeCell = /^[=+\-@]/.test(cell) ? `'${cell}` : cell;
            return `"${safeCell.replaceAll('"', '""')}"`;
          })
          .join(','),
      )
      .join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `tms-tai-khoan-trang-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const firstResult = pagination.total === 0 ? 0 : (page - 1) * 20 + 1;
  const lastResult = Math.min(page * 20, pagination.total);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={23} strokeWidth={2.4} /></div>
          <div className="brand-name">tms<span>.</span><small>TRAINING MANAGEMENT</small></div>
          <button className="icon-button mobile-close" aria-label="Đóng menu" onClick={() => setMobileNavOpen(false)}><X size={19} /></button>
        </div>
        <div className="sidebar-section-label">TỔNG QUAN</div>
        <nav className="side-nav" aria-label="Điều hướng chính">
          <a href="#" className="nav-item"><LayoutDashboard size={18} /> Tổng quan</a>
          <a href="#" className="nav-item"><BookOpen size={18} /> Đào tạo</a>
          <a href="#" className="nav-item"><GraduationCap size={18} /> Lớp học</a>
          <a href="#" className="nav-item"><Users size={18} /> Học viên</a>
          <div className="sidebar-section-label nav-section-spaced">HỆ THỐNG</div>
          <a href="#" className="nav-item selected"><Users size={18} /> Tài khoản <span className="nav-indicator" /></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Cần trợ giúp?</strong>
            <p>Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn.</p>
            <button type="button">Liên hệ hỗ trợ <ArrowRight size={14} /></button>
          </div>
          <div className="sidebar-user">
            <div className="avatar avatar-admin">AD</div>
            <div className="sidebar-user-info"><strong>Quản trị viên</strong><span>Administrator</span></div>
            <MoreHorizontal size={19} className="muted-icon" />
          </div>
        </div>
      </aside>
      {mobileNavOpen && <button className="mobile-backdrop" aria-label="Đóng menu" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Mở menu" onClick={() => setMobileNavOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Hệ thống</span><span className="crumb-divider">/</span><strong>Tài khoản</strong></div>
          <div className="topbar-actions">
            <span className="today-label">{formatToday()}</span>
            <button className="top-icon" aria-label="Thông báo"><Bell size={18} /><i /></button>
            <div className="top-profile"><div className="avatar avatar-admin">AD</div><ChevronDown size={15} /></div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">QUẢN TRỊ HỆ THỐNG <span>•</span> NGƯỜI DÙNG</div>
              <h1>Quản lý tài khoản</h1>
              <p>Quản lý tài khoản, vai trò và quyền truy cập trong hệ thống.</p>
            </div>
            <button className="primary-button" onClick={openCreateModal}><Plus size={17} strokeWidth={2.6} /> Tạo tài khoản</button>
          </div>

          <section className="stats-row" aria-label="Thống kê tài khoản">
            <div className="stat-card">
              <div className="stat-icon stat-blue"><Users size={19} /></div>
              <div><span>Tổng tài khoản</span><strong>{pagination.total.toLocaleString('vi-VN')}</strong></div>
              <div className="stat-note"><span className="stat-dot blue-dot" />Trong hệ thống</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-green"><Check size={19} /></div>
              <div><span>Đang hoạt động</span><strong>{users.filter((user) => user.status === 'ACTIVE').length.toLocaleString('vi-VN')}</strong></div>
              <div className="stat-note"><span className="stat-dot green-dot" />Trang hiện tại</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-amber"><Mail size={18} /></div>
              <div><span>Chờ kích hoạt</span><strong>{users.filter((user) => user.status === 'PENDING').length.toLocaleString('vi-VN')}</strong></div>
              <div className="stat-note"><span className="stat-dot amber-dot" />Trang hiện tại</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-purple"><SlidersHorizontal size={18} /></div>
              <div><span>Vai trò</span><strong>08</strong></div>
              <div className="stat-note"><span className="stat-dot purple-dot" />Đã phân quyền</div>
            </div>
          </section>

          <section className="table-card">
            <div className="table-header">
              <div><h2>Danh sách tài khoản</h2><p>Tra cứu và quản lý người dùng TMS</p></div>
              <button className="secondary-button export-button" onClick={exportCurrentPage}><ArrowDown size={15} /> Tải CSV trang này</button>
            </div>
            <div className="filter-row">
              <label className="search-box">
                <Search size={17} />
                <input
                  aria-label="Tìm theo tên, email hoặc số điện thoại"
                  placeholder="Tìm tên, email, số điện thoại..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                <kbd>⌘ K</kbd>
              </label>
              <label className="filter-select">
                <span className="sr-only">Lọc theo vai trò</span>
                <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}>
                  <option value="">Tất cả vai trò</option>
                  {roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <ChevronDown size={15} />
              </label>
              <label className="filter-select">
                <span className="sr-only">Lọc theo trạng thái</span>
                <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                  <option value="">Tất cả trạng thái</option>
                  {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <ChevronDown size={15} />
              </label>
              {(search || role || status) && <button className="clear-filter" onClick={clearFilters}>Xóa lọc</button>}
            </div>

            {pageError && <div className="inline-error"><AlertCircle size={17} />{pageError}<button onClick={() => void loadUsers()}>Thử lại</button></div>}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th className="user-column">NGƯỜI DÙNG <ArrowDown size={12} /></th>
                    <th>SỐ ĐIỆN THOẠI</th>
                    <th>VAI TRÒ</th>
                    <th>TRẠNG THÁI</th>
                    <th>NGÀY TẠO</th>
                    <th><span className="sr-only">Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="table-state"><LoaderCircle className="spinner" size={22} />Đang tải danh sách...</td></tr>
                  ) : pageError ? (
                    <tr><td colSpan={6} className="table-state">Danh sách chưa thể tải. Vui lòng thử lại.</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} className="table-state"><div className="empty-state"><Users size={25} /><strong>Chưa có tài khoản phù hợp</strong><span>Thử thay đổi điều kiện tìm kiếm hoặc tạo tài khoản mới.</span><button className="text-action" onClick={openCreateModal}>+ Tạo tài khoản</button></div></td></tr>
                  ) : users.map((user, index) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className={`avatar person-avatar avatar-tone-${index % 5}`}>{initials(user.fullName)}</div>
                          <div className="user-details"><strong>{user.fullName}</strong><span>{user.email}</span></div>
                        </div>
                      </td>
                      <td className="phone-cell">{user.phone || '—'}</td>
                      <td><span className="role-pill">{roleLabel(user.role)}</span></td>
                      <td><span className={`status-pill status-${user.status.toLowerCase()}`}><i />{statusLabel(user.status)}</span></td>
                      <td className="date-cell">{formatDate(user.createdAt)}</td>
                      <td><button className="row-action" aria-label={`Chỉnh sửa ${user.fullName}`} onClick={() => openEditModal(user)}><MoreHorizontal size={19} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>Hiển thị <strong>{firstResult}–{lastResult}</strong> trong <strong>{pagination.total}</strong> tài khoản</span>
              <div className="pagination-controls">
                <button className="page-arrow" aria-label="Trang trước" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ArrowLeft size={15} /></button>
                {Array.from({ length: Math.min(pagination.totalPages, 3) }, (_, index) => {
                  const pageNumber = pagination.totalPages <= 3 ? index + 1 : Math.min(Math.max(page - 1, 1), pagination.totalPages - 2) + index;
                  return <button key={pageNumber} className={`page-number ${pageNumber === page ? 'page-current' : ''}`} onClick={() => setPage(pageNumber)}>{pageNumber}</button>;
                })}
                <button className="page-arrow" aria-label="Trang tiếp theo" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}><ArrowRight size={15} /></button>
              </div>
            </div>
          </section>
          <footer className="page-footer"><span>© 2026 TMS · Training Management System</span><span><a href="#">Trung tâm trợ giúp</a><a href="#">Chính sách bảo mật</a></span></footer>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="user-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading">
              <div><div className="modal-icon"><Users size={19} /></div><h2 id="modal-title">{editing ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}</h2><p>{editing ? 'Cập nhật thông tin và quyền truy cập người dùng.' : 'Thông tin kích hoạt tài khoản sẽ được gửi qua email.'}</p></div>
              <button className="icon-button" aria-label="Đóng" onClick={() => setModalOpen(false)}><X size={19} /></button>
            </div>
            {modalError && <div className="inline-error modal-error"><AlertCircle size={17} />{modalError}</div>}
            <form className="user-form" onSubmit={handleSubmit}>
              <label>Họ và tên <span>*</span><input required maxLength={150} autoFocus value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Nguyễn Văn An" /></label>
              <label>Email <span>*</span><input required type="email" maxLength={255} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="ten@tms.edu.vn" /></label>
              <label>Số điện thoại<input type="tel" maxLength={20} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="090 123 4567" /></label>
              <label>Vai trò <span>*</span><span className="select-wrap"><select required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>{roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={15} /></span></label>
              {editing && <label>Trạng thái<span className="select-wrap"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })}>{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={15} /></span></label>}
              {!editing && <div className="email-notice"><Mail size={16} /><span>Hệ thống sẽ gửi email kích hoạt cùng mật khẩu tạm đến địa chỉ trên.</span></div>}
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Hủy</button><button type="submit" className="primary-button" disabled={saving}>{saving && <LoaderCircle size={16} className="spinner" />}{editing ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
