-- 08_SGO_F4_CERTIFICACIONES.sql
-- FASE 4: Certificaciones + bloqueo por skill vencido
-- Entorno: STAGING/LOCAL (NO PRODUCCION)

USE [Opera_Main];
GO

IF OBJECT_ID('dbo.Certificaciones_Personal', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Certificaciones_Personal
    (
        id_cert INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_colaborador INT NOT NULL,
        tipo_curso NVARCHAR(150) NOT NULL,
        fecha_vencimiento DATE NOT NULL,
        estado_vigencia NVARCHAR(30) NOT NULL
    );
    PRINT 'Tabla Certificaciones_Personal creada.';
END
ELSE
BEGIN
    PRINT 'Tabla Certificaciones_Personal ya existe.';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_CertificacionesPersonal_Colaboradores'
)
BEGIN
    ALTER TABLE dbo.Certificaciones_Personal
    ADD CONSTRAINT FK_CertificacionesPersonal_Colaboradores
        FOREIGN KEY (id_colaborador) REFERENCES dbo.COLABORADORES(id);
    PRINT 'FK_CertificacionesPersonal_Colaboradores creada.';
END
ELSE
BEGIN
    PRINT 'FK_CertificacionesPersonal_Colaboradores ya existe.';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_CertificacionesPersonal_ColaboradorVencimiento'
      AND object_id = OBJECT_ID('dbo.Certificaciones_Personal')
)
BEGIN
    CREATE INDEX IX_CertificacionesPersonal_ColaboradorVencimiento
    ON dbo.Certificaciones_Personal(id_colaborador, fecha_vencimiento DESC);
    PRINT 'Indice IX_CertificacionesPersonal_ColaboradorVencimiento creado.';
END
ELSE
BEGIN
    PRINT 'Indice IX_CertificacionesPersonal_ColaboradorVencimiento ya existe.';
END
GO

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'Certificaciones_Personal';
GO
