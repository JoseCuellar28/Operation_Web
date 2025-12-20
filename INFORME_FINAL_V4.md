# INFORME TÉCNICO V4.0: DOCUMENTACIÓN MAESTRA - OPERATION WEB

**Fecha:** 19 de Diciembre, 2025  
**Versión:** 4.0 (Integral)  
**Autor:** Equipo de Desarrollo (Operation Web Team)  

> **Nota:** Este documento consolida la especificación técnica, el mapa de archivos fuente y la guía de defensa del proyecto.

---

## 1. RESUMEN EJECUTIVO
**Operation Web** es una plataforma Cloud-Native desplegada en **Azure** para la gestión operativa y seguridad industrial (HSE). Utiliza una arquitectura moderna basada en contenedores Docker y servicios PaaS, garantizando alta disponibilidad y escalabilidad.

---

## 2. MAPA DE ARCHIVOS Y UBICACIÓN DE CÓDIGO (EVIDENCIA)
A continuación se detallan las **rutas exactas** donde se implementa cada requerimiento crítico.

### 2.1. Seguridad y Autenticación
*   **Implementación BCrypt (Hash):** `OperationWeb.API/Controllers/AuthController.cs` (Línea 186).
*   **Verificación de Login:** `OperationWeb.API/Controllers/AuthController.cs` (Línea 124).
*   **Configuración CORS/JWT:** `OperationWeb.API/Program.cs` (Línea 45).

### 2.2. Base de Datos (SQL Server)
*   **Estructura (Tablas/Funciones):** `database/scripts/01_DDL_Structure.sql`.
*   **Usuario No-Admin:** `database/scripts/04_DCL_NonAdminUser.sql`.
*   **Script de Reparación/Restauración:** `final_repair_script.sql` (Raíz).

### 2.3. DevOps e Infraestructura (IaC)
*   **Script de Despliegue Azure:** `tools/deploy_ultimate.sh` (Contiene comandos `az cli`).
*   **Pipeline CI/CD:** `.github/workflows/ci.yml`.
*   **Definición Docker:** `Dockerfile` (Raíz del repositorio).

### 2.4. Frontend
*   **Configuración Dinámica API:** `frontend/Modelo_Funcional/config.js`.
*   **Lógica Dashboard:** `frontend/Modelo_Funcional/js/dashboard_moderno.js`.
*   **Lógica Login:** `frontend/Modelo_Funcional/js/login.v2.js`.

---

## 3. ARQUITECTURA TÉCNICA (DETALLADA)

### 3.1. Flujo de Datos
```mermaid
graph TD
    User[Usuario] -->|HTTPS/TLS 1.2| CDN[Azure Storage Web]
    CDN -->|JSON/REST| API[Azure App Service (Linux)]
    API -->|TCP 1433| SQL[Azure SQL Database]
    API -->|Logs| AppInsights[Azure Monitor]
```

### 3.2. Stack Tecnológico
*   **Frontend:** Vanilla JS + Tailwind CSS (Sin frameworks pesados, optimizado para velocidad).
*   **Backend:** ASP.NET Core 8.0 (LTS).
*   **ORM:** Entity Framework Core.
*   **Base de Datos:** Azure SQL (PaaS).
*   **Contenedores:** Docker (Multi-stage build).

---

## 4. DICCIONARIO DE DATOS (ESQUEMA SQL)

### 4.1. Tabla: `Users` (Identidad)
| Columna | Tipo | Restricciones | Propósito |
| :--- | :--- | :--- | :--- |
| `Id` | `INT` | PK, Identity | ID Interno. |
| `DNI` | `NVARCHAR(40)` | UK, Not Null | Identificador de Login. |
| `PasswordHash` | `NVARCHAR(200)` | Not Null | Hash seguro (BCrypt). |
| `Role` | `NVARCHAR(20)` | Default 'User' | RBAC (Admin/User). |

### 4.2. Tabla: `Personal` (RRHH)
| Columna | Tipo | Restricciones | Propósito |
| :--- | :--- | :--- | :--- |
| `DNI` | `NVARCHAR(40)` | PK, FK | Vínculo con tabla Users. |
| `Inspector` | `NVARCHAR(100)` | Not Null | Nombre completo. |
| `Cargo` | `NVARCHAR(100)` | Nullable | Puesto (ej: Chofer). |
| `Division` | `NVARCHAR(100)` | Nullable | Unidad de Negocio. |

### 4.3. Tabla: `HSE_Inspections` (Seguridad)
| Columna | Tipo | Restricciones | Propósito |
| :--- | :--- | :--- | :--- |
| `Id` | `INT` | PK | Folio de Inspección. |
| `InspectorDNI` | `NVARCHAR(20)` | FK | Quién inspeccionó. |
| `Status` | `NVARCHAR(20)` | Default 'Draft' | Estado del flujo. |

---

## 5. ESPECIFICACIÓN DE SEGURIDAD (DEFENSA)

### 5.1. Cifrado de Contraseñas (BCrypt vs AES)
**Pregunta frecuente:** ¿Por qué no AES?
**Respuesta:**
1.  **AES (Simétrico):** Es reversible. Si roban la llave, roban todas las contraseñas.
2.  **BCrypt (Hashing):** Es una función unidireccional diseñada para ser lenta computacionalmente (Work Factor), protegiendo contra ataques de fuerza bruta.
    *   *Ubicación:* Ver `AuthController.cs` líneas 124 y 186.

### 5.2. Seguridad Perimetral
*   **Firewall SQL:** Configurado en `deploy_ultimate.sh` (Línea 45) para denegar tráfico público no Azure.
*   **TLS 1.2:** Encriptación forzada en tránsito para evitar ataques Man-in-the-Middle.

---

## 6. INFRAESTRUCTURA COMO CÓDIGO (IaC)

El script `tools/deploy_ultimate.sh` automatiza la creación de recursos.

| Línea | Comando | Acción Técnica |
| :--- | :--- | :--- |
| 35 | `az group create` | Crea RG `OperationWeb-RG`. |
| 40 | `az sql server create` | Provisiona servidor lógico SQL. |
| 45 | `az sql firewall-rule` | Abre puerto 1433 solo a Azure. |
| 69 | `az appservice plan` | Crea granja Linux (F1 Free Tier). |
| 72 | `az webapp create` | Despliega contenedor Docker .NET 8. |
| 82 | `config appsettings` | **Seguridad**: Inyecta ConnectionString como variable de entorno (Secret). |

---

## 7. API REST (ENDPOINTS)

El sistema expone los siguientes controladores documentados:

1.  **`AuthController`** (`/api/auth`): Login, JWT, Captcha.
2.  **`PersonalController`** (`/api/personal`): CRUD Personal, Historial de Cargas.
3.  **`ProyectosController`** (`/api/proyectos`): Gestión de Obras.
4.  **`HseController`** (`/api/hse`): Inspecciones y Reportes de Seguridad.
5.  **`UsersController`** (`/api/users`): Gestión de Usuarios administrativos.

---

## 8. CUMPLIMIENTO DE ENTREGABLES (CHECKLIST)

| # | Requerimiento | Estado | Evidencia y Ruta del Archivo |
| :--- | :--- | :---: | :--- |
| 1 | **Instructivo BD** | ✅ | `database/scripts/README.txt` / `DEMO_CLASS_GUIDE.md` |
| 2 | **IaC (Code)** | ✅ | `tools/deploy_ultimate.sh` (Script Bash de Azure CLI) |
| 3 | **CI/CD GitHub** | ✅ | `.github/workflows/ci.yml` (Pipeline YAML) |
| 4 | **Usuario No-Admin** | ✅ | `database/scripts/04_DCL_NonAdminUser.sql` |
| 5 | **Objetos SQL** | ✅ | `database/scripts/01_DDL_Structure.sql` (Tablas, Indices) |
| 6 | **Manual de Uso** | ✅ | `walkthrough.md` (Guía paso a paso) |
| 7 | **ETL** | ✅ | `PersonalController.cs` (Lógica de Carga Masiva) |
| 8 | **Encriptación** | ✅ | BCrypt en `AuthController.cs` / HTTPS forzado |
| 9 | **Docker** | ✅ | `Dockerfile` (Raíz) / Imagen en GHCR |
| 10 | **Conexión BD** | ✅ | `appsettings.json` (Inyectado por Azure) |
| 11 | **Código Fuente** | ✅ | Repositorio Completo |
| 12 | **ZIP Entregable** | ✅ | `entregable_final.zip` |
| 13 | **Repositorio** | ✅ | GitHub URL Activa |

---
**Generado por:** Asistente de IA (DevOps Lead).
**Versión:** 4.0 (Máximo Detalle)
