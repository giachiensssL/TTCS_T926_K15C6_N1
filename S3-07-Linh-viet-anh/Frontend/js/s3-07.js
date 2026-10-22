(() => {
  'use strict';

  // Cập nhật URL này theo địa chỉ backend đang chạy trên máy của bạn.
  const API_BASE_URL = window.S3_07_API_BASE_URL || 'http://localhost:5290';
  const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/training/classes`;

  const el = (id) => document.getElementById(id);
  const form = el('filtersForm');
  const tbody = el('classesTableBody');
  const alertBox = el('alert');
  const badge = el('connectionBadge');
  const refreshButton = el('refreshButton');
  const resetButton = el('resetFilters');

  let currentRows = [];
  let requestNumber = 0;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);

  const dateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (value) => {
    const date = dateValue(value);
    return date ? new Intl.DateTimeFormat('vi-VN').format(date) : '—';
  };

  const normalizedStatus = (status) => String(status || '').trim().toLocaleLowerCase('vi-VN');
  const statusClass = (status) => {
    const s = normalizedStatus(status);
    if (s.includes('diễn ra') || s.includes('dang dien ra')) return 'status-active';
    if (s.includes('khai giảng') || s.includes('khai giang') || s.includes('sắp')) return 'status-upcoming';
    if (s.includes('kết thúc') || s.includes('ket thuc')) return 'status-finished';
    if (s.includes('hủy') || s.includes('huy')) return 'status-cancelled';
    return '';
  };

  function showAlert(message) {
    alertBox.textContent = message;
    alertBox.hidden = !message;
  }

  function setLoading() {
    badge.textContent = 'Đang tải dữ liệu';
    badge.className = 'connection-badge';
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Đang tải danh sách lớp…</td></tr>';
  }

  function updateStats(rows) {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + 14);

    const active = rows.filter(x => normalizedStatus(x.status).includes('diễn ra') || normalizedStatus(x.status).includes('dang dien ra')).length;
    const students = rows.reduce((sum, x) => sum + (Number(x.currentStudents) || 0), 0);
    const ending = rows.filter(x => {
      const end = dateValue(x.endDate);
      return end && end >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && end <= cutoff
        && !normalizedStatus(x.status).includes('kết thúc');
    }).length;

    el('totalClasses').textContent = rows.length.toLocaleString('vi-VN');
    el('activeClasses').textContent = active.toLocaleString('vi-VN');
    el('totalStudents').textContent = students.toLocaleString('vi-VN');
    el('endingClasses').textContent = ending.toLocaleString('vi-VN');
    el('resultCount').textContent = `${rows.length.toLocaleString('vi-VN')} lớp phù hợp với bộ lọc`;
  }

  function renderRows(rows) {
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Không tìm thấy lớp học phù hợp.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(row => {
      const current = Number(row.currentStudents) || 0;
      const max = Number(row.maxStudents) || 0;
      const done = Number(row.completedSessions) || 0;
      const total = Number(row.totalSessions) || 0;
      const percent = total > 0 ? Math.max(0, Math.min(100, Number(row.progressPercent ?? Math.round(done * 100 / total)))) : 0;
      const rosterClass = max > 0 && current / max >= 0.9 ? 'roster near-full' : 'roster';
      const progressClass = percent >= 100 ? 'progress-bar complete' : 'progress-bar';
      const status = row.status || 'Chưa xác định';

      return `<tr>
        <td><div class="class-name">${escapeHtml(row.className)}</div><div class="class-code">${escapeHtml(row.classCode)}</div></td>
        <td>${escapeHtml(row.programName)}</td>
        <td>${escapeHtml(row.instructorName)}</td>
        <td>${formatDate(row.startDate)}<span class="subtext">đến ${formatDate(row.endDate)}</span></td>
        <td><span class="${rosterClass}">${current}/${max}</span><span class="subtext">học viên</span></td>
        <td><div class="progress-wrap"><div class="progress-label"><span>${done}/${total} buổi</span><strong>${percent}%</strong></div><div class="progress-track"><div class="${progressClass}" style="width:${percent}%"></div></div></div></td>
        <td><span class="status ${statusClass(status)}">${escapeHtml(status)}</span></td>
      </tr>`;
    }).join('');
  }

  async function loadClasses(event) {
    if (event) event.preventDefault();
    const thisRequest = ++requestNumber;
    showAlert('');
    setLoading();

    const params = new URLSearchParams();
    const status = el('statusFilter').value;
    const program = el('programFilter').value.trim();
    const instructor = el('instructorFilter').value.trim();
    const fromDate = el('fromDateFilter').value;
    const toDate = el('toDateFilter').value;

    if (status) params.set('status', status);
    if (program) params.set('programName', program);
    if (instructor) params.set('instructorName', instructor);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);

    if (fromDate && toDate && fromDate > toDate) {
      showAlert('Ngày bắt đầu không được sau ngày kết thúc.');
      badge.textContent = 'Bộ lọc không hợp lệ';
      badge.className = 'connection-badge error';
      tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Vui lòng sửa khoảng thời gian.</td></tr>';
      updateStats([]);
      return;
    }

    try {
      const url = params.toString() ? `${API_URL}?${params}` : API_URL;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.title || `API trả về HTTP ${response.status}`);
      }
      const data = await response.json();
      if (thisRequest !== requestNumber) return;
      if (!Array.isArray(data)) throw new Error('Dữ liệu API không đúng định dạng danh sách.');
      currentRows = data;
      updateStats(currentRows);
      renderRows(currentRows);
      badge.textContent = 'Đã kết nối API';
      badge.className = 'connection-badge success';
    } catch (error) {
      if (thisRequest !== requestNumber) return;
      currentRows = [];
      updateStats([]);
      tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Không tải được danh sách lớp.</td></tr>';
      badge.textContent = 'Lỗi kết nối';
      badge.className = 'connection-badge error';
      showAlert(`Không thể tải dữ liệu: ${error.message}. Kiểm tra backend, URL API và cấu hình CORS.`);
    }
  }

  form.addEventListener('submit', loadClasses);
  refreshButton.addEventListener('click', () => loadClasses());
  resetButton.addEventListener('click', () => {
    form.reset();
    loadClasses();
  });

  loadClasses();
})();
