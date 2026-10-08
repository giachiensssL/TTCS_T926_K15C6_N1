import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

type Profile = {
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  role: string
}

type ProfileForm = Pick<Profile, 'fullName' | 'phone' | 'dateOfBirth' | 'address'>

const emptyForm: ProfileForm = {
  fullName: '',
  phone: '',
  dateOfBirth: '',
  address: '',
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/profile`)
        if (!response.ok) {
          throw new Error('Không thể tải hồ sơ cá nhân.')
        }

        const data: Profile = await response.json()
        setProfile(data)
        setForm({
          fullName: data.fullName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
        })
      } catch {
        setError('Chưa kết nối được với máy chủ. Vui lòng thử tải lại trang.')
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setSuccess('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể cập nhật hồ sơ.')
      }

      setProfile(data as Profile)
      setForm({
        fullName: data.fullName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
      })
      setSuccess('Thông tin hồ sơ đã được cập nhật.')
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Đã có lỗi khi cập nhật hồ sơ. Vui lòng thử lại.',
      )
    } finally {
      setSaving(false)
    }
  }

  const initials = profile?.fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('vi-VN')

  return (
    <div className="profile-app">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="TMS trang chủ">
          <span className="brand-mark">T</span>
          <span className="brand-name">tms<span>.</span></span>
        </a>

        <div className="sidebar-label">TÀI KHOẢN</div>
        <div className="nav-item nav-item-active">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c.7-3.5 3.1-5.2 7-5.2s6.3 1.7 7 5.2" />
          </svg>
          <span>Hồ sơ cá nhân</span>
        </div>

        <div className="sidebar-bottom">
          <span className="sidebar-help-icon">?</span>
          <div>
            <strong>Cần hỗ trợ?</strong>
            <span>Liên hệ quản trị viên</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Tài khoản</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Hồ sơ cá nhân</strong>
          </div>
          <div className="topbar-user">
            <span className="topbar-avatar">{initials || '…'}</span>
            <span>{profile?.fullName ?? 'Tài khoản'}</span>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">THÔNG TIN TÀI KHOẢN</div>
              <h1>Hồ sơ cá nhân</h1>
              <p>Quản lý thông tin liên lạc để trung tâm có thể hỗ trợ bạn.</p>
            </div>
            <div className="demo-tag">
              <span />
              Dữ liệu minh họa
            </div>
          </div>

          <section className="profile-card" aria-labelledby="profile-card-title">
            <div className="profile-banner">
              <div className="avatar">{initials || '…'}</div>
              <div className="profile-identity">
                <h2 id="profile-card-title">{profile?.fullName || 'Hồ sơ của bạn'}</h2>
                <span className="role-pill">{profile?.role || 'Tài khoản'}</span>
              </div>
              <div className="profile-banner-note">
                <span className="verified-icon">✓</span>
                Tài khoản đang hoạt động
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="section-heading">
                <div>
                  <h3>Thông tin cơ bản</h3>
                  <p>Các thông tin có dấu <span>*</span> là bắt buộc.</p>
                </div>
                <span className="required-note"><span>*</span> Bắt buộc</span>
              </div>

              {error && <div className="form-message form-message-error" role="alert">{error}</div>}
              {success && <div className="form-message form-message-success" role="status">{success}</div>}

              {loading ? (
                <div className="loading-state">Đang tải thông tin hồ sơ...</div>
              ) : (
                <>
                  <div className="form-grid">
                    <label className="field">
                      <span>Họ và tên <span className="field-required">*</span></span>
                      <input
                        autoComplete="name"
                        disabled={!profile}
                        maxLength={100}
                        required
                        value={form.fullName}
                        onChange={(event) => updateField('fullName', event.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    </label>

                    <label className="field">
                      <span>Số điện thoại <span className="field-required">*</span></span>
                      <input
                        autoComplete="tel"
                        disabled={!profile}
                        inputMode="tel"
                        maxLength={10}
                        pattern="0(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}"
                        required
                        title="Nhập số di động Việt Nam gồm 10 chữ số, bắt đầu bằng 0."
                        value={form.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        placeholder="Ví dụ: 0912345678"
                      />
                      <small>Nhập số di động Việt Nam gồm 10 chữ số.</small>
                    </label>

                    <label className="field">
                      <span>Ngày sinh</span>
                      <input
                        autoComplete="bday"
                        disabled={!profile}
                        max={new Date().toISOString().slice(0, 10)}
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(event) => updateField('dateOfBirth', event.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Email</span>
                      <input className="field-readonly" readOnly value={profile?.email ?? ''} />
                      <small>Email do trung tâm quản lý, không thể tự thay đổi.</small>
                    </label>

                    <label className="field field-full">
                      <span>Địa chỉ</span>
                      <input
                        autoComplete="street-address"
                        disabled={!profile}
                        maxLength={255}
                        value={form.address}
                        onChange={(event) => updateField('address', event.target.value)}
                        placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
                      />
                    </label>

                    <div className="field">
                      <span>Vai trò</span>
                      <div className="readonly-role">
                        <span className="role-dot" />
                        {profile?.role ?? ''}
                        <span className="lock-icon" aria-label="Không thể chỉnh sửa">⌑</span>
                      </div>
                      <small>Vai trò được quản lý bởi quản trị viên.</small>
                    </div>
                  </div>

                  <div className="form-footer">
                    <div className="demo-note">
                      <span className="info-icon">i</span>
                      <span>Dữ liệu minh họa sẽ được đặt lại khi khởi động lại máy chủ.</span>
                    </div>
                    <button className="save-button" type="submit" disabled={saving || !profile}>
                      {saving ? (
                        'Đang lưu...'
                      ) : (
                        <>
                          <svg viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M4 3.5h10l2.5 2.5v10.5H3.5V4A.5.5 0 0 1 4 3.5Z" />
                            <path d="M6.5 3.5v5h7v-5M6.5 16.5v-5h7v5" />
                          </svg>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </section>

          <footer className="page-footer">
            <span>© 2026 Training Management System</span>
            <span>Hồ sơ cá nhân <i /> Phiên bản demo</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
