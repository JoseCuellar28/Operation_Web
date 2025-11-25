# Diagrama de Alineación de Base de Datos

Este diagrama representa la estructura actual de la base de datos `DB_Operation` y su alineación con el código C#.

```mermaid
erDiagram
    Users {
        int Id PK
        nvarchar DNI "Coincide con C#"
        nvarchar PasswordHash
        nvarchar Email
        bit IsActive
        datetime2 CreatedAt
    }

    Roles {
        int Id PK
        nvarchar Name
        nvarchar Description
    }

    UserRoles {
        int Id PK
        int UserId FK
        int RoleId FK
    }

    Empleado {
        int IdEmpleado PK
        nvarchar DNI
        nvarchar Nombre
        nvarchar ApellidoPaterno
        nvarchar ApellidoMaterno
        nvarchar Email
        nvarchar Telefono
        nvarchar CodigoEmpleado
    }

    Personal {
        nvarchar DNI PK
        nvarchar Inspector
        nvarchar Telefono
        nvarchar Distrito
        nvarchar Tipo
        date FechaInicio
        date FechaCese
    }

    Cuadrillas {
        int Id PK
        nvarchar Nombre
        nvarchar Estado
        nvarchar Supervisor
        nvarchar Ubicacion
        int CapacidadMaxima
    }

    CuadrillaColaboradores {
        int Id PK
        int CuadrillaId FK
        int ColaboradorId FK
        int EmpleadoId
        nvarchar Rol
        bit Activo
    }

    Personal_Staging {
        int Id PK
        nvarchar DNI
        nvarchar Situacion
    }

    %% Relaciones
    Users ||--o{ UserRoles : "Tiene"
    Roles ||--o{ UserRoles : "Asignado a"
    Cuadrillas ||--o{ CuadrillaColaboradores : "Tiene"
    
    %% Notas de Alineación
    %% Colaborador (C#) vs Personal/Empleado (DB)
    %% La tabla 'Colaboradores' NO EXISTE en la BD.
    %% CuadrillaColaboradores usa 'ColaboradorId' y 'EmpleadoId'.
```

## Notas de Alineación Detectadas

1.  **Users / Roles / UserRoles**:
    *   ✅ **Alineado**. El código C# ha sido actualizado para usar `DNI`.

2.  **Cuadrillas**:
    *   ✅ **Alineado**. Coincide con la entidad `Cuadrilla`.

3.  **Colaboradores (C#) vs DB**:
    *   ⚠️ **Desalineado**.
    *   En C# existe la entidad `Colaborador` que espera una tabla `Colaboradores`.
    *   **En la BD NO existe la tabla `Colaboradores`.**
    *   En la BD existen `Empleado` y `Personal`.
    *   La tabla `CuadrillaColaboradores` tiene columnas `ColaboradorId` y `EmpleadoId`. Esto sugiere una ambigüedad en la relación.

4.  **Empleado (C#)**:
    *   ✅ **Alineado**. Mapeado explícitamente a la tabla `Empleado`.
