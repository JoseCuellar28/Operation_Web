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
        public DbSet<DispositivoVinculado> DispositivosVinculados { get; set; }
        public DbSet<AsistenciaDiaria> AsistenciasDiarias { get; set; }
        public DbSet<ZonaTrabajo> ZonasTrabajo { get; set; }
        public DbSet<EstadoSalud> EstadosSalud { get; set; }
        public DbSet<CertificacionPersonal> CertificacionesPersonal { get; set; }
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

            modelBuilder.Entity<DispositivoVinculado>(entity =>
            {
                entity.ToTable("Dispositivos_Vinculados");
                entity.HasKey(e => e.IdDispositivo);
                entity.Property(e => e.IdDispositivo).HasColumnName("id_dispositivo");
                entity.Property(e => e.IdColaborador).HasColumnName("id_colaborador");
                entity.Property(e => e.ImeiHash).HasColumnName("imei_hash");
                entity.Property(e => e.UuidHash).HasColumnName("uuid_hash");
                entity.Property(e => e.FechaRegistro).HasColumnName("fecha_registro");
                entity.Property(e => e.Activo).HasColumnName("activo");
            });

            modelBuilder.Entity<ZonaTrabajo>(entity =>
            {
                entity.ToTable("Zonas_Trabajo");
                entity.HasKey(e => e.IdZona);
                entity.Property(e => e.IdZona).HasColumnName("id_zona");
                entity.Property(e => e.NombreZona).HasColumnName("nombre_zona");
                entity.Property(e => e.LatitudCentro).HasColumnName("latitud_centro");
                entity.Property(e => e.LongitudCentro).HasColumnName("longitud_centro");
                entity.Property(e => e.RadioMetros).HasColumnName("radio_metros");
                entity.Property(e => e.Activo).HasColumnName("activo");
            });

            modelBuilder.Entity<EstadoSalud>(entity =>
            {
                entity.ToTable("Estado_Salud");
                entity.HasKey(e => e.IdSalud);
                entity.Property(e => e.IdSalud).HasColumnName("id_salud");
                entity.Property(e => e.IdColaborador).HasColumnName("id_colaborador");
                entity.Property(e => e.Fecha).HasColumnName("fecha");
                entity.Property(e => e.RespuestasJson).HasColumnName("respuestas_json");
                entity.Property(e => e.Apto).HasColumnName("apto");
            });

            modelBuilder.Entity<CertificacionPersonal>(entity =>
            {
                entity.ToTable("Certificaciones_Personal");
                entity.HasKey(e => e.IdCert);
                entity.Property(e => e.IdCert).HasColumnName("id_cert");
                entity.Property(e => e.IdColaborador).HasColumnName("id_colaborador");
                entity.Property(e => e.TipoCurso).HasColumnName("tipo_curso");
                entity.Property(e => e.FechaVencimiento).HasColumnName("fecha_vencimiento");
                entity.Property(e => e.EstadoVigencia).HasColumnName("estado_vigencia");
            });
        }
    }
}

// Append Manual Config if needed (Usually EF conventions work if attributes differ)
