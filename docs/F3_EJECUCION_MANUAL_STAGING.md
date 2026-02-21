# F3 Sincronizacion Personal -> Colaboradores (Trigger) - Ejecucion Manual

Objetivo: activar sincronizacion automatica por trigger sin tocar produccion.

## 1) Aplicar script F3

En SSMS, ejecutar:

`/Users/josearbildocuellar/Github/Operation_Web-1/database/scripts/07_SGO_F3_SYNC_TRIGGER_PERSONAL_COLABORADORES.sql`

## 2) Prueba de insercion

```sql
USE DB_Operation;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Personal WHERE DNI = 'F3TEST001')
BEGIN
    INSERT INTO dbo.Personal (DNI, Inspector, Telefono, Tipo, Estado, FechaCreacion, FechaModificacion)
    VALUES ('F3TEST001', 'F3 Test Insert', '999999999', 'OPERARIO', 'ACTIVO', GETDATE(), GETDATE());
END
ELSE
BEGIN
    UPDATE dbo.Personal
    SET Inspector = 'F3 Test Insert',
        Telefono = '999999999',
        Tipo = 'OPERARIO',
        Estado = 'ACTIVO',
        FechaModificacion = GETDATE()
    WHERE DNI = 'F3TEST001';
END
GO

SELECT TOP 1 id, dni, nombre, phone, rol, active, updated_at
FROM Opera_Main.dbo.COLABORADORES
WHERE dni = 'F3TEST001';
```

Esperado:
- existe fila en `Opera_Main.dbo.COLABORADORES` con `dni='F3TEST001'`
- `active = 1`

## 3) Prueba de update

```sql
USE DB_Operation;
GO

UPDATE dbo.Personal
SET Inspector = 'F3 Test Update',
    Telefono = '111111111',
    Tipo = 'SUPERVISOR',
    FechaModificacion = GETDATE()
WHERE DNI = 'F3TEST001';
GO

SELECT TOP 1 id, dni, nombre, phone, rol, active, updated_at
FROM Opera_Main.dbo.COLABORADORES
WHERE dni = 'F3TEST001';
```

Esperado:
- `nombre = F3 Test Update`
- `phone = 111111111`
- `rol = SUPERVISOR`

## 4) Prueba de soft-delete (desactivacion)

```sql
USE DB_Operation;
GO

DELETE FROM dbo.Personal
WHERE DNI = 'F3TEST001';
GO

SELECT TOP 1 id, dni, nombre, active, estado_operativo, updated_at
FROM Opera_Main.dbo.COLABORADORES
WHERE dni = 'F3TEST001';
```

Esperado:
- registro persiste en `COLABORADORES`
- `active = 0`
- `estado_operativo = 'inactivo'`

## 5) Criterio GO F3

1. Trigger creado y habilitado.
2. Insert sincroniza correctamente.
3. Update sincroniza correctamente.
4. Delete aplica desactivacion (no borrado fisico en destino).
5. Evidencia guardada en:
   `deployment_evidence/F3_SYNC_TRIGGER_GO_YYYY-MM-DD.md`
