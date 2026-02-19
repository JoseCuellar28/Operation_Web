# Checklist Servidor Post-Deploy (Windows + Docker + Cloudflare)

## 1. Objetivo
Validar que el despliegue quede operativo y estable antes de abrir acceso a usuarios.

## 2. Pre-check
1. [ ] Estar en `C:\Apps\Operation_Web`.
2. [ ] Docker daemon activo.
3. [ ] Variables reales definidas (sin placeholders):
   - `DB_CONNECTION_STRING`
   - `JWT_SECRET_KEY`

## 3. Estado de contenedores
1. [ ] `docker compose -f .\docker-compose.prod.yml ps` muestra `operation_backend` y `operation_frontend` en `Up`.
2. [ ] API local responde:
   - `curl.exe -i http://127.0.0.1:5132/health` => `200`.
3. [ ] Frontend local responde:
   - `curl.exe -i http://127.0.0.1:5173` => `200`.

## 4. Tuneles Cloudflare
1. [ ] Hay 2 procesos `cloudflared` activos (backend + frontend).
2. [ ] Backend tunnel URL capturada de logs.
3. [ ] Frontend tunnel URL capturada de logs.
4. [ ] Ninguna URL de pruebas anteriores (expirada) esta siendo reutilizada.

## 5. Validacion de rutas criticas
Usar backend URL vigente:
1. [ ] `GET /health` => `200`.
2. [ ] `GET /api/v1/auth/captcha` => `200`.
3. [ ] `GET /api/auth/captcha` => `404` (hardening esperado).
4. [ ] `POST /api/v1/auth/login` con captcha nuevo => `200` (o error funcional explicito, no `500`).

## 6. Validacion CORS
Con frontend URL vigente como `Origin`:
1. [ ] `Access-Control-Allow-Origin` refleja exactamente el frontend.
2. [ ] `Access-Control-Allow-Credentials: true`.

## 7. Validacion de bundle frontend
1. [ ] El bundle JS del frontend contiene solo la backend URL vigente.
2. [ ] No contiene dominios `.trycloudflare.com` antiguos.

## 8. Validacion funcional final
1. [ ] Login web exitoso con captcha real.
2. [ ] Modulo de asistencia carga datos sin errores de parseo JSON.
3. [ ] APK (si aplica en la jornada) validado segun `docs/CHECKLIST_VALIDACION_APK.md`.

## 9. Evidencia minima obligatoria
Guardar en reporte de cierre:
1. [ ] Timestamp.
2. [ ] Backend URL final.
3. [ ] Frontend URL final.
4. [ ] Salida resumida de:
   - `/health`
   - `/api/v1/auth/captcha`
   - `/api/auth/captcha`
5. [ ] Resultado login web.
6. [ ] Resultado APK (si se valido).

## 10. Criterio de cierre
Solo cerrar despliegue si:
1. [ ] No hay `ERR_NAME_NOT_RESOLVED`.
2. [ ] No hay `500` en login por DB/config.
3. [ ] Captcha funciona en web y, si aplica, en APK.
