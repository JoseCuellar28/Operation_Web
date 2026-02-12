# 🗺️ Arquitectura del Sistema: Mapeo Definitivo

Este documento detalla la infraestructura, el flujo de despliegue y la conectividad del proyecto. Sirve como referencia para entender cómo interactúan los entornos locales y de producción.

## 1. Los Dos Entornos (The Two Worlds)

### 🍏 ENTURNO LOCAL (Tu Mac)
*   **Rol:** "El Arquitecto" (Desarrollo).
*   **Función:** Aquí reside el código fuente "abierto". Se editan los archivos `.cs`, `.ts`, y se realizan pruebas unitarias o de integración local.
*   **Estado:** Los cambios aquí son estáticos hasta que se envían. Es el plano de la obra.
*   **Herramientas:** VS Code, Git, Docker Desktop (opcional para pruebas).

### 🪟 ENTORNO PRODUCCIÓN (Windows Server)
*   **Rol:** "La Fábrica" (Ejecución).
*   **Función:** Aquí se ejecuta la aplicación real que utilizan los empleados. No se edita código; se despliegan contenedores.
*   **Estado:** Entorno vivo. Utiliza Docker para orquestar los servicios.
*   **Herramientas:** Docker Engine, PowerShell, Cloudflare Tunnel (`cloudflared`).

---

## 2. El Pipeline de Despliegue (The Bridge)

El flujo de cambios desde la Mac hasta el Servidor no es directo; utiliza **GitHub** como intermediario seguro.

```mermaid
graph LR
    A[🍏 Tu MAC] -- 1. git push --> B(☁️ GitHub)
    B -- 2. git pull --> C[🪟 Windows Server]
    C -- 3. docker build --> D[🐳 Contenedores Vivos]
```

### Pasos del Ciclo de Vida:
1.  **Edición (Mac)**: Se realizan correcciones o mejoras en el código.
2.  **Sincronización (Push)**: Se suben los cambios al repositorio central en GitHub.
3.  **Descarga (Pull - Server)**: El Agente del Servidor baja la última versión del código.
4.  **Construcción (Build - Server)**: Docker compila el código y crea los contenedores (`api` y `frontend`).
    *   *Nota Crítica:* Se debe usar `--no-cache` o `docker system prune` para asegurar que Docker no reutilice versiones viejas del código.

---

## 3. Conectividad y Acceso Externo (Cloudflare)

Dado que el Windows Server suele estar detrás de un firewall o en una red privada, utilizamos **Cloudflare Tunnels** para dar acceso seguro al mundo exterior sin abrir puertos peligrosos.

```mermaid
graph TD
    subgraph "🪟 Windows Server"
        Dock[🐳 Docker Compose]
        Dock -->|Levanta| API[⚙️ Motor (.NET API)]
        Dock -->|Levanta| Web[💻 Frontend (Vite/React)]
        
        API <-->|Red Interna Docker| Web
    end
    
    subgraph "🌍 Internet"
        User[👤 Usuario / Navegador]
        Movil[📱 App Android]
    end

    API -->|Túnel Seguro| CF[☁️ Cloudflare]
    Web -->|Túnel Seguro| CF
    
    CF -->|URL Pública https://...| User
    CF -->|URL Pública https://...| Movil
```

### Puntos Clave de la Red:
*   **URL Dinámica**: Cada vez que se reinicia el túnel, Cloudflare asigna una nueva URL pública (ej: `rotten-orange...trycloudflare.com`).
*   **Inyección Automática**: El script `start_operation_smart.ps1` detecta esta nueva URL y la inyecta automáticamente en la configuración del Frontend antes de construirlo, para que la Web sepa a dónde llamar a la API.
*   **Seguridad CORS**: El Backend (.NET) está configurado para confiar explícitamente en el origen del Frontend (Reflected Origin), permitiendo el paso de credenciales (cookies) a través del túnel.

---

## 4. Comandos de Mantenimiento (Cheat Sheet)

### En la Mac (Desarrollo):
*   `git push origin main`: Subir cambios a producción.
*   `npm run build`: Verificar que el frontend compila sin errores.

### En el Servidor (Producción - PowerShell):
*   `./start_operation_smart.ps1`: **El Botón Rojo**. Baja cambios, borra contenedores viejos, reconstruye todo y levanta los túneles.
*   `docker system prune -a -f --volumes`: **Limpieza Nuclear**. Borra todo rastro de versiones anteriores para asegurar una instalación limpia.
*   `git fetch origin main && git reset --hard origin/main`: **Forzar Sincronización**. Descarta cualquier cambio local en el servidor y se alinea exactamente con GitHub.

---

## 5. Ejecución Local en Mac (¿Cómo probar antes de subir?)

Aunque el destino final es Windows, tu Mac es un entorno de ejecución completo.

### Similitudes y Diferencias:
| Característica | Local (Mac) | Producción (Windows) |
| :--- | :--- | :--- |
| **Código Fuente** | El mismo (`/api/v1/...`) | El mismo (Sincronizado vía Git) |
| **Base de Datos** | InMemory (Volátil) o SQL Local | SQL Server (Persistente) |
| **URL Base** | `http://localhost:5132` | `https://...trycloudflare.com` |
| **CORS** | Refleja `localhost` | Refleja `...trycloudflare.com` |

### Pasos para Arrancar en Mac:
1.  **Backend**: Abra una terminal en `OperationWeb.API` y ejecute `dotnet run`.
    *   *Verificación:* Navegue a `http://localhost:5132/health`. Debe decir "Healthy".
2.  **Frontend**: Abra otra terminal en `OperationWeb.Frontend` y ejecute `npm run dev`.
    *   *Acceso:* Navegue a `http://localhost:5173`.
### Herramientas de Verificación en Mac:
*   **sqlcmd**: Herramienta de línea de comandos para consultar la base de datos directamente sin pasar por la API.
    *   Ejemplo: `/opt/homebrew/bin/sqlcmd -S 100.125.169.14 -U SA -P 'Password' -d DB_Operation -Q "SELECT TOP 5 * FROM Users"`
*   **Logs en tiempo real**: Al usar `dotnet run` y `npm run dev`, los errores aparecen instantáneamente en la terminal.

### Configuración Sensible (Local):
*   **appsettings.Development.json**: Este archivo es el más importante en la Mac. Contiene las credenciales reales para conectar a la base de datos de Tailscale. **NUNCA** debe subirse a producción (está en `.gitignore`).
*   **Identidad**: El sistema local utiliza la tabla `Users` de producción. Si no puedes loguearte localmente, probablemente es un problema de red (VPN) o de que el usuario no está marcado como `IsActive = 1`.

---

## 6. El Mundo del Servidor (Windows Production)

El servidor no es solo una máquina; es un ecosistema de contenedores aislados.

### Especificaciones Técnicas:
*   **SO**: Windows Server con Docker Engine.
*   **Orquestación**: Docker Compose.
*   **Red**: Los contenedores viven en una red interna privada. Solo son visibles al mundo a través de Cloudflare.

### El Corazón del Despliegue: `start_operation_smart.ps1`
Este script de PowerShell es el que "mueve los hilos" en producción. Realiza 4 acciones críticas:
1.  **Descubrimiento**: Pregunta a Cloudflare: *"¿En qué URL estás hoy?"*.
2.  **Sincronización**: Hace un `git reset --hard` para asegurar que el código es el de GitHub.
3.  **Inyección**: Escribe la URL oficial del Backend dentro del código del Frontend (`docker-compose.prod.yml`).
4.  **Ignición**: Ejecuta `docker-compose up --build --force-recreate` para levantar todo limpio.

### Gestión de Logs en el Servidor:
Para ver qué está pasando dentro del motor en la Windows Server:
*   `docker logs operation_backend -f`: Muestra el tráfico de la API en tiempo real.
*   `docker logs operation_frontend -f`: Muestra los logs del servidor web (Nginx/Vite).

---

## 8. Deep Dive: Arquitectura Interna del Servidor (The Engine Room)

Esta sección explica cómo se "hablan" los componentes dentro de la Windows Server.

### A. La Red Interna de Docker (Docker Network)
Docker crea una red virtual privada (ej. `operation_web_network`) donde viven los contenedores.
*   **Visibilidad**: Los contenedores no conocen las IPs externas del servidor. Se hablan usando sus nombres de servicio:
    *   El Frontend busca a la API en: `http://operation_backend:5132` (internamente).
*   **Aislamiento**: Nada desde fuera puede entrar a esta red, excepto a través de las "puertas" que abrimos.

### B. El Ciclo de Cloudflare Tunnel (External Traffic)
El servidor corre dos procesos `cloudflared` (Túneles) que actúan como guardaespaldas:
1.  **Conexión de Salida**: El servidor se conecta a Cloudflare (no al revés). Esto salta cualquier Firewall.
2.  **Mapeo Dinámico**: 
    *   Túnel 1 -> Redirige tráfico a `http://localhost:5173` (Frontend).
    *   Túnel 2 -> Redirige tráfico a `http://localhost:5132` (Backend).
3.  **Identidad**: Cada túnel genera una URL tipo `.trycloudflare.com`.

### C. Capa de Datos: Conexión a SQL Server
El acceso a la base de datos `100.125.169.14` ocurre a nivel de la máquina física (Host).
*   **Ruta**: Contenedor Backend -> Puerta de Enlace Docker -> Red Tailscale -> SQL Server.
*   **Seguridad**: El servidor Windows debe estar logueado en Tailscale para que el contenedor pueda llegar a la IP `100.x.x.x`. Si Tailscale cae en el servidor, la App reportará "Error 500".

```mermaid
graph TD
    subgraph "Nube Cloudflare"
        URL[URL Pública https://...]
    end

    subgraph "🪟 Windows Server (Host)"
        Tail[🛡️ Tailscale/Red Privada]
        Tunnel[☁️ Cloudflare Tunnel]

        subgraph "🐳 Docker Engine"
            subgraph "Red Interna: operation_web_net"
                API[⚙️ API .NET Core]
                Web[💻 Frontend Nginx]
            end
        end
    end

    subgraph "🗄️ Servidor Externo"
        SQL[(SQL Server 100.125.169.14)]
    end

    URL -->|Tunnel| Tunnel
    Tunnel -->|Port Forward| API
    Tunnel -->|Port Forward| Web
    API -->|TCP 1433| Tail
    Tail -->|Ruta Privada| SQL
```


---

## 10. Mapeo de Flujo: El Triángulo de Producción (La Clave del Problema)

Para resolver los errores persistentes, es vital entender que la comunicación **no es interna entre contenedores**, sino que pasa por el navegador del usuario.

### El Triángulo de Comunicación:

```mermaid
sequenceDiagram
    participant U as 👤 Navegador (Usuario)
    participant CF as ☁️ Cloudflare (Tunnels)
    participant F as 💻 Contenedor Frontend
    participant B as ⚙️ Contenedor Backend
    participant DB as 🗄️ SQL Server (Tailscale)

    Note over U, DB: 1. Carga de la Web
    U->>CF: GET https://frontend...trycloudflare.com
    CF->>F: Redirige a localhost:5173
    F-->>U: Envía HTML/JS (Código del Frontend)

    Note over U, DB: 2. Intento de Login (Punto de Crítico)
    U->>CF: POST https://backend...trycloudflare.com/api/v1/auth/login
    Note right of U: El navegador usa la variable VITE_API_URL
    CF->>B: Redirige a localhost:5132
    
    Note over B, DB: 3. Verificación de Datos
    B->>DB: Query DNI/Password (IP 100.125.169.14)
    DB-->>B: Retorna Usuario
    
    Note over B, U: 4. Respuesta y CORS
    B-->>CF: Responde 200 OK + Cabeceras CORS
    CF-->>U: Entrega JSON al Navegador
```

### Por qué el Mapeo se rompe (Causas de Error):

1.  **VITE_API_URL Desactualizada**: 
    *   Si el Frontend se construye con una URL de backend vieja, el navegador del usuario llamará a un túnel muerto.
    *   *Mapeo Correcto*: Se inyecta en cada arranque vía `start_operation_smart.ps1`.

2.  **La Ilusión de "Red Interna"**:
    *   Muchos errores ocurren al creer que el Frontend y el Backend se hablan por IP interna de Docker. 
    *   *Realidad*: El Frontend (React) vive en el navegador del cliente. La red interna de Docker solo sirve para que el contenedor Nginx sirva los archivos estáticos. **Toda la lógica de API debe ser pública vía Cloudflare.**

3.  **CORS Reflected**:
    *   Como las URLs del Frontend y Backend son distintas, el navegador bloquea la comunicación a menos que el Backend "mapee" de vuelta el origen exacto del Frontend.

---

## 7. Bitácora de Ajustes Arquitectónicos (Enero-Febrero 2026)

Para que el sistema funcione en local y producción sin errores, se aplicaron estos cambios estructurales:

### A. Unificación de Prefijos (Routing)
*   **Problema**: Había rutas mezcladas (`/api/auth`, `/api/v1/attendance`). El servidor bloqueaba las que no tenían `/v1/`.
*   **Solución**: Todas las rutas ahora nacen bajo `/api/v1/`.
*   **Archivos Clave**: `AuthController.cs`, `authService.ts`, `userService.ts`.

### B. CORS de Grado Industrial
*   **Problema**: El uso de comodines (`*`) bloquea el envío de cookies de seguridad (Cloudflare).
*   **Solución**: Se eliminó el middleware manual y se activó `AddCors` + `UseCors` con la política de **Reflexión dinámica**. El servidor ahora mira quién le habla y le da permiso solo a ese origen, permitiendo "Credentials".
*   **Archivos Clave**: `Program.cs`, `api.ts` (con `withCredentials: true`).

---

## 9. Correlación de Errores y Diagnóstico (Troubleshooting)

Esta sección conecta los síntomas comunes con su causa raíz en la arquitectura.

### 🚩 Síntoma: `Access-Control-Allow-Origin: *` (CORS Wildcard)
*   **Correlación**: **Falla de Hardening / Prefijo de Ruta**.
*   **Causa**: El cliente está llamando a una ruta que **NO** empieza con `/api/v1/` (ej: `/api/auth/login`).
*   **Por qué ocurre**: El servidor está configurado para solo aceptar `/api/v1/`. Cualquier otra cosa cae en el "Muro de Seguridad 404" (Catch-all), el cual, por diseño, responde con un comodín (`*`) que invalida las credenciales.
*   **Solución**: Asegurar que en el Frontend el servicio use `/api/v1/`.

### 🚩 Síntoma: `Unexpected token <` (HTML en lugar de JSON)
*   **Correlación**: **Falla de Networking / Túnel**.
*   **Causa**: El Frontend está recibiendo una página de error 404 (HTML de Nginx o Cloudflare) en lugar del JSON de la API.
*   **Por qué ocurre**: La variable `VITE_API_URL` apunta a un túnel que está apagado o a una dirección que no existe, por lo que el proxy devuelve una página de "Not Found".
*   **Solución**: Verificar que el Túnel de la API esté arriba y que la URL en `docker-compose.prod.yml` sea la correcta.

### 🚩 Síntoma: `500 Internal Server Error` (Timeout)
*   **Correlación**: **Falla de Capa de Datos (Tailscale)**.
*   **Causa**: El motor (.NET) no puede hablar con el SQL Server en `100.125.169.14`.
*   **Por qué ocurre**: El servidor Windows ha perdido la conexión a Tailscale o el contenedor no tiene permiso para salir a la red privada.
*   **Solución**: Reiniciar Tailscale en el servidor y verificar que el SQL Server esté accesible.

### 🚩 Síntoma: `Login Error / Bad Request` (Captcha Fail)
*   **Correlación**: **Falla de Estado (Session/Token)**.
*   **Causa**: El servidor rechaza el captcha o el token de sesión.
*   **Por qué ocurre**: Generalmente es una consecuencia de los errores de CORS anteriores, donde el navegador bloquea las cookies de sesión, haciendo que el servidor crea que no hay un captcha válido activo.
*   **Solución**: Limpiar caché del navegador (Hard Refresh) y asegurar que el CORS sea el correctivo Industrial (Reflected Origin).


