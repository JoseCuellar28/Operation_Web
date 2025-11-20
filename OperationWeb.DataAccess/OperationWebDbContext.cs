using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.DataAccess
{
    public class OperationWebDbContext : DbContext
    {
        public OperationWebDbContext(DbContextOptions<OperationWebDbContext> options) : base(options)
        {
        }

        public DbSet<Cuadrilla> Cuadrillas { get; set; }
        public DbSet<Colaborador> Colaboradores { get; set; }
        public DbSet<CuadrillaColaborador> CuadrillaColaboradores { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

                entity.HasIndex(e => e.Nombre).IsUnique();
            });

            // Configuración de Colaborador
            modelBuilder.Entity<Colaborador>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Apellido).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Documento).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Telefono).HasMaxLength(20);
                entity.Property(e => e.Cargo).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Estado).IsRequired().HasMaxLength(50).HasDefaultValue("Activo");
                entity.Property(e => e.FechaIngreso).HasDefaultValueSql("GETUTCDATE()");

                entity.HasIndex(e => e.Documento).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
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

                entity.HasOne(e => e.Colaborador)
                    .WithMany(c => c.CuadrillaColaboradores)
                    .HasForeignKey(e => e.ColaboradorId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Índice único para evitar duplicados activos
                entity.HasIndex(e => new { e.CuadrillaId, e.ColaboradorId, e.Activo })
                    .IsUnique()
                    .HasFilter("[Activo] = 1");
            });

            // Configuración de Empleado
            modelBuilder.Entity<Empleado>(entity =>
            {
                entity.HasKey(e => e.IdEmpleado);
                entity.ToTable("Empleado");
                
                entity.Property(e => e.CodigoEmpleado).HasMaxLength(50);
                entity.Property(e => e.NumeroDocumento).HasMaxLength(20);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ApellidoPaterno).HasMaxLength(100);
                entity.Property(e => e.ApellidoMaterno).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Telefono).HasMaxLength(20);
                entity.Property(e => e.UsuarioActivo).HasMaxLength(1);
                entity.Property(e => e.UsuarioCreacion).HasMaxLength(50);
                entity.Property(e => e.UsuarioModificacion).HasMaxLength(50);

                // Índices únicos
                entity.HasIndex(e => e.NumeroDocumento).IsUnique().HasFilter("[NumeroDocumento] IS NOT NULL");
                entity.HasIndex(e => e.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
                entity.HasIndex(e => e.CodigoEmpleado).IsUnique().HasFilter("[CodigoEmpleado] IS NOT NULL");
            });

            // Seguridad: Users, Roles, UserRoles
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.Username).IsUnique();
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

            // Datos semilla
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Colaboradores semilla
            modelBuilder.Entity<Colaborador>().HasData(
                new Colaborador { Id = 1, Nombre = "Juan", Apellido = "Pérez", Documento = "12345678", Email = "juan.perez@empresa.com", Telefono = "555-0001", Cargo = "Técnico", Estado = "Activo", FechaIngreso = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Colaborador { Id = 2, Nombre = "María", Apellido = "González", Documento = "87654321", Email = "maria.gonzalez@empresa.com", Telefono = "555-0002", Cargo = "Supervisor", Estado = "Activo", FechaIngreso = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Colaborador { Id = 3, Nombre = "Carlos", Apellido = "Rodríguez", Documento = "11223344", Email = "carlos.rodriguez@empresa.com", Telefono = "555-0003", Cargo = "Operario", Estado = "Activo", FechaIngreso = new DateTime(2024, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Colaborador { Id = 4, Nombre = "Ana", Apellido = "López", Documento = "44332211", Email = "ana.lopez@empresa.com", Telefono = "555-0004", Cargo = "Técnico", Estado = "Activo", FechaIngreso = new DateTime(2024, 4, 1, 0, 0, 0, DateTimeKind.Utc) }
            );

            // Cuadrillas semilla
            modelBuilder.Entity<Cuadrilla>().HasData(
                new Cuadrilla { Id = 1, Nombre = "Cuadrilla Norte", Descripcion = "Equipo de trabajo zona norte", Estado = "Activa", CapacidadMaxima = 5, Supervisor = "María González", Ubicacion = "Zona Norte", FechaCreacion = new DateTime(2024, 10, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Cuadrilla { Id = 2, Nombre = "Cuadrilla Sur", Descripcion = "Equipo de trabajo zona sur", Estado = "Activa", CapacidadMaxima = 4, Supervisor = "Juan Pérez", Ubicacion = "Zona Sur", FechaCreacion = new DateTime(2024, 11, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Cuadrilla { Id = 3, Nombre = "Cuadrilla Centro", Descripcion = "Equipo de trabajo zona centro", Estado = "Inactiva", CapacidadMaxima = 6, Supervisor = "Carlos Rodríguez", Ubicacion = "Zona Centro", FechaCreacion = new DateTime(2024, 9, 1, 0, 0, 0, DateTimeKind.Utc) }
            );

            // Asignaciones semilla
            modelBuilder.Entity<CuadrillaColaborador>().HasData(
                new CuadrillaColaborador { Id = 1, CuadrillaId = 1, ColaboradorId = 2, Rol = "Supervisor", FechaAsignacion = new DateTime(2024, 10, 1, 0, 0, 0, DateTimeKind.Utc), Activo = true },
                new CuadrillaColaborador { Id = 2, CuadrillaId = 1, ColaboradorId = 1, Rol = "Técnico", FechaAsignacion = new DateTime(2024, 11, 1, 0, 0, 0, DateTimeKind.Utc), Activo = true },
                new CuadrillaColaborador { Id = 3, CuadrillaId = 2, ColaboradorId = 3, Rol = "Operario", FechaAsignacion = new DateTime(2024, 11, 1, 0, 0, 0, DateTimeKind.Utc), Activo = true },
                new CuadrillaColaborador { Id = 4, CuadrillaId = 2, ColaboradorId = 4, Rol = "Técnico", FechaAsignacion = new DateTime(2024, 11, 15, 0, 0, 0, DateTimeKind.Utc), Activo = true }
            );
        }
    }
}