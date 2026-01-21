# Auditoría Cruzada UI-BD (Integridad de Módulos)

**Fecha:** 2026-01-16
**Agente:** DB-Master
**Objetivo:** Certificar correspondencia entre Módulos Frontend y Tablas SQL Server.

## 1. Módulo: Gestión de Materiales (Logística)

| Componente UI (Planeado) | Tabla BD (Opera_Main) | Estado de Mapeo | Tipo de Entidad |
| :--- | :--- | :--- | :--- |
| `Materiales` (Inventario) | `Materiales` | ⚠️ **PARCIAL** | **Keyless Entity (Vista)** |
| - | `Material` (Clase) | - | Mapeada como "Sin Llave" (`HasNoKey`). |

**Hallazgo Técnico:**
El DbContext define `Material` como `HasNoKey()`.
- **Interpretación:** EF Core la trata como una Vista de Solo Lectura o una consulta Raw SQL.
- **Limitación:** La UI de "Gestión" (Alta/Baja) NO funcionará nativamente con EF Core `.Add()` o `.Update()` sobre esta entidad. Requerirá Stored Procedures o SQL Raw si se pretende escribir.
- **Riesgo:** Si la UI intenta hacer CRUD estándar, fallará.

## 2. Módulo: Gestión de Vehículos (Flota)

| Componente UI (Planeado) | Tabla BD (Opera_Main) | Estado de Mapeo | Tipo de Entidad |
| :--- | :--- | :--- | :--- |
| `FleetMonitor` | `Vehiculos` | ⚠️ **PARCIAL** | **Keyless Entity (Vista)** |
| - | `Vehiculo` (Clase) | - | Mapeada como "Sin Llave" (`HasNoKey`). |

**Hallazgo Técnico:**
Similar a Materiales, `Vehiculo` es tratada como Keyless.
- **Uso Probable:** Solo visualización (Monitor GPS).
- **CRUD:** No soportado por defecto en el modelo actual.

## 3. Módulo: Proyectos (Operaciones)

| Componente UI | Tabla BD (Opera_Main) | Estado de Mapeo | Tipo de Entidad |
| :--- | :--- | :--- | :--- |
| `Proyectos` | `Proyectos` | ✅ **TOTAL** | **Entity Standard** |
| - | `Proyecto` (Clase) | - | Tiene PK definida (`Id`). Soporta CRUD. |

## 4. Conclusión y Recomendación

**Estado Global:**
*   **Módulos Core (Personal, Proyectos, Cuadrillas):** ✅ **Soportados** para Lectura/Escritura.
*   **Módulos Logísticos (Materiales, Vehículos):** ⚠️ **Modo Lectura Solamente** (Read-Only Views).

**Acción Requerida (Frontend Architect):**
Al conectar las pantallas de "Materiales" o "Vehículos", se debe asumir que son **Reportes de Estado** y no formularios de edición, a menos que se implementen controladores específicos con SQL Raw para la escritura.
