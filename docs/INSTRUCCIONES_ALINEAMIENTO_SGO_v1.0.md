# INSTRUCCIONES DE ALINEAMIENTO SGO (v1.0)

## 1) Objetivo
Implementar candados logicos SGO en Web/API por fases, con pruebas obligatorias y sin tocar produccion hasta cierre de validacion.

## 2) Alcance
1. Este plan aplica a `Operation_Web-1` (DB/API/Frontend).
2. El APK entra cuando la fase Web/API quede marcada como `Ready for APK`.
3. No se permite avanzar de fase sin evidencia GO.

## 3) Fases Oficiales

### F0 - Baseline (obligatorio)
1. Congelar estado actual y registrar evidencia:
   - `GET /health` = 200
   - `GET /api/v1/auth/captcha` = 200
   - `POST /api/v1/auth/login` (captcha real) = 200
2. Guardar evidencia con timestamp.

### F1 - P0 Device Binding (bloqueante)
1. DB:
   - Crear `Dispositivos_Vinculados`.
   - Extender `COLABORADORES` con `device_id_vinculado` e `id_zona`.
2. API:
   - Agregar `DeviceId` a login (`/api/v1/auth/login`) para `Platform=mobile`.
   - Validar contra `Dispositivos_Vinculados`.
   - Error obligatorio: `ERR_AUTH_DEVICE`.
3. Pruebas:
   - Device autorizado -> 200
   - Device no autorizado -> 401/403 + `ERR_AUTH_DEVICE`
   - Sin DeviceId -> 400

### F2 - P1 Geocerca + Salud
1. DB:
   - Crear `Zonas_Trabajo`.
   - Crear `Estado_Salud`.
2. API:
   - Validar distancia en check-in contra zona asignada.
   - Si distancia > 500m -> `alert_status = pending`.
   - Si salud = No Apto -> bloqueo operativo + evento/alerta SSOMA.
3. Pruebas:
   - Dentro zona -> normal
   - Fuera zona -> pending
   - No apto -> bloqueado

### F3 - P1 Charla Diaria (trigger operativo)
1. DB:
   - Crear `Charla_Diaria`.
2. API:
   - Crear `POST /api/v1/hseq/charla-seguridad`.
   - Al cerrar charla (`hora_cierre`), emitir desbloqueo (SignalR recomendado).
3. Pruebas:
   - Antes de cierre -> estado espera
   - Despues de cierre -> operativo

### F4 - P2 Certificaciones
1. DB:
   - Crear `Certificaciones_Personal`.
2. API:
   - Validar vigencia de cursos antes de despacho/asignacion.
   - Error obligatorio: `ERR_SKILL_EXPIRED`.
3. Pruebas:
   - Vigente -> permitido
   - Vencido -> bloqueado

### F5 - Dashboard y Auditoria
1. Frontend:
   - Matriz estados: Verde/Ambar/Rojo/Negro.
   - `ResolutionDrawer` con mapa + `justificacion_geo`.
   - Audit trail y `selfie_url`.
2. Pruebas:
   - Verificar transiciones visuales vs estado persistido.

## 4) Apartado del Agente Web (Ejecucion)
El Agente Web debe:
1. Implementar solo la fase activa.
2. Entregar por fase:
   - SQL aplicado (archivo/script).
   - Cambios API/Frontend (archivo:linea).
   - Evidencia runtime (comando + status + body resumido).
3. Reportar `GO/NO-GO` al cierre de cada fase.
4. No usar evidencia simulada para cerrar fase.
5. No mezclar codigo legacy/test como bloqueo de produccion.

Formato obligatorio del reporte del Agente Web:
```txt
[FASE X - REPORTE AGENTE WEB]
Fecha:
Commit:
Entorno:

1) Cambios
- archivo:linea -> cambio

2) SQL
- script:
- resultado:

3) Pruebas
- caso:
  comando:
  esperado:
  obtenido:

4) Riesgos
- severidad:
- descripcion:

5) Dictamen
- GO / NO-GO
```

## 5) Criterios de control (Auditoria)
1. GO si:
   - evidencia DB + API runtime completa,
   - sin P0 abierto en la fase.
2. NO-GO si:
   - falta evidencia,
   - falla prueba bloqueante,
   - hay desalineacion de contratos.

## 6) Regla de Produccion
1. Solo pasar a produccion cuando fases requeridas esten en GO.
2. Activar bloqueo `DeviceId` en produccion solo cuando APK confirme envio estable de `DeviceId`.

## 7) Estado de avance
1. F0 Baseline: `GO` (ver `deployment_evidence/F0_BASELINE_2026-02-19.md`).
2. Siguiente fase activa: `F1 - P0 Device Binding` en entorno de pruebas.
3. Estado actual F1: `IN PROGRESS` (implementacion tecnica iniciada; pendiente cierre con evidencia runtime).
4. Modo de ejecucion vigente: `MANUAL` (sin agente web).
5. Procedimiento oficial F1: `docs/F1_EJECUCION_MANUAL_STAGING.md`.

## 8) Instruccion de arranque F1 (Manual)
Desde este punto, F1 se ejecuta manualmente con mapeo tecnico y pruebas obligatorias.

Tareas obligatorias en F1:
1. Mapear e implementar:
   - DDL de `Dispositivos_Vinculados`.
   - Extension de `COLABORADORES` (`device_id_vinculado`, `id_zona`).
   - `DeviceId` en `LoginRequest`.
   - Validacion de `DeviceId` en `/api/v1/auth/login`.
   - Error estandar `ERR_AUTH_DEVICE`.
2. Ejecutar el runbook manual `docs/F1_EJECUCION_MANUAL_STAGING.md`.
3. Preparar entorno de pruebas (staging) con datos minimos.
4. Ejecutar pruebas obligatorias:
   - Login con `DeviceId` autorizado -> `200`.
   - Login con `DeviceId` no autorizado -> `401/403` + `ERR_AUTH_DEVICE`.
   - Login sin `DeviceId` -> `400`.
5. Entregar reporte oficial de fase:
   - `[FASE 1 - REPORTE TECNICO]`
   - cambios (archivo:linea)
   - SQL aplicado
   - comandos + esperado/obtenido
   - riesgos
   - dictamen `GO/NO-GO`.

Regla:
No avanzar a F2 sin `GO` formal de F1 con evidencia runtime.
