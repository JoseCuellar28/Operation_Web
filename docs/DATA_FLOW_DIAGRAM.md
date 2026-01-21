# Diagrama de Flujo de Datos: Origen a Operación

**Fecha:** 2026-01-17
**Agente:** DB-Master
**Alcance:** Ciclo de Vida del Colaborador (`DB_Operation` -> `Opera_Main`)

## 1. El Flujo de la Verdad (The Truth Flow)

```mermaid
graph TD
    A[("DB_Operation.dbo.Personal\n(MASTER)\n[DNI: NVARCHAR(80)]")] -->|Sync Job (C# Logic)| B[("Opera_Main.dbo.COLABORADORES\n(PERFIL)\n[dni: VARCHAR(40)]")]
    A -->|Referencia Lógica| C[("Opera_Main.dbo.ASISTENCIA_DIARIA\n(OPERACIÓN)\n[dni: VARCHAR(20)]")]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
```

## 2. Auditoría de Relaciones Técnicas

### A. La Fuente: `DB_Operation.dbo.Personal`
*   **Estado:** ✅ **EXISTE** (Confirmado en Auditoría).
*   **Rol:** Maestro de Datos de RRHH.
*   **Llave Primaria:** `DNI` (NVARCHAR 80).
*   **Datos Clave:** `Inspector` (Nombre), `Cargo`, `Area`, `Division`.

### B. El Puente: Sincronización a `COLABORADORES`
*   **Destino:** `Opera_Main.dbo.COLABORADORES`.
*   **Llave de Enlace:** `dni`.
*   **⚠️ Riesgo Crítico (Truncamiento):**
    *   Origen: `NVARCHAR(80)`
    *   Destino: `VARCHAR(40)`
    *   *Consecuencia:* Si un DNI/Pasaporte excede 40 caracteres, la sincronización fallará o cortará datos.

### C. El Consumo: Operaciones Diarias
*   **Tabla:** `Opera_Main.dbo.ASISTENCIA_DIARIA`.
*   **Llave de Enlace:** `dni_colaborador`.
*   **⚠️ Riesgo Crítico (Truncamiento Severo):**
    *   Campo: `VARCHAR(20)`
    *   *Consecuencia:* Este es el cuello de botella más estrecho. Cualquier identificador > 20 caracteres romperá la integridad referencial de la asistencia.

## 3. Conclusión de Flujo

1.  **Alta:** Recursos Humanos carga el Excel -> Cae en `PersonalStaging` -> Se inserta en `Personal` (`DB_Operation`).
2.  **Activación:** El sistema ejecuta `SyncToColaboradoresAsync`.
    *   El registro viaja a `Opera_Main.dbo.COLABORADORES`.
    *   **Punto de Falla 1:** Validación de longitud de DNI.
3.  **Operación:** El trabajador marca asistencia en el App.
    *   El App envía el DNI.
    *   Se inserta en `ASISTENCIA_DIARIA`.
    *   **Punto de Falla 2:** El sistema intenta guardar un DNI largo en `VARCHAR(20)`.

**Veredicto:** El flujo es funcional lógicamente, pero **FRÁGIL** estructuralmente debido a la inconsistencia de tipos de datos en la columna pivote (`DNI`).
