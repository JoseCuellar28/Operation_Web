# Reporte de Linaje de Datos (Data Lineage)

**Fecha:** 2026-01-16  
**Agente:** DB-Master  
**Objetivo:** Rastreo de la Verdad (Excel -> Web 2)

## 1. Arquitectura de Datos (Multi-Tenancy Híbrido)

El sistema opera sobre una instancia SQL Server única que aloja dos bases de datos interconectadas:

1.  **`DB_Operation` (Landing & Gestión):**
    *   Contiene las tablas de aterrizaje del Excel (`PersonalStaging`).
    *   Contiene el maestro enriquecido (`Personal`).
    *   Gestiona la seguridad de la App (`Users`, `Roles`).
2.  **`Opera_Main` (Core Legacy):**
    *   Contiene la tabla `COLABORADORES` consumida por la Web 2 y Legacy.
    *   Contiene la tabla `ASISTENCIA_DIARIA`.

## 2. Flujo de Sincronización (The Lineage)

El flujo de "La Verdad" no es automático (Triggers), sino **Orquestado por Tareas (C# Repository Pattern)**.

### Paso 1: Ingesta (Excel -> Landing)
- **Origen:** Archivo Excel `.xlsx` (Carga Masiva).
- **Destino:** Tabla `DB_Operation.dbo.PersonalStaging`.
- **Mecanismo:** `EmployeesController` lee el Excel y vuelca los datos crudos aquí.

### Paso 2: Procesamiento (Landing -> Master Local)
- **Origen:** `PersonalStaging`.
- **Destino:** `DB_Operation.dbo.Personal`.
- **Lógica:** Validación de reglas de negocio, limpieza de datos y detección de duplicados.

### Paso 3: Propagación (Master Local -> Web 2 Core)
- **Método:** `PersonalRepository.SyncToColaboradoresAsync(Personal entity)`.
- **Mecanismo:** Sentencia SQL Raw `MERGE`.
- **Destino:** `Opera_Main.dbo.COLABORADORES`.
- **Disparador:** Se ejecuta explícitamente tras validar el paso 2.

```sql
MERGE INTO Opera_Main.dbo.COLABORADORES AS Target
USING (SELECT @dni as dni) AS Source
ON (Target.dni = Source.dni)
WHEN MATCHED THEN UPDATE SET ...
WHEN NOT MATCHED THEN INSERT ...
```

## 3. Diccionario Técnico (Opera_Main.COLABORADORES)

Esquema "De Facto" definido por el mecanismo de sincronización. Este es el contrato que consume el Frontend:

| Columna (SQL) | Tipo (Inferido) | Origen (`Personal`) | Lógica de Mapeo |
| :--- | :--- | :--- | :--- |
| `dni` | `VARCHAR(40)` (UK) | `DNI` | Directo |
| `nombre` | `VARCHAR(100)` | `Inspector` | Nombre Completo |
| `rol` | `VARCHAR(50)` | `Tipo` | Cargo/Puesto |
| `phone` | `VARCHAR(20)` | `Telefono` | Directo |
| `photo_url` | `NVARCHAR(MAX)` | `FotoUrl` | Directo |
| `estado_operativo` | `VARCHAR` | `Estado` | Mapeo: 'Cesado' -> 'Retirado' |
| `active` | `BIT` | `Estado` | `Cesado` ? 0 : 1 |
| `updated_at` | `DATETIME` | `System` | `GETDATE()` |

## 4. Conclusión de Integridad
- **Consistencia:** ✅ Garantizada por la cláusula `MERGE` (Upsert). No se duplican registros, se actualizan.
- **Transformación:** ✅ Existe lógica de negocio ('Cesado' -> 'Retirado') que debe respetarse.
- **Automatización:** ⚠️ Depende de que el Backend llame a `SyncToColaboradoresAsync`. Si se inserta manualmente en `Personal` por SQL, **NO** se replicará a `COLABORADORES` automáticamente.

**Veredicto:** El linaje es rastreable pero frágil (Code-Dependent). Se recomienda migrar a un Trigger de BD si se requiere consistencia a prueba de fallos de aplicación.
