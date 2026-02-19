
-- 05_SGO_F1_DEVICE_BINDING.sql
-- FASE 1: Device Binding Implementation
-- Fecha: 2026-02-19

USE [DB_Operation];
GO

-- 1. Tabla Dispositivos_Vinculados
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Dispositivos_Vinculados]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Dispositivos_Vinculados](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [DeviceId] [nvarchar](100) NOT NULL,
        [UsuarioDni] [nvarchar](20) NOT NULL,
        [FechaVinculacion] [datetime2](7) NOT NULL DEFAULT GETUTCDATE(),
        [Estado] [nvarchar](20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, BLOQUEADO
        [UltimoAcceso] [datetime2](7) NULL,
        [Platform] [nvarchar](20) NULL,
        CONSTRAINT [PK_Dispositivos_Vinculados] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    CREATE UNIQUE INDEX [IX_Dispositivos_Vinculados_DeviceId] ON [dbo].[Dispositivos_Vinculados]([DeviceId]);
    PRINT 'Tabla Dispositivos_Vinculados creada.';
END
ELSE
BEGIN
    PRINT 'Tabla Dispositivos_Vinculados ya existe.';
END
GO

-- 2. Extensiones en Opera_Main.COLABORADORES
-- Nota: Asumimos que el usuario tiene permisos cross-db. 
-- Si falla, se deberá ejecutar en contexto Opera_Main explícitamente.

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'Opera_Main')
BEGIN
    USE [Opera_Main];
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'COLABORADORES' AND COLUMN_NAME = 'device_id_vinculado')
    BEGIN
        ALTER TABLE [dbo].[COLABORADORES] ADD [device_id_vinculado] [nvarchar](100) NULL;
        PRINT 'Columna device_id_vinculado agregada a COLABORADORES.';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'COLABORADORES' AND COLUMN_NAME = 'id_zona')
    BEGIN
        ALTER TABLE [dbo].[COLABORADORES] ADD [id_zona] [int] NULL;
        PRINT 'Columna id_zona agregada a COLABORADORES.';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'COLABORADORES' AND COLUMN_NAME = 'id_vehiculo_asignado')
    BEGIN
        ALTER TABLE [dbo].[COLABORADORES] ADD [id_vehiculo_asignado] [int] NULL;
        PRINT 'Columna id_vehiculo_asignado agregada a COLABORADORES.';
    END
    
    -- Volver a DB original
    USE [DB_Operation];
END
ELSE
BEGIN
    PRINT 'ADVERTENCIA: Base de datos Opera_Main no encontrada. Saltando extensiones de COLABORADORES.';
END
GO
