using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace OperationWeb.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Colaboradores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Documento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Cargo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Activo"),
                    FechaIngreso = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    FechaSalida = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Colaboradores", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Cuadrillas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Activa"),
                    CapacidadMaxima = table.Column<int>(type: "int", nullable: false),
                    Supervisor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Ubicacion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuadrillas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CuadrillaColaboradores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CuadrillaId = table.Column<int>(type: "int", nullable: false),
                    ColaboradorId = table.Column<int>(type: "int", nullable: false),
                    FechaAsignacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    FechaDesasignacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Rol = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CuadrillaColaboradores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CuadrillaColaboradores_Colaboradores_ColaboradorId",
                        column: x => x.ColaboradorId,
                        principalTable: "Colaboradores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CuadrillaColaboradores_Cuadrillas_CuadrillaId",
                        column: x => x.CuadrillaId,
                        principalTable: "Cuadrillas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Colaboradores",
                columns: new[] { "Id", "Apellido", "Cargo", "Documento", "Email", "Estado", "FechaIngreso", "FechaSalida", "Nombre", "Telefono" },
                values: new object[,]
                {
                    { 1, "Pérez", "Técnico", "12345678", "juan.perez@empresa.com", "Activo", new DateTime(2024, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Juan", "555-0001" },
                    { 2, "González", "Supervisor", "87654321", "maria.gonzalez@empresa.com", "Activo", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "María", "555-0002" },
                    { 3, "Rodríguez", "Operario", "11223344", "carlos.rodriguez@empresa.com", "Activo", new DateTime(2024, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Carlos", "555-0003" },
                    { 4, "López", "Técnico", "44332211", "ana.lopez@empresa.com", "Activo", new DateTime(2024, 4, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Ana", "555-0004" }
                });

            migrationBuilder.InsertData(
                table: "Cuadrillas",
                columns: new[] { "Id", "CapacidadMaxima", "Descripcion", "Estado", "FechaCreacion", "FechaModificacion", "Nombre", "Supervisor", "Ubicacion" },
                values: new object[,]
                {
                    { 1, 5, "Equipo de trabajo zona norte", "Activa", new DateTime(2024, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Cuadrilla Norte", "María González", "Zona Norte" },
                    { 2, 4, "Equipo de trabajo zona sur", "Activa", new DateTime(2024, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Cuadrilla Sur", "Juan Pérez", "Zona Sur" },
                    { 3, 6, "Equipo de trabajo zona centro", "Inactiva", new DateTime(2024, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Cuadrilla Centro", "Carlos Rodríguez", "Zona Centro" }
                });

            migrationBuilder.InsertData(
                table: "CuadrillaColaboradores",
                columns: new[] { "Id", "Activo", "ColaboradorId", "CuadrillaId", "FechaAsignacion", "FechaDesasignacion", "Rol" },
                values: new object[,]
                {
                    { 1, true, 2, 1, new DateTime(2024, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Supervisor" },
                    { 2, true, 1, 1, new DateTime(2024, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Técnico" },
                    { 3, true, 3, 2, new DateTime(2024, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Operario" },
                    { 4, true, 4, 2, new DateTime(2024, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc), null, "Técnico" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Colaboradores_Documento",
                table: "Colaboradores",
                column: "Documento",
                unique: true,
                filter: "[Documento] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Colaboradores_Email",
                table: "Colaboradores",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CuadrillaColaboradores_ColaboradorId",
                table: "CuadrillaColaboradores",
                column: "ColaboradorId");

            migrationBuilder.CreateIndex(
                name: "IX_CuadrillaColaboradores_CuadrillaId_ColaboradorId_Activo",
                table: "CuadrillaColaboradores",
                columns: new[] { "CuadrillaId", "ColaboradorId", "Activo" },
                unique: true,
                filter: "[Activo] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Cuadrillas_Nombre",
                table: "Cuadrillas",
                column: "Nombre",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CuadrillaColaboradores");

            migrationBuilder.DropTable(
                name: "Colaboradores");

            migrationBuilder.DropTable(
                name: "Cuadrillas");
        }
    }
}
