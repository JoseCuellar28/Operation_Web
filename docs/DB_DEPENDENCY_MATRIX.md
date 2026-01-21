# Matriz de Dependencias de Base de Datos (Web 2.1)

**Fecha:** 2026-01-16
**Agente:** DB-Master
**Alcance:** Persistencia Crítica para Web 2.1

## 1. Mapeo de Tablas (Consumo Web 2.1)

| Tabla (BD Externa) | Esquema BD | Entidad .NET Core | Propósito en Web 2.1 | Nivel de Acceso |
| :--- | :--- | :--- | :--- | :--- |
| `COLABORADORES` | `Opera_Main` | `Empleado` | **Lectura Perfil.** Fuente principal para mostrar datos del colaborador en UI. | `Read-Only` (Sync Write) |
| `Personal` | `Opera_Main` | `Personal` | **Maestra de Verdad.** Fuente de datos para cálculo de planilla/asistencia. | `Read-Write` (Admin) |
| `ASISTENCIA_DIARIA` | `Opera_Main` | `AsistenciaDiaria` | **Registro Operativo.** Destino de marcas de asistencia (GPS/Check-in). | `Write-Intensive` |
| `PersonalStaging` | `DB_Operation` | `PersonalStaging` | **Buffer de Carga.** Tabla intermedia para importación Excel. | `Write-Read-Truncate` |
| `Users` | `DB_Operation` | `User` | **Identidad.** Autenticación y vinculación (DNI). | `Read-Only` (Auth) |
| `Cuadrillas` | `DB_Operation`* | `Cuadrilla` | **Organización.** Agrupación operativa. | `Read-Write` |

*\*Nota: Cuadrillas reside técnicamente en la misma instancia pero es concepto moderno.*

## 2. Dependencias de Lógica Procedural (SPs/Triggers)

**Resultado de Auditoría:** **CERO (0)** Dependencias Ocultas.

| Tipo | Nombre | Estado | Comentario |
| :--- | :--- | :--- | :--- |
| **Trigger** | *N/A* | 🚫 Inexistente | La lógica de negocio está 100% en C# (.NET 8). No hay "magia" en BD. |
| **Stored Proc** | *N/A* | 🚫 Inexistente | Todas las operaciones usan EF Core (LINQ) o SQL Raw explícito en Repositorio. |
| **Funciones** | *N/A* | 🚫 Inexistente | Cálculos realizados en memoria (Application Layer). |

## 3. Matriz de Compatibilidad (Estructura vs Entidad)

| Entidad (Agente 1) | Estructura BD (Opera_Main) | Estado | Observación |
| :--- | :--- | :--- | :--- |
| `Empleado.cs` | `COLABORADORES` | ✅ **Compatible** | Code-First match exacto. |
| `Personal.cs` | `Personal` | ✅ **Compatible** | Code-First match exacto. |
| `AsistenciaDiaria.cs` | `ASISTENCIA_DIARIA` | ✅ **Compatible** | Mapeo directo de columnas legacy (Lat/Long, CheckIn). |

## 4. Conclusión de Auditoría

La arquitectura de persistencia es **LIMPIA y DESACOPLADA**. 
- La Web 2.1 puede desplegarse con confianza.
- No existen "Trampas de Base de Datos" (Triggers legacy que rompan la inserción).
- La integridad depende exclusivamente de la corrección del código C# (ej. `PersonalRepository`).

**Certificación:** ✅ **PERSISTENCIA AUDITADA**
