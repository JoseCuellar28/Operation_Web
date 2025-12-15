-- 4. CREACIÓN DE USUARIO NO ADMINISTRATIVO Y PERMISOS (DCL)

-- Nota: Este script debe ejecutarse por un admin (sa)
IF NOT EXISTS (SELECT name FROM master.sys.server_principals WHERE name = 'app_limited_user')
BEGIN
    CREATE LOGIN [app_limited_user] WITH PASSWORD=N'StrongPass123!@#', DEFAULT_DATABASE=[OperationWebDB], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF;
END
GO

USE [OperationWebDB]
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'app_limited_user')
BEGIN
    CREATE USER [app_limited_user] FOR LOGIN [app_limited_user];
END
GO

-- Asignar roles limitados (Solo lectura y escritura, no DDL admin)
ALTER ROLE [db_datareader] ADD MEMBER [app_limited_user];
ALTER ROLE [db_datawriter] ADD MEMBER [app_limited_user];
GO

-- 5. SINÓNIMOS (Para cumplir requerimiento)
IF NOT EXISTS (SELECT * FROM sys.synonyms WHERE name = 'syn_Empleados')
BEGIN
    CREATE SYNONYM [dbo].[syn_Empleados] FOR [OperationWebDB].[dbo].[Personal];
END
GO
