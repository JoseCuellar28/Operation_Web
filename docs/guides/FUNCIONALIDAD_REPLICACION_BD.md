# Funcionalidad de Replicación de Bases de Datos

## 📋 Resumen
Se ha implementado un **Explorador de Bases de Datos** completo con capacidades de replicación para futuras necesidades del proyecto Operation_Web.

## 🔧 Componentes Implementados

### 1. **Frontend - Explorador de BD**
- **Ubicación**: `frontend/database_explorer/`
- **Archivos**:
  - `index.html` - Interfaz de usuario
  - `database_explorer.js` - Lógica de frontend

### 2. **Backend - API Controller**
- **Ubicación**: `OperationWeb.API/Controllers/DatabaseExplorerController.cs`
- **Funcionalidades**:
  - Conexión a múltiples bases de datos SQL Server
  - Listado de tablas y columnas
  - Soporte para autenticación Windows y SQL Server
  - Configuración SSL flexible

## 🌐 URLs de Acceso

### Explorador de BD
```
http://localhost:8080/frontend/database_explorer/index.html
```

### API Endpoints
```
http://localhost:5132/api/DatabaseExplorer/test-connection
http://localhost:5132/api/DatabaseExplorer/tables
http://localhost:5132/api/DatabaseExplorer/table-structure/{tableName}
```

## 🔄 Capacidades de Replicación

### Configuración Actual
- **Base de Datos 1 (Fuente)**: 
  - Servidor: `52.72.41.149:1434`
  - BD: `SafeSmart_Main`
  - Usuario: `jarbildo`
  - Autenticación: SQL Server

- **Base de Datos 2 (Destino)**:
  - Servidor: `OCA-LENOVO\SQLEXPRESS`
  - Usuario: `sa`
  - Autenticación: SQL Server

### Funcionalidades Disponibles
1. **Conexión a múltiples BD**: Soporte para conectar simultáneamente a 2 bases de datos
2. **Exploración de esquemas**: Listado completo de tablas y estructuras
3. **Selección de tablas**: Interface para seleccionar tablas específicas para replicar
4. **Generación de código**: Creación automática de:
   - Entidades C# para las tablas seleccionadas
   - DbContext configurado para ambas BD
   - Servicio de replicación completo
   - Configuración de appsettings.json
5. **Descarga de código**: Exportación en formato ZIP con estructura organizada

## 📦 Estructura del Código Generado

```
replication-code-YYYY-MM-DD.zip
├── Entities/
│   ├── Tabla1.cs
│   ├── Tabla2.cs
│   └── ...
├── Data/
│   └── ReplicationDbContext.cs
├── Services/
│   └── ReplicationService.cs
├── appsettings.json
└── README.md
```

## 🚀 Uso Futuro

### Para Implementar Replicación:
1. Acceder al explorador de BD
2. Configurar conexiones a ambas bases de datos
3. Seleccionar tablas a replicar
4. Generar y descargar código
5. Integrar código generado al proyecto
6. Configurar cadenas de conexión
7. Ejecutar proceso de replicación

### Casos de Uso:
- **Migración de datos** entre servidores
- **Sincronización** de bases de datos
- **Backup selectivo** de tablas específicas
- **Replicación en tiempo real** (con modificaciones)

## 🔧 Configuración Técnica

### Dependencias Frontend:
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- JSZip 3.10.1

### Dependencias Backend:
- Microsoft.Data.SqlClient
- Entity Framework Core
- ASP.NET Core

## 📝 Estado Actual
- ✅ **Explorador funcional** y probado
- ✅ **Conexiones configuradas** para ambas BD
- ✅ **Generación de código** implementada
- ✅ **Descarga ZIP** funcionando
- ✅ **Documentación** completa

## 🔮 Próximos Pasos (Cuando se Necesite)
1. Conectar a BD fuente y seleccionar tablas
2. Generar código de replicación
3. Integrar al proyecto principal
4. Configurar proceso automatizado
5. Implementar monitoreo y logs

---
**Fecha de Implementación**: Enero 2025  
**Estado**: Listo para uso futuro  
**Mantenedor**: Equipo Operation_Web