using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OperationWeb.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddEmpleadoEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Empleado",
                columns: table => new
                {
                    IdEmpleado = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdEmpresa = table.Column<int>(type: "int", nullable: false),
                    CodigoEmpleado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TipoDocumento = table.Column<int>(type: "int", nullable: true),
                    NumeroDocumento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ApellidoPaterno = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ApellidoMaterno = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaNacimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IdJefeInmediato = table.Column<int>(type: "int", nullable: true),
                    IdEmpleadoPerfil = table.Column<int>(type: "int", nullable: true),
                    IdUnidad = table.Column<int>(type: "int", nullable: true),
                    IdArea = table.Column<int>(type: "int", nullable: true),
                    Administrador = table.Column<bool>(type: "bit", nullable: true),
                    UsuarioActivo = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UsuarioModificacion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleado", x => x.IdEmpleado);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_CodigoEmpleado",
                table: "Empleado",
                column: "CodigoEmpleado",
                unique: true,
                filter: "[CodigoEmpleado] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_Email",
                table: "Empleado",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_NumeroDocumento",
                table: "Empleado",
                column: "NumeroDocumento",
                unique: true,
                filter: "[NumeroDocumento] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Empleado");
        }
    }
}
