namespace Backend.Services
{
    /// <summary>
    /// Interface cho dịch vụ gửi email (S1-03).
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Gửi email.
        /// </summary>
        /// <param name="toEmail">Địa chỉ email người nhận.</param>
        /// <param name="subject">Tiêu đề email.</param>
        /// <param name="htmlBody">Nội dung email dạng HTML.</param>
        Task SendEmailAsync(string toEmail, string subject, string htmlBody);
    }
}
