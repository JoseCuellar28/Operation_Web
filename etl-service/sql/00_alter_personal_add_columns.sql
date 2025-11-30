-- Script para agregar nuevas columnas a las tablas Personal y Personal_Staging

-- Tabla Personal
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'CodigoEmpleado')
    ALTER TABLE [dbo].[Personal] ADD [CodigoEmpleado] NVARCHAR(20) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Categoria')
    ALTER TABLE [dbo].[Personal] ADD [Categoria] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Division')
    ALTER TABLE [dbo].[Personal] ADD [Division] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'LineaNegocio')
    ALTER TABLE [dbo].[Personal] ADD [LineaNegocio] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Area')
    ALTER TABLE [dbo].[Personal] ADD [Area] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Seccion')
    ALTER TABLE [dbo].[Personal] ADD [Seccion] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'DetalleCebe')
    ALTER TABLE [dbo].[Personal] ADD [DetalleCebe] NVARCHAR(200) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'CodigoCebe')
    ALTER TABLE [dbo].[Personal] ADD [CodigoCebe] NVARCHAR(50) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'MotivoCeseDesc')
    ALTER TABLE [dbo].[Personal] ADD [MotivoCeseDesc] NVARCHAR(200) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Comentario')
    ALTER TABLE [dbo].[Personal] ADD [Comentario] NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'FechaNacimiento')
    ALTER TABLE [dbo].[Personal] ADD [FechaNacimiento] DATETIME2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Sexo')
    ALTER TABLE [dbo].[Personal] ADD [Sexo] NVARCHAR(20) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Edad')
    ALTER TABLE [dbo].[Personal] ADD [Edad] INT NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Permanencia')
    ALTER TABLE [dbo].[Personal] ADD [Permanencia] DECIMAL(18,2) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'Email')
    ALTER TABLE [dbo].[Personal] ADD [Email] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'EmailPersonal')
    ALTER TABLE [dbo].[Personal] ADD [EmailPersonal] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND name = 'JefeInmediato')
    ALTER TABLE [dbo].[Personal] ADD [JefeInmediato] NVARCHAR(200) NULL;

-- Tabla Personal_Staging
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'CodigoEmpleado')
    ALTER TABLE [dbo].[Personal_Staging] ADD [CodigoEmpleado] NVARCHAR(20) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Categoria')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Categoria] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Division')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Division] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'LineaNegocio')
    ALTER TABLE [dbo].[Personal_Staging] ADD [LineaNegocio] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Area')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Area] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Seccion')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Seccion] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'DetalleCebe')
    ALTER TABLE [dbo].[Personal_Staging] ADD [DetalleCebe] NVARCHAR(200) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'CodigoCebe')
    ALTER TABLE [dbo].[Personal_Staging] ADD [CodigoCebe] NVARCHAR(50) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'MotivoCeseDesc')
    ALTER TABLE [dbo].[Personal_Staging] ADD [MotivoCeseDesc] NVARCHAR(200) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Comentario')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Comentario] NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'FechaNacimiento')
    ALTER TABLE [dbo].[Personal_Staging] ADD [FechaNacimiento] DATETIME2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Sexo')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Sexo] NVARCHAR(20) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Edad')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Edad] INT NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Permanencia')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Permanencia] DECIMAL(18,2) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'Email')
    ALTER TABLE [dbo].[Personal_Staging] ADD [Email] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'EmailPersonal')
    ALTER TABLE [dbo].[Personal_Staging] ADD [EmailPersonal] NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Personal_Staging]') AND name = 'JefeInmediato')
    ALTER TABLE [dbo].[Personal_Staging] ADD [JefeInmediato] NVARCHAR(200) NULL;
GO
