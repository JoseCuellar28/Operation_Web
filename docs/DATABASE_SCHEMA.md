# Documentación Técnica de Base de Datos

**Fecha:** 2026-01-16
**Agente:** DB-Master
**Versión:** 1.0 (Post-Integrity Patch)

## 1. DB_Operation (Identidad y Staging)

Base de datos encargada de la seguridad, acceso y aterrizaje de datos externos (Excel).

### Tabla: `Users` (Identidad)
*Representa al usuario del sistema (Web/App). Punto de entrada de autenticación.*

| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `Id` | `INT` | PK, Identity | Identificador interno. |
| `DNI` | `NVARCHAR(40)` | **Unique Index**, Required | **Llave Maestra**. Vincula con `Opera_Main.Personal`. |
| `PasswordHash` | `NVARCHAR(200)` | Required | Hash BCrypt/Argon2. |
| `Email` | `NVARCHAR(100)` | Unique Index | Correo de recuperación. |
| `Role` | `NVARCHAR(20)` | - | Rol de sistema (Admin, User). |
| `MustChangePassword` | `BIT` | - | Flag de seguridad. |
| `IsActive` | `BIT` | - | Acceso permitido. |
| `CreatedAt` | `DATETIME2` | Default `GETDATE()` | Auditoría. |

### Tabla: `PersonalStaging` (Origen Excel)
*Tabla temporal donde aterriza la carga masiva antes de ser procesada.*

| Columna (Estimada) | Tipo | Notas |
| :--- | :--- | :--- |
| `Id` | `INT` | PK |
| `DNI` | `NVARCHAR(40)` | **Crucial**. Debe coincidir con Excel. |
| `Nombre` | `NVARCHAR(MAX)` | - |
| `MotivoDeCese` | `INT?` | FK hacia `MotivoCese`. |
| `...` | - | *Columnas dinámicas según plantilla Excel.* |

---

## 2. Opera_Main (Producción / Core)

Base de datos del negocio. Contiene la verdad operativa.

### Tabla: `COLABORADORES` (Entidad `Empleado`)
*Espejo legacy para compatibilidad. Consumida por Web 2 como fuente de perfil.*

| Columna | Tipo (SQL) | Origen Sync | Estado |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | - | PK. |
| `dni` | `VARCHAR(40)` | `Personal.DNI` | ✅ Sincronizado. |
| `nombre` | `VARCHAR(100)` | `Personal.Inspector` | ✅ Sincronizado. |
| `rol` | `VARCHAR(50)` | `Personal.Tipo` | ✅ Sincronizado. |
| `phone` | `VARCHAR(20)` | `Personal.Telefono` | ✅ Sincronizado. |
| `photo_url` | `NVARCHAR(MAX)` | `Personal.FotoUrl` | ✅ Sincronizado. |
| `estado_operativo` | `VARCHAR` | `Personal.Estado` | ✅ Transf: 'Cesado' -> 'Retirado'. |
| `active` | `BIT` | `Personal.Estado` | ✅ Lógica. |
| `distrito` | `NVARCHAR` | `Personal.Distrito` | ⚠️ **NO SINCRONIZADO** (Ver Hallazgo). |
| `fecha_inicio` | `DATETIME2` | `Personal.FechaInicio` | ⚠️ **NO SINCRONIZADO** (Ver Hallazgo). |

### Tabla: `Personal` (Verdad Operativa)
*Tabla maestra donde reside la data rica del colaborador.*

| Columna | Tipo | Uso |
| :--- | :--- | :--- |
| `DNI` | `NVARCHAR(40)` | PK. Enlace con `Users` y `COLABORADORES`. |
| `Inspector` | `NVARCHAR` | Nombre completo. |
| `Distrito` | `NVARCHAR` | Dato Geográfico. |
| `FechaInicio` | `DATETIME2` | Antigüedad. |
| `Division` | `NVARCHAR` | Estructura Organizacional. |
| `Area` | `NVARCHAR` | Estructura Organizacional. |

---

## 3. Diccionario de Transformación (Sync Logic)

La función `SyncToColaboradoresAsync` es el mecanismo de replicación.

### Mapeo Actual (Code-Analysis):
```sql
MERGE INTO COLABORADORES
SET
    nombre = Source.Inspector,
    rol = Source.Tipo,
    phone = Source.Telefono,
    estado_operativo = (CASE WHEN Estado = 'Cesado' THEN 'Retirado' ELSE Estado END)
```

### 🚩 Hallazgo Crítico (Discrepancia)
Existe una **desalineación** entre la definición de la entidad `Empleado` (que espera tener campos ricos) y el mecanismo de sincronización `SyncToColaboradoresAsync`.
- **Problema:** El comando SQL `MERGE` **NO INCLUYE** las columnas `distrito`, `fecha_inicio`, `division`, `area`.
- **Impacto:** Aunque la tabla `COLABORADORES` física tuviera esas columnas, siempre estarán `NULL` o desactualizadas porque el Sync no las escribe.
- **Riesgo 500:** Si Web 2 espera `FechaInicio` (NotNull) de `COLABORADORES` y recibe `NULL`, fallará.

**Recomendación Correctora:**
Actualizar `PersonalRepository.cs` para incluir estos campos en la sentencia `MERGE`.
