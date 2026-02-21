# F1 Device Binding - Cierre GO

- Fecha cierre: 2026-02-20 19:40:06 -0500
- Commit base local: `08a48f8`
- Entorno validado: `LOCAL/STAGING` (Mac local + SQL Server remoto)
- Produccion: **NO TOCADA**

## Evidencia de esquema
### Opera_Main
- `dbo.Dispositivos_Vinculados`: existe
- `dbo.COLABORADORES.device_id_vinculado`: existe
- `dbo.COLABORADORES.id_zona`: existe
- `dbo.COLABORADORES.id_vehiculo_asignado`: existe

### DB_Operation
- `dbo.Dispositivos_Vinculados`: existe

## Pruebas bloqueantes F1
### CASE_A_AUTHORIZED_EXPECT_200
- Status: `200`
- Body: token JWT emitido (login mobile permitido para device autorizado)

### CASE_B_UNAUTHORIZED_EXPECT_403_ERR_AUTH_DEVICE
- Status: `403`
- Body:
```json
{"code":"ERR_AUTH_DEVICE","message":"Dispositivo no autorizado para este usuario."}
```

### CASE_C_MISSING_DEVICE_EXPECT_400_ERR_AUTH_DEVICE_REQUIRED
- Status: `400`
- Body:
```json
{"code":"ERR_AUTH_DEVICE_REQUIRED","message":"DeviceId es obligatorio para acceso móvil."}
```

## Dictamen
- F1: **GO**
- Criterio cumplido: `200 / 403 / 400` con codigos esperados.
- Proxima fase: `F2 - Geocerca + Salud`.
