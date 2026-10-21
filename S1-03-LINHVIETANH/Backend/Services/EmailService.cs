using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Backend.Services
{
    /// <summary>
    /// Implementation EmailService sử dụng MailKit + SMTP (S1-03).
    /// Cấu hình SMTP từ appsettings/environment variables, KHÔNG hard-code secret.
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        /// <summary>
        /// Gửi email qua SMTP sử dụng MailKit.
        /// </summary>
        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();

                // Kết nối SMTP
                if (_settings.UseSsl)
                {
                    await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls);
                }
                else
                {
                    await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.None);
                }

                // Xác thực
                if (!string.IsNullOrEmpty(_settings.Username))
                {
                    await client.AuthenticateAsync(_settings.Username, _settings.Password);
                }

                // Gửi email
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                // Log thành công - KHÔNG log nội dung email hoặc thông tin nhạy cảm
                _logger.LogInformation("Email đã được gửi thành công đến {Email}", toEmail);
            }
            catch (Exception ex)
            {
                // Log lỗi - KHÔNG log password/token
                _logger.LogError(ex, "Không thể gửi email đến {Email}", toEmail);
                throw;
            }
        }
    }
}
