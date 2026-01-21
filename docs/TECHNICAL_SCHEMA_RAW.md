# Esquema Técnico Crudo (Code-First Authority)

**Fuente de Verdad:** `OperationWebDbContext` & `OnModelCreating` Fluent API.
**Fecha:** 2026-01-16
**Estado:** VIVO (Refleja código en ejecución).

## 1. DICCIONARIO DE COLUMNAS (DB_Operation & Opera_Main)

El sistema utiliza un DbContext único que mapea a ambas bases de datos lógicas.

### A. Tabla: `Users` (DB_Operation)
**Definición:** `modelBuilder.Entity<User>`

| Columna | Tipo .NET | Tipo SQL (Inferido) | Nulable | Restricciones / Índices |
| :--- | :--- | :--- | :---: | :--- |
| `Id` | `int` | `INT` | ❌ | **PK IDENTITY** |
| `DNI` | `string` | `NVARCHAR(40)` | ❌ | **UNIQUE INDEX**. Required. |
| `PasswordHash` | `string` | `NVARCHAR(200)` | ❌ | Required. |
| `Email` | `string` | `NVARCHAR(100)` | ✅ | **UNIQUE INDEX** (Where Not Null). |
| `CreatedAt` | `DateTime` | `DATETIME2` | ❌ | Default: `GETUTCDATE()` |
| `Role` | `string` | `NVARCHAR(MAX)` | ✅ | (Por convención EF) |
| `MustChangePassword` | `bool` | `BIT` | ❌ | |
| `IsActive` | `bool` | `BIT` | ❌ | |

### B. Tabla: `COLABORADORES` (Opera_Main)
**Definición:** `modelBuilder.Entity<Empleado>().ToTable("COLABORADORES")`

| Columna Real (SQL) | Propiedad .NET | Tipo SQL | Nulable | Fuente de Datos (Sync) |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `IdEmpleado` | `INT` | ❌ | PK |
| `dni` | `DNI` | `NVARCHAR(40)` | ❌ | **UNIQUE INDEX**. Required. `Personal.DNI` |
| `nombre` | `Nombre` | `NVARCHAR(100)` | ❌ | Required. `Personal.Inspector` |
| `rol` | `Rol` | `NVARCHAR(50)` | ✅ | `Personal.Tipo` |
| `active` | `Active` | `BIT` | ✅ | Lógica (Cesado=0) |
| `phone` | `Telefono` | `NVARCHAR(20)` | ✅ | `Personal.Telefono` |
| `photo_url` | `PhotoUrl` | `NVARCHAR(MAX)` | ✅ | `Personal.FotoUrl` |
| `estado_operativo` | `EstadoOperativo` | `NVARCHAR(MAX)` | ✅ | `Personal.Estado` |
| `codigo_empleado` | `CodigoEmpleado` | `NVARCHAR(50)` | ✅ | **UNIQUE** (Where Not Null) |
| `usuario_creacion` | `UsuarioCreacion` | `NVARCHAR(50)` | ✅ | |
| `usuario_modificacion` | `UsuarioModificacion` | `NVARCHAR(50)` | ✅ | |

### C. Tabla: `Personal` (Opera_Main - Master)
**Definición:** `modelBuilder.Entity<Personal>()`

| Columna | Tipo SQL | Nulable | Notas |
| :--- | :--- | :---: | :--- |
| `DNI` | `NVARCHAR(40)` | ❌ | **PK**. Eje del Universo de Datos. |
| `Inspector` | `NVARCHAR(MAX)` | ✅ | Nombre Completo. |
| `Distrito` | `NVARCHAR(MAX)` | ✅ | Propiedad clave para Web 2. |
| `FechaInicio` | `DATETIME2` | ❌ | Antigüedad (Requerido en Seeding). |
| `Division` | `NVARCHAR(MAX)` | ✅ | |
| `Area` | `NVARCHAR(MAX)` | ✅ | |
| `Tipo` | `NVARCHAR(MAX)` | ✅ | Rol/Cargo |

---

## 2. MAPEO DE RELACIONES (Hard Links)

Las relaciones en este sistema son mayormente **Lógicas** (implícitas por valor) más que restricciones FK físicas duras en BD, para permitir desacople entre módulos.

### Relación 1: Identidad <-> Operación (El Puente)
*   **Origen:** `Users.DNI` (DB_Operation)
*   **Destino:** `COLABORADORES.dni` / `Personal.DNI` (Opera_Main)
*   **Tipo:** Lógica 1:1.
*   **Integridad:** Garantizada por aplicación (Repo). No existe `FOREIGN KEY` en SQL.

### Relación 2: Asignación de Cuadrillas
*   **Origen:** `CuadrillaColaborador.PersonalDNI`
*   **Destino:** `Personal.DNI`
*   **Tipo:** FK Física (Cascade Delete).
*   **Definición:** `modelBuilder.Entity<CuadrillaColaborador>().HasOne(e => e.Personal)...`

---

## 3. LÓGICA DE BASE DE DATOS (Procedural)

### Stored Procedures / Triggers
A fecha del reporte, **NO EXISTEN** procedimientos almacenados ni triggers activos en el código fuente (`OperationWeb.DataAccess`).

### Sincronización (The "Virtual" Trigger)
La lógica de replicación es Codigo C# (`PersonalRepository.cs`):
```sql
-- SENTENCIA MERGE RAW (Ejecutada por EF Core .ExecuteSqlRawAsync)
MERGE INTO Opera_Main.dbo.COLABORADORES ...
```
**Estado:** Activo.
**Dependencia:** Requiere ejecución manual del método `SyncToColaboradoresAsync`.
