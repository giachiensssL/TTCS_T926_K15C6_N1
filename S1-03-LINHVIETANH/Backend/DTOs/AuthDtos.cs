using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // =============================================
    // AUTH DTOs (S1-02: Login, Refresh, Logout)
    // =============================================

    /// <summary>
    /// DTO đăng ký tài khoản.
    /// </summary>
    public class RegisterDto
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.")]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO đăng nhập.
    /// </summary>
    public class LoginDto
    {
        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO response đăng nhập thành công.
    /// </summary>
    public class LoginResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpiry { get; set; }
        public DateTime RefreshTokenExpiry { get; set; }
    }

    /// <summary>
    /// DTO yêu cầu refresh token (S1-02).
    /// </summary>
    public class RefreshTokenDto
    {
        [Required(ErrorMessage = "Refresh token là bắt buộc.")]
        public string RefreshToken { get; set; } = string.Empty;
    }

    // =============================================
    // PASSWORD RESET DTOs (S1-03)
    // =============================================

    /// <summary>
    /// DTO yêu cầu quên mật khẩu (S1-03).
    /// </summary>
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO đặt lại mật khẩu (S1-03).
    /// </summary>
    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Token là bắt buộc.")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới là bắt buộc.")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.")]
        public string NewPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO response chung cho thông báo.
    /// </summary>
    public class MessageResponseDto
    {
        public string Message { get; set; } = string.Empty;

        public MessageResponseDto(string message)
        {
            Message = message;
        }
    }
}
