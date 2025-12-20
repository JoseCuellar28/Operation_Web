-- =============================================
-- DCL: CREACIÓN DE USUARIO NO ADMINISTRATIVO
-- =============================================

-- 1. Crear Login en el Servidor (Master)
USE master;
GO
IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'AppUser_NonAdmin')
BEGIN
    CREATE LOGIN [AppUser_NonAdmin] WITH PASSWORD = N'StrongP@ssw0rd!23', CHECK_POLICY = ON;
END
GO

-- 2. Crear Usuario en la Base de Datos (OperationWebDB)
USE [OperationWebDB];
GO
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'AppUser_NonAdmin')
BEGIN
    CREATE USER [AppUser_NonAdmin] FOR LOGIN [AppUser_NonAdmin];
END
GO

-- 3. ASIGNAR PERMISOS (Principio de Menor Privilegio)

-- Creación de roles personalizados si es necesario, o usar db_datareader/writer
ALTER ROLE [db_datareader] ADD MEMBER [AppUser_NonAdmin];
ALTER ROLE [db_datawriter] ADD MEMBER [AppUser_NonAdmin];

-- Permisos explícitos de Ejecución para Stored Procedures y Funciones
GRANT EXECUTE TO [AppUser_NonAdmin];

-- Denegar permisos peligrosos
DENY ALTER ON SCHEMA::dbo TO [AppUser_NonAdmin];
DENY DROP TABLE TO [AppUser_NonAdmin];

GO

-- =============================================
-- OBJETOS ADICIONALES (Requerimiento)
-- =============================================

-- 1. SINÓNIMOS (Abstracción)
IF NOT EXISTS (SELECT * FROM sys.synonyms WHERE name = 'syn_Personal')
BEGIN
    CREATE SYNONYM [dbo].[syn_Personal] FOR [dbo].[Personal];
END
GO

-- 2. "PAQUETES" (En SQL Server se usan Schemas para agrupar lógica)
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'HumanResources')
BEGIN
    EXEC('CREATE SCHEMA [HumanResources]');
END
GO
-- Mover tabla a esquema (Ejemplo lógico)
-- ALTER SCHEMA [HumanResources] TRANSFER [dbo].[Personal_Staging];

