/**
 * Auth utilities cho Frontend.
 * Quản lý token, validation, UI helpers.
 * Hỗ trợ S1-02 (Session/JWT) và S1-03 (Password Reset).
 */

// =============================================
// TOKEN MANAGEMENT (S1-02)
// =============================================

/**
 * Lưu tokens sau khi login thành công.
 */
function saveTokens(data) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('accessTokenExpiry', data.accessTokenExpiry);
    localStorage.setItem('refreshTokenExpiry', data.refreshTokenExpiry);
}

/**
 * Lấy tokens từ localStorage.
 */
function getTokens() {
    return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        accessTokenExpiry: localStorage.getItem('accessTokenExpiry'),
        refreshTokenExpiry: localStorage.getItem('refreshTokenExpiry')
    };
}

/**
 * Xóa tokens khi logout.
 */
function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpiry');
    localStorage.removeItem('refreshTokenExpiry');
}

/**
 * Refresh access token sử dụng refresh token (S1-02).
 */
async function refreshAccessToken() {
    const tokens = getTokens();
    if (!tokens.refreshToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: tokens.refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            saveTokens(data);
            return data.accessToken;
        } else {
            // SESSION_EXPIRED - clear tokens, redirect to login
            clearTokens();
            window.location.href = 'index.html';
            return null;
        }
    } catch (error) {
        return null;
    }
}

// =============================================
// VALIDATION
// =============================================

/**
 * Validate email format.
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =============================================
// UI HELPERS
// =============================================

/**
 * Hiển thị lỗi cho field cụ thể.
 */
function showFieldError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
        // Add error class to parent input
        const wrapper = el.previousElementSibling;
        if (wrapper && wrapper.classList.contains('input-wrapper')) {
            wrapper.classList.add('input-error');
        }
    }
}

/**
 * Xóa tất cả field errors.
 */
function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('.input-wrapper').forEach(el => {
        el.classList.remove('input-error');
    });
}

/**
 * Hiển thị alert message.
 */
function showAlert(alertEl, message, type) {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.className = `alert alert-${type}`;
    alertEl.style.display = 'block';
    
    // Animate in
    alertEl.style.animation = 'none';
    alertEl.offsetHeight; // trigger reflow
    alertEl.style.animation = 'slideIn 0.3s ease-out';
}

/**
 * Ẩn alert message.
 */
function hideAlert(alertEl) {
    if (alertEl) {
        alertEl.style.display = 'none';
    }
}

/**
 * Set loading state cho button.
 */
function setLoading(button, loading) {
    if (!button) return;
    const text = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loader');
    
    if (loading) {
        button.disabled = true;
        if (text) text.style.display = 'none';
        if (loader) loader.style.display = 'inline-flex';
    } else {
        button.disabled = false;
        if (text) text.style.display = 'inline';
        if (loader) loader.style.display = 'none';
    }
}

/**
 * Toggle password visibility.
 */
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}
