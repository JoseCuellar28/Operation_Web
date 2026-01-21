# Guía de Defensa del Proyecto: Operation Web 🛡️🎓

Esta guía está diseñada para responder preguntas difíciles del profesor sobre la implementación técnica, seguridad y arquitectura. Úsala para estudiar dónde está cada cosa en tu código.

---

## 🔐 1. SEGURIDAD: Encriptación y Hashing
**Profesor:** *"¿Cómo implementaste la seguridad de las contraseñas? Muéstrame el código."*

**Tu Respuesta:**
> "No guardamos contraseñas en texto plano. Utilizamos el algoritmo **BCrypt** (librería `BCrypt.Net-Next`), que es el estándar de la industria porque incorpora un 'Salt' aleatorio y un factor de trabajo (Work Factor) que hace computacionalmente costoso los ataques de fuerza bruta."

**¿Donde está el código?**
*   **Archivo:** `OperationWeb.API/Controllers/AuthController.cs`
*   **Línea clave (Validar):** Línea ~124
    ```csharp
    BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
    ```
*   **Línea clave (Crear/Hash):** Línea ~186
    ```csharp
    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
    ```

**Profesor:** *"¿Por qué no usaste AES-256 como decía la guía?"*
**Tu Respuesta:**
> "AES es una encriptación reversible (puedes desencriptar si tienes la llave). Para contraseñas, **nunca** se debe poder recuperar la original. BCrypt es un hash de un solo sentido (One-Way Function), lo cual es muchisimo más seguro en caso de que hackeen la base de datos."

---

## 🐳 2. DOCKER: Contenedores
**Profesor:** *"Explícame tu Dockerfile. ¿Es eficiente?"*

**Tu Respuesta:**
> "Sí, utilizamos una **Multi-Stage Build** (Construcción en Etapas) para optimizar el tamaño de la imagen final."

**Detalle Técnico (Ver archivo `Dockerfile`):**
1.  **Etapa 1 (Build):** Usamos la imagen `mcr.microsoft.com/dotnet/sdk:8.0` (que es pesada, ~800MB) para compilar el código.
2.  **Caché de Capas:** Copiamos primero los `.csproj` y hacemos `dotnet restore` (Líneas 7-19). Esto permite que si solo cambiamos código y no dependencias, Docker reuse la caché y compile rápido.
3.  **Etapa 2 (Runtime):** Usamos la imagen `mcr.microsoft.com/dotnet/aspnet:8.0` (que es ligera, solo lo necesario para correr).
4.  **Resultado:** Una imagen final pequeña y segura, sin el código fuente ni herramientas de compilación.

---

## 🏗️ 3. IaC: Infraestructura como Código
**Profesor:** *"¿Cómo garantiza que el entorno es reproducible? ¿Lo hiciste a mano?"*

**Tu Respuesta:**
> "Todo está codificado. Tenemos dos enfoques, pero para el despliegue final en producción utilizamos scripts de **Azure CLI** robustos."

**¿Donde revisar?**
*   **Archivo:** `tools/deploy_docker_pro.sh`
*   **Lógica:**
    1.  Crea el Grupo de Recursos (`az group create`).
    2.  Provisiona el Servidor SQL y la BBDD (`az sql server create`).
    3.  Configura el Firewall (`az sql server firewall-rule`).
    4.  Despliega el App Service apuntando a **GHCR** (`az webapp create --deployment-container-image-name`).
    5.  Inyecta la cadena de conexión automáticamente (`az webapp config appsettings set`).

Esta automatización elimina el "error humano" de configurar servidores manualmente.

---

## 🚀 4. CI/CD: Integración Continua
**Profesor:** *"¿Qué pasa cuando haces un Push a GitHub?"*

**Tu Respuesta:**
> "Se dispara un Pipeline de **GitHub Actions** definido en YAML."

**¿Donde revisar?**
*   **Archivo:** `.github/workflows/ci.yml`
*   **Pasos del Pipeline:**
    1.  **Checkout:** Baja el código.
    2.  **Setup .NET:** Instala el entorno.
    3.  **Build:** Compila para verificar que no haya errores de sintaxis.
    4.  **Docker Build & Push:** Crea la imagen Docker y la sube al registro (GHCR) automáticamente.

---

## 💾 5. BASE DE DATOS: Arquitectura
**Profesor:** *"Háblame de tu esquema. ¿Tienes integridad referencial?"*

**Tu Respuesta:**
> "Sí, es un esquema relacional normalizado. Tenemos tablas principales como `Users` y `Personal`, y tablas transaccionales como `HSE_Inspections`."

*   **Punto Clave:** Menciona la tabla `UserAccessConfigs` (Lógica de negocio para permisos) y la tabla `Personal_Staging` (usada para las cargas masivas de Excel antes de pasar a producción).
*   **Usuario DB:** "Usamos un usuario `AppUser_NonAdmin` (ver script `04_DCL...`) para que la aplicación no se conecte como Administrador, reduciendo el riesgo de seguridad."

---

**Resumen para el Examen:**
*   **Seguridad:** BCrypt (One-way hash) > AES.
*   **Docker:** Multi-stage build (SDK vs Runtime).
*   **IaC:** Scripts de Azure CLI (`deploy_docker_pro.sh`).
*   **CI/CD:** GitHub Actions que compila y dockeriza.
