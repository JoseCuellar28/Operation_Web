# OperationWeb

Sistema de gestión operacional desarrollado con .NET 9 y Clean Architecture.

## � Descripción General

Este proyecto es una plataforma integral para la gestión de operaciones, cuadrillas y proyectos. Está construido siguiendo principios de arquitectura limpia y mejores prácticas de desarrollo moderno.

## 🛠️ Tecnologías Principales

- **Backend**: .NET 8 (ASP.NET Core Web API)
- **Base de Datos**: SQL Server + Entity Framework Core
- **Frontend**: HTML5, CSS3 (Tailwind), JavaScript (Vanilla)
- **Servicios Auxiliares**: Python (Flask) para procesamiento de datos

## 🏗️ Estructura del Proyecto

El sistema está dividido en capas para asegurar la escalabilidad y mantenibilidad:

- **API**: Capa de presentación y endpoints REST.
- **Business**: Lógica de negocio y casos de uso.
- **DataAccess**: Persistencia y acceso a datos.
- **Infrastructure**: Servicios externos y utilidades transversales.

## ⚙️ Configuración Rápida (Entorno Local)

1. **Requisitos**:
   - .NET SDK 9.0
   - SQL Server
   - Python 3.9+

2. **Ejecución**:
   - Backend: `dotnet run --project OperationWeb.API`
   - Frontend: Servidor HTTP simple (ej. `python3 -m http.server 8000`)

## � Seguridad

El sistema implementa estándares de seguridad modernos, incluyendo:
- Autenticación JWT.
- Cifrado de datos en tránsito y reposo.
- Gestión de roles y permisos jerárquicos.

> **Nota para Desarrolladores**: La documentación técnica detallada, diagramas de arquitectura y guías de despliegue se encuentran en la documentación interna del equipo y no están disponibles en este repositorio público por razones de seguridad.

## 🤝 Contribución

Este es un repositorio privado/interno. El acceso y contribución están restringidos al equipo de desarrollo autorizado.
