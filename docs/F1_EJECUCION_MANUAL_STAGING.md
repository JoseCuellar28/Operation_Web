# F1 Device Binding - Ejecucion Manual (Staging)

## 0) Alcance obligatorio
1. Ejecutar solo en `LOCAL/STAGING`.
2. No ejecutar despliegues en produccion.
3. Si usas el servidor de casa, tratalo como entorno de pruebas para F1.

## 1) Prerrequisitos
1. API levantada y saludable en `http://127.0.0.1:5132/health`.
2. Conexion a SQL Server validada.
3. Script disponible:
   - `database/scripts/05_SGO_F1_DEVICE_BINDING.sql`

## 2) Variables (PowerShell)
```powershell
Set-Location "C:\Apps\Operation_Web"
$ErrorActionPreference = "Stop"

# Ajusta estos valores reales de STAGING
$DbServer   = "100.125.169.14"
$DbName     = "DB_Operation"
$DbUser     = "SA"
$DbPassword = "JOARCU28_AQUI"

$ApiBase = "http://127.0.0.1:5132"
$SqlScriptPath = ".\database\scripts\05_SGO_F1_DEVICE_BINDING.sql"
```

## 3) Aplicar script SQL F1 (sin sqlcmd, via SqlClient)
```powershell
$connString = "Server=$DbServer;Database=$DbName;User Id=$DbUser;Password=$DbPassword;Encrypt=True;TrustServerCertificate=True;"
$raw = Get-Content $SqlScriptPath -Raw
$batches = [regex]::Split($raw, "^\s*GO\s*$(\r?\n)?", [System.Text.RegularExpressions.RegexOptions]::Multiline) | Where-Object { $_.Trim() -ne "" }

$conn = New-Object System.Data.SqlClient.SqlConnection $connString
$conn.Open()
try {
  foreach($batch in $batches){
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $batch
    $cmd.CommandTimeout = 120
    [void]$cmd.ExecuteNonQuery()
  }
  "F1 SQL aplicado correctamente."
}
finally {
  $conn.Close()
}
```

## 4) Verificacion de esquema (tabla + columnas)
```powershell
$conn = New-Object System.Data.SqlClient.SqlConnection $connString
$conn.Open()
try {
  $q = @"
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME='Dispositivos_Vinculados';

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME='COLABORADORES'
  AND COLUMN_NAME IN ('device_id_vinculado','id_zona','id_vehiculo_asignado')
ORDER BY COLUMN_NAME;
"@
  $cmd = $conn.CreateCommand()
  $cmd.CommandText = $q
  $r = $cmd.ExecuteReader()
  while($r.Read()){ $r[0] }
  $r.NextResult() | Out-Null
  while($r.Read()){ $r[0] }
  $r.Close()
}
finally {
  $conn.Close()
}
```

Resultado esperado:
1. Debe aparecer `Dispositivos_Vinculados`.
2. Deben aparecer las 3 columnas en `COLABORADORES`.

## 5) Seed de dispositivo autorizado de prueba
Necesitas un usuario con DNI existente en `COLABORADORES`.

```powershell
$TestDni = "41007510"
$DeviceAuthorized = "DEVICE_TEST_AUTHORIZED_001"
$DeviceUnknown    = "DEVICE_TEST_UNKNOWN_999"

$conn = New-Object System.Data.SqlClient.SqlConnection $connString
$conn.Open()
try {
  $upsert = @"
DECLARE @idColaborador INT = (SELECT TOP 1 id FROM dbo.COLABORADORES WHERE dni=@dni);
IF @idColaborador IS NULL
  THROW 50001, 'No existe COLABORADOR para el DNI de prueba.', 1;

IF NOT EXISTS (SELECT 1 FROM dbo.Dispositivos_Vinculados WHERE id_colaborador=@idColaborador AND uuid_hash=@device)
BEGIN
  INSERT INTO dbo.Dispositivos_Vinculados(id_colaborador, imei_hash, uuid_hash, activo)
  VALUES (@idColaborador, @device, @device, 1);
END
ELSE
BEGIN
  UPDATE dbo.Dispositivos_Vinculados
  SET activo=1
  WHERE id_colaborador=@idColaborador AND uuid_hash=@device;
END
"@
  $cmd = $conn.CreateCommand()
  $cmd.CommandText = $upsert
  [void]$cmd.Parameters.Add("@dni",[System.Data.SqlDbType]::VarChar,80)
  [void]$cmd.Parameters.Add("@device",[System.Data.SqlDbType]::VarChar,255)
  $cmd.Parameters["@dni"].Value = $TestDni
  $cmd.Parameters["@device"].Value = $DeviceAuthorized
  [void]$cmd.ExecuteNonQuery()
  "Seed de dispositivo autorizado completado."
}
finally {
  $conn.Close()
}
```

## 6) Obtener captcha para pruebas login
```powershell
$captcha = Invoke-RestMethod "$ApiBase/api/v1/auth/captcha"
$CaptchaId = $captcha.id
$Question  = $captcha.question
if ($Question -match "^\s*(\d+)\s*\+\s*(\d+)\s*$") {
  $CaptchaAnswer = ([int]$matches[1] + [int]$matches[2]).ToString()
} else {
  throw "Formato de captcha inesperado: $Question"
}
"CaptchaId=$CaptchaId Question=$Question Answer=$CaptchaAnswer"
```

## 7) Pruebas bloqueantes F1

### Caso A: Device autorizado -> 200
```powershell
$bodyA = @{
  Username = $TestDni
  Password = "123456"
  CaptchaId = $CaptchaId
  CaptchaAnswer = $CaptchaAnswer
  Platform = "mobile"
  DeviceId = $DeviceAuthorized
} | ConvertTo-Json

try {
  $resA = Invoke-WebRequest "$ApiBase/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $bodyA -UseBasicParsing
  "CASE_A_STATUS=$($resA.StatusCode)"
  $resA.Content
} catch {
  $resp = $_.Exception.Response
  if($resp){
    $sr = New-Object IO.StreamReader($resp.GetResponseStream())
    "CASE_A_STATUS=$([int]$resp.StatusCode)"
    $sr.ReadToEnd()
  } else { throw }
}
```

### Caso B: Device no autorizado -> 403 + ERR_AUTH_DEVICE
```powershell
$captcha = Invoke-RestMethod "$ApiBase/api/v1/auth/captcha"
$CaptchaId = $captcha.id
$Question  = $captcha.question
$Question -match "^\s*(\d+)\s*\+\s*(\d+)\s*$" | Out-Null
$CaptchaAnswer = ([int]$matches[1] + [int]$matches[2]).ToString()

$bodyB = @{
  Username = $TestDni
  Password = "123456"
  CaptchaId = $CaptchaId
  CaptchaAnswer = $CaptchaAnswer
  Platform = "mobile"
  DeviceId = $DeviceUnknown
} | ConvertTo-Json

try {
  $resB = Invoke-WebRequest "$ApiBase/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $bodyB -UseBasicParsing
  "CASE_B_STATUS=$($resB.StatusCode)"
  $resB.Content
} catch {
  $resp = $_.Exception.Response
  $sr = New-Object IO.StreamReader($resp.GetResponseStream())
  "CASE_B_STATUS=$([int]$resp.StatusCode)"
  $sr.ReadToEnd()
}
```

### Caso C: Sin DeviceId -> 400 + ERR_AUTH_DEVICE_REQUIRED
```powershell
$captcha = Invoke-RestMethod "$ApiBase/api/v1/auth/captcha"
$CaptchaId = $captcha.id
$Question  = $captcha.question
$Question -match "^\s*(\d+)\s*\+\s*(\d+)\s*$" | Out-Null
$CaptchaAnswer = ([int]$matches[1] + [int]$matches[2]).ToString()

$bodyC = @{
  Username = $TestDni
  Password = "123456"
  CaptchaId = $CaptchaId
  CaptchaAnswer = $CaptchaAnswer
  Platform = "mobile"
} | ConvertTo-Json

try {
  $resC = Invoke-WebRequest "$ApiBase/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $bodyC -UseBasicParsing
  "CASE_C_STATUS=$($resC.StatusCode)"
  $resC.Content
} catch {
  $resp = $_.Exception.Response
  $sr = New-Object IO.StreamReader($resp.GetResponseStream())
  "CASE_C_STATUS=$([int]$resp.StatusCode)"
  $sr.ReadToEnd()
}
```

## 8) Criterio de cierre F1
1. Caso A = `200`.
2. Caso B = `403` y body contiene `ERR_AUTH_DEVICE`.
3. Caso C = `400` y body contiene `ERR_AUTH_DEVICE_REQUIRED`.

Si alguno falla: `NO-GO`.
