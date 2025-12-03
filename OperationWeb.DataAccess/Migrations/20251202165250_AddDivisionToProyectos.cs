using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OperationWeb.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddDivisionToProyectos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Cliente",
                table: "Proyectos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Division",
                table: "Proyectos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Division",
                table: "Proyectos");

            migrationBuilder.AlterColumn<string>(
                name: "Cliente",
                table: "Proyectos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 1,
                column: "FechaCreacion",
                value: new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(3000));

            migrationBuilder.UpdateData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 2,
                column: "FechaCreacion",
                value: new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(3000));

            migrationBuilder.UpdateData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 3,
                column: "FechaCreacion",
                value: new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(3010));

            migrationBuilder.UpdateData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 4,
                column: "FechaCreacion",
                value: new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(3010));

            migrationBuilder.UpdateData(
                table: "Personal",
                keyColumn: "DNI",
                keyValue: "11223344",
                columns: new[] { "FechaCreacion", "FechaInicio" },
                values: new object[] { new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(2800), new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(2800) });

            migrationBuilder.UpdateData(
                table: "Personal",
                keyColumn: "DNI",
                keyValue: "12345678",
                columns: new[] { "FechaCreacion", "FechaInicio" },
                values: new object[] { new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(2800), new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(2770) });

            migrationBuilder.UpdateData(
                table: "Personal",
                keyColumn: "DNI",
                keyValue: "44332211",
                columns: new[] { "FechaCreacion", "FechaInicio" },
                values: new object[] { new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(2810), new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(2810) });

            migrationBuilder.UpdateData(
                table: "Personal",
                keyColumn: "DNI",
                keyValue: "87654321",
                columns: new[] { "FechaCreacion", "FechaInicio" },
                values: new object[] { new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(2800), new DateTime(2025, 12, 2, 14, 2, 24, 984, DateTimeKind.Utc).AddTicks(2800) });
        }
    }
}
