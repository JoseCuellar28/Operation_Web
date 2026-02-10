using Microsoft.EntityFrameworkCore;
using OperationWeb.Core.Entities;

namespace OperationWeb.DataAccess
{
    public class OperaMainDbContext : DbContext
    {
        public OperaMainDbContext(DbContextOptions<OperaMainDbContext> options) : base(options)
        {
        }

        public DbSet<Material> Materiales { get; set; }
        public DbSet<Vehiculo> Vehiculos { get; set; }
        public DbSet<Empleado> Colaboradores { get; set; }
        public DbSet<AsistenciaDiaria> AsistenciasDiarias { get; set; }
        public DbSet<User> Users { get; set; }
        // Empleados alias for repository compatibility if needed
        public DbSet<Empleado> Empleados => Colaboradores;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AsistenciaDiaria>(entity =>
            {
                entity.ToTable("ASISTENCIA_DIARIA");
                entity.HasKey(e => e.IdRegistro);
                
                entity.Property(e => e.CheckSaludApto).HasColumnName("check_salud_apto").HasColumnType("bit");
                entity.Property(e => e.WhatsappSync).HasColumnName("whatsapp_sync").HasColumnType("bit");
            });

            modelBuilder.Entity<Material>(entity =>
            {
                entity.ToTable("CATALOGO_MATERIALES");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id).HasColumnName("id_material");
                entity.Property(e => e.Nombre).HasColumnName("nombre");
                entity.Property(e => e.Tipo).HasColumnName("tipo");
                entity.Property(e => e.UnidadMedida).HasColumnName("unidad_medida");
                entity.Property(e => e.CostoUnitario).HasColumnName("costo_unitario");
                entity.Property(e => e.IdGesproyec).HasColumnName("id_gesproyec");
                entity.Property(e => e.Categoria).HasColumnName("categoria");
            });

            modelBuilder.Entity<Vehiculo>(entity =>
            {
                entity.ToTable("VEHICULOS");
                entity.HasKey(e => e.Placa);

                entity.Property(e => e.Placa).HasColumnName("placa");
                entity.Property(e => e.Marca).HasColumnName("marca");
                entity.Property(e => e.TipoActivo).HasColumnName("tipo_activo");
                entity.Property(e => e.MaxVolumen).HasColumnName("max_volumen");
                entity.Property(e => e.Estado).HasColumnName("estado");
                entity.Property(e => e.UltimoKmRegistrado).HasColumnName("ultimo_km_registrado");
                entity.Property(e => e.ProximoMantKm).HasColumnName("proximo_mant_km");
            });
        }
    }
}

// Append Manual Config if needed (Usually EF conventions work if attributes differ)
