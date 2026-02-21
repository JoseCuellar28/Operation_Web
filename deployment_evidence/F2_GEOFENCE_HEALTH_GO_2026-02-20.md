# F2 Geocerca + Salud - GO

Fecha cierre: 2026-02-20 21:08:45 -0500  
Entorno: Local/Staging (`127.0.0.1`)  
API: `http://127.0.0.1:5135`

## 1) Evidencia runtime API

### Caso A - Salud no apto bloquea
- Request: `POST /api/v1/attendance/checkin`
- Body: `health_status = "no_apto"`
- Resultado: `HTTP 403`
- Body: `{"code":"ERR_HEALTH_NOT_FIT","message":"Usuario no apto para iniciar operaciones."}`

### Caso B - Saludable + dentro de zona
- Request: `POST /api/v1/attendance/checkin`
- Body: `lat=-12.046374`, `lng=-77.042793`, `health_status="saludable"`
- Resultado: `HTTP 200`
- Body: `{"message":"Asistencia registrada correctamente","status":"tardanza"}`

### Caso C - Saludable + fuera de zona
- Request: `POST /api/v1/attendance/checkin`
- Body: `lat=-12.120000`, `lng=-77.200000`, `health_status="saludable"`
- Resultado: `HTTP 200`
- Body: `{"message":"Asistencia registrada correctamente","status":"tardanza"}`

## 2) Evidencia SQL

Consulta:

```sql
SELECT TOP 1 id_registro, check_salud_apto, alert_status, lat_checkin, long_checkin
FROM dbo.ASISTENCIA_DIARIA
ORDER BY hora_checkin DESC;
```

Resultado:
- `check_salud_apto = 1`
- `alert_status = pending`
- coordenadas registradas fuera de zona

## 3) Dictamen

F2 `GO`:
- Bloqueo de salud no apto aplicado (403).
- Persistencia de asistencia saludable correcta.
- Detección de geocerca aplicada (`alert_status = pending` fuera de radio).
