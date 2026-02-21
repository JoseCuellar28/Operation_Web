# F3 Sincronizacion Personal -> Colaboradores (Trigger) - GO

Fecha cierre: 2026-02-20  
Entorno: Local/Staging (sin despliegue a produccion)

## Evidencia de validacion

### 1) Sync manual con SP
Comando:

```sql
EXEC dbo.sp_sgo_sync_personal_to_colaboradores;
SELECT TOP 1 id,dni,nombre,phone,rol,active,estado_operativo,updated_at
FROM Opera_Main.dbo.COLABORADORES
WHERE dni='F3TEST001';
```

Resultado:
- `dni = F3TEST001`
- `active = 1`
- `estado_operativo = activo`
- campos sincronizados (`nombre/phone/rol`)

### 2) Delete en origen (soft-delete en destino)
Comando:

```sql
DELETE FROM DB_Operation.dbo.Personal WHERE DNI='F3TEST001';
SELECT TOP 1 id,dni,active,estado_operativo,updated_at
FROM Opera_Main.dbo.COLABORADORES
WHERE dni='F3TEST001';
```

Resultado:
- registro permanece en `COLABORADORES`
- `active = 0`
- `estado_operativo = inactivo`

## Ajuste aplicado durante validacion

Se corrigio el `estado_operativo` para que en `MATCHED` refleje directamente:
- `activo` cuando `ActiveBit = 1`
- `inactivo` cuando `ActiveBit = 0`

## Dictamen

F3 `GO`:
- Trigger operativo.
- Insert/Update sincronizan correctamente.
- Delete aplica desactivacion logica (sin borrado fisico en destino).
