using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using UserRoleDemo.Data;

#nullable disable

namespace UserRoleDemo.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261002073800_AddAccountLockAndTrainingClasses")]
public partial class AddAccountLockAndTrainingClasses : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "IsManuallyLocked",
            table: "AspNetUsers",
            type: "INTEGER",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "LockReason",
            table: "AspNetUsers",
            type: "TEXT",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "LockedAt",
            table: "AspNetUsers",
            type: "TEXT",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "LockedByUserId",
            table: "AspNetUsers",
            type: "TEXT",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "AccountStatusChanges",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                UserId = table.Column<string>(type: "TEXT", nullable: false),
                ActorUserId = table.Column<string>(type: "TEXT", nullable: false),
                Action = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                Reason = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                ChangedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AccountStatusChanges", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "TrainingClasses",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                InstructorUserId = table.Column<string>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TrainingClasses", x => x.Id);
                table.ForeignKey(
                    name: "FK_TrainingClasses_AspNetUsers_InstructorUserId",
                    column: x => x.InstructorUserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_TrainingClasses_InstructorUserId",
            table: "TrainingClasses",
            column: "InstructorUserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AccountStatusChanges");
        migrationBuilder.DropTable(name: "TrainingClasses");
        migrationBuilder.DropColumn(name: "IsManuallyLocked", table: "AspNetUsers");
        migrationBuilder.DropColumn(name: "LockReason", table: "AspNetUsers");
        migrationBuilder.DropColumn(name: "LockedAt", table: "AspNetUsers");
        migrationBuilder.DropColumn(name: "LockedByUserId", table: "AspNetUsers");
    }
}
