-- =============================================
-- FINAL REPAIR SCRIPT: CLEAN & RESTORE
-- =============================================

-- 1. DROP FK CONSTRAINTS (Limpieza segura)
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
    ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.foreign_keys;
EXEC sp_executesql @sql;

-- 2. DROP TABLES (Borrado total)
DROP TABLE IF EXISTS [dbo].[UserAccessConfigs];
DROP TABLE IF EXISTS [dbo].[UserRoles];
DROP TABLE IF EXISTS [dbo].[UserActivations];
DROP TABLE IF EXISTS [dbo].[PasswordResetTokens];
DROP TABLE IF EXISTS [dbo].[CuadrillaColaboradores];
DROP TABLE IF EXISTS [dbo].[Personal_EventoLaboral];
DROP TABLE IF EXISTS [dbo].[Personal_Staging];
DROP TABLE IF EXISTS [dbo].[HSE_InspectionItems];
DROP TABLE IF EXISTS [dbo].[HSE_PPE_Delivery];
DROP TABLE IF EXISTS [dbo].[HSE_Incidents];
DROP TABLE IF EXISTS [dbo].[HSE_Inspections];
DROP TABLE IF EXISTS [dbo].[Historial_Cargas_Personal];
DROP TABLE IF EXISTS [dbo].[Users];
DROP TABLE IF EXISTS [dbo].[Roles];
DROP TABLE IF EXISTS [dbo].[Cuadrillas];
DROP TABLE IF EXISTS [dbo].[Personal];
DROP TABLE IF EXISTS [dbo].[Empleado];
DROP TABLE IF EXISTS [dbo].[Proyectos];
DROP TABLE IF EXISTS [dbo].[SystemSettings];
DROP TABLE IF EXISTS [dbo].[MotivosCese]; 

-- 3. CREATE TABLES (Creación limpia)

CREATE TABLE [dbo].[SystemSettings](
    [Key] [nvarchar](100) NOT NULL PRIMARY KEY,
    [Value] [nvarchar](max) NOT NULL,
    [Description] [nvarchar](max) NULL,
    [UpdatedAt] [datetime2] NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE [dbo].[MotivosCese](
    [Codigo] [int] NOT NULL PRIMARY KEY,
    [Descripcion] [nvarchar](200) NULL
);

CREATE TABLE [dbo].[Roles](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name] [nvarchar](50) NOT NULL UNIQUE,
    [Description] [nvarchar](200) NULL
);

CREATE TABLE [dbo].[Users](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DNI] [nvarchar](40) NOT NULL UNIQUE,
    [PasswordHash] [nvarchar](200) NOT NULL,
    [Email] [nvarchar](100) NULL,
    [Role] [nvarchar](20) NOT NULL DEFAULT 'User',
    [MustChangePassword] [bit] NOT NULL DEFAULT 0,
    [IsActive] [bit] NOT NULL DEFAULT 1,
    [CreatedAt] [datetime2] NOT NULL DEFAULT GETUTCDATE()
);
CREATE UNIQUE INDEX IX_Users_Email ON Users(Email) WHERE Email IS NOT NULL;

CREATE TABLE [dbo].[Personal](
    [DNI] [nvarchar](40) NOT NULL PRIMARY KEY,
    [Inspector] [nvarchar](100) NULL,
    [Telefono] [nvarchar](20) NULL,
    [Distrito] [nvarchar](100) NULL,
    [Tipo] [nvarchar](40) NULL,
    [Estado] [nvarchar](20) NULL,
    [FechaInicio] [datetime2] NULL,
    [FechaCese] [datetime2] NULL,
    [UsuarioCreacion] [nvarchar](100) NULL,
    [FechaCreacion] [datetime2] NULL,
    [FechaModificacion] [datetime2] NULL,
    [UsuarioModificacion] [nvarchar](100) NULL,
    [CodigoEmpleado] [nvarchar](20) NULL,
    [Categoria] [nvarchar](100) NULL,
    [Division] [nvarchar](100) NULL,
    [LineaNegocio] [nvarchar](100) NULL,
    [Area] [nvarchar](100) NULL,
    [Seccion] [nvarchar](100) NULL,
    [DetalleCebe] [nvarchar](200) NULL,
    [CodigoCebe] [nvarchar](50) NULL,
    [MotivoCeseDesc] [nvarchar](200) NULL,
    [Comentario] [nvarchar](500) NULL,
    [FechaNacimiento] [datetime2] NULL,
    [Sexo] [nvarchar](20) NULL,
    [Edad] [int] NULL,
    [Permanencia] [decimal](18, 2) NULL,
    [Email] [nvarchar](100) NULL,
    [EmailPersonal] [nvarchar](100) NULL,
    [JefeInmediato] [nvarchar](200) NULL
);

CREATE TABLE [dbo].[Cuadrillas](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Nombre] [nvarchar](100) NOT NULL UNIQUE,
    [Descripcion] [nvarchar](500) NULL,
    [Estado] [nvarchar](50) NOT NULL DEFAULT 'Activa',
    [CapacidadMaxima] [int] NOT NULL DEFAULT 0,
    [Supervisor] [nvarchar](100) NULL,
    [Ubicacion] [nvarchar](200) NULL,
    [FechaCreacion] [datetime2] NOT NULL DEFAULT GETUTCDATE(),
    [FechaModificacion] [datetime2] NULL
);

CREATE TABLE [dbo].[Empleado](
    [IdEmpleado] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [IdEmpresa] [int] NOT NULL DEFAULT 0,
    [CodigoEmpleado] [nvarchar](50) NULL,
    [TipoDocumento] [int] NULL,
    [DNI] [nvarchar](40) NOT NULL UNIQUE,
    [Nombre] [nvarchar](100) NOT NULL,
    [ApellidoPaterno] [nvarchar](100) NULL,
    [ApellidoMaterno] [nvarchar](100) NULL,
    [FechaNacimiento] [datetime2] NULL,
    [Email] [nvarchar](100) NULL,
    [Telefono] [nvarchar](20) NULL,
    [IdJefeInmediato] [int] NULL,
    [IdEmpleadoPerfil] [int] NULL,
    [IdUnidad] [int] NULL,
    [IdArea] [int] NULL,
    [Administrador] [bit] NULL,
    [UsuarioActivo] [nvarchar](1) NULL,
    [FechaCreacion] [datetime2] NULL,
    [FechaModificacion] [datetime2] NULL,
    [UsuarioCreacion] [nvarchar](50) NULL,
    [UsuarioModificacion] [nvarchar](50) NULL
);

CREATE TABLE [dbo].[Proyectos](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Nombre] [nvarchar](100) NOT NULL,
    [Division] [nvarchar](100) NULL,
    [Cliente] [nvarchar](200) NULL,
    [Estado] [nvarchar](50) DEFAULT 'Activo',
    [FechaInicio] [datetime2] NULL,
    [FechaFin] [datetime2] NULL,
    [Presupuesto] [decimal](18,2) NULL,
    [FechaSincronizacion] [datetime2] NULL,
    [GerenteDni] [nvarchar](20) NULL,
    [JefeDni] [nvarchar](20) NULL
);

CREATE TABLE [dbo].[Historial_Cargas_Personal](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [FechaCarga] [datetime2] NOT NULL,
    [Archivo] [nvarchar](520) NULL,
    [Usuario] [nvarchar](100) NULL
);

CREATE TABLE [dbo].[UserRoles](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] [int] NOT NULL,
    [RoleId] [int] NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE
);

CREATE TABLE [dbo].[UserAccessConfigs](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] [int] NOT NULL,
    [AccessWeb] [bit] NOT NULL DEFAULT 1,
    [AccessApp] [bit] NOT NULL DEFAULT 1,
    [JobLevel] [nvarchar](50) NULL,
    [ProjectScope] [nvarchar](100) NULL,
    [LastUpdated] [datetime2] NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE TABLE [dbo].[UserActivations](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] [int] NOT NULL,
    [DNI] [nvarchar](40) NOT NULL,
    [Token] [nvarchar](64) NOT NULL UNIQUE,
    [Purpose] [nvarchar](20) NOT NULL,
    [IssuedAt] [datetime2] NOT NULL,
    [ExpiresAt] [datetime2] NOT NULL,
    [UsedAt] [datetime2] NULL,
    [IssuedBy] [nvarchar](100) NULL,
    [Status] [nvarchar](20) NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE TABLE [dbo].[PasswordResetTokens](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DNI] [nvarchar](40) NOT NULL,
    [Token] [nvarchar](100) NOT NULL,
    [CreatedAt] [datetime2] NOT NULL,
    [ExpiresAt] [datetime2] NOT NULL,
    [IsUsed] [bit] NOT NULL DEFAULT 0,
    [UsedAt] [datetime2] NULL
);

CREATE TABLE [dbo].[CuadrillaColaboradores](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [CuadrillaId] [int] NOT NULL,
    [PersonalDNI] [nvarchar](40) NOT NULL,
    [FechaAsignacion] [datetime2] NOT NULL DEFAULT GETUTCDATE(),
    [FechaDesasignacion] [datetime2] NULL,
    [Rol] [nvarchar](50) NULL,
    [Activo] [bit] NOT NULL DEFAULT 1,
    FOREIGN KEY (CuadrillaId) REFERENCES Cuadrillas(Id) ON DELETE CASCADE,
    FOREIGN KEY (PersonalDNI) REFERENCES Personal(DNI) ON DELETE CASCADE
);

CREATE TABLE [dbo].[Personal_EventoLaboral](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DNI] [nvarchar](40) NULL,
    [TipoEvento] [nvarchar](40) NULL,
    [Motivo] [nvarchar](100) NULL,
    [FechaEvento] [datetime2] NULL,
    [Periodo] [nvarchar](20) NULL,
    FOREIGN KEY (DNI) REFERENCES Personal(DNI)
);

CREATE TABLE [dbo].[Personal_Staging](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DNI] [nvarchar](40) NULL,
    [Archivo] [nvarchar](520) NULL,
    [Hoja] [nvarchar](200) NULL,
    [Periodo] [nvarchar](20) NULL,
    [Inspector] [nvarchar](400) NULL,
    [Situacion] [nvarchar](100) NULL,
    [FechaIngreso] [datetime2] NULL,
    [FechaCese] [datetime2] NULL,
    [MotivoDeCese] [int] NULL,
    [MotivoNorm] [nvarchar](100) NULL,
    [SedeTrabajo] [nvarchar](100) NULL,
    [TipoTrabajador] [nvarchar](100) NULL,
    [FechaCarga] [datetime2] NULL,
    [UsuarioCarga] [nvarchar](100) NULL,
    [CodigoEmpleado] [nvarchar](20) NULL,
    [Categoria] [nvarchar](100) NULL,
    [Division] [nvarchar](100) NULL,
    [LineaNegocio] [nvarchar](100) NULL,
    [Area] [nvarchar](100) NULL,
    [Seccion] [nvarchar](100) NULL,
    [DetalleCebe] [nvarchar](200) NULL,
    [CodigoCebe] [nvarchar](50) NULL,
    [MotivoCeseDesc] [nvarchar](200) NULL,
    [Comentario] [nvarchar](500) NULL,
    [FechaNacimiento] [datetime2] NULL,
    [Sexo] [nvarchar](20) NULL,
    [Edad] [int] NULL,
    [Email] [nvarchar](100) NULL,
    FOREIGN KEY (MotivoDeCese) REFERENCES MotivosCese(Codigo),
    FOREIGN KEY (DNI) REFERENCES Personal(DNI)
);

-- HSE Tables
CREATE TABLE HSE_Inspections (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    InspectorDNI NVARCHAR(20) NOT NULL,
    Date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Type NVARCHAR(50) NOT NULL,
    ReferenceId NVARCHAR(100),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft',
    Score DECIMAL(5,2) DEFAULT 0,
    Comments NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE HSE_InspectionItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    InspectionId INT NOT NULL,
    Question NVARCHAR(255) NOT NULL,
    IsCompliant BIT NOT NULL,
    Observation NVARCHAR(MAX),
    Severity NVARCHAR(20) DEFAULT 'Low',
    FOREIGN KEY (InspectionId) REFERENCES HSE_Inspections(Id) ON DELETE CASCADE
);

CREATE TABLE HSE_Incidents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ReporterDNI NVARCHAR(20) NOT NULL,
    Date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Description NVARCHAR(MAX) NOT NULL,
    Location NVARCHAR(100),
    Severity NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Open',
    ActionTaken NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE HSE_PPE_Delivery (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WorkerDNI NVARCHAR(20) NOT NULL,
    DelivererDNI NVARCHAR(20) NOT NULL,
    Date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ItemsJson NVARCHAR(MAX) NOT NULL,
    SignatureMetadata NVARCHAR(MAX),
    Comments NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- 4. SEED DATA
INSERT INTO Roles (Name, Description) VALUES ('Admin', 'System Administrator'), ('User', 'Standard User');
INSERT INTO SystemSettings ([Key], [Value], [Description]) VALUES ('AppVersion', '1.0.0', 'Production Release');
INSERT INTO Users (DNI, PasswordHash, Email, Role, IsActive)
VALUES ('99999999', 'AQAAAAEAACcQAAAAEH+...', 'admin@operationweb.com', 'Admin', 1);

DECLARE @AdminId INT = (SELECT Id FROM Users WHERE DNI = '99999999');
INSERT INTO UserAccessConfigs (UserId, AccessWeb, AccessApp, JobLevel) VALUES (@AdminId, 1, 1, 'Manager');

-- Final Verification Message
SELECT 'DATABASE RESTORE COMPLETED SUCCESSFULLY' AS Status;
