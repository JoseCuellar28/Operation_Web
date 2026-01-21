# Guía de Demostración: "Desinstalación e Instalación en Vivo (DevOps)"

Esta guía es tu **Biblia para la Presentación**. Sigue los pasos exactos y todo funcionará.
El objetivo es demostrar: **Destrucción Total -> Recuperación Automática (IaC) -> Integración Híbrida.**

---

## 🛑 FASE 1: "Desinstalar" (Eliminar Azure)

**Contexto:** El profesor dice *"Eliminen todo para demostrar que no hay truco".*

1.  Abre **Azure Cloud Shell** (ícono de terminal `>_` arriba a la derecha en Azure Portal).
2.  Ejecuta este comando (Borrado Nuclear):
    ```bash
    az group delete --name OperationWeb-RG --yes --no-wait
    ```
3.  **Resultado visual:** Azure dirá que la eliminación está en proceso.
4.  **Confirmación:** En 1 minuto, entra a `https://operationweb-api.azurewebsites.net`. Dará error o no cargará. **Misión Cumplida.**

---

## 🏗️ FASE 2: "Reconstruir" (Infrastructure as Code)

**Contexto:** El profesor dice *"Ahora levántalo todo de nuevo y haz que funcione".*
*Nota:* Usamos Terraform para crear la infraestructura (Servidores, Redes, BD) desde cero.

1.  En el **Cloud Shell**, descarga el código limpio:
    ```bash
    rm -rf Operation_Web
    git clone https://github.com/JoseCuellar28/Operation_Web.git
    cd Operation_Web/infrastructure/terraform
    ```
2.  Despliega la Infraestructura:
    ```bash
    terraform init
    terraform apply -auto-approve
    ```
    *(Esto tomará unos 3-5 minutos. Mientras tanto, explica que Terraform está creando el Servidor SQL, el Firewall, y el App Service B1).*

3.  **Verificación de Vida:**
    *   Una vez termine Terraform, espera 2 minutos (el App Service está descargando Docker).
    *   Prueba el link: `https://operationweb-api.azurewebsites.net/health` -> Debe decir **"Healthy"** (o devolver error 405 Method Not Allowed, lo cual significa que ESTÁ VIVO).

---

## 🔑 FASE 3: "Verificación de Datos Automática" (Seed Data)

**Contexto:** Ya NO necesitas correr scripts manuales. La aplicación detecta que la BD es nueva y crea automáticamente los usuarios y datos de prueba.

1.  **Explícale al profesor:** *"La aplicación tiene un sistema de 'Self-Healing'. Al arrancar, si ve la base de datos vacía, inyecta la configuración base automáticamente."*
2.  **Verifícalo (Opcional):**
    *   Entra al Query Editor.
    *   `SELECT * FROM Users` -> Verás a `admin` y `colaborador`.
    *   `SELECT * FROM Proyectos` -> Verás 3 proyectos de prueba.

---

### Credenciales Listas para Usar:

| Usuario | Contraseña | Rol | Nivel |
| :--- | :--- | :--- | :--- |
| **admin** | `Prueba123` | Admin | Manager (Ve todo) |
| **colaborador** | `Prueba123` | Usuario | Employee (Ve sus proyectos) |

---

## 🌐 FASE 4: "Conexión Híbrida" (Frontend Local -> Azure Cloud)

**Contexto:** Demostrar que tu Frontend local puede conectarse al Backend en la Nube.

1.  Abre tu proyecto Frontend en VS Code y ejecútalo (Click derecho en `login.html` -> Open with Live Server, o doble click al archivo).
2.  En el navegador, presiona **F12** y ve a la pestaña **Consola**.
3.  Escribe el comando de "Enlace":
    ```javascript
    // ¡IMPORTANTE! Copia la URL que te dio Terraform (output: api_url)
    // SI CHROME NO TE DEJA PEGAR: Escribe "allow pasting" y dale ENTER primero.
    localStorage.setItem('api_net', 'https://operationweb-api-XXXX.azurewebsites.net');
    ```
    *(Reemplaza las XXXX con lo que diga tu terminal al final de Terraform Apply).*
    *Presiona ENTER.*
4.  **Recarga la página (F5).**
5.  Inicia Sesión:
    *   User: `admin`
    *   Pass: `Prueba123`
6.  **¡ÉXITO TOTAL!** Estás dentro.

---

## ☁️ FASE 5: "El Ataque" (Web 100% Nube para Hacking)

**Contexto:** El profesor pide: *"Quiero ver la web en Internet para probar SQL Injection real".*

1.  En el **Cloud Shell** (donde corriste Terraform):
    ```bash
    cd ../..
    sh tools/deploy_frontend_manual.sh
    ```
    *(Este script mágico detecta tu servidor y sube los archivos HTML).*

2.  **Resultado:** Te dará un link verde, ej: `https://opwebfronta1b2.z13.web.core.windows.net/`.
3.  **¡Ábrelo!**
    *   Esta web vive en Azure Storage.
    *   Se conecta a tu API en Azure App Services.
    *   Usa tu Azure SQL.
    *   **¡Es el entorno perfecto para Hackear!**

---

## 📝 RESUMEN TÉCNICO (Preguntas de Examen)

*   **¿Arquitectura?** Cliente-Servidor Desacoplado (Front en Local/Nube, Back en Azure Container).
*   **¿Base de Datos?** Azure SQL. Se crea y migra automáticamente (Schema) pero los datos sensibles (Usuarios) se inyectan por SQL seguro.
*   **¿Seguridad?** Usamos **AES Encryption** (no Hash simple) para las contraseñas y una tabla `UserAccessConfigs` para controlar quién entra a la Web vs App Móvil.
*   **¿CI/CD?** GitHub Actions compila el Docker y lo sube a GHCR. Azure lo descarga automáticamente.
