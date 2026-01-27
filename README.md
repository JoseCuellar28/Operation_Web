# OperationWeb

Sistema de gestión operacional desarrollado con **.NET 8** y **React (Web 2.0)**.

## 🚀 Descripción General

Plataforma integral para la gestión de operaciones, cuadrillas y proyectos. Arquitectura limpia (Clean Architecture) con un **Backend API-First** y un **Frontend moderno en React**.

## 🛠️ Tecnologías Principales

- **Backend**: .NET 8 (ASP.NET Core Web API)
- **Base de Datos**: SQL Server + Entity Framework Core
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Móvil**: Android Nativo (Kotlin) - *En desarrollo*
- **Herramientas**: Python (Scripts de Mantenimiento y Generación de Datos)

## 🏗️ Estructura del Proyecto

El sistema está dividido en capas para asegurar la escalabilidad:

- **OperationWeb.API**: Capa de presentación y endpoints REST.
- **OperationWeb.Business**: Lógica de negocio y casos de uso.
- **OperationWeb.DataAccess**: Persistencia y acceso a datos.
- **OperationWeb.Frontend**: Código fuente del Frontend (React).

## ⚙️ Configuración Rápida (Entorno Local)

1. **Requisitos**:
   - .NET SDK 8.0
   - Node.js 18+
   - SQL Server

2. **Ejecución**:
   - **Backend**: 
     ```bash
     dotnet run --project OperationWeb.API
     ```
     *(Escucha en http://localhost:5132)*
     
   - **Frontend**:
     ```bash
     cd OperationWeb.Frontend
     npm run dev
     ```
     *(Escucha en http://localhost:5173)*

## � Seguridad

El sistema implementa estándares de seguridad modernos, incluyendo:
- Autenticación JWT.
- Cifrado de datos en tránsito y reposo.
- Gestión de roles y permisos jerárquicos.

> **Nota para Desarrolladores**: La documentación técnica detallada, diagramas de arquitectura y guías de despliegue se encuentran en la documentación interna del equipo y no están disponibles en este repositorio público por razones de seguridad.

## 🤝 Contribución

Este es un repositorio privado/interno. El acceso y contribución están restringidos al equipo de desarrollo autorizado.

## ⚖️ Código de Conducta de los Agentes (Fase 5)
1. **Paso 1:** Antes de trabajar, hacer `git pull origin main` para tener lo último.
2. **Paso 2:** Realizar el cambio técnico en su rama respectiva.
3. **Paso 3:** Registrar el cambio en `docs/SQUAD_CHANGELOG.md`.
4. **Paso 4:** Subir la rama y crear un **Pull Request (PR)** hacia `main`.
5. **Paso 5:** Esperar la aprobación del Master para el merge.
