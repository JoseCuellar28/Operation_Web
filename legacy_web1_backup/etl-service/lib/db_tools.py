import os
from pathlib import Path
try:
    import pytds
except Exception:
    pytds = None

def _conn():
    server = os.getenv('DB_SERVER', '')
    user = os.getenv('DB_USER', '')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', '')
    port = int(os.getenv('DB_PORT', '1433'))
    if pytds is None:
        raise RuntimeError('python-tds missing')
    return pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True)

def test():
    out = {
        'server': os.getenv('DB_SERVER', ''),
        'database': os.getenv('DB_NAME', ''),
        'port': int(os.getenv('DB_PORT', '1433')),
        'has_user': bool(os.getenv('DB_USER', '')),
        'has_password': bool(os.getenv('DB_PASSWORD', ''))
    }
    try:
        with _conn() as conn:
            cur = conn.cursor()
            cur.execute('SELECT 1')
            out['connected'] = True
            return out
    except Exception as e:
        print(f"ERROR in db_tools.test: {e}")
        out['connected'] = False
        out['error'] = "Error interno de conexión"
        return out

def tables():
    try:
        with _conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_SCHEMA, TABLE_NAME")
            rows = cur.fetchall()
            return {'success': True, 'tables': [{'schema': r[0], 'name': r[1]} for r in rows]}
    except Exception as e:
        print(f"ERROR in db_tools.tables: {e}")
        return {'success': False, 'error': "Error interno al listar tablas"}

def _exec_sql(cur, sql):
    parts = [p for p in sql.split('\n')]
    cur.execute('\n'.join(parts))
    if cur.description:
        rows = cur.fetchall()
        print(f"DEBUG: SQL returned {len(rows)} rows")
        return rows
    print("DEBUG: SQL returned no description")
    return None

def deploy_sql(sql_dir):
    p = Path(sql_dir)
    executed = []
    errors = []
    results = []
    try:
        with _conn() as conn:
            cur = conn.cursor()
            for f in sorted(p.glob('*.sql')):
                try:
                    s = f.read_text(encoding='utf-8')
                    for chunk in s.split('\nGO\n'):
                        ch = chunk.strip()
                        if ch:
                            print(f"DEBUG: Executing chunk from {f.name}...")
                            res = _exec_sql(cur, ch)
                            if res:
                                results.append({'file': f.name, 'data': res})
                    executed.append(str(f.name))
                except Exception as e:
                    print(f"DEBUG: Error in {f.name}: {e}")
                    errors.append({'file': f.name, 'error': str(e)})
        return {'success': True, 'executed': executed, 'errors': errors, 'results': results}
    except Exception as e:
        print(f"ERROR in db_tools.deploy_sql: {e}")
        return {'success': False, 'error': "Error interno al desplegar SQL"}

def load_staging(res, archivo, hoja):
    df = res.get('normalizado')
    if df is None or getattr(df, 'empty', True):
        return {'inserted': 0}
    
    # Columnas permitidas en Personal_Staging
    allowed_cols = [
        'DNI', 'Inspector', 'Situacion', 'FechaIngreso', 'FechaCese', 
        'MotivoDeCese', 'MotivoNorm', 'SedeTrabajo', 'TipoTrabajador',
        'CodigoEmpleado', 'Categoria', 'Division', 'LineaNegocio', 'Area', 'Seccion',
        'DetalleCebe', 'CodigoCebe', 'MotivoCeseDesc', 'Comentario', 'FechaNacimiento',
        'Sexo', 'Edad', 'Permanencia', 'Email', 'EmailPersonal', 'JefeInmediato', 'Telefono'
    ]
    
    # Filtrar solo columnas que existen en el DF y son permitidas
    cols_to_insert = [c for c in df.columns if c in allowed_cols]
    
    if not cols_to_insert:
        return {'inserted': 0, 'warning': 'No se encontraron columnas coincidentes'}
        
    # Preparar datos adicionales
    periodo = res['resumen']['periodos_detectados'][0] if res['resumen']['periodos_detectados'] else None
    fecha_carga = 'GETDATE()' # SQL Server function
    usuario_carga = 'ETL_SERVICE'
    archivo_name = Path(archivo).name
    
    inserted = 0
    
    try:
        with _conn() as conn:
            cur = conn.cursor()
            
            # 1. Limpiar Staging (Opcional: solo para este archivo/periodo, pero por ahora truncate es más limpio)
            cur.execute("TRUNCATE TABLE Personal_Staging")
            
            # 2. Construir Query de Insert
            # INSERT INTO Personal_Staging (DNI, Inspector, ..., Archivo, Hoja, Periodo, FechaCarga, UsuarioCarga) VALUES (...)
            
            cols_sql = cols_to_insert + ['Archivo', 'Hoja', 'Periodo', 'UsuarioCarga', 'FechaCarga']
            placeholders = ['%s'] * (len(cols_to_insert) + 4) + ['GETDATE()']
            
            sql = f"INSERT INTO Personal_Staging ({', '.join(cols_sql)}) VALUES ({', '.join(placeholders)})"
            
            # 3. Preparar datos para executemany
            data_to_insert = []
            for _, row in df.iterrows():
                vals = [row[c] for c in cols_to_insert]
                vals.append(archivo_name)
                vals.append(hoja)
                vals.append(periodo)
                vals.append(usuario_carga)
                # FechaCarga va directo en SQL como GETDATE()
                data_to_insert.append(tuple(vals))
                
            # 4. Ejecutar
            # Usar fast_executemany si está disponible (requiere driver ODBC correcto, pytds lo maneja diferente)
            # pytds.cursor.executemany es eficiente
            cur.executemany(sql, data_to_insert)
            inserted = len(data_to_insert)
            
    except Exception as e:
        print(f"ERROR in db_tools.load_staging: {e}")
        raise Exception("Error interno al cargar staging")
        
    return {'inserted': inserted, 'cols_inserted': cols_to_insert}

def merge_snapshot(res):
    base = Path(__file__).resolve().parent.parent # etl-service root
    sql_dir = base / 'sql'
    
    # Ejecutar scripts SQL de merge
    result = deploy_sql(str(sql_dir))
    
    if not result['success']:
        raise Exception(f"Error fusionando snapshot: {result.get('error')}")
        
    # Extraer conteos de los resultados
    inserted = 0
    updated = 0
    if 'results' in result:
        for r in result['results']:
            if r['file'] == '01_merge_personal.sql' and r['data']:
                # Asumimos que la primera fila tiene (Inserted, Updated)
                row = r['data'][0]
                if len(row) >= 2:
                    inserted = row[0]
                    updated = row[1]

    return {'status': 'Fusionado', 'details': result, 'inserted': inserted, 'updated': updated}

def audit(archivo, hoja, periodo, res, snap, stg):
    try:
        filas = stg.get('inserted', 0) if stg else 0
        inserted_snap = snap.get('inserted', 0) if snap else 0
        updated_snap = snap.get('updated', 0) if snap else 0
        usuario = 'System' # Could be passed in future
        
        with _conn() as conn:
            cur = conn.cursor()
            sql = """
                INSERT INTO Historial_Cargas_Personal 
                (Archivo, Hoja, Periodo, FilasProcesadas, InsertadosSnapshot, ActualizadosSnapshot, Duplicados, EventosGenerados, FechaCarga, Usuario)
                VALUES (%s, %s, %s, %s, %s, %s, 0, 0, GETDATE(), %s)
            """
            cur.execute(sql, (str(archivo), str(hoja), str(periodo), filas, inserted_snap, updated_snap, usuario))
            
    except Exception as e:
        print(f"Error auditing: {e}")
        
    return {'archivo': archivo, 'hoja': hoja, 'periodo': periodo, 'snapshot': snap, 'staging': stg, 'resumen': res.get('resumen', {})}