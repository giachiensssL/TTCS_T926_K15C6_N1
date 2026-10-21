namespace Backend.Services
{
    /// <summary>
    /// Cấu hình SMTP cho EmailService.
    /// Giá trị được đọc từ appsettings.json hoặc environment variables.
    /// KHÔNG hard-code secret ở đây.
    /// </summary>
    public class EmailSettings
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; } = 587;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = "Hệ thống quản lý";
        public bool UseSsl { get; set; } = true;
    }
}
