# OperationWeb

Sistema de gestión operacional desarrollado con .NET 9 y Clean Architecture.

## 📁 Estructura del Proyecto

### 🏗️ Proyectos Principales
- **OperationWeb.API**: Capa de presentación (Web API)
- **OperationWeb.Business**: Capa de lógica de negocio
- **OperationWeb.Business.Interfaces**: Interfaces de la capa de negocio
- **OperationWeb.DataAccess**: Capa de acceso a datos
- **OperationWeb.DataAccess.Interfaces**: Interfaces de acceso a datos
- **OperationWeb.DataAccess.Entities**: Entidades del modelo de datos
- **OperationWeb.Infrastructure**: Capa de infraestructura
- **OperationWeb.Infrastructure.Interfaces**: Interfaces de infraestructura
- **OperationWeb.Tests**: Pruebas unitarias

### 📚 Documentación (`docs/`)
- **`architecture/`**: Documentación de arquitectura y patrones
- **`guides/`**: Guías de implementación y configuración
- **`modules/`**: Documentación específica de módulos
- **`templates/`**: Plantillas para nuevos desarrollos

### 🎨 Frontend (`frontend/`)
- **`Modelo_Funcional/`**: Prototipos y modelos funcionales

### 🧪 Pruebas (`tests/`)
- **`api/`**: Pruebas de endpoints de API
- **`unit/`**: Pruebas unitarias
- **`integration/`**: Pruebas de integración

### 🛠️ Herramientas (`tools/`)
- Utilidades y scripts de desarrollo

## 🚀 Tecnologías

- .NET 9
- Entity Framework Core
- SQL Server
- Clean Architecture
- Repository Pattern
- Dependency Injection

## 🔐 Arquitectura y Seguridad del Sistema

### Arquitectura y Tecnologías Clave
- Backend (.NET/C#):
  - Framework: ASP.NET Core (`net9.0`) con OpenAPI en `OperationWeb.API/OperationWeb.API.csproj:4–15`; DI y pipeline en `OperationWeb.API/Program.cs:19–56`.
  - ORM: Entity Framework Core SQL Server en `OperationWeb.DataAccess/OperationWeb.DataAccess.csproj:9–14` y `OperationWeb.API/Program.cs:16–17`.
  - Capas: `API`, `Business`, `DataAccess`, `Entities`, `Interfaces`, `Infrastructure`.
  - Servidor: `UseHttpsRedirection`, `UseCors`, `MapControllers` en `OperationWeb.API/Program.cs:50–56`.
- Base de datos:
  - SQL Server con cadenas en `OperationWeb.API/appsettings.json:2–6`; `DbContext` en `OperationWeb.DataAccess/OperationWebDbContext.cs:12–99`.
- Frontend (HTML/CSS/JS):
  - Estático; consumo de API con `fetch` en `frontend/Modelo_Funcional/js/dashboard_simple.js:3361–3390`; reescritura estática `vercel.json:1`.
- Servicio Python (standalone):
  - Flask + `flask_cors` (`fase4-standalone/server.py:16–27`), `pandas`, `pytds`, `.env`.
  - Endpoints de salud, tablas, personal y carga Excel (`fase4-standalone/server.py:29–145`).

### Autenticación y Autorización
- API .NET: `UseAuthorization()` activo (`OperationWeb.API/Program.cs:54`) sin `AddAuthentication`/`UseAuthentication`; no hay `[Authorize]` en controladores (`OperationWeb.API/Controllers/*.cs`).
- Frontend: login simulado sin tokens/sesión servidor (`frontend/Modelo_Funcional/js/login.js:138–173`); “sesión” cliente vía `localStorage` (`frontend/Modelo_Funcional/menu1.html:967–997`).
- Python: sin autenticación; CORS abierto (`fase4-standalone/server.py:26–27`).

### Manejo de Datos
- Datos sensibles:
  - PII: `NumeroDocumento` (DNI), `Email`, `Telefono`, `NombreCompleto` (`OperationWeb.DataAccess.Entities/Empleado.cs:19–38,63–75`); `dbo.Personal` (Python `server.py:122–141`).
- Sistema de BD:
  - SQL Server en .NET (`Program.cs:16–17`) y Python (`server.py:100–109`).
- Cifrado/Hashing:
  - No hay cifrado/hashing de datos de aplicación; en explorador de BD se desactiva cifrado (`Encrypt=false`, `TrustServerCertificate=true`) (`OperationWeb.API/Controllers/DatabaseExplorerController.cs:233–235`).
- Validaciones:
  - Unicidad EF (`NumeroDocumento`, `Email`, `CodigoEmpleado`) (`OperationWeb.DataAccess/OperationWebDbContext.cs:94–98`).
  - Validación básica `ModelState` en `EmpleadosController` (`OperationWeb.API/Controllers/EmpleadosController.cs:103–107,131–135`).
  - Validación de extensión Excel (`fase4-standalone/server.py:181–186`).

### Interfaz de Red y Comunicación
- HTTPS: `UseHttpsRedirection` en API .NET (`Program.cs:50`); Flask sin TLS.
- CORS: política permisiva “AllowAll” (`Program.cs:31–39,52`); `CORS(app)` en Flask (`server.py:26–27`).
- Limitación/Validación: sin rate limiting ni autenticación de llamadas; `DatabaseExplorerController` acepta credenciales y construye conexiones desde el body (`OperationWeb.API/Controllers/DatabaseExplorerController.cs:223–247`).

### Recomendaciones
- Implementar `AddAuthentication(JwtBearer)` y políticas/roles con `[Authorize]` en controladores críticos.
- Restringir CORS a dominios conocidos.
- Habilitar cifrado de conexión (remover `Encrypt=false` y `TrustServerCertificate=true`).
- Agregar rate limiting y validaciones de entrada a nivel de API.

### Cambios de endurecimiento aplicados (Fase 1)
- Eliminado `OperationWeb.API/Controllers/DatabaseExplorerController.cs` por riesgo de manipulación de credenciales.
- Cadenas de conexión ajustadas para cifrado (`Encrypt=True; TrustServerCertificate=False`).
- Servicio Python preparado para credenciales en `.env` y conexión segura.

### Protección de Secrets (User Secrets .NET)
1. `cd OperationWeb.API && dotnet user-secrets init`
2. `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=...;Database=...;User ID=app_user;Password=<secreto>;Encrypt=True;TrustServerCertificate=False;MultipleActiveResultSets=true"`
3. Repetir para `ConnectionStrings:Database1Connection` y `Database2Connection`.

## ⚙️ Configuración Rápida

1. **Configurar la cadena de conexión** en `appsettings.json`
2. **Ejecutar migraciones**: `dotnet ef database update --project OperationWeb.DataAccess --startup-project OperationWeb.API`
3. **Ejecutar la aplicación**: `dotnet run --project OperationWeb.API`
4. **Acceder a la API**: `http://localhost:5132`

## 📖 Documentación Completa

- **[Guía de Arquitectura](docs/architecture/GUIA_ARQUITECTURA_PROYECTOS.md)**: Principios y patrones utilizados
- **[Guía de Implementación](docs/guides/GUIA_IMPLEMENTACION_PASO_A_PASO.md)**: Pasos detallados de desarrollo
- **[Módulo de Cuadrillas](docs/modules/DOCUMENTACION_MODULO_CUADRILLAS.md)**: Documentación del módulo implementado
- **[Template para Nuevos Módulos](docs/templates/TEMPLATE_NUEVO_MODULO.md)**: Plantilla para desarrollo de nuevos módulos

## 🔧 Módulos Implementados

### ✅ Módulo de Cuadrillas
- **Entidades**: Cuadrilla, Colaborador, CuadrillaColaborador
- **API Endpoints**: 22 endpoints completos
- **Funcionalidades**: CRUD completo, filtros, relaciones
- **Estado**: ✅ Completado y documentado

## 🧪 Pruebas

- **Pruebas de API**: Disponibles en `tests/api/test_api_endpoints.html`
- **Cobertura**: Endpoints de Cuadrillas y Colaboradores
- **Herramientas**: HTML interactivo para pruebas manuales



## 🤝 Contribución

1. Revisar la [documentación de arquitectura](docs/architecture/)
2. Usar el [template para nuevos módulos](docs/templates/TEMPLATE_NUEVO_MODULO.md)
3. Seguir las [guías de implementación](docs/guides/)
4. Ejecutar pruebas antes de hacer commit
