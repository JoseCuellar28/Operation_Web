# F4 Certificaciones + bloqueo skill vencido (Manual)

## 1) Aplicar SQL

Ejecutar en SSMS:

`/Users/josearbildocuellar/Github/Operation_Web-1/database/scripts/08_SGO_F4_CERTIFICACIONES.sql`

## 2) Preparar datos de prueba

```sql
USE Opera_Main;
GO

DECLARE @dni VARCHAR(80)='41007510';
DECLARE @idColaborador INT=(SELECT TOP 1 id FROM dbo.COLABORADORES WHERE dni=@dni);

IF @idColaborador IS NULL
    THROW 50001, 'No existe colaborador para DNI de prueba', 1;

-- limpia certificaciones de prueba
DELETE FROM dbo.Certificaciones_Personal
WHERE id_colaborador=@idColaborador
  AND tipo_curso IN ('F4_CERT_OK','F4_CERT_VENCIDA');

-- vigente
INSERT INTO dbo.Certificaciones_Personal(id_colaborador,tipo_curso,fecha_vencimiento,estado_vigencia)
VALUES (@idColaborador,'F4_CERT_OK', DATEADD(DAY,30,CAST(GETDATE() AS date)),'vigente');

SELECT TOP 10 * FROM dbo.Certificaciones_Personal
WHERE id_colaborador=@idColaborador
ORDER BY id_cert DESC;
```

## 3) Prueba A: con certificacion vigente debe permitir checkin

Usar `POST /api/v1/attendance/checkin` con token valido.

Esperado:
- `HTTP 200` (si no hay otros bloqueos)

## 4) Prueba B: insertar certificacion vencida y bloquear

```sql
USE Opera_Main;
GO
DECLARE @dni VARCHAR(80)='41007510';
DECLARE @idColaborador INT=(SELECT TOP 1 id FROM dbo.COLABORADORES WHERE dni=@dni);

INSERT INTO dbo.Certificaciones_Personal(id_colaborador,tipo_curso,fecha_vencimiento,estado_vigencia)
VALUES (@idColaborador,'F4_CERT_VENCIDA', DATEADD(DAY,-10,CAST(GETDATE() AS date)),'vencido');
```

Repetir checkin.

Esperado:
- `HTTP 403`
- `code = ERR_SKILL_EXPIRED`

## 5) Cierre F4

Guardar evidencia en:
`deployment_evidence/F4_SKILL_EXPIRED_GO_YYYY-MM-DD.md`
