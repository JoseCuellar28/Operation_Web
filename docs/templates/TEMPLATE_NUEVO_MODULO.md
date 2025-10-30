# 🚀 Template para Nuevos Módulos - OperationWeb

## 📋 Guía de Implementación

Este template proporciona una guía paso a paso para implementar nuevos módulos en el sistema OperationWeb, siguiendo la misma arquitectura y patrones establecidos en el módulo de Cuadrillas.

## 🎯 Antes de Comenzar

### **Información del Módulo**
- **Nombre del Módulo:** `[NOMBRE_MODULO]`
- **Entidad Principal:** `[ENTIDAD_PRINCIPAL]`
- **Descripción:** `[DESCRIPCION_FUNCIONAL]`
- **Responsable:** `[DESARROLLADOR]`
- **Fecha Inicio:** `[FECHA]`

### **Dependencias Requeridas**
- ✅ .NET 8.0 SDK
- ✅ Entity Framework Core 9.0
- ✅ SQL Server LocalDB
- ✅ Proyecto base OperationWeb configurado

## 📁 Paso 1: Crear Entidades

### **Ubicación:** `OperationWeb.DataAccess.Entities/`

#### **1.1 Entidad Principal**
```csharp
// [ENTIDAD_PRINCIPAL].cs
using System.ComponentModel.DataAnnotations;

namespace OperationWeb.DataAccess.Entities
{
    public class [ENTIDAD_PRINCIPAL]
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }
        
        [StringLength(500)]
        public string Descripcion { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Estado { get; set; }
        
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        
        // Agregar propiedades específicas del módulo aquí
        
        // Relaciones (si aplica)
        // public virtual ICollection<[ENTIDAD_RELACIONADA]> [ENTIDADES_RELACIONADAS] { get; set; }
    }
}
```

#### **1.2 Entidades Relacionadas (si aplica)**
```csharp
// [ENTIDAD_RELACIONADA].cs
// Seguir el mismo patrón que la entidad principal
```

## 🔌 Paso 2: Crear Interfaces de Repositorio

### **Ubicación:** `OperationWeb.DataAccess.Interfaces/`

#### **2.1 Interface del Repositorio Principal**
```csharp
// I[ENTIDAD_PRINCIPAL]Repository.cs
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.DataAccess.Interfaces
{
    public interface I[ENTIDAD_PRINCIPAL]Repository : IRepository<[ENTIDAD_PRINCIPAL]>
    {
        // Métodos específicos del módulo
        Task<IEnumerable<[ENTIDAD_PRINCIPAL]>> Get[ENTIDAD_PRINCIPAL]sPorEstadoAsync(string estado);
        Task<[ENTIDAD_PRINCIPAL]> Get[ENTIDAD_PRINCIPAL]ConDetallesAsync(int id);
        Task<bool> Existe[CAMPO_UNICO]Async(string [campoUnico], int? id = null);
        
        // Agregar métodos específicos según necesidades del módulo
    }
}
```

## 🗄️ Paso 3: Implementar Repositorios

### **Ubicación:** `OperationWeb.DataAccess/Repositories/`

#### **3.1 Repositorio Principal**
```csharp
// [ENTIDAD_PRINCIPAL]Repository.cs
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Interfaces;

namespace OperationWeb.DataAccess.Repositories
{
    public class [ENTIDAD_PRINCIPAL]Repository : Repository<[ENTIDAD_PRINCIPAL]>, I[ENTIDAD_PRINCIPAL]Repository
    {
        public [ENTIDAD_PRINCIPAL]Repository(OperationWebDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<[ENTIDAD_PRINCIPAL]>> Get[ENTIDAD_PRINCIPAL]sPorEstadoAsync(string estado)
        {
            return await _context.[ENTIDAD_PRINCIPAL]s
                .Where(x => x.Estado == estado)
                .OrderBy(x => x.Nombre)
                .ToListAsync();
        }

        public async Task<[ENTIDAD_PRINCIPAL]> Get[ENTIDAD_PRINCIPAL]ConDetallesAsync(int id)
        {
            return await _context.[ENTIDAD_PRINCIPAL]s
                .Include(x => x.[ENTIDADES_RELACIONADAS])
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<bool> Existe[CAMPO_UNICO]Async(string [campoUnico], int? id = null)
        {
            return await _context.[ENTIDAD_PRINCIPAL]s
                .AnyAsync(x => x.[CampoUnico] == [campoUnico] && (id == null || x.Id != id));
        }

        // Implementar métodos específicos del módulo
    }
}
```

## 💼 Paso 4: Crear Interfaces de Servicios

### **Ubicación:** `OperationWeb.Business.Interfaces/`

#### **4.1 Interface del Servicio Principal**
```csharp
// I[ENTIDAD_PRINCIPAL]Service.cs
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface I[ENTIDAD_PRINCIPAL]Service
    {
        // Operaciones CRUD básicas
        Task<IEnumerable<[ENTIDAD_PRINCIPAL]>> GetAll[ENTIDAD_PRINCIPAL]sAsync();
        Task<[ENTIDAD_PRINCIPAL]> Get[ENTIDAD_PRINCIPAL]ByIdAsync(int id);
        Task<[ENTIDAD_PRINCIPAL]> Create[ENTIDAD_PRINCIPAL]Async([ENTIDAD_PRINCIPAL] [entidad]);
        Task<[ENTIDAD_PRINCIPAL]> Update[ENTIDAD_PRINCIPAL]Async([ENTIDAD_PRINCIPAL] [entidad]);
        Task<bool> Delete[ENTIDAD_PRINCIPAL]Async(int id);
        
        // Operaciones específicas del módulo
        Task<IEnumerable<[ENTIDAD_PRINCIPAL]>> Get[ENTIDAD_PRINCIPAL]sByEstadoAsync(string estado);
        Task<bool> Validate[CAMPO_UNICO]UniqueAsync(string [campoUnico], int? id = null);
        
        // Agregar métodos específicos según necesidades del módulo
    }
}
```

## 🧠 Paso 5: Implementar Servicios de Negocio

### **Ubicación:** `OperationWeb.Business/Services/`

#### **5.1 Servicio Principal**
```csharp
// [ENTIDAD_PRINCIPAL]Service.cs
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Interfaces;

namespace OperationWeb.Business.Services
{
    public class [ENTIDAD_PRINCIPAL]Service : I[ENTIDAD_PRINCIPAL]Service
    {
        private readonly I[ENTIDAD_PRINCIPAL]Repository _[entidad]Repository;

        public [ENTIDAD_PRINCIPAL]Service(I[ENTIDAD_PRINCIPAL]Repository [entidad]Repository)
        {
            _[entidad]Repository = [entidad]Repository;
        }

        public async Task<IEnumerable<[ENTIDAD_PRINCIPAL]>> GetAll[ENTIDAD_PRINCIPAL]sAsync()
        {
            return await _[entidad]Repository.GetAllAsync();
        }

        public async Task<[ENTIDAD_PRINCIPAL]> Get[ENTIDAD_PRINCIPAL]ByIdAsync(int id)
        {
            return await _[entidad]Repository.GetByIdAsync(id);
        }

        public async Task<[ENTIDAD_PRINCIPAL]> Create[ENTIDAD_PRINCIPAL]Async([ENTIDAD_PRINCIPAL] [entidad])
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace([entidad].Nombre))
                throw new ArgumentException("El nombre es requerido");

            if (await _[entidad]Repository.Existe[CAMPO_UNICO]Async([entidad].[CampoUnico]))
                throw new InvalidOperationException("Ya existe un registro con este [campo único]");

            // Establecer valores por defecto
            [entidad].FechaCreacion = DateTime.UtcNow;
            [entidad].Estado = [entidad].Estado ?? "Activo";

            return await _[entidad]Repository.AddAsync([entidad]);
        }

        public async Task<[ENTIDAD_PRINCIPAL]> Update[ENTIDAD_PRINCIPAL]Async([ENTIDAD_PRINCIPAL] [entidad])
        {
            // Validaciones de negocio
            var existing = await _[entidad]Repository.GetByIdAsync([entidad].Id);
            if (existing == null)
                throw new ArgumentException("El registro no existe");

            if (await _[entidad]Repository.Existe[CAMPO_UNICO]Async([entidad].[CampoUnico], [entidad].Id))
                throw new InvalidOperationException("Ya existe otro registro con este [campo único]");

            // Actualizar campos
            existing.Nombre = [entidad].Nombre;
            existing.Descripcion = [entidad].Descripcion;
            existing.Estado = [entidad].Estado;
            existing.FechaModificacion = DateTime.UtcNow;
            
            // Actualizar campos específicos del módulo

            return await _[entidad]Repository.UpdateAsync(existing);
        }

        public async Task<bool> Delete[ENTIDAD_PRINCIPAL]Async(int id)
        {
            var [entidad] = await _[entidad]Repository.GetByIdAsync(id);
            if ([entidad] == null)
                return false;

            // Validaciones de negocio antes de eliminar
            // Ejemplo: verificar que no tenga relaciones activas

            return await _[entidad]Repository.DeleteAsync(id);
        }

        public async Task<IEnumerable<[ENTIDAD_PRINCIPAL]>> Get[ENTIDAD_PRINCIPAL]sByEstadoAsync(string estado)
        {
            return await _[entidad]Repository.Get[ENTIDAD_PRINCIPAL]sPorEstadoAsync(estado);
        }

        public async Task<bool> Validate[CAMPO_UNICO]UniqueAsync(string [campoUnico], int? id = null)
        {
            return !await _[entidad]Repository.Existe[CAMPO_UNICO]Async([campoUnico], id);
        }

        // Implementar métodos específicos del módulo
    }
}
```

## 🌐 Paso 6: Crear Controladores API

### **Ubicación:** `OperationWeb.API/Controllers/`

#### **6.1 Controlador Principal**
```csharp
// [ENTIDAD_PRINCIPAL]sController.cs
using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class [ENTIDAD_PRINCIPAL]sController : ControllerBase
    {
        private readonly I[ENTIDAD_PRINCIPAL]Service _[entidad]Service;
        private readonly ILogger<[ENTIDAD_PRINCIPAL]sController> _logger;

        public [ENTIDAD_PRINCIPAL]sController(
            I[ENTIDAD_PRINCIPAL]Service [entidad]Service,
            ILogger<[ENTIDAD_PRINCIPAL]sController> logger)
        {
            _[entidad]Service = [entidad]Service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<[ENTIDAD_PRINCIPAL]>>> GetAll()
        {
            try
            {
                var [entidades] = await _[entidad]Service.GetAll[ENTIDAD_PRINCIPAL]sAsync();
                return Ok([entidades]);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener [entidades]");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<[ENTIDAD_PRINCIPAL]>> GetById(int id)
        {
            try
            {
                var [entidad] = await _[entidad]Service.Get[ENTIDAD_PRINCIPAL]ByIdAsync(id);
                if ([entidad] == null)
                    return NotFound($"No se encontró la [entidad] con ID {id}");

                return Ok([entidad]);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener [entidad] con ID {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("estado/{estado}")]
        public async Task<ActionResult<IEnumerable<[ENTIDAD_PRINCIPAL]>>> GetByEstado(string estado)
        {
            try
            {
                var [entidades] = await _[entidad]Service.Get[ENTIDAD_PRINCIPAL]sByEstadoAsync(estado);
                return Ok([entidades]);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener [entidades] por estado {Estado}", estado);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost]
        public async Task<ActionResult<[ENTIDAD_PRINCIPAL]>> Create([ENTIDAD_PRINCIPAL] [entidad])
        {
            try
            {
                var nueva[Entidad] = await _[entidad]Service.Create[ENTIDAD_PRINCIPAL]Async([entidad]);
                return CreatedAtAction(nameof(GetById), new { id = nueva[Entidad].Id }, nueva[Entidad]);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear [entidad]");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<[ENTIDAD_PRINCIPAL]>> Update(int id, [ENTIDAD_PRINCIPAL] [entidad])
        {
            try
            {
                if (id != [entidad].Id)
                    return BadRequest("El ID de la URL no coincide con el ID del objeto");

                var [entidad]Actualizada = await _[entidad]Service.Update[ENTIDAD_PRINCIPAL]Async([entidad]);
                return Ok([entidad]Actualizada);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar [entidad] con ID {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var eliminada = await _[entidad]Service.Delete[ENTIDAD_PRINCIPAL]Async(id);
                if (!eliminada)
                    return NotFound($"No se encontró la [entidad] con ID {id}");

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar [entidad] con ID {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("validar-[campo-unico]/{[campoUnico]}")]
        public async Task<ActionResult<bool>> ValidateUnique[CampoUnico](string [campoUnico], [FromQuery] int? id = null)
        {
            try
            {
                var isUnique = await _[entidad]Service.Validate[CAMPO_UNICO]UniqueAsync([campoUnico], id);
                return Ok(new { isUnique });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar [campo único] {[CampoUnico]}", [campoUnico]);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // Agregar endpoints específicos del módulo
    }
}
```

## ⚙️ Paso 7: Configurar Inyección de Dependencias

### **Ubicación:** `OperationWeb.API/Program.cs`

#### **7.1 Registrar Servicios**
```csharp
// Agregar en Program.cs después de los servicios existentes

// Repositorios del nuevo módulo
builder.Services.AddScoped<I[ENTIDAD_PRINCIPAL]Repository, [ENTIDAD_PRINCIPAL]Repository>();

// Servicios del nuevo módulo
builder.Services.AddScoped<I[ENTIDAD_PRINCIPAL]Service, [ENTIDAD_PRINCIPAL]Service>();
```

## 🗄️ Paso 8: Configurar Base de Datos

### **8.1 Actualizar DbContext**
```csharp
// En OperationWebDbContext.cs

// Agregar DbSet
public DbSet<[ENTIDAD_PRINCIPAL]> [ENTIDAD_PRINCIPAL]s { get; set; }

// Agregar configuración en OnModelCreating
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Configuraciones existentes...
    
    // Configuración de la nueva entidad
    modelBuilder.Entity<[ENTIDAD_PRINCIPAL]>(entity =>
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
        entity.Property(e => e.Estado).IsRequired().HasMaxLength(20);
        entity.HasIndex(e => e.[CampoUnico]).IsUnique();
        
        // Configurar relaciones si aplica
        // entity.HasMany(e => e.[EntidadesRelacionadas])
        //       .WithOne(e => e.[EntidadPrincipal])
        //       .HasForeignKey(e => e.[EntidadPrincipal]Id);
    });
    
    // Datos de prueba
    modelBuilder.Entity<[ENTIDAD_PRINCIPAL]>().HasData(
        new [ENTIDAD_PRINCIPAL]
        {
            Id = 1,
            Nombre = "[Nombre de Prueba 1]",
            Descripcion = "[Descripción de prueba]",
            Estado = "Activo",
            FechaCreacion = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new [ENTIDAD_PRINCIPAL]
        {
            Id = 2,
            Nombre = "[Nombre de Prueba 2]",
            Descripcion = "[Descripción de prueba]",
            Estado = "Activo",
            FechaCreacion = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        }
    );
}
```

### **8.2 Crear y Aplicar Migración**
```bash
# Crear migración
dotnet ef migrations add Add[ENTIDAD_PRINCIPAL]Module --project OperationWeb.DataAccess --startup-project OperationWeb.API

# Aplicar migración
dotnet ef database update --project OperationWeb.DataAccess --startup-project OperationWeb.API
```

## 🧪 Paso 9: Crear Página de Pruebas

### **Ubicación:** `test_[modulo]_endpoints.html`

#### **9.1 Template de Página de Pruebas**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba API - [NOMBRE_MODULO]</title>
    <!-- Copiar estilos del archivo de pruebas de Cuadrillas -->
</head>
<body>
    <div class="container">
        <h1>🔧 Prueba API - [NOMBRE_MODULO]</h1>
        <p><strong>URL Base:</strong> <span id="baseUrl">http://localhost:5132/api</span></p>
        <p><strong>Estado de la API:</strong> <span id="apiStatus">Verificando...</span></p>
    </div>

    <div class="container">
        <h2>📋 Endpoints de [ENTIDAD_PRINCIPAL]s</h2>
        
        <!-- Agregar secciones de prueba para cada endpoint -->
        <!-- Copiar estructura del archivo de pruebas de Cuadrillas -->
    </div>

    <script>
        const baseUrl = 'http://localhost:5132/api';
        
        // Implementar funciones de prueba específicas del módulo
        // Copiar y adaptar funciones del archivo de pruebas de Cuadrillas
    </script>
</body>
</html>
```

## 📋 Paso 10: Checklist de Verificación

### **✅ Checklist de Implementación**

#### **Entidades y Modelo de Datos**
- [ ] Entidad principal creada con validaciones
- [ ] Entidades relacionadas creadas (si aplica)
- [ ] Relaciones configuradas correctamente
- [ ] Índices optimizados definidos

#### **Capa de Acceso a Datos**
- [ ] Interface de repositorio definida
- [ ] Repositorio implementado con métodos específicos
- [ ] Consultas optimizadas y asíncronas
- [ ] Manejo de relaciones configurado

#### **Capa de Negocio**
- [ ] Interface de servicio definida
- [ ] Servicio implementado con validaciones
- [ ] Lógica de negocio aplicada
- [ ] Manejo de excepciones implementado

#### **API REST**
- [ ] Controlador creado con todos los endpoints
- [ ] Validaciones de entrada implementadas
- [ ] Manejo de errores configurado
- [ ] Logging implementado

#### **Configuración**
- [ ] Inyección de dependencias configurada
- [ ] DbContext actualizado
- [ ] Migraciones creadas y aplicadas
- [ ] Datos de prueba insertados

#### **Pruebas**
- [ ] Página de pruebas creada
- [ ] Todos los endpoints probados
- [ ] Validaciones verificadas
- [ ] Casos de error probados

#### **Documentación**
- [ ] Documentación del módulo creada
- [ ] Endpoints documentados
- [ ] Ejemplos de uso incluidos
- [ ] Guía de configuración actualizada

## 🚀 Comandos de Verificación

```bash
# Verificar compilación
dotnet build

# Ejecutar API
dotnet run --project OperationWeb.API

# Verificar base de datos
dotnet ef database update --project OperationWeb.DataAccess --startup-project OperationWeb.API

# Probar endpoints
# Abrir: http://localhost:8080/test_[modulo]_endpoints.html
```

## 📈 Métricas de Éxito

### **Criterios de Aceptación**
- ✅ Todos los endpoints responden correctamente
- ✅ Validaciones de negocio funcionan
- ✅ Base de datos se actualiza correctamente
- ✅ Página de pruebas funciona sin errores
- ✅ Documentación está completa
- ✅ Código sigue estándares establecidos

## 🔄 Próximos Pasos

1. **Implementar Frontend:** Crear componentes React/Angular
2. **Agregar Autenticación:** Implementar JWT y autorización
3. **Optimizar Rendimiento:** Agregar caché y paginación
4. **Implementar Notificaciones:** SignalR para tiempo real
5. **Crear Reportes:** Dashboards y analytics

---

**📝 Notas Importantes:**
- Reemplazar todos los placeholders `[TEXTO]` con valores específicos del módulo
- Seguir las convenciones de nomenclatura establecidas
- Mantener consistencia con la arquitectura existente
- Probar exhaustivamente antes de considerar completo
- Documentar cualquier desviación del template

**🎯 Objetivo:** Crear módulos consistentes, mantenibles y escalables siguiendo los patrones establecidos en el sistema OperationWeb.