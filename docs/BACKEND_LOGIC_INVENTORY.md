
# 🧠 Inventario de Lógica del Backend (API Intelligence Report)

**Fecha de Corte:** 2026-01-16
**Estado:** VIVO (Sincronizado con Código Fuente)
**Agente Responsable:** Backend-Lead

## 1. Catálogo de Endpoints (API Surface)

Este catálogo describe los puntos de entrada activos en `OperationWeb.API`.

### 🔐 Autenticación & Seguridad (`/api/v1/auth`)
| Verbo | Ruta | Descripción | Lógica Clave / Tabla |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Iniciar sesión y obtener JWT. | `Users` (Auth), `Personal` (Claims). Valida Captcha + Credenciales + Acceso Plataforma. |
| `GET` | `/me` | Obtener datos del usuario actual. | `Users`. Requiere Token. |
| `POST` | `/change-password` | Cambiar contraseña. | `Users`. Requiere Token. Actualiza Hash BCrypt. |
| `GET` | `/captcha` | Iniciar desafío Captcha. | Genera ID + SVG. Guarda respuesta en Memoria (2 min). |
| `GET` | `/captcha/image/{id}` | Obtener imagen SVG del Captcha. | Sirve SVG con ruido visual. |
| `POST` | `/forgot-password` | Solicitar reset de clave. | `Users`, `PasswordResetTokens`. Envía Email. |
| `POST` | `/reset-password` | Ejecutar reset con token. | `PasswordResetTokens`. Valida expiración y uso. |

### 👥 Gestión de Personal (`/api/v1/personal`)
| Verbo | Ruta | Descripción | Lógica Clave / Tabla |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar colaboradores. | `COLABORADORES` (vía `EmpleadoRepository`). Filtra por Rol (Manager/Coord). |
| `GET` | `/{dni}` | Obtener detalle por DNI. | `COLABORADORES`. |
| `POST` | `/` | Crear nuevo colaborador. | `COLABORADORES`. Valida duplicidad de DNI. |
| `PUT` | `/{dni}` | Actualizar datos. | `COLABORADORES`. Valida consistencia de DNI. |
| `PUT` | `/{dni}/terminate` | Cesar colaborador. | Marca `Active=0`, `Estado='Cesado'`, `FechaCese=Now`. |
| `DELETE`| `/{dni}` | Eliminar registro (Hard Delete). | `COLABORADORES`. Solo Admin. |
| `GET` | `/metadata` | Listas para dropdowns. | Distinct de `Division`, `Area`, `Cargo` en DB. |
| `POST` | `/history` | Registrar carga masiva. | `HistorialCargaPersonal`. Log de auditoría. |

### ⚙️ Configuración del Sistema (`/api/v1/system-settings`)
| Verbo | Ruta | Descripción | Lógica Clave / Tabla |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Leer configuraciones. | `SystemSettings`. |
| `POST` | `/` | Guardar configuración. | `SystemSettings`. Upsert por Clave. |

---

## 2. Lógica de Negocio Crítica (Brain Functions)

Explicación detallada de los procesos "inteligentes" del servidor.

### A. Sincronización de Datos (`SyncToColaboradores`)
> **Estado:** *Integrada (Adapter Pattern)*
> **Funcionamiento:**
> En versiones anteriores, existía una sincronización explícita entre una tabla temporal y la tabla maestra.
> En la arquitectura actual (**Web 2.0 Core**), `PersonalService` actúa como un **Adaptador**.
> - **Lectura:** Cuando se pide data de `Personal`, el servicio lee directamente de la tabla `COLABORADORES` (entidad `Empleado`) y la mapea al formato de respuesta DTO en tiempo de ejecución.
> - **Escritura:** Al crear/editar, se escribe directamente en `COLABORADORES`.
> - **Beneficio:** Elimina latencia de sincronización y garantiza "Single Source of Truth".

### B. Motor de Captcha (Server-Side SVG)
> **Objetivo:** Prevenir ataques de fuerza bruta automatizados.
> **Flujo:**
> 1.  Cliente pide `/api/v1/auth/captcha`.
> 2.  Servidor genera operación matemática simple (ej. "5 + 3").
> 3.  Servidor guarda resultado ("8") en caché de memoria con un ID único y TTL de 2 minutos.
> 4.  Servidor renderiza un SVG con ruido aleatorio y texto distorsionado (para vencer OCR básico).
> 5.  Cliente envía `captchaId` + `captchaAnswer` en el Login.
> 6.  Si coinciden, se procesa el Login y se invalida el Captcha (One-Time Use).

### C. Jerarquía de Acceso (Data Scoping)
> **Objetivo:** Que cada usuario vea solo lo que le corresponde.
> **Lógica en `PersonalController.GetAll`:**
> 1.  **Admin:** Ve TODO.
> 2.  **Manager:** Filtra automáticamente por `Division` del usuario. Si el usuario es Manager de "EHS", solo recibe personal de "EHS".
> 3.  **Coordinador/Supervisor:** Filtra por `Area`.
> 4.  **Empleado:** No ve la lista (retorna vacío).

---

## 3. Reglas de Validación (Gatekeepers)

Antes de guardar datos, el servidor impone estas reglas estrictas.

### Entidad: Personal
1.  **DNI:** Obligatorio. Debe ser único. No se puede modificar una vez creado.
2.  **Integridad de Tipos:**
    *   `FechaInicio`: Debe ser fecha válida.
    *   `Estado`: Mapeado internamente a Bool `Active` (Activo/Retirado vs True/False).
3.  **Auditoría Automática:**
    *   Al crear: Se inserta evento "Alta" en `PersonalEventoLaboral`.
    *   Al editar: Se inserta evento "Cambio".
    *   Al cesar: Se inserta evento "Baja".

### Entidad: Usuario (Auth)
1.  **Plataforma Segura:**
    *   El usuario debe tener `AccessWeb=true` en `UserAccessConfig` para loguearse en la web.
    *   Si intenta entrar desde App móvil sin `AccessApp=true`, se rechaza (401).
2.  **Unicidad:** No pueden existir dos usuarios con mismo DNI o Email.
