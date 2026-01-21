using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OperationWeb.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddManagersToProyectos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaSincronizacion",
                table: "Proyectos",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<string>(
                name: "GerenteDni",
                table: "Proyectos",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JefeDni",
                table: "Proyectos",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GerenteDni",
                table: "Proyectos");

            migrationBuilder.DropColumn(
                name: "JefeDni",
                table: "Proyectos");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaSincronizacion",
                table: "Proyectos",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 1,
                column: "FechaCreacion",
                value: new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1080));

            migrationBuilder.UpdateData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 2,
                column: "FechaCreacion",
                value: new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1080));

            migrationBuilder.UpdateData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 3,
                column: "FechaCreacion",
                value: new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1090));

            migrationBuilder.UpdateData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 4,
                column: "FechaCreacion",
                value: new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1090));

            migrationBuilder.UpdateData(
                table: "Personal",
                keyColumn: "DNI",
                keyValue: "11223344",
                columns: new[] { "FechaCreacion", "FechaInicio" },
                values: new object[] { new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1020), new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1020) });

            migrationBuilder.UpdateData(
                table: "Personal",
                keyColumn: "DNI",
                keyValue: "12345678",
                columns: new[] { "FechaCreacion", "FechaInicio" },
                values: new object[] { new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1010), new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1010) });

            migrationBuilder.UpdateData(
                table: "Personal",
                keyColumn: "DNI",
                keyValue: "44332211",
                columns: new[] { "FechaCreacion", "FechaInicio" },
                values: new object[] { new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1020), new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1020) });

            migrationBuilder.UpdateData(
                table: "Personal",
                keyColumn: "DNI",
                keyValue: "87654321",
                columns: new[] { "FechaCreacion", "FechaInicio" },
                values: new object[] { new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1020), new DateTime(2025, 12, 2, 16, 52, 50, 144, DateTimeKind.Utc).AddTicks(1020) });
        }
    }
}
