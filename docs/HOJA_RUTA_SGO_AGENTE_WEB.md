# Hoja de Ruta Oficial - Implementacion SGO (Agente Web + Auditoria)

## 1. Proposito
Definir una ruta de ejecucion estricta para implementar los "candados logicos" SGO sin romper operacion actual, evitando supuestos, retrabajo y retrasos.

## 2. Alcance
Este documento aplica a:
1. `Operation_Web-1` (Web/API/DB en servidor).
2. Integracion con APK solo despues de cerrar fase Web correspondiente.

No aplica a:
1. Cambios directos en produccion sin pasar por entorno de pruebas.
2. Desarrollo paralelo no aprobado por fase.

## 3. Regla de Oro
No se avanza a la fase siguiente sin evidencia completa de la fase actual.

## 4. Roles y responsabilidades
1. Agente Web (ejecucion):
   - Implementa DB/API/Frontend segun fase.
   - Entrega evidencia tecnica reproducible.
2. Auditor (validacion):
   - Valida cumplimiento de criterios GO/NO-GO.
   - Bloquea avance si falta evidencia o hay riesgos P0 abiertos.
3. Agente APK (integracion):
   - Entra solo cuando Web indique "Ready for APK" por fase.

## 5. Entornos obligatorios
1. `DEV_LOCAL`: desarrollo y pruebas unitarias.
2. `STAGING_SERVER`: despliegue integrado de pruebas.
3. `PROD`: solo despues de aprobacion formal.

Politica:
1. Ningun cambio de fase se valida solo en codigo.
2. Toda fase requiere prueba runtime en `STAGING_SERVER`.

## 6. Fases oficiales

---

## Fase 0 - Baseline y congelamiento
### Objetivo
Congelar el estado actual para evitar regressiones.

### Tareas
1. Registrar commit base y estado de ramas.
2. Confirmar endpoints criticos actuales:
   - `GET /health`
   - `GET /api/v1/auth/captcha`
   - `POST /api/v1/auth/login`
3. Guardar evidencia inicial en `deployment_evidence/`.

### Criterio GO
1. Baseline documentado y reproducible.

### Criterio NO-GO
1. No existe evidencia inicial.

---

## Fase 1 (P0) - Candado de Dispositivo (Bloqueante)
### Objetivo
Eliminar suplantacion de identidad por dispositivo no autorizado.

### Entregables tecnicos
1. DB:
   - Crear tabla `Dispositivos_Vinculados`.
   - Extender `COLABORADORES` con `device_id_vinculado` e `id_vehiculo_asignado` (si aplica).
2. API:
   - Extender `LoginRequest` con `DeviceId`.
   - En `/api/v1/auth/login`, validar `DeviceId` contra `Dispositivos_Vinculados`.
   - Error estandar: `ERR_AUTH_DEVICE`.
3. Documentacion:
   - Contrato actualizado de request/response.

### Pruebas obligatorias
1. Login con device autorizado -> `200`.
2. Login con device no autorizado -> `401/403` + `ERR_AUTH_DEVICE`.
3. Login sin `DeviceId` -> `400` valido de contrato.

### Evidencia minima
1. Script SQL aplicado.
2. Diff de API.
3. Tres pruebas HTTP con status + body.

### Criterio GO
1. No existe ruta de login que emita token a device no autorizado.

### Criterio NO-GO
1. Token emitido sin validar `DeviceId`.

---

## Fase 2 (P1) - Geocerca y Fit-to-Work
### Objetivo
Convertir check-in en validador bloqueante de campo.

### Entregables tecnicos
1. DB:
   - Crear tabla `Zonas_Trabajo`.
   - Crear tabla `Estado_Salud` (historica).
2. API/Business:
   - En `CheckIn`, calcular distancia a zona asignada.
   - Si distancia > radio, setear `alert_status = pending`.
   - Si salud = no apto, bloquear operaciones y notificar.
3. Contratos:
   - Definir codigos de error para geocerca y salud.

### Pruebas obligatorias
1. Check-in dentro de zona -> estado normal.
2. Check-in fuera de zona -> `pending`.
3. Check-in no apto salud -> bloqueo operativo.

### Evidencia minima
1. Pruebas con coordenadas controladas.
2. Registro persistido en DB con estados esperados.
3. Log/evento de bloqueo por salud.

### Criterio GO
1. Geocerca y salud afectan decision operativa en runtime.

### Criterio NO-GO
1. Sistema sigue aceptando check-in sin marcar `pending` fuera de zona.

---

## Fase 3 (P1/P2) - Charla diaria y Trigger Operativo
### Objetivo
Agregar llave de paso operacional previo a trabajo en campo.

### Entregables tecnicos
1. DB:
   - Crear tabla `Charla_Diaria`.
2. API:
   - Crear `POST /api/v1/hseq/charla-seguridad`.
   - Manejar apertura/cierre de charla.
3. Señal operativa:
   - Al cerrar charla (`hora_cierre`), emitir evento de desbloqueo (SignalR o equivalente).

### Pruebas obligatorias
1. Usuario en estado espera antes de cierre.
2. Usuario habilitado despues de cierre.

### Criterio GO
1. Transicion de estado comprobada por evento runtime.

### Criterio NO-GO
1. No existe cambio de estado verificable.

---

## Fase 4 (P2) - Certificaciones y restriccion por skill
### Objetivo
Bloquear asignacion/operacion de tecnicos con certificacion vencida.

### Entregables tecnicos
1. DB:
   - Crear `Certificaciones_Personal`.
2. API:
   - Validar vigencia antes de asignaciones/rutas.
   - Error estandar `ERR_SKILL_EXPIRED`.

### Pruebas obligatorias
1. Tecnico con curso vigente -> permitido.
2. Tecnico con curso vencido -> bloqueado con `ERR_SKILL_EXPIRED`.

### Criterio GO
1. Bloqueo por skill se cumple en runtime.

### Criterio NO-GO
1. Sistema permite asignacion con skill vencido.

---

## Fase 5 - Dashboard SGO y Auditoria visual
### Objetivo
Alinear visualizacion de mesa de control con estados SGO.

### Entregables tecnicos
1. Matriz de colores:
   - Verde: validado completo.
   - Ambar: en proceso.
   - Rojo: alerta critica.
   - Negro (si aplica por politica final): bloqueo severo.
2. ResolutionDrawer:
   - Mostrar `justificacion_geo` obligatoria.
   - Aprobar/Rechazar con impacto visible en estado final.
3. Auditoria:
   - Mostrar `selfie_url` y historial de cambios (audit trail).

### Pruebas obligatorias
1. Cada color/estado con caso de prueba concreto.
2. Transiciones de estado verificadas con evidencia.

### Criterio GO
1. Dashboard refleja estado real de negocio, no solo presentacion.

### Criterio NO-GO
1. Estado visual no coincide con estado persistido.

## 7. Reglas anti-deriva (obligatorias)
1. No implementar funcionalidades fuera de fase activa.
2. No cambiar contratos sin versionar documento de API.
3. No usar datos "mock" para declarar cierre de fase.
4. No cerrar fase con evidencia parcial o "simulada".
5. No usar rutas legacy (`/api/auth/*`) como referencia de cumplimiento.

## 8. Formato de reporte por fase (obligatorio)
```txt
[FASE X - REPORTE TECNICO]
Fecha:
Owner:
Entorno:
Commit:

1) Cambios implementados
- archivo:linea -> cambio

2) Pruebas ejecutadas
- caso:
  comando:
  esperado:
  obtenido:

3) Evidencia DB
- script aplicado:
- resultado:

4) Riesgos abiertos
- severidad:
- descripcion:
- mitigacion:

5) Dictamen
- GO / NO-GO
- motivo:
```

## 9. Checklists obligatorios por pase
1. APK: `docs/CHECKLIST_VALIDACION_APK.md`
2. Servidor: `docs/CHECKLIST_SERVIDOR_POST_DEPLOY.md`
3. F1 manual (sin agente): `docs/F1_EJECUCION_MANUAL_STAGING.md`

## 10. Cierre de jornada
Antes de terminar el dia:
1. Actualizar estado de fase en este documento.
2. Guardar evidencia en `deployment_evidence/`.
3. Registrar decision `GO/NO-GO`.
4. Publicar bloque "Siguiente paso exacto" (max 3 acciones).

## 11. Estado Actual de Ejecucion
1. Fase activa: `F1 - P0 Device Binding`.
2. Regla operativa: desde F1 toda entrega debe incluir mapeo tecnico + pruebas runtime, no solo cambios de codigo.
3. Entregable obligatorio para Agente Web:
   - `[FASE 1 - REPORTE AGENTE WEB]` con:
   - archivo:linea de cambios,
   - script SQL aplicado,
   - pruebas (comando/esperado/obtenido),
   - riesgos abiertos,
   - dictamen `GO/NO-GO`.
