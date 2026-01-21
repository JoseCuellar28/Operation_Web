# Reporte de Auditoría de Mapeo de Ecosistema

**Fecha:** 2026-01-17
**Agente:** Agente 2 (DB-Master)
**Estado:** 🛑 **CRÍTICO - DESVIACIÓN DE ESQUEMA DETECTADA**

## 1. Resumen Ejecutivo
La auditoría física contra el servidor `100.125.169.14` revela una **Desconexión Mayor** entre el código C# (.NET 8) y la Base de Datos.
*   **Tablas Legacy:** Existen y son mapeables (`ORDENES_TRABAJO`, `LOTE_VALORIZACION`).
*   **Tablas Modernas (Web 2.1):** **NO EXISTEN** en el servidor (`Personal`, `PersonalStaging`).

> **Veto Activo:** No se puede desplegar lógica de carga de Excel ni de sincronización porque las tablas destino no existen físicamente.

## 2. Mapa de Hallazgos (Fact vs Code)

### A. Base de Datos: `Opera_Main`

| Tabla | Estado Físico | Coincidencia C# | Acción Requerida |
| :--- | :--- | :--- | :--- |
| `ORDENES_TRABAJO` | ✅ **EXISTE** | ❌ Falta Entidad | Crear `OrdenTrabajo.cs` basado en esquema real. |
| `LOTE_VALORIZACION` | ✅ **EXISTE** | ❌ Falta Entidad | Crear `LoteValorizacion.cs`. |
| `ASISTENCIA_DIARIA` | ✅ **EXISTE** | ✅ Coincide | Mantener. Validar columnas nuevas. |
| `COLABORADORES` | ✅ **EXISTE** | ✅ Coincide | Sync Read-Only OK. |
| `Personal` | 🚫 **MISSING** | ⚠️ Definida en Code | **CRÍTICO:** EF Core fallará al iniciar. Se requiere Migración. |
| `COSTOS_CIERRE` | 🚫 **MISSING** | ⚠️ Planeada | No crear entidad hasta confirmar nombre real. |
| `LIQUIDACIONES...` | 🚫 **MISSING** | ⚠️ Planeada | No crear entidad hasta confirmar nombre real. |

### B. Base de Datos: `DB_Operation`

| Tabla | Estado Físico | Coincidencia C# | Acción Requerida |
| :--- | :--- | :--- | :--- |
| `Users` | ✅ **EXISTE** | ✅ Coincide | Login funcional. |
| `SystemSettings` | ✅ **EXISTE** | ✅ Coincide | Config OK. |
| `PersonalStaging` | 🚫 **MISSING** | ⚠️ Definida en Code | **CRÍTICO:** Buffer de carga inexistente. |

## 3. Detalle de Esquema Recuperado (Legacy Tables)

### `dbo.ORDENES_TRABAJO` (Key Schema)
*   **PK:** `id_ot` (uniqueidentifier) - *Atención: No es INT.*
*   **Geo:** `latitud` (float), `longitud` (float).
*   **Estado:** `estado` (nvarchar 100).
*   **Relación:** `id_lote_origen` (int), `id_cuadrilla_asignada` (nvarchar 100).

### `dbo.LOTE_VALORIZACION`
*   **PK:** `id_lote` (int).
*   **Facturación:** `total_facturado` (decimal), `mes_valorizacion`.

## 4. Recomendación de Mitigación
1.  **Generar Migraciones:** El Agente 1 debe generar y aplicar scripts SQL para crear `Personal` y `PersonalStaging` de inmediato.
2.  **Mapeo Inverso:** Crear las entidades POCO para `OrdenTrabajo` y `LoteValorizacion` respetando *estrictamente* los tipos descubiertos (ej. `id_ot` es GUID, no INT).
