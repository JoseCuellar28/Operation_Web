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
