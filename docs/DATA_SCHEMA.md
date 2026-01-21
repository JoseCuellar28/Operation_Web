# Data Schema - Operation Web

> **Database:** SQL Server (Opera_Main)
> **ORM:** Entity Framework Core (Code-First / Hybrid)

## 1. Core Module: Attendance (Asistencia)

### ER Diagram
```mermaid
erDiagram
    COLABORADORES ||--o{ ASISTENCIA_DIARIA : "registers"
    
    COLABORADORES {
        int id PK
        varchar(40) dni UK
        varchar(100) nombre
        varchar(50) rol
        bit active
    }

    ASISTENCIA_DIARIA {
        varchar(50) id_registro PK "GUID as String"
        int id_colaborador FK
        date fecha_asistencia
        datetime hora_checkin
        decimal(18,6) lat_checkin
        decimal(18,6) long_checkin
        varchar(max) location_address
        varchar(50) estado_final "presente|tardanza|falta"
    }
```

### Table Definitions

#### `ASISTENCIA_DIARIA`
*Master record of daily attendance.*
- **id_registro** (`NVARCHAR(50)`): Primary Key. Stores a GUID formatted as string. **CRITICAL:** Do not treat as `uniqueidentifier` in C# unless parsing explicitly.
- **id_colaborador** (`INT`): Foreign Key to `COLABORADORES.id`. 
- **fecha_asistencia** (`DATE`): The business date of the record.
- **hora_checkin** (`DATETIME`): Exact timestamp of the event.
- **lat/long** (`DECIMAL` or `FLOAT`): Coordinates. Backend treats as `double` or `decimal`.
- **location_address** (`NVARCHAR`): Reverse geocoded address.
- **whatsapp_sync** (`BIT`): Flag for fallback sync.

#### `COLABORADORES` (Employees)
*Read-Only View of Staff.*
- **id** (`INT`): Auto-increment Primary Key. This is the **Link ID**.
- **dni** (`VARCHAR`): Unique National ID. Used for **Login Mapping**.
- **rol** (`VARCHAR`): Job Title (e.g., 'Técnico', 'Supervisor').
- **active** (`BIT`): Soft delete flag (1 = Active).

---

## 2. Security Module: Auth

#### `Users`
- **Id** (`INT`): PK.
- **DNI** (`VARCHAR`): Link to `Personal` or `Colaboradores`.
- **PasswordHash** (`VARCHAR`): BCrypt hash.
- **Email** (`VARCHAR`): Recovery email.

#### `Roles` & `UserRoles`
Standard Many-to-Many relationship for RBAC (Role Based Access Control).
- Roles: `ADMIN`, `SUPERVISOR`, `USER`.

---

## 3. Critical Mapping Notes (Read Carefully)
1.  **DNI vs ID:**
    *   **Login** uses `DNI` (`Users.DNI`).
    *   **Attendance** uses `id_colaborador` (`COLABORADORES.id`).
    *   *Backend Logic:* Must lookup `COLABORADORES` where `dni == User.DNI` to get the `INT ID`.
2.  **Dates:**
    *   SQL Server `DATE` vs `DATETIME`.
    *   ALWAYS use `SqlParameter` for dates to avoid `varchar` conversion errors (YMD vs DMY locale issues).
