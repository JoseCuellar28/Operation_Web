# Cierre de Alineacion Web + API + APK

## Fecha
2026-02-17

## Estado final
1. Web y API operativas en servidor Windows con Docker.
2. Captcha web operativo en ruta auditada `GET /api/v1/auth/captcha`.
3. Hardening legacy confirmado (`GET /api/auth/captcha` responde `404`).
4. APK alineado a rutas v1 y con captcha real (sin bypass `9999`).
5. Login movil exitoso y marcacion de asistencia validada en dispositivo.

## Correcciones aplicadas
### Web/API (servidor)
1. Re-alineacion de tuneles Cloudflare (frontend y backend).
2. Verificaciones de salud y CORS sobre backend vigente.
3. Confirmacion de uso exclusivo de rutas `/api/v1/*` para auth.

### APK (`Operation-APK`)
1. Endpoint login migrado a `POST /api/v1/auth/login`.
2. Endpoint captcha agregado: `GET /api/v1/auth/captcha`.
3. Modelo login actualizado con `CaptchaId` y `CaptchaAnswer`.
4. Eliminado bypass `captchaAnswer = "9999"`.
5. `BASE_URL` movida a `BuildConfig.API_BASE_URL` (ya no hardcoded).
6. Login UI actualizado para:
   - cargar captcha real,
   - recargar captcha,
   - enviar captcha real en login.
7. Fix de UX en pantallas moviles:
   - scroll vertical en login,
   - `imePadding()` y `navigationBarsPadding()`,
   - boton de ingreso siempre alcanzable.

## Evidencia funcional de cierre
1. Web login con captcha visible y operativo.
2. API health y captcha con respuestas esperadas en validaciones del servidor.
3. APK:
   - captcha visible,
   - login exitoso,
   - ingreso al sistema,
   - marcacion de asistencia exitosa.

## Riesgos residuales
1. URL de Quick Tunnel cambia por sesion (expira).
2. Si cambia backend URL, se requiere recompilar APK con nueva `API_BASE_URL`.

## Controles obligatorios para proximos despliegues
1. Ejecutar `docs/CHECKLIST_VALIDACION_APK.md`.
2. Ejecutar `docs/CHECKLIST_SERVIDOR_POST_DEPLOY.md`.
3. Registrar evidencia de cierre en `docs/`.
