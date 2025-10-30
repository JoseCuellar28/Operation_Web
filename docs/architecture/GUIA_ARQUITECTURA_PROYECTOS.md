# 📋 GUÍA DE ARQUITECTURA Y ESTÁNDARES DE DESARROLLO

## 🎯 **PROPÓSITO**
Esta guía establece los estándares de arquitectura, estructura y buenas prácticas para el desarrollo de proyectos basados en el modelo exitoso del proyecto **Tareos**. Su objetivo es garantizar consistencia, mantenibilidad y escalabilidad en todos nuestros desarrollos.

---

## 🏗️ **ARQUITECTURA ESTÁNDAR**

### **Estructura de Solución Obligatoria**
```
📁 [NombreProyecto].sln
├── 🌐 [NombreProyecto].API          # Web API REST
├── 🌐 [NombreProyecto].Web          # Aplicación Web MVC (opcional)
├── 💼 [NombreProyecto].Business     # Lógica de Negocio
├── 💼 [NombreProyecto].Business.Interfaces
├── 💼 [NombreProyecto].Business.Entities
├── 🗄️ [NombreProyecto].DataAccess  # Acceso a Datos
├── 🗄️ [NombreProyecto].DataAccess.Interfaces
├── 🗄️ [NombreProyecto].DataAccess.Entities
├── 🔧 [NombreProyecto].Infrastructure
├── 🔧 [NombreProyecto].Infrastructure.Interfaces
└── 🧪 [NombreProyecto].Tests        # Pruebas Unitarias
```

### **Principios de Arquitectura**
- **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica
- **Inversión de Dependencias**: Las capas superiores dependen de abstracciones
- **Bajo Acoplamiento**: Mínima dependencia entre componentes
- **Alta Cohesión**: Elementos relacionados agrupados lógicamente

---

## 🛠️ **STACK TECNOLÓGICO ESTÁNDAR**

### **Framework Base**
- **.NET 8.0** (LTS) - Framework principal
- **ASP.NET Core** - Para APIs y aplicaciones web
- **C# 12** - Lenguaje de programación

### **Base de Datos**
- **SQL Server** - Base de datos principal
- **Entity Framework Core** - ORM recomendado
- **ADO.NET** - Para casos específicos de alto rendimiento

### **Herramientas de Desarrollo**
- **AutoMapper** - Mapeo de objetos
- **FluentValidation** - Validaciones
- **Serilog** - Logging estructurado
- **Swagger/OpenAPI** - Documentación de API

### **Testing**
- **xUnit** - Framework de pruebas
- **Moq** - Mocking
- **FluentAssertions** - Aserciones expresivas

---

## 📂 **CONVENCIONES DE NOMENCLATURA**

### **Proyectos**
```
[NombreEmpresa].[NombreProyecto].[Capa].[Subcapa]
Ejemplo: OCA.Tareos.Business.Entities
```

### **Archivos y Clases**
| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Controladores** | `[Entidad]Controller.cs` | `ClienteController.cs` |
| **DTOs** | `[Entidad]DTO.cs` | `ClienteDTO.cs` |
| **DTOs Específicos** | `[Entidad][Accion]DTO.cs` | `ClienteRegistroDTO.cs` |
| **Repositorios** | `[Entidad]Repository.cs` | `ClienteRepository.cs` |
| **Business** | `[Entidad]Business.cs` | `ClienteBusiness.cs` |
| **Interfaces** | `I[Nombre].cs` | `IClienteBusiness.cs` |
| **Entidades** | `[Entidad].cs` | `Cliente.cs` |

### **Métodos y Propiedades**
- **PascalCase** para métodos públicos: `ObtenerPorId()`
- **camelCase** para parámetros: `clienteId`
- **PascalCase** para propiedades: `NombreCompleto`

---

## 🎯 **PATRONES DE DISEÑO OBLIGATORIOS**

### **1. Repository Pattern**
```csharp
// Interface
public interface IClienteRepository : ITransaccionRepository<Cliente, int>
{
    IEnumerable<Cliente> ListarPor(Cliente filtro);
    Cliente ObtenerPorId(int id);
}

// Implementación
public class ClienteRepository : BaseRepository, IClienteRepository
{
    public ClienteRepository(IConnectionStringProvider connectionStringProvider) 
        : base(connectionStringProvider) { }
    
    // Implementación de métodos...
}
```

### **2. Business Layer Pattern**
```csharp
// Interface
public interface IClienteBusiness
{
    ResponseDTO<IEnumerable<ClienteDTO>> ListarPor(ClienteConsultaDTO request);
    ResponseDTO<ClienteDTO> ObtenerPorId(int id);
    ResponseDTO<int> Agregar(ClienteRegistroDTO request);
    ResponseDTO<int> Actualizar(ClienteRegistroDTO request);
}

// Implementación
public class ClienteBusiness : BaseBusiness, IClienteBusiness
{
    private readonly IClienteRepository clienteRepository;
    
    public ClienteBusiness(IClienteRepository clienteRepository)
    {
        this.clienteRepository = clienteRepository;
    }
    
    // Implementación de métodos...
}
```

### **3. DTO Pattern**
```csharp
// DTO Base
public class ClienteDTO : AuditoriaBaseDTO
{
    public int CodCliente { get; set; }
    public string RazonSocial { get; set; }
    public string Ruc { get; set; }
}

// DTO para Registro
public class ClienteRegistroDTO
{
    public string RazonSocial { get; set; }
    public string Ruc { get; set; }
}

// DTO para Consulta
public class ClienteConsultaDTO
{
    public string RazonSocial { get; set; }
    public string Ruc { get; set; }
    public bool? Activo { get; set; }
}
```

### **4. Response Wrapper Pattern**
```csharp
public class ResponseDTO<T>
{
    public HeaderDTO Header { get; set; }
    public T Respuesta { get; set; }
}

public class HeaderDTO
{
    public string Codigo { get; set; }
    public string Descripcion { get; set; }
}
```

---

## 📋 **ESTRUCTURA DETALLADA POR CAPA**

### **🌐 API Layer**
```
Controllers/
├── Base/
│   └── BaseController.cs
├── [Entidad]Controller.cs
└── Util/
    └── UtilController.cs

Configuración:
├── Program.cs
├── Startup.cs
├── appsettings.json
└── appsettings.Development.json
```

**Responsabilidades:**
- Exposición de endpoints REST
- Validación de entrada
- Manejo de autenticación/autorización
- Documentación con Swagger

### **💼 Business Layer**
```
Base/
├── BaseBusiness.cs
├── IBaseBusiness.cs

[Entidad]Business.cs
Util/
└── [Utilidad]Business.cs
```

**Responsabilidades:**
- Lógica de negocio
- Validaciones de negocio
- Orquestación de operaciones
- Transformación de datos

### **🗄️ Data Access Layer**
```
Base/
├── BaseRepository.cs
├── IBaseRepository.cs

[Entidad]Repository.cs
Interfaces/
├── I[Entidad]Repository.cs

Entities/
├── [Entidad].cs
```

**Responsabilidades:**
- Acceso a datos
- Mapeo de entidades
- Transacciones
- Consultas optimizadas

### **🔧 Infrastructure Layer**
```
Provider/
├── ConnectionStringProvider.cs
├── IConnectionStringProvider.cs

Service/
├── [Servicio]Service.cs
├── I[Servicio]Service.cs

Helper/
├── [Utilidad]Helper.cs

Enum/
├── [Enum].cs

Constantes.cs
AppSettings.cs
```

**Responsabilidades:**
- Servicios transversales
- Configuraciones
- Helpers y utilidades
- Constantes del sistema

---

## 🔧 **CONFIGURACIÓN DE DEPENDENCIAS**

### **Startup.cs / Program.cs**
```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Configuración de base de datos
    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
    
    // Registro de dependencias por capa
    
    // Infrastructure
    services.AddScoped<IConnectionStringProvider, ConnectionStringProvider>();
    
    // Data Access
    services.AddScoped<IClienteRepository, ClienteRepository>();
    services.AddScoped<ITareoRepository, TareoRepository>();
    
    // Business
    services.AddScoped<IClienteBusiness, ClienteBusiness>();
    services.AddScoped<ITareoBusiness, TareoBusiness>();
    
    // AutoMapper
    services.AddAutoMapper(typeof(MappingProfile));
    
    // Validaciones
    services.AddFluentValidationAutoValidation();
    services.AddValidatorsFromAssemblyContaining<ClienteValidator>();
    
    // Swagger
    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });
    });
}
```

---

## 📊 **ESTÁNDARES DE CÓDIGO**

### **Manejo de Errores**
```csharp
public class BaseBusiness
{
    protected ResponseDTO<T> HandleSuccess<T>(T data, string message = "Operación exitosa")
    {
        return new ResponseDTO<T>
        {
            Header = new HeaderDTO 
            { 
                Codigo = "200", 
                Descripcion = message 
            },
            Respuesta = data
        };
    }
    
    protected ResponseDTO<T> HandleError<T>(string error)
    {
        return new ResponseDTO<T>
        {
            Header = new HeaderDTO 
            { 
                Codigo = "500", 
                Descripcion = error 
            },
            Respuesta = default(T)
        };
    }
}
```

### **Logging Estándar**
```csharp
public class ClienteBusiness : BaseBusiness
{
    private readonly ILogger<ClienteBusiness> logger;
    
    public ClienteBusiness(ILogger<ClienteBusiness> logger)
    {
        this.logger = logger;
    }
    
    public ResponseDTO<ClienteDTO> ObtenerPorId(int id)
    {
        try
        {
            logger.LogInformation("Obteniendo cliente con ID: {ClienteId}", id);
            
            // Lógica del método...
            
            logger.LogInformation("Cliente obtenido exitosamente: {ClienteId}", id);
            return HandleSuccess(clienteDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al obtener cliente con ID: {ClienteId}", id);
            return HandleError<ClienteDTO>(ex.Message);
        }
    }
}
```

### **Validaciones**
```csharp
public class ClienteRegistroValidator : AbstractValidator<ClienteRegistroDTO>
{
    public ClienteRegistroValidator()
    {
        RuleFor(x => x.RazonSocial)
            .NotEmpty().WithMessage("La razón social es obligatoria")
            .MaximumLength(200).WithMessage("La razón social no puede exceder 200 caracteres");
            
        RuleFor(x => x.Ruc)
            .NotEmpty().WithMessage("El RUC es obligatorio")
            .Length(11).WithMessage("El RUC debe tener 11 dígitos")
            .Matches(@"^\d{11}$").WithMessage("El RUC debe contener solo números");
    }
}
```

---

## 🧪 **ESTÁNDARES DE TESTING**

### **Estructura de Tests**
```
Tests/
├── Unit/
│   ├── Business/
│   │   └── ClienteBusinessTests.cs
│   └── Repositories/
│       └── ClienteRepositoryTests.cs
├── Integration/
│   └── Controllers/
│       └── ClienteControllerTests.cs
└── Helpers/
    └── TestDataBuilder.cs
```

### **Ejemplo de Test Unitario**
```csharp
public class ClienteBusinessTests
{
    private readonly Mock<IClienteRepository> mockRepository;
    private readonly ClienteBusiness clienteBusiness;
    
    public ClienteBusinessTests()
    {
        mockRepository = new Mock<IClienteRepository>();
        clienteBusiness = new ClienteBusiness(mockRepository.Object);
    }
    
    [Fact]
    public void ObtenerPorId_ClienteExiste_DebeRetornarCliente()
    {
        // Arrange
        var clienteId = 1;
        var clienteEsperado = new Cliente { CodCliente = clienteId, RazonSocial = "Test" };
        mockRepository.Setup(x => x.ObtenerPorId(clienteId)).Returns(clienteEsperado);
        
        // Act
        var resultado = clienteBusiness.ObtenerPorId(clienteId);
        
        // Assert
        resultado.Should().NotBeNull();
        resultado.Header.Codigo.Should().Be("200");
        resultado.Respuesta.CodCliente.Should().Be(clienteId);
    }
}
```

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **✅ Antes de Iniciar un Proyecto**
- [ ] Crear estructura de solución según estándar
- [ ] Configurar proyectos con las tecnologías especificadas
- [ ] Establecer referencias entre proyectos
- [ ] Configurar NuGet packages estándar
- [ ] Crear clases base (BaseRepository, BaseBusiness, etc.)

### **✅ Durante el Desarrollo**
- [ ] Seguir convenciones de nomenclatura
- [ ] Implementar patrones de diseño obligatorios
- [ ] Crear DTOs específicos para cada operación
- [ ] Implementar validaciones con FluentValidation
- [ ] Agregar logging en métodos críticos
- [ ] Escribir tests unitarios

### **✅ Antes de Entregar**
- [ ] Verificar que todos los endpoints están documentados
- [ ] Ejecutar todos los tests
- [ ] Revisar cobertura de código
- [ ] Validar estándares de código
- [ ] Verificar configuraciones de ambiente

---

## 🔄 **PROCESO DE REVISIÓN**

### **Code Review Checklist**
- [ ] ¿Se siguen las convenciones de nomenclatura?
- [ ] ¿Se implementan los patrones de diseño correctos?
- [ ] ¿Existe separación adecuada de responsabilidades?
- [ ] ¿Se manejan correctamente los errores?
- [ ] ¿Existe logging apropiado?
- [ ] ¿Se incluyen validaciones necesarias?
- [ ] ¿Existen tests unitarios?

### **Herramientas de Calidad**
- **SonarQube** - Análisis de calidad de código
- **StyleCop** - Verificación de estilo de código
- **FxCop** - Análisis estático de código

---

## 🚀 **PLAN DE MIGRACIÓN Y ALINEACIÓN**

### **📋 EVALUACIÓN INICIAL DEL PROYECTO**

Antes de iniciar la migración, evalúa el estado actual del proyecto:

#### **Checklist de Evaluación**
- [ ] **Versión de .NET actual** (¿Es .NET Framework, .NET Core, .NET 5+?)
- [ ] **Estructura de proyectos** (¿Cuántos proyectos tiene? ¿Están separados por capas?)
- [ ] **Tecnología de datos** (¿Entity Framework, ADO.NET, Dapper?)
- [ ] **Patrones implementados** (¿Repository, Business Layer, DTO?)
- [ ] **Testing existente** (¿Tiene tests unitarios/integración?)
- [ ] **Documentación** (¿Swagger, README, comentarios?)
- [ ] **Dependencias** (¿Qué NuGet packages usa?)

### **🎯 FASES DE MIGRACIÓN**

#### **FASE 1: PREPARACIÓN (1-2 días)**
1. **Backup del proyecto actual**
   ```bash
   git branch backup-pre-migration
   git checkout -b feature/architecture-migration
   ```

2. **Análisis de dependencias**
   ```bash
   # Revisar todas las dependencias actuales
   dotnet list package --outdated
   ```

3. **Documentar estructura actual**
   - Crear diagrama de la arquitectura actual
   - Listar todos los proyectos y sus responsabilidades
   - Identificar código duplicado o mal ubicado

#### **FASE 2: REESTRUCTURACIÓN DE PROYECTOS (2-3 días)**

1. **Crear nueva estructura de solución**
   ```bash
   # Crear nuevos proyectos siguiendo el estándar
   dotnet new sln -n TuProyecto
   
   # API Layer
   dotnet new webapi -n TuProyecto.API
   dotnet sln add TuProyecto.API
   
   # Business Layer
   dotnet new classlib -n TuProyecto.Business
   dotnet new classlib -n TuProyecto.Business.Interfaces
   dotnet new classlib -n TuProyecto.Business.Entities
   dotnet sln add TuProyecto.Business TuProyecto.Business.Interfaces TuProyecto.Business.Entities
   
   # Data Access Layer
   dotnet new classlib -n TuProyecto.DataAccess
   dotnet new classlib -n TuProyecto.DataAccess.Interfaces
   dotnet new classlib -n TuProyecto.DataAccess.Entities
   dotnet sln add TuProyecto.DataAccess TuProyecto.DataAccess.Interfaces TuProyecto.DataAccess.Entities
   
   # Infrastructure Layer
   dotnet new classlib -n TuProyecto.Infrastructure
   dotnet new classlib -n TuProyecto.Infrastructure.Interfaces
   dotnet sln add TuProyecto.Infrastructure TuProyecto.Infrastructure.Interfaces
   ```

2. **Configurar referencias entre proyectos**
   ```bash
   # API referencias
   dotnet add TuProyecto.API reference TuProyecto.Business.Interfaces
   dotnet add TuProyecto.API reference TuProyecto.Business
   dotnet add TuProyecto.API reference TuProyecto.DataAccess
   dotnet add TuProyecto.API reference TuProyecto.Infrastructure
   
   # Business referencias
   dotnet add TuProyecto.Business reference TuProyecto.Business.Interfaces
   dotnet add TuProyecto.Business reference TuProyecto.Business.Entities
   dotnet add TuProyecto.Business reference TuProyecto.DataAccess.Interfaces
   dotnet add TuProyecto.Business reference TuProyecto.Infrastructure.Interfaces
   
   # DataAccess referencias
   dotnet add TuProyecto.DataAccess reference TuProyecto.DataAccess.Interfaces
   dotnet add TuProyecto.DataAccess reference TuProyecto.DataAccess.Entities
   dotnet add TuProyecto.DataAccess reference TuProyecto.Infrastructure.Interfaces
   ```

#### **FASE 3: MIGRACIÓN DE CÓDIGO (3-5 días)**

1. **Migrar entidades y DTOs**
   - Mover entidades a `TuProyecto.DataAccess.Entities`
   - Mover DTOs a `TuProyecto.Business.Entities`
   - Aplicar convenciones de nomenclatura

2. **Migrar repositorios**
   - Crear interfaces en `TuProyecto.DataAccess.Interfaces`
   - Implementar repositorios en `TuProyecto.DataAccess`
   - Aplicar patrón Repository estándar

3. **Migrar lógica de negocio**
   - Crear interfaces en `TuProyecto.Business.Interfaces`
   - Implementar business classes en `TuProyecto.Business`
   - Aplicar patrón Business Layer

4. **Migrar controllers**
   - Actualizar controllers en `TuProyecto.API`
   - Aplicar convenciones de nomenclatura
   - Implementar ResponseDTO estándar

#### **FASE 4: ACTUALIZACIÓN TECNOLÓGICA (2-3 días)**

1. **Actualizar a .NET 8.0**
   ```xml
   <!-- En todos los .csproj -->
   <TargetFramework>net8.0</TargetFramework>
   ```

2. **Instalar paquetes estándar**
   ```bash
   # En el proyecto API
   dotnet add package Microsoft.EntityFrameworkCore.SqlServer
   dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
   dotnet add package FluentValidation.AspNetCore
   dotnet add package Serilog.AspNetCore
   dotnet add package Swashbuckle.AspNetCore
   
   # En el proyecto Business
   dotnet add package AutoMapper
   dotnet add package FluentValidation
   
   # En el proyecto DataAccess
   dotnet add package Microsoft.EntityFrameworkCore.SqlServer
   dotnet add package Microsoft.EntityFrameworkCore.Tools
   ```

3. **Configurar Entity Framework**
   ```csharp
   // Crear DbContext
   public class TuProyectoDbContext : DbContext
   {
       public TuProyectoDbContext(DbContextOptions<TuProyectoDbContext> options) : base(options) { }
       
       // DbSets aquí
   }
   ```

#### **FASE 5: IMPLEMENTACIÓN DE PATRONES (2-3 días)**

1. **Implementar ResponseDTO**
   ```csharp
   public class ResponseDTO<T>
   {
       public HeaderDTO Header { get; set; }
       public T Respuesta { get; set; }
   }
   ```

2. **Implementar Base Classes**
   - BaseRepository
   - BaseBusiness
   - BaseController

3. **Configurar AutoMapper**
   ```csharp
   // Crear profiles de mapeo
   public class MappingProfile : Profile
   {
       public MappingProfile()
       {
           CreateMap<Entity, DTO>().ReverseMap();
       }
   }
   ```

#### **FASE 6: TESTING Y VALIDACIÓN (2-3 días)**

1. **Crear proyectos de testing**
   ```bash
   dotnet new xunit -n TuProyecto.Tests.Unit
   dotnet new xunit -n TuProyecto.Tests.Integration
   dotnet sln add TuProyecto.Tests.Unit TuProyecto.Tests.Integration
   ```

2. **Implementar tests básicos**
   - Tests unitarios para Business Layer
   - Tests de integración para API
   - Tests de repositorio

3. **Validar funcionalidad**
   - Ejecutar todos los tests
   - Probar endpoints con Postman
   - Verificar logs y errores

### **⏱️ CRONOGRAMA ESTIMADO**

| Fase | Duración | Recursos | Entregables |
|------|----------|----------|-------------|
| **Evaluación** | 1-2 días | 1 dev senior | Documento de análisis |
| **Reestructuración** | 2-3 días | 1 dev senior | Nueva estructura de proyectos |
| **Migración** | 3-5 días | 2 devs | Código migrado |
| **Actualización** | 2-3 días | 1 dev senior | Tecnologías actualizadas |
| **Patrones** | 2-3 días | 1 dev senior | Patrones implementados |
| **Testing** | 2-3 días | 1 dev | Tests y validación |
| **TOTAL** | **12-19 días** | | Proyecto alineado |

### **🎯 CRITERIOS DE ACEPTACIÓN**

#### **Estructura**
- [ ] Solución tiene exactamente 10+ proyectos según estándar
- [ ] Referencias entre proyectos son correctas
- [ ] Nomenclatura sigue convenciones establecidas

#### **Tecnología**
- [ ] Proyecto usa .NET 8.0
- [ ] Entity Framework Core configurado
- [ ] AutoMapper implementado
- [ ] FluentValidation configurado
- [ ] Serilog para logging
- [ ] Swagger documentado

#### **Patrones**
- [ ] Repository Pattern implementado
- [ ] Business Layer Pattern implementado
- [ ] DTO Pattern implementado
- [ ] ResponseDTO estándar usado
- [ ] Dependency Injection configurado

#### **Calidad**
- [ ] Tests unitarios > 70% cobertura
- [ ] Tests de integración funcionando
- [ ] Sin warnings de compilación
- [ ] Documentación actualizada

### **🚨 RIESGOS Y MITIGACIONES**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Pérdida de funcionalidad** | Media | Alto | Testing exhaustivo en cada fase |
| **Problemas de performance** | Baja | Medio | Benchmarking antes/después |
| **Resistencia del equipo** | Media | Medio | Capacitación y documentación |
| **Tiempo excedido** | Alta | Medio | Migración por módulos |

### **📋 CHECKLIST POST-MIGRACIÓN**

#### **Funcionalidad**
- [ ] Todas las funcionalidades existentes funcionan
- [ ] APIs responden correctamente
- [ ] Base de datos se conecta sin problemas
- [ ] Logs se generan correctamente

#### **Performance**
- [ ] Tiempos de respuesta similares o mejores
- [ ] Uso de memoria optimizado
- [ ] Consultas a BD eficientes

#### **Mantenibilidad**
- [ ] Código es más legible
- [ ] Separación de responsabilidades clara
- [ ] Fácil agregar nuevas funcionalidades
- [ ] Tests facilitan refactoring

## 📚 **RECURSOS ADICIONALES**

### **Documentación Oficial**
- [.NET 8.0 Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [AutoMapper](https://automapper.org/)
- [FluentValidation](https://fluentvalidation.net/)
- [Serilog](https://serilog.net/)

### **Herramientas Recomendadas**
- **Visual Studio 2022** o **VS Code**
- **SQL Server Management Studio**
- **Postman** para testing de APIs
- **SonarQube** para análisis de código

### **Scripts de Automatización**
```powershell
# Script para crear estructura estándar
# Guardar como: create-standard-structure.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName
)

Write-Host "Creando estructura estándar para $ProjectName..." -ForegroundColor Green

# Crear solución
dotnet new sln -n $ProjectName

# Crear proyectos
$projects = @(
    "$ProjectName.API",
    "$ProjectName.Business",
    "$ProjectName.Business.Interfaces", 
    "$ProjectName.Business.Entities",
    "$ProjectName.DataAccess",
    "$ProjectName.DataAccess.Interfaces",
    "$ProjectName.DataAccess.Entities",
    "$ProjectName.Infrastructure",
    "$ProjectName.Infrastructure.Interfaces",
    "$ProjectName.Tests.Unit",
    "$ProjectName.Tests.Integration"
)

foreach ($project in $projects) {
    if ($project.Contains(".API")) {
        dotnet new webapi -n $project
    } elseif ($project.Contains(".Tests")) {
        dotnet new xunit -n $project
    } else {
        dotnet new classlib -n $project
    }
    dotnet sln add $project
}

Write-Host "Estructura creada exitosamente!" -ForegroundColor Green
```

---

**📝 Nota:** Esta guía debe ser revisada y actualizada periódicamente para mantener las mejores prácticas actualizadas.

**🎯 Objetivo:** Garantizar que todos los proyectos del equipo sigan los mismos estándares de calidad, mantenibilidad y escalabilidad.

---

## 🎯 **CONCLUSIÓN**

Esta guía debe ser seguida estrictamente en todos los proyectos para garantizar:
- **Consistencia** en la arquitectura
- **Mantenibilidad** del código
- **Escalabilidad** de las soluciones
- **Calidad** en las entregas

**Recuerda**: La adherencia a estos estándares no es opcional, es un requisito para todos los desarrollos del equipo.

---

*Versión: 1.0*  
*Fecha: Diciembre 2024*  
*Basado en: Proyecto Tareos - Arquitectura de Referencia*