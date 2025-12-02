CREATE TABLE [Cuadrillas] (
    [Id] int NOT NULL IDENTITY,
    [Nombre] nvarchar(100) NOT NULL,
    [Descripcion] nvarchar(500) NULL,
    [Estado] nvarchar(50) NOT NULL DEFAULT N'Activa',
    [CapacidadMaxima] int NOT NULL DEFAULT 0,
    [Supervisor] nvarchar(100) NULL,
    [Ubicacion] nvarchar(200) NULL,
    [FechaCreacion] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [FechaModificacion] datetime2 NULL,
    CONSTRAINT [PK_Cuadrillas] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Empleado] (
    [IdEmpleado] int NOT NULL IDENTITY,
    [IdEmpresa] int NOT NULL,
    [CodigoEmpleado] nvarchar(50) NULL,
    [TipoDocumento] int NULL,
    [DNI] nvarchar(40) NOT NULL,
    [Nombre] nvarchar(100) NOT NULL,
    [ApellidoPaterno] nvarchar(100) NULL,
    [ApellidoMaterno] nvarchar(100) NULL,
    [FechaNacimiento] datetime2 NULL,
    [Email] nvarchar(100) NULL,
    [Telefono] nvarchar(20) NULL,
    [IdJefeInmediato] int NULL,
    [IdEmpleadoPerfil] int NULL,
    [IdUnidad] int NULL,
    [IdArea] int NULL,
    [Administrador] bit NULL,
    [UsuarioActivo] nvarchar(1) NULL,
    [FechaCreacion] datetime2 NULL,
    [FechaModificacion] datetime2 NULL,
    [UsuarioCreacion] nvarchar(50) NULL,
    [UsuarioModificacion] nvarchar(50) NULL,
    CONSTRAINT [PK_Empleado] PRIMARY KEY ([IdEmpleado])
);
GO


CREATE TABLE [Historial_Cargas_Personal] (
    [Id] int NOT NULL IDENTITY,
    [FechaCarga] datetime2 NOT NULL,
    [Archivo] nvarchar(520) NULL,
    [Usuario] nvarchar(100) NULL,
    CONSTRAINT [PK_Historial_Cargas_Personal] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [MotivosCese] (
    [Codigo] int NOT NULL,
    [Descripcion] nvarchar(200) NULL,
    CONSTRAINT [PK_MotivosCese] PRIMARY KEY ([Codigo])
);
GO


CREATE TABLE [Personal] (
    [DNI] nvarchar(40) NOT NULL,
    [Inspector] nvarchar(100) NULL,
    [Telefono] nvarchar(20) NULL,
    [Distrito] nvarchar(100) NULL,
    [Tipo] nvarchar(40) NULL,
    [Estado] nvarchar(20) NULL,
    [FechaInicio] datetime2 NULL,
    [FechaCese] datetime2 NULL,
    [UsuarioCreacion] nvarchar(100) NULL,
    [FechaCreacion] datetime2 NULL,
    [FechaModificacion] datetime2 NULL,
    [UsuarioModificacion] nvarchar(100) NULL,
    [CodigoEmpleado] nvarchar(20) NULL,
    [Categoria] nvarchar(100) NULL,
    [Division] nvarchar(100) NULL,
    [LineaNegocio] nvarchar(100) NULL,
    [Area] nvarchar(100) NULL,
    [Seccion] nvarchar(100) NULL,
    [DetalleCebe] nvarchar(200) NULL,
    [CodigoCebe] nvarchar(50) NULL,
    [MotivoCeseDesc] nvarchar(200) NULL,
    [Comentario] nvarchar(500) NULL,
    [FechaNacimiento] datetime2 NULL,
    [Sexo] nvarchar(20) NULL,
    [Edad] int NULL,
    [Permanencia] decimal(18,2) NULL,
    [Email] nvarchar(100) NULL,
    [EmailPersonal] nvarchar(100) NULL,
    [JefeInmediato] nvarchar(200) NULL,
    CONSTRAINT [PK_Personal] PRIMARY KEY ([DNI])
);
GO


CREATE TABLE [Roles] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(50) NOT NULL,
    [Description] nvarchar(200) NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [SystemSettings] (
    [Key] nvarchar(100) NOT NULL,
    [Value] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_SystemSettings] PRIMARY KEY ([Key])
);
GO


CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [DNI] nvarchar(40) NOT NULL,
    [PasswordHash] nvarchar(200) NOT NULL,
    [Email] nvarchar(100) NULL,
    [Role] nvarchar(20) NOT NULL,
    [MustChangePassword] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [CuadrillaColaboradores] (
    [Id] int NOT NULL IDENTITY,
    [CuadrillaId] int NOT NULL,
    [PersonalDNI] nvarchar(40) NOT NULL,
    [FechaAsignacion] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [FechaDesasignacion] datetime2 NULL,
    [Rol] nvarchar(50) NULL,
    [Activo] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK_CuadrillaColaboradores] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_CuadrillaColaboradores_Cuadrillas_CuadrillaId] FOREIGN KEY ([CuadrillaId]) REFERENCES [Cuadrillas] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CuadrillaColaboradores_Personal_PersonalDNI] FOREIGN KEY ([PersonalDNI]) REFERENCES [Personal] ([DNI]) ON DELETE CASCADE
);
GO


CREATE TABLE [Personal_EventoLaboral] (
    [Id] int NOT NULL IDENTITY,
    [DNI] nvarchar(40) NULL,
    [TipoEvento] nvarchar(40) NULL,
    [Motivo] nvarchar(100) NULL,
    [FechaEvento] datetime2 NULL,
    [Periodo] nvarchar(20) NULL,
    CONSTRAINT [PK_Personal_EventoLaboral] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Personal_EventoLaboral_Personal_DNI] FOREIGN KEY ([DNI]) REFERENCES [Personal] ([DNI])
);
GO


CREATE TABLE [Personal_Staging] (
    [Id] int NOT NULL IDENTITY,
    [DNI] nvarchar(40) NULL,
    [Archivo] nvarchar(520) NULL,
    [Hoja] nvarchar(200) NULL,
    [Periodo] nvarchar(20) NULL,
    [Inspector] nvarchar(400) NULL,
    [Situacion] nvarchar(100) NULL,
    [FechaIngreso] datetime2 NULL,
    [FechaCese] datetime2 NULL,
    [MotivoDeCese] int NULL,
    [MotivoNorm] nvarchar(100) NULL,
    [SedeTrabajo] nvarchar(100) NULL,
    [TipoTrabajador] nvarchar(100) NULL,
    [FechaCarga] datetime2 NULL,
    [UsuarioCarga] nvarchar(100) NULL,
    [CodigoEmpleado] nvarchar(20) NULL,
    [Categoria] nvarchar(100) NULL,
    [Division] nvarchar(100) NULL,
    [LineaNegocio] nvarchar(100) NULL,
    [Area] nvarchar(100) NULL,
    [Seccion] nvarchar(100) NULL,
    [DetalleCebe] nvarchar(200) NULL,
    [CodigoCebe] nvarchar(50) NULL,
    [MotivoCeseDesc] nvarchar(200) NULL,
    [Comentario] nvarchar(500) NULL,
    [FechaNacimiento] datetime2 NULL,
    [Sexo] nvarchar(20) NULL,
    [Edad] int NULL,
    [Permanencia] decimal(18,2) NULL,
    [Email] nvarchar(100) NULL,
    [EmailPersonal] nvarchar(100) NULL,
    [JefeInmediato] nvarchar(200) NULL,
    CONSTRAINT [PK_Personal_Staging] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Personal_Staging_MotivosCese_MotivoDeCese] FOREIGN KEY ([MotivoDeCese]) REFERENCES [MotivosCese] ([Codigo]),
    CONSTRAINT [FK_Personal_Staging_Personal_DNI] FOREIGN KEY ([DNI]) REFERENCES [Personal] ([DNI])
);
GO


CREATE TABLE [UserActivations] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [DNI] nvarchar(40) NOT NULL,
    [Token] nvarchar(64) NOT NULL,
    [Purpose] nvarchar(20) NOT NULL,
    [IssuedAt] datetime2 NOT NULL,
    [ExpiresAt] datetime2 NOT NULL,
    [UsedAt] datetime2 NULL,
    [IssuedBy] nvarchar(100) NULL,
    [Status] nvarchar(20) NOT NULL,
    CONSTRAINT [PK_UserActivations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserActivations_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [UserRoles] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    CONSTRAINT [PK_UserRoles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CapacidadMaxima', N'Descripcion', N'Estado', N'FechaCreacion', N'FechaModificacion', N'Nombre', N'Supervisor', N'Ubicacion') AND [object_id] = OBJECT_ID(N'[Cuadrillas]'))
    SET IDENTITY_INSERT [Cuadrillas] ON;
INSERT INTO [Cuadrillas] ([Id], [CapacidadMaxima], [Descripcion], [Estado], [FechaCreacion], [FechaModificacion], [Nombre], [Supervisor], [Ubicacion])
VALUES (1, 5, N'Equipo de trabajo zona norte', N'Activa', '2024-10-01T00:00:00.0000000Z', NULL, N'Cuadrilla Norte', N'María González', N'Zona Norte'),
(2, 4, N'Equipo de trabajo zona sur', N'Activa', '2024-11-01T00:00:00.0000000Z', NULL, N'Cuadrilla Sur', N'Juan Pérez', N'Zona Sur'),
(3, 6, N'Equipo de trabajo zona centro', N'Inactiva', '2024-09-01T00:00:00.0000000Z', NULL, N'Cuadrilla Centro', N'Carlos Rodríguez', N'Zona Centro');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CapacidadMaxima', N'Descripcion', N'Estado', N'FechaCreacion', N'FechaModificacion', N'Nombre', N'Supervisor', N'Ubicacion') AND [object_id] = OBJECT_ID(N'[Cuadrillas]'))
    SET IDENTITY_INSERT [Cuadrillas] OFF;
GO


IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'IdEmpleado', N'Administrador', N'ApellidoMaterno', N'ApellidoPaterno', N'CodigoEmpleado', N'DNI', N'Email', N'FechaCreacion', N'FechaModificacion', N'FechaNacimiento', N'IdArea', N'IdEmpleadoPerfil', N'IdEmpresa', N'IdJefeInmediato', N'IdUnidad', N'Nombre', N'Telefono', N'TipoDocumento', N'UsuarioActivo', N'UsuarioCreacion', N'UsuarioModificacion') AND [object_id] = OBJECT_ID(N'[Empleado]'))
    SET IDENTITY_INSERT [Empleado] ON;
INSERT INTO [Empleado] ([IdEmpleado], [Administrador], [ApellidoMaterno], [ApellidoPaterno], [CodigoEmpleado], [DNI], [Email], [FechaCreacion], [FechaModificacion], [FechaNacimiento], [IdArea], [IdEmpleadoPerfil], [IdEmpresa], [IdJefeInmediato], [IdUnidad], [Nombre], [Telefono], [TipoDocumento], [UsuarioActivo], [UsuarioCreacion], [UsuarioModificacion])
VALUES (1, NULL, NULL, N'Pérez', NULL, N'12345678', N'juan.perez@empresa.com', '2025-11-30T04:23:19.3412570Z', NULL, NULL, NULL, NULL, 0, NULL, NULL, N'Juan', N'555-0001', NULL, NULL, NULL, NULL),
(2, NULL, NULL, N'González', NULL, N'87654321', N'maria.gonzalez@empresa.com', '2025-11-30T04:23:19.3412570Z', NULL, NULL, NULL, NULL, 0, NULL, NULL, N'María', N'555-0002', NULL, NULL, NULL, NULL),
(3, NULL, NULL, N'Rodríguez', NULL, N'11223344', N'carlos.rodriguez@empresa.com', '2025-11-30T04:23:19.3412570Z', NULL, NULL, NULL, NULL, 0, NULL, NULL, N'Carlos', N'555-0003', NULL, NULL, NULL, NULL),
(4, NULL, NULL, N'López', NULL, N'44332211', N'ana.lopez@empresa.com', '2025-11-30T04:23:19.3412570Z', NULL, NULL, NULL, NULL, 0, NULL, NULL, N'Ana', N'555-0004', NULL, NULL, NULL, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'IdEmpleado', N'Administrador', N'ApellidoMaterno', N'ApellidoPaterno', N'CodigoEmpleado', N'DNI', N'Email', N'FechaCreacion', N'FechaModificacion', N'FechaNacimiento', N'IdArea', N'IdEmpleadoPerfil', N'IdEmpresa', N'IdJefeInmediato', N'IdUnidad', N'Nombre', N'Telefono', N'TipoDocumento', N'UsuarioActivo', N'UsuarioCreacion', N'UsuarioModificacion') AND [object_id] = OBJECT_ID(N'[Empleado]'))
    SET IDENTITY_INSERT [Empleado] OFF;
GO


IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'DNI', N'Area', N'Categoria', N'CodigoCebe', N'CodigoEmpleado', N'Comentario', N'DetalleCebe', N'Distrito', N'Division', N'Edad', N'Email', N'EmailPersonal', N'Estado', N'FechaCese', N'FechaCreacion', N'FechaInicio', N'FechaModificacion', N'FechaNacimiento', N'Inspector', N'JefeInmediato', N'LineaNegocio', N'MotivoCeseDesc', N'Permanencia', N'Seccion', N'Sexo', N'Telefono', N'Tipo', N'UsuarioCreacion', N'UsuarioModificacion') AND [object_id] = OBJECT_ID(N'[Personal]'))
    SET IDENTITY_INSERT [Personal] ON;
INSERT INTO [Personal] ([DNI], [Area], [Categoria], [CodigoCebe], [CodigoEmpleado], [Comentario], [DetalleCebe], [Distrito], [Division], [Edad], [Email], [EmailPersonal], [Estado], [FechaCese], [FechaCreacion], [FechaInicio], [FechaModificacion], [FechaNacimiento], [Inspector], [JefeInmediato], [LineaNegocio], [MotivoCeseDesc], [Permanencia], [Seccion], [Sexo], [Telefono], [Tipo], [UsuarioCreacion], [UsuarioModificacion])
VALUES (N'11223344', NULL, NULL, NULL, NULL, NULL, NULL, N'San Isidro', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-30T04:23:19.3412440Z', '2025-11-30T04:23:19.3412440Z', NULL, NULL, N'Carlos Rodríguez', NULL, NULL, NULL, NULL, NULL, NULL, N'555-0003', N'Operario', NULL, NULL),
(N'12345678', NULL, NULL, NULL, NULL, NULL, NULL, N'Lima', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-30T04:23:19.3412440Z', '2025-11-30T04:23:19.3412430Z', NULL, NULL, N'Juan Pérez', NULL, NULL, NULL, NULL, NULL, NULL, N'555-0001', N'Técnico', NULL, NULL),
(N'44332211', NULL, NULL, NULL, NULL, NULL, NULL, N'Surco', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-30T04:23:19.3412440Z', '2025-11-30T04:23:19.3412440Z', NULL, NULL, N'Ana López', NULL, NULL, NULL, NULL, NULL, NULL, N'555-0004', N'Técnico', NULL, NULL),
(N'87654321', NULL, NULL, NULL, NULL, NULL, NULL, N'Miraflores', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-30T04:23:19.3412440Z', '2025-11-30T04:23:19.3412440Z', NULL, NULL, N'María González', NULL, NULL, NULL, NULL, NULL, NULL, N'555-0002', N'Supervisor', NULL, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'DNI', N'Area', N'Categoria', N'CodigoCebe', N'CodigoEmpleado', N'Comentario', N'DetalleCebe', N'Distrito', N'Division', N'Edad', N'Email', N'EmailPersonal', N'Estado', N'FechaCese', N'FechaCreacion', N'FechaInicio', N'FechaModificacion', N'FechaNacimiento', N'Inspector', N'JefeInmediato', N'LineaNegocio', N'MotivoCeseDesc', N'Permanencia', N'Seccion', N'Sexo', N'Telefono', N'Tipo', N'UsuarioCreacion', N'UsuarioModificacion') AND [object_id] = OBJECT_ID(N'[Personal]'))
    SET IDENTITY_INSERT [Personal] OFF;
GO


IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Activo', N'CuadrillaId', N'FechaAsignacion', N'FechaDesasignacion', N'PersonalDNI', N'Rol') AND [object_id] = OBJECT_ID(N'[CuadrillaColaboradores]'))
    SET IDENTITY_INSERT [CuadrillaColaboradores] ON;
INSERT INTO [CuadrillaColaboradores] ([Id], [Activo], [CuadrillaId], [FechaAsignacion], [FechaDesasignacion], [PersonalDNI], [Rol])
VALUES (1, CAST(1 AS bit), 1, '2024-10-01T00:00:00.0000000Z', NULL, N'87654321', N'Supervisor'),
(2, CAST(1 AS bit), 1, '2024-11-01T00:00:00.0000000Z', NULL, N'12345678', N'Técnico'),
(3, CAST(1 AS bit), 2, '2024-11-01T00:00:00.0000000Z', NULL, N'11223344', N'Operario'),
(4, CAST(1 AS bit), 2, '2024-11-15T00:00:00.0000000Z', NULL, N'44332211', N'Técnico');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Activo', N'CuadrillaId', N'FechaAsignacion', N'FechaDesasignacion', N'PersonalDNI', N'Rol') AND [object_id] = OBJECT_ID(N'[CuadrillaColaboradores]'))
    SET IDENTITY_INSERT [CuadrillaColaboradores] OFF;
GO


CREATE UNIQUE INDEX [IX_CuadrillaColaboradores_CuadrillaId_PersonalDNI_Activo] ON [CuadrillaColaboradores] ([CuadrillaId], [PersonalDNI], [Activo]) WHERE [Activo] = 1;
GO


CREATE INDEX [IX_CuadrillaColaboradores_PersonalDNI] ON [CuadrillaColaboradores] ([PersonalDNI]);
GO


CREATE UNIQUE INDEX [IX_Cuadrillas_Nombre] ON [Cuadrillas] ([Nombre]);
GO


CREATE UNIQUE INDEX [IX_Empleado_CodigoEmpleado] ON [Empleado] ([CodigoEmpleado]) WHERE [CodigoEmpleado] IS NOT NULL;
GO


CREATE UNIQUE INDEX [IX_Empleado_DNI] ON [Empleado] ([DNI]);
GO


CREATE UNIQUE INDEX [IX_Empleado_Email] ON [Empleado] ([Email]) WHERE [Email] IS NOT NULL;
GO


CREATE INDEX [IX_Personal_EventoLaboral_DNI] ON [Personal_EventoLaboral] ([DNI]);
GO


CREATE INDEX [IX_Personal_Staging_DNI] ON [Personal_Staging] ([DNI]);
GO


CREATE INDEX [IX_Personal_Staging_MotivoDeCese] ON [Personal_Staging] ([MotivoDeCese]);
GO


CREATE UNIQUE INDEX [IX_Roles_Name] ON [Roles] ([Name]);
GO


CREATE UNIQUE INDEX [IX_UserActivations_Token] ON [UserActivations] ([Token]);
GO


CREATE INDEX [IX_UserActivations_UserId] ON [UserActivations] ([UserId]);
GO


CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);
GO


CREATE UNIQUE INDEX [IX_UserRoles_UserId_RoleId] ON [UserRoles] ([UserId], [RoleId]);
GO


CREATE UNIQUE INDEX [IX_Users_DNI] ON [Users] ([DNI]);
GO


CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]) WHERE [Email] IS NOT NULL;
GO


