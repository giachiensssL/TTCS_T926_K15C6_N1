import { useState } from 'react';
import './App.css';

function App() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setMessage('Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ và số.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Xác nhận mật khẩu không khớp.');
      return;
    }

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setMessage('Bạn chưa đăng nhập.');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:3000/auth/change-password',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Đổi mật khẩu thất bại.');
        return;
      }

      setMessage('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      localStorage.removeItem('accessToken');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setMessage('Không kết nối được tới máy chủ.');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Đổi mật khẩu</h1>
        <p className="subtitle">
          Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Mật khẩu hiện tại</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            required
          />

          <label>Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự, có chữ và số"
            required
          />

          <label>Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
          />

          <button type="submit">Đổi mật khẩu</button>

          {message && <div className="message">{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default App;