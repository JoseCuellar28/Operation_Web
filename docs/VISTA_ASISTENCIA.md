# 📋 Detalle de Vista: Asistencia (Monitor Operativo)

Este documento describe el funcionamiento integral del módulo de **Asistencia**, su flujo de datos, los sistemas de control y su impacto en la operación diaria.

## 1. Propósito de la Vista
El Monitor de Asistencia es la herramienta principal para la validación de la plantilla operativa al inicio de la jornada laboral. Asegura que el personal esté:
1. **Presente** físicamente en el lugar designado.
2. **Puntual** (antes de las 08:01 AM).
3. **Saludable** (apto para realizar trabajos de riesgo).

---

## 2. Flujo de Usuario y Datos

### Paso 1: Registro (Check-In)
- **Origen:** El empleado realiza la marca desde la App Móvil o Bot de WhatsApp.
- **Datos Enviados:** DNI, Coordenadas GPS, Estado de Salud (Binario), Direccion Geocodificada y Foto.

### Paso 2: Procesamiento del Sistema (Backend)
- El servidor recibe el registro y aplica **Reglas de Negocio Inmediatas**:
    - **Cálculo de Tardanza:** Si la marca es `>= 08:01 AM`, el estado cambia a `tardanza`.
    - **Validación GPS (Geo-Fencing):** Compara contra el punto de encuentro esperado. Si hay desviación, marca `ALERTA GPS` (Status: `pending`).
    - **Validación de Salud:** Si el empleado marca "No saludable", el sistema activa un indicador de **STOP WORK** en la web.

### Paso 3: Monitoreo y Resolución (Web Supervisor)
- El supervisor utiliza la vista de Seguimiento -> Asistencia.
- **Acción Manual:** Para registros con Alerta GPS o Tardanza, se abre el panel lateral (`ResolutionDrawer`).
- **Validación:** El supervisor revisa el mapa de calor y decide si **Aprobar Excepción** o **Rechazar** (el registro se anula y cuenta como Falta).

---

## 3. Quiénes Usan la Vista
| Usuario | Acción Principal | Objetivo |
| :--- | :--- | :--- |
| **Colaborador (Campo)** | Check-In Autónomo | Confirmar su asistencia y estado. |
| **Supervisor / Capataz** | Resolver Alertas | Garantizar que el equipo en campo es el autorizado. |
| **Coordinador Operativo** | Monitoreo de KPIs | Verificar si hay faltas críticas para reasignar tareas. |
| **RRHH / Liquidación** | Auditoría | Validar que el pago de jornales coincida con marcas reales. |

---

## 4. Controles: Sistema vs. Manual

### 🤖 Controles Automáticos (Del Sistema)
- **Identificación de Ausentes:** El sistema cruza la tabla de `Colaboradores` activos contra los registros del día. Los que no tienen marca aparecen automáticamente como **Falta**.
- **Bloqueo por Salud:** Si hay falta de aptitud médica, el sistema "marca" al empleado visualmente para alertar al supervisor.
- **Geocodificación:** Convierte las coordenadas en direcciones legibles automáticamente.

### 👤 Controles Manuales (Del Humano)
- **Aprobación de Excepciones:** Solo un supervisor puede "salvar" una marca con ALERTA GPS o tardanza excesiva.
- **Sincronización (Cruce WhatsApp):** El supervisor marca manualmente el indicador de sincronización para confirmar que el reporte de campo coincide con el sistema central.

---

## 5. Interacción con otras Vistas
- **Colaboradores:** Si un empleado es desactivado en la configuración, desaparece del monitor de asistencia.
- **HSE / Seguridad:** El estado de salud reportado aquí es el primer filtro para el módulo de Seguridad en Campo.
- **Liquidación de Lotes:** Los registros de asistencia validados son el insumo principal para las hojas de estimación de servicio (HES) y facturación posterior.

---

## 6. Endpoints Críticos (API Intelligence)
- `GET /api/v1/attendance?date=...`: Recupera los registros del día.
- `PUT /api/v1/attendance/{id}/resolve`: Envía la decisión del supervisor (Approve/Reject).
- `PUT /api/v1/attendance/{id}/sync`: Control manual de sincronización externa.

---

---

## 7. Estructura de Datos (SQL Server)

El ecosistema de Asistencia opera bajo un modelo de **Maestro/Réplica** entre dos bases de datos.

### A. La Tabla de la Verdad: `Personal` (DB Operación)
Es el origen de toda la data administrativa. Aquí se gestionan las altas, bajas y fotos oficiales.
- **Ubicación:** Base de Datos local del Sistema Web.
- **PK:** `dni` (string)
- **Campos Maestros:** `Inspector` (Nombre), `Estado` (Activo/Cesado), `FotoUrl`, `FirmaUrl`, `Division`, `Area`.

### B. La Tabla de Operación: `COLABORADORES` (DB Opera_Main)
Es una réplica técnica optimizada para el consumo de aplicaciones móviles y bots.
- **Ubicación:** Base de Datos Legada/Compartida.
- **Relación:** Se sincroniza automáticamente desde `Personal` mediante **Triggers SQL** vinculados por el DNI.
- **Uso:** La App móvil lee de aquí para permitir el inicio de sesión y el check-in.

### C. Registro de Eventos: `ASISTENCIA_DIARIA` (DB Opera_Main)
Donde se genera la marca física de asistencia.
- **FK:** `id_colaborador` -> Se vincula al ID de la réplica en `COLABORADORES`.
- **Impacto:** Esta tabla es la que alimenta directamente a los monitores de Seguimiento.

### Modelo de Arquitectura de Datos
---

## 8. Diccionario Técnico y Scripts (DDL)

A continuación se detallan los scripts de creación y la arquitectura de sincronización entre las bases de datos.

### A. Estructura: `Personal` (Source of Truth)
Ubicada en la base de datos local `DB_Operation`.
```sql
CREATE TABLE [dbo].[Personal](
    [DNI] [nvarchar](80) NOT NULL,
    [Inspector] [nvarchar](400) NULL, -- Nombre completo
    [Telefono] [nvarchar](100) NULL,
    [Distrito] [nvarchar](300) NULL,
    [Tipo] [nvarchar](200) NULL,     -- Cargo/Rol
    [Estado] [nvarchar](100) NULL,   -- ACTIVO/CESADO
    [FechaInicio] [date] NULL,
    [FechaCese] [date] NULL,
    [FotoUrl] [nvarchar](1000) NULL,
    [FirmaUrl] [nvarchar](1000) NULL,
    [Division] [nvarchar](200) NULL,
    [Area] [nvarchar](200) NULL,
    CONSTRAINT [PK_Personal] PRIMARY KEY CLUSTERED ([DNI] ASC)
);
```

### B. Estructura: `COLABORADORES` (Muestra Operativa)
Ubicada en `Opera_Main`. Esta tabla es utilizada por el App Móvil para validación.
```sql
CREATE TABLE [dbo].[COLABORADORES](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [dni] [nvarchar](160) NOT NULL,
    [nombre] [nvarchar](300) NOT NULL,
    [rol] [nvarchar](100) NOT NULL,
    [active] [bit] NULL DEFAULT 1,
    [estado_operativo] [varchar](50) NULL,
    CONSTRAINT [PK_COLABORADORES] PRIMARY KEY CLUSTERED ([id] ASC)
);
CREATE UNIQUE INDEX [IX_COLABORADORES_DNI] ON [dbo].[COLABORADORES]([dni]);
```

### C. Estructura: `ASISTENCIA_DIARIA` (Transaccional)
Donde se registran las marcas GPS.
```sql
CREATE TABLE [dbo].[ASISTENCIA_DIARIA](
    [id_registro] [varchar](50) NOT NULL, -- GUID String
    [id_colaborador] [int] NOT NULL,      -- FK a COLABORADORES(id)
    [fecha_asistencia] [date] NOT NULL,
    [hora_checkin] [datetime] NULL,
    [lat_checkin] [decimal](18, 6) NULL,
    [long_checkin] [decimal](18, 6) NULL,
    [estado_final] [varchar](20) NOT NULL, -- presente/tardanza/falta
    [alert_status] [varchar](20) NULL,     -- pending/exception_approved
    [check_salud_apto] [bit] NULL,
    CONSTRAINT [PK_ASISTENCIA_DIARIA] PRIMARY KEY CLUSTERED ([id_registro] ASC),
    CONSTRAINT [FK_ASISTENCIA_DIARIA_COLABORADORES] FOREIGN KEY([id_colaborador]) 
        REFERENCES [dbo].[COLABORADORES] ([id])
);
```

### D. Triggers de Sincronización
La sincronización entre `Personal` (Verdad) y `COLABORADORES` (Operación) se realiza mediante un **Trigger SQL DML** a nivel de base de datos.
- **Evento:** `AFTER INSERT, UPDATE` en `DB_Operation.dbo.Personal`.
- **Lógica:** Mantiene el `dni`, `nombre`, `rol` y `active` actualizados en `Opera_Main.dbo.COLABORADORES`.
- **Nota técnica:** Anteriormente se realizaba por código C#, pero fue migrado a Trigger para garantizar consistencia incluso en cargas manuales de SQL.
