using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            IConfiguration configuration,
            IEmailService emailService,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _logger = logger;
        }

        // =============================================
        // S1-02: REGISTER
        // =============================================

        /// <summary>
        /// Đăng ký tài khoản mới.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new MessageResponseDto(
                    string.Join("; ", result.Errors.Select(e => e.Description))));
            }

            return Ok(new MessageResponseDto("Đăng ký thành công."));
        }

        // =============================================
        // S1-02: LOGIN (với Session + Refresh Token)
        // =============================================

        /// <summary>
        /// Đăng nhập. Tạo Access Token, Refresh Token và UserSession (S1-02).
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return Unauthorized(new MessageResponseDto("Email hoặc mật khẩu không đúng."));
            }

            // Tạo session (S1-02)
            var session = new UserSession
            {
                UserId = user.Id,
                RefreshToken = GenerateRefreshToken(),
                RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7),
                DeviceInfo = Request.Headers.UserAgent.ToString()
            };

            _context.UserSessions.Add(session);
            await _context.SaveChangesAsync();

            // Tạo Access Token với SessionId claim
            var accessToken = GenerateAccessToken(user, session.Id);

            return Ok(new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = session.RefreshToken,
                AccessTokenExpiry = DateTime.UtcNow.AddMinutes(
                    double.Parse(_configuration["Jwt:AccessTokenExpiryMinutes"] ?? "15")),
                RefreshTokenExpiry = session.RefreshTokenExpiryTime
            });
        }

        // =============================================
        // S1-02: REFRESH TOKEN
        // =============================================

        /// <summary>
        /// Làm mới Access Token bằng Refresh Token (S1-02).
        /// Kiểm tra session còn hợp lệ, chưa bị revoke.
        /// </summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var session = await _context.UserSessions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.RefreshToken == dto.RefreshToken);

            if (session == null || session.IsRevoked || session.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return Unauthorized(new MessageResponseDto("SESSION_EXPIRED"));
            }

            var user = session.User;

            // Tạo refresh token mới (Rotation)
            session.RefreshToken = GenerateRefreshToken();
            session.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            // Tạo Access Token mới
            var accessToken = GenerateAccessToken(user, session.Id);

            return Ok(new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = session.RefreshToken,
                AccessTokenExpiry = DateTime.UtcNow.AddMinutes(
                    double.Parse(_configuration["Jwt:AccessTokenExpiryMinutes"] ?? "15")),
                RefreshTokenExpiry = session.RefreshTokenExpiryTime
            });
        }

        // =============================================
        // S1-02: LOGOUT
        // =============================================

        /// <summary>
        /// Đăng xuất - revoke session hiện tại (S1-02).
        /// </summary>
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var sessionIdClaim = User.FindFirst("SessionId")?.Value;
            if (string.IsNullOrEmpty(sessionIdClaim) || !Guid.TryParse(sessionIdClaim, out var sessionId))
            {
                return BadRequest(new MessageResponseDto("Không tìm thấy session."));
            }

            var session = await _context.UserSessions.FindAsync(sessionId);
            if (session != null)
            {
                session.IsRevoked = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new MessageResponseDto("Đăng xuất thành công."));
        }

        // =============================================
        // S1-03: FORGOT PASSWORD
        // =============================================

        /// <summary>
        /// Yêu cầu đặt lại mật khẩu (S1-03).
        /// Luôn trả về cùng một response dù email tồn tại hay không
        /// để tránh user enumeration.
        /// </summary>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Response thống nhất - KHÔNG tiết lộ email tồn tại hay không
            var successMessage = "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.";

            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null)
            {
                // Email không tồn tại - vẫn trả response giống hệt
                // KHÔNG log thông tin cho phép dò tài khoản
                return Ok(new MessageResponseDto(successMessage));
            }

            try
            {
                // Tạo reset token bằng ASP.NET Identity (bảo mật, có entropy mạnh)
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);

                // Tạo reset URL - encode token an toàn
                var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:5500";
                var encodedToken = HttpUtility.UrlEncode(token);
                var encodedEmail = HttpUtility.UrlEncode(user.Email);
                var resetUrl = $"{frontendUrl}/reset-password.html?token={encodedToken}&email={encodedEmail}";

                // Nội dung email bằng tiếng Việt
                var emailBody = BuildResetPasswordEmailBody(resetUrl);

                // Gửi email
                await _emailService.SendEmailAsync(
                    user.Email!,
                    "Đặt lại mật khẩu tài khoản",
                    emailBody);
            }
            catch (Exception ex)
            {
                // Log lỗi nhưng KHÔNG tiết lộ cho client
                // KHÔNG log token hoặc password
                _logger.LogError(ex, "Lỗi khi xử lý yêu cầu đặt lại mật khẩu.");
            }

            // Luôn trả cùng response
            return Ok(new MessageResponseDto(successMessage));
        }

        // =============================================
        // S1-03: RESET PASSWORD
        // =============================================

        /// <summary>
        /// Đặt lại mật khẩu bằng token (S1-03).
        /// Token được tạo bởi ASP.NET Identity, chỉ dùng 1 lần,
        /// hết hạn sau 30 phút.
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Thông báo chung cho mọi trường hợp lỗi - không tiết lộ thông tin nhạy cảm
            var errorMessage = "Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.";

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                // User không tồn tại - trả lỗi chung
                return BadRequest(new MessageResponseDto(errorMessage));
            }

            // Sử dụng Identity ResetPasswordAsync - tự kiểm tra token hợp lệ,
            // token đã sử dụng, token hết hạn, và hash password mới
            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);

            if (!result.Succeeded)
            {
                // Token không hợp lệ, hết hạn, hoặc đã sử dụng
                // KHÔNG tiết lộ lý do cụ thể
                _logger.LogWarning("Reset password thất bại cho user {UserId}: {Errors}",
                    user.Id,
                    string.Join(", ", result.Errors.Select(e => e.Code)));

                return BadRequest(new MessageResponseDto(errorMessage));
            }

            // Reset thành công - Revoke tất cả session hiện tại của user (tăng security)
            // Điều này buộc user phải login lại bằng password mới
            // KHÔNG ảnh hưởng user khác, KHÔNG xóa bảng UserSession
            var userSessions = await _context.UserSessions
                .Where(s => s.UserId == user.Id && !s.IsRevoked)
                .ToListAsync();

            foreach (var session in userSessions)
            {
                session.IsRevoked = true;
            }
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} đã đặt lại mật khẩu thành công. Đã revoke {Count} session.",
                user.Id, userSessions.Count);

            return Ok(new MessageResponseDto("Đặt lại mật khẩu thành công."));
        }

        // =============================================
        // PRIVATE HELPER METHODS
        // =============================================

        /// <summary>
        /// Tạo Access Token JWT với SessionId claim (S1-02).
        /// </summary>
        private string GenerateAccessToken(ApplicationUser user, Guid sessionId)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim("SessionId", sessionId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var expiryMinutes = double.Parse(_configuration["Jwt:AccessTokenExpiryMinutes"] ?? "15");

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Tạo Refresh Token bảo mật bằng crypto random (S1-02).
        /// </summary>
        private static string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        /// <summary>
        /// Tạo nội dung email reset password bằng tiếng Việt (S1-03).
        /// </summary>
        private static string BuildResetPasswordEmailBody(string resetUrl)
        {
            return $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
</head>
<body style=""font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0;"">
    <div style=""max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"">
        <!-- Header -->
        <div style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;"">
            <h1 style=""color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;"">🔐 Đặt lại mật khẩu</h1>
        </div>

        <!-- Body -->
        <div style=""padding: 40px 30px;"">
            <p style=""color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;"">
                Xin chào,
            </p>
            <p style=""color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;"">
                Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.
            </p>
            <p style=""color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;"">
                Nhấn vào nút bên dưới để đặt lại mật khẩu:
            </p>

            <!-- Button -->
            <div style=""text-align: center; margin-bottom: 30px;"">
                <a href=""{resetUrl}""
                   style=""display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;"">
                    ĐẶT LẠI MẬT KHẨU
                </a>
            </div>

            <!-- Warning -->
            <div style=""background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 20px;"">
                <p style=""color: #856404; font-size: 14px; margin: 0; line-height: 1.5;"">
                    ⏰ Liên kết này chỉ có hiệu lực trong <strong>30 phút</strong> và chỉ có thể sử dụng <strong>một lần</strong>.
                </p>
            </div>

            <p style=""color: #666; font-size: 14px; line-height: 1.6;"">
                Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email này. Mật khẩu của bạn sẽ không bị thay đổi.
            </p>
        </div>

        <!-- Footer -->
        <div style=""background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;"">
            <p style=""color: #999; font-size: 12px; margin: 0;"">
                Email này được gửi tự động, vui lòng không trả lời.
            </p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
