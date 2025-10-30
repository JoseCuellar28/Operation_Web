# ⚙️ CONFIGURACIÓN COMPLETA PARA MIGRACIÓN

**Documento:** Configuración Detallada del Sistema  
**Versión:** 1.0  
**Propósito:** Replicar configuración exacta en nuevo proyecto

---

## 🎯 CONFIGURACIONES PRINCIPALES

### **1. ESTRUCTURA DE DIRECTORIOS**

```
nuevo-proyecto/
├── backend/
│   ├── __init__.py
│   ├── app_backend.py              # API principal Flask
│   ├── motor_mapeo_inteligente.py  # Motor de mapeo
│   ├── validador_transformador.py  # Sistema validación
│   ├── procesador_lotes.py         # Procesamiento por lotes
│   └── logs/                       # Logs del sistema
├── config/
│   ├── __init__.py
│   ├── database_config.py          # Configuración BD
│   └── app_config.py              # Configuración general
├── scripts/
│   ├── crear_tablas_principales.sql
│   ├── datos_prueba.sql
│   └── test_backend_completo.py
├── uploads/                        # Archivos temporales
├── docs/                          # Documentación
├── requirements.txt               # Dependencias Python
├── .env                          # Variables de entorno
└── README.md                     # Documentación principal
```

### **2. ARCHIVO REQUIREMENTS.TXT**

```txt
# ===================================
# DEPENDENCIAS PRINCIPALES
# ===================================

# Framework Web
Flask==2.3.3
Flask-CORS==4.0.0

# Procesamiento de Datos
pandas==2.1.1
openpyxl==3.1.2
xlrd==2.0.1

# Mapeo Inteligente
fuzzywuzzy==0.18.0
python-Levenshtein==0.21.1

# Base de Datos
pyodbc==4.0.39

# Utilidades
python-dotenv==1.0.0
uuid==1.30

# Logging y Monitoreo
colorama==0.4.6

# Testing (Opcional)
pytest==7.4.2
pytest-flask==1.2.0

# Desarrollo (Opcional)
black==23.7.0
flake8==6.0.0
```

### **3. ARCHIVO .ENV (TEMPLATE)**

```env
# ===================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===================================
DB_SERVER=localhost
DB_DATABASE=carga_masiva
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TIMEOUT=30

# ===================================
# CONFIGURACIÓN DE FLASK
# ===================================
FLASK_APP=backend/app_backend.py
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000
FLASK_SECRET_KEY=clave-super-secreta-cambiar-en-produccion

# ===================================
# CONFIGURACIÓN DE ARCHIVOS
# ===================================
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=16777216
ALLOWED_EXTENSIONS=xlsx,xls

# ===================================
# CONFIGURACIÓN DE LOGS
# ===================================
LOG_LEVEL=INFO
LOG_FILE=logs/backend.log
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

# ===================================
# CONFIGURACIÓN DE PROCESAMIENTO
# ===================================
BATCH_SIZE=1000
MAX_ERRORS_PER_BATCH=100
TIMEOUT_SECONDS=300

# ===================================
# CONFIGURACIÓN DE MAPEO
# ===================================
FUZZY_THRESHOLD=0.8
KEYWORD_THRESHOLD=0.6
AUTO_MAPPING_ENABLED=True
```

### **4. CONFIGURACIÓN AVANZADA (config/app_config.py)**

```python
import os
from dataclasses import dataclass
from typing import Dict, List, Any
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

@dataclass
class DatabaseConfig:
    """Configuración de base de datos"""
    server: str = os.getenv('DB_SERVER', 'localhost')
    database: str = os.getenv('DB_DATABASE', 'carga_masiva')
    username: str = os.getenv('DB_USERNAME', '')
    password: str = os.getenv('DB_PASSWORD', '')
    driver: str = os.getenv('DB_DRIVER', '{ODBC Driver 17 for SQL Server}')
    timeout: int = int(os.getenv('DB_TIMEOUT', '30'))

@dataclass
class FlaskConfig:
    """Configuración de Flask"""
    app_name: str = os.getenv('FLASK_APP', 'backend/app_backend.py')
    environment: str = os.getenv('FLASK_ENV', 'development')
    debug: bool = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    port: int = int(os.getenv('FLASK_PORT', '5000'))
    secret_key: str = os.getenv('FLASK_SECRET_KEY', 'cambiar-en-produccion')
    max_content_length: int = int(os.getenv('MAX_FILE_SIZE', '16777216'))

@dataclass
class ProcessingConfig:
    """Configuración de procesamiento"""
    batch_size: int = int(os.getenv('BATCH_SIZE', '1000'))
    max_errors_per_batch: int = int(os.getenv('MAX_ERRORS_PER_BATCH', '100'))
    timeout_seconds: int = int(os.getenv('TIMEOUT_SECONDS', '300'))
    upload_folder: str = os.getenv('UPLOAD_FOLDER', 'uploads')
    allowed_extensions: List[str] = os.getenv('ALLOWED_EXTENSIONS', 'xlsx,xls').split(',')

@dataclass
class MappingConfig:
    """Configuración de mapeo inteligente"""
    fuzzy_threshold: float = float(os.getenv('FUZZY_THRESHOLD', '0.8'))
    keyword_threshold: float = float(os.getenv('KEYWORD_THRESHOLD', '0.6'))
    auto_mapping_enabled: bool = os.getenv('AUTO_MAPPING_ENABLED', 'True').lower() == 'true'

@dataclass
class LoggingConfig:
    """Configuración de logging"""
    level: str = os.getenv('LOG_LEVEL', 'INFO')
    file: str = os.getenv('LOG_FILE', 'logs/backend.log')
    format: str = os.getenv('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

class AppConfig:
    """Configuración principal de la aplicación"""
    
    def __init__(self):
        self.database = DatabaseConfig()
        self.flask = FlaskConfig()
        self.processing = ProcessingConfig()
        self.mapping = MappingConfig()
        self.logging = LoggingConfig()
    
    def validate(self) -> Dict[str, Any]:
        """Valida la configuración"""
        errors = []
        warnings = []
        
        # Validar base de datos
        if not self.database.server:
            errors.append("DB_SERVER no configurado")
        if not self.database.database:
            errors.append("DB_DATABASE no configurado")
        
        # Validar Flask
        if self.flask.secret_key == 'cambiar-en-produccion' and self.flask.environment == 'production':
            errors.append("FLASK_SECRET_KEY debe cambiarse en producción")
        
        # Validar procesamiento
        if self.processing.batch_size <= 0:
            errors.append("BATCH_SIZE debe ser mayor a 0")
        
        # Validar mapeo
        if not (0 <= self.mapping.fuzzy_threshold <= 1):
            errors.append("FUZZY_THRESHOLD debe estar entre 0 y 1")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte configuración a diccionario"""
        return {
            'database': {
                'server': self.database.server,
                'database': self.database.database,
                'driver': self.database.driver,
                'timeout': self.database.timeout
            },
            'flask': {
                'environment': self.flask.environment,
                'debug': self.flask.debug,
                'port': self.flask.port
            },
            'processing': {
                'batch_size': self.processing.batch_size,
                'max_errors_per_batch': self.processing.max_errors_per_batch,
                'timeout_seconds': self.processing.timeout_seconds
            },
            'mapping': {
                'fuzzy_threshold': self.mapping.fuzzy_threshold,
                'keyword_threshold': self.mapping.keyword_threshold,
                'auto_mapping_enabled': self.mapping.auto_mapping_enabled
            }
        }

# Instancia global de configuración
app_config = AppConfig()

# Función para obtener configuración
def get_config() -> AppConfig:
    """Obtiene la configuración de la aplicación"""
    return app_config

# Función para validar configuración al inicio
def validate_config() -> bool:
    """Valida la configuración al inicio de la aplicación"""
    validation = app_config.validate()
    
    if not validation['valid']:
        print("❌ ERRORES DE CONFIGURACIÓN:")
        for error in validation['errors']:
            print(f"  - {error}")
        return False
    
    if validation['warnings']:
        print("⚠️ ADVERTENCIAS DE CONFIGURACIÓN:")
        for warning in validation['warnings']:
            print(f"  - {warning}")
    
    print("✅ Configuración validada correctamente")
    return True

if __name__ == "__main__":
    # Prueba de configuración
    config = get_config()
    validation = validate_config()
    
    if validation:
        print("\n📋 CONFIGURACIÓN ACTUAL:")
        import json
        print(json.dumps(config.to_dict(), indent=2, ensure_ascii=False))
```

### **5. CONFIGURACIÓN DE VALIDACIÓN AVANZADA**

```python
# ===================================
# CONFIGURACIÓN DE VALIDACIÓN COMPLETA
# ===================================

CONFIGURACION_VALIDACION_COMPLETA = {
    # Información Personal
    'nombre': {
        'transformaciones': ['trim', 'title'],
        'validaciones': {
            'requerido': {'requerido': True},
            'longitud': {'min_longitud': 2, 'max_longitud': 50}
        }
    },
    'apellido': {
        'transformaciones': ['trim', 'title'],
        'validaciones': {
            'requerido': {'requerido': True},
            'longitud': {'min_longitud': 2, 'max_longitud': 50}
        }
    },
    'cedula': {
        'transformaciones': ['trim'],
        'validaciones': {
            'requerido': {'requerido': True},
            'cedula_rd': {}
        }
    },
    'fecha_nacimiento': {
        'transformaciones': ['trim'],
        'validaciones': {
            'fecha': {}
        }
    },
    
    # Información Laboral
    'codigo_empleado': {
        'transformaciones': ['trim', 'upper'],
        'validaciones': {
            'longitud': {'min_longitud': 3, 'max_longitud': 20}
        }
    },
    'fecha_ingreso': {
        'transformaciones': ['trim'],
        'validaciones': {
            'fecha': {}
        }
    },
    'departamento': {
        'transformaciones': ['trim', 'title'],
        'validaciones': {
            'longitud': {'max_longitud': 100}
        }
    },
    'cargo': {
        'transformaciones': ['trim', 'title'],
        'validaciones': {
            'longitud': {'max_longitud': 100}
        }
    },
    'salario': {
        'transformaciones': ['trim'],
        'validaciones': {
            'numerico': {'min_valor': 0, 'max_valor': 999999.99}
        }
    },
    
    # Información de Contacto
    'telefono': {
        'transformaciones': ['trim'],
        'validaciones': {
            'telefono_rd': {}
        }
    },
    'email': {
        'transformaciones': ['trim', 'lower'],
        'validaciones': {
            'email': {}
        }
    },
    'direccion': {
        'transformaciones': ['trim', 'title'],
        'validaciones': {
            'longitud': {'max_longitud': 255}
        }
    }
}

# Configuración de mapeo de palabras clave extendida
PALABRAS_CLAVE_EXTENDIDAS = {
    'nombre': [
        'nombre', 'name', 'primer_nombre', 'nombres', 'first_name',
        'nom', 'nombre_completo', 'full_name'
    ],
    'apellido': [
        'apellido', 'apellidos', 'surname', 'last_name', 'family_name',
        'ape', 'segundo_apellido'
    ],
    'cedula': [
        'cedula', 'id', 'identificacion', 'documento', 'dni', 'ci',
        'numero_cedula', 'doc_identidad', 'identification'
    ],
    'fecha_nacimiento': [
        'nacimiento', 'birth', 'fecha_nac', 'nac', 'birth_date',
        'fecha_nacimiento', 'born', 'birthday'
    ],
    'codigo_empleado': [
        'codigo', 'code', 'empleado', 'employee', 'emp_code',
        'codigo_empleado', 'employee_id', 'staff_id'
    ],
    'fecha_ingreso': [
        'ingreso', 'hire', 'fecha_ingreso', 'hire_date', 'start_date',
        'fecha_inicio', 'admission', 'entry_date'
    ],
    'departamento': [
        'departamento', 'department', 'dept', 'area', 'division',
        'seccion', 'section', 'unit'
    ],
    'cargo': [
        'cargo', 'position', 'puesto', 'job', 'title', 'role',
        'posicion', 'job_title', 'occupation'
    ],
    'salario': [
        'salario', 'sueldo', 'salary', 'wage', 'pago', 'pay',
        'remuneracion', 'income', 'earnings'
    ],
    'telefono': [
        'telefono', 'phone', 'tel', 'celular', 'movil', 'mobile',
        'contact', 'numero', 'fono'
    ],
    'email': [
        'email', 'correo', 'mail', 'e_mail', 'electronic_mail',
        'correo_electronico', '@'
    ],
    'direccion': [
        'direccion', 'address', 'domicilio', 'residencia', 'ubicacion',
        'location', 'home', 'street'
    ]
}
```

### **6. SCRIPT DE INICIALIZACIÓN**

```python
# ===================================
# SCRIPT: init_proyecto.py
# PROPÓSITO: Inicializar proyecto completo
# ===================================

import os
import sys
import logging
from pathlib import Path

def crear_estructura_directorios():
    """Crea la estructura de directorios del proyecto"""
    directorios = [
        'backend',
        'config', 
        'scripts',
        'uploads',
        'logs',
        'docs',
        'tests'
    ]
    
    for directorio in directorios:
        Path(directorio).mkdir(exist_ok=True)
        
        # Crear __init__.py en directorios Python
        if directorio in ['backend', 'config']:
            init_file = Path(directorio) / '__init__.py'
            if not init_file.exists():
                init_file.write_text('# -*- coding: utf-8 -*-\n')
    
    print("✅ Estructura de directorios creada")

def crear_archivo_env():
    """Crea archivo .env si no existe"""
    env_file = Path('.env')
    if not env_file.exists():
        env_content = """# Configuración de Base de Datos
DB_SERVER=localhost
DB_DATABASE=carga_masiva
DB_USERNAME=
DB_PASSWORD=
DB_DRIVER=ODBC Driver 17 for SQL Server

# Configuración de Flask
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000
FLASK_SECRET_KEY=cambiar-en-produccion

# Configuración de Procesamiento
BATCH_SIZE=1000
MAX_ERRORS_PER_BATCH=100
UPLOAD_FOLDER=uploads
"""
        env_file.write_text(env_content)
        print("✅ Archivo .env creado")
    else:
        print("ℹ️ Archivo .env ya existe")

def verificar_dependencias():
    """Verifica que las dependencias estén instaladas"""
    dependencias_requeridas = [
        'flask', 'pandas', 'openpyxl', 'fuzzywuzzy', 'pyodbc'
    ]
    
    dependencias_faltantes = []
    
    for dep in dependencias_requeridas:
        try:
            __import__(dep)
        except ImportError:
            dependencias_faltantes.append(dep)
    
    if dependencias_faltantes:
        print("❌ Dependencias faltantes:")
        for dep in dependencias_faltantes:
            print(f"  - {dep}")
        print("\nEjecuta: pip install -r requirements.txt")
        return False
    else:
        print("✅ Todas las dependencias están instaladas")
        return True

def main():
    """Función principal de inicialización"""
    print("🚀 INICIALIZANDO PROYECTO CARGA MASIVA")
    print("=" * 50)
    
    # Crear estructura
    crear_estructura_directorios()
    
    # Crear .env
    crear_archivo_env()
    
    # Verificar dependencias
    dependencias_ok = verificar_dependencias()
    
    print("\n" + "=" * 50)
    if dependencias_ok:
        print("✅ PROYECTO INICIALIZADO CORRECTAMENTE")
        print("\nPróximos pasos:")
        print("1. Configurar variables en .env")
        print("2. Ejecutar scripts SQL en la base de datos")
        print("3. Copiar archivos de código fuente")
        print("4. Ejecutar: python backend/app_backend.py")
    else:
        print("❌ INICIALIZACIÓN INCOMPLETA")
        print("Instala las dependencias faltantes y vuelve a ejecutar")

if __name__ == "__main__":
    main()
```

### **7. COMANDOS DE MIGRACIÓN**

```bash
# ===================================
# COMANDOS PARA MIGRACIÓN COMPLETA
# ===================================

# 1. Crear nuevo proyecto
mkdir nuevo-proyecto-carga-masiva
cd nuevo-proyecto-carga-masiva

# 2. Inicializar estructura
python init_proyecto.py

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar base de datos
# Editar .env con datos de conexión
# Ejecutar scripts SQL

# 5. Copiar código fuente
# Copiar archivos desde documentación

# 6. Verificar instalación
python scripts/test_backend_completo.py

# 7. Iniciar servidor
python backend/app_backend.py
```

---

## 🔧 CONFIGURACIÓN POR ENTORNO

### **Desarrollo**
```env
FLASK_ENV=development
FLASK_DEBUG=True
LOG_LEVEL=DEBUG
BATCH_SIZE=100
```

### **Pruebas**
```env
FLASK_ENV=testing
FLASK_DEBUG=False
LOG_LEVEL=INFO
BATCH_SIZE=500
```

### **Producción**
```env
FLASK_ENV=production
FLASK_DEBUG=False
LOG_LEVEL=WARNING
BATCH_SIZE=2000
FLASK_SECRET_KEY=clave-super-segura-aleatoria
```

---

*⚙️ Configuración completa lista para migración - Sistema totalmente configurable*