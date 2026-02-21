-- 06_SGO_F2_GEOFENCE_HEALTH.sql
-- FASE 2: Geocerca + Salud (Opera_Main)
-- Ejecutar en SSMS sobre la instancia SQL del entorno local/staging.

USE [Opera_Main];
GO

-- 1) Tabla Zonas_Trabajo
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = 'Zonas_Trabajo'
)
BEGIN
    CREATE TABLE [dbo].[Zonas_Trabajo](
        [id_zona] INT IDENTITY(1,1) NOT NULL,
        [nombre_zona] NVARCHAR(150) NOT NULL,
        [latitud_centro] DECIMAL(12,9) NOT NULL,
        [longitud_centro] DECIMAL(12,9) NOT NULL,
        [radio_metros] INT NOT NULL CONSTRAINT [DF_Zonas_Trabajo_radio_metros] DEFAULT (500),
        [activo] BIT NOT NULL CONSTRAINT [DF_Zonas_Trabajo_activo] DEFAULT (1),
        CONSTRAINT [PK_Zonas_Trabajo] PRIMARY KEY CLUSTERED ([id_zona] ASC)
    );
    PRINT 'Tabla dbo.Zonas_Trabajo creada.';
END
ELSE
BEGIN
    PRINT 'Tabla dbo.Zonas_Trabajo ya existe.';
END
GO

-- 2) Tabla Estado_Salud
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = 'Estado_Salud'
)
BEGIN
    CREATE TABLE [dbo].[Estado_Salud](
        [id_salud] INT IDENTITY(1,1) NOT NULL,
        [id_colaborador] INT NOT NULL,
        [fecha] DATE NOT NULL,
        [respuestas_json] NVARCHAR(MAX) NULL,
        [apto] BIT NOT NULL,
        CONSTRAINT [PK_Estado_Salud] PRIMARY KEY CLUSTERED ([id_salud] ASC)
    );
    PRINT 'Tabla dbo.Estado_Salud creada.';
END
ELSE
BEGIN
    PRINT 'Tabla dbo.Estado_Salud ya existe.';
END
GO

-- 3) FK Estado_Salud -> COLABORADORES
IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_EstadoSalud_Colaboradores'
)
BEGIN
    ALTER TABLE [dbo].[Estado_Salud]
    ADD CONSTRAINT [FK_EstadoSalud_Colaboradores]
        FOREIGN KEY ([id_colaborador]) REFERENCES [dbo].[COLABORADORES]([id]);
    PRINT 'FK_EstadoSalud_Colaboradores creada.';
END
ELSE
BEGIN
    PRINT 'FK_EstadoSalud_Colaboradores ya existe.';
END
GO

-- 4) FK opcional COLABORADORES.id_zona -> Zonas_Trabajo.id_zona
IF COL_LENGTH('dbo.COLABORADORES', 'id_zona') IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_Colaboradores_ZonasTrabajo'
)
BEGIN
    ALTER TABLE [dbo].[COLABORADORES]
    ADD CONSTRAINT [FK_Colaboradores_ZonasTrabajo]
        FOREIGN KEY ([id_zona]) REFERENCES [dbo].[Zonas_Trabajo]([id_zona]);
    PRINT 'FK_Colaboradores_ZonasTrabajo creada.';
END
ELSE
BEGIN
    PRINT 'FK_Colaboradores_ZonasTrabajo ya existe o id_zona no existe.';
END
GO

-- 5) Índices mínimos para consultas de F2
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_EstadoSalud_Colaborador_Fecha'
      AND object_id = OBJECT_ID('dbo.Estado_Salud')
)
BEGIN
    CREATE INDEX [IX_EstadoSalud_Colaborador_Fecha]
    ON [dbo].[Estado_Salud]([id_colaborador], [fecha] DESC);
    PRINT 'Indice IX_EstadoSalud_Colaborador_Fecha creado.';
END
ELSE
BEGIN
    PRINT 'Indice IX_EstadoSalud_Colaborador_Fecha ya existe.';
END
GO

-- 6) Verificación rápida
SELECT 'Opera_Main' AS db, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN ('Zonas_Trabajo', 'Estado_Salud');

SELECT c.name AS column_name
FROM sys.columns c
WHERE c.object_id = OBJECT_ID('dbo.COLABORADORES')
  AND c.name = 'id_zona';
GO
