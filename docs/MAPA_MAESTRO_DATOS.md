# 🗺️ MAPA MAESTRO DE DATOS

Fecha de Auditoría: 2026-01-27
Servidor: Toshiba (100.125.169.14)

# Base de Datos: `DB_Operation`

## Índice de Tablas
- [dbo.__EFMigrationsHistory](#dbo__efmigrationshistory)
- [dbo.CuadrillaColaboradores](#dbocuadrillacolaboradores)
- [dbo.Cuadrillas](#dbocuadrillas)
- [dbo.Empleado](#dboempleado)
- [dbo.Historial_Cargas_Personal](#dbohistorial_cargas_personal)
- [dbo.HSE_Incidents](#dbohse_incidents)
- [dbo.HSE_InspectionItems](#dbohse_inspectionitems)
- [dbo.HSE_Inspections](#dbohse_inspections)
- [dbo.HSE_PPE_Delivery](#dbohse_ppe_delivery)
- [dbo.MotivosCese](#dbomotivoscese)
- [dbo.PasswordResetTokens](#dbopasswordresettokens)
- [dbo.Permissions](#dbopermissions)
- [dbo.Personal](#dbopersonal)
- [dbo.Personal_EventoLaboral](#dbopersonal_eventolaboral)
- [dbo.Personal_Staging](#dbopersonal_staging)
- [dbo.PersonalProyectos](#dbopersonalproyectos)
- [dbo.Proyectos](#dboproyectos)
- [dbo.RolePermissions](#dborolepermissions)
- [dbo.Roles](#dboroles)
- [dbo.sysdiagrams](#dbosysdiagrams)
- [dbo.SystemSettings](#dbosystemsettings)
- [dbo.UserAccessConfigs](#dbouseraccessconfigs)
- [dbo.UserActivations](#dbouseractivations)
- [dbo.UserRoles](#dbouserroles)
- [dbo.Users](#dbousers)

## Detalle de Tablas

### dbo.__EFMigrationsHistory
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `MigrationId` | `nvarchar` | 150 | NO | 🔑 PK |
| `ProductVersion` | `nvarchar` | 32 | NO |  |

---

### dbo.CuadrillaColaboradores
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO |  |
| `CuadrillaId` | `int` |  | NO |  |
| `ColaboradorId` | `int` |  | NO |  |
| `FechaAsignacion` | `datetime2` |  | NO |  |
| `FechaDesasignacion` | `datetime2` |  | YES |  |
| `Rol` | `nvarchar` | 50 | YES |  |
| `Activo` | `bit` |  | NO |  |
| `PersonalDNI` | `nvarchar` | 40 | NO | 🔗 FK |

---

### dbo.Cuadrillas
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO |  |
| `Nombre` | `nvarchar` | 100 | NO |  |
| `Descripcion` | `nvarchar` | 500 | YES |  |
| `Estado` | `nvarchar` | 50 | NO |  |
| `CapacidadMaxima` | `int` |  | NO |  |
| `Supervisor` | `nvarchar` | 100 | YES |  |
| `Ubicacion` | `nvarchar` | 200 | YES |  |
| `FechaCreacion` | `datetime2` |  | NO |  |
| `FechaModificacion` | `datetime2` |  | YES |  |

---

### dbo.Empleado
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `IdEmpleado` | `int` |  | NO |  |
| `IdEmpresa` | `int` |  | NO |  |
| `CodigoEmpleado` | `nvarchar` | 50 | YES |  |
| `TipoDocumento` | `int` |  | YES |  |
| `DNI` | `nvarchar` | 40 | YES | 🔗 FK |
| `Nombre` | `nvarchar` | 100 | NO |  |
| `ApellidoPaterno` | `nvarchar` | 100 | YES |  |
| `ApellidoMaterno` | `nvarchar` | 100 | YES |  |
| `FechaNacimiento` | `datetime2` |  | YES |  |
| `Email` | `nvarchar` | 100 | YES |  |
| `Telefono` | `nvarchar` | 20 | YES |  |
| `IdJefeInmediato` | `int` |  | YES |  |
| `IdEmpleadoPerfil` | `int` |  | YES |  |
| `IdUnidad` | `int` |  | YES |  |
| `IdArea` | `int` |  | YES |  |
| `Administrador` | `bit` |  | YES |  |
| `UsuarioActivo` | `nvarchar` | 1 | YES |  |
| `FechaCreacion` | `datetime2` |  | YES |  |
| `FechaModificacion` | `datetime2` |  | YES |  |
| `UsuarioCreacion` | `nvarchar` | 50 | YES |  |
| `UsuarioModificacion` | `nvarchar` | 50 | YES |  |

---

### dbo.Historial_Cargas_Personal
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO |  |
| `Archivo` | `nvarchar` | 260 | NO |  |
| `Hoja` | `nvarchar` | 100 | NO |  |
| `Periodo` | `nvarchar` | 10 | YES |  |
| `FilasProcesadas` | `int` |  | NO |  |
| `InsertadosSnapshot` | `int` |  | NO |  |
| `ActualizadosSnapshot` | `int` |  | NO |  |
| `Duplicados` | `int` |  | NO |  |
| `EventosGenerados` | `int` |  | NO |  |
| `FechaCarga` | `datetime` |  | NO |  |
| `Usuario` | `nvarchar` | 50 | YES |  |

---

### dbo.HSE_Incidents
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `ReporterDNI` | `nvarchar` | 20 | NO |  |
| `Date` | `datetime2` |  | NO |  |
| `Description` | `nvarchar` | -1 | NO |  |
| `Location` | `nvarchar` | 100 | YES |  |
| `Severity` | `nvarchar` | 20 | NO |  |
| `Status` | `nvarchar` | 20 | YES |  |
| `ActionTaken` | `nvarchar` | -1 | YES |  |
| `CreatedAt` | `datetime2` |  | NO |  |

---

### dbo.HSE_InspectionItems
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `InspectionId` | `int` |  | NO | 🔗 FK |
| `Question` | `nvarchar` | 255 | NO |  |
| `IsCompliant` | `bit` |  | NO |  |
| `Observation` | `nvarchar` | -1 | YES |  |
| `Severity` | `nvarchar` | 20 | YES |  |

---

### dbo.HSE_Inspections
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `InspectorDNI` | `nvarchar` | 20 | NO |  |
| `Date` | `datetime2` |  | NO |  |
| `Type` | `nvarchar` | 50 | NO |  |
| `ReferenceId` | `nvarchar` | 100 | YES |  |
| `Status` | `nvarchar` | 20 | NO |  |
| `Score` | `decimal` |  | YES |  |
| `Comments` | `nvarchar` | -1 | YES |  |
| `CreatedAt` | `datetime2` |  | NO |  |

---

### dbo.HSE_PPE_Delivery
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `WorkerDNI` | `nvarchar` | 20 | NO |  |
| `DelivererDNI` | `nvarchar` | 20 | NO |  |
| `Date` | `datetime2` |  | NO |  |
| `ItemsJson` | `nvarchar` | -1 | NO |  |
| `SignatureMetadata` | `nvarchar` | -1 | YES |  |
| `Comments` | `nvarchar` | -1 | YES |  |
| `CreatedAt` | `datetime2` |  | NO |  |

---

### dbo.MotivosCese
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Codigo` | `nvarchar` | 50 | NO |  |
| `Descripcion` | `nvarchar` | 200 | NO |  |

---

### dbo.PasswordResetTokens
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `DNI` | `nvarchar` | 40 | NO |  |
| `Token` | `nvarchar` | 100 | NO |  |
| `CreatedAt` | `datetime2` |  | NO |  |
| `ExpiresAt` | `datetime2` |  | NO |  |
| `IsUsed` | `bit` |  | NO |  |
| `UsedAt` | `datetime2` |  | YES |  |

---

### dbo.Permissions
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `Module` | `nvarchar` | 50 | NO |  |
| `Action` | `nvarchar` | 50 | NO |  |
| `Description` | `nvarchar` | 200 | YES |  |

---

### dbo.Personal
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `DNI` | `nvarchar` | 40 | NO | 🔑 PK |
| `Inspector` | `nvarchar` | 200 | YES |  |
| `Telefono` | `nvarchar` | 50 | YES |  |
| `Distrito` | `nvarchar` | 150 | YES |  |
| `Tipo` | `nvarchar` | 100 | YES |  |
| `Estado` | `nvarchar` | 50 | YES |  |
| `FechaInicio` | `date` |  | YES |  |
| `FechaCese` | `date` |  | YES |  |
| `FechaCreacion` | `datetime` |  | YES |  |
| `UsuarioCreacion` | `nvarchar` | 50 | YES |  |
| `FechaModificacion` | `datetime` |  | YES |  |
| `UsuarioModificacion` | `nvarchar` | 50 | YES |  |
| `CodigoEmpleado` | `nvarchar` | 20 | YES |  |
| `Categoria` | `nvarchar` | 100 | YES |  |
| `Division` | `nvarchar` | 100 | YES |  |
| `LineaNegocio` | `nvarchar` | 100 | YES |  |
| `Area` | `nvarchar` | 100 | YES |  |
| `Seccion` | `nvarchar` | 100 | YES |  |
| `DetalleCebe` | `nvarchar` | 200 | YES |  |
| `CodigoCebe` | `nvarchar` | 50 | YES |  |
| `MotivoCeseDesc` | `nvarchar` | 200 | YES |  |
| `Comentario` | `nvarchar` | 500 | YES |  |
| `FechaNacimiento` | `date` |  | YES |  |
| `Sexo` | `nvarchar` | 20 | YES |  |
| `Edad` | `int` |  | YES |  |
| `Permanencia` | `decimal` |  | YES |  |
| `Email` | `nvarchar` | 100 | YES |  |
| `EmailPersonal` | `nvarchar` | 100 | YES |  |
| `JefeInmediato` | `nvarchar` | 200 | YES |  |
| `FotoUrl` | `nvarchar` | -1 | YES |  |
| `FirmaUrl` | `nvarchar` | -1 | YES |  |

---

### dbo.Personal_EventoLaboral
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO |  |
| `DNI` | `nvarchar` | 40 | YES | 🔗 FK |
| `TipoEvento` | `nvarchar` | 20 | NO |  |
| `Motivo` | `nvarchar` | 50 | YES |  |
| `FechaEvento` | `date` |  | NO |  |
| `Periodo` | `nvarchar` | 10 | YES |  |
| `FechaCreacion` | `datetime` |  | NO |  |
| `UsuarioCreacion` | `nvarchar` | 50 | YES |  |

---

### dbo.Personal_Staging
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO |  |
| `Archivo` | `nvarchar` | 260 | YES |  |
| `Hoja` | `nvarchar` | 100 | YES |  |
| `Periodo` | `nvarchar` | 10 | YES |  |
| `DNI` | `nvarchar` | 40 | YES |  |
| `Inspector` | `nvarchar` | 200 | YES |  |
| `Situacion` | `nvarchar` | 50 | YES |  |
| `FechaIngreso` | `date` |  | YES |  |
| `FechaCese` | `date` |  | YES |  |
| `MotivoDeCese` | `nvarchar` | 100 | YES |  |
| `MotivoNorm` | `nvarchar` | 50 | YES |  |
| `SedeTrabajo` | `nvarchar` | 100 | YES |  |
| `TipoTrabajador` | `nvarchar` | 100 | YES |  |
| `FechaCarga` | `datetime` |  | NO |  |
| `UsuarioCarga` | `nvarchar` | 50 | YES |  |
| `CodigoEmpleado` | `nvarchar` | 20 | YES |  |
| `Categoria` | `nvarchar` | 100 | YES |  |
| `Division` | `nvarchar` | 100 | YES |  |
| `LineaNegocio` | `nvarchar` | 100 | YES |  |
| `Area` | `nvarchar` | 100 | YES |  |
| `Seccion` | `nvarchar` | 100 | YES |  |
| `DetalleCebe` | `nvarchar` | 200 | YES |  |
| `CodigoCebe` | `nvarchar` | 50 | YES |  |
| `MotivoCeseDesc` | `nvarchar` | 200 | YES |  |
| `Comentario` | `nvarchar` | 500 | YES |  |
| `FechaNacimiento` | `datetime2` |  | YES |  |
| `Sexo` | `nvarchar` | 20 | YES |  |
| `Edad` | `int` |  | YES |  |
| `Permanencia` | `decimal` |  | YES |  |
| `Email` | `nvarchar` | 100 | YES |  |
| `EmailPersonal` | `nvarchar` | 100 | YES |  |
| `JefeInmediato` | `nvarchar` | 200 | YES |  |
| `Telefono` | `nvarchar` | 50 | YES |  |

---

### dbo.PersonalProyectos
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `DNI` | `nvarchar` | 40 | NO | 🔗 FK |
| `ProyectoId` | `int` |  | NO | 🔗 FK |
| `FechaAsignacion` | `datetime2` |  | NO |  |
| `FechaDesasignacion` | `datetime2` |  | YES |  |
| `EsActivo` | `bit` |  | NO |  |
| `RolEnProyecto` | `nvarchar` | 50 | YES |  |
| `PorcentajeDedicacion` | `decimal` |  | YES |  |
| `CreadoPor` | `nvarchar` | 100 | YES |  |
| `FechaCreacion` | `datetime2` |  | YES |  |
| `ModificadoPor` | `nvarchar` | 100 | YES |  |
| `FechaModificacion` | `datetime2` |  | YES |  |

---

### dbo.Proyectos
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `Nombre` | `nvarchar` | 100 | NO |  |
| `Cliente` | `nvarchar` | 200 | YES |  |
| `Estado` | `nvarchar` | 50 | NO |  |
| `FechaInicio` | `datetime2` |  | YES |  |
| `FechaFin` | `datetime2` |  | YES |  |
| `Presupuesto` | `decimal` |  | YES |  |
| `FechaSincronizacion` | `datetime2` |  | YES |  |
| `Division` | `nvarchar` | 100 | YES |  |
| `GerenteDni` | `nvarchar` | 80 | YES |  |
| `JefeDni` | `nvarchar` | 80 | YES |  |

---

### dbo.RolePermissions
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `RoleId` | `int` |  | NO | 🔗 FK |
| `PermissionId` | `int` |  | NO | 🔗 FK |

---

### dbo.Roles
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `Name` | `nvarchar` | 50 | NO |  |
| `Description` | `nvarchar` | 200 | YES |  |

---

### dbo.sysdiagrams
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `name` | `nvarchar` | 128 | NO |  |
| `principal_id` | `int` |  | NO |  |
| `diagram_id` | `int` |  | NO | 🔑 PK |
| `version` | `int` |  | YES |  |
| `definition` | `varbinary` | -1 | YES |  |

---

### dbo.SystemSettings
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Key` | `nvarchar` | 100 | NO | 🔑 PK |
| `Value` | `nvarchar` | -1 | NO |  |
| `Description` | `nvarchar` | -1 | YES |  |
| `UpdatedAt` | `datetime2` |  | NO |  |

---

### dbo.UserAccessConfigs
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `UserId` | `int` |  | NO |  |
| `AccessWeb` | `bit` |  | NO |  |
| `AccessApp` | `bit` |  | NO |  |
| `LastUpdated` | `datetime` |  | YES |  |
| `JobLevel` | `nvarchar` | 50 | YES |  |
| `ProjectScope` | `nvarchar` | 100 | YES |  |

---

### dbo.UserActivations
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO | 🔑 PK |
| `UserId` | `int` |  | NO |  |
| `DNI` | `nvarchar` | 40 | NO |  |
| `Token` | `nvarchar` | 64 | NO |  |
| `Purpose` | `nvarchar` | 20 | NO |  |
| `IssuedAt` | `datetime2` |  | NO |  |
| `ExpiresAt` | `datetime2` |  | NO |  |
| `UsedAt` | `datetime2` |  | YES |  |
| `IssuedBy` | `nvarchar` | 100 | YES |  |
| `Status` | `nvarchar` | 20 | NO |  |

---

### dbo.UserRoles
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO |  |
| `UserId` | `int` |  | NO |  |
| `RoleId` | `int` |  | NO |  |

---

### dbo.Users
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `Id` | `int` |  | NO |  |
| `DNI` | `nvarchar` | 40 | NO | 🔗 FK |
| `PasswordHash` | `nvarchar` | 200 | NO |  |
| `Email` | `nvarchar` | 100 | YES |  |
| `IsActive` | `bit` |  | NO |  |
| `CreatedAt` | `datetime2` |  | NO |  |
| `Role` | `nvarchar` | 20 | NO |  |
| `MustChangePassword` | `bit` |  | NO |  |

---

# Base de Datos: `Opera_Main`

## Índice de Tablas
- [dbo.ASISTENCIA_DIARIA](#dboasistencia_diaria)
- [dbo.AUDITORIA_LOG](#dboauditoria_log)
- [dbo.AUDITORIA_SEGURIDAD](#dboauditoria_seguridad)
- [dbo.CATALOGO_KITS](#dbocatalogo_kits)
- [dbo.CATALOGO_MATERIALES](#dbocatalogo_materiales)
- [dbo.COLABORADORES](#dbocolaboradores)
- [dbo.COLABORADORES_BACKUP_20251223](#dbocolaboradores_backup_20251223)
- [dbo.CONSUMO_MATERIALES](#dboconsumo_materiales)
- [dbo.CUADRILLA_DIARIA](#dbocuadrilla_diaria)
- [dbo.EVIDENCIAS](#dboevidencias)
- [dbo.FORMATOS_PAPELERIA](#dboformatos_papeleria)
- [dbo.INCIDENTES](#dboincidentes)
- [dbo.LOTE_IMPORTACION](#dbolote_importacion)
- [dbo.LOTE_VALORIZACION](#dbolote_valorizacion)
- [dbo.MOVIMIENTOS_ALMACEN](#dbomovimientos_almacen)
- [dbo.ORDENES_TRABAJO](#dboordenes_trabajo)
- [dbo.PERFILES_TRABAJO](#dboperfiles_trabajo)
- [dbo.REGISTRO_VEHICULAR](#dboregistro_vehicular)
- [dbo.STOCK_ALMACEN](#dbostock_almacen)
- [dbo.STOCK_CUSTODIA](#dbostock_custodia)
- [dbo.sysdiagrams](#dbosysdiagrams)
- [dbo.v_Global_Personal](#dbov_global_personal)
- [dbo.VEHICLE_TRACKING_LOGS](#dbovehicle_tracking_logs)
- [dbo.VEHICULOS](#dbovehiculos)
- [dbo.ZONAS](#dbozonas)

## Detalle de Tablas

### dbo.ASISTENCIA_DIARIA
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_registro` | `varchar` | 50 | NO | 🔑 PK |
| `id_colaborador` | `int` |  | NO | 🔗 FK |
| `dni_colaborador` | `nvarchar` | 80 | YES |  |
| `fecha_asistencia` | `date` |  | NO |  |
| `hora_checkin` | `datetime` |  | YES |  |
| `lat_checkin` | `decimal` |  | YES |  |
| `long_checkin` | `decimal` |  | YES |  |
| `estado_final` | `varchar` | 20 | NO |  |
| `justificacion_geo` | `nvarchar` | -1 | YES |  |
| `check_salud_apto` | `bit` |  | YES |  |
| `hora_checkout` | `datetime` |  | YES |  |
| `flag_horas_extras` | `bit` |  | YES |  |
| `created_at` | `datetime` |  | YES |  |
| `location_address` | `nvarchar` | 255 | YES |  |
| `alert_status` | `varchar` | 20 | YES |  |
| `resolved_at` | `datetime` |  | YES |  |
| `whatsapp_sync` | `bit` |  | YES |  |
| `sync_date` | `datetime` |  | YES |  |
| `Proyecto` | `nvarchar` | 200 | YES |  |

---

### dbo.AUDITORIA_LOG
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_log` | `uniqueidentifier` |  | NO | 🔑 PK |
| `id_ot` | `uniqueidentifier` |  | NO | 🔗 FK |
| `campo_afectado` | `nvarchar` | 100 | NO |  |
| `valor_original` | `nvarchar` | -1 | YES |  |
| `valor_final` | `nvarchar` | -1 | YES |  |
| `usuario_ajuste` | `int` |  | YES |  |
| `comentario_auditoria` | `nvarchar` | -1 | YES |  |
| `fecha_cambio` | `datetime` |  | YES |  |

---

### dbo.AUDITORIA_SEGURIDAD
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_auditoria` | `int` |  | NO | 🔑 PK |
| `id_colaborador` | `int` |  | NO | 🔗 FK |
| `id_supervisor` | `int` |  | NO | 🔗 FK |
| `score` | `int` |  | NO |  |
| `resultado` | `nvarchar` | 20 | NO |  |
| `motivo_bloqueo` | `nvarchar` | -1 | YES |  |
| `checklist_json` | `nvarchar` | -1 | YES |  |
| `id_ot_vinculada` | `nvarchar` | 50 | YES |  |
| `fecha_auditoria` | `datetime` |  | YES |  |

---

### dbo.CATALOGO_KITS
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_kit` | `int` |  | NO | 🔑 PK |
| `nombre_kit` | `nvarchar` | 100 | NO |  |
| `tipo_servicio` | `nvarchar` | 50 | NO |  |
| `composicion_kit` | `nvarchar` | -1 | NO |  |

---

### dbo.CATALOGO_MATERIALES
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_material` | `uniqueidentifier` |  | NO | 🔑 PK |
| `nombre` | `nvarchar` | 255 | NO |  |
| `tipo` | `nvarchar` | 20 | NO |  |
| `unidad_medida` | `nvarchar` | 50 | NO |  |
| `costo_unitario` | `decimal` |  | NO |  |
| `id_gesproyec` | `nvarchar` | 50 | YES |  |
| `categoria` | `nvarchar` | 50 | YES |  |

---

### dbo.COLABORADORES
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id` | `int` |  | NO | 🔑 PK |
| `dni` | `nvarchar` | 80 | NO |  |
| `nombre` | `nvarchar` | 150 | NO |  |
| `rol` | `nvarchar` | 50 | NO |  |
| `id_pin_biometrico` | `varchar` | 6 | YES |  |
| `estado_operativo` | `varchar` | 50 | YES |  |
| `active` | `bit` |  | YES |  |
| `created_at` | `datetime` |  | YES |  |
| `updated_at` | `datetime` |  | YES |  |
| `photo_url` | `nvarchar` | -1 | YES |  |
| `phone` | `varchar` | 20 | YES |  |
| `SignatureUrl` | `nvarchar` | 500 | YES |  |
| `Proyecto` | `nvarchar` | 200 | YES |  |

---

### dbo.COLABORADORES_BACKUP_20251223
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id` | `int` |  | NO |  |
| `dni` | `varchar` | 20 | NO |  |
| `nombre` | `nvarchar` | 150 | NO |  |
| `rol` | `nvarchar` | 50 | NO |  |
| `id_pin_biometrico` | `varchar` | 6 | YES |  |
| `estado_operativo` | `varchar` | 20 | YES |  |
| `active` | `bit` |  | YES |  |
| `created_at` | `datetime` |  | YES |  |
| `updated_at` | `datetime` |  | YES |  |
| `photo_url` | `nvarchar` | -1 | YES |  |
| `phone` | `varchar` | 20 | YES |  |

---

### dbo.CONSUMO_MATERIALES
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_consumo` | `uniqueidentifier` |  | NO | 🔑 PK |
| `id_ot` | `uniqueidentifier` |  | NO | 🔗 FK |
| `cod_material` | `nvarchar` | 50 | NO |  |
| `cantidad` | `int` |  | NO |  |
| `tipo_kardex` | `nvarchar` | 20 | NO |  |
| `serie_retirada` | `nvarchar` | 100 | YES |  |
| `es_excedente` | `bit` |  | YES |  |
| `url_foto_justificacion` | `nvarchar` | -1 | YES |  |
| `fecha_registro` | `datetime` |  | YES |  |

---

### dbo.CUADRILLA_DIARIA
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_cuadrilla` | `nvarchar` | 50 | NO | 🔑 PK |
| `codigo` | `nvarchar` | 20 | NO |  |
| `fecha_operacion` | `date` |  | NO |  |
| `estado_planificacion` | `nvarchar` | 20 | NO |  |
| `id_lider` | `int` |  | NO | 🔗 FK |
| `id_auxiliar` | `int` |  | YES | 🔗 FK |
| `placa_vehiculo` | `nvarchar` | 20 | NO | 🔗 FK |
| `id_zona` | `int` |  | NO | 🔗 FK |
| `id_perfil` | `int` |  | NO | 🔗 FK |
| `id_kit_materiales` | `int` |  | NO |  |
| `id_kit_documentos` | `int` |  | NO |  |
| `fecha_creacion` | `datetime` |  | YES |  |
| `fecha_publicacion` | `datetime` |  | YES |  |
| `version` | `int` |  | YES |  |
| `id_cuadrilla_origen` | `nvarchar` | 50 | YES |  |

---

### dbo.EVIDENCIAS
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_evidencia` | `uniqueidentifier` |  | NO | 🔑 PK |
| `id_ot` | `uniqueidentifier` |  | NO | 🔗 FK |
| `tipo_evidencia` | `nvarchar` | 50 | NO |  |
| `url_archivo` | `nvarchar` | -1 | NO |  |
| `timestamp_gps` | `datetime` |  | YES |  |
| `latitud` | `float` |  | YES |  |
| `longitud` | `float` |  | YES |  |
| `fecha_carga` | `datetime` |  | YES |  |

---

### dbo.FORMATOS_PAPELERIA
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_formato` | `int` |  | NO | 🔑 PK |
| `nombre` | `nvarchar` | 100 | NO |  |
| `control_series` | `bit` |  | NO |  |
| `rango_inicio` | `int` |  | YES |  |
| `rango_fin` | `int` |  | YES |  |

---

### dbo.INCIDENTES
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_incidente` | `int` |  | NO | 🔑 PK |
| `id_cuadrilla` | `nvarchar` | 50 | NO |  |
| `gravedad` | `nvarchar` | 20 | NO |  |
| `descripcion` | `nvarchar` | -1 | YES |  |
| `evidencia_url` | `nvarchar` | -1 | YES |  |
| `estado` | `nvarchar` | 20 | NO |  |
| `timestamp_inicio` | `datetime` |  | YES |  |
| `timestamp_cierre` | `datetime` |  | YES |  |

---

### dbo.LOTE_IMPORTACION
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_lote` | `int` |  | NO | 🔑 PK |
| `fecha_carga` | `datetime` |  | YES |  |
| `nombre_archivo_original` | `nvarchar` | 255 | NO |  |
| `fuente_origen` | `nvarchar` | 100 | NO |  |
| `total_registros` | `int` |  | NO |  |
| `filas_validas` | `int` |  | NO |  |
| `filas_error` | `int` |  | NO |  |

---

### dbo.LOTE_VALORIZACION
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_lote` | `int` |  | NO | 🔑 PK |
| `codigo_lote` | `nvarchar` | 50 | NO |  |
| `cliente` | `nvarchar` | 100 | NO |  |
| `mes_valorizacion` | `nvarchar` | 20 | NO |  |
| `estado` | `nvarchar` | 50 | YES |  |
| `fecha_generacion` | `datetime` |  | YES |  |
| `total_facturado` | `decimal` |  | YES |  |
| `snapshot_precios` | `nvarchar` | -1 | YES |  |
| `numero_hes` | `nvarchar` | 50 | YES |  |
| `fecha_aprobacion_hes` | `datetime` |  | YES |  |
| `fecha_pago_probable` | `datetime` |  | YES |  |

---

### dbo.MOVIMIENTOS_ALMACEN
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_movimiento` | `int` |  | NO | 🔑 PK |
| `fecha` | `datetime` |  | YES |  |
| `tipo_movimiento` | `nvarchar` | 50 | NO |  |
| `id_material` | `uniqueidentifier` |  | NO | 🔗 FK |
| `cantidad` | `decimal` |  | NO |  |
| `origen` | `nvarchar` | 100 | YES |  |
| `destino` | `nvarchar` | 100 | YES |  |
| `usuario_responsable` | `nvarchar` | 100 | NO |  |
| `documento_ref` | `nvarchar` | 100 | YES |  |

---

### dbo.ORDENES_TRABAJO
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_ot` | `uniqueidentifier` |  | NO | 🔑 PK |
| `codigo_suministro` | `nvarchar` | 50 | NO |  |
| `cliente` | `nvarchar` | 100 | NO |  |
| `direccion_fisica` | `nvarchar` | 255 | NO |  |
| `comuna` | `nvarchar` | 100 | YES |  |
| `sector` | `nvarchar` | 100 | YES |  |
| `tipo_trabajo` | `nvarchar` | 100 | YES |  |
| `estado` | `nvarchar` | 50 | NO |  |
| `prioridad` | `nvarchar` | 20 | YES |  |
| `notas` | `nvarchar` | -1 | YES |  |
| `id_lote_origen` | `int` |  | NO | 🔗 FK |
| `fecha_creacion` | `datetime` |  | YES |  |
| `fecha_programada` | `date` |  | YES |  |
| `latitud` | `float` |  | YES |  |
| `longitud` | `float` |  | YES |  |
| `id_cuadrilla_asignada` | `nvarchar` | 50 | YES |  |
| `orden_visita` | `int` |  | YES |  |
| `hora_inicio_real` | `datetime` |  | YES |  |
| `hora_fin_real` | `datetime` |  | YES |  |
| `justificacion_geo_ot` | `nvarchar` | -1 | YES |  |
| `motivo_fallida` | `nvarchar` | 255 | YES |  |
| `flag_prioridad_calidad` | `bit` |  | YES |  |
| `id_lote_asignado` | `int` |  | YES |  |
| `flag_extemporanea` | `bit` |  | YES |  |
| `justificacion_tardia` | `nvarchar` | -1 | YES |  |
| `Proyecto` | `nvarchar` | 200 | YES |  |

---

### dbo.PERFILES_TRABAJO
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_perfil` | `int` |  | NO | 🔑 PK |
| `nombre` | `nvarchar` | 100 | NO |  |
| `id_kit_material` | `int` |  | YES | 🔗 FK |
| `id_kit_documento` | `int` |  | YES | 🔗 FK |

---

### dbo.REGISTRO_VEHICULAR
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_registro` | `int` |  | NO | 🔑 PK |
| `placa` | `nvarchar` | 50 | NO |  |
| `fecha_registro` | `datetime` |  | YES |  |
| `tipo_evento` | `nvarchar` | 50 | NO |  |
| `kilometraje` | `int` |  | NO |  |
| `checklist_data` | `nvarchar` | -1 | YES |  |
| `conductor` | `nvarchar` | 100 | YES |  |
| `observaciones` | `nvarchar` | -1 | YES |  |

---

### dbo.STOCK_ALMACEN
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_almacen` | `nvarchar` | 50 | NO | 🔑 PK |
| `id_material` | `uniqueidentifier` |  | NO | 🔑 PK |
| `cantidad` | `decimal` |  | NO |  |
| `ultima_actualizacion` | `datetime` |  | YES |  |

---

### dbo.STOCK_CUSTODIA
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `custodio_id` | `nvarchar` | 50 | NO | 🔑 PK |
| `tipo_custodio` | `nvarchar` | 20 | NO |  |
| `id_material` | `uniqueidentifier` |  | NO | 🔑 PK |
| `cantidad` | `decimal` |  | NO |  |
| `ultima_actualizacion` | `datetime` |  | YES |  |

---

### dbo.sysdiagrams
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `name` | `nvarchar` | 128 | NO |  |
| `principal_id` | `int` |  | NO |  |
| `diagram_id` | `int` |  | NO | 🔑 PK |
| `version` | `int` |  | YES |  |
| `definition` | `varbinary` | -1 | YES |  |

---

### dbo.v_Global_Personal
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `DNI` | `nvarchar` | 40 | NO |  |
| `NombreCompleto` | `nvarchar` | 200 | YES |  |
| `Cargo` | `nvarchar` | 100 | YES |  |
| `Area` | `nvarchar` | 100 | YES |  |
| `Division` | `nvarchar` | 100 | YES |  |
| `Email` | `nvarchar` | 100 | YES |  |
| `Telefono` | `nvarchar` | 50 | YES |  |
| `Estado` | `nvarchar` | 50 | YES |  |

---

### dbo.VEHICLE_TRACKING_LOGS
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_log` | `bigint` |  | NO | 🔑 PK |
| `placa` | `nvarchar` | 50 | NO |  |
| `lat` | `decimal` |  | NO |  |
| `lng` | `decimal` |  | NO |  |
| `speed` | `int` |  | YES |  |
| `heading` | `int` |  | YES |  |
| `timestamp` | `datetime` |  | YES |  |
| `event_type` | `nvarchar` | 50 | YES |  |

---

### dbo.VEHICULOS
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `placa` | `nvarchar` | 20 | NO | 🔑 PK |
| `marca` | `nvarchar` | 100 | NO |  |
| `tipo_activo` | `nvarchar` | 20 | NO |  |
| `max_volumen` | `nvarchar` | 10 | NO |  |
| `estado` | `nvarchar` | 20 | NO |  |
| `ultimo_km_registrado` | `int` |  | YES |  |
| `proximo_mant_km` | `int` |  | YES |  |

---

### dbo.ZONAS
| Columna | Tipo | Longitud | Nullable | Key |
| :--- | :--- | :--- | :--- | :---: |
| `id_zona` | `int` |  | NO | 🔑 PK |
| `nombre` | `nvarchar` | 100 | NO |  |
| `codigo` | `nvarchar` | 20 | NO |  |

---

