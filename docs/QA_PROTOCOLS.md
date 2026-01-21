# Protocolo de Auditoría Blindada (QA Armored Protocol)
**Versión:** 1.0
**Fecha:** 2026-01-16
**Alcance:** Todas las validaciones de cierre de Sprint y Pases a Producción.

## 1. Verificación de Origen (Anti-Caché)
**Objetivo:** Eliminar falsos positivos causados por versiones antiguas guardadas en el navegador (Service Workers / Disk Cache).

*   **Instrucción Obligatoria:** Antes de reportar cualquier hallazgo visual o de conectividad.
*   **Procedimiento:**
    1.  Realizar "Limpieza Forzada" (`Ctrl + F5` / `Cmd + Shift + R`).
    2.  Inspeccionar la pestaña **Network** en DevTools.
    3.  Verificar la columna **Size/Transferred**: Debe indicar un tamaño en bytes recibidos, NO "(ServiceWorker)" ni "(disk cache)".
*   **Criterio de Aceptación:** La respuesta proviene estrictamente del servidor remoto/local.

## 2. Validación de Formato Estricto (Hardening)
**Objetivo:** Asegurar que los puertos de backend (ej. 5132) no expongan superficie de ataque ni interfaces no autorizadas.

*   **Instrucción:** Verificar headers de respuesta en rutas raíz o no-API.
*   **Procedimiento:**
    1.  Consultar el endpoint raíz (ej. `http://localhost:5132/`).
    2.  Examinar el header `Content-Type`.
*   **Criterión de Aceptación:**
    *   ✅ **Pasa:** `application/json; charset=utf-8`
    *   ❌ **Falla Crítica:** `text/html`, `application/xhtml+xml` (Indica exposición de UI).

## 3. Prueba de "La Verdad" Cruzada
**Objetivo:** Asegurar la integridad del pipeline de datos (Excel -> DB -> API -> Frontend) y detectar "Mock Data".

*   **Instrucción:** Validar un dato específico desde la fuente hasta la interfaz.
*   **Procedimiento:**
    1.  **Fuente:** Documentar un ID de transacción o DNI cargado en el Excel/DB (`DB_Operation`).
    2.  **Destino:** Navegar a la Web 2 (`localhost:5173`) y localizar el mismo registro.
    3.  **Evidencia:** Captura de pantalla lado a lado o traza de logs.
*   **Criterio de Aceptación:** Los datos deben ser idénticos. Cualquier discrepancia bloquea el release.
