# Reporte de Esquema de Base de Datos Actual

Generado automáticamente desde la base de datos `DB_Operation`.

## Tablas y Columnas

### dbo.CuadrillaColaboradores
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| CuadrillaId | int | | NO | |
| ColaboradorId | int | | NO | |
| Rol | nvarchar | 50 | YES | |
| FechaAsignacion | datetime2 | | NO | (getutcdate()) |
| Activo | bit | | NO | ((1)) |
| EmpleadoId | int | | NO | ((0)) |

### dbo.Cuadrillas
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| Nombre | nvarchar | 100 | NO | |
| Descripcion | nvarchar | 500 | YES | |
| Estado | nvarchar | 50 | NO | (N'Activa') |
| Supervisor | nvarchar | 100 | YES | |
| Ubicacion | nvarchar | 200 | YES | |
| FechaCreacion | datetime2 | | NO | (getutcdate()) |
| CapacidadMaxima | int | | NO | ((0)) |

### dbo.Empleado
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| IdEmpleado | int | | NO | |
| CodigoEmpleado | nvarchar | 50 | YES | |
| NumeroDocumento | nvarchar | 20 | YES | |
| Nombre | nvarchar | 100 | NO | |
| ApellidoPaterno | nvarchar | 100 | YES | |
| ApellidoMaterno | nvarchar | 100 | YES | |
| Email | nvarchar | 100 | YES | |
| Telefono | nvarchar | 20 | YES | |
| UsuarioActivo | nvarchar | 1 | YES | |
| UsuarioCreacion | nvarchar | 50 | YES | |
| FechaCreacion | datetime2 | | NO | |
| UsuarioModificacion | nvarchar | 50 | YES | |
| FechaModificacion | datetime2 | | YES | |
| DNI | nvarchar | 40 | NO | (N'') |

### dbo.Historial_Cargas_Personal
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| FechaCarga | datetime | | NO | |
| Archivo | nvarchar | 520 | YES | |
| Usuario | nvarchar | 100 | YES | |

### dbo.MotivosCese
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Codigo | int | | NO | |
| Descripcion | nvarchar | 200 | YES | |

### dbo.Personal
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| DNI | nvarchar | 40 | NO | |
| Inspector | nvarchar | 100 | YES | |
| Telefono | nvarchar | 20 | YES | |
| Distrito | nvarchar | 100 | YES | |
| Tipo | nvarchar | 40 | YES | |
| FechaInicio | date | | YES | |
| FechaCese | date | | YES | |
| UsuarioCreacion | nvarchar | 100 | YES | |
| FechaCreacion | datetime | | YES | (getdate()) |
| FechaModificacion | datetime2 | | YES | |
| UsuarioModificacion | nvarchar | 100 | YES | |

### dbo.Personal_EventoLaboral
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| DNI | nvarchar | 40 | YES | |
| TipoEvento | nvarchar | 40 | YES | |
| Motivo | nvarchar | 100 | YES | |
| FechaEvento | date | | YES | |
| Periodo | nvarchar | 20 | YES | |

### dbo.Personal_Staging
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| DNI | nvarchar | 40 | YES | |
| Archivo | nvarchar | 520 | YES | |
| Hoja | nvarchar | 200 | YES | |
| Periodo | nvarchar | 20 | YES | |
| Inspector | nvarchar | 400 | YES | |
| Situacion | nvarchar | 100 | YES | |
| FechaIngreso | date | | YES | |
| FechaCese | date | | YES | |

### dbo.Roles
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| Name | nvarchar | 50 | NO | |
| Description | nvarchar | 200 | YES | |

### dbo.UserActivations
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| UserId | int | | NO | |
| Token | nvarchar | 64 | NO | |
| Purpose | nvarchar | 20 | NO | |
| IssuedAt | datetime2 | | NO | |
| ExpiresAt | datetime2 | | NO | |
| UsedAt | datetime2 | | YES | |
| IssuedBy | nvarchar | 100 | YES | |
| Status | nvarchar | 20 | NO | |
| DNI | nvarchar | 40 | NO | (N'') |

### dbo.UserRoles
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| UserId | int | | NO | |
| RoleId | int | | NO | |

### dbo.Users
| Column | Type | Max Length | Nullable | Default |
|---|---|---|---|---|
| Id | int | | NO | |
| PasswordHash | nvarchar | 200 | NO | |
| Email | nvarchar | 100 | YES | |
| IsActive | bit | | NO | |
| CreatedAt | datetime2 | | NO | (getutcdate()) |
| DNI | nvarchar | 40 | NO | (N'') |
