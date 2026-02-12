# Runbook: Diagnostico y Cierre de Incidente Captcha (Produccion)

## Objetivo
Cerrar fallos de captcha causados por desalineacion entre:

1. URL backend publicada por `cloudflared`.
2. URL inyectada en `docker-compose.prod.yml` (`VITE_API_URL`).
3. URL compilada dentro del bundle frontend.
4. Respuesta real de `/api/v1/auth/captcha` y cabeceras CORS.

## Alcance

- No modifica contratos API.
- No cambia rutas (`/api/v1/...` se mantiene).
- No cambia payload de captcha.
- Se enfoca en diagnostico y correccion operativa del despliegue.

## Pre-requisitos (Windows Server)

1. Ejecutar en la raiz del repositorio.
2. Tener `cloudflared.exe`, `docker`, `docker compose` y PowerShell disponibles.
3. Permisos para reiniciar contenedores y procesos `cloudflared`.

## Ejecucion (One-click)

```powershell
powershell -ExecutionPolicy Bypass -File .\start_operation_smart.ps1
```

## Modos operativos (importante)

1. **Modo A (Automatizado Docker - recomendado):**
   - Usa `start_operation_smart.ps1`.
   - Frontend servido por contenedor Docker en `5173`.
   - Túneles backend/frontend levantados por el script.
2. **Modo B (Manual de contingencia):**
   - Se usa cuando se opera sin frontend Docker y se publica `dist` con `npx serve`.
   - Frontend en puerto fijo `54416` + túnel separado.
3. **No mezclar modos en la misma sesión.**
   - Si se usa Modo A, no dejar `npx serve` corriendo.
   - Si se usa Modo B, no asumir que el túnel frontend apunta a `5173`.

## Que valida automaticamente el script

1. Reinicia stack Docker y procesos de tunel.
2. Captura URL backend activa (`*.trycloudflare.com`).
3. Inyecta backend URL en `docker-compose.prod.yml` (build args + env) y verifica.
4. Fuerza `build --no-cache` y `up -d`.
5. Captura URL frontend activa.
6. Inspecciona el bundle del frontend en contenedor:
   - Debe contener exactamente una URL `trycloudflare`.
   - Debe ser la URL backend activa.
7. Ejecuta pruebas HTTP:
   - `GET /api/v1/auth/captcha` => `200` + JSON valido.
   - CORS con `Origin: <frontend-url>` => `Access-Control-Allow-Origin` exacto + `Access-Control-Allow-Credentials: true`.
   - `GET /api/auth/captcha` => `404` (hardening legacy).
8. Genera evidencia auditada en `deployment_evidence/captcha_closure_<timestamp>.txt`.

## Criterios de aceptacion

1. El script termina con `INCIDENT CLOSURE CHECKLIST COMPLETED`.
2. Captcha endpoint responde `200` en `/api/v1/auth/captcha`.
3. CORS refleja el origen frontend real (sin wildcard).
4. Ruta legacy `/api/auth/captcha` devuelve `404`.
5. Archivo de evidencia contiene:
   - Backend URL activa.
   - Frontend URL activa.
   - Resultado de pruebas CORS/captcha/hardening.
   - Estado de contenedores.

## Pruebas manuales post-ejecucion

1. Abrir `https://<frontend-url>/login`.
2. Hacer hard refresh (`Ctrl+F5`).
3. Verificar en consola:
   - `Connection BaseURL` apunta a la URL backend activa.
   - No hay `ERR_NAME_NOT_RESOLVED`.
4. Confirmar que el captcha carga correctamente.

## Troubleshooting rapido

1. No captura URL backend/frontend:
   - Revisar logs `backend_tunnel.out.log`, `backend_tunnel.err.log`, `frontend_tunnel.out.log`, `frontend_tunnel.err.log`.
   - Verificar que `cloudflared.exe` exista en PATH o ruta local.
2. Bundle contiene URL vieja:
   - Repetir `build --no-cache`.
   - Confirmar que compose fue inyectado antes del build.
3. CORS no refleja origen:
   - Verificar que backend desplegado corresponde al codigo actual.
   - Revisar `Program.cs` y logs del backend en contenedor.
