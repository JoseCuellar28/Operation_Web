from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime

def _detect_periodos(hoja):
    if hoja:
        return [hoja]
    return []

def normalize_columns(df):
    """
    Normaliza los nombres de las columnas y mapea a la estructura de Personal_Staging.
    """
    # Mapa de columnas esperadas vs posibles nombres en el Excel
    column_map = {
        'DNI': ['dni', 'numero de documento', 'num doc', 'documento', 'nro documento'],
        'Inspector': ['inspector', 'nombre completo', 'nombres y apellidos', 'nombre', 'trabajador'],
        'Situacion': ['situacion', 'estado', 'condicion'],
        'FechaIngreso': ['fecha ingreso', 'fecha de ingreso', 'f. ingreso', 'fecha inicio'],
        'FechaCese': ['fecha cese', 'fecha de cese', 'f. cese', 'fecha fin'],
        'MotivoDeCese': ['motivo cese', 'motivo de cese', 'id motivo'],
        'MotivoNorm': ['motivo', 'descripcion motivo', 'motivo descripcion'],
        'SedeTrabajo': ['sede', 'sede trabajo', 'sede de trabajo', 'distrito', 'ubicacion'],
        'TipoTrabajador': ['tipo', 'tipo trabajador', 'cargo', 'puesto'],
        # Nuevos campos
        'CodigoEmpleado': ['codigo sap', 'cod sap', 'codigo empleado', 'id empleado', 'código sap', 'código empleado'],
        'Categoria': ['categoria', 'grupo ocupacional', 'categoria / grupo ocupacional', 'categoría'],
        'Division': ['division', 'división'],
        'LineaNegocio': ['linea de negocio', 'linea negocio', 'línea de negocio'],
        'Area': ['area', 'area-proyecto', 'area / proyecto', 'área', 'área-proyecto', 'área / proyecto'],
        'Seccion': ['seccion', 'seccion-servicio', 'seccion / servicio', 'sección', 'sección-servicio'],
        'DetalleCebe': ['detalle cebe', 'det cebe / elemento pep', 'elemento pep'],
        'CodigoCebe': ['codigo cebe', 'cod cebe', 'cod cebe / elemento pep', 'código cebe'],
        'MotivoCeseDesc': ['motivo de cese', 'descripcion cese', 'descripción cese'],
        'Comentario': ['comentario', 'observaciones', 'comentarios', 'observacion', 'notas'],
        'FechaNacimiento': ['fecha de nacimiento', 'fecha nacimiento', 'f. nacimiento'],
        'Sexo': ['sexo', 'genero', 'género'],
        'Edad': ['edad'],
        'Permanencia': ['permanencia', 'antiguedad', 'antigüedad'],
        'Email': ['correo corporativo', 'email', 'correo'],
        'EmailPersonal': ['correo personal', 'email personal'],
        'JefeInmediato': ['jefe inmediato', 'jefe', 'supervisor', 'jefe directo', 'lider', 'responsable'],
        'Telefono': ['telefono', 'celular', 'movil', 'teléfono', 'móvil']
    }

    # Normalizar nombres de columnas del DF
    df.columns = [str(c).strip().lower() for c in df.columns]
    
    # Renombrar columnas según el mapa
    new_columns = {}
    for target, sources in column_map.items():
        for col in df.columns:
            if col in sources:
                new_columns[col] = target
                break
    
    if new_columns:
        df = df.rename(columns=new_columns)
        
    return df

def clean_data(df):
    """
    Limpia y formatea los datos para la base de datos.
    """
    # Manejo de nulos inicial
    df = df.replace({np.nan: None})

    # Asegurar que DNI sea string y rellenar con ceros si es necesario (asumiendo DNI peruano de 8 dígitos)
    if 'DNI' in df.columns:
        # Convertir a string, pero manejar NaNs/Nones
        df['DNI'] = df['DNI'].apply(lambda x: str(x).strip() if x is not None and str(x).lower() != 'nan' else None)
        # Remover .0 si existe
        df['DNI'] = df['DNI'].str.replace(r'\.0$', '', regex=True)
    
    # Manejo de fechas
    date_cols = ['FechaIngreso', 'FechaCese']
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            
    # Manejo de nulos final (por si pandas reintrodujo NaNs en fechas)
    df = df.replace({np.nan: None})
    
    # Filtrar filas sin DNI válido (opcional, pero recomendado para PK)
    if 'DNI' in df.columns:
        df = df[df['DNI'].notna() & (df['DNI'] != '')]

    # Corregir Edad: Si es fecha o string raro, intentar calcular o limpiar
    if 'Edad' in df.columns:
        # Si Edad es fecha (datetime), ponerlo en None porque esperamos INT
        if pd.api.types.is_datetime64_any_dtype(df['Edad']):
            df['Edad'] = None
        else:
            # Intentar convertir a numérico, coercing errors to NaN
            df['Edad'] = pd.to_numeric(df['Edad'], errors='coerce')
            # Reemplazar NaN con None
            df['Edad'] = df['Edad'].where(pd.notnull(df['Edad']), None)

    # Si tenemos FechaNacimiento y Edad es nulo, calcular Edad
    if 'FechaNacimiento' in df.columns and 'Edad' in df.columns:
        try:
            now = pd.Timestamp.now()
            # Convertir a datetime si no lo es
            fn = pd.to_datetime(df['FechaNacimiento'], errors='coerce')
            # Calcular edad solo donde sea válido
            mask = fn.notna()
            if mask.any():
                # (Now - Birthdate) / 365.25 days
                age_series = (now - fn[mask]).dt.days / 365.25
                # Llenar Edad donde estaba vacío
                df.loc[mask & df['Edad'].isna(), 'Edad'] = age_series.astype(int)
        except Exception:
            pass # Si falla el cálculo, dejar como estaba

    return df

def procesar_archivo(archivo, hoja='', header_row=-1, usecols=''):
    src = Path(archivo)
    df = None
    
    # Cargar datos
    try:
        header = None if header_row < 0 else header_row
        if usecols:
            df = pd.read_excel(src, sheet_name=hoja or 0, header=header, usecols=usecols)
        else:
            df = pd.read_excel(src, sheet_name=hoja or 0, header=header)
        
        print(f"DEBUG: Columnas encontradas en Excel: {list(df.columns)}")
        print(f"DEBUG: Primeras filas:\n{df.head().to_string()}")
    except Exception as e:
        raise Exception(f"Error al leer el archivo Excel: {str(e)}")

    # Normalizar y limpiar
    df_norm = normalize_columns(df.copy())
    df_norm = clean_data(df_norm)

    resumen = {
        'filas': int(getattr(df, 'shape', [0, 0])[0] or 0),
        'columnas': int(getattr(df, 'shape', [0, 0])[1] or 0),
        'periodos_detectados': _detect_periodos(hoja),
        'columnas_detectadas': list(df_norm.columns)
    }
    
    return {'todo': df, 'normalizado': df_norm, 'resumen': resumen}