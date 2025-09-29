# 🏢 OCA OperationSmart - Sistema de Gestión de Inventarios

## 📋 Descripción del Proyecto

**OCA OperationSmart** es una plataforma web para la digitalización del flujo operativo de OCA Global, enfocada en servicios de instalaciones desde la planificación web hasta la ejecución móvil en campo.

## 🎯 Objetivo Principal

Digitalizar el flujo operativo de OCA Global para servicios de instalaciones, desde la planificación web hasta la ejecución móvil en campo.

## 🏗️ Componentes del Sistema

- **Plataforma de Administrador**: Interfaz web para gestión y administración
- **Aplicación de Cuadrilla**: Interfaz móvil para operaciones en campo

## 🛠️ Stack Tecnológico

### Frontend
- **Web**: HTML5, CSS3, JavaScript, Bootstrap 5.3
- **Móvil**: React Native (futuro)
- **Fuente de Datos**: Archivos JSON locales en `/mock_data/`

### Estructura de Archivos
```
Modelo_Funcional/
├── index.html                    # Página de login
├── menu1.html                    # Dashboard principal
├── gestion_materiales_minimalista.html
├── gestion_stock.html
├── gestion_cuadrillas.html
├── control_vehicular.html
├── reportes.html
├── css/
│   ├── styles.css               # Estilos del login
│   └── dashboard.css            # Estilos del dashboard
├── js/
│   ├── login.js                 # Funcionalidad del login
│   ├── dashboard_simple.js     # Funcionalidad del dashboard
│   ├── gestion_stock.js         # Gestión de stock
│   └── gestion_cuadrillas.js    # Gestión de cuadrillas
├── img/
│   ├── OperationSmart.png      # Logo principal
│   └── slider/                  # Imágenes del slider
└── mock_data/
    ├── colaboradores.json
    ├── cuadrillas.json
    ├── stock_almacen.json
    ├── stock_cuadrilla.json
    ├── trabajos.json
    └── vehiculos.json
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.x
- Navegador web moderno

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/[usuario]/oca-operationsmart.git
cd oca-operationsmart
```

2. **Iniciar el servidor local**
```bash
cd Modelo_Funcional
python3 -m http.server 8080
```

3. **Acceder a la aplicación**
```
http://localhost:8080/Modelo_Funcional/index.html
```

## 🔐 Credenciales de Acceso

| Usuario | Contraseña | Descripción |
|---------|------------|-------------|
| `division-st` | `password123` | Usuario principal |
| `admin` | `admin` | Administrador |
| `colaborador` | `colaborador` | Colaborador |

## 📱 Páginas Disponibles

- **🏠 Login**: `index.html` - Página de inicio de sesión
- **📊 Dashboard**: `menu1.html` - Panel principal
- **📦 Gestión de Materiales**: `gestion_materiales_minimalista.html`
- **📋 Gestión de Stock**: `gestion_stock.html`
- **👥 Gestión de Cuadrillas**: `gestion_cuadrillas.html`
- **🚗 Control Vehicular**: `control_vehicular.html`
- **📈 Reportes**: `reportes.html`

## 🎨 Características

- **Diseño Responsive**: Adaptativo para web y móvil
- **Identidad Visual**: Color principal #1e3a8a
- **Slider de Imágenes**: Carousel automático en el login
- **Bootstrap 5.3**: Framework CSS moderno
- **Datos Locales**: Archivos JSON para simulación

## 🔧 Comandos Útiles

### Iniciar Servidor
```bash
cd Modelo_Funcional
python3 -m http.server 8080
```

### Detener Servidor
```bash
pkill -f "python3 -m http.server"
```

### Verificar Estado del Servidor
```bash
ps aux | grep "python3 -m http.server"
```

## 📋 Directivas y Reglas Fundamentales

1. **Foco Exclusivo en Frontend**
2. **Atomicidad y Precisión**
3. **Consistencia con Bootstrap**
4. **Simplicidad Móvil**
5. **Identidad Visual**: #1e3a8a

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

**OCA Global** - [@OCAGlobal](https://github.com/OCAGlobal)

Link del Proyecto: [https://github.com/[usuario]/oca-operationsmart](https://github.com/[usuario]/oca-operationsmart)

---

*Última actualización: Septiembre 2025*
