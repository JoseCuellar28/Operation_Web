import pandas as pd
import sys

file_path = "/Users/josearbildocuellar/Github/Operation_Web-1/etl-service/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx"

# Map Excel columns to Entity properties and their limits
limits = {
    "DNI": 40,
    "CODIGO SAP": 20, # CodigoEmpleado
    "TRABAJADOR": 100, # Nombre/Inspector
    "SITUACION": 50, # Estado
    "CATEGORIA / GRUPO OCUPACIONAL": 40, # Tipo
    "AREA-PROYECTO": 100, # Area
    "SECCION-SERVICIO": 100, # Seccion
    "DIVISION": 100, # Division
    "LINEA DE NEGOCIO": 100, # LineaNegocio
    "COD CEBE / ELEMENTO PEP": 50, # CodigoCebe
    "DET CEBE / ELEMENTO PEP": 200, # DetalleCebe
    "MOTIVO DE CESE": 200, # MotivoCeseDesc
    "COMENTARIO": 500, # Comentario
    "CORREO CORPORATIVO": 100, # Email
    "CORREO PERSONAL": 100, # EmailPersonal
    "JEFE INMEDIATO": 200, # JefeInmediato
    "SEDE DE TRABAJO": 100, # Distrito
    "TIPO TRABAJADOR": 100 # Not mapped directly but good to check
}

try:
    df = pd.read_excel(file_path, header=3)
    
    print("Checking column lengths...")
    for col, limit in limits.items():
        if col in df.columns:
            # Get max length of string representation
            max_len = df[col].astype(str).map(len).max()
            print(f"Column '{col}': Max Length = {max_len} (Limit: {limit})")
            if max_len > limit:
                print(f"  ⚠️ WARNING: Limit exceeded for '{col}'!")
                # Show sample exceeded values
                long_values = df[df[col].astype(str).map(len) > limit][col].unique()
                print(f"  Sample values: {long_values[:3]}")
        else:
            print(f"Column '{col}' not found in Excel.")

except Exception as e:
    print(f"Error: {e}")
