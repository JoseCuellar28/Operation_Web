# 🌐 URLs Actualizadas - OCA OperationSmart

## 📋 **URLs del Proyecto**

### **🏠 Página Principal (Login)**
```
http://localhost:8080/Modelo_Funcional/index.html
```

### **📊 Dashboard Principal**
```
http://localhost:8080/Modelo_Funcional/menu1.html
```

### **📦 Gestión de Materiales**
```
http://localhost:8080/Modelo_Funcional/gestion_materiales_minimalista.html
```

### **📋 Tabla Base**
```
http://localhost:8080/Modelo_Funcional/tabla_modelo1_minimalista.html
```

## 🔧 **Comandos de Servidor**

### **🚀 Iniciar Servidor**
```bash
cd /home/pruebaoddo/gestion_inventario/Modelo_Funcional
python3 -m http.server 8080
```

### **🛑 Detener Servidor**
```bash
pkill -f "python3 -m http.server"
```

### **📊 Verificar Estado**
```bash
ps aux | grep "python3 -m http.server"
```

## 🎯 **Credenciales de Acceso**

### **👤 Usuario Division-ST**
- **Usuario:** `division-st`
- **Contraseña:** `password123`

### **👤 Usuario Admin**
- **Usuario:** `admin`
- **Contraseña:** `admin`

### **👤 Usuario Colaborador**
- **Usuario:** `colaborador`
- **Contraseña:** `colaborador`

## 📁 **Estructura de Archivos**

```
Modelo_Funcional/
├── index.html                    # Página de login
├── menu1.html                    # Dashboard principal
├── gestion_materiales_minimalista.html
├── tabla_modelo1_minimalista.html
├── css/
│   ├── styles.css               # Estilos del login
│   └── dashboard.css            # Estilos del dashboard
├── js/
│   ├── login.js                 # Funcionalidad del login
│   └── dashboard_simple.js      # Funcionalidad del dashboard
└── img/
    ├── OperationSmart.png       # Logo principal
    └── slider/                  # Imágenes del slider
```

## ✅ **Estado Actual**
- **Servidor:** ✅ Funcionando en puerto 8080
- **URLs:** ✅ Actualizadas para rutas relativas
- **Navegación:** ✅ Funcional entre páginas
- **Login:** ✅ Redirección automática al dashboard

---
*Última actualización: Agosto 2024*
