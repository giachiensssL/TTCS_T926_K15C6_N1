using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/training/classes")]
    public class TrainingClassesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public TrainingClassesController(ApplicationDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Danh sách lớp với bộ lọc tùy chọn.
        /// fromDate/toDate lọc các lớp có khoảng thời gian giao với khoảng ngày được chọn.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TrainingClassDto>>> GetClasses(
            [FromQuery] string? status,
            [FromQuery] string? programName,
            [FromQuery] string? instructorName,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            CancellationToken cancellationToken)
        {
            if (fromDate.HasValue && toDate.HasValue && fromDate.Value.Date > toDate.Value.Date)
            {
                return BadRequest(new { message = "Ngày bắt đầu lọc không được sau ngày kết thúc lọc." });
            }

            IQueryable<TrainingClass> query = _db.Set<TrainingClass>().AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(x => x.Status == status.Trim());

            if (!string.IsNullOrWhiteSpace(programName))
                query = query.Where(x => x.ProgramName.Contains(programName.Trim()));

            if (!string.IsNullOrWhiteSpace(instructorName))
                query = query.Where(x => x.InstructorName.Contains(instructorName.Trim()));

            if (fromDate.HasValue)
                query = query.Where(x => x.EndDate >= fromDate.Value.Date);

            if (toDate.HasValue)
                query = query.Where(x => x.StartDate < toDate.Value.Date.AddDays(1));

            var rows = await query
                .OrderBy(x => x.StartDate)
                .ThenBy(x => x.ClassCode)
                .Select(x => new TrainingClassDto
                {
                    Id = x.Id,
                    ClassCode = x.ClassCode,
                    ClassName = x.ClassName,
                    ProgramName = x.ProgramName,
                    InstructorName = x.InstructorName,
                    Status = x.Status,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    CurrentStudents = x.CurrentStudents,
                    MaxStudents = x.MaxStudents,
                    CompletedSessions = x.CompletedSessions,
                    TotalSessions = x.TotalSessions,
                    ProgressPercent = x.TotalSessions > 0
                        ? (int)Math.Round(100.0 * x.CompletedSessions / x.TotalSessions)
                        : 0
                })
                .ToListAsync(cancellationToken);

            return Ok(rows);
        }
    }
}
