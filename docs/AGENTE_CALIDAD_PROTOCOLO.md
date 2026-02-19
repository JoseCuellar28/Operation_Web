# Protocolo Operativo - Agente Calidad (Web)

## 1. Objetivo
Estandarizar lo que el Agente Calidad debe revisar y reportar para que el Auditor pueda validar estado tecnico sin ambiguedad.

## 2. Alcance del Agente Calidad
El Agente Calidad:
1. Revisa codigo y documentacion del proyecto Web.
2. Ejecuta validaciones locales no destructivas.
3. Entrega evidencia estructurada al Auditor.

El Agente Calidad NO:
1. Opera produccion directamente.
2. Ejecuta cambios en servidor Windows sin instruccion explicita.
3. Mezcla tareas de APK o infraestructura fuera de su alcance.

## 3. Entrega obligatoria en cada ciclo
Cada reporte del Agente Calidad debe incluir SIEMPRE:
1. Estado Git:
   - branch
   - commit hash actual
   - salida de `git status --short`
2. Cambios relevantes:
   - lista de archivos tocados
   - resumen de impacto por archivo (1 linea por archivo)
3. Verificacion funcional:
   - endpoints/rutas verificadas
   - resultado esperado vs resultado real
4. Riesgos abiertos:
   - bloqueantes
   - no bloqueantes
5. Recomendacion de accion:
   - siguiente paso concreto (1-3 pasos maximo)

## 4. Comandos base de recoleccion (Mac local)
Ejecutar en raiz del repo:

```bash
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git status --short
git log --oneline -n 10
```

Validaciones de frontend:

```bash
cd OperationWeb.Frontend
npm run build
```

Busqueda de rutas sensibles:

```bash
rg -n "fetch\\('/api/v1|fetch\\(\"/api/v1|/api/auth/captcha|/api/v1/auth/captcha|VITE_API_URL|withCredentials" OperationWeb.Frontend/src OperationWeb.API docs
```

## 5. Formato obligatorio del reporte
Usar exactamente este esquema:

```txt
[AGENTE CALIDAD - REPORTE]
Fecha:
Owner:

1) Estado Git
- Branch:
- HEAD:
- Working tree:

2) Cambios detectados
- archivo: impacto

3) Verificaciones
- check: resultado

4) Riesgos
- severidad: descripcion

5) Recomendacion
- paso 1
- paso 2
```

## 6. Criterios de aceptacion del reporte (Auditoria)
Un reporte se considera util solo si:
1. Incluye hash exacto (no solo hash corto).
2. Distingue claramente:
   - problema funcional,
   - problema de infraestructura,
   - problema de datos/configuracion.
3. Incluye evidencia reproducible (comando + salida resumida).
4. No mezcla opiniones con hechos no verificados.

## 7. Matriz de clasificacion rapida de incidentes
1. `404` en ruta legacy `/api/auth/...` -> esperado por hardening.
2. `404` en rutas no implementadas (`/api/v1/quality/*`, `/api/v1/analytics/*`) -> gap funcional backend.
3. `500` con SQL `18456` -> error de credenciales/DB.
4. `ERR_NAME_NOT_RESOLVED`, `1033`, `502` intermitente -> tunel o servicio no activo.
5. `Unexpected token '<'` en frontend -> respuesta HTML en ruta que esperaba JSON (baseURL/ruta incorrecta).

## 8. Handoff al Auditor
Antes de cerrar ciclo, el Agente Calidad debe entregar:
1. Hash final sugerido para despliegue.
2. Lista de riesgos residuales.
3. Bloque de comandos recomendados para el Agente Servidor (PowerShell).
4. Confirmacion explicita de que el reporte esta listo para auditoria.

## 9. Integracion con Agente APK (obligatorio por despliegue)
En cada implementacion que impacte autenticacion, red o endpoints:
1. El Agente Calidad debe ejecutar y reportar el checklist de `docs/CHECKLIST_VALIDACION_APK.md`.
2. Debe entregar al Agente APK la Backend URL vigente y validar que NO use URL de frontend.
3. Debe adjuntar evidencia de login APK exitoso o error exacto para triage.
