# Auditoría de Estructura de Persistencia

**Fecha:** 2026-01-15  
**Responsable:** DB-Master

## 1. Diccionario de Datos

### Tabla: `COLABORADORES`
**Mapeo Entidad:** `OperationWeb.DataAccess.Entities.Empleado`  
**Descripción:** Muestra maestra del personal. Sincronizada con Legacy `Opera_Main`.

| Campo (Columna) | Tipo de Dato (SQL) | Mapeo C# (Propiedad) | Obligatorio (NOT NULL) | Descripción |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `INT` (PK) | `IdEmpleado` | ✅ | Identificador único incremental. |
| `dni` | `VARCHAR(40)` (UK) | `DNI` | ✅ | Documento de identidad. Clave de enlace con Usuarios. |
| `nombre` | `VARCHAR(100)` | `Nombre` | ✅ | Nombre completo o primer nombre del colaborador. |
| `rol` | `VARCHAR(50)` | `Rol` | ❌ | Cargo u ocupación (e.g., Técnico, Supervisor). |
| `active` | `BIT` | `Active` | ❌ | Estado del registro (1 = Activo). |
| `phone` | `VARCHAR(20)` | `Telefono` | ❌ | Número de contacto. |
| `photo_url` | `NVARCHAR(MAX)` | `PhotoUrl` | ❌ | URL absoluta de la foto de perfil. |
| `estado_operativo` | `VARCHAR(MAX)` | `EstadoOperativo` | ❌ | Estado de negocio (e.g., Disponible, Vacaciones). |

> **Nota:** Campos legacy como `ApellidoPaterno`, `ApellidoMaterno` están marcados como `[NotMapped]` en el código actual para evitar errores de ejecución, ya que la tabla física `COLABORADORES` no los posee (usa campo único `nombre`).

### Tabla: `USUARIOS`
**Mapeo Entidad:** `OperationWeb.DataAccess.Entities.User`  
**Tabla Física:** `Users` (Code-First)

| Campo (Columna) | Tipo de Dato (SQL) | Mapeo C# (Propiedad) | Obligatorio (NOT NULL) | Descripción |
| :--- | :--- | :--- | :---: | :--- |
| `Id` | `INT` (PK) | `Id` | ✅ | Identificador único interno. |
| `DNI` | `VARCHAR(40)` | `DNI` | ✅ | Llave foránea lógica hacia `COLABORADORES.dni`. |
| `PasswordHash` | `VARCHAR(200)` | `PasswordHash` | ✅ | Hash de contraseña (No texto plano). |
| `Email` | `VARCHAR(100)` | `Email` | ❌ | Correo de recuperación/notificación. |
| `Role` | `VARCHAR(20)` | `Role` | ✅ | Rol de seguridad (ADMIN, USER) - Por defecto: USER. |
| `MustChangePassword` | `BIT` | `MustChangePassword` | ✅ | Flag de forzado de cambio de clave. |
| `IsActive` | `BIT` | `IsActive` | ✅ | Acceso permitido al sistema. |
| `CreatedAt` | `DATETIME2` | `CreatedAt` | ✅ | Auditoría de creación. |

---

## 2. Configuración (SMTP)

**Ubicación:** Tabla `SystemSettings` (DbSet `SystemSettings`).  
**Estructura:** Almacenamiento Key-Value.

| Clave (Key) | Uso | Nota |
| :--- | :--- | :--- |
| `SMTP_HOST` | Servidor de correo | (Estimado) e.g., `smtp.office365.com` |
| `SMTP_PORT` | Puerto de conexión | (Estimado) e.g., `587` |
| `SMTP_USER` | Usuario autenticación | Correo del sistema |
| `SMTP_PASS` | Contraseña | Encriptada o texto plano (validar en `EncryptionService`) |

> **Observación:** El servicio `EmailService` prioriza leer de esta tabla antes que del `appsettings.json`.

---

## 3. Automatización (Triggers/SPs)

**Estado de Carga Masiva:**  
❌ **NO EXISTEN Triggers ni Stored Procedures** detectados en el repositorio relacionados con la inserción automática desde Excel.

**Hallazgo Crítico:**
La lógica de "Carga Masiva" (Excel) está marcada como **NO IMPLEMENTADA** en el Changelog.
- No hay disparadores en DB (`CREATE TRIGGER`) que reaccionen a nuevos registros en `COLABORADORES`.
- La creación de usuarios (`Users`) al ingresar un nuevo empleado **debe ser orquestada por el Backend (C#)**, no por la base de datos.

**Recomendación de Arquitectura:**
Implementar la lógica en `EmployeesController.ImportAsync`:
1.  Leer Excel en memoria.
2.  Insertar en `COLABORADORES` (EF Core).
3.  Llamar explícitamente a `UserService.CreateUserAsync` para generar el usuario correspondiente.
