# Reporte de Validación de Brechas de Datos (DATA GAP VALIDATION)

**Fecha:** 2026-01-15
**Auditor:** QA Inspector (Agent)
**Objetivo:** Prueba de Verdad C# (Core) vs Base de Datos Real vs Frontend Legacy.

## 1. Verificación de Campos Desaparecidos
**Estado:** ❌ **CONFIRMADO** (El Backend Core está incompleto).

La entidad `OperationWeb.Core.Entities.Empleado` (mapeada a `COLABORADORES`) **NO** contiene las columnas críticas que sí existen en la tabla `Personal` (Legacy/Real DB) y que el Frontend requiere.

| Campo Requerido (Frontend) | ¿Existe en SQL (`Personal`)? | ¿Existe en Core (`Empleado.cs`)? | Veredicto |
| :--- | :--- | :--- | :--- |
| `FechaInicio` / `FechaIngreso` | ✅ SÍ (`datetime2`) | ❌ NO | **FALTA CRÍTICA** |
| `FechaCese` | ✅ SÍ (`datetime2`) | ❌ NO | **FALTA CRÍTICA** |
| `Distrito` | ✅ SÍ (`nvarchar(100)`) | ❌ NO | FALTA (Dato Geográfico) |
| `CodigoCebe` | ✅ SÍ (`nvarchar(50)`) | ❌ NO | FALTA (Dato Operativo) |

> **Observación:** La tabla `COLABORADORES` parece ser un intento de normalización (`Empleado`), pero actualmente la "Verdad" operativa reside en la tabla `Personal` lo que causa la desconexión.

## 2. Validación de Tipos de Datos (Area y Unidad)
**Estado:** ❌ **MISMATCH DE TIPOS** (Riesgo de Crash).

Existe una divergencia fundamental en cómo se modela la estructura organizativa.

*   **Real Database (`Personal`):** Utiliza **STRINGS** (`nvarchar`).
    *   Columna: `Area` (ej. "Logística")
    *   Columna: `Division` (ej. "Operaciones")
*   **Core C# (`Empleado.cs`):** Utiliza **ENTEROS** (`int?`).
    *   Propiedad: `IdArea`
    *   Propiedad: `IdUnidad`

**Impacto:**
Si el Frontend envía "Logística" (String) al Endpoint de Empleados (que espera `IdArea` int), la deserialización fallará o el Backend intentará guardar un dato inválido.

## 3. Auditoría de 'Lookups' (Catálogos)
**Estado:** ⚠️ **PARCIALMENTE DISPONIBLE** (Incompatible con Core).

Hemos encontrado el Endpoint para obtener metadatos:
*   **Endpoint:** `GET /api/personal/metadata`
*   **Servicio:** `PersonalService.GetMetadataAsync()`
*   **Retorno:** Devuelve listas de **STRINGS** (`List<string> Areas`, `List<string> Divisiones`).

**Problema:**
Aunque el servicio existe, devuelve la estructura Legacy (Strings).
*   **Agente 3 (Frontend):** Puede usar esto para llenar sus Dropdowns.
*   **Agente 1 (Backend Core):** NO puede usar estos valores directamente para llenar `IdArea` (Int). Se requiere una tabla de normalización `AREAS` (Id, Nombre) que actualmente no parece estar en uso activo o sincronizada.

## Conclusión y Recomendación

El Backend Core (`Empleado.cs`) **NO** es compatible con la realidad operativa de la Base de Datos (`Personal`) ni con la UI Legacy.

**Acción Inmediata Requerida (Bloqueante):**
1.  **Agente 1 (Backend):** Debe agregar urgentemente `FechaInicio`, `FechaCese`, `Distrito`, `CodigoCebe` a `Empleado.cs`.
2.  **Decisión Arquitectónica:** Resolver el conflicto String vs Int.
    *   *Opción A (Rápida):* Cambiar `IdArea`/`IdUnidad` a `string Area`/`string Unidad` en `Empleado.cs` para alinear con Legacy.
    *   *Opción B (Robusta):* Implementar tablas maestros `AREAS` y `UNIDADES` y un script de migración de datos.

Se recomienda **Opción A** temporalmente para desbloquear al Agente 3, seguido de la Opción B.
