# 💻 CÓDIGO FUENTE ESENCIAL - COMPONENTES CLAVE

**Documento:** Códigos Fuente Principales para Migración  
**Versión:** 1.0  
**Propósito:** Replicar funcionalidad en nuevo proyecto

---

## 🎯 COMPONENTES PRINCIPALES A MIGRAR

### **1. CONFIGURACIÓN DE BASE DE DATOS**

#### **📁 config/database_config.py**
```python
import pyodbc
import os
from typing import Optional, Dict, Any
import logging

class DatabaseConfig:
    """Configuración centralizada de base de datos"""
    
    def __init__(self):
        self.config = {
            'server': os.getenv('DB_SERVER', 'localhost'),
            'database': os.getenv('DB_DATABASE', 'carga_masiva'),
            'username': os.getenv('DB_USERNAME', ''),
            'password': os.getenv('DB_PASSWORD', ''),
            'driver': '{ODBC Driver 17 for SQL Server}',
            'timeout': 30,
            'autocommit': False
        }
        
    def get_connection_string(self) -> str:
        """Genera string de conexión"""
        return (
            f"DRIVER={self.config['driver']};"
            f"SERVER={self.config['server']};"
            f"DATABASE={self.config['database']};"
            f"UID={self.config['username']};"
            f"PWD={self.config['password']};"
            f"Timeout={self.config['timeout']};"
        )
    
    def get_connection(self) -> Optional[pyodbc.Connection]:
        """Obtiene conexión a la base de datos"""
        try:
            conn = pyodbc.connect(self.get_connection_string())
            return conn
        except Exception as e:
            logging.error(f"Error conectando a BD: {e}")
            return None
    
    def test_connection(self) -> bool:
        """Prueba la conexión"""
        conn = self.get_connection()
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.close()
                conn.close()
                return True
            except:
                return False
        return False

# Instancia global
db_config = DatabaseConfig()
```

### **2. MOTOR DE MAPEO INTELIGENTE (CORE)**

#### **📁 backend/motor_mapeo_inteligente.py** (Versión Simplificada)
```python
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from fuzzywuzzy import fuzz
import re
import logging

@dataclass
class MapeoResultado:
    columna_excel: str
    columna_destino: str
    confianza: float
    tipo_mapeo: str  # 'exacto', 'fuzzy', 'keywords'
    
@dataclass
class AnalisisMapeo:
    mapeos_sugeridos: List[MapeoResultado]
    cobertura_total: float
    columnas_sin_mapear: List[str]

class MotorMapeoInteligente:
    """Motor principal de mapeo inteligente"""
    
    def __init__(self):
        self.columnas_destino = [
            'nombre', 'apellido', 'cedula', 'fecha_nacimiento',
            'codigo_empleado', 'fecha_ingreso', 'departamento',
            'cargo', 'salario', 'telefono', 'email', 'direccion'
        ]
        
        self.palabras_clave = {
            'nombre': ['nombre', 'name', 'primer_nombre', 'nombres'],
            'apellido': ['apellido', 'apellidos', 'surname', 'last_name'],
            'cedula': ['cedula', 'id', 'identificacion', 'documento'],
            'fecha_nacimiento': ['nacimiento', 'birth', 'fecha_nac', 'nac'],
            'telefono': ['telefono', 'phone', 'tel', 'celular', 'movil'],
            'email': ['email', 'correo', 'mail', 'e_mail'],
            'salario': ['salario', 'sueldo', 'salary', 'wage', 'pago']
        }
        
        self.umbrales = {
            'exacto': 1.0,
            'fuzzy': 0.8,
            'keywords': 0.6
        }
    
    def normalizar_texto(self, texto: str) -> str:
        """Normaliza texto para comparación"""
        if not texto:
            return ""
        
        # Convertir a minúsculas y quitar espacios
        texto = texto.lower().strip()
        
        # Quitar caracteres especiales
        texto = re.sub(r'[^\w\s]', '', texto)
        
        # Quitar espacios múltiples
        texto = re.sub(r'\s+', '_', texto)
        
        return texto
    
    def mapeo_exacto(self, columna_excel: str) -> Optional[MapeoResultado]:
        """Busca mapeo exacto"""
        columna_norm = self.normalizar_texto(columna_excel)
        
        for destino in self.columnas_destino:
            destino_norm = self.normalizar_texto(destino)
            if columna_norm == destino_norm:
                return MapeoResultado(
                    columna_excel=columna_excel,
                    columna_destino=destino,
                    confianza=1.0,
                    tipo_mapeo='exacto'
                )
        return None
    
    def mapeo_fuzzy(self, columna_excel: str) -> Optional[MapeoResultado]:
        """Busca mapeo por similitud"""
        columna_norm = self.normalizar_texto(columna_excel)
        mejor_match = None
        mejor_score = 0
        
        for destino in self.columnas_destino:
            destino_norm = self.normalizar_texto(destino)
            score = fuzz.ratio(columna_norm, destino_norm) / 100.0
            
            if score >= self.umbrales['fuzzy'] and score > mejor_score:
                mejor_score = score
                mejor_match = MapeoResultado(
                    columna_excel=columna_excel,
                    columna_destino=destino,
                    confianza=score,
                    tipo_mapeo='fuzzy'
                )
        
        return mejor_match
    
    def mapeo_keywords(self, columna_excel: str) -> Optional[MapeoResultado]:
        """Busca mapeo por palabras clave"""
        columna_norm = self.normalizar_texto(columna_excel)
        
        for destino, keywords in self.palabras_clave.items():
            for keyword in keywords:
                keyword_norm = self.normalizar_texto(keyword)
                if keyword_norm in columna_norm:
                    return MapeoResultado(
                        columna_excel=columna_excel,
                        columna_destino=destino,
                        confianza=0.7,
                        tipo_mapeo='keywords'
                    )
        return None
    
    def analizar_columnas(self, columnas_excel: List[str]) -> AnalisisMapeo:
        """Analiza y mapea columnas de Excel"""
        mapeos = []
        columnas_mapeadas = set()
        
        for columna in columnas_excel:
            # Intentar mapeo exacto primero
            mapeo = self.mapeo_exacto(columna)
            if mapeo:
                mapeos.append(mapeo)
                columnas_mapeadas.add(columna)
                continue
            
            # Intentar mapeo fuzzy
            mapeo = self.mapeo_fuzzy(columna)
            if mapeo:
                mapeos.append(mapeo)
                columnas_mapeadas.add(columna)
                continue
            
            # Intentar mapeo por keywords
            mapeo = self.mapeo_keywords(columna)
            if mapeo:
                mapeos.append(mapeo)
                columnas_mapeadas.add(columna)
        
        # Calcular cobertura
        cobertura = len(columnas_mapeadas) / len(columnas_excel) if columnas_excel else 0
        columnas_sin_mapear = [col for col in columnas_excel if col not in columnas_mapeadas]
        
        return AnalisisMapeo(
            mapeos_sugeridos=mapeos,
            cobertura_total=cobertura,
            columnas_sin_mapear=columnas_sin_mapear
        )

# Función de prueba
def test_motor_mapeo():
    motor = MotorMapeoInteligente()
    
    # Columnas de prueba
    columnas_test = [
        'Nombre Completo',
        'Apellidos',
        'Cédula de Identidad',
        'Fecha Nac.',
        'Teléfono Móvil',
        'Correo Electrónico',
        'Sueldo Mensual'
    ]
    
    resultado = motor.analizar_columnas(columnas_test)
    
    print("=== ANÁLISIS DE MAPEO ===")
    print(f"Cobertura: {resultado.cobertura_total:.1%}")
    print("\nMapeos sugeridos:")
    for mapeo in resultado.mapeos_sugeridos:
        print(f"  {mapeo.columna_excel} → {mapeo.columna_destino} "
              f"({mapeo.confianza:.1%}, {mapeo.tipo_mapeo})")
    
    if resultado.columnas_sin_mapear:
        print(f"\nColumnas sin mapear: {resultado.columnas_sin_mapear}")

if __name__ == "__main__":
    test_motor_mapeo()
```

### **3. SISTEMA DE VALIDACIÓN (CORE)**

#### **📁 backend/validador_transformador.py** (Versión Simplificada)
```python
from dataclasses import dataclass
from typing import Any, List, Dict, Optional, Callable
from datetime import datetime
import re
import logging

@dataclass
class ErrorValidacion:
    campo: str
    valor: Any
    tipo_error: str
    mensaje: str

@dataclass
class ResultadoValidacion:
    valido: bool
    valor_transformado: Any
    errores: List[ErrorValidacion]

class ValidadorTransformador:
    """Sistema de validación y transformación de datos"""
    
    def __init__(self):
        self.transformaciones = {
            'trim': lambda x: str(x).strip() if x is not None else '',
            'upper': lambda x: str(x).upper() if x is not None else '',
            'lower': lambda x: str(x).lower() if x is not None else '',
            'title': lambda x: str(x).title() if x is not None else ''
        }
        
        self.validadores = {
            'requerido': self._validar_requerido,
            'longitud': self._validar_longitud,
            'email': self._validar_email,
            'telefono_rd': self._validar_telefono_rd,
            'cedula_rd': self._validar_cedula_rd,
            'fecha': self._validar_fecha
        }
    
    def _validar_requerido(self, valor: Any, config: Dict) -> List[ErrorValidacion]:
        """Valida campo requerido"""
        errores = []
        if config.get('requerido', False):
            if valor is None or str(valor).strip() == '':
                errores.append(ErrorValidacion(
                    campo='',
                    valor=valor,
                    tipo_error='requerido',
                    mensaje='Campo requerido no puede estar vacío'
                ))
        return errores
    
    def _validar_longitud(self, valor: Any, config: Dict) -> List[ErrorValidacion]:
        """Valida longitud de texto"""
        errores = []
        if valor is not None:
            texto = str(valor)
            min_len = config.get('min_longitud', 0)
            max_len = config.get('max_longitud', 255)
            
            if len(texto) < min_len:
                errores.append(ErrorValidacion(
                    campo='',
                    valor=valor,
                    tipo_error='longitud_minima',
                    mensaje=f'Mínimo {min_len} caracteres'
                ))
            
            if len(texto) > max_len:
                errores.append(ErrorValidacion(
                    campo='',
                    valor=valor,
                    tipo_error='longitud_maxima',
                    mensaje=f'Máximo {max_len} caracteres'
                ))
        return errores
    
    def _validar_email(self, valor: Any, config: Dict) -> List[ErrorValidacion]:
        """Valida formato de email"""
        errores = []
        if valor is not None and str(valor).strip():
            email = str(valor).strip()
            patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(patron, email):
                errores.append(ErrorValidacion(
                    campo='',
                    valor=valor,
                    tipo_error='formato_email',
                    mensaje='Formato de email inválido'
                ))
        return errores
    
    def _validar_telefono_rd(self, valor: Any, config: Dict) -> List[ErrorValidacion]:
        """Valida teléfono dominicano"""
        errores = []
        if valor is not None and str(valor).strip():
            telefono = re.sub(r'[^\d]', '', str(valor))
            
            # Formato: (809|829|849) + 7 dígitos
            if not re.match(r'^(809|829|849)\d{7}$', telefono):
                errores.append(ErrorValidacion(
                    campo='',
                    valor=valor,
                    tipo_error='formato_telefono',
                    mensaje='Formato de teléfono RD inválido (809/829/849 + 7 dígitos)'
                ))
        return errores
    
    def _validar_cedula_rd(self, valor: Any, config: Dict) -> List[ErrorValidacion]:
        """Valida cédula dominicana"""
        errores = []
        if valor is not None and str(valor).strip():
            cedula = re.sub(r'[^\d]', '', str(valor))
            
            # Formato básico: 11 dígitos
            if not re.match(r'^\d{11}$', cedula):
                errores.append(ErrorValidacion(
                    campo='',
                    valor=valor,
                    tipo_error='formato_cedula',
                    mensaje='Cédula debe tener 11 dígitos'
                ))
        return errores
    
    def _validar_fecha(self, valor: Any, config: Dict) -> List[ErrorValidacion]:
        """Valida formato de fecha"""
        errores = []
        if valor is not None and str(valor).strip():
            fecha_str = str(valor).strip()
            formatos = ['%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y']
            
            fecha_valida = False
            for formato in formatos:
                try:
                    datetime.strptime(fecha_str, formato)
                    fecha_valida = True
                    break
                except ValueError:
                    continue
            
            if not fecha_valida:
                errores.append(ErrorValidacion(
                    campo='',
                    valor=valor,
                    tipo_error='formato_fecha',
                    mensaje='Formato de fecha inválido (DD/MM/YYYY)'
                ))
        return errores
    
    def validar_campo(self, campo: str, valor: Any, config: Dict) -> ResultadoValidacion:
        """Valida un campo individual"""
        errores = []
        valor_transformado = valor
        
        # Aplicar transformaciones
        transformaciones = config.get('transformaciones', [])
        for trans in transformaciones:
            if trans in self.transformaciones:
                try:
                    valor_transformado = self.transformaciones[trans](valor_transformado)
                except Exception as e:
                    errores.append(ErrorValidacion(
                        campo=campo,
                        valor=valor,
                        tipo_error='transformacion',
                        mensaje=f'Error en transformación {trans}: {str(e)}'
                    ))
        
        # Aplicar validaciones
        validaciones = config.get('validaciones', {})
        for tipo_val, config_val in validaciones.items():
            if tipo_val in self.validadores:
                errores_val = self.validadores[tipo_val](valor_transformado, config_val)
                for error in errores_val:
                    error.campo = campo
                    errores.append(error)
        
        return ResultadoValidacion(
            valido=len(errores) == 0,
            valor_transformado=valor_transformado,
            errores=errores
        )
    
    def validar_registro(self, registro: Dict, configuracion: Dict) -> Dict:
        """Valida un registro completo"""
        resultado = {
            'valido': True,
            'registro_transformado': {},
            'errores': []
        }
        
        for campo, valor in registro.items():
            config_campo = configuracion.get(campo, {})
            resultado_campo = self.validar_campo(campo, valor, config_campo)
            
            resultado['registro_transformado'][campo] = resultado_campo.valor_transformado
            resultado['errores'].extend(resultado_campo.errores)
            
            if not resultado_campo.valido:
                resultado['valido'] = False
        
        return resultado

# Configuración de ejemplo
CONFIGURACION_VALIDACION = {
    'nombre': {
        'transformaciones': ['trim', 'title'],
        'validaciones': {
            'requerido': {'requerido': True},
            'longitud': {'min_longitud': 2, 'max_longitud': 50}
        }
    },
    'email': {
        'transformaciones': ['trim', 'lower'],
        'validaciones': {
            'email': {}
        }
    },
    'telefono': {
        'transformaciones': ['trim'],
        'validaciones': {
            'telefono_rd': {}
        }
    },
    'cedula': {
        'transformaciones': ['trim'],
        'validaciones': {
            'requerido': {'requerido': True},
            'cedula_rd': {}
        }
    }
}

# Función de prueba
def test_validador():
    validador = ValidadorTransformador()
    
    # Registro de prueba
    registro = {
        'nombre': '  juan pérez  ',
        'email': 'JUAN@EJEMPLO.COM',
        'telefono': '809-555-1234',
        'cedula': '12345678901'
    }
    
    resultado = validador.validar_registro(registro, CONFIGURACION_VALIDACION)
    
    print("=== VALIDACIÓN DE REGISTRO ===")
    print(f"Válido: {resultado['valido']}")
    print(f"Registro transformado: {resultado['registro_transformado']}")
    
    if resultado['errores']:
        print("Errores encontrados:")
        for error in resultado['errores']:
            print(f"  {error.campo}: {error.mensaje}")

if __name__ == "__main__":
    test_validador()
```

### **4. API PRINCIPAL (FLASK)**

#### **📁 backend/app_backend.py** (Versión Simplificada)
```python
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging
from datetime import datetime
import uuid

# Importar componentes propios
from motor_mapeo_inteligente import MotorMapeoInteligente
from validador_transformador import ValidadorTransformador, CONFIGURACION_VALIDACION
from config.database_config import db_config

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/backend.log'),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'clave-super-secreta-cambiar-en-produccion')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB máximo

# Configurar CORS
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Configurar carpetas
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('logs', exist_ok=True)

# Inicializar componentes
motor_mapeo = MotorMapeoInteligente()
validador = ValidadorTransformador()

# Almacén temporal de archivos (en producción usar Redis/BD)
archivos_temporales = {}

@app.route('/')
def home():
    """Página principal con información del sistema"""
    return jsonify({
        'sistema': 'Carga Masiva Inteligente',
        'version': '1.0',
        'estado': 'funcionando',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'health': '/health',
            'docs': '/docs',
            'upload': '/api/excel/upload',
            'analyze': '/api/excel/analyze',
            'process': '/api/excel/process'
        }
    })

@app.route('/health')
def health():
    """Endpoint de salud del sistema"""
    # Verificar conexión a BD
    bd_ok = db_config.test_connection()
    
    return jsonify({
        'status': 'healthy' if bd_ok else 'degraded',
        'timestamp': datetime.now().isoformat(),
        'components': {
            'database': 'ok' if bd_ok else 'error',
            'motor_mapeo': 'ok',
            'validador': 'ok'
        }
    })

@app.route('/api/excel/upload', methods=['POST'])
def upload_excel():
    """Subir archivo Excel para análisis"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se encontró archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            return jsonify({'error': 'Solo se permiten archivos Excel'}), 400
        
        # Generar ID único para el archivo
        archivo_id = str(uuid.uuid4())
        filename = f"{archivo_id}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Guardar archivo
        file.save(filepath)
        
        # Leer columnas del Excel (simplificado)
        import pandas as pd
        try:
            df = pd.read_excel(filepath, nrows=0)  # Solo headers
            columnas = df.columns.tolist()
            
            # Leer preview (primeras 5 filas)
            df_preview = pd.read_excel(filepath, nrows=5)
            preview = df_preview.to_dict('records')
            
        except Exception as e:
            return jsonify({'error': f'Error leyendo Excel: {str(e)}'}), 400
        
        # Guardar información del archivo
        archivos_temporales[archivo_id] = {
            'filename': file.filename,
            'filepath': filepath,
            'columnas': columnas,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'archivo_id': archivo_id,
            'nombre': file.filename,
            'columnas_detectadas': columnas,
            'total_columnas': len(columnas),
            'preview': preview
        })
        
    except Exception as e:
        logging.error(f"Error en upload: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/api/excel/analyze', methods=['POST'])
def analyze_excel():
    """Analizar columnas y sugerir mapeos"""
    try:
        data = request.get_json()
        archivo_id = data.get('archivo_id')
        
        if not archivo_id or archivo_id not in archivos_temporales:
            return jsonify({'error': 'Archivo no encontrado'}), 404
        
        archivo_info = archivos_temporales[archivo_id]
        columnas = archivo_info['columnas']
        
        # Analizar con motor de mapeo
        resultado = motor_mapeo.analizar_columnas(columnas)
        
        # Formatear respuesta
        mapeos_sugeridos = []
        for mapeo in resultado.mapeos_sugeridos:
            mapeos_sugeridos.append({
                'columna_excel': mapeo.columna_excel,
                'columna_destino': mapeo.columna_destino,
                'confianza': mapeo.confianza,
                'tipo_mapeo': mapeo.tipo_mapeo
            })
        
        return jsonify({
            'archivo_id': archivo_id,
            'mapeos_sugeridos': mapeos_sugeridos,
            'cobertura_total': resultado.cobertura_total,
            'columnas_sin_mapear': resultado.columnas_sin_mapear,
            'total_columnas': len(columnas)
        })
        
    except Exception as e:
        logging.error(f"Error en analyze: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/api/excel/process', methods=['POST'])
def process_excel():
    """Procesar archivo con mapeos aplicados"""
    try:
        data = request.get_json()
        archivo_id = data.get('archivo_id')
        mapeos = data.get('mapeos', {})
        
        if not archivo_id or archivo_id not in archivos_temporales:
            return jsonify({'error': 'Archivo no encontrado'}), 404
        
        archivo_info = archivos_temporales[archivo_id]
        filepath = archivo_info['filepath']
        
        # Leer Excel completo
        import pandas as pd
        df = pd.read_excel(filepath)
        
        # Aplicar mapeos
        df_mapeado = pd.DataFrame()
        for col_excel, col_destino in mapeos.items():
            if col_excel in df.columns:
                df_mapeado[col_destino] = df[col_excel]
        
        # Validar datos
        registros_validos = []
        registros_errores = []
        
        for index, row in df_mapeado.iterrows():
            registro = row.to_dict()
            resultado_val = validador.validar_registro(registro, CONFIGURACION_VALIDACION)
            
            if resultado_val['valido']:
                registros_validos.append(resultado_val['registro_transformado'])
            else:
                registros_errores.append({
                    'fila': index + 2,  # +2 porque Excel empieza en 1 y tiene header
                    'registro': registro,
                    'errores': [{'campo': e.campo, 'mensaje': e.mensaje} 
                              for e in resultado_val['errores']]
                })
        
        # En un sistema real, aquí insertarías en la BD
        # conn = db_config.get_connection()
        # ... insertar registros_validos en consolidado3
        
        return jsonify({
            'proceso_id': str(uuid.uuid4()),
            'estado': 'completado',
            'total_registros': len(df),
            'registros_exitosos': len(registros_validos),
            'registros_errores': len(registros_errores),
            'errores_detalle': registros_errores[:10]  # Primeros 10 errores
        })
        
    except Exception as e:
        logging.error(f"Error en process: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint no encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Error interno del servidor'}), 500

@app.errorhandler(413)
def too_large(error):
    return jsonify({'error': 'Archivo demasiado grande (máximo 16MB)'}), 413

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 Iniciando servidor backend en puerto {port}")
    print(f"📊 Modo debug: {debug}")
    print(f"🗄️ Conexión BD: {'✅' if db_config.test_connection() else '❌'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
```

### **5. SCRIPTS SQL ESENCIALES**

#### **📁 scripts/crear_tablas_principales.sql**
```sql
-- =====================================================
-- SCRIPT: Crear Tablas Principales
-- PROPÓSITO: Crear estructura de BD para nuevo proyecto
-- =====================================================

-- Tabla principal de datos consolidados
CREATE TABLE consolidado3 (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Información Personal
    nombre NVARCHAR(100),
    apellido NVARCHAR(100),
    cedula NVARCHAR(20),
    fecha_nacimiento DATE,
    
    -- Información Laboral
    codigo_empleado NVARCHAR(50),
    fecha_ingreso DATE,
    departamento NVARCHAR(100),
    cargo NVARCHAR(100),
    salario DECIMAL(10,2),
    
    -- Información de Contacto
    telefono NVARCHAR(20),
    email NVARCHAR(100),
    direccion NVARCHAR(255),
    
    -- Metadatos de Carga
    fecha_carga DATETIME DEFAULT GETDATE(),
    usuario_carga NVARCHAR(50),
    archivo_origen NVARCHAR(255),
    
    -- Auditoría
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Configuración de mapeos de columnas
CREATE TABLE mapeo_columnas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    columna_excel NVARCHAR(100) NOT NULL,
    columna_destino NVARCHAR(100) NOT NULL,
    tipo_mapeo NVARCHAR(20) NOT NULL, -- 'exacto', 'fuzzy', 'keywords', 'manual'
    confianza DECIMAL(3,2) DEFAULT 0.00, -- 0.00 - 1.00
    activo BIT DEFAULT 1,
    usuario_creacion NVARCHAR(50),
    fecha_creacion DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT UK_mapeo_columnas UNIQUE (columna_excel, columna_destino)
);

-- Historial de cargas masivas
CREATE TABLE historial_cargas_masivas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    archivo_nombre NVARCHAR(255) NOT NULL,
    archivo_ruta NVARCHAR(500),
    total_registros INT DEFAULT 0,
    registros_exitosos INT DEFAULT 0,
    registros_errores INT DEFAULT 0,
    tiempo_procesamiento INT DEFAULT 0, -- en segundos
    usuario NVARCHAR(50),
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    estado NVARCHAR(20) DEFAULT 'iniciado', -- 'iniciado', 'procesando', 'completado', 'error', 'cancelado'
    observaciones NVARCHAR(MAX)
);

-- Errores de carga masiva
CREATE TABLE errores_carga_masiva (
    id INT IDENTITY(1,1) PRIMARY KEY,
    historial_id INT,
    fila_excel INT,
    columna_excel NVARCHAR(100),
    valor_original NVARCHAR(MAX),
    tipo_error NVARCHAR(50),
    mensaje_error NVARCHAR(500),
    fecha_error DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (historial_id) REFERENCES historial_cargas_masivas(id)
);

-- Índices para optimización
CREATE INDEX IX_consolidado3_cedula ON consolidado3(cedula);
CREATE INDEX IX_consolidado3_codigo_empleado ON consolidado3(codigo_empleado);
CREATE INDEX IX_consolidado3_fecha_carga ON consolidado3(fecha_carga);
CREATE INDEX IX_historial_fecha_inicio ON historial_cargas_masivas(fecha_inicio);
CREATE INDEX IX_errores_historial_id ON errores_carga_masiva(historial_id);

-- Insertar mapeos básicos predeterminados
INSERT INTO mapeo_columnas (columna_excel, columna_destino, tipo_mapeo, confianza) VALUES
('nombre', 'nombre', 'exacto', 1.00),
('apellido', 'apellido', 'exacto', 1.00),
('cedula', 'cedula', 'exacto', 1.00),
('fecha_nacimiento', 'fecha_nacimiento', 'exacto', 1.00),
('codigo_empleado', 'codigo_empleado', 'exacto', 1.00),
('telefono', 'telefono', 'exacto', 1.00),
('email', 'email', 'exacto', 1.00);

PRINT 'Tablas principales creadas exitosamente';
```

---

## 🚀 INSTRUCCIONES DE USO

### **1. Copiar Archivos**
```bash
# Crear estructura en nuevo proyecto
mkdir -p backend config scripts docs

# Copiar archivos esenciales
cp motor_mapeo_inteligente.py backend/
cp validador_transformador.py backend/
cp app_backend.py backend/
cp database_config.py config/
cp crear_tablas_principales.sql scripts/
```

### **2. Instalar Dependencias**
```bash
pip install flask flask-cors pandas openpyxl fuzzywuzzy python-levenshtein pyodbc
```

### **3. Configurar Base de Datos**
```bash
# Ejecutar script SQL
sqlcmd -S servidor -d base_datos -i scripts/crear_tablas_principales.sql
```

### **4. Configurar Variables**
```bash
# Crear archivo .env
echo "DB_SERVER=tu_servidor" > .env
echo "DB_DATABASE=tu_base_datos" >> .env
echo "DB_USERNAME=tu_usuario" >> .env
echo "DB_PASSWORD=tu_password" >> .env
```

### **5. Ejecutar Sistema**
```bash
cd backend
python app_backend.py
```

---

*💻 Código fuente esencial listo para migración - Implementación completa en nuevo proyecto*