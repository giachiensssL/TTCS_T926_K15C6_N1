using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    /// <summary>
    /// Lớp đào tạo phục vụ màn hình S3-07.
    /// CurrentStudents và session counters cần được đồng bộ với nghiệp vụ đăng ký/điểm danh thực tế.
    /// </summary>
    public class TrainingClass
    {
        public int Id { get; set; }

        [Required, MaxLength(30)]
        public string ClassCode { get; set; } = string.Empty;

        [Required, MaxLength(160)]
        public string ClassName { get; set; } = string.Empty;

        [Required, MaxLength(160)]
        public string ProgramName { get; set; } = string.Empty;

        [Required, MaxLength(160)]
        public string InstructorName { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string Status { get; set; } = "Đang diễn ra";

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        [Range(0, 100000)]
        public int CurrentStudents { get; set; }

        [Range(1, 100000)]
        public int MaxStudents { get; set; } = 25;

        [Range(0, 10000)]
        public int CompletedSessions { get; set; }

        [Range(1, 10000)]
        public int TotalSessions { get; set; } = 12;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
