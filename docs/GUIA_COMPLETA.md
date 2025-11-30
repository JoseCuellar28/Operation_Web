# 📚 Guía Completa del Proyecto - Operation Web

**Versión**: 1.0  
**Última Actualización**: 2025-11-30  
**Mantenido por**: Equipo de Desarrollo

---

## 📖 Tabla de Contenidos

1. [Capítulo 1: Seguridad y Credenciales](#capítulo-1-seguridad-y-credenciales)
2. [Capítulo 2: Configuración de Base de Datos](#capítulo-2-configuración-de-base-de-datos)
3. [Capítulo 3: ETL - Carga de Datos](#capítulo-3-etl---carga-de-datos)
4. [Capítulo 4: Calidad y Testing](#capítulo-4-calidad-y-testing)
5. [Capítulo 5: Deployment y Ambientes](#capítulo-5-deployment-y-ambientes)
6. [Apéndice A: Comandos Útiles](#apéndice-a-comandos-útiles)
7. [Apéndice B: Troubleshooting](#apéndice-b-troubleshooting)

---

# Capítulo 1: Seguridad y Credenciales

## 1.1 Problema Crítico Identificado

### 🔴 Credenciales Expuestas en GitHub

**Estado**: ⚠️ CRÍTICO - Requiere Acción Inmediata

**Ubicaciones**:
- `OperationWeb.API/appsettings.json` (trackeado en Git)
- Múltiples scripts Python en raíz del proyecto

**Credenciales Expuestas**:
```
Server: 100.112.55.58
Usuario sa: Joarcu28
Usuario app_user: joarcu$2025
```

### 1.2 Plan de Remediación

#### Paso 1: Rotar Credenciales (URGENTE)

```sql
-- Conectarse como administrador del servidor
ALTER LOGIN sa WITH PASSWORD = 'NuevaContraseñaSegura2025!@#$';
ALTER LOGIN app_user WITH PASSWORD = 'NuevaContraseñaSegura2025!@#$';
```

#### Paso 2: Implementar Variables de Entorno

**Para .NET API**:

Crear `appsettings.Development.json` (no commitear):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;User Id=sa;Password=NUEVA_PASSWORD;..."
  }
}
```

Modificar `Program.cs`:
```csharp
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Sobrescribir con variable de entorno si existe
if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")))
{
    connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
}
```

**Para ETL Service**:

Usar `.env` (ya está en `.gitignore`):
```bash
DB_SERVER=100.112.55.58
DB_USER=app_user
DB_PASSWORD=NUEVA_PASSWORD
```

#### Paso 3: Limpiar Historial de Git (Opcional)

```bash
# Opción 1: BFG Repo-Cleaner
brew install bfg
echo "Joarcu28" > passwords.txt
echo "joarcu$2025" >> passwords.txt
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all

# Opción 2: Hacer el repositorio privado
# GitHub → Settings → Danger Zone → Change visibility
```

### 1.3 Mejores Prácticas

- ✅ Usar variables de entorno para credenciales
- ✅ Nunca commitear archivos `.env`
- ✅ Usar Azure Key Vault o AWS Secrets Manager en producción
- ✅ Rotar credenciales regularmente (cada 90 días)
- ✅ Usar diferentes credenciales por ambiente

---

# Capítulo 2: Configuración de Base de Datos

## 2.1 Usuarios de Base de Datos

### Usuarios Disponibles

| Usuario | Contraseña | Roles | Uso |
|---------|------------|-------|-----|
| `sa` | `Joarcu28` | sysadmin | Desarrollo, migraciones |
| `app_user` | `joarcu$2025` | db_datareader, db_datawriter | Aplicación web, ETL |

### Permisos de app_user

```sql
-- Ver roles asignados
SELECT r.name
FROM sys.database_role_members rm
JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
JOIN sys.database_principals u ON rm.member_principal_id = u.principal_id
WHERE u.name = 'app_user';

-- Resultado:
-- db_datareader  (puede leer todas las tablas)
-- db_datawriter  (puede escribir en todas las tablas)
```

**Limitaciones**:
- ❌ NO puede crear/modificar/eliminar tablas (DDL)
- ❌ NO puede crear usuarios
- ❌ NO puede hacer backups
- ✅ SÍ puede hacer CRUD en todas las tablas

## 2.2 Configuración por Ambiente

### Desarrollo (usa `sa`)

**Archivo**: `OperationWeb.API/appsettings.Development.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=100.112.55.58;Database=DB_Operation;User Id=sa;Password=Joarcu28;TrustServerCertificate=True;MultipleActiveResultSets=true;Encrypt=False"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

**Ejecutar**:
```bash
dotnet run --project OperationWeb.API/OperationWeb.API.csproj
# Por defecto usa Development
```

### Producción (usa `app_user`)

**Archivo**: `OperationWeb.API/appsettings.Production.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=100.112.55.58;Database=DB_Operation;User Id=app_user;Password=joarcu$2025;TrustServerCertificate=True;MultipleActiveResultSets=true;Encrypt=False"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.EntityFrameworkCore": "Error"
    }
  }
}
```

**Ejecutar**:
```bash
dotnet run --project OperationWeb.API/OperationWeb.API.csproj --environment Production
```

## 2.3 Migraciones de Entity Framework

### Opción 1: Usar Development (Recomendado)

```bash
# Ejecuta con sa automáticamente
dotnet ef database update
```

### Opción 2: Connection String Explícita

```bash
dotnet ef database update --connection "Server=100.112.55.58;Database=DB_Operation;User Id=sa;Password=Joarcu28;TrustServerCertificate=True"
```

### Opción 3: Producción (Manual)

⚠️ **NO ejecutar `dotnet ef database update` en producción con app_user**

1. Generar script SQL:
   ```bash
   dotnet ef migrations script --output migration.sql
   ```

2. Ejecutar manualmente con `sa`:
   ```sql
   -- Conectarse como sa
   USE DB_Operation;
   GO
   -- Pegar contenido de migration.sql
   ```

---

# Capítulo 3: ETL - Carga de Datos

## 3.1 Arquitectura del ETL

```
Excel File → Python Flask API → SQL Server
    ↓              ↓                  ↓
  Upload    Procesar/Validar    Personal_Staging
                                      ↓
                                   MERGE
                                      ↓
                                  Personal
                                      ↓
                            Personal_EventoLaboral
                                      ↓
                          Historial_Cargas_Personal
```

## 3.2 Proceso de Carga

### Paso 1: Carga a Staging

```python
# etl-service/lib/procesar_personas.py
def procesar_personas(file_path, periodo):
    df = pd.read_excel(file_path)
    # Validar columnas requeridas
    # Limpiar datos
    # Cargar a Personal_Staging
```

### Paso 2: Merge a Personal

```sql
-- etl-service/sql/01_merge_personal.sql
MERGE INTO Personal AS Target
USING Personal_Staging AS Source
ON Target.DNI = Source.DNI

WHEN MATCHED AND (
    -- Solo actualizar si hay cambios reales
    Target.Inspector <> Source.Inspector OR
    Target.Estado <> Source.Estado OR
    ...
) THEN UPDATE SET ...

WHEN NOT MATCHED BY TARGET THEN
    INSERT (...) VALUES (...)
```

### Paso 3: Registrar Eventos

```sql
-- Insertar en Personal_EventoLaboral
INSERT INTO Personal_EventoLaboral (DNI, TipoEvento, FechaEvento, ...)
SELECT DNI, 
    CASE WHEN ActionType = 'INSERT' THEN 'Alta' ELSE 'Cambio' END,
    ...
FROM #MergeOutput
WHERE NOT EXISTS (
    -- Evitar duplicados
    SELECT 1 FROM Personal_EventoLaboral ...
)
```

### Paso 4: Auditoría

```sql
-- Insertar en Historial_Cargas_Personal
INSERT INTO Historial_Cargas_Personal (
    Archivo, Periodo, InsertadosSnapshot, ActualizadosSnapshot, ...
)
VALUES (...)
```

## 3.3 Detección de Actualizaciones

### Problema Anterior

- ❌ Siempre reportaba 0 actualizaciones
- ❌ No distinguía entre datos idénticos y datos modificados

### Solución Implementada

1. **Comparación Explícita de Campos**:
   ```sql
   WHEN MATCHED AND (
       ISNULL(Target.Inspector, '') <> ISNULL(Source.Inspector, '') OR
       ISNULL(Target.Estado, '') <> ISNULL(Source.Estado, '') OR
       -- ... todos los campos
   ) THEN UPDATE
   ```

2. **Captura de Acciones**:
   ```sql
   OUTPUT $action, inserted.DNI, ... INTO #MergeOutput
   ```

3. **Conteo de Resultados**:
   ```sql
   SELECT 
       SUM(CASE WHEN ActionType = 'INSERT' THEN 1 ELSE 0 END) AS Inserted,
       SUM(CASE WHEN ActionType = 'UPDATE' THEN 1 ELSE 0 END) AS Updated
   FROM #MergeOutput
   ```

## 3.4 Configuración del ETL

### Variables de Entorno

**Archivo**: `etl-service/.env`

```bash
DB_SERVER=100.112.55.58
DB_NAME=DB_Operation
DB_USER=app_user
DB_PASSWORD=joarcu$2025
DB_PORT=1433
```

### Ejecutar Servicio

```bash
cd etl-service
python3 server.py
# Escucha en http://localhost:5051
```

### Endpoint de Carga

```bash
POST http://localhost:5051/api/upload-excel
Content-Type: multipart/form-data

file: archivo.xlsx
```

**Respuesta**:
```json
{
  "success": true,
  "snapshot": {
    "inserted": 10,
    "updated": 5
  },
  "message": "Carga completada exitosamente"
}
```

## 3.5 Validaciones y Restricciones

### CHECK Constraints

```sql
-- TipoEvento solo acepta valores específicos
ALTER TABLE Personal_EventoLaboral
ADD CONSTRAINT CK_Personal_EventoLaboral_TipoEvento
CHECK (TipoEvento IN ('Alta', 'Baja', 'Cambio', 'Renovacion'))
```

### UNIQUE Constraints

```sql
-- No duplicar eventos para mismo DNI/Tipo/Fecha/Periodo
ALTER TABLE Personal_EventoLaboral
ADD CONSTRAINT UQ_Personal_EventoLaboral_NoDuplicados
UNIQUE (DNI, TipoEvento, FechaEvento, Periodo)
```

### Manejo en el Código

```sql
-- Evitar duplicados con WHERE NOT EXISTS
INSERT INTO Personal_EventoLaboral (...)
SELECT ... FROM #MergeOutput
WHERE NOT EXISTS (
    SELECT 1 FROM Personal_EventoLaboral PEL
    WHERE PEL.DNI = MO.DNI
    AND PEL.TipoEvento = ...
    AND PEL.FechaEvento = ...
)
```

---

# Capítulo 4: Calidad y Testing

## 4.1 Prioridades de QA

### 🔴 Prioridad Máxima: Seguridad

1. **Rotación de Credenciales**
   - [ ] Cambiar contraseña de sa
   - [ ] Cambiar contraseña de app_user
   - [ ] Implementar variables de entorno

2. **Eliminar Credenciales del Código**
   - [ ] Remover de appsettings.json (usar variables)
   - [ ] Remover de scripts Python
   - [ ] Limpiar historial de Git

3. **Gestión Segura de Secrets**
   - [ ] Implementar Azure Key Vault (producción)
   - [ ] Usar User Secrets (desarrollo)
   - [ ] Documentar proceso de rotación

### 🟠 Prioridad Alta: Seguridad de Código

1. **XSS (Cross-Site Scripting)**
   - **Problema**: 40+ instancias de `.innerHTML` en frontend
   - **Solución**: Usar DOMPurify o `.textContent`
   
   ```javascript
   // ❌ VULNERABLE
   element.innerHTML = userInput;
   
   // ✅ SEGURO
   import DOMPurify from 'dompurify';
   element.innerHTML = DOMPurify.sanitize(userInput);
   ```

2. **Logging Sensible**
   - **Problema**: 18 `print()` statements que pueden loggear datos
   - **Solución**: Usar logging con niveles
   
   ```python
   # ❌ VULNERABLE
   print(f"Datos: {df.head()}")
   
   # ✅ SEGURO
   logger.debug(f"Procesadas {len(df)} filas")  # Sin datos
   ```

3. **Dependencias Vulnerables**
   - **Problema**: Flask-CORS 4.0.0 (vulnerable)
   - **Solución**: Actualizar a 4.0.1+
   
   ```bash
   pip install flask-cors==4.0.1 --upgrade
   ```

### 🟡 Prioridad Media: CI/CD

1. **GitHub Actions**
   - [x] CodeQL configurado
   - [ ] Workflow de pruebas unitarias
   - [ ] Workflow de build

2. **Reglas de Protección de Rama**
   - [ ] Require PR approval
   - [ ] Require status checks
   - [ ] No allow force push

## 4.2 Pruebas de Estrés ETL

### Script de Prueba

```python
# etl-service/tests/stress_test_etl.py
# Genera 20 archivos Excel con datos mezclados
# Verifica que inserted/updated sean correctos
```

### Resultados Esperados

```
Iteration 1: Inserted=10, Updated=0  ✅
Iteration 2: Inserted=5, Updated=5   ✅
Iteration 3: Inserted=5, Updated=5   ✅
...
```

## 4.3 Pruebas Funcionales

### Checklist de Pruebas

**Aplicación Web**:
- [ ] Login funciona
- [ ] Listar empleados funciona
- [ ] Crear empleado funciona
- [ ] Editar empleado funciona
- [ ] Eliminar empleado funciona
- [ ] Cambiar contraseña funciona

**ETL Service**:
- [ ] Carga de archivo Excel funciona
- [ ] Detecta nuevos registros
- [ ] Detecta actualizaciones
- [ ] Registra eventos correctamente
- [ ] Auditoría funciona

---

# Capítulo 5: Deployment y Ambientes

## 5.1 Ambientes

| Ambiente | URL | Base de Datos | Usuario DB |
|----------|-----|---------------|------------|
| Development | localhost:5132 | DB_Operation | sa |
| Staging | TBD | DB_Operation_Staging | app_user |
| Production | TBD | DB_Operation | app_user |

## 5.2 Configuración por Ambiente

### Development

```bash
# .NET API
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --project OperationWeb.API/OperationWeb.API.csproj

# ETL Service
# Editar etl-service/.env
DB_USER=sa
DB_PASSWORD=Joarcu28
python3 etl-service/server.py
```

### Production

```bash
# .NET API
export ASPNETCORE_ENVIRONMENT=Production
export DB_CONNECTION_STRING="Server=...;User Id=app_user;Password=..."
dotnet run --project OperationWeb.API/OperationWeb.API.csproj

# ETL Service
# Editar etl-service/.env
DB_USER=app_user
DB_PASSWORD=joarcu$2025
python3 etl-service/server.py
```

## 5.3 Checklist de Deployment

### Pre-Deployment

- [ ] Ejecutar todas las pruebas
- [ ] Verificar que no hay credenciales hardcodeadas
- [ ] Actualizar dependencias
- [ ] Generar scripts de migración
- [ ] Backup de base de datos

### Deployment

- [ ] Ejecutar migraciones (con sa)
- [ ] Desplegar aplicación (con app_user)
- [ ] Verificar logs
- [ ] Pruebas de humo

### Post-Deployment

- [ ] Verificar funcionalidad crítica
- [ ] Monitorear errores
- [ ] Verificar performance
- [ ] Actualizar documentación

---

# Apéndice A: Comandos Útiles

## A.1 Base de Datos

```sql
-- Ver usuarios conectados
SELECT session_id, login_name, program_name, host_name
FROM sys.dm_exec_sessions
WHERE is_user_process = 1;

-- Ver permisos de un usuario
SELECT r.name
FROM sys.database_role_members rm
JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
JOIN sys.database_principals u ON rm.member_principal_id = u.principal_id
WHERE u.name = 'app_user';

-- Resetear contraseña
ALTER LOGIN app_user WITH PASSWORD = 'nueva_password';

-- Habilitar/Deshabilitar login
ALTER LOGIN app_user ENABLE;
ALTER LOGIN app_user DISABLE;
```

## A.2 .NET

```bash
# Compilar
dotnet build

# Ejecutar
dotnet run --project OperationWeb.API/OperationWeb.API.csproj

# Ejecutar en ambiente específico
dotnet run --environment Production

# Migraciones
dotnet ef migrations add MigrationName
dotnet ef database update
dotnet ef migrations script --output migration.sql

# Tests
dotnet test
```

## A.3 Python ETL

```bash
# Instalar dependencias
pip install -r etl-service/requirements.txt

# Ejecutar servicio
python3 etl-service/server.py

# Verificar conexión
python3 tools/verify_app_user.py

# Pruebas de estrés
python3 etl-service/tests/stress_test_etl.py
```

## A.4 Git

```bash
# Ver archivos trackeados
git ls-files

# Remover archivo del tracking (mantener local)
git rm --cached archivo.txt

# Ver credenciales en el código
git grep -i "password"
git grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"

# Limpiar historial (BFG)
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

# Apéndice B: Troubleshooting

## B.1 Errores Comunes

### Error: "Login failed for user 'app_user'"

**Causa**: Contraseña incorrecta o usuario deshabilitado

**Solución**:
```sql
ALTER LOGIN app_user WITH PASSWORD = 'joarcu$2025';
ALTER LOGIN app_user ENABLE;
```

### Error: "Cannot create table"

**Causa**: Usando app_user para migraciones

**Solución**:
```bash
# Usar Development (sa)
dotnet ef database update --environment Development
```

### Error: "Connection timeout"

**Causa**: Servidor SQL no accesible

**Solución**:
```bash
# Verificar VPN
# Verificar firewall
# Verificar que el servidor esté encendido
ping 100.112.55.58
telnet 100.112.55.58 1433
```

### Error: "Instrucción INSERT en conflicto con CHECK constraint"

**Causa**: Valores no permitidos en TipoEvento

**Solución**:
```sql
-- Usar valores permitidos: 'Alta', 'Baja', 'Cambio', 'Renovacion'
-- NO usar: 'ALTA', 'MODIFICACION', etc.
```

### Error: "Clave duplicada en índice único"

**Causa**: Intentando insertar evento duplicado

**Solución**:
```sql
-- Agregar WHERE NOT EXISTS
INSERT INTO Personal_EventoLaboral (...)
SELECT ... FROM #MergeOutput
WHERE NOT EXISTS (...)
```

## B.2 Logs y Debugging

### .NET API

```bash
# Ver logs en consola
dotnet run

# Aumentar verbosidad
# Editar appsettings.Development.json
"Logging": {
  "LogLevel": {
    "Default": "Debug",
    "Microsoft.EntityFrameworkCore": "Information"
  }
}
```

### ETL Service

```python
# Agregar prints de debug
print(f"DEBUG: {variable}")

# Ver logs del servidor
tail -f server_etl.log
```

### SQL Server

```sql
-- Ver errores recientes
SELECT TOP 100 *
FROM sys.dm_exec_query_stats
ORDER BY last_execution_time DESC;

-- Ver queries lentas
SELECT TOP 10 
    total_elapsed_time/execution_count AS avg_time,
    text
FROM sys.dm_exec_query_stats
CROSS APPLY sys.dm_exec_sql_text(sql_handle)
ORDER BY avg_time DESC;
```

---

## 📞 Contacto y Soporte

**Equipo de Desarrollo**: [Definir]  
**Responsable de Seguridad**: [Definir]  
**Responsable de Base de Datos**: [Definir]

---

**Última Actualización**: 2025-11-30  
**Versión del Documento**: 1.0  
**Próxima Revisión**: 2025-12-15
