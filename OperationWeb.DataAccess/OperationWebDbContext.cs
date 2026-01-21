using Microsoft.EntityFrameworkCore;
using OperationWeb.Core.Entities;

namespace OperationWeb.DataAccess
{
    public class OperationWebDbContext : DbContext
    {
        public OperationWebDbContext(DbContextOptions<OperationWebDbContext> options) : base(options)
        {
        }

        public DbSet<Cuadrilla> Cuadrillas { get; set; }
        public DbSet<CuadrillaColaborador> CuadrillaColaboradores { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<Personal> Personal { get; set; }
        public DbSet<AsistenciaDiaria> AsistenciasDiarias { get; set; }
        public DbSet<Proyecto> Proyectos { get; set; }

        public DbSet<User> Users { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<UserActivation> UserActivations { get; set; }
        public DbSet<PersonalEventoLaboral> PersonalEventosLaborales { get; set; }
        public DbSet<PersonalStaging> PersonalStaging { get; set; }
        public DbSet<HistorialCargaPersonal> HistorialCargasPersonal { get; set; }
        public DbSet<MotivoCese> MotivosCese { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
        public DbSet<UserAccessConfig> UserAccessConfigs { get; set; }

        // HSE Module
        public DbSet<HseInspection> HseInspections { get; set; }
        public DbSet<HseIncident> HseIncidents { get; set; }
        public DbSet<HsePpeDelivery> HsePpeDeliveries { get; set; }

        public DbSet<Vehiculo> Vehiculos { get; set; }
        public DbSet<Material> Materiales { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de Vehiculo (Mapeo a Opera_Main)
            // Removed to avoid EF Core schema validation issues. Handled via Raw SQL in Controller.
            modelBuilder.Entity<Vehiculo>(entity =>
            {
                entity.HasNoKey();
            });

            modelBuilder.Entity<Material>(entity =>
            {
                entity.HasNoKey();
            });

            // Configuración de Cuadrilla
            modelBuilder.Entity<Cuadrilla>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Descripcion).HasMaxLength(500);
                entity.Property(e => e.Estado).IsRequired().HasMaxLength(50).HasDefaultValue("Activa");
                entity.Property(e => e.Supervisor).HasMaxLength(100);
                entity.Property(e => e.Ubicacion).HasMaxLength(200);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.CapacidadMaxima).HasDefaultValue(0);

                entity.HasIndex(e => e.Nombre).IsUnique();
            });

            // Configuración de Empleado (Antes Empleado, ahora COLABORADORES)
            modelBuilder.Entity<Empleado>(entity =>
            {
                entity.HasKey(e => e.IdEmpleado);
                entity.ToTable("COLABORADORES"); 
                
                entity.Property(e => e.CodigoEmpleado).HasMaxLength(50);
                // NumeroDocumento removed
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                // ApellidoPaterno removed map
                // ApellidoMaterno removed map
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Telefono).HasMaxLength(20);
                // UsuarioActivo removed map
                entity.Property(e => e.UsuarioCreacion).HasMaxLength(50);
                entity.Property(e => e.UsuarioModificacion).HasMaxLength(50);
                entity.Property(e => e.DNI).IsRequired().HasMaxLength(40);

                // Índices únicos
                entity.HasIndex(e => e.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
                entity.HasIndex(e => e.CodigoEmpleado).IsUnique().HasFilter("[CodigoEmpleado] IS NOT NULL");
                entity.HasIndex(e => e.DNI).IsUnique();
            });

            // Configuración de Personal
            modelBuilder.Entity<Personal>(entity =>
            {
                entity.HasKey(e => e.DNI);
                entity.ToTable("Personal");
            });

            // Configuración de CuadrillaColaborador
            modelBuilder.Entity<CuadrillaColaborador>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Rol).HasMaxLength(50);
                entity.Property(e => e.FechaAsignacion).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.Activo).HasDefaultValue(true);

                // Relaciones
                entity.HasOne(e => e.Cuadrilla)
                    .WithMany(c => c.CuadrillaColaboradores)
                    .HasForeignKey(e => e.CuadrillaId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Personal)
                    .WithMany()
                    .HasForeignKey(e => e.PersonalDNI)
                    .OnDelete(DeleteBehavior.Cascade);

                // Índice único para evitar duplicados activos
                entity.HasIndex(e => new { e.CuadrillaId, e.PersonalDNI, e.Activo })
                    .IsUnique()
                    .HasFilter("[Activo] = 1");
            });

            // Seguridad: Users, Roles, UserRoles, UserActivations
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DNI).IsRequired().HasMaxLength(80);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.DNI).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Role)
                      .WithMany()
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserActivation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Procesos
            modelBuilder.Entity<PersonalEventoLaboral>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Personal)
                      .WithMany()
                      .HasForeignKey(e => e.DNI);
            });

            modelBuilder.Entity<PersonalStaging>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Personal)
                      .WithMany()
                      .HasForeignKey(e => e.DNI);
                
                entity.HasOne(e => e.MotivoCeseNavigation)
                      .WithMany()
                      .HasForeignKey(e => e.MotivoDeCese);
            });

            modelBuilder.Entity<HistorialCargaPersonal>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<MotivoCese>(entity =>
            {
                entity.HasKey(e => e.Codigo);
            });

            // Datos semilla
            SeedData(modelBuilder);

            // DTOs (Keyless Entities for SqlQueryRaw)
            modelBuilder.Entity<OperationWeb.DataAccess.DTOs.EmployeeDto>(e => 
            {
                e.HasNoKey();
                e.ToView(null);
            });
            modelBuilder.Entity<OperationWeb.DataAccess.DTOs.AttendanceFlatDto>(e => 
            {
                e.HasNoKey();
                e.ToView(null);
            });
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Personal semilla (Necesarios para CuadrillaColaboradores)
            modelBuilder.Entity<Personal>().HasData(
                new Personal { DNI = "12345678", Inspector = "Juan Pérez", Telefono = "555-0001", Distrito = "Lima", Tipo = "Técnico", Division = "DG Div EHS", Area = "Area 1", FechaInicio = DateTime.UtcNow, FechaCreacion = DateTime.UtcNow },
                new Personal { DNI = "87654321", Inspector = "María González", Telefono = "555-0002", Distrito = "Miraflores", Tipo = "Supervisor", Division = "DG Div EHS", Area = "Area 1", FechaInicio = DateTime.UtcNow, FechaCreacion = DateTime.UtcNow },
                new Personal { DNI = "11223344", Inspector = "Carlos Rodríguez", Telefono = "555-0003", Distrito = "San Isidro", Tipo = "Operario", Division = "Division Norte", Area = "Area 2", FechaInicio = DateTime.UtcNow, FechaCreacion = DateTime.UtcNow },
                new Personal { DNI = "44332211", Inspector = "Ana López", Telefono = "555-0004", Distrito = "Surco", Tipo = "Técnico", Division = "Division Norte", Area = "Area 2", FechaInicio = DateTime.UtcNow, FechaCreacion = DateTime.UtcNow },
                // Parche de Integridad: Super Usuario de Prueba (Crucial para Login 200 OK y carga de Perfil)
                new Personal { DNI = "41007510", Inspector = "Admin Sistema", Telefono = "999-999-999", Distrito = "Central", Tipo = "Administrador", Division = "Sistemas", Area = "TI", FechaInicio = DateTime.UtcNow, FechaCreacion = DateTime.UtcNow, Estado = "Activo" }
            );

            // Empleados semilla (Modelo Operativo)
            modelBuilder.Entity<Empleado>().HasData(
                new Empleado { IdEmpleado = 1, Nombre = "Juan", ApellidoPaterno = "Pérez", DNI = "12345678", Email = "juan.perez@empresa.com", Telefono = "555-0001", FechaCreacion = DateTime.UtcNow },
                new Empleado { IdEmpleado = 2, Nombre = "María", ApellidoPaterno = "González", DNI = "87654321", Email = "maria.gonzalez@empresa.com", Telefono = "555-0002", FechaCreacion = DateTime.UtcNow },
                new Empleado { IdEmpleado = 3, Nombre = "Carlos", ApellidoPaterno = "Rodríguez", DNI = "11223344", Email = "carlos.rodriguez@empresa.com", Telefono = "555-0003", FechaCreacion = DateTime.UtcNow },
                new Empleado { IdEmpleado = 4, Nombre = "Ana", ApellidoPaterno = "López", DNI = "44332211", Email = "ana.lopez@empresa.com", Telefono = "555-0004", FechaCreacion = DateTime.UtcNow }
            );

            // Cuadrillas semilla
            modelBuilder.Entity<Cuadrilla>().HasData(
                new Cuadrilla { Id = 1, Nombre = "Cuadrilla Norte", Descripcion = "Equipo de trabajo zona norte", Estado = "Activa", CapacidadMaxima = 5, Supervisor = "María González", Ubicacion = "Zona Norte", FechaCreacion = new DateTime(2024, 10, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Cuadrilla { Id = 2, Nombre = "Cuadrilla Sur", Descripcion = "Equipo de trabajo zona sur", Estado = "Activa", CapacidadMaxima = 4, Supervisor = "Juan Pérez", Ubicacion = "Zona Sur", FechaCreacion = new DateTime(2024, 11, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Cuadrilla { Id = 3, Nombre = "Cuadrilla Centro", Descripcion = "Equipo de trabajo zona centro", Estado = "Inactiva", CapacidadMaxima = 6, Supervisor = "Carlos Rodríguez", Ubicacion = "Zona Centro", FechaCreacion = new DateTime(2024, 9, 1, 0, 0, 0, DateTimeKind.Utc) }
            );

            // Asignaciones semilla
            modelBuilder.Entity<CuadrillaColaborador>().HasData(
                new CuadrillaColaborador { Id = 1, CuadrillaId = 1, PersonalDNI = "87654321", Rol = "Supervisor", FechaAsignacion = new DateTime(2024, 10, 1, 0, 0, 0, DateTimeKind.Utc), Activo = true },
                new CuadrillaColaborador { Id = 2, CuadrillaId = 1, PersonalDNI = "12345678", Rol = "Técnico", FechaAsignacion = new DateTime(2024, 11, 1, 0, 0, 0, DateTimeKind.Utc), Activo = true },
                new CuadrillaColaborador { Id = 3, CuadrillaId = 2, PersonalDNI = "11223344", Rol = "Operario", FechaAsignacion = new DateTime(2024, 11, 1, 0, 0, 0, DateTimeKind.Utc), Activo = true },
                new CuadrillaColaborador { Id = 4, CuadrillaId = 2, PersonalDNI = "44332211", Rol = "Técnico", FechaAsignacion = new DateTime(2024, 11, 15, 0, 0, 0, DateTimeKind.Utc), Activo = true }
            );
        }
    }
}