from pathlib import Path
import pandas as pd

def _detect_periodos(hoja):
    if hoja:
        return [hoja]
    return []

def procesar_archivo(archivo, hoja='', header_row=-1, usecols=''):
    src = Path(archivo)
    df = None
    if usecols:
        try:
            df = pd.read_excel(src, sheet_name=hoja or 0, header=None if header_row < 0 else header_row, usecols=usecols)
        except Exception:
            df = pd.read_excel(src, sheet_name=hoja or 0, header=None if header_row < 0 else header_row)
    else:
        df = pd.read_excel(src, sheet_name=hoja or 0, header=None if header_row < 0 else header_row)
    resumen = {
        'filas': int(getattr(df, 'shape', [0, 0])[0] or 0),
        'columnas': int(getattr(df, 'shape', [0, 0])[1] or 0),
        'periodos_detectados': _detect_periodos(hoja)
    }
    return {'todo': df, 'normalizado': df, 'resumen': resumen}