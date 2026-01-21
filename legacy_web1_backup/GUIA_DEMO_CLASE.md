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
4.  **Confirmación:** En 5-10 minutos, entra a tu link anterior. Dará error 404. **Misión Cumplida.**

---

## 🏗️ FASE 2: "Reconstrucción" (Disaster Recovery)

**IMPORTANTE:** Tienes que hacer 2 cosas. El script hace el 90%, tú haces el 10% (Base de Datos).

### PASO 1: Ejecutar la Magia (Infraestructura y Código)
En la misma terminal (asegúrate de estar en la carpeta correcta `cd Operation_Web`):

```bash
sh tools/deploy_docker_pro.sh
```

*   **¿Qué hace esto?** Conecta con **GitHub Container Registry**, descarga tu imagen Docker real y la despliega en Azure.
*   **Requisito:** Te pedirá tu usuario de GitHub y tu Token (PAT).
*   **Tiempo:** ~5-7 minutos.

### PASO 2: Inyectar el Alma (Base de Datos) ⚠️ CRÍTICO ⚠️
El script crea la base de datos **VACÍA**. Si intentas loguearte ahora, fallará.

1.  Ve al **Portal de Azure** -> Busca `SQL databases` -> Entra a `OperationWebDB`.
2.  En el menú izquierdo, clic en **Query editor (preview)**.
3.  **Login:**
    *   Usuario: `sqladmin`
    *   Password: `ChangeThisStrongPassword123!`
4.  Abre el archivo `final_repair_script.sql` en tu editor local.
5.  **COPIA TODO EL CONTENIDO** y pégalo en el editor de Azure.
6.  Clic en **Run** ▶️.

---

## ✅ FASE 3: Verificación Final

1.  Abre el link del Frontend (que te dio el script al final, color verde).
2.  Refresca con `Ctrl + Shift + R`.
3.  Logueate con `admin` / `Prueba123`.

¡Listo! Has recuperado el sistema desde cero en menos de 10 minutos. 😎
uir" (Infrastructure as Code)

**Contexto:** El profesor dice *"Ahora levántalo todo de nuevo y haz que funcione".*
*Nota:* Usamos Terraform (o Script Manual) para crear la infraestructura.

**Opción A (Recomendada - Script Todo en Uno):**
Si tienes el script `tools/deploy_ultimate.sh` (que creamos hoy), úsalo. Es lo más rápido.
```bash
sh tools/deploy_docker_pro.sh
```

**Opción B (Clásica - Manual):**
1.  Descarga el código o ve a la carpeta:
    ```bash
    cd infrastructure/terraform
    terraform init
    terraform apply -auto-approve
    ```
    *(Esto creará SQL y App Service de nuevo. Copia la URL que sale al final).*

---

## 🔑 FASE 3: "El Paso Secreto" (Parchear Frontend)

**Contexto:** Terraform crea el servidor, pero **NO** le dice a tu página web "Oye, esta es mi nueva dirección".
**TIENES QUE HACER ESTO SIEMPRE QUE BORRES Y RECREES.**

Desde la raíz del proyecto:
```bash
*(El script 'Pro' ya hace esto automáticamente, pero si necesitas forzarlo):*
sh tools/deploy_frontend_manual.sh
```

**¿Qué hace esto?**
1.  Busca tu nueva Nube.
2.  Inyecta la nueva URL en el código Javascript (`algo-random.azurewebsites.net`).
3.  Te da el link final VERDE. **¡Ese es el que funciona!**

---

## 🌐 FASE 4: "Prueba de Fuego" (Login)

1.  Abre el link verde que te dio el script anterior.
2.  Ingresa con:
    *   **User:** `admin`
    *   **Pass:** `Prueba123`
3.  **Resultado Esperado:** ¡Entrarás al Dashboard!

*(Nota: La base de datos se auto-regenera sola la primera vez que la Api arranca, por eso el login funciona).*

---

## 🩺 DIAGNÓSTICO RÁPIDO (Si algo falla)

**Caso 1: "Sigo viendo localhost"**
*   **Solución:** Abre la consola (F12) y ejecuta:
    ```javascript
    localStorage.removeItem('api_net');
    window.location.reload();
    ```
    *(Esto borra cualquier configuración vieja y fuerza a leer la nueva).*

**Caso 2: "Quiero apuntar mi localhost a la nube manual"**
*   **Solución:** Abre la consola (F12) y ejecuta:
    ```javascript
    localStorage.setItem('api_net', 'TU_NUEVA_URL_AQUI');
    window.location.reload();
    ```

---

## 📝 RESUMEN TÉCNICO (Preguntas de Examen)

*   **¿Arquitectura?** Cliente-Servidor Desacoplado (Static Frontend en Azure Storage -> Backend en App Service Linux).
*   **¿Base de Datos?** Azure SQL serverless (Básico). Seed automático al inicio (Code-First).
*   **¿Seguridad?** Migramos de AES a **BCrypt** ($2a$11$) para hashing robusto de contraseñas.
*   **¿Infraestructura?** IaC con Bash (`deploy_docker_pro.sh`) desplegando Contenedores Nativos desde GHCR.
