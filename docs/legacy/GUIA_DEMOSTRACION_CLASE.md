# Guía de Demostración: "Desinstalación e Instalación en Vivo"

Esta guía está diseñada para cumplir con el requerimiento del profesor: **Demostrar que el sistema se puede "desinstalar" y "volver a instalar" en cualquier entorno.**

## Concepto Clave
Para esta demostración, usamos **Infraestructura como Código (Terraform)**.
*   **Desinstalar** = Destruir Infraestructura (`terraform destroy`)
*   **Instalar** = Crear Infraestructura (`terraform apply`) + Despliegue de DB.

---

## ESCENARIO 1: "Desinstalar" la Plataforma (Borrado Total)
*Tiempo estimado: 5-10 minutos*

Si el profesor pide "eliminar todo rastreo de la aplicación":

1.  Abre **Azure Cloud Shell**.
2.  Ve a la carpeta de Terraform:
    ```bash
    cd Operation_Web/infrastructure/terraform
    ```
3.  Ejecuta el comando de destrucción:
    ```bash
    terraform destroy -auto-approve
    ```
4.  **Resultado visual:** Verás en la consola cómo se eliminan "Resources: 4 destroyed".
5.  **Prueba:** Intenta entrar a la web de la app. **Dará error 404**. (Evidencia de que no existe).

---

## ESCENARIO 2: "Instalar" desde cero (Despliegue Fresco)
*Tiempo estimado: 5-10 minutos*

Si el profesor dice "ahora instálalo en este entorno nuevo":

### Paso 1: Obtener el Código (En cualquier máquina con Azure Access)
```bash
# Simula llegar a una máquina limpia
git clone https://github.com/JoseCuellar28/Operation_Web.git
cd Operation_Web/infrastructure/terraform
```

### Paso 2: Levantar Infraestructura (Servidores)
```bash
# Inicializa y Crea
terraform init
terraform apply -auto-approve
```
*   **Explicación al profesor:** *"En este momento, Terraform está construyendo el Servidor SQL, la Base de Datos y el Servidor Web Automáticamente siguiendo nuestra 'receta' de código."*

### Paso 3: Inicializar la Base de Datos
Una vez termine Terraform (muestra los recursos en verde):
```bash
# Vuelve a la raíz
cd ../.. 

# Ejecuta el inyector de base de datos
python3 tools/deploy_azure_db.py
```
*   **Explicación:** *"Ahora usamos un script automatizado para crear todas las tablas y usuarios en la base de datos nueva."*

### Paso 4: Verificación Final
1.  Busca la URL de la web en el portal de Azure (App Service).
2.  Abre la web.
3.  Comprueba que carga el Login.

---

## RESUMEN PARA SUSTENTACIÓN
*   **Portabilidad:** "Como ven, no instalé nada manualmente en el servidor. Todo está en el código (`main.tf`). Puedo correr este comando en mi laptop, en la laptop del profesor o en Azue Cloud Shell y el resultado es el mismo."
*   **Despliegue:** "Pasamos de cero a tener App + BD funcionando en menos de 10 minutos."
