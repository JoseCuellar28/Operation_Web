# Checklist Express - Validacion APK en Produccion

## 1. Objetivo
Estandarizar la validacion entre Agente Calidad y Agente APK despues de cada despliegue, para evitar desalineaciones de URL, rutas y login.

## 2. Regla critica
El APK SIEMPRE debe usar la URL backend vigente (tunel backend), nunca la URL del frontend.

## 3. Checklist operativo

### 3.1 Datos base
- [ ] Backend URL vigente recibido y confirmado.
- [ ] Fecha/hora de validacion anotada.
- [ ] Version/build del APK anotada.

### 3.2 Configuracion APK
- [ ] BaseURL actualizada al backend vigente.
- [ ] No hay rutas legacy `/api/auth/*`.
- [ ] Auth usa rutas `/api/v1/auth/*`.
- [ ] Login envia JSON con `Content-Type: application/json`.

### 3.3 Salud API
- [ ] `GET /health` responde `200`.
- [ ] `GET /api/v1/auth/captcha` responde `200`.
- [ ] `GET /api/auth/captcha` responde `404` (hardening correcto).

### 3.4 Flujo captcha y login
- [ ] APK muestra captcha.
- [ ] APK envia `CaptchaId` y `CaptchaAnswer`.
- [ ] APK envia `Username`, `Password` y `Platform`.
- [ ] `POST /api/v1/auth/login` responde `200`.
- [ ] El usuario entra al dashboard sin error.

### 3.5 Sesion, CORS y red
- [ ] No hay error CORS en login.
- [ ] No hay error DNS (`ERR_NAME_NOT_RESOLVED`).
- [ ] La sesion persiste luego del login (token/cookie segun cliente).

## 4. Evidencia obligatoria
El Agente Calidad debe pedir y consolidar:
1. BaseURL final aplicada en APK.
2. Evidencia de `GET /health -> 200`.
3. Evidencia de `GET /api/v1/auth/captcha -> 200`.
4. Evidencia de login (`200` o body exacto de error).
5. Captura de dashboard autenticado.

## 5. Criterio de cierre
Se considera validado solo si:
1. APK autentica correctamente en produccion.
2. No usa rutas legacy.
3. No presenta errores de red/CORS/captcha.

## 6. Plantilla corta de reporte
```txt
[APK VALIDACION - REPORTE]
Fecha:
Owner:
BackendURL:
APK build:

1) Salud API
- /health:
- /api/v1/auth/captcha:
- /api/auth/captcha:

2) Login
- Resultado:
- Evidencia:

3) Hallazgos
- item:

4) Estado final
- Aprobado / Rechazado
- Accion siguiente:
```
