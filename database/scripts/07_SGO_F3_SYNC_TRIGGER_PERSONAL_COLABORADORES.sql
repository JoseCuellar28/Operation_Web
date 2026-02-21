-- 07_SGO_F3_SYNC_TRIGGER_PERSONAL_COLABORADORES.sql
-- FASE 3: Sincronizacion automatica Personal -> COLABORADORES por Trigger
-- Entorno objetivo: STAGING/LOCAL (NO PRODUCCION)
--
-- Fuente:      [DB_Operation].[dbo].[Personal]
-- Destino:     [Opera_Main].[dbo].[COLABORADORES]
-- Modo delete: soft-delete (active = 0) en destino

SET NOCOUNT ON;
GO

IF DB_ID(N'DB_Operation') IS NULL
    THROW 50001, 'DB_Operation no existe en esta instancia.', 1;
IF DB_ID(N'Opera_Main') IS NULL
    THROW 50002, 'Opera_Main no existe en esta instancia.', 1;
GO

IF OBJECT_ID(N'[DB_Operation].[dbo].[Personal]', N'U') IS NULL
    THROW 50003, 'Tabla fuente DB_Operation.dbo.Personal no existe.', 1;
IF OBJECT_ID(N'[Opera_Main].[dbo].[COLABORADORES]', N'U') IS NULL
    THROW 50004, 'Tabla destino Opera_Main.dbo.COLABORADORES no existe.', 1;
GO

USE [DB_Operation];
GO

-- 1) SP de sincronizacion por lotes (reutilizable para trigger y backfill)
CREATE OR ALTER PROCEDURE dbo.sp_sgo_sync_personal_to_colaboradores
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH src AS
    (
        SELECT
            p.DNI,
            COALESCE(NULLIF(LTRIM(RTRIM(p.Inspector)), ''), p.DNI) AS Nombre,
            p.Telefono,
            p.Tipo,
            p.FotoUrl,
            p.FechaCreacion,
            p.FechaModificacion,
            p.Email,
            CASE 
                WHEN UPPER(ISNULL(p.Estado, '')) IN ('ACTIVO','ACTIVA','1','TRUE') THEN CAST(1 AS bit)
                ELSE CAST(0 AS bit)
            END AS ActiveBit
        FROM dbo.Personal p
        WHERE p.DNI IS NOT NULL
          AND LTRIM(RTRIM(p.DNI)) <> ''
    )
    MERGE [Opera_Main].[dbo].[COLABORADORES] AS tgt
    USING src
      ON tgt.dni = src.DNI
    WHEN MATCHED THEN
        UPDATE SET
            tgt.nombre = src.Nombre,
            tgt.phone = src.Telefono,
            tgt.rol = src.Tipo,
            tgt.photo_url = src.FotoUrl,
            tgt.active = src.ActiveBit,
            tgt.updated_at = GETDATE(),
            tgt.estado_operativo = CASE WHEN src.ActiveBit = 1 THEN ISNULL(tgt.estado_operativo, 'activo') ELSE 'inactivo' END
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (dni, nombre, phone, rol, photo_url, active, created_at, updated_at, estado_operativo)
        VALUES (src.DNI, src.Nombre, src.Telefono, src.Tipo, src.FotoUrl, src.ActiveBit, ISNULL(src.FechaCreacion, GETDATE()), GETDATE(),
                CASE WHEN src.ActiveBit = 1 THEN 'activo' ELSE 'inactivo' END)
    WHEN NOT MATCHED BY SOURCE THEN
        UPDATE SET
            tgt.active = 0,
            tgt.estado_operativo = 'inactivo',
            tgt.updated_at = GETDATE();
END;
GO

-- 2) Trigger de sincronizacion en cambios de Personal
CREATE OR ALTER TRIGGER dbo.trg_sgo_sync_personal_to_colaboradores
ON dbo.Personal
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        EXEC dbo.sp_sgo_sync_personal_to_colaboradores;
    END TRY
    BEGIN CATCH
        DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
        -- Elevar error controlado para que quede evidencia en logs
        RAISERROR('trg_sgo_sync_personal_to_colaboradores fallo: %s', 16, 1, @Err);
    END CATCH
END;
GO

-- 3) Backfill inicial para alinear historico
EXEC dbo.sp_sgo_sync_personal_to_colaboradores;
GO

-- 4) Verificacion rapida
SELECT TOP 1 name AS TriggerName, is_disabled
FROM sys.triggers
WHERE name = 'trg_sgo_sync_personal_to_colaboradores';

SELECT TOP 20 p.DNI, p.Inspector, c.id, c.dni, c.nombre, c.active, c.updated_at
FROM [DB_Operation].[dbo].[Personal] p
LEFT JOIN [Opera_Main].[dbo].[COLABORADORES] c
  ON c.dni = p.DNI
ORDER BY c.updated_at DESC;
GO
