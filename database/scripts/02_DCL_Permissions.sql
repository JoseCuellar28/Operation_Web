-- 4. CREACIÓN DE USUARIO CONTENIDO (Azure SQL Best Practice)
-- Usamos "Contained User" para no depender de la base de datos master.
-- Esto hace la base de datos totalmente portable.

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'app_limited_user')
BEGIN
    CREATE USER [app_limited_user] WITH PASSWORD = N'StrongPass123!@#';
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
