# ESQUEMA DE DATOS: MÓDULO DE PROYECTOS (TOSHIBA)

**Tabla:** `Proyectos`
**Fuente:** SQL Server (`DB_Operation`)
**Última Sincronización:** 2026-01-26

## Definición de Tabla

| Columna | Tipo | Longitud | Nulable | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `Id` | `int` | - | NO | Clave Primaria (Autoincremental). |
| `Nombre` | `nvarchar` | 100 | NO | Nombre del Proyecto (Único). |
| `Cliente` | `nvarchar` | 200 | SI | Nombre del Cliente (ej. Toshiba). |
| `Estado` | `nvarchar` | 50 | NO | Estado Operativo (ACTIVO, CERRADO, PAUSADO). |
| `FechaInicio` | `datetime2` | - | SI | Inicio oficial del contrato. |
| `FechaFin` | `datetime2` | - | SI | Fin programado. |
| `Presupuesto` | `decimal` | - | SI | Monto asignado (Moneda Local). |
| `FechaSincronizacion` | `datetime2` | - | SI | Timestamp de última actualización. |
| `Division` | `nvarchar` | 100 | SI | Unidad de Negocio responsable. |
| `GerenteDni` | `nvarchar` | 80 | SI | DNI del Responsable Comercial. |
| `JefeDni` | `nvarchar` | 80 | SI | DNI del Responsable Técnico. |

## Notas de Integridad
- **GerenteDni / JefeDni:** Referencias blandas hacia `Personal.DNI`. Se deben validar en inserción.
- **Estado:** Valores permitidos controlados por Enumerado en Backend.
