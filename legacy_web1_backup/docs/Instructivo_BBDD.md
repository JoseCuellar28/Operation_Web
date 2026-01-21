# Instructivo de Ejecución de BBDD

## 1. Requisitos Previos
*   Instancia de SQL Server (Local, Docker o Azure SQL).
*   Usuario con privilegios de administrador (`sa`).

## 2. Ejecución de Scripts (Orden Secuencial)
Para instalar los objetos de base de datos, ejecute los siguientes archivos SQL ubicados en la carpeta `database/scripts/`:

### Paso 1: Estructura (Tablas, Índices, Constraints)
Ejecutar `01_DDL_Structure.sql`
*   **Acción:** Crea tablas `Personal`, `Users`, `UserAccessConfigs`.
*   **Verificación:** Asegúrese de que no haya errores de sintaxis en la consola.

### Paso 2: Permisos y Seguridad
Ejecutar `02_DCL_Permissions.sql`
*   **Acción:** Crea el login `app_limited_user` y el usuario de base de datos asociado.
*   **Permisos:** Asigna `db_datareader` y `db_datawriter` (No administrativo).
*   **Objetos Extra:** Crea el sinónimo `syn_Empleados` y la función `GetActiveUserCount`.

## 3. Infraestructura como Código (IaC)
Para desplegar la infraestructura en la nube (Azure), navegue a la carpeta `infrastructure/terraform/` y ejecute:
```bash
terraform init
terraform apply
```
Esto creará el servidor SQL, la base de datos y el App Service necesarios.
