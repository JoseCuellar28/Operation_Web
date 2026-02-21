# F2 Geocerca + Salud - Ejecucion Manual (Staging Local)

Objetivo: validar Fase 2 en entorno local (`127.0.0.1`) sin tocar produccion.

## 0) Precondiciones

1. API local levantada en `http://127.0.0.1:5135`.
2. Frontend local levantado en `http://127.0.0.1:5173`.
3. F1 ya en estado `GO`.
4. Base de datos accesible en SSMS.

## 1) Aplicar SQL F2 (SSMS)

Ejecutar completo:

`database/scripts/06_SGO_F2_GEOFENCE_HEALTH.sql`

## 2) Crear una zona de prueba y asignar colaborador

Ejecutar en SSMS (ajusta DNI si usas otro usuario):

```sql
USE Opera_Main;
GO

DECLARE @dni VARCHAR(80) = '41007510';
DECLARE @idColaborador INT = (SELECT TOP 1 id FROM dbo.COLABORADORES WHERE dni = @dni);

IF @idColaborador IS NULL
    THROW 50001, 'No existe colaborador para DNI de prueba', 1;

DECLARE @idZona INT;

SELECT TOP 1 @idZona = id_zona
FROM dbo.Zonas_Trabajo
WHERE nombre_zona = 'ZONA_TEST_SGO'
ORDER BY id_zona DESC;

IF @idZona IS NULL
BEGIN
    INSERT INTO dbo.Zonas_Trabajo(nombre_zona, latitud_centro, longitud_centro, radio_metros, activo)
    VALUES ('ZONA_TEST_SGO', -12.046374, -77.042793, 500, 1);
    SET @idZona = SCOPE_IDENTITY();
END

UPDATE dbo.COLABORADORES
SET id_zona = @idZona
WHERE id = @idColaborador;

SELECT id, dni, id_zona FROM dbo.COLABORADORES WHERE id = @idColaborador;
SELECT id_zona, nombre_zona, latitud_centro, longitud_centro, radio_metros, activo
FROM dbo.Zonas_Trabajo WHERE id_zona = @idZona;
```

## 3) Obtener token web (local)

En terminal macOS:

```bash
BASE="http://127.0.0.1:5135/api/v1/auth"
USER_DNI="41007510"
PASS="123456"

CJSON=$(curl -s "$BASE/captcha")
CID=$(echo "$CJSON" | sed -E 's/.*"id":"([^"]+)".*/\1/')
Q=$(echo "$CJSON" | sed -E 's/.*"question":"([^"]+)".*/\1/')
A=$(echo "$Q" | awk -F'+' '{gsub(/ /,"",$1); gsub(/ /,"",$2); print $1+$2}')

RESP=$(curl -s -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_DNI\",\"password\":\"$PASS\",\"captchaId\":\"$CID\",\"captchaAnswer\":\"$A\",\"platform\":\"web\"}" \
  "$BASE/login")

TOKEN=$(echo "$RESP" | sed -E 's/.*"token":"([^"]+)".*/\1/')
echo "$TOKEN"
```

## 4) Prueba F2-A (salud NO apto bloquea)

```bash
curl -s -i \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":-12.046374,"longitude":-77.042793,"address":"Zona Test","health_status":"no_apto"}' \
  "http://127.0.0.1:5135/api/v1/attendance/checkin"
```

Esperado:
- `HTTP 403`
- body con `code: ERR_HEALTH_NOT_FIT`

## 5) Prueba F2-B (salud apto + dentro de geocerca)

```bash
curl -s -i \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":-12.046374,"longitude":-77.042793,"address":"Zona Test","health_status":"saludable"}' \
  "http://127.0.0.1:5135/api/v1/attendance/checkin"
```

Esperado:
- `HTTP 200`
- `status: presente` o `tardanza`

Validar en SQL:

```sql
USE Opera_Main;
GO
SELECT TOP 5 id_registro, id_colaborador, fecha_asistencia, alert_status, check_salud_apto
FROM dbo.ASISTENCIA_DIARIA
ORDER BY hora_checkin DESC;
```

Esperado:
- `alert_status = NULL` (dentro de radio)

## 6) Prueba F2-C (salud apto + fuera de geocerca => pending)

Nota: ejecutar con otro usuario o en otro dia para evitar "Ya marcaste asistencia".

```bash
curl -s -i \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":-12.120000,"longitude":-77.200000,"address":"Fuera de zona","health_status":"saludable"}' \
  "http://127.0.0.1:5135/api/v1/attendance/checkin"
```

Esperado:
- `HTTP 200`
- asistencia creada con `alert_status = pending`

Validar en SQL:

```sql
USE Opera_Main;
GO
SELECT TOP 5 id_registro, id_colaborador, fecha_asistencia, lat_checkin, long_checkin, alert_status
FROM dbo.ASISTENCIA_DIARIA
ORDER BY hora_checkin DESC;
```

## 7) Evidencia obligatoria de cierre F2

Guardar en `deployment_evidence/F2_GEOFENCE_HEALTH_GO_YYYY-MM-DD.md`:

1. Output SQL de creación/validación de tablas F2.
2. Salida HTTP de pruebas A/B/C.
3. Evidencia SQL de `Estado_Salud` y `ASISTENCIA_DIARIA` (con `alert_status`).
4. Estado final: `GO` o `NO-GO`.
