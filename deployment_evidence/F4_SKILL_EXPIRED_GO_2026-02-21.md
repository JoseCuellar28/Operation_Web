# F4 Certificaciones + bloqueo por skill vencido - GO

Fecha: 2026-02-21  
Entorno: `DEV_LOCAL` (`API: http://127.0.0.1:5135`)

## Resultado de pruebas

### Caso A - Certificacion vigente
- Request: `POST /api/v1/attendance/checkin`
- Body: `{"latitude":-12.046374,"longitude":-77.042793,"address":"F4 vigente","health_status":"saludable"}`
- Resultado:
  - `HTTP/1.1 200 OK`
  - Response: `{"message":"Asistencia registrada correctamente","status":"tardanza"}`

### Caso B - Certificacion vencida
- Request: `POST /api/v1/attendance/checkin`
- Body: `{"latitude":-12.046374,"longitude":-77.042793,"address":"F4 vencida","health_status":"saludable"}`
- Resultado final validado:
  - `HTTP/1.1 403 Forbidden`
  - Response: `{"code":"ERR_SKILL_EXPIRED","message":"Colaborador con certificacion vencida."}`

## Observacion de prueba
- Se presento un `HTTP 400` intermedio por regla de unicidad diaria de asistencia (`Ya marcaste asistencia el dia de hoy`).
- Tras limpiar el registro del dia y reintentar el caso B, se obtuvo el resultado bloqueante esperado (`ERR_SKILL_EXPIRED`).

## Dictamen F4
- Estado: `GO`
- Criterio cumplido: el backend bloquea en runtime check-in cuando existe certificacion vencida.
