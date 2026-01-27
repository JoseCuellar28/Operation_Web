# Esquema de Integración: Toshiba / Proyectos

**Servidor:** 100.125.169.14  
**Base de Datos:** DB_Operation  

> [!IMPORTANT]
> Estas tablas EXISTEN físicamente en producción.  
> **Estado:** Contract Frozen.  
> **Discovery:** `dbo.Proyectos` es la maestra. `dbo.PersonalProyectos` gestiona la asignación.

---

## 1. Tabla Maestra: `dbo.Proyectos`

| Columna | Tipo SQL | Longitud | Nullable | Constraint | Notas de Integración |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Id` | `int` | - | NO | **PK** | Identity (Auto-increment). |
| `Nombre` | `nvarchar` | 100 | NO | - | Nombre display del proyecto. |
| `Cliente` | `nvarchar` | 200 | YES | - | Entidad cliente (ej. Anglo American). |
| `Estado` | `nvarchar` | 50 | NO | - | Valor string (ej. 'ACTIVO', 'CERRADO'). |
| `FechaInicio` | `datetime2` | - | YES | - | |
| `FechaFin` | `datetime2` | - | YES | - | |
| `Presupuesto` | `decimal` | - | YES | - | Precision default (18,0) o similar. |
| `FechaSincronizacion` | `datetime2` | - | YES | - | Control de sync con ERP externo. |
| `Division` | `nvarchar` | 100 | YES | - | Agrupación lógica. |
| `GerenteDni` | `nvarchar` | 80 | YES | - | DNI del responsable. |
| `JefeDni` | `nvarchar` | 80 | YES | - | DNI del jefe directo. |

---

## 2. Tabla Relacional: `dbo.PersonalProyectos` (Assignment)

| Columna | Tipo SQL | Longitud | Nullable | Constraint | Notas de Integración |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Id` | `int` | - | NO | **PK** | Identity. |
| `DNI` | `nvarchar` | 40 | NO | **FK** | Apunta a `Users.DNI` o `Opera_Main..Personal.DNI`. |
| `ProyectoId` | `int` | - | NO | **FK** | Apunta a `Proyectos.Id`. |
| `FechaAsignacion` | `datetime2` | - | NO | - | Fecha de alta en el proyecto. |
| `FechaDesasignacion` | `datetime2` | - | YES | - | Fecha de baja (si aplica). |
| `EsActivo` | `bit` | - | NO | - | Soft delete activo (`1` = Asignado). |
| `RolEnProyecto` | `nvarchar` | 50 | YES | - | Ej. 'Lider', 'Tecnico'. |
| `PorcentajeDedicacion`| `decimal` | - | YES | - | Capacidad asignada (0.0 - 1.0). |

---

## Notas para Backend (Agente 1)
1.  **Falsos Positivos:** El usuario mencionó columnas como `NombreProyecto` o `CodigoOCA`. **NO EXISTEN**. Usar `Nombre` y `Id`.
2.  **Relaciones:** La asignación de personal NO está en `Proyectos`. Usar `PersonalProyectos` para joins.
3.  **Estado:** Usar String para `Proyectos.Estado`, pero Bit para `PersonalProyectos.EsActivo`.
4.  **Ubicación:** Todo reside en `DB_Operation`. `Opera_Main` no tiene contexto de proyectos.
