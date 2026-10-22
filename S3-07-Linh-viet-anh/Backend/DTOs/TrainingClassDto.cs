namespace Backend.DTOs
{
    public class TrainingClassDto
    {
        public int Id { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string ProgramName { get; set; } = string.Empty;
        public string InstructorName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int CurrentStudents { get; set; }
        public int MaxStudents { get; set; }
        public int CompletedSessions { get; set; }
        public int TotalSessions { get; set; }
        public int ProgressPercent { get; set; }
    }
}
