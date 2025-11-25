using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace OperationWeb.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AlignSchema_Personal_DNI : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropForeignKey(
            //     name: "FK_CuadrillaColaboradores_Colaboradores_ColaboradorId",
            //     table: "CuadrillaColaboradores");

            // migrationBuilder.DropTable(
            //     name: "Colaboradores");

            // migrationBuilder.DropIndex(
            //     name: "IX_CuadrillaColaboradores_ColaboradorId",
            //     table: "CuadrillaColaboradores");

            // migrationBuilder.DropIndex(
            //     name: "IX_CuadrillaColaboradores_CuadrillaId_ColaboradorId_Activo",
            //     table: "CuadrillaColaboradores");

            // migrationBuilder.DropColumn(
            //     name: "ColaboradorId",
            //     table: "CuadrillaColaboradores");

            // migrationBuilder.AddColumn<string>(
            //     name: "DNI",
            //     table: "Empleado",
            //     type: "nvarchar(40)",
            //     maxLength: 40,
            //     nullable: false,
            //     defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "CapacidadMaxima",
                table: "Cuadrillas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "PersonalDNI",
                table: "CuadrillaColaboradores",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            // migrationBuilder.CreateTable(
            //     name: "Historial_Cargas_Personal",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         FechaCarga = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         Archivo = table.Column<string>(type: "nvarchar(520)", maxLength: 520, nullable: true),
            //         Usuario = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Historial_Cargas_Personal", x => x.Id);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "MotivosCese",
            //     columns: table => new
            //     {
            //         Codigo = table.Column<int>(type: "int", nullable: false),
            //         Descripcion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_MotivosCese", x => x.Codigo);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "Personal",
            //     columns: table => new
            //     {
            //         DNI = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
            //         Inspector = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
            //         Distrito = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         Tipo = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
            //         FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         FechaCese = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         UsuarioCreacion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         UsuarioModificacion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Personal", x => x.DNI);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "Roles",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
            //         Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Roles", x => x.Id);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "Users",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         DNI = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
            //         PasswordHash = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
            //         Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         IsActive = table.Column<bool>(type: "bit", nullable: false),
            //         CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Users", x => x.Id);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "Personal_EventoLaboral",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         DNI = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
            //         TipoEvento = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
            //         Motivo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         FechaEvento = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         Periodo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Personal_EventoLaboral", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_Personal_EventoLaboral_Personal_DNI",
            //             column: x => x.DNI,
            //             principalTable: "Personal",
            //             principalColumn: "DNI");
            //     });

            // migrationBuilder.CreateTable(
            //     name: "Personal_Staging",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         DNI = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
            //         Archivo = table.Column<string>(type: "nvarchar(520)", maxLength: 520, nullable: true),
            //         Hoja = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
            //         Periodo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
            //         Inspector = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
            //         Situacion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         FechaIngreso = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         FechaCese = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         MotivoDeCese = table.Column<int>(type: "int", nullable: true),
            //         MotivoNorm = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         SedeTrabajo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         TipoTrabajador = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         FechaCarga = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         UsuarioCarga = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Personal_Staging", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_Personal_Staging_MotivosCese_MotivoDeCese",
            //             column: x => x.MotivoDeCese,
            //             principalTable: "MotivosCese",
            //             principalColumn: "Codigo");
            //         table.ForeignKey(
            //             name: "FK_Personal_Staging_Personal_DNI",
            //             column: x => x.DNI,
            //             principalTable: "Personal",
            //             principalColumn: "DNI");
            //     });

            // migrationBuilder.CreateTable(
            //     name: "UserActivations",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         UserId = table.Column<int>(type: "int", nullable: false),
            //         DNI = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
            //         Token = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
            //         Purpose = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
            //         IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         IssuedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //         Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_UserActivations", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_UserActivations_Users_UserId",
            //             column: x => x.UserId,
            //             principalTable: "Users",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "UserRoles",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         UserId = table.Column<int>(type: "int", nullable: false),
            //         RoleId = table.Column<int>(type: "int", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_UserRoles", x => x.Id);
            //         table.ForeignKey(
            //             name: "FK_UserRoles_Roles_RoleId",
            //             column: x => x.RoleId,
            //             principalTable: "Roles",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //         table.ForeignKey(
            //             name: "FK_UserRoles_Users_UserId",
            //             column: x => x.UserId,
            //             principalTable: "Users",
            //             principalColumn: "Id",
            //             onDelete: ReferentialAction.Cascade);
            //     });

            migrationBuilder.UpdateData(
                table: "CuadrillaColaboradores",
                keyColumn: "Id",
                keyValue: 1,
                column: "PersonalDNI",
                value: "87654321");

            migrationBuilder.UpdateData(
                table: "CuadrillaColaboradores",
                keyColumn: "Id",
                keyValue: 2,
                column: "PersonalDNI",
                value: "12345678");

            migrationBuilder.UpdateData(
                table: "CuadrillaColaboradores",
                keyColumn: "Id",
                keyValue: 3,
                column: "PersonalDNI",
                value: "11223344");

            migrationBuilder.UpdateData(
                table: "CuadrillaColaboradores",
                keyColumn: "Id",
                keyValue: 4,
                column: "PersonalDNI",
                value: "44332211");

            // migrationBuilder.InsertData(
            //     table: "Empleado",
            //     columns: new[] { "IdEmpleado", "Administrador", "ApellidoMaterno", "ApellidoPaterno", "CodigoEmpleado", "DNI", "Email", "FechaCreacion", "FechaModificacion", "FechaNacimiento", "IdArea", "IdEmpleadoPerfil", "IdEmpresa", "IdJefeInmediato", "IdUnidad", "Nombre", "NumeroDocumento", "Telefono", "TipoDocumento", "UsuarioActivo", "UsuarioCreacion", "UsuarioModificacion" },
            //     values: new object[,]
            //     {
            //         { 1, null, null, "Pérez", null, "12345678", "juan.perez@empresa.com", new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1960), null, null, null, null, 0, null, null, "Juan", null, "555-0001", null, null, null, null },
            //         { 2, null, null, "González", null, "87654321", "maria.gonzalez@empresa.com", new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1970), null, null, null, null, 0, null, null, "María", null, "555-0002", null, null, null, null },
            //         { 3, null, null, "Rodríguez", null, "11223344", "carlos.rodriguez@empresa.com", new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1970), null, null, null, null, 0, null, null, "Carlos", null, "555-0003", null, null, null, null },
            //         { 4, null, null, "López", null, "44332211", "ana.lopez@empresa.com", new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1970), null, null, null, null, 0, null, null, "Ana", null, "555-0004", null, null, null, null }
            //     });

            // migrationBuilder.InsertData(
            //     table: "Personal",
            //     columns: new[] { "DNI", "Distrito", "FechaCese", "FechaCreacion", "FechaInicio", "FechaModificacion", "Inspector", "Telefono", "Tipo", "UsuarioCreacion", "UsuarioModificacion" },
            //     values: new object[,]
            //     {
            //         { "11223344", "San Isidro", null, new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1890), new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1890), null, "Carlos Rodríguez", "555-0003", "Operario", null, null },
            //         { "12345678", "Lima", null, new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1890), new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1890), null, "Juan Pérez", "555-0001", "Técnico", null, null },
            //         { "44332211", "Surco", null, new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1900), new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1900), null, "Ana López", "555-0004", "Técnico", null, null },
            //         { "87654321", "Miraflores", null, new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1890), new DateTime(2025, 11, 25, 2, 2, 53, 731, DateTimeKind.Utc).AddTicks(1890), null, "María González", "555-0002", "Supervisor", null, null }
            //     });

            // migrationBuilder.CreateIndex(
            //     name: "IX_Empleado_DNI",
            //     table: "Empleado",
            //     column: "DNI",
            //     unique: true);
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_CuadrillaColaboradores_CuadrillaId_PersonalDNI_Activo",
            //     table: "CuadrillaColaboradores",
            //     columns: new[] { "CuadrillaId", "PersonalDNI", "Activo" },
            //     unique: true,
            //     filter: "[Activo] = 1");
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_CuadrillaColaboradores_PersonalDNI",
            //     table: "CuadrillaColaboradores",
            //     column: "PersonalDNI");
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_Personal_EventoLaboral_DNI",
            //     table: "Personal_EventoLaboral",
            //     column: "DNI");
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_Personal_Staging_DNI",
            //     table: "Personal_Staging",
            //     column: "DNI");
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_Personal_Staging_MotivoDeCese",
            //     table: "Personal_Staging",
            //     column: "MotivoDeCese");
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_Roles_Name",
            //     table: "Roles",
            //     column: "Name",
            //     unique: true);
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_UserActivations_Token",
            //     table: "UserActivations",
            //     column: "Token",
            //     unique: true);
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_UserActivations_UserId",
            //     table: "UserActivations",
            //     column: "UserId");
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_UserRoles_RoleId",
            //     table: "UserRoles",
            //     column: "RoleId");
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_UserRoles_UserId_RoleId",
            //     table: "UserRoles",
            //     columns: new[] { "UserId", "RoleId" },
            //     unique: true);
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_Users_DNI",
            //     table: "Users",
            //     column: "DNI",
            //     unique: true);
            //
            // migrationBuilder.CreateIndex(
            //     name: "IX_Users_Email",
            //     table: "Users",
            //     column: "Email",
            //     unique: true,
            //     filter: "[Email] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_CuadrillaColaboradores_Personal_PersonalDNI",
                table: "CuadrillaColaboradores",
                column: "PersonalDNI",
                principalTable: "Personal",
                principalColumn: "DNI",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CuadrillaColaboradores_Personal_PersonalDNI",
                table: "CuadrillaColaboradores");

            migrationBuilder.DropTable(
                name: "Historial_Cargas_Personal");

            migrationBuilder.DropTable(
                name: "Personal_EventoLaboral");

            migrationBuilder.DropTable(
                name: "Personal_Staging");

            migrationBuilder.DropTable(
                name: "UserActivations");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "MotivosCese");

            migrationBuilder.DropTable(
                name: "Personal");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Empleado_DNI",
                table: "Empleado");

            migrationBuilder.DropIndex(
                name: "IX_CuadrillaColaboradores_CuadrillaId_PersonalDNI_Activo",
                table: "CuadrillaColaboradores");

            migrationBuilder.DropIndex(
                name: "IX_CuadrillaColaboradores_PersonalDNI",
                table: "CuadrillaColaboradores");

            migrationBuilder.DeleteData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Empleado",
                keyColumn: "IdEmpleado",
                keyValue: 4);

            migrationBuilder.DropColumn(
                name: "DNI",
                table: "Empleado");

            migrationBuilder.DropColumn(
                name: "PersonalDNI",
                table: "CuadrillaColaboradores");

            migrationBuilder.AlterColumn<int>(
                name: "CapacidadMaxima",
                table: "Cuadrillas",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ColaboradorId",
                table: "CuadrillaColaboradores",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Colaboradores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Apellido = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Cargo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Documento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Activo"),
                    FechaIngreso = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    FechaSalida = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Colaboradores", x => x.Id);
                });

            // migrationBuilder.InsertData(
            //     table: "Colaboradores",
            //     columns: new[] { "Id", "Apellido", "Cargo", "Documento", "Email", "Estado", "FechaIngreso", "FechaSalida", "Nombre", "Telefono" },
            //     values: new object[,]
            //     {
            //         { 1, "Pérez", "Técnico", "12345678", "juan.perez@empresa.com", "Activo", new DateTime(2024, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Juan", "555-0001" },
            //         { 2, "González", "Supervisor", "87654321", "maria.gonzalez@empresa.com", "Activo", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "María", "555-0002" },
            //         { 3, "Rodríguez", "Operario", "11223344", "carlos.rodriguez@empresa.com", "Activo", new DateTime(2024, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Carlos", "555-0003" },
            //         { 4, "López", "Técnico", "44332211", "ana.lopez@empresa.com", "Activo", new DateTime(2024, 4, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Ana", "555-0004" }
            //     });

            migrationBuilder.UpdateData(
                table: "CuadrillaColaboradores",
                keyColumn: "Id",
                keyValue: 1,
                column: "ColaboradorId",
                value: 2);

            migrationBuilder.UpdateData(
                table: "CuadrillaColaboradores",
                keyColumn: "Id",
                keyValue: 2,
                column: "ColaboradorId",
                value: 1);

            migrationBuilder.UpdateData(
                table: "CuadrillaColaboradores",
                keyColumn: "Id",
                keyValue: 3,
                column: "ColaboradorId",
                value: 3);

            migrationBuilder.UpdateData(
                table: "CuadrillaColaboradores",
                keyColumn: "Id",
                keyValue: 4,
                column: "ColaboradorId",
                value: 4);

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

            migrationBuilder.AddForeignKey(
                name: "FK_CuadrillaColaboradores_Colaboradores_ColaboradorId",
                table: "CuadrillaColaboradores",
                column: "ColaboradorId",
                principalTable: "Colaboradores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
