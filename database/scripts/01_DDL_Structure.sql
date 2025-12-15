-- 1. CREACIÓN DE TABLAS (DDL)

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Personal]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Personal](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [DNI] [nvarchar](8) NOT NULL,
        [Inspector] [nvarchar](255) NOT NULL,
        [Telefono] [nvarchar](50) NULL,
        [Correo] [nvarchar](255) NULL,
        [Cargo] [nvarchar](100) NULL,
        [Estado] [bit] NOT NULL DEFAULT 1,
        CONSTRAINT [PK_Personal] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Username] [nvarchar](50) NOT NULL,
        [PasswordHash] [nvarchar](max) NOT NULL,
        [Role] [nvarchar](50) NOT NULL,
        [DNI] [nvarchar](8) NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserAccessConfigs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserAccessConfigs](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [UserId] [int] NOT NULL,
        [CanUploadExcel] [bit] NOT NULL DEFAULT 0,
        [CanManageUsers] [bit] NOT NULL DEFAULT 0,
        [JobLevel] [nvarchar](50) NULL,
        [ProjectScope] [nvarchar](100) NULL,
        CONSTRAINT [PK_UserAccessConfigs] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- 2. CREACIÓN DE INDICES Y CONSTRAINTS (DDL)

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personal_DNI' AND object_id = OBJECT_ID('Personal'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Personal_DNI] ON [dbo].[Personal] ([DNI] ASC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_UserAccessConfigs_Users_UserId]') AND parent_object_id = OBJECT_ID(N'[dbo].[UserAccessConfigs]'))
BEGIN
    ALTER TABLE [dbo].[UserAccessConfigs]  WITH CHECK ADD  CONSTRAINT [FK_UserAccessConfigs_Users_UserId] FOREIGN KEY([UserId])
    REFERENCES [dbo].[Users] ([Id])
    ON DELETE CASCADE;
END
GO

-- 3. FUNCIONES (Para cumplir requerimiento)
CREATE OR ALTER FUNCTION [dbo].[GetActiveUserCount]()
RETURNS INT
AS
BEGIN
    DECLARE @Count int;
    SELECT @Count = COUNT(*) FROM [Users];
    RETURN @Count;
END;
GO
